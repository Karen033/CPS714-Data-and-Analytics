import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import './Reports.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend, LineElement } from 'chart.js';

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,  // Register PointElement for charts like Line
  Title,
  Tooltip,
  Legend,
  LineElement    // Register LineElement for Line charts
);

const ReportsChart = () => {
  const [userEngagementData, setUserEngagementData] = useState(null);
  const [ticketMetricsData, setTicketMetricsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the latest reports
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/reports/latest');
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const reports = await response.json();
        console.log('Fetched Reports:', reports);

        if (reports && reports.length > 0) {
          const userEngagementReport = reports.find(
            (report) => report.report_type === 'User Engagement'
          );
          const ticketMetricsReport = reports.find(
            (report) => report.report_type === 'Ticket Resolution Metrics'
          );

          if (userEngagementReport) {
            setUserEngagementData(JSON.parse(userEngagementReport.data));
          }
          if (ticketMetricsReport) {
            setTicketMetricsData(JSON.parse(ticketMetricsReport.data));
          }
        } else {
          setError('No reports available');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Error fetching reports: ' + error.message);
      }
    };

    fetchReports();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!userEngagementData || !ticketMetricsData) {
    return <p>Loading reports...</p>;
  }

  // User Engagement Chart Data
  const userEngagementChartData = {
    labels: userEngagementData.map((entry) => entry.date),
    datasets: [
      {
        label: 'Feedback Count',
        data: userEngagementData.map((entry) => entry.feedback_count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Ticket Metrics Chart Data
  const ticketMetricsChartData = {
    labels: ['Total Tickets', 'Resolution Rate (%)', 'Avg Resolution Time (hours)'],
    datasets: [
      {
        label: 'Ticket Metrics',
        data: [
          ticketMetricsData.total_tickets,
          ticketMetricsData.resolution_rate,
          ticketMetricsData.avg_response_time,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="report-component">
      <h2>User Engagement Report</h2>
      <Bar data={userEngagementChartData} options={{ responsive: true }} />

      <h2>Ticket Metrics Report</h2>
      <Line data={ticketMetricsChartData} options={{ responsive: true }} />
    </div>
  );
};

export default ReportsChart;
