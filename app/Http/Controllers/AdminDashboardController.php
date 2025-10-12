<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return view('admin_dashboard');
    }

    public function reports(Request $request)
    {
        $query = \App\Models\BullyingReport::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('ticket_id', 'like', "%$search%")
                  ->orWhere('victim_names', 'like', "%$search%")
                  ->orWhere('offender_names', 'like', "%$search%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return view('admin_reports', compact('reports'));
    }

    public function preview($id)
    {
        $report = \App\Models\BullyingReport::findOrFail($id);
        return view('admin_report_preview', compact('report'));
    }

    public function work($id)
    {
        $report = \App\Models\BullyingReport::findOrFail($id);

        // Only allow if not already worked by someone
        if ($report->worked_by === null) {
            $report->status = 'Processing';
            $report->worked_by = auth()->id();
            $report->save();
        }

        return redirect()->route('admin.work');
    }

    public function workList()
    {
        $reports = \App\Models\BullyingReport::where('worked_by', auth()->id())->get();
        return view('admin_work', compact('reports'));
    }
    public function complete($id)
    {
        $report = \App\Models\BullyingReport::findOrFail($id);
        if ($report->worked_by == auth()->id()) {
            $report->status = 'Completed';
            $report->save();
        }
        return redirect()->route('admin.work');
    }
}
