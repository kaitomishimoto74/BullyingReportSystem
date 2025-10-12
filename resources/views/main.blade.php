<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TMC Bullying Report Management System</title>
    <style>
        body { text-align: center; margin-top: 100px; font-family: Arial, sans-serif; }
        .btn { padding: 10px 30px; font-size: 16px; margin: 10px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>TMC Bullying Report Management System</h1>
    <div>
        <a href="{{ route('admin.login') }}" class="btn" style="background: #007bff; color: #fff; text-decoration: none;">Login</a>
        <a href="{{ route('report.form') }}" class="btn" style="background: #28a745; color: #fff; text-decoration: none;">File Case</a>
    </div>
</body>
</html>