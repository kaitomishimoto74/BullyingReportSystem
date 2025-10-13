<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bullying Reporting Incident Form</title>
</head>
<body>
    <div id="react-report-root"></div>
    @vite('resources/js/report_form_app.jsx')
    <script>
      window.Laravel = {
        csrfToken: '{{ csrf_token() }}'
      };
    </script>
    <script>
      window.reportSuccess = {
        message: @json(session('success')),
        ticketId: @json(session('ticket_id'))
      };
    </script>
</body>
</html>