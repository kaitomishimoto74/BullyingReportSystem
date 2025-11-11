import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import DashboardReports from './DashboardReports.jsx'; // optional - will render when Reports selected

export default function Dashboard() {
  const [view, setView] = useState('home'); // 'home' | 'reports' | 'work' | 'profile'
  const [stats, setStats] = useState({ reports: 0, work: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // CSRF token
  const csrfToken = (typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]'))
    ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    : (window.Laravel?.csrfToken || '');

  // robustly read current user from possible sources (window or blade mount data)
  function readClientUser() {
    if (typeof window === 'undefined') return {};
    if (window.CurrentUser && Object.keys(window.CurrentUser).length) return window.CurrentUser;
    if (window.Laravel && (window.Laravel.user || window.Laravel.currentUser)) return window.Laravel.user || window.Laravel.currentUser;
    const el = document.getElementById('react-dashboard-root') || document.getElementById('dashboard-root') || document.getElementById('admin-dashboard-root');
    if (el && el.dataset && el.dataset.currentUser) {
      try { return JSON.parse(el.dataset.currentUser); } catch (e) { /* ignore parse error */ }
    }
    return {};
  }

  // use state so UI updates when user data becomes available
  const [currentUser, setCurrentUser] = useState(() => readClientUser());
  const username = currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'User';

  // ensure we pick up a later assignment to window.CurrentUser (e.g. set by blade)
  useEffect(() => {
    const u = readClientUser();
    if (JSON.stringify(u) !== JSON.stringify(currentUser)) setCurrentUser(u);
    // lightweight polling to catch asynchronous assignments (cleared on unmount)
    const t = setInterval(() => {
      const uu = readClientUser();
      if (JSON.stringify(uu) !== JSON.stringify(currentUser)) setCurrentUser(uu);
    }, 800);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Profile SPA state (inlined)
  const [profileTab, setProfileTab] = useState('main'); // 'main' | 'password'
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profile, setProfile] = useState({
    username: (currentUser && currentUser.username) ? currentUser.username : '',
    first_name: (currentUser && currentUser.first_name) ? currentUser.first_name : '',
    last_name: (currentUser && currentUser.last_name) ? currentUser.last_name : '',
    email: (currentUser && currentUser.email) ? currentUser.email : '',
    address: (currentUser && currentUser.address) ? currentUser.address : ''
  });

  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view')) setView(params.get('view'));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('view', view);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e) {}
  }, [view]);

  // update local profile when currentUser changes
  const profileInitialized = useRef(false);
  useEffect(() => {
    const hasUserData = currentUser && (currentUser.username || currentUser.first_name || currentUser.email || currentUser.address);
    if (!hasUserData) return;

    // Initialize profile once to avoid wiping user edits while typing
    if (!profileInitialized.current) {
      setProfile({
        username: currentUser.username ?? '',
        first_name: currentUser.first_name ?? '',
        last_name: currentUser.last_name ?? '',
        email: currentUser.email ?? '',
        address: currentUser.address ?? ''
      });
      profileInitialized.current = true;
      return;
    }

    // If profile fields are still empty for some reason, fill missing fields without overwriting existing edits
    setProfile(prev => ({
      username: prev.username || currentUser.username || '',
      first_name: prev.first_name || currentUser.first_name || '',
      last_name: prev.last_name || currentUser.last_name || '',
      email: prev.email || currentUser.email || '',
      address: prev.address || currentUser.address || ''
    }));
  }, [currentUser]);

  // fetch stats for Home view
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('/dashboard/stats', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken }
        });
        if (!res.ok) {
          if (mounted) setStats({ reports: 0, work: 0 });
        } else {
          const json = await res.json();
          if (mounted) setStats({ reports: json.reports ?? 0, work: json.work ?? 0 });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        if (mounted) setStats({ reports: 0, work: 0 });
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    if (view === 'home') load();
    return () => { mounted = false; };
  }, [view, csrfToken]);

  const handleLogout = async () => {
    if (!confirm('Log out now?')) return;
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json'
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/';
    }
  };

  // Profile handlers (inlined)
  const handleProfileChange = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  const saveProfile = async (e) => {
    e && e.preventDefault();
    setProfileMsg('');
    setProfileSaving(true);
    try {
      // include first_name/last_name to avoid backend overwriting them with null
      const payload = {
        username: profile.username,
        email: profile.email,
        address: profile.address,
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? ''
      };

      const res = await fetch('/profile/update', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setProfileMsg('Profile updated.');
        // keep client-side CurrentUser in sync (preserve any other fields)
        if (window.CurrentUser) {
          window.CurrentUser = { ...window.CurrentUser, ...payload };
          // also update local currentUser state so UI reflects changes
          setCurrentUser(prev => ({ ...prev, ...payload }));
        }
        // mark as initialized so future currentUser retriggers won't wipe edits
        profileInitialized.current = true;
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

  const renderHomeCards = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
      <div style={{ background: '#fff', padding: 18, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 13, color: '#6c757d' }}>Total Reports</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{loadingStats ? '...' : stats.reports}</div>
      </div>

      <div style={{ background: '#fff', padding: 18, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 13, color: '#6c757d' }}>Total Work</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{loadingStats ? '...' : stats.work}</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'reports':
        return <DashboardReports />;
      case 'work':
        return <div style={{ padding: 20 }}>Work page (not implemented)</div>;
      case 'profile':
        return (
          <div style={{ padding: 16, background: '#fff', borderRadius: 6, maxWidth: 920 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <button onClick={() => setProfileTab('main')} style={{ padding: '8px 12px', borderRadius: 6, border: profileTab === 'main' ? '2px solid #007bff' : '1px solid #eee', background: profileTab === 'main' ? '#e9f2ff' : '#fff' }}>Main Profile</button>
              <button onClick={() => setProfileTab('password')} style={{ padding: '8px 12px', borderRadius: 6, border: profileTab === 'password' ? '2px solid #007bff' : '1px solid #eee', background: profileTab === 'password' ? '#e9f2ff' : '#fff' }}>Change Password</button>
            </div>

            {profileTab === 'main' && (
              <form onSubmit={saveProfile}>
                <h2 style={{ marginTop: 0 }}>Profile</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 13 }}>First name</label>
                    <input value={profile.first_name} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#f6f6f6' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13 }}>Last name</label>
                    <input value={profile.last_name} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#f6f6f6' }} />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 13 }}>Username</label>
                  <input value={profile.username} onChange={(e) => handleProfileChange('username', e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }} />
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 13 }}>Email</label>
                  <input value={profile.email} readOnly style={{ width: '100%', padding: 8, marginTop: 6, background: '#f6f6f6' }} />
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 13 }}>Address</label>
                  <input value={profile.address} onChange={(e) => handleProfileChange('address', e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }} />
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
                  <button type="submit" disabled={pwSaving} style={{ padding: '8px 12px' }}>{pwSaving ? 'Saving...' : 'Change Password'}</button>
                </div>
                {pwMsg && <div style={{ marginTop: 10, color: pwMsg.toLowerCase().includes('failed') ? 'red' : 'green' }}>{pwMsg}</div>}
              </form>
            )}
          </div>
        );
      case 'home':
      default:
        return (
          <div>
            <h2 style={{ marginTop: 0 }}>Overview</h2>
            {renderHomeCards()}
          </div>
        );
    }
  };

  const navButton = (key, label) => (
    <button
      key={key}
      onClick={() => setView(key)}
      style={{
        padding: '10px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: view === key ? '#007bff' : '#fff',
        color: view === key ? '#fff' : '#000',
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <aside
        style={{
          width: 260,
          boxSizing: 'border-box',
          padding: 20,
          borderRight: '1px solid #eee',
          background: '#f8f9fa',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          overflow: 'hidden'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Councilor Panel</h3>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navButton('home', 'Home')}
          {navButton('reports', 'Reports')}
          {navButton('work', 'Work')}
          {navButton('profile', 'Profile')}
          <button
            onClick={handleLogout}
            style={{
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: '#fff',
              color: '#000',
              textAlign: 'left',
              width: '100%',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24, marginLeft: 260, minHeight: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
        <header style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>{view === 'home' ? 'Home' : view.charAt(0).toUpperCase() + view.slice(1)}</h1>
        </header>

        <section style={{ background: '#fff', padding: 18, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

if (document.getElementById('react-dashboard-root')) {
  const container = document.getElementById('react-dashboard-root');
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(container).render(<Dashboard />);
  } else {
    ReactDOM.render(<Dashboard />, container);
  }
}