<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAccountApproved
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && $user->role === 'councilor' && ! (bool) $user->is_approved) {
            // redirect to access denied page
            return redirect()->route('access.denied');
        }
        return $next($request);
    }
}