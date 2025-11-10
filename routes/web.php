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

// Councilor dashboard (existing controller kept but mounted on /councilor/dashboard)
Route::get('/councilor/dashboard', [App\Http\Controllers\AdminDashboardController::class, 'index'])
    ->middleware('auth')
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
