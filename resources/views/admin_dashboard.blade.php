<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Councilor Dashboard</title>
</head>
<body>
    <div id="react-dashboard-root" data-current-user='@json(Auth::user())'></div>
    @vite('resources/js/dashboard_app.jsx')
    <script>
      // expose current user and csrf for the React app
      window.CurrentUser = @json(Auth::user());
      window.Laravel = window.Laravel || {};
      window.Laravel.csrfToken = '{{ csrf_token() }}';
      window.Laravel.user = @json(Auth::user());
    </script>
    <script>
      // Example of how to use the csrfToken in a fetch request
      fetch('/some-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': window.Laravel.csrfToken,
        },
        body: JSON.stringify({/* your data here */})
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    </script>
</body>
</html>