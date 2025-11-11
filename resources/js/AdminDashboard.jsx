import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

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

  // summary state for Home cards
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // password change state for profile
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  async function loadSummary() {
    setSummaryLoading(true);
    setMsg('');
    try {
      const res = await fetch('/admin/summary', { credentials: 'same-origin', headers: { 'Accept': 'application/json' }});
      if (!res.ok) {
        setMsg('Failed to load summary.');
        setSummary(null);
        return;
      }
      const data = await res.json().catch(()=>null);
      setSummary(data || null);
    } catch (e) {
      console.error(e);
      setMsg('Failed to load summary. See console.');
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }
  
  useEffect(() => {
    if (view === 'applications') loadApplications();
    if (view === 'reports') loadReports();
    if (view === 'home') loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // submit change password to /profile/password
  async function submitChangePassword(e) {
    e && e.preventDefault();
    setPwdMsg('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg('New password and confirmation do not match.');
      return;
    }
    setPwdLoading(true);
    try {
      const body = new URLSearchParams();
      body.append('current_password', currentPassword);
      body.append('password', newPassword);
      body.append('password_confirmation', confirmPassword);

      const res = await fetch('/profile/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
        body
      });
      const data = await res.json().catch(()=>null);
      if (res.ok && data?.success) {
        setPwdMsg('Password updated.');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPwdMsg((data && (data.message || JSON.stringify(data.errors))) || `Failed (${res.status})`);
      }
    } catch (err) {
      console.error(err);
      setPwdMsg('Request failed. See console.');
    } finally {
      setPwdLoading(false);
    }
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
            <div style={{marginTop:12, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12}}>
              <div style={{background:'#fff',padding:14,borderRadius:8,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:12,color:'#666'}}>Total Users</div>
                <div style={{fontSize:20,fontWeight:700,marginTop:8}}>{summaryLoading ? '...' : (summary?.total_users ?? '—')}</div>
                <div style={{fontSize:12,color:'#999',marginTop:6}}>All accounts</div>
              </div>

              <div style={{background:'#fff',padding:14,borderRadius:8,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:12,color:'#666'}}>Total Reporters</div>
                <div style={{fontSize:20,fontWeight:700,marginTop:8}}>{summaryLoading ? '...' : (summary?.total_reporters ?? '—')}</div>
              </div>

              <div style={{background:'#fff',padding:14,borderRadius:8,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:12,color:'#666'}}>Total Councilors</div>
                <div style={{fontSize:20,fontWeight:700,marginTop:8}}>{summaryLoading ? '...' : (summary?.total_councilors ?? '—')}</div>
              </div>

              <div style={{background:'#fff',padding:14,borderRadius:8,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:12,color:'#666'}}>Total Reports</div>
                <div style={{fontSize:20,fontWeight:700,marginTop:8}}>{summaryLoading ? '...' : (summary?.total_reports ?? '—')}</div>
                <div style={{fontSize:12,color:'#999',marginTop:6}}>Submitted reports</div>
              </div>

              <div style={{background:'#fff',padding:14,borderRadius:8,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:12,color:'#666'}}>Pending</div>
                <div style={{fontSize:20,fontWeight:700,marginTop:8}}>{summaryLoading ? '...' : (summary?.pending_reports ?? '—')}</div>
              </div>

              <div style={{background:'#fff',padding:14,borderRadius:8,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>
                <div style={{fontSize:12,color:'#666'}}>Completed</div>
                <div style={{fontSize:20,fontWeight:700,marginTop:8}}>{summaryLoading ? '...' : (summary?.completed_reports ?? '—')}</div>
              </div>

            </div>
            {msg && <div style={{marginTop:12,color:'red'}}>{msg}</div>}
          </div>
        )}

        {view === 'applications' && (
          <div>
            <h2>Councilor Applications</h2>
            {loading && <div>Loading...</div>}
            {msg && <div style={{color:'red', marginTop:6}}>{msg}</div>}
            {!loading && applications.length === 0 && !msg && <div>No applications found.</div>}
            {!loading && applications.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginTop: 10 }}>
                {applications.map((app) => (
                  <div key={app.id} style={{ position: 'relative', background: '#fff', padding: 18, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 110, boxSizing: 'border-box' }}>
                    <div style={{ position: 'absolute', top: 10, left: 12, fontSize: 12, color: '#666' }}>Application #{app.id}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, fontSize: 16, fontWeight: 700 }}>{app.name || 'Unknown applicant'}</div>
                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                      <a href={`/admin/applications/${app.id}/preview`} style={{ display: 'inline-block', padding: '8px 12px', background: '#007bff', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
                        Preview
                      </a>
                    </div>
                  </div>
                ))}
              </div>
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
            <div style={{maxWidth:640,background:'#fff',padding:16,borderRadius:6}}>
              <div style={{marginBottom:12}}>
                <label style={{display:'block',fontSize:13,marginBottom:6}}>Name</label>
                <input value={initialUser?.name || ''} readOnly style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ddd',background:'#f6f6f6'}} />
              </div>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:13,marginBottom:6}}>Email</label>
                <input value={initialUser?.email || ''} readOnly style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ddd',background:'#f6f6f6'}} />
              </div>

              <hr style={{margin:'12px 0'}} />
              <h4 style={{marginTop:8}}>Change Password</h4>
              <form onSubmit={submitChangePassword} style={{marginTop:8}}>
                <div style={{marginBottom:10}}>
                  <label style={{display:'block',fontSize:13,marginBottom:6}}>Current password</label>
                  <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ddd'}} required />
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{display:'block',fontSize:13,marginBottom:6}}>New password</label>
                  <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ddd'}} required />
                </div>
                <div style={{marginBottom:10}}>
                  <label style={{display:'block',fontSize:13,marginBottom:6}}>Confirm new password</label>
                  <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ddd'}} required />
                </div>
                <div style={{marginTop:12,display:'flex',gap:8}}>
                  <button type="submit" disabled={pwdLoading} style={{padding:'8px 12px',background:'#0b5fff',color:'#fff',border:'none',borderRadius:4}}>
                    {pwdLoading ? 'Saving...' : 'Change password'}
                  </button>
                  <button type="button" onClick={()=>{ setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdMsg(''); }} style={{padding:'8px 12px',borderRadius:4}}>Reset</button>
                </div>
                {pwdMsg && <div style={{marginTop:10,color: pwdMsg.toLowerCase().includes('failed') || pwdMsg.toLowerCase().includes('error') ? 'red' : 'green'}}>{pwdMsg}</div>}
              </form>
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
    if (typeof createRoot === 'function') {
      createRoot(el).render(<AdminDashboard />);
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