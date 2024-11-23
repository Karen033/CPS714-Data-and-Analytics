import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import './Reports.css';
import ReportsChart from './ReportCharts';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedReportType, setSelectedReportType] = useState('User Engagement');
  const [latestReport, setLatestReport] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('01_users')
        .select('user_id, status');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const generateReports = async () => {
    setLoading(true);
    setMessage('');
  
    try {
      const response = await fetch('http://localhost:5001/api/generate-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedReportType, // Change `report_type` to `reportType`
          userId: selectedUser, // Change `user` to `userId`
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const result = await response.json();
      setMessage('Report generated successfully!');
  
      // Fetch the latest report after generation
      const fetchLatestReport = await fetch('http://localhost:5001/api/reports/latest');
      if (!fetchLatestReport.ok) {
        throw new Error(`Failed to fetch the latest report: ${fetchLatestReport.statusText}`);
      }
      const latestReportData = await fetchLatestReport.json();
      setLatestReport(latestReportData);
    } catch (error) {
      setMessage('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="report-component">
      <h1>Reports</h1>
      <div>
        <h3>Select Report Type:</h3>
        <select
          value={selectedReportType}
          onChange={(e) => setSelectedReportType(e.target.value)}
        >
          <option value="User Engagement">Default User Engagement</option>
          <option value="Ticket Metrics">Ticket Metrics</option>
          <option value="User Engagement - Activity">User Engagement - Activity</option>
          <option value="User Engagement - Rewards">User Engagement - Rewards</option>
          <option value="User Engagement - Feedback">User Engagement - Feedback</option>
        </select>
      </div>
      <div>
        <h3>Select User:</h3>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          disabled={selectedReportType === 'Ticket Metrics'} // Disable user selection if "Ticket Metrics" is selected
        >
          <option value="all">All Users</option>
          {users.map((user) =>
            user.status === 'Active' ? (
              <option key={user.user_id} value={user.user_id}>
                {user.user_id}
              </option>
            ) : null
          )}
        </select>
      </div>
      <p>*If Ticket Metrics is selected, selecting a user is not valid*</p>
      <div>
        <button onClick={generateReports} disabled={loading}>
          {loading ? 'Generating Reports...' : 'Generate Reports'}
        </button>
        <p>{message}</p>
      </div>

      {latestReport && (
        <div>
          <ReportsChart latestReport={latestReport} /> {/* Add ReportsChart here */}
        </div>
      )}
    </div>
  );
}

export default Reports;
