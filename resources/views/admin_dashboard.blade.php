<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; }
        .navbar {
            background: #007bff;
            color: #fff;
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .nav-links a {
            color: #fff;
            margin-right: 20px;
            text-decoration: none;
            font-weight: bold;
        }
        .nav-links a:last-child { margin-right: 0; }
        .user-info { font-weight: bold; }
        .logout-btn {
            background: #dc3545;
            color: #fff;
            border: none;
            padding: 5px 15px;
            cursor: pointer;
            margin-left: 10px;
        }
        .container { padding: 30px; }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="nav-links">
            <a href="{{ route('admin.dashboard') }}">Home</a>
            <a href="{{ route('admin.reports') }}">File Reports</a>
            <a href="{{ route('admin.work') }}">Work</a>
        </div>
        <div class="user-info">
            Hello, {{ Auth::user()->username ?? 'Admin' }}
            <form method="POST" action="{{ route('admin.logout') }}" style="display:inline;">
                @csrf
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </div>
    <div class="container">
        @yield('content')
    </div>
</body>
</html>