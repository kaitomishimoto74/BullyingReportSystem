@extends('admin_dashboard')

@section('content')
    @if(session('success'))
        <div style="color: green; font-weight: bold; margin-bottom: 20px;">
            {{ session('success') }}
        </div>
    @endif

    <h2>Report Preview</h2>
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 20px; background: #f9f9f9;">
        <p><strong>Ticket ID:</strong> {{ $report->ticket_id }}</p>
        <p><strong>Status:</strong> {{ $report->status }}</p>
        <p><strong>Date:</strong> {{ $report->date }}</p>
        <p><strong>Reporter Phone:</strong> {{ $report->reporter_phone ?? 'N/A' }}</p>
        <p><strong>Reporter Email:</strong> {{ $report->reporter_email ?? 'N/A' }}</p>        
        @if($report->worked_by)
            <p><strong>Assigned to:</strong>
                {{ \App\Models\User::find($report->worked_by)->username ?? 'Unknown' }}
            </p>
        @else
            <p><strong>Assigned to:</strong> Not yet assigned</p>
        @endif
        <p><strong>Victim(s):</strong> {{ $report->victim_names }}</p>
        <p><strong>Offender(s):</strong> {{ $report->offender_names }}</p>

        @php
          $bullyingTypes = json_decode($report->bullying_type ?? '[]', true);
        @endphp
        <p><strong>Type of Bullying:</strong>
          {{ is_array($bullyingTypes) && !empty($bullyingTypes) ? implode(', ', $bullyingTypes) : 'N/A' }}
        </p>

        <p><strong>Explanation:</strong> {{ $report->bullying_explanation }}</p>

        @php
          $bullyingLocations = json_decode($report->bullying_location ?? '[]', true);
        @endphp
        <p><strong>Location:</strong>
          {{ is_array($bullyingLocations) && !empty($bullyingLocations) ? implode(', ', $bullyingLocations) : 'N/A' }}
        </p>

        <p><strong>Other Location:</strong> {{ $report->bullying_location_other }}</p>

        @php
          $victimSpokenTo = json_decode($report->victim_spoken_to ?? '[]', true);
        @endphp
        <p><strong>People Victim Spoke To:</strong>
          {{ is_array($victimSpokenTo) && !empty($victimSpokenTo) ? implode(', ', $victimSpokenTo) : 'N/A' }}
        </p>

        <p><strong>Reported By:</strong> {{ $report->reporter_name }}</p>
        <a href="{{ route('admin.reports') }}">Back to Reports</a>
    </div>

    <form method="POST" action="{{ route('admin.report.complete', ['id' => $report->id]) }}">
        @csrf
        <button type="submit" style="padding: 10px 30px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
            Mark as Completed
        </button>
    </form>
@endsection