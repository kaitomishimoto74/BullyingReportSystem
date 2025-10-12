<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Check Report Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
    </style>
</head>
<body>
    <h1>Bullying Reporting Incident Form</h1>
    <div style="background: #007bff; padding: 15px 0; margin-bottom: 30px;">
        <a href="{{ route('report.form') }}" style="color: #fff; font-weight: bold; margin: 0 30px; text-decoration: none; font-size: 18px;">
            File Case
        </a>
        <a href="{{ route('report.check') }}" style="color: #fff; font-weight: bold; margin: 0 30px; text-decoration: none; font-size: 18px;">
            Check Report
        </a>
    </div>

    <div style="text-align: center;">
        <h2>Check Report Status</h2>
        <form method="GET" action="{{ route('report.search') }}">
            <input type="text" name="ticket_id" placeholder="Enter your Ticket ID" required>
            <button type="submit" style="padding: 8px 20px; background: #007bff; color: #fff; border: none; border-radius: 4px;">Search</button>
        </form>

        @if(isset($searched) && $searched)
            @if($report)
                <div style="margin-top: 30px; border: 1px solid #ccc; border-radius: 8px; padding: 20px; background: #f9f9f9; display: inline-block;">
                    <p>Ticket ID: <strong>{{ $report->ticket_id }}</strong></p>
                    <p>Status: <strong>{{ $report->status ?? 'Pending' }}</strong></p>
                    @if($report->worked_by)
                        <p>Assigned to: 
                            <strong>
                                {{ \App\Models\User::find($report->worked_by)->username ?? 'Unknown' }}
                            </strong>
                        </p>
                    @else
                        <p>Assigned to: <strong>Not yet assigned</strong></p>
                    @endif
                    <!-- Add more details as needed -->
                </div>
            @else
                <div style="color: #dc3545; font-weight: bold; margin-top: 20px;">
                    {{ $error }}
                </div>
            @endif
        @endif
    </div>

    @if(session('error'))
        <div style="color: #dc3545; font-weight: bold; margin-bottom: 10px;">
            {{ session('error') }}
        </div>
    @endif

    <p style="text-align: center; margin-bottom: 20px;">
        <a href="{{ route('main') }}" style="color: #007bff; font-weight: bold; text-decoration: none;">Return to Main Screen</a>
    </p>
</body>
</html>