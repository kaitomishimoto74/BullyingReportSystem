import React, { useState } from 'react';

export default function MainScreen() {
  const [showRegister, setShowRegister] = useState(false);
  const [regRole, setRegRole] = useState('reporter');
  const [reporterPendingEmail, setReporterPendingEmail] = useState(null);
  const [reporterOtp, setReporterOtp] = useState('');
  const [reporterOtpStage, setReporterOtpStage] = useState(false);
  const [reporterMsg, setReporterMsg] = useState(null);

  const loginError = window.backendErrors?.login;
  const registerError = window.backendErrors?.register;

  const handleShowLogin = () => setShowRegister(false);
  const handleShowRegister = () => setShowRegister(true);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ marginBottom: '40px' }}>TMC Bullying Report Management System</h1>
      <div style={{ width: '320px' }}>
        {!showRegister && (
          <form method="POST" action="/admin/login" style={{ width: '100%' }}>
            <input type="hidden" name="_token" value={window.Laravel.csrfToken} />
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
            {loginError && (
              <div style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}
            <div style={{ marginBottom: '15px' }}>
              <input type="text" name="login" placeholder="Email or Username" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="password" name="password" placeholder="Password" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Sign In</button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <span>Don't have account? </span>
              <button type="button" onClick={handleShowRegister} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Sign up</button>
            </div>
          </form>
        )}
        {showRegister && (
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <label style={{ marginRight: 12 }}>
                <input type="radio" name="role" value="reporter" defaultChecked onChange={() => setRegRole('reporter')} /> Reporter
              </label>
              <label>
                <input type="radio" name="role" value="councilor" onChange={() => setRegRole('councilor')} /> Councilor
              </label>
            </div>

            {regRole === 'reporter' && (
              <>
                {!reporterOtpStage && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target;
                      const school_id = form.school_id.value.trim();
                      const email = form.email.value.trim();
                      const password = form.password.value;
                      const password_confirmation = form.password_confirmation.value;

                      if (!/^\d{2}-\d{6}$/.test(school_id)) {
                        alert('School ID must be numbers only and format **-****** (e.g. 12-345678).');
                        return;
                      }
                      if (!email) { alert('Email is required.'); return; }
                      if (!password || password !== password_confirmation) { alert('Passwords are required and must match.'); return; }

                      const payload = { role: 'reporter', school_id, email, password, password_confirmation };
                      const csrf = window.Laravel?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

                      try {
                        const res = await fetch('/admin/register', {
                          method: 'POST',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf,
                            Accept: 'application/json',
                          },
                          body: JSON.stringify(payload),
                        });
                        const data = await res.json().catch(() => null);
                        if (res.ok || res.status === 201) {
                          // start OTP stage
                          setReporterPendingEmail(data?.email || email);
                          setReporterOtpStage(true);
                          setReporterMsg('OTP sent to your email. Enter it below.');
                        } else {
                          const msg = data?.message || (data?.errors ? JSON.stringify(data.errors) : 'Registration failed');
                          alert(msg);
                        }
                      } catch (err) {
                        alert(err.message || 'Unexpected error during registration.');
                      }
                    }}
                  >
                    <input type="hidden" name="_token" value={window.Laravel.csrfToken} />
                    <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Reporter Registration</h2>
                    <div style={{ marginBottom: '15px' }}>
                      <input
                        name="school_id"
                        placeholder="School ID (12-345678)"
                        onChange={(e) => {
                          const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
                          e.target.value = digits.length <= 2 ? digits : digits.slice(0, 2) + '-' + digits.slice(2);
                        }}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <input name="password_confirmation" type="password" placeholder="Confirm Password" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Register</button>
                  </form>
                )}

                {reporterOtpStage && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const csrf = window.Laravel?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                    try {
                      const res = await fetch('/verify-otp', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-CSRF-TOKEN': csrf,
                          Accept: 'application/json',
                        },
                        body: JSON.stringify({ email: reporterPendingEmail, otp: reporterOtp }),
                      });
                      const data = await res.json().catch(() => null);
                      if (res.ok) {
                        // redirect to user dashboard
                        window.location.href = data?.redirect || '/user/dashboard';
                      } else {
                        alert(data?.message || 'OTP verification failed.');
                      }
                    } catch (err) {
                      alert(err.message || 'Unexpected error during OTP verification.');
                    }
                  }}>
                    <h2 style={{ marginBottom: '12px', textAlign: 'center' }}>Enter OTP</h2>
                    {reporterMsg && <div style={{ color: 'green', marginBottom: 8 }}>{reporterMsg}</div>}
                    <div style={{ marginBottom: '12px' }}>
                      <input value={reporterOtp} onChange={(e) => setReporterOtp(e.target.value.replace(/\D/g, '').slice(0,6))} maxLength="6" placeholder="Enter 6-digit code" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Verify OTP</button>
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <button type="button" onClick={() => { setReporterOtpStage(false); setReporterPendingEmail(null); setReporterOtp(''); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                )}
              </>
            )}

            {regRole === 'councilor' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const first_name = form.first_name.value.trim();
                  const last_name = form.last_name.value.trim();
                  const username = form.username.value.trim();
                  const email = form.email.value.trim();
                  const password = form.password.value;
                  const password_confirmation = form.password_confirmation.value;

                  if (!first_name || !last_name) { alert('First and last name are required.'); return; }
                  if (!username) { alert('Username is required.'); return; }
                  if (!email) { alert('Email is required.'); return; }
                  if (!password || password !== password_confirmation) { alert('Passwords are required and must match.'); return; }

                  const payload = { role: 'councilor', first_name, last_name, username, email, password, password_confirmation };
                  const csrf = window.Laravel?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                  try {
                    const res = await fetch('/admin/register', {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrf,
                        Accept: 'application/json',
                      },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json().catch(() => null);
                    if (res.ok || res.status === 201) {
                      alert(data?.message || 'Councilor registered.');
                      window.location.href = '/';
                    } else {
                      const msg = data?.message || (data?.errors ? JSON.stringify(data.errors) : 'Registration failed');
                      alert(msg);
                    }
                  } catch (err) {
                    alert(err.message || 'Unexpected error during registration.');
                  }
                }}
              >
                <input type="hidden" name="_token" value={window.Laravel.csrfToken} />
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Councilor Registration</h2>
                <div style={{ marginBottom: '15px' }}>
                  <input name="first_name" placeholder="First Name" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <input name="last_name" placeholder="Last Name" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <input name="username" placeholder="Username" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <input name="password_confirmation" type="password" placeholder="Confirm Password" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Register</button>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <span>Already have account? </span>
                  <button type="button" onClick={handleShowLogin} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}