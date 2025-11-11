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
use App\Http\Controllers\CouncilorPanelController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\CouncilorApplication;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

Route::get('/', function () {
    return view('main');
})->name('main');

Route::get('/login', function () {
    return redirect('/');
})->name('login');

Route::get('/report_form', function () {
    return view('report_form');
})->name('report.form');

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

Route::get('/admin/dashboard', [App\Http\Controllers\AdminPanelController::class, 'index'])
    ->middleware('auth')
    ->name('admin.dashboard');

Route::post('/councilor/register', [CouncilorRegistrationController::class, 'register'])->name('councilor.register');

Route::post('/councilor/register/send-otp', [CouncilorRegistrationController::class, 'sendOtp'])->name('councilor.register.sendOtp');
Route::post('/councilor/register/verify-otp', [CouncilorRegistrationController::class, 'verifyOtp'])->name('councilor.register.verifyOtp');

Route::get('/access-denied', function () {
    return view('access_denied');
})->name('access.denied');

Route::get('/councilor/dashboard', [CouncilorDashboardController::class, 'index'])
    ->middleware(['auth', 'approved'])
    ->name('councilor.dashboard');

Route::get('/admin/reports', [App\Http\Controllers\AdminDashboardController::class, 'reportsJson'])
    ->middleware('auth')
    ->name('admin.reports');

Route::get('/admin/report/{id}/preview', [AdminDashboardController::class, 'preview'])->name('admin.report.preview');
Route::post('/admin/report/{id}/work', [App\Http\Controllers\AdminDashboardController::class, 'work'])->name('admin.report.work');
Route::post('/admin/report/{id}/complete', [App\Http\Controllers\AdminDashboardController::class, 'complete'])->name('admin.report.complete');

Route::get('/admin/report/{id}/preview-json', [App\Http\Controllers\AdminDashboardController::class, 'previewJson']);

Route::post('/admin/report/{id}/complete', [App\Http\Controllers\AdminDashboardController::class, 'completeJson'])->name('admin.report.complete');

Route::get('/admin/work', [App\Http\Controllers\AdminDashboardController::class, 'workList'])
    ->middleware('auth')
    ->name('admin.work');

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

Route::get('/user/dashboard', [UserDashboardController::class, 'index'])
    ->middleware('auth')
    ->name('user.dashboard');

Route::get('/password/reset', function () {
    return view('auth.passwords.reset');
})->name('password.request');

Route::post('/password/forgot', [ForgotPasswordController::class, 'sendReset'])->name('password.forgot');
Route::post('/password/forgot/send-otp', [PasswordOtpController::class, 'sendOtp'])->name('password.forgot.send');
Route::post('/password/forgot/verify-otp', [PasswordOtpController::class, 'verifyOtp'])->name('password.forgot.verify');
Route::post('/password/forgot/change', [PasswordOtpController::class, 'changePassword'])->name('password.forgot.change');

Route::get('/password/forgot', function () {
    return view('auth.forgot');
})->name('password.forgot.form');

Route::middleware(['auth'])->group(function () {
    Route::post('/profile/password', [ProfileController::class, 'changePassword'])->name('profile.password');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
});

Route::get('/admin/summary', [AdminPanelController::class, 'summaryJson'])
    ->middleware('auth')
    ->name('admin.summary');

// Admin: view applications (blade)
Route::get('/admin/applications', function () {
    $applications = \App\Models\CouncilorApplication::orderBy('created_at', 'desc')->get();
    return view('admin.applications', compact('applications'));
})->name('admin.applications');

// Admin: preview single application (blade)
Route::get('/admin/applications/{id}/preview', function ($id) {
    $app = \App\Models\CouncilorApplication::findOrFail($id);
    $user = \App\Models\User::find($app->user_id);
    return view('admin.application_preview', compact('app', 'user'));
})->name('admin.applications.preview');

// JSON endpoint used by Admin React dashboard (keeps path expected by React)
Route::get('/admin/councilor-applications', function () {
    $applications = CouncilorApplication::orderBy('created_at', 'desc')->get()->map(function ($app) {
        $user = User::find($app->user_id);
        return [
            'id' => $app->id,
            'name' => $user ? $user->name : 'Unknown applicant',
            'email' => $user ? $user->email : null,
            'status' => $app->status ?? 'pending',
            'attachment_path' => $app->attachment_path,
        ];
    });

    return response()->json($applications);
})->middleware('auth')->name('admin.councilor.applications');

// Backwards-compatible API (if other code calls this)
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

// Approve application (set user->is_approved = true and notify by email)
Route::post('/admin/applications/{id}/approve', function (Request $request, $id) {
    $app = CouncilorApplication::find($id);
    if (! $app) {
        return redirect()->back()->with('error', 'Application not found.');
    }

    $user = User::find($app->user_id);
    if (! $user) {
        return redirect()->back()->with('error', 'Associated user not found.');
    }

    try {
        $user->is_approved = true;
        $user->save();

        $app->status = 'approved';
        $app->save();

        // notify user by email (best-effort)
        try {
            Mail::raw("Hello {$user->name},\n\nYour councilor account has been approved. You can now log in.\n\nRegards,", function ($m) use ($user) {
                $m->to($user->email)->subject('Your account has been approved');
            });
        } catch (\Throwable $mx) {
            // log but continue
            \Illuminate\Support\Facades\Log::warning('Approve: mail send failed', ['user'=>$user->email, 'err'=>$mx->getMessage()]);
        }

        return redirect()->back()->with('status', 'Application approved and user notified.');
    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::error('Approve application error', ['err'=>$e->getMessage()]);
        return redirect()->back()->with('error', config('app.debug') ? $e->getMessage() : 'Failed to approve application.');
    }
})->middleware('auth')->name('admin.applications.approve');

// Dashboard page that mounts the councilor React app
Route::get('/dashboard', [CouncilorPanelController::class, 'index'])
    ->middleware('auth')
    ->name('frontend.dashboard');

// Dashboard stats used by councilor Dashboard.jsx
Route::get('/dashboard/stats', function (Request $request) {
    $user = $request->user();
    if (! $user) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }

    $reportsCount = 0;
    $workCount = 0;

    // try to count reports (submitted by this user)
    if (class_exists(\App\Models\BullyingReport::class)) {
        $reportModel = \App\Models\BullyingReport::class;
        $q = $reportModel::query();

        if (Schema::hasColumn('bullying_reports', 'user_id')) {
            $reportsCount = $q->where('user_id', $user->id)->count();
        } else {
            $reportsCount = $q->count();
        }

        // try several common columns to count work assigned to this councilor
        $q2 = $reportModel::query();
        if (Schema::hasColumn('bullying_reports', 'assigned_to')) {
            $workCount = $q2->where('assigned_to', $user->id)->count();
        } elseif (Schema::hasColumn('bullying_reports', 'councilor_id')) {
            $workCount = $q2->where('councilor_id', $user->id)->count();
        } elseif (Schema::hasColumn('bullying_reports', 'handled_by')) {
            $workCount = $q2->where('handled_by', $user->id)->count();
        } else {
            $workCount = 0;
        }
    }

    return response()->json([
        'reports' => (int) $reportsCount,
        'work'    => (int) $workCount,
    ]);
})->middleware('auth')->name('dashboard.stats');
