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