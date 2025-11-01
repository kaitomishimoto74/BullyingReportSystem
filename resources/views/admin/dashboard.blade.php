<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Dashboard</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 24px;">
  <h1>Admin Dashboard</h1>
  <p>Welcome, {{ $user->name ?? $user->username ?? 'Admin' }} (role: {{ $user->role }})</p>

  <div style="margin-top:16px;">
    <div><strong>Total users:</strong> {{ $usersCount }}</div>
    <div style="margin-top:8px;"><strong>Total reports:</strong> {{ $reportsCount }}</div>
  </div>

  <div style="margin-top:20px;">
    <form method="POST" action="{{ route('admin.logout') }}">
      @csrf
      <button type="submit">Logout</button>
    </form>
  </div>
</body>
</html>