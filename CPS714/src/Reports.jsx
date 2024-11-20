import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';
import './Reports.css';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Function to generate reports (assuming backend API is running)
  const generateReports = async () => {
    setLoading(true);
    setMessage('');
  
    try {
      // Call the backend API to generate reports
      const response = await fetch('http://localhost:5001/api/generate-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: 'value' }),
      });      
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json(); // Parse JSON only if response is valid
      setMessage('Reports generated successfully!');
    } catch (error) {
      setMessage('Error generating reports: ' + error.message);
    }
  };  

  return (
    <div className="report-component">
      <h1>Reports</h1>

      {/* Button to trigger report generation */}
      <button onClick={generateReports} disabled={loading}>
        {loading ? 'Generating Reports...' : 'Generate Reports'}
      </button>
      <p>{message}</p>

      <div>
        <button>
          <Link to="/ReportCharts">View Reports</Link>
        </button>
      </div>
    </div>
  );
}

export default Reports;
