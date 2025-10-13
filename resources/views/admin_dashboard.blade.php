<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
</head>
<body>
    <div id="react-dashboard-root"></div>
    @vite('resources/js/dashboard_app.jsx')
    <script>
      window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        username: "{{ Auth::user()->username }}"
      };
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