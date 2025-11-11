<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Mail\VerifyOtpMail;

class AdminAuthController extends Controller
{
    public function register(Request $request)
    {
        // only allow reporter (user) or councilor
        $role = $request->input('role', 'reporter');
        if (! in_array($role, ['reporter', 'councilor'], true)) {
            return $request->wantsJson()
                ? response()->json(['message' => 'Invalid role.'], 422)
                : back()->with('error', 'Invalid role.');
        }

        if ($role === 'reporter') {
            $data = $request->validate([
                'school_id' => ['required','regex:/^\d{2}-\d{6}$/'],
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            // create pending user (email not verified yet)
            $otp = (string) random_int(100000, 999999);
            $expires = Carbon::now()->addMinutes(15);

            $user = User::create([
                'name' => $data['email'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'user',
                'school_id' => $data['school_id'],
                'email_verification_token' => $otp,
                'otp_expires_at' => $expires,
            ]);

            // send OTP email
            try {
                Mail::to($user->email)->send(new VerifyOtpMail($otp, 15));
            } catch (\Throwable $e) {
                // swallow send error but inform front-end
            }

            // return success — frontend will show OTP input
            return $request->wantsJson()
                ? response()->json(['message' => 'OTP sent to email', 'email' => $user->email], 201)
                : redirect()->route('main')->with('success', 'OTP sent to your email.');
        }

        // councilor as before
        $data = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $data['first_name'] . ' ' . $data['last_name'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'councilor',
            'email_verification_token' => null,
            'otp_expires_at' => null,
        ]);

        return $request->wantsJson()
            ? response()->json(['message' => 'Councilor registered.'], 201)
            : redirect()->route('main')->with('success', 'Councilor registered. You may now log in.');
    }

    // new endpoint: verify OTP
    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        // ensure token and expiry exist
        if (empty($user->email_verification_token) || empty($user->otp_expires_at)) {
            return response()->json(['message' => 'No pending verification found.'], 422);
        }

        // parse expiry safely (casts help but be defensive)
        try {
            $expiresAt = $user->otp_expires_at instanceof Carbon ? $user->otp_expires_at : Carbon::parse($user->otp_expires_at);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid OTP state.'], 422);
        }

        if ($expiresAt->lt(Carbon::now())) {
            return response()->json(['message' => 'OTP expired. Request a new code.'], 422);
        }

        if (! hash_equals((string)$user->email_verification_token, (string)$data['otp'])) {
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        // verify and clear token (do NOT log user in)
        $user->email_verified_at = Carbon::now();
        $user->email_verification_token = null;
        $user->otp_expires_at = null;
        $user->save();

        // Redirect user to login page to sign in after verification
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Email verified. Please login.', 'redirect' => url('/admin/login')], 200);
        }

        return redirect('/admin/login')->with('success', 'Email verified. Please login.');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login_type = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$login_type => $request->login, 'password' => $request->password])) {
            $user = Auth::user();

            // If councilor is not approved, log out and send to access denied page
            if (($user->role ?? '') === 'councilor') {
                if (! ($user->is_approved ?? false)) {
                    Auth::logout();
                    if ($request->wantsJson()) {
                        return response()->json([
                            'message' => 'Access denied. Account not approved.',
                            'redirect' => route('access.denied')
                        ], 403);
                    }
                    return redirect()->route('access.denied');
                }
                // approved councilor -> redirect to the frontend page that mounts js/Dashboard.jsx
                return redirect()->to('/dashboard');
            }

            // Redirect based on role
            $role = $user->role ?? 'user';
            if ($role === 'admin') {
                return redirect()->route('admin.dashboard');
            }

            if ($role === 'councilor') {
                // redirect approved councilor to the frontend page that mounts Dashboard.jsx
                return redirect()->to('/dashboard');
            }

            // default -> user dashboard (fallback to URL if route name not present)
            if (method_exists(\Route::class, 'has') && \Route::has('user.dashboard')) {
                return redirect()->route('user.dashboard');
            }
            return redirect('/user/dashboard');
        }

        return back()->with('error', 'Invalid credentials.');
    }
}
