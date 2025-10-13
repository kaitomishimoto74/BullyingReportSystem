import React, { useState } from 'react';

export default function MainScreen() {
  const [showRegister, setShowRegister] = useState(false);

  // Read errors from backend (window object)
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
          <form method="POST" action="/admin/register" style={{ width: '100%' }}>
            <input type="hidden" name="_token" value={window.Laravel.csrfToken} />
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register</h2>
            {registerError && (
              <div style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
                {registerError}
              </div>
            )}
            <div style={{ marginBottom: '15px' }}>
              <input type="text" name="first_name" placeholder="First Name" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" name="last_name" placeholder="Last Name" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" name="username" placeholder="Username" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="email" name="email" placeholder="Email" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="password" name="password" placeholder="Password" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Register</button>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <span>Already have account? </span>
              <button type="button" onClick={handleShowLogin} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</button>
            </div>
          </form>
        )}
      </div>
      <div style={{ marginTop: '40px', width: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <a
          href="/report_form"
          style={{
            padding: '10px 30px',
            fontSize: '16px',
            background: '#28a745',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none',
            marginBottom: '10px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          File Case
        </a>
      </div>
    </div>
  );
}