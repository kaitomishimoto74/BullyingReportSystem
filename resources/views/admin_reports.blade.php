@extends('admin_dashboard')

@section('content')
    <h2>File Reports</h2>
    <form method="GET" action="{{ route('admin.reports') }}" class="search-bar">
        <input type="text" name="search" placeholder="Search by Ticket ID, Victim, Offender, etc." value="{{ request('search') }}">
        <button type="submit">Search</button>
        <button type="submit" name="status" value="Pending" class="filter-btn">Pending</button>
        <button type="submit" name="status" value="Completed" class="filter-btn">Completed</button>
    </form>

    <table>
        <thead>
            <tr>
                <!-- Example table header -->
                <th>Ticket ID</th>
                <th>Victim</th>
                <th>Offender</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($reports as $report)
                <!-- Example table body -->
                <tr>
                    <td>{{ $report->ticket_id }}</td>
                    <td>{{ $report->victim_names }}</td>
                    <td>{{ $report->offender_names }}</td>
                    <td>{{ $report->status }}</td>
                    <td>{{ $report->date }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection