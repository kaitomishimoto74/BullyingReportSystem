<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\CouncilorApplication;

class CouncilorRegistrationController extends Controller
{
    // POST /councilor/register/send-otp
    public function sendOtp(Request $request)
    {
        try {
            // validate required fields (address and attachment are required per your requirement)
            $data = $request->validate([
                'first_name' => 'required|string|max:100',
                'last_name'  => 'required|string|max:100',
                'username'   => 'required|string|max:50|unique:users,username',
                'email'      => 'required|email|max:150|unique:users,email',
                'address'    => 'required|string|max:255',
                'password'   => 'required|string|min:6|confirmed',
                'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            ]);

            $email = strtolower($data['email']);
            $otp = rand(100000, 999999);
            $token = Str::random(24);

            // store attachment temporarily on public disk and cache only the stored path
            $tempPath = null;
            if ($request->hasFile('attachment')) {
                // use a unique name to avoid collisions
                $file = $request->file('attachment');
                $name = time() . '_' . Str::random(8) . '_' . preg_replace('/[^a-zA-Z0-9\._-]/', '_', $file->getClientOriginalName());
                $tempPath = $file->storeAs('councilor_temp', $name, 'public');
            }

            // Prepare cache payload WITHOUT the UploadedFile (UploadedFile cannot be serialized)
            $payload = [
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name'],
                'username'   => $data['username'],
                'email'      => $email,
                'address'    => $data['address'],
                'password'   => $data['password'],
            ];
            if ($tempPath) {
                $payload['temp_attachment'] = $tempPath;
            }

            // cache the pending registration (15 minutes)
            $cacheKey = "councilor_reg:{$email}";
            Cache::put($cacheKey, [
                'otp' => (string)$otp,
                'token' => $token,
                'data' => $payload,
                'temp_attachment' => $tempPath,
                'created_at' => now()->toDateTimeString(),
            ], now()->addMinutes(15));

            Log::info('CouncilorRegistration OTP generated', ['email' => $email, 'otp' => $otp]);

            // best-effort email send
            try {
                Mail::raw("Your verification code: {$otp}", function ($m) use ($email) {
                    $m->to($email)->subject('Councilor registration OTP');
                });
                Log::info('CouncilorRegistration OTP email attempt', ['email' => $email]);
            } catch (\Throwable $e) {
                Log::warning('CouncilorRegistration mail send failed', ['email' => $email, 'err' => $e->getMessage()]);
            }

            return response()->json(['success' => true, 'message' => 'OTP sent to email (check spam).'], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $ve->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('CouncilorRegistration sendOtp error', ['msg' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            if (config('app.debug')) {
                return response()->json(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
            }
            return response()->json(['success' => false, 'message' => 'Server error. Check logs.'], 500);
        }
    }

    // POST /councilor/register/verify-otp
    public function verifyOtp(Request $request)
    {
        try {
            $data = $request->validate([
                'email' => 'required|email',
                'otp'   => 'required',
            ]);

            $email = strtolower($data['email']);
            $cacheKey = "councilor_reg:{$email}";
            $cached = Cache::get($cacheKey);

            if (! $cached) {
                return response()->json(['success' => false, 'message' => 'No pending registration found or OTP expired.'], 422);
            }

            if ((string)$cached['otp'] !== (string)$data['otp']) {
                return response()->json(['success' => false, 'message' => 'Invalid OTP.'], 422);
            }

            $reg = $cached['data'];

            // create user explicitly (avoid mass assignment issues)
            $user = new User();
            $user->name = trim(($reg['first_name'] ?? '') . ' ' . ($reg['last_name'] ?? ''));
            $user->first_name = $reg['first_name'] ?? null;
            $user->last_name = $reg['last_name'] ?? null;
            $user->username = $reg['username'];
            $user->email = $reg['email'];
            $user->address = $reg['address'] ?? null;
            $user->role = 'councilor';
            $user->is_approved = false;
            $user->password = Hash::make($reg['password']);
            // mark email verified because OTP confirmed ownership
            $user->email_verified_at = now();
            $user->save();

            // move temp attachment to final location if exists
            $attachmentPath = null;
            if (!empty($cached['temp_attachment'])) {
                $temp = $cached['temp_attachment']; // e.g. 'councilor_temp/xxx.jpg' on public disk
                if (Storage::disk('public')->exists($temp)) {
                    $finalDir = 'councilor_attachments';
                    $filename = basename($temp);
                    $finalPath = $finalDir . '/' . $user->id . '_' . $filename;
                    Storage::disk('public')->move($temp, $finalPath);
                    $attachmentPath = $finalPath;
                }
            }

            // create application record safely
            $app = new CouncilorApplication();
            $app->user_id = $user->id;
            $app->attachment_path = $attachmentPath;
            $app->status = 'pending';
            $app->save();

            // remove cached pending registration
            Cache::forget($cacheKey);

            return response()->json(['success' => true, 'message' => 'Registration completed. Your application is pending approval.'], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $ve->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('CouncilorRegistration verifyOtp error', ['msg' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            if (config('app.debug')) {
                return response()->json(['success' => false, 'message' => 'Server error', 'error' => $e->getMessage()], 500);
            }
            return response()->json(['success' => false, 'message' => 'Server error. Check logs.'], 500);
        }
    }
}