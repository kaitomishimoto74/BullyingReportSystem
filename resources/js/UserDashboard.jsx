import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReportForm, { CheckReportForm } from './ReportForm.jsx';

export default function UserDashboard() {
  const [view, setView] = useState('report'); // 'report' | 'check'
  const currentUser = (typeof window !== 'undefined' && window.CurrentUser) ? window.CurrentUser : {};
  useEffect(() => { console.log('CurrentUser (from Blade):', currentUser); }, [currentUser]);
  const rawSchool = currentUser.school_id ?? currentUser.schoolId ?? currentUser.schoolID ?? currentUser.school ?? null;
  const schoolId = rawSchool ? String(rawSchool).trim() : 'Not set';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <aside style={{ width: 260, boxSizing: 'border-box', padding: 20, borderRight: '1px solid #eee', background: '#f8f9fa', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
        <h3 style={{ marginTop: 0 }}>User Panel</h3>
        <div style={{ marginBottom: 12, fontSize: 13, color: '#333' }}>
          <div><strong>{currentUser.name || currentUser.email || 'User'}</strong></div>
          <div style={{ color: '#666', marginTop: 6 }}>School ID: <span style={{ color: '#000' }}>{schoolId}</span></div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setView('report')} style={{ padding: '10px', borderRadius: 4, border: '1px solid #ddd', background: view === 'report' ? '#007bff' : '#fff', color: view === 'report' ? '#fff' : '#000' }}>Report Case</button>
          <button onClick={() => setView('check')} style={{ padding: '10px', borderRadius: 4, border: '1px solid #ddd', background: view === 'check' ? '#007bff' : '#fff', color: view === 'check' ? '#fff' : '#000' }}>Check Report</button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24, marginLeft: 260 }}>
        {view === 'report' && (
          <section>
            <h2>Report Case</h2>
            <div style={{ maxWidth: 920 }}>
              <ReportForm user={currentUser} />
            </div>
          </section>
        )}

        {view === 'check' && (
          <section>
            <h2>Check Report</h2>
            <CheckReportForm />
          </section>
        )}
      </main>
    </div>
  );
}

if (document.getElementById('user-dashboard-root')) {
  const container = document.getElementById('user-dashboard-root');
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(container).render(<UserDashboard />);
  } else {
    ReactDOM.render(<UserDashboard />, container);
  }
}