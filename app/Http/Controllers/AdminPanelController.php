<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
}