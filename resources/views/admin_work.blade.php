@extends('admin_dashboard')

@section('content')
    <h2>My Work</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        @forelse($reports as $report)
            <div style="border: 1px solid #ccc; border-radius: 8px; padding: 20px; width: 300px; background: #f9f9f9;">
                <div style="font-weight: bold; font-size: 18px;">Ticket ID: {{ $report->ticket_id }}</div>
                <div>Status: <span style="color: {{ $report->status == 'Pending' ? '#dc3545' : ($report->status == 'Completed' ? '#28a745' : '#ffc107') }};">{{ $report->status }}</span></div>
                <div style="margin-top: 10px;">
                    <a href="{{ route('admin.report.preview', $report->id) }}" style="padding: 5px 15px; background: #007bff; color: #fff; border-radius: 4px; text-decoration: none;">Preview</a>
                    <!-- You can add a button to mark as completed -->
                    <form method="POST" action="{{ route('admin.report.complete', $report->id) }}" style="display:inline;">
                        @csrf
                        <button type="submit" style="padding: 5px 15px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Mark as Completed</button>
                    </form>
                </div>
            </div>
        @empty
            <div>No reports assigned to you.</div>
        @endforelse
    </div>
@endsection