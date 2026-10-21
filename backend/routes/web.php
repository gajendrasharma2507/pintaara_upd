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
