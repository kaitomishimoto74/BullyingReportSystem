import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

export default function AdminDashboard() {
  // prefer window.CurrentUser (matches user dashboard), fallback to data attribute
  const container = document.getElementById('admin-dashboard-root');
  const initialUser = (typeof window !== 'undefined' && window.CurrentUser && Object.keys(window.CurrentUser).length)
    ? window.CurrentUser
    : container ? (() => {
        try { return JSON.parse(container.getAttribute('data-current-user') || 'null'); }
        catch (e) { console.error('Invalid current-user JSON', e); return null; }
      })() : null;

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  const [view, setView] = useState('home'); // home | applications | reports | profile
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (view === 'applications') loadApplications();
    if (view === 'reports') loadReports();
  }, [view]);

  async function loadApplications() {
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/admin/councilor-applications', { credentials:'same-origin', headers:{ 'X-CSRF-TOKEN': csrf, Accept:'application/json' }});
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        if (ct.includes('text/html')) {
          setMsg('Applications endpoint returned HTML. Ensure server provides JSON for admin SPA or use the blade separately.');
        } else {
          setMsg(`Applications request failed (${res.status}).`);
        }
        setApplications([]);
        return;
      }

      if (ct.includes('application/json')) {
        const data = await res.json().catch(() => null);
        setApplications(Array.isArray(data) ? data : (data?.pending ?? []));
      } else {
        const txt = await res.text().catch(()=>null);
        setMsg('Applications returned non-JSON response. See server response in console.');
        console.log('Applications response (non-json):', txt);
        setApplications([]);
      }
    } catch (err) {
      console.error(err);
      setMsg('Failed to load applications. See console for details.');
      setApplications([]);
    } finally { setLoading(false); }
  }

  async function loadReports() {
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/admin/reports', { credentials:'same-origin', headers:{ 'X-CSRF-TOKEN': csrf, Accept:'application/json' }});
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        setMsg(`Reports request failed (${res.status}).`);
        setReports([]);
        return;
      }
      if (ct.includes('application/json')) {
        const data = await res.json().catch(()=>null);
        setReports(Array.isArray(data) ? data : (data?.reports ?? []));
      } else {
        const txt = await res.text().catch(()=>null);
        setMsg('Reports returned non-JSON response. See server response in console.');
        console.log('Reports response (non-json):', txt);
        setReports([]);
      }
    } catch (err) {
      console.error(err);
      setMsg('Failed to load reports. See console for details.');
      setReports([]);
    } finally { setLoading(false); }
  }

  async function handleLogout() {
    try {
      await fetch('/logout', { method:'POST', credentials:'same-origin', headers:{ 'X-CSRF-TOKEN': csrf }});
    } catch (e) { console.warn(e); }
    window.location.href = '/';
  }

  // Layout: fixed sidebar so it doesn't scroll; main has left margin equal to sidebar width
  const SIDEBAR_WIDTH = 260;
  const layoutStyle = { display: 'flex', minHeight: '100vh', fontFamily: 'Arial,Helvetica,sans-serif', background: '#f4f6f8', margin: 0 };
  const asideStyle = { position: 'fixed', top: 0, left: 0, width: SIDEBAR_WIDTH, height: '100vh', padding: 20, borderRight: '1px solid #e6e9ee', background: '#fff', boxSizing: 'border-box', overflow: 'hidden' };
  const mainStyle = { marginLeft: SIDEBAR_WIDTH, flex: 1, padding: 24, minHeight: '100vh', boxSizing: 'border-box' };
  const navBtn = (active) => ({ display:'block', padding:10, borderRadius:6, border:'1px solid #e6e9ee', background: active ? '#0b5fff' : '#fff', color: active ? '#fff' : '#111', textAlign:'left', marginBottom:8, width:'100%' });

  return (
    <div style={layoutStyle}>
      <aside style={asideStyle}>
        <h3 style={{marginTop:0}}>Admin Panel</h3>

        <nav style={{marginTop:12}}>
          <button style={navBtn(view==='home')} onClick={() => setView('home')}>Home</button>
          <button style={navBtn(view==='applications')} onClick={() => setView('applications')}>Applications</button>
          <button style={navBtn(view==='reports')} onClick={() => setView('reports')}>Reports</button>
          <button style={navBtn(view==='profile')} onClick={() => setView('profile')}>Profile</button>
          <button style={{...navBtn(false), marginTop:12}} onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main style={mainStyle}>
        {view === 'home' && (
          <div>
            <h2>Home</h2>
            <p>Welcome back, {initialUser?.name ?? 'Admin'}.</p>
            <div style={{marginTop:12}}>
              <strong>Quick summary</strong>
              <div style={{marginTop:8, color:'#666'}}>{msg}</div>
            </div>
          </div>
        )}

        {view === 'applications' && (
          <div>
            <h2>Councilor Applications</h2>
            {loading && <div>Loading...</div>}
            {msg && <div style={{color:'red', marginTop:6}}>{msg}</div>}
            {!loading && applications.length === 0 && !msg && <div>No applications found.</div>}
            {!loading && applications.length > 0 && (
              <table style={{width:'100%',borderCollapse:'collapse',marginTop:10}}>
                <thead>
                  <tr style={{textAlign:'left'}}><th>#</th><th>Name</th><th>Email</th><th>Address</th><th>Attachment</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {applications.map((a,i) => (
                    <tr key={a.id ?? i} style={{borderTop:'1px solid #eee'}}>
                      <td style={{padding:8}}>{a.id ?? i+1}</td>
                      <td style={{padding:8}}>{a.user?.name ?? (a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : '-')}</td>
                      <td style={{padding:8}}>{a.user?.email ?? a.email}</td>
                      <td style={{padding:8}}>{a.user?.address ?? a.address ?? '-'}</td>
                      <td style={{padding:8}}>
                        {a.attachment_path ? <a href={`/storage/${a.attachment_path}`} target="_blank" rel="noreferrer">View</a> : '-'}
                      </td>
                      <td style={{padding:8}}>{a.created_at ?? a.submitted_at ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {view === 'reports' && (
          <div>
            <h2>Reports</h2>
            {loading && <div>Loading...</div>}
            {msg && <div style={{color:'red'}}>{msg}</div>}
            {!loading && reports.length === 0 && !msg && <div>No reports found.</div>}
            {!loading && reports.length > 0 && (
              <ul>
                {reports.map(r => <li key={r.id}>{r.title ?? r.summary ?? 'Report #' + r.id}</li>)}
              </ul>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div>
            <h2>Profile</h2>
            <div style={{maxWidth:640,background:'#fff',padding:12,borderRadius:6}}>
              <div><strong>Name:</strong> {initialUser?.name}</div>
              <div><strong>Email:</strong> {initialUser?.email}</div>
              <div style={{marginTop:8}}>
                <a href="#" onClick={(e)=>{ e.preventDefault(); setMsg('Profile editing not implemented yet.'); }}>Edit profile</a>
              </div>
              {msg && <div style={{marginTop:10,color:'green'}}>{msg}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// mount if element exists with safe try/catch
const el = document.getElementById('admin-dashboard-root');
if (el) {
  try {
    if (ReactDOM && ReactDOM.createRoot) {
      ReactDOM.createRoot(el).render(<AdminDashboard />);
    } else if (ReactDOM && ReactDOM.render) {
      ReactDOM.render(<AdminDashboard />, el);
    } else {
      el.innerHTML = '<pre style="color:red">Unable to mount AdminDashboard: ReactDOM missing.</pre>';
    }
  } catch (e) {
    console.error('AdminDashboard mount error', e);
    el.innerHTML = '<pre style="color:red">Admin dashboard failed to load. Check console for details.</pre>';
  }
}