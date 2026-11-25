<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminWebAuthenticate
{
    /**
     * Handle an incoming request.
     * Enforce strict authentication on all /admin web routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Must be logged in via Laravel Web Session
        if (!Auth::check()) {
            return redirect()->guest(route('admin.login'))
                ->with('error', 'Please sign in to access the PINTAARA administration portal.');
        }

        $user = Auth::user();

        // 2. Must have admin privileges (super_admin, admin, manager, operations, etc.)
        $adminRoles = ['super_admin', 'admin', 'manager', 'operations', 'production', 'finance', 'logistics'];
        $hasAdminRole = in_array(strtolower($user->role ?? ''), $adminRoles);

        if (!$hasAdminRole) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')
                ->withErrors(['email' => 'Access denied: You do not have administrative privileges.']);
        }

        return $next($request);
    }
}
