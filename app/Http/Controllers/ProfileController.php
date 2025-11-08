<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    // POST /profile/update
    public function update(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $v = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'school_id'  => 'nullable|string|max:255',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        }

        $user->first_name = $request->input('first_name');
        $user->last_name  = $request->input('last_name');

        // Always compose the name from first + last
        $full = trim( ($user->first_name ?? '') . ' ' . ($user->last_name ?? '') );
        $user->name = $full ?: $user->name;

        if ($request->filled('school_id')) {
            $user->school_id = $request->input('school_id');
        }

        $user->save();

        // ensure auth user reflects changes
        Auth::setUser($user);

        return response()->json(['success' => true, 'message' => 'Profile updated', 'user' => $user->fresh()], 200);
    }

    // POST /profile/password
    public function changePassword(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $v = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => 'required|string|min:6|confirmed',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        }

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect.'], 422);
        }

        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json(['success' => true, 'message' => 'Password changed.'], 200);
    }
}