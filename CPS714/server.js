import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5001;

// Supabase configuration
const supabaseUrl = 'https://whkhxoqclrbwsapozcsx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2h4b3FjbHJid3NhcG96Y3N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDkyMjY5MywiZXhwIjoyMDQ2NDk4NjkzfQ.R38BFg2TCYj0JjbaVx5EPRoo6SfCHSXBbF2VTz2SAhc'; // Replace with your key or securely fetch it.
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint to Generate Reports
app.post('/api/generate-reports', async (req, res) => {
  const { reportType, userId } = req.body;

  // Validate that reportType is provided
  if (!reportType) {
    return res.status(400).json({ error: 'Report type is required' });
  }

  try {
    console.log(`Generating ${reportType} report for user: ${userId || 'all'}`);

    const userFilter = userId && userId !== 'all' ? { user_id: userId } : {};
    let reportData = null;

    // Fetch common data outside specific conditions
    const { data: usersData, error: usersError } = await supabase
      .from('01_users')
      .select('user_id, created_at')
      .match(userFilter);

    if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);
    if (!usersData?.length) throw new Error('No user data found.');

    // Fetch activity data
    const { data: activityData, error: activityError } = await supabase
      .from('03_activity_log')
      .select('user_id, activity_type, activity_date')
      .match(userFilter);

    if (activityError) throw new Error(`Error fetching activities: ${activityError.message}`);

    // Fetch rewards data
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('Redemptions')
      .select('user_id, is_active, redeemed_date, points_redeemed')
      .match(userFilter);

    if (rewardsError) {
      throw new Error(`Error fetching rewards data: ${rewardsError.message}`);
    }

    // Fetch feedback data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('07_feedback')
      .select('user_id, rating, submitted_at')
      .match(userFilter);

    if (feedbackError) throw new Error(`Error fetching feedback: ${feedbackError.message}`);

    // Generate the report based on reportType
    if (reportType === 'User Engagement') {
      reportData = usersData.map((user) => {
        // Filter activities for this user
        const userActivities = activityData.filter((activity) => activity.user_id === user.user_id);

        // Filter feedback for this user
        const userFeedbacks = feedbackData.filter((feedback) => feedback.user_id === user.user_id);

        // Find rewards data for this user
        const userRewards = rewardsData.find((r) => r.user_id === user.user_id);

        return {
          user_id: user.user_id,
          created_at: user.created_at,
          activity_count: userActivities.length, // Activity count for the user
          feedback_count: userFeedbacks.length, // Feedback count for the user
          points_redeemed: userRewards?.points_redeemed || 0, // Points redeemed for the user
          average_feedback_rating: userFeedbacks.length
            ? (userFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / userFeedbacks.length).toFixed(2)
            : 0, // Average feedback rating for the user
        };
      });
    } else if (reportType === 'User Engagement - Activity') {
      // Group activities by user_id and include activity_date for each user
      const activityMap = activityData.reduce((acc, activity) => {
        if (!acc[activity.user_id]) {
          acc[activity.user_id] = {
            activity_count: 0,
            activity_dates: [],
          };
        }
        acc[activity.user_id].activity_count += 1;
        acc[activity.user_id].activity_dates.push(activity.activity_date);
        return acc;
      }, {});
    
      reportData = usersData.map((user) => {
        const userActivity = activityMap[user.user_id] || { activity_count: 0, activity_dates: [] };
        return {
          user_id: user.user_id,
          activity_count: userActivity.activity_count,
          activity_dates: userActivity.activity_dates, // Include the list of activity dates
        };
      });
    } else if (reportType === 'User Engagement - Feedback') {
      // Group feedback by user_id and include submitted_at for each user
      const feedbackMap = feedbackData.reduce((acc, feedback) => {
        if (!acc[feedback.user_id]) {
          acc[feedback.user_id] = {
            feedback_count: 0,
            feedback_dates: [],
          };
        }
        acc[feedback.user_id].feedback_count += 1;
        acc[feedback.user_id].feedback_dates.push(feedback.submitted_at);
        return acc;
      }, {});
    
      reportData = usersData.map((user) => {
        const userFeedback = feedbackMap[user.user_id] || { feedback_count: 0, feedback_dates: [] };
        return {
          user_id: user.user_id,
          feedback_count: userFeedback.feedback_count,
          feedback_dates: userFeedback.feedback_dates, // Include the list of feedback submission dates
        };
      });
    } else if (reportType === 'User Engagement - Rewards') {
      const rewardsMap = new Map(rewardsData.map((reward) => [
        reward.user_id, 
        { 
          points_redeemed: reward.points_redeemed || 0,
          redeemed_date: reward.redeemed_date || null 
        }
      ]));
    
      // Map over the usersData to include points_redeemed and redeemed_date
      reportData = usersData.map((user) => {
        const userRewards = rewardsMap.get(user.user_id) || { points_redeemed: 0, redeemed_date: null };
        return {
          user_id: user.user_id,
          points_redeemed: userRewards.points_redeemed,
          redeemed_date: userRewards.redeemed_date,  // Add redeemed_date to the report data
        };
      });
    } 
    else if (reportType === 'User Engagement - Earnings') {
      const earningsMap = new Map(earningsData.map((earning) => [
        earning.user_id, 
        { 
          points_earned: earning.points_earned || 0,
          earned_date: earning.earned_date || null 
        }
      ]));

      
    
      // Map over the usersData to include earned_date and points_earned
      reportData = usersData.map((user) => {
        const userEarnings = earningsMap.get(user.user_id) || {  points_earned: 0, earned_date: null };
        return {
          user_id: user.user_id,
          points_earned: userEarnings.points_earned,
          earned_date: userEarnings.earned_date,  
        };
      });
    } 
    else if (reportType === 'Ticket Metrics') {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('05_support_ticket')
        .select('ticket_id, user_id, created_at, updated_at, status')
        .match(userFilter);

      if (ticketsError) throw new Error(`Error fetching tickets: ${ticketsError.message}`);
      if (!ticketsData.length) throw new Error('No ticket data found.');

      const totalTickets = ticketsData.length;
      const resolvedTickets = ticketsData.filter((ticket) => ticket.status === 'resolved').length;

      const resolutionTimes = ticketsData
        .filter((ticket) => ticket.status === 'resolved' && ticket.updated_at)
        .map((ticket) => {
          const createdAt = new Date(ticket.created_at);
          const updatedAt = new Date(ticket.updated_at);
          return (updatedAt - createdAt) / (1000 * 60 * 60); // Difference in hours
        });

      const avgResolutionTime = resolutionTimes.length
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
        : 0;

      const ticketsByDate = ticketsData.reduce((acc, ticket) => {
        const date = ticket.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const totalDays = Object.keys(ticketsByDate).length || 1;
      const avgSubmissionRate = totalTickets / totalDays;

      reportData = {
        total_tickets: totalTickets,
        resolution_rate: ((resolvedTickets / totalTickets) * 100).toFixed(2),
        avg_response_time: avgResolutionTime.toFixed(2),
        submission_rate: avgSubmissionRate.toFixed(2),
      };
    } else {
      throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Insert the report into the database
    const reportEntry = {
      report_type: reportType,
      generated_at: new Date().toISOString(),
      data: JSON.stringify(reportData),
    };

    const { error: insertError } = await supabase.from('12_reports').insert([reportEntry]);

    if (insertError) throw new Error(`Error inserting report into database: ${insertError.message}`);

    res.status(200).json({
      message: `${reportType} report generated and saved successfully!`,
      report: reportEntry,
    });
  } catch (error) {
    console.error('Error generating reports:', error.message);
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message,
    });
  }
});

// API Endpoint to Fetch Latest Report
app.get('/api/reports/latest', async (req, res) => {
  try {
    const { data: latestReport, error } = await supabase
      .from('12_reports')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Error fetching latest report: ${error.message}`);
    }

    if (!latestReport) {
      return res.status(404).json({ message: 'No reports found.' });
    }

    res.json(latestReport);
  } catch (error) {
    console.error('Error fetching latest report:', error.message);
    res.status(500).json({
      message: 'Internal server error',
      details: error.message,
    });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
