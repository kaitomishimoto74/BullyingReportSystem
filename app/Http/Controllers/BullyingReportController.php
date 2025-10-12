<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BullyingReport;

class BullyingReportController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'reporter_name' => 'required|string',
            'reporter_phone' => 'nullable|string',
            'reporter_email' => 'nullable|email',
            'reporter_type' => 'nullable|array',
            'victim_names' => 'required|string',
            'offender_names' => 'nullable|string',
            'offender_age' => 'nullable|string',
            'offender_is_student' => 'nullable|string',
            'bullying_type' => 'nullable|array',
            'bullying_explanation' => 'nullable|string',
            'bullying_location' => 'nullable|array',
            'bullying_location_other' => 'nullable|string',
            'victim_spoken_to' => 'nullable|array',
        ]);

        // Generate unique TicketID
        $data['ticket_id'] = 'TMC-' . now()->format('YmdHis') . '-' . rand(1000,9999);

        // Save arrays as JSON
        $data['reporter_type'] = json_encode($request->reporter_type);
        $data['bullying_type'] = json_encode($request->bullying_type);
        $data['bullying_location'] = json_encode($request->bullying_location);
        $data['victim_spoken_to'] = json_encode($request->victim_spoken_to);

        // Save to database
        $report = \App\Models\BullyingReport::create($data);

        return redirect()->back()->with([
            'success' => 'Report submitted successfully!',
            'ticket_id' => $data['ticket_id']
        ]);
    }

    public function search(Request $request)
    {
        $report = \App\Models\BullyingReport::where('ticket_id', $request->ticket_id)->first();

        if ($report) {
            return view('report_status', compact('report'));
        } else {
            return redirect()->back()->with('error', 'Ticket ID not found.');
        }
    }
}
