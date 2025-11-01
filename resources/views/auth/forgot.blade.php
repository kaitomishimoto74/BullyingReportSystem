<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Forgot Password</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:30px}
    .card{max-width:420px;margin:40px auto;padding:18px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
    .field{margin-bottom:12px}
    input[type="email"],input[type="text"],input[type="password"]{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box}
    button{padding:10px 14px;border-radius:6px;border:none;background:#007bff;color:#fff;cursor:pointer}
    button.secondary{background:#6c757d}
    .muted{color:#666;font-size:13px}
    .msg{margin-top:10px;font-size:14px}
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin-top:0;margin-bottom:8px">Reset your password</h2>
    <div id="steps">
      <!-- step content injected by JS -->
    </div>
    <div style="margin-top:12px; text-align:center;">
      <a href="/" style="color:#007bff;text-decoration:underline">Back to Sign in</a>
    </div>
  </div>

<script>
(function(){
  const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const stepsEl = document.getElementById('steps');
  let email = '';
  let resetToken = '';

  function renderEmailStep(msg){
    stepsEl.innerHTML = `
      <form id="emailForm">
        <div class="field">
          <label class="muted">Enter account email</label>
          <input type="email" name="email" required placeholder="you@example.com" />
        </div>
        <div style="display:flex;gap:8px">
          <button type="submit">Send OTP</button>
          <button type="button" class="secondary" id="cancelEmail">Cancel</button>
        </div>
        <div id="msg" class="msg">${msg||''}</div>
      </form>
    `;
    document.getElementById('cancelEmail').addEventListener('click', ()=> window.location = '/');
    document.getElementById('emailForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const form = e.target;
      const v = form.email.value.trim();
      if (!v) return showMsg('Please enter your email.', true);
      showMsg('Sending OTP...');
      try {
        const body = new URLSearchParams(); body.append('email', v);
        const res = await fetch('/password/forgot/send-otp', {
          method:'POST', body, credentials:'same-origin',
          headers:{ 'X-CSRF-TOKEN': csrf, 'X-Requested-With':'XMLHttpRequest','Accept':'application/json' }
        });
        const data = await res.json().catch(()=>null);
        if (res.ok && data && data.success) {
          email = v;
          renderOtpStep('OTP sent to your email.');
        } else {
          showMsg((data && data.message) || ('Failed to send OTP ('+res.status+')'), true);
        }
      } catch (err) {
        console.error(err);
        showMsg('Request failed. See console.', true);
      }
    });
  }

  function renderOtpStep(msg){
    stepsEl.innerHTML = `
      <form id="otpForm">
        <div class="field muted">OTP sent to: <strong>${escapeHtml(email)}</strong></div>
        <div class="field">
          <input type="text" name="otp" inputmode="numeric" pattern="[0-9]*" placeholder="Enter 6-digit OTP" required />
        </div>
        <div style="display:flex;gap:8px">
          <button type="submit">Verify OTP</button>
          <button type="button" class="secondary" id="backToEmail">Back</button>
        </div>
        <div id="msg" class="msg">${msg||''}</div>
      </form>
    `;
    document.getElementById('backToEmail').addEventListener('click', ()=> renderEmailStep());
    document.getElementById('otpForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const otp = e.target.otp.value.trim();
      if (!otp) return showMsg('Provide the OTP.', true);
      showMsg('Verifying OTP...');
      try {
        const body = new URLSearchParams(); body.append('email', email); body.append('otp', otp);
        const res = await fetch('/password/forgot/verify-otp', {
          method:'POST', body, credentials:'same-origin',
          headers:{ 'X-CSRF-TOKEN': csrf, 'X-Requested-With':'XMLHttpRequest','Accept':'application/json' }
        });
        const data = await res.json().catch(()=>null);
        if (res.ok && data && data.success) {
          resetToken = data.reset_token || '';
          renderChangeStep('OTP verified. Enter a new password.');
        } else {
          showMsg((data && data.message) || ('OTP verification failed ('+res.status+')'), true);
        }
      } catch (err) {
        console.error(err);
        showMsg('Request failed. See console.', true);
      }
    });
  }

  function renderChangeStep(msg){
    stepsEl.innerHTML = `
      <form id="changeForm">
        <div class="field">
          <input name="password" type="password" placeholder="New password (min 6 chars)" required />
        </div>
        <div class="field">
          <input name="password_confirmation" type="password" placeholder="Confirm new password" required />
        </div>
        <div style="display:flex;gap:8px">
          <button type="submit">Change Password</button>
          <button type="button" class="secondary" id="cancelChange">Cancel</button>
        </div>
        <div id="msg" class="msg">${msg||''}</div>
      </form>
    `;
    document.getElementById('cancelChange').addEventListener('click', ()=> renderEmailStep());
    document.getElementById('changeForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const pw = e.target.password.value;
      const pwc = e.target.password_confirmation.value;
      if (!pw || pw.length < 6) return showMsg('Password must be at least 6 characters.', true);
      if (pw !== pwc) return showMsg('Passwords do not match.', true);
      showMsg('Saving new password...');
      try {
        const body = new URLSearchParams();
        body.append('token', resetToken);
        body.append('password', pw);
        body.append('password_confirmation', pwc);
        const res = await fetch('/password/forgot/change', {
          method:'POST', body, credentials:'same-origin',
          headers:{ 'X-CSRF-TOKEN': csrf, 'X-Requested-With':'XMLHttpRequest','Accept':'application/json' }
        });
        const data = await res.json().catch(()=>null);
        if (res.ok && data && data.success) {
          showMsg('Password changed. Redirecting to sign in...');
          setTimeout(()=> window.location = '/', 1200);
        } else {
          showMsg((data && data.message) || ('Failed to change password ('+res.status+')'), true);
        }
      } catch (err) {
        console.error(err);
        showMsg('Request failed. See console.', true);
      }
    });
  }

  function showMsg(text, isError){
    const el = document.getElementById('msg');
    if (el) {
      el.textContent = text || '';
      el.style.color = isError ? 'red' : 'green';
    }
  }

  // small helper to avoid XSS
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); }); }

  // initial render
  renderEmailStep();
})();
</script>
</body>
</html>