import React, { useEffect, useState } from 'react';

export default function DashboardWork() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/admin/work-reports')
      .then(res => res.json())
      .then(data => setReports(data));
  }, []);

  const handleComplete = async (id) => {
    setMessage('');
    const res = await fetch(`/admin/report/${id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': window.Laravel.csrfToken,
      },
      credentials: 'same-origin',
    });
    const data = await res.json();
    if (data.success) {
      setReports(reports.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
      setMessage('Report marked as completed!');
    } else {
      setMessage('Failed to mark as completed.');
    }
  };

  return (
    <div>
      <h2>My Work</h2>
      {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {reports.length === 0 && <div>No reports assigned to you.</div>}
        {reports.map(report => (
          <div key={report.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '300px', background: '#f9f9f9' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Ticket ID: {report.ticket_id}</div>
            <div>Status: <span style={{ color: report.status === 'Pending' ? '#dc3545' : (report.status === 'Completed' ? '#28a745' : '#ffc107') }}>{report.status}</span></div>
            <div style={{ marginTop: '10px' }}>
              <a href={`/admin/report/${report.id}/preview`} style={{ padding: '5px 15px', background: '#007bff', color: '#fff', borderRadius: '4px', textDecoration: 'none', marginRight: '10px' }}>Preview</a>
              {report.status !== 'Completed' && (
                <button
                  onClick={() => handleComplete(report.id)}
                  style={{ padding: '5px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}