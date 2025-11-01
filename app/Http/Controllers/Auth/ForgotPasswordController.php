<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\User;

class ForgotPasswordController extends Controller
{
    public function sendReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'No user found with that email.'], 404);
        }

        // generate temporary password
        $temp = Str::random(10);
        $user->password = bcrypt($temp);
        $user->save();

        // NOTE: insecure to return password in JSON in production.
        // Replace with mail sending using Notification/Mailable in real app.
        return response()->json([
            'success' => true,
            'message' => 'Password has been reset. Use the temporary password below to log in and change it.',
            'temporary_password' => $temp
        ], 200);
    }
}