<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TMC Bullying Report Management System</title>
</head>
<body>
    <div id="react-root"></div>
    @vite('resources/js/app.jsx')
    <script>
      window.backendErrors = {
        login: @json(session('error')),
        register: @json(session('register_error'))
      };
    </script>
    <script>
      window.Laravel = {
        csrfToken: '{{ csrf_token() }}'
      };
    </script>
</body>
</html>