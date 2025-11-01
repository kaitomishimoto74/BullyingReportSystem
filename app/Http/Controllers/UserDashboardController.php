<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user || ($user->role ?? null) !== 'user') {
            abort(403, 'Forbidden. Users only.');
        }

        return view('user.dashboard', compact('user'));
    }
}