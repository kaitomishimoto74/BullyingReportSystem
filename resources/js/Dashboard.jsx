import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import DashboardReports from './DashboardReports';
import DashboardWork from './DashboardWork';
import DashboardPreview from './DashboardPreview';

const username = window.Laravel?.username || 'Admin';

function Navbar() {
  const handleLogout = async () => {
    await fetch('/admin/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/';
  };

  return (
    <div style={{
      background: '#007bff', color: '#fff', padding: '15px 30px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div>
        <Link to="/admin/dashboard" style={{ color: '#fff', marginRight: 20, textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
        <Link to="/admin/reports" style={{ color: '#fff', marginRight: 20, textDecoration: 'none', fontWeight: 'bold' }}>File Reports</Link>
        <Link to="/admin/work" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Work</Link>
      </div>
      <div>
        Hello, {username}
        <button onClick={handleLogout} style={{
          background: '#dc3545', color: '#fff', border: 'none', padding: '5px 15px',
          borderRadius: '4px', marginLeft: '10px', cursor: 'pointer'
        }}>Logout</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: 30 }}>
        <Routes>
          <Route path="/admin/dashboard" element={<DashboardHome />} />
          <Route path="/admin/reports" element={<DashboardReports />} />
          <Route path="/admin/work" element={<DashboardWork />} />
          <Route path="/admin/report/:id/preview" element={<DashboardPreview />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}