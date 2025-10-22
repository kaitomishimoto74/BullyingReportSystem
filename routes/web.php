<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BullyingReportController;
use App\Http\Controllers\AdminDashboardController;

Route::get('/', function () {
    return view('main');
})->name('main');

Route::get('/login', function () {
    // return view('login'); // Replace with your login view/controller
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

Route::post('/admin/register', [App\Http\Controllers\AdminAuthController::class, 'register'])->name('admin.register.submit');

Route::get('/admin/login', function () {
    return view('admin_login');
})->name('admin.login');

Route::post('/admin/login', [App\Http\Controllers\AdminAuthController::class, 'login'])->name('admin.login.submit');

Route::get('/admin/dashboard', [App\Http\Controllers\AdminDashboardController::class, 'index'])
    ->middleware('auth')
    ->name('admin.dashboard');

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

Route::post('/admin/logout', function () {
    Auth::logout();
    return redirect()->route('main');
})->name('admin.logout');

Route::get('/report/check', function () {
    return view('report_check');
})->name('report.check');

Route::get('/admin/work-reports', [App\Http\Controllers\AdminDashboardController::class, 'workReportsJson']);
