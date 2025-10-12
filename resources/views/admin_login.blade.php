@if(session('error'))
    <div style="color: #dc3545; font-weight: bold; margin-bottom: 10px;">
        {{ session('error') }}
    </div>
@endif

<form method="POST" action="{{ route('admin.login.submit') }}">
    @csrf
    <label>Email or Username</label>
    <input type="text" name="login" required>
    <label>Password</label>
    <input type="password" name="password" required>
    <button type="submit">Login</button>
</form>
<p>
    Don't have an account?
    <a href="{{ route('admin.register') }}">Sign up</a>
</p>
<p>
    <a href="{{ route('main') }}">Return to Main Screen</a>
</p>