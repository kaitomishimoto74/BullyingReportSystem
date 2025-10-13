import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DashboardPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch(`/admin/report/${id}/preview-json`)
      .then(res => res.json())
      .then(data => setReport(data));
  }, [id]);

  const handleComplete = async () => {
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
      setCompleted(true);
      setReport({ ...report, status: 'Completed' });
    }
  };

  if (!report) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '30px' }}>
      <h2>Report Preview</h2>
      <p><strong>Ticket ID:</strong> {report.ticket_id}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Date:</strong> {report.date}</p>
      <p><strong>Reporter Phone:</strong> {report.reporter_phone ?? 'N/A'}</p>
      <p><strong>Reporter Email:</strong> {report.reporter_email ?? 'N/A'}</p>
      <p><strong>Assigned to:</strong> {report.worked_by ? (report.assigned_username ?? 'Unknown') : 'Not yet assigned'}</p>
      <p><strong>Victim(s):</strong> {report.victim_names}</p>
      <p><strong>Offender(s):</strong> {report.offender_names}</p>
      <p><strong>Type of Bullying:</strong> {Array.isArray(report.bullying_type) ? report.bullying_type.join(', ') : report.bullying_type}</p>
      <p><strong>Explanation:</strong> {report.bullying_explanation}</p>
      <p><strong>Location:</strong> {Array.isArray(report.bullying_location) ? report.bullying_location.join(', ') : report.bullying_location}</p>
      <p><strong>Other Location:</strong> {report.bullying_location_other}</p>
      <p><strong>People Victim Spoke To:</strong> {Array.isArray(report.victim_spoken_to) ? report.victim_spoken_to.join(', ') : report.victim_spoken_to}</p>
      <p><strong>Reported By:</strong> {report.reporter_name}</p>
      <div style={{ marginTop: '30px' }}>
        {report.status !== 'Completed' && !completed && (
          <button
            onClick={handleComplete}
            style={{ padding: '10px 30px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Mark as Completed
          </button>
        )}
        {completed && <span style={{ color: '#28a745', fontWeight: 'bold' }}>Marked as Completed!</span>}
        <button
          onClick={() => navigate(-1)}
          style={{ marginLeft: '20px', padding: '10px 30px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Back
        </button>
      </div>
    </div>
  );
}