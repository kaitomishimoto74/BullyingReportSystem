<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminPanelController extends Controller
{
    /**
     * Show admin dashboard.
     * Only allow users with role === 'admin'.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user || ($user->role ?? null) !== 'admin') {
            abort(403, 'Forbidden. Admins only.');
        }

        // safe stats: wrap DB calls to avoid fatal errors if tables missing
        try {
            $usersCount = User::count();
        } catch (\Throwable $e) {
            $usersCount = 0;
        }

        try {
            $reportsCount = DB::table('reports')->count();
        } catch (\Throwable $e) {
            $reportsCount = 0;
        }

        return view('admin.dashboard', compact('user', 'usersCount', 'reportsCount'));
    }

    public function summaryJson()
    {
        // users
        $totalUsers = User::where('role', '<>', 'admin')->count();
        // reporters are accounts with role = 'user'
        $totalReporters = User::where('role', 'user')->count();
        $totalCouncilors = User::where('role', 'councilor')->count();

        // reports — try common model/table names
        $totalReports = 0;
        $pending = 0;
        $completed = 0;

        if (class_exists(\App\Models\BullyingReport::class)) {
            $model = \App\Models\BullyingReport::class;
            $totalReports = $model::count();
            if (Schema::hasColumn('bullying_reports', 'status')) {
                $pending = $model::where('status', 'pending')->count();
                $completed = $model::where('status', 'completed')->count();
            }
        } else {
            if (Schema::hasTable('reports')) {
                $totalReports = DB::table('reports')->count();
                if (Schema::hasColumn('reports', 'status')) {
                    $pending = DB::table('reports')->where('status', 'pending')->count();
                    $completed = DB::table('reports')->where('status', 'completed')->count();
                }
            } elseif (Schema::hasTable('bullying_reports')) {
                $totalReports = DB::table('bullying_reports')->count();
                if (Schema::hasColumn('bullying_reports', 'status')) {
                    $pending = DB::table('bullying_reports')->where('status', 'pending')->count();
                    $completed = DB::table('bullying_reports')->where('status', 'completed')->count();
                }
            }
        }

        return response()->json([
            'total_users' => $totalUsers,
            'total_reporters' => $totalReporters,
            'total_councilors' => $totalCouncilors,
            'total_reports' => $totalReports,
            'pending_reports' => $pending,
            'completed_reports' => $completed,
        ]);
    }
}