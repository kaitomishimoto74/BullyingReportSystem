<form method="POST" action="{{ route('admin.register.submit') }}">
    @csrf
    <input type="hidden" name="name" value="{{ old('first_name') }} {{ old('last_name') }}">
    <label>First Name</label>
    <input type="text" name="first_name" value="{{ old('first_name') }}" required>
    <label>Last Name</label>
    <input type="text" name="last_name" value="{{ old('last_name') }}" required>
    <label>Username</label>
    <input type="text" name="username" required>
    <label>Email</label>
    <input type="email" name="email" required>
    <label>Password</label>
    <input type="password" name="password" required>
    <button type="submit">Register</button>
</form>

<p>
    Already have an account?
    <a href="{{ route('admin.login') }}">Sign in</a>
</p>