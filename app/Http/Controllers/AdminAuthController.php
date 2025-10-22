<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $data['name'] = $data['first_name'] . ' ' . $data['last_name'];
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return redirect()->route('main')->with('success', 'Registration successful! You may now log in.');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login_type = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$login_type => $request->login, 'password' => $request->password])) {
            return redirect()->route('admin.dashboard');
        }

        return back()->with('error', 'Invalid credentials.');
    }
}
