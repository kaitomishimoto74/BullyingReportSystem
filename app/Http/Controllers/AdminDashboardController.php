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
}
