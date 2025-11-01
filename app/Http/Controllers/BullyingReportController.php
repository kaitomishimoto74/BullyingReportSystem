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
        // validate important fields
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            // reporter_name no longer required; SPA provides reporter_school_id
            'reporter_school_id' => 'required|string|max:255',
            'reporter_phone' => 'nullable|digits:11',
            'reporter_email' => 'nullable|email|max:255',
            'victim_names' => 'required|string',
            'offender_names' => 'nullable|string',
            'bullying_type' => 'nullable|array',
            'bullying_explanation' => 'nullable|string',
            'bullying_location' => 'nullable|array',
            'victim_spoken_to' => 'nullable|array',
            'reporter_type' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        // generate unique ticket id
        do {
            $ticketId = 'TMC-' . date('YmdHis') . '-' . mt_rand(1000, 9999);
        } while (BullyingReport::where('ticket_id', $ticketId)->exists());

        // create model
        $report = new BullyingReport();
        $report->ticket_id = $ticketId;
        $report->date = $request->input('date');

        $authUser = $request->user();
        $providedReporterName = $request->input('reporter_name'); // optional if present
        $providedSchoolId = $request->input('reporter_school_id');

        // set reporter_name: prefer auth user name/email, fall back to provided reporter_name, then school id
        $report->reporter_name = $authUser
            ? ($authUser->name ?? $authUser->email)
            : ($providedReporterName ?? $providedSchoolId);

        // set phone and email (use auth email if not provided)
        $report->reporter_phone = $request->input('reporter_phone');
        $report->reporter_email = $request->input('reporter_email') ?? ($authUser ? $authUser->email : null);

        // persist school id if your reports table has column; uncomment if column exists:
        // $report->reporter_school_id = $providedSchoolId;
        // or map to school_id if present:
        // $report->school_id = $providedSchoolId;

        $report->reporter_type = $request->input('reporter_type') ? json_encode($request->input('reporter_type')) : null;

        $report->victim_names = $request->input('victim_names');
        $report->offender_names = $request->input('offender_names');

        $report->bullying_type = $request->input('bullying_type') ? json_encode($request->input('bullying_type')) : null;
        $report->bullying_explanation = $request->input('bullying_explanation');
        $report->bullying_location = $request->input('bullying_location') ? json_encode($request->input('bullying_location')) : null;
        $report->bullying_location_other = $request->input('bullying_location_other');
        $report->victim_spoken_to = $request->input('victim_spoken_to') ? json_encode($request->input('victim_spoken_to')) : null;

        $report->status = $request->input('status', 'Pending');

        $report->save();

        // guide + redirect
        $guide = [
            'headline' => 'Report submitted',
            'steps' => [
                'Keep your Ticket ID safe. You will need it to check the status.',
            ],
            'note' => 'To check the report, click "Check Report" on the left side.'
        ];

        $redirectUrl = url('/report/search?ticket_id=' . urlencode($ticketId));

        // Return JSON for AJAX only; otherwise redirect to the report page (prevents raw JSON being rendered)
        $isXhr = $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest';
        if ($isXhr) {
            return response()->json([
                'success' => true,
                'message' => 'Report successfully filed.',
                'note' => $guide['note'],
                'ticket_id' => $ticketId,
                'guide' => $guide,
                'redirect' => $redirectUrl,
            ], 201);
        }

        return redirect($redirectUrl)->with([
            'reportSuccess' => [
                'message' => 'Report successfully filed.',
                'note' => $guide['note'],
                'ticketId' => $ticketId
            ]
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
