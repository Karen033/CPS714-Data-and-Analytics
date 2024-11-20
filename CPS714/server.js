import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5001;

// Supabase configuration
const supabaseUrl = 'https://whkhxoqclrbwsapozcsx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2h4b3FjbHJid3NhcG96Y3N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDkyMjY5MywiZXhwIjoyMDQ2NDk4NjkzfQ.R38BFg2TCYj0JjbaVx5EPRoo6SfCHSXBbF2VTz2SAhc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint to Generate Reports
app.post('/api/generate-reports', async (req, res) => {
  try {
    console.log('Starting report generation...');

    // Fetch user data
    const { data: usersData, error: usersError } = await supabase
      .from('01_users')
      .select('user_id, created_at');
    if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);

    // Fetch feedback data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('07_feedback')
      .select('user_id, submitted_at');
    if (feedbackError) throw new Error(`Error fetching feedback: ${feedbackError.message}`);

    // Fetch user activity data
    const { data: activityData, error: activityError } = await supabase
      .from('03_activity_log') // Replace with your actual activity table name
      .select('user_id, activity_type, activity_date');
    if (activityError) throw new Error(`Error fetching activity data: ${activityError.message}`);

    // Fetch rewards program participation data
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('04_rewards') // Replace with your actual rewards program table name
      .select('user_id, is_active');
    if (rewardsError) throw new Error(`Error fetching rewards data: ${rewardsError.message}`);

    // Aggregate feedback count per user
    const feedbackCounts = feedbackData.reduce((acc, feedback) => {
      acc[feedback.user_id] = (acc[feedback.user_id] || 0) + 1;
      return acc;
    }, {});

    // Aggregate activity count per user
    const activityCounts = activityData.reduce((acc, activity) => {
      acc[activity.user_id] = (acc[activity.user_id] || 0) + 1;
      return acc;
    }, {});

    // Aggregate rewards program participation per user
    const rewardsParticipation = rewardsData.reduce((acc, reward) => {
      acc[reward.user_id] = reward.is_active ? 'active' : 'inactive';
      return acc;
    }, {});

    // Fetch support tickets data
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('05_support_ticket') // Replace with your actual table name
      .select('ticket_id, created_at, updated_at, status');
    if (ticketsError) throw new Error(`Error fetching tickets: ${ticketsError.message}`);
    if (!ticketsData.length) throw new Error('No ticket data found.');

    // Calculate ticket metrics
    const totalTickets = ticketsData.length;
    const resolvedTickets = ticketsData.filter((ticket) => ticket.status === 'resolved').length;

    // Compute average resolution time
    const resolutionTimes = ticketsData
      .filter((ticket) => ticket.status === 'resolved' && ticket.updated_at)
      .map((ticket) => {
        const createdAt = new Date(ticket.created_at);
        const updatedAt = new Date(ticket.updated_at);
        return (updatedAt - createdAt) / (1000 * 60 * 60); // Difference in hours
      });

    const avgResolutionTime =
      resolutionTimes.reduce((sum, time) => sum + time, 0) / (resolutionTimes.length || 1);

    // Compute submission rate (tickets submitted per day)
    const ticketsByDate = ticketsData.reduce((acc, ticket) => {
      const date = ticket.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const totalDays = Object.keys(ticketsByDate).length || 1; // Prevent divide by zero
    const avgSubmissionRate = totalTickets / totalDays;

    // Prepare User Engagement Report
    const userEngagementReport = {
      report_type: 'User Engagement',
      generated_at: new Date().toISOString(),
      data: JSON.stringify(
        usersData.map((user) => ({
          date: user.created_at.split('T')[0],
          feedback_count: feedbackCounts[user.user_id] || 0,
          activity_count: activityCounts[user.user_id] || 0,
          rewards_status: rewardsParticipation[user.user_id] || 'inactive',
        }))
      ),
    };

    // Prepare ticket metrics report
    const ticketMetricsReport = {
      report_type: 'Ticket Resolution Metrics',
      generated_at: new Date().toISOString(),
      data: JSON.stringify({
        total_tickets: totalTickets,
        resolution_rate: ((resolvedTickets / totalTickets) * 100).toFixed(2),
        avg_response_time: avgResolutionTime.toFixed(2), // in hours
        submission_rate: avgSubmissionRate.toFixed(2), // tickets per day
      }),
    };

    // Insert reports into the database
    const { error: insertError } = await supabase
      .from('12_reports')
      .insert([userEngagementReport, ticketMetricsReport]);
    if (insertError) throw new Error(`Error inserting reports: ${insertError.message}`);

    console.log('Reports generated successfully!');
    res.status(200).json({ message: 'Reports generated and saved successfully!' });
  } catch (error) {
    console.error('Error generating reports:', error.message);
    res.status(500).json({ error: 'Failed to generate reports', details: error.message });
  }
});

// API Endpoint to Fetch Most Recent Reports
app.get('/api/reports/latest', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('12_reports')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(2);
    if (error) throw new Error(`Error fetching reports: ${error.message}`);
    if (!data.length) throw new Error('No reports found.');

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
