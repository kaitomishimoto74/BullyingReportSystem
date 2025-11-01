<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>User Dashboard</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 24px;">
  <h1>User Dashboard</h1>
  <p>Welcome, {{ $user->name ?? $user->email }}</p>

  <div style="margin-top:20px; max-width:420px;">
    <a
      href="/report_form"
      style="
        display:block;
        padding:12px 20px;
        font-size:16px;
        background:#28a745;
        color:#fff;
        border-radius:6px;
        text-decoration:none;
        text-align:center;
      "
    >
      File Case
    </a>
  </div>
</body>
</html>