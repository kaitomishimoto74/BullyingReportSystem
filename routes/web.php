<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BullyingReportController;
use App\Http\Controllers\AdminDashboardController;

Route::get('/', function () {
    return view('main');
});

Route::get('/login', function () {
    // return view('login'); // Replace with your login view/controller
})->name('login');

Route::get('/report', function () {
    return view('report_form');
})->name('report.form');

Route::post('/report', [BullyingReportController::class, 'store'])->name('report.submit');
Route::get('/report/search', [BullyingReportController::class, 'search'])->name('report.search');

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

Route::get('/admin/reports', [App\Http\Controllers\AdminDashboardController::class, 'reports'])
    ->middleware('auth')
    ->name('admin.reports');

Route::get('/admin/report/{id}/preview', [App\Http\Controllers\AdminDashboardController::class, 'preview'])->name('admin.report.preview');
Route::post('/admin/report/{id}/work', [App\Http\Controllers\AdminDashboardController::class, 'work'])->name('admin.report.work');

Route::get('/admin/work', [AdminDashboardController::class, 'workList'])
    ->middleware('auth')
    ->name('admin.work');

Route::post('/admin/logout', function () {
    Auth::logout();
    return redirect()->route('admin.login');
})->name('admin.logout');
