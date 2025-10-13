import React from 'react';

export default function DashboardHome() {
  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: '40px 30px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#007bff', marginBottom: '16px', fontWeight: 700, fontSize: '2.2rem' }}>
        Admin Dashboard
      </h1>
      <p style={{ fontSize: '1.15rem', color: '#444', marginBottom: '36px' }}>
        Welcome! Use the tools above to manage bullying reports, assign work, and monitor case progress.
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: '#f4f8fc',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '28px 24px',
          minWidth: '220px',
          flex: '1 1 220px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.2rem', color: '#007bff', marginBottom: '10px' }}>📄</div>
          <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem', marginBottom: '8px' }}>File Reports</div>
          <div style={{ fontSize: '15px', color: '#555' }}>View, filter, and manage all submitted bullying reports.</div>
        </div>
        <div style={{
          background: '#f4f8fc',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '28px 24px',
          minWidth: '220px',
          flex: '1 1 220px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.2rem', color: '#007bff', marginBottom: '10px' }}>🗂️</div>
          <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem', marginBottom: '8px' }}>Work</div>
          <div style={{ fontSize: '15px', color: '#555' }}>See cases assigned to you and mark them as completed.</div>
        </div>
        <div style={{
          background: '#f4f8fc',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '28px 24px',
          minWidth: '220px',
          flex: '1 1 220px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.2rem', color: '#007bff', marginBottom: '10px' }}>🔍</div>
          <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem', marginBottom: '8px' }}>Preview</div>
          <div style={{ fontSize: '15px', color: '#555' }}>Review full details of any report in a clean format.</div>
        </div>
      </div>
    </div>
  );
}