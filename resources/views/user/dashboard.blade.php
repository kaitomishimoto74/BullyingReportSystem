<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>User Dashboard</title>
</head>
<body>
  <div id="user-dashboard-root"><!-- React will mount here --></div>

  <!-- Ensure your main JS bundle includes resources/js/UserDashboard.jsx -->
  <!-- In resources/js/app.js add: import './UserDashboard.jsx'; then run npm run dev -->
  @if (class_exists(\Illuminate\Foundation\Vite::class))
    @vite(['resources/js/app.js'])
  @else
    <script src="/js/app.js"></script>
  @endif

  <script>
    // inject authenticated user as plain array to the SPA
    window.CurrentUser = {!! json_encode(optional(auth()->user())->toArray() ?? []) !!};
  </script>
</body>
</html>