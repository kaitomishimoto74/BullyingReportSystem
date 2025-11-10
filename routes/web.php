<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\BullyingReportController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\PasswordOtpController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminPanelController;
use App\Http\Controllers\CouncilorRegistrationController;
use App\Http\Controllers\CouncilorDashboardController;

Route::get('/', function () {
    return view('main');
})->name('main');

// ensure /login goes to your main React view (MainScreen.jsx mounted there)
Route::get('/login', function () {
    return redirect('/');
})->name('login');

Route::get('/report_form', function () {
    return view('report_form');
})->name('report.form');

// POST route for file case (ensure this exists)
Route::post('/report', [BullyingReportController::class, 'store'])->name('report.submit');
Route::get('/report/search', [App\Http\Controllers\BullyingReportController::class, 'searchJson']);

Route::get('/admin/register', function () {
    return view('admin_register');
})->name('admin.register');

Route::post('/admin/register', [AdminAuthController::class, 'register'])->name('admin.register');
Route::post('/verify-otp', [AdminAuthController::class, 'verifyOtp'])->name('verify.otp');

Route::get('/admin/login', function () {
    return view('admin_login');
})->name('admin.login');

Route::post('/admin/login', [App\Http\Controllers\AdminAuthController::class, 'login'])->name('admin.login.submit');

// Admin-only dashboard (new)
Route::get('/admin/dashboard', [App\Http\Controllers\AdminPanelController::class, 'index'])
    ->middleware('auth')
    ->name('admin.dashboard');

// Councilor registration (public)
Route::post('/councilor/register', [CouncilorRegistrationController::class, 'register'])->name('councilor.register');

// Councilor registration OTP endpoints
Route::post('/councilor/register/send-otp', [CouncilorRegistrationController::class, 'sendOtp'])->name('councilor.register.sendOtp');
Route::post('/councilor/register/verify-otp', [CouncilorRegistrationController::class, 'verifyOtp'])->name('councilor.register.verifyOtp');

// Access denied page
Route::get('/access-denied', function () {
    return view('access_denied');
})->name('access.denied');

// Councilor dashboard — require auth and approval
Route::get('/councilor/dashboard', [CouncilorDashboardController::class, 'index'])
    ->middleware(['auth', 'approved'])
    ->name('councilor.dashboard');

Route::get('/admin/reports', [App\Http\Controllers\AdminDashboardController::class, 'reportsJson'])
    ->middleware('auth')
    ->name('admin.reports');

Route::get('/admin/report/{id}/preview', [AdminDashboardController::class, 'preview'])->name('admin.report.preview');
Route::post('/admin/report/{id}/work', [App\Http\Controllers\AdminDashboardController::class, 'work'])->name('admin.report.work');
Route::post('/admin/report/{id}/complete', [AdminDashboardController::class, 'complete'])->name('admin.report.complete');

// Preview report (JSON)
Route::get('/admin/report/{id}/preview-json', [App\Http\Controllers\AdminDashboardController::class, 'previewJson']);

// Mark as completed (POST, JSON response)
Route::post('/admin/report/{id}/complete', [App\Http\Controllers\AdminDashboardController::class, 'completeJson'])->name('admin.report.complete');

Route::get('/admin/work', [App\Http\Controllers\AdminDashboardController::class, 'workList'])
    ->middleware('auth')
    ->name('admin.work');

// logout route for regular users (used by UserDashboard.jsx)
Route::post('/logout', function (\Illuminate\Http\Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->name('logout');

Route::get('/report/check', function () {
    return view('report_check');
})->name('report.check');

Route::get('/admin/work-reports', [App\Http\Controllers\AdminDashboardController::class, 'workReportsJson']);

// User dashboard
Route::get('/user/dashboard', [UserDashboardController::class, 'index'])
    ->middleware('auth')
    ->name('user.dashboard');

// Password reset routes
Route::get('/password/reset', function () {
    return view('auth.passwords.reset');
})->name('password.request');

Route::post('/password/forgot', [ForgotPasswordController::class, 'sendReset'])->name('password.forgot');
Route::post('/password/forgot/send-otp', [PasswordOtpController::class, 'sendOtp'])->name('password.forgot.send');
Route::post('/password/forgot/verify-otp', [PasswordOtpController::class, 'verifyOtp'])->name('password.forgot.verify');
Route::post('/password/forgot/change', [PasswordOtpController::class, 'changePassword'])->name('password.forgot.change');

// Forgot password form page (renders simple multi-step JS UI)
Route::get('/password/forgot', function () {
    return view('auth.forgot');
})->name('password.forgot.form');

// profile routes (requires auth)
Route::middleware(['auth'])->group(function () {
    // change password used by AdminDashboard.jsx
    Route::post('/profile/password', [ProfileController::class, 'changePassword'])->name('profile.password');

    // optional: profile update endpoint if your frontend uses it
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
});

// admin summary for SPA
Route::get('/admin/summary', [AdminPanelController::class, 'summaryJson'])
    ->middleware('auth')
    ->name('admin.summary');

// Admin: list councilor applications
Route::get('/admin/applications', function () {
    $applications = \App\Models\CouncilorApplication::orderBy('created_at', 'desc')->get();
    return view('admin.applications', compact('applications'));
})->name('admin.applications');

// Admin: preview single application
Route::get('/admin/applications/{id}/preview', function ($id) {
    $app = \App\Models\CouncilorApplication::findOrFail($id);
    $user = \App\Models\User::find($app->user_id);
    return view('admin.application_preview', compact('app', 'user'));
})->name('admin.applications.preview');

// JSON endpoint for Admin React dashboard
Route::get('/admin/api/applications', function () {
    $applications = \App\Models\CouncilorApplication::orderBy('created_at', 'desc')->get()->map(function ($app) {
        $user = \App\Models\User::find($app->user_id);
        return [
            'id' => $app->id,
            'name' => $user ? $user->name : 'Unknown applicant',
            'email' => $user ? $user->email : null,
            'status' => $app->status ?? 'pending',
            'attachment_path' => $app->attachment_path,
        ];
    });

    return response()->json(['data' => $applications]);
})->name('admin.api.applications');
