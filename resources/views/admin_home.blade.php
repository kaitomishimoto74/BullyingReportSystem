@extends('admin_dashboard')

@section('content')
    <div style="max-width: 600px; margin: 40px auto; background: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
        <h1 style="color: #007bff;">Welcome, {{ Auth::user()->first_name ?? Auth::user()->username }}!</h1>
        <p style="font-size: 18px; margin-top: 20px;">
            This is your admin dashboard.<br>
            Use the navigation above to manage bullying reports, view assigned work, and monitor case status.
        </p>
        <hr style="margin: 30px 0;">
        <div style="font-size: 16px; color: #555;">
            <strong>Quick Links:</strong>
            <div style="margin-top: 15px;">
                <a href="{{ route('admin.reports') }}" style="margin: 0 10px; color: #007bff; text-decoration: underline;">File Reports</a>
                <a href="{{ route('admin.work') }}" style="margin: 0 10px; color: #28a745; text-decoration: underline;">Work</a>
            </div>
        </div>
    </div>
@endsection