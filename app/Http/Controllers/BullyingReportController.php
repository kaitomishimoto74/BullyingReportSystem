<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BullyingReport;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class BullyingReportController extends Controller
{
    public function store(Request $request)
    {
        // validate important fields (adjust rules as needed)
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'reporter_name' => 'required|string|max:255',
            'reporter_phone' => 'nullable|string|max:255',
            'reporter_email' => 'nullable|email|max:255',
            'victim_names' => 'required|string',         // we convert array -> string in React
            'offender_names' => 'nullable|string',
            'bullying_type' => 'nullable|array',
            'bullying_explanation' => 'nullable|string',
            'bullying_location' => 'nullable|array',
            'victim_spoken_to' => 'nullable|array',
            'reporter_type' => 'nullable|array',         // you send as reporter_type[]
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        // generate unique ticket id in format: TMC-YYYYMMDDHHMMSS-#### (e.g. TMC-20251022145407-7133)
        do {
            $ticketId = 'TMC-' . date('YmdHis') . '-' . mt_rand(1000, 9999);
        } while (BullyingReport::where('ticket_id', $ticketId)->exists());

        // create model
        $report = new BullyingReport();
        $report->ticket_id = $ticketId;
        $report->date = $request->input('date');
        $report->reporter_name = $request->input('reporter_name');
        $report->reporter_phone = $request->input('reporter_phone');
        $report->reporter_email = $request->input('reporter_email');

        // reporter_type comes as array (reporter_type[])
        $report->reporter_type = $request->input('reporter_type') ? json_encode($request->input('reporter_type')) : null;

        // victim and offender are sent as single strings from React
        $report->victim_names = $request->input('victim_names');
        $report->offender_names = $request->input('offender_names');

        $report->bullying_type = $request->input('bullying_type') ? json_encode($request->input('bullying_type')) : null;
        $report->bullying_explanation = $request->input('bullying_explanation');
        $report->bullying_location = $request->input('bullying_location') ? json_encode($request->input('bullying_location')) : null;
        $report->bullying_location_other = $request->input('bullying_location_other');
        $report->victim_spoken_to = $request->input('victim_spoken_to') ? json_encode($request->input('victim_spoken_to')) : null;

        // default status (ensure migration has default)
        $report->status = $request->input('status', 'Pending');

        // optional: worked_by left null
        $report->save();

        // Return JSON for React
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Report successfully filed.',
                'ticket_id' => $ticketId,
            ], 201);
        }

        // For non-AJAX (blade) fallback
        return redirect()->back()->with([
            'reportSuccess' => ['message' => 'Report successfully filed.', 'ticketId' => $ticketId]
        ]);
    }

    public function search(Request $request)
    {
        $report = BullyingReport::where('ticket_id', $request->ticket_id)->first();

        return view('report_check', [
            'report' => $report,
            'searched' => true,
            'error' => $report ? null : 'Report not found.'
        ]);
    }

    public function searchJson(Request $request)
    {
        $report = BullyingReport::where('ticket_id', $request->ticket_id)->first();
        if (! $report) {
            return response()->json([], 404);
        }

        $assigned_fullname = null;
        if ($report->worked_by) {
            $user = \App\Models\User::find($report->worked_by);
            if ($user) {
                $assigned_fullname = $user->name
                    ?? trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
                if (! $assigned_fullname) {
                    $assigned_fullname = $user->username ?? null;
                }
            }
        }

        $data = $report->toArray();
        $data['assigned_fullname'] = $assigned_fullname;

        return response()->json($data);
    }
}
