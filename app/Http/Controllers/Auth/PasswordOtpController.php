<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class PasswordOtpController extends Controller
{
    // POST /password/forgot/send-otp
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = $request->email;
        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'No account found for that email.'], 404);
        }

        $otp = random_int(100000, 999999);
        $ttlSeconds = 10 * 60; // 10 minutes
        Cache::put('password_otp:' . $email, ['otp' => (string)$otp], $ttlSeconds);

        // send email (simple plain text). Ensure mail is configured in your environment.
        try {
            Mail::raw("Your password reset OTP is: {$otp}. It expires in 10 minutes.", function ($m) use ($email) {
                $m->to($email)->subject('Password Reset OTP');
            });
        } catch (\Throwable $e) {
            // If mail fails, still return success but log — developer can inspect logs.
            \Log::error('Failed to send OTP email: ' . $e->getMessage());
        }

        return response()->json(['success' => true, 'message' => 'OTP sent to your email.'], 200);
    }

    // POST /password/forgot/verify-otp
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string'
        ]);

        $email = $request->email;
        $payload = Cache::get('password_otp:' . $email);
        if (! $payload || ! isset($payload['otp']) || $payload['otp'] !== (string)$request->otp) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP.'], 422);
        }

        // consume OTP
        Cache::forget('password_otp:' . $email);

        // issue short-lived reset token
        $token = Str::random(64);
        Cache::put('password_reset_token:' . $token, $email, 15 * 60); // 15 minutes

        $redirect = url('/password/change?token=' . urlencode($token));

        return response()->json([
            'success' => true,
            'message' => 'OTP verified. Proceed to change password.',
            'reset_token' => $token,
            'redirect' => $redirect
        ], 200);
    }

    // POST /password/forgot/change
    public function changePassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed'
        ]);

        $token = $request->token;
        $email = Cache::get('password_reset_token:' . $token);
        if (! $email) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired reset token.'], 422);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // consume the token
        Cache::forget('password_reset_token:' . $token);

        return response()->json(['success' => true, 'message' => 'Password changed. You can now sign in.'], 200);
    }
}