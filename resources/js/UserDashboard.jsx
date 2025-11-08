import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReportForm, { CheckReportForm } from './ReportForm.jsx';

export default function UserDashboard() {
  const [view, setView] = useState('report'); // 'report' | 'check' | 'profile'
  const [logoutError, setLogoutError] = useState('');
  // CSRF token
  const csrfToken = (typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]'))
    ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    : (window.Laravel?.csrfToken || '');

  const currentUser = (typeof window !== 'undefined' && window.CurrentUser) ? window.CurrentUser : {};
  useEffect(() => { console.log('CurrentUser (from Blade):', currentUser); }, [currentUser]);
  const rawSchool = currentUser.school_id ?? currentUser.schoolId ?? currentUser.schoolID ?? currentUser.school ?? null;
  const schoolId = rawSchool ? String(rawSchool).trim() : 'Not set';

  // Profile SPA state
  const [profileTab, setProfileTab] = useState('main'); // 'main' | 'password'
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profile, setProfile] = useState({
    first_name: currentUser.first_name ?? '',
    last_name: currentUser.last_name ?? '',
    email: currentUser.email ?? '',
    school_id: currentUser.school_id ?? ''
  });

  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    // update local profile when currentUser changes
    setProfile({
      first_name: currentUser.first_name ?? '',
      last_name: currentUser.last_name ?? '',
      email: currentUser.email ?? '',
      school_id: currentUser.school_id ?? ''
    });
  }, [currentUser]);

  const handleProfileChange = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  const saveProfile = async (e) => {
    e && e.preventDefault();
    setProfileMsg('');
    setProfileSaving(true);
    try {
      const res = await fetch('/profile/update', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setProfileMsg('Profile updated.');
        // update global current user if available
        if (window.CurrentUser) {
          window.CurrentUser = { ...window.CurrentUser, ...profile };
        }
      } else {
        setProfileMsg((data && (data.message || JSON.stringify(data.errors))) || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setProfileMsg('Request failed. See console.');
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async (e) => {
    e && e.preventDefault();
    setPwMsg('');
    const form = e.target;
    const current_password = form.current_password.value;
    const password = form.password.value;
    const password_confirmation = form.password_confirmation.value;
    if (!current_password) { setPwMsg('Enter current password'); return; }
    if (!password || password.length < 6) { setPwMsg('New password minimum 6 chars'); return; }
    if (password !== password_confirmation) { setPwMsg('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/profile/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ current_password, password, password_confirmation })
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setPwMsg('Password changed.');
        form.reset();
      } else {
        setPwMsg((data && (data.message || JSON.stringify(data.errors))) || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setPwMsg('Request failed. See console.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError('');
    if (!confirm('Log out now?')) return;
    try {
      const res = await fetch('/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      });
      if (res.ok) {
        window.location.href = '/login';
        return;
      }
      const text = await res.text().catch(() => '');
      setLogoutError(`Logout failed (${res.status}). ${text ? '' : ''}`);
    } catch (err) {
      setLogoutError('Logout failed. Check console.');
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <aside style={{ width: 260, boxSizing: 'border-box', padding: 20, borderRight: '1px solid #eee', background: '#f8f9fa', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
        <h3 style={{ marginTop: 0 }}>User Panel</h3>
        {/* user summary removed from sidebar — profile contains full details */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setView('report')} style={{ padding: '10px', borderRadius: 4, border: '1px solid #ddd', background: view === 'report' ? '#007bff' : '#fff', color: view === 'report' ? '#fff' : '#000' }}>Report Case</button>
          <button onClick={() => setView('check')} style={{ padding: '10px', borderRadius: 4, border: '1px solid #ddd', background: view === 'check' ? '#007bff' : '#fff', color: view === 'check' ? '#fff' : '#000' }}>Check Report</button>
          <button onClick={() => { setView('profile'); setProfileTab('main'); }} style={{ padding: '10px', borderRadius: 4, border: '1px solid #ddd', background: view === 'profile' ? '#007bff' : '#fff', color: view === 'profile' ? '#fff' : '#000' }}>Profile</button>
          <button onClick={handleLogout} style={{ padding: '10px', borderRadius: 4, border: '1px solid #ddd', background: '#fff', color: '#000' }}>Logout</button>
        </nav>
        {logoutError && <div style={{ color: 'red', marginTop: 8 }}>{logoutError}</div>}
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

        {view === 'profile' && (
          <div style={{ padding: 16, background: '#fff', borderRadius: 6, maxWidth: 720 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <button onClick={() => setProfileTab('main')} style={{ padding: '8px 12px', borderRadius: 6, border: profileTab === 'main' ? '2px solid #007bff' : '1px solid #eee', background: profileTab === 'main' ? '#e9f2ff' : '#fff' }}>Main Profile</button>
              <button onClick={() => setProfileTab('password')} style={{ padding: '8px 12px', borderRadius: 6, border: profileTab === 'password' ? '2px solid #007bff' : '1px solid #eee', background: profileTab === 'password' ? '#e9f2ff' : '#fff' }}>Change Password</button>
            </div>

            {profileTab === 'main' && (
              <form onSubmit={saveProfile}>
                <h2 style={{ marginTop: 0 }}>Main Profile</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 13 }}>First name</label>
                    <input value={profile.first_name} onChange={(e) => handleProfileChange('first_name', e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13 }}>Last name</label>
                    <input value={profile.last_name} onChange={(e) => handleProfileChange('last_name', e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 13 }}>Email</label>
                  <input value={profile.email} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#f6f6f6' }} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 13 }}>School ID</label>
                  <input value={profile.school_id} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#f6f6f6' }} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={profileSaving} style={{ padding: '8px 12px' }}>{profileSaving ? 'Saving...' : 'Save Profile'}</button>
                </div>
                {profileMsg && <div style={{ marginTop: 10, color: profileMsg.toLowerCase().includes('failed') ? 'red' : 'green' }}>{profileMsg}</div>}
              </form>
            )}

            {profileTab === 'password' && (
              <form onSubmit={changePassword}>
                <h2 style={{ marginTop: 0 }}>Change Password</h2>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 13 }}>Current password</label>
                  <input name="current_password" type="password" required style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 13 }}>New password</label>
                  <input name="password" type="password" required style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 13 }}>Confirm new password</label>
                  <input name="password_confirmation" type="password" required style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={pwSaving} style={{ padding: '8px 12px' }}>{pwSaving ? 'Changing...' : 'Change Password'}</button>
                </div>
                {pwMsg && <div style={{ marginTop: 10, color: pwMsg.toLowerCase().includes('failed') ? 'red' : 'green' }}>{pwMsg}</div>}
              </form>
            )}
          </div>
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