<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CouncilorPanelController extends Controller
{
    /**
     * Show councilor dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user || (($user->role ?? null) !== 'councilor' && ($user->role ?? null) !== 'admin')) {
            // allow admin to preview councilor view if needed, otherwise forbid
            abort(403, 'Forbidden. Councilors only.');
        }

        // Pass the authenticated user to the view so React can read it
        return view('admin_dashboard', ['currentUser' => $user]);
    }
}