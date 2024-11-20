import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Reports from './Reports.jsx'
import ReportCharts from './ReportCharts.jsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/ReportCharts" element={<ReportCharts />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
