import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './Reports.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsChart = ({ latestReport }) => {
  const [error, setError] = useState(null);

  if (!latestReport) {
    return <p>Loading latest report...</p>;
  }

  // Parse the report's data
  let parsedData = null;
  try {
    parsedData = JSON.parse(latestReport.data);
  } catch (err) {
    setError('Error parsing report data: ' + err.message);
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Configure chart data based on report type
  const chartData = (() => {
    switch (latestReport.report_type) {
      case 'User Engagement':
        return {
          labels: parsedData.map((entry) => entry.created_at),  // X-axis: Date labels
          datasets: [
            {
              label: 'Feedback Count',
              data: parsedData.map((entry) => entry.feedback_count),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',  // Light blue for feedback
              borderColor: 'rgba(75, 192, 192, 1)',  // Darker blue for feedback
              borderWidth: 1,
              yAxisID: 'y1',  // Using y1 axis for feedback
            },
            {
              label: 'Activity Count',
              data: parsedData.map((entry) => entry.activity_count),
              backgroundColor: 'rgba(153, 102, 255, 0.6)',  // Purple for activity
              borderColor: 'rgba(153, 102, 255, 1)',  // Darker purple for activity
              borderWidth: 1,
              yAxisID: 'y1',  // Using y1 axis for activity
            },
            {
              label: 'Rewards Status',  // Showing rewards status as binary (1 or 0)
              data: parsedData.map((entry) => (entry.points_redeemed)),
              backgroundColor: 'rgba(255, 159, 64, 0.6)',  // Orange for rewards
              borderColor: 'rgba(255, 159, 64, 1)',  // Darker orange for rewards
              borderWidth: 1,
              yAxisID: 'y2',  // Using y2 axis for rewards status (binary data)
            },
          ],
          options: {
            scales: {
              y1: {
                beginAtZero: true,  // Start y1 axis at zero
                position: 'left',  // Place y1 axis on the left
              },
              y2: {
                beginAtZero: true,  // Start y2 axis at zero
                position: 'right',  // Place y2 axis on the right for binary data
                grid: {
                  drawOnChartArea: false,  // Hide gridlines for y2 to reduce clutter
                },
                ticks: {
                  min: 0,
                  max: 1,  // y2 axis for binary (1 or 0) data
                },
              },
            },
            responsive: true,  // Ensure the chart is responsive
            plugins: {
              legend: {
                position: 'top',  // Position the legend on top of the chart
              },
            },
          },
        };
      case 'Ticket Metrics':
        return {
          labels: ['Total Tickets', 'Resolution Rate (%)', 'Avg Response Time (hrs)', 'Submission Rate (tickets/day)'],
          datasets: [
            {
              label: 'Ticket Metrics',
              data: [
                parsedData.total_tickets,
                parsedData.resolution_rate,
                parsedData.avg_response_time,
                parsedData.submission_rate,
              ],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };

      case 'User Engagement - Activity':
        return {
          labels: parsedData.map((entry) => entry.activity_dates),
          datasets: [
            {
              label: 'Activity Count',
              data: parsedData.map((entry) => entry.activity_count),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };

      case 'User Engagement - Rewards':
        return {
          labels: parsedData.map((entry) => entry.redeemed_date),
          datasets: [
            {
              label: 'Rewards Status',
              data: parsedData.map((entry) => (entry.points_redeemed)),
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
            },
          ],
        };

      case 'User Engagement - Feedback':
        return {
          labels: parsedData.map((entry) => entry.feedback_dates),
          datasets: [
            {
              label: 'Feedback Count',
              data: parsedData.map((entry) => entry.feedback_count),
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        };

      default:
        return null;
    }
  })();

  return (
    <div className="report-component">
      <h2>{latestReport.report_type} Report</h2>
      {chartData ? (
        <div className="chart-container">
          <Bar
            data={chartData}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
            height={135}
          />
        </div>
      ) : (
        <p>No data available for the selected report</p>
      )}
    </div>
  );
};

export default ReportsChart;
