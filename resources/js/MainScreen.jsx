import React, { useState } from 'react';

export default function MainScreen() {
  const [showRegister, setShowRegister] = useState(false);
  const [regRole, setRegRole] = useState('reporter');
  const [reporterPendingEmail, setReporterPendingEmail] = useState(null);
  const [reporterOtp, setReporterOtp] = useState('');
  const [reporterOtpStage, setReporterOtpStage] = useState(false);
  const [reporterMsg, setReporterMsg] = useState(null);

  // Forgot password UI
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStage, setForgotStage] = useState('email'); // 'email' | 'otp' | 'change'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [forgotMsg, setForgotMsg] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const csrf = window.Laravel?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

  const sendOtp = async (e) => {
    e && e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setForgotMsg('Enter a valid email.'); return; }
    setForgotLoading(true);
    try {
      const body = new URLSearchParams(); body.append('email', forgotEmail);
      const res = await fetch('/password/forgot/send-otp', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setForgotStage('otp');
        setForgotMsg('OTP sent to your email. Enter it below.');
      } else {
        setForgotMsg(data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      setForgotMsg('Request failed. See console.');
    } finally { setForgotLoading(false); }
  };

  const verifyOtp = async (e) => {
    e && e.preventDefault();
    setForgotMsg(null);
    if (!forgotOtp || forgotOtp.length < 4) { setForgotMsg('Enter the OTP.'); return; }
    setForgotLoading(true);
    try {
      const body = new URLSearchParams(); body.append('email', forgotEmail); body.append('otp', forgotOtp);
      const res = await fetch('/password/forgot/verify-otp', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setResetToken(data.reset_token || '');
        setForgotStage('change');
        setForgotMsg('OTP verified. Enter your new password.');
      } else {
        setForgotMsg(data?.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.error(err);
      setForgotMsg('Request failed. See console.');
    } finally { setForgotLoading(false); }
  };

  const changePassword = async (e) => {
    e && e.preventDefault();
    setForgotMsg(null);
    const form = e.target;
    const pw = form.password.value;
    const pwc = form.password_confirmation.value;
    if (!pw || pw.length < 6) { setForgotMsg('Password must be at least 6 chars.'); return; }
    if (pw !== pwc) { setForgotMsg('Passwords do not match.'); return; }
    setForgotLoading(true);
    try {
      const body = new URLSearchParams();
      body.append('token', resetToken);
      body.append('password', pw);
      body.append('password_confirmation', pwc);
      const res = await fetch('/password/forgot/change', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setForgotMsg('Password changed. You can now sign in.');
        // close forgot UI and show login
        setTimeout(() => { setShowForgot(false); setForgotStage('email'); setForgotEmail(''); setForgotOtp(''); setResetToken(''); setForgotMsg(null); }, 1600);
      } else {
        setForgotMsg(data?.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setForgotMsg('Request failed. See console.');
    } finally { setForgotLoading(false); }
  };

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
            <div style={{ marginTop: 10 }}>
              <a href="/password/forgot" style={{ color: '#007bff', textDecoration: 'underline' }}>Forgot password?</a>
            </div>
            {showForgot && (
              <div style={{ marginTop: 12, padding: 12, border: '1px solid #e6e6e6', borderRadius: 6 }}>
                {forgotStage === 'email' && (
                  <form onSubmit={sendOtp}>
                    <div style={{ marginBottom: 8 }}>
                      <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Your email" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={forgotLoading} style={{ padding: '8px 12px' }}>{forgotLoading ? 'Sending...' : 'Send OTP'}</button>
                      <button type="button" onClick={() => { setShowForgot(false); setForgotMsg(null); setForgotStage('email'); }} style={{ padding: '8px 12px' }}>Cancel</button>
                    </div>
                  </form>
                )}

                {forgotStage === 'otp' && (
                  <form onSubmit={verifyOtp}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ marginBottom: 6, fontSize: 13 }}>OTP sent to: <strong>{forgotEmail}</strong></div>
                      <input type="text" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="Enter 6-digit OTP" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={forgotLoading} style={{ padding: '8px 12px' }}>{forgotLoading ? 'Verifying...' : 'Verify OTP'}</button>
                      <button type="button" onClick={() => { setForgotStage('email'); setForgotOtp(''); setForgotMsg(null); }} style={{ padding: '8px 12px' }}>Back</button>
                    </div>
                  </form>
                )}

                {forgotStage === 'change' && (
                  <form onSubmit={changePassword}>
                    <div style={{ marginBottom: 8 }}>
                      <input name="password" type="password" placeholder="New password" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <input name="password_confirmation" type="password" placeholder="Confirm new password" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={forgotLoading} style={{ padding: '8px 12px' }}>{forgotLoading ? 'Saving...' : 'Change Password'}</button>
                      <button type="button" onClick={() => { setForgotStage('email'); setForgotOtp(''); setResetToken(''); setForgotMsg(null); }} style={{ padding: '8px 12px' }}>Cancel</button>
                    </div>
                  </form>
                )}

                {forgotMsg && <div style={{ marginTop: 8, color: forgotMsg.toLowerCase().includes('failed') || forgotMsg.toLowerCase().includes('invalid') ? 'red' : 'green' }}>{forgotMsg}</div>}
              </div>
            )}
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
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                      <span>Already have account? </span>
                      <button type="button" onClick={handleShowLogin} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</button>
                    </div>
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
                        // always go to the MainScreen (root) after successful OTP
                        window.location.href = '/';
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