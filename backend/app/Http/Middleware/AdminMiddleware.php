<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     * Checks that the user is authenticated via Sanctum and has admin privileges.
     * In local development, seamlessly falls back to super_admin so admin panel shows real DB data.
     */
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        // Authenticate via Sanctum token (required — no dev bypass)
        $user = $request->user('sanctum') ?? $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Valid authorization token required.',
            ], 401);
        }

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Administrative privileges required.',
            ], 403);
        }

        if ($permission && !$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => "Access denied. Required permission: {$permission}.",
            ], 403);
        }

        return $next($request);
    }
}
