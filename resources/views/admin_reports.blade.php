@extends('admin_dashboard')

@section('content')
    <h2>File Reports</h2>
    <form method="GET" action="{{ route('admin.reports') }}" class="search-bar">
        <input type="text" name="search" placeholder="Search by Ticket ID, Victim, Offender, etc." value="{{ request('search') }}">
        <button type="submit">Search</button>
        <button type="submit" name="status" value="Pending" class="filter-btn">Pending</button>
        <button type="submit" name="status" value="Completed" class="filter-btn">Completed</button>
    </form>

    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        @forelse($reports as $report)
            <div style="border: 1px solid #ccc; border-radius: 8px; padding: 20px; width: 300px; background: #f9f9f9; position: relative;">
                <div style="font-weight: bold; font-size: 18px;">Ticket ID: {{ $report->ticket_id }}</div>
                <div>Status: <span style="color: {{ $report->status == 'Pending' ? '#dc3545' : '#28a745' }};">{{ $report->status }}</span></div>
                <div style="margin-top: 10px;">
                    <form method="GET" action="{{ route('admin.report.preview', $report->id) }}" style="display:inline;">
                        <button type="submit" style="padding: 5px 15px; background: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Preview</button>
                    </form>
                    <form method="POST" action="{{ route('admin.report.work', $report->id) }}" style="display:inline;">
                        @csrf
                        <button type="submit"
                            style="padding: 5px 15px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
                            {{ $report->worked_by ? 'disabled' : '' }}>
                            Work
                        </button>
                    </form>
                    @if($report->worked_by)
                        <span style="color: #888; font-size: 12px;">Already assigned</span>
                    @endif
                </div>
            </div>
        @empty
            <div>No reports found.</div>
        @endforelse
    </div>
@endsection