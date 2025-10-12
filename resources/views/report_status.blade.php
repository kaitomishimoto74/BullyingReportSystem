<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Report Status</title>
</head>
<body>
    <h1>Report Status</h1>
    <p>Ticket ID: <strong>{{ $report->ticket_id }}</strong></p>
    <p>Status: <strong>{{ $report->status ?? 'Pending' }}</strong></p>
    <!-- Add more details as needed -->
    <a href="{{ route('report.form') }}">Back to Report Form</a>
</body>
</html>