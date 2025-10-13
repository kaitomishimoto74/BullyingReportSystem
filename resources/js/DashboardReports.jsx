import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/admin/reports?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`)
      .then(res => res.json())
      .then(data => setReports(data));
  }, [search, status]);

  return (
    <div>
      <h2>File Reports</h2>
      <div style={{ background: '#f8f9fa', padding: '10px 20px', marginBottom: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search by Ticket ID, Victim, Offender, etc."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <button onClick={() => setStatus('All')} className="filter-btn">All</button>
        <button onClick={() => setStatus('Pending')} className="filter-btn">Pending</button>
        <button onClick={() => setStatus('Processing')} className="filter-btn">Processing</button>
        <button onClick={() => setStatus('Completed')} className="filter-btn">Completed</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {reports.length === 0 && <div>No reports found.</div>}
        {reports.map(report => (
          <div key={report.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '300px', background: '#f9f9f9', position: 'relative' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Ticket ID: {report.ticket_id}</div>
            <div>Status: <span style={{ color: report.status === 'Pending' ? '#dc3545' : (report.status === 'Completed' ? '#28a745' : '#ffc107') }}>{report.status}</span></div>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => navigate(`/admin/report/${report.id}/preview`)}
                style={{ padding: '5px 15px', background: '#007bff', color: '#fff', borderRadius: '4px', textDecoration: 'none', marginRight: '10px', border: 'none', cursor: 'pointer' }}
              >
                Preview
              </button>
              <form method="POST" action={`/admin/report/${report.id}/work`} style={{ display: 'inline' }}>
                <input type="hidden" name="_token" value={window.Laravel.csrfToken} />
                <button
                  type="submit"
                  style={{ padding: '5px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: report.worked_by ? 'not-allowed' : 'pointer' }}
                  disabled={!!report.worked_by}
                >
                  Work
                </button>
              </form>
              {report.worked_by && (
                <span style={{ color: '#888', fontSize: '12px', marginLeft: '10px' }}>Already assigned</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}