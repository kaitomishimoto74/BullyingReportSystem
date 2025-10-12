@extends('admin_dashboard')

@section('content')
    <h2>Report Preview</h2>
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 20px; background: #f9f9f9;">
        <p><strong>Ticket ID:</strong> {{ $report->ticket_id }}</p>
        <p><strong>Status:</strong> {{ $report->status }}</p>
        <p><strong>Date:</strong> {{ $report->date }}</p>
        <p><strong>Victim(s):</strong> {{ $report->victim_names }}</p>
        <p><strong>Offender(s):</strong> {{ $report->offender_names }}</p>
        <p><strong>Type of Bullying:</strong> {{ implode(', ', json_decode($report->bullying_type ?? '[]')) }}</p>
        <p><strong>Explanation:</strong> {{ $report->bullying_explanation }}</p>
        <p><strong>Location:</strong> {{ implode(', ', json_decode($report->bullying_location ?? '[]')) }}</p>
        <p><strong>Other Location:</strong> {{ $report->bullying_location_other }}</p>
        <p><strong>People Victim Spoke To:</strong> {{ implode(', ', json_decode($report->victim_spoken_to ?? '[]')) }}</p>
        <p><strong>Reported By:</strong> {{ $report->reporter_name }}</p>
        <a href="{{ route('admin.reports') }}">Back to Reports</a>
    </div>
@endsection