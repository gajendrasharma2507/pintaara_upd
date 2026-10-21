<?php

use Illuminate\Support\Facades\Route;

// Pure Headless API Base Status
Route::get('/', function () {
    return response()->json([
        'status' => 'success',
        'app' => 'Pintaara Luxury Jewelry API Engine',
        'version' => '1.0.0',
        'endpoints' => '/api',
    ]);
});

// Explicitly handle legacy /admin web routes so old Laravel blade UI never renders
Route::any('/admin/{any?}', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'The administrative portal has moved to the Next.js headless interface at https://admin.pintaara.com',
        'admin_portal' => 'https://admin.pintaara.com',
        'api_status' => 'Headless API Active',
    ]);
})->where('any', '.*');

