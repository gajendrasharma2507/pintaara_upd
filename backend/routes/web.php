<?php

use App\Http\Controllers\Admin\CollectionMasterController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GoldRateController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

// Redirect root to admin dashboard
Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

// Admin Panel Routes
Route::prefix('admin')->name('admin.')->group(function () {
    // 1. Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Gold Rate Manager
    Route::get('/gold-rate', [GoldRateController::class, 'index'])->name('gold-rate.index');
    Route::post('/gold-rate', [GoldRateController::class, 'store'])->name('gold-rate.store');

    // 3. Collections Master
    Route::get('/collections-master', [CollectionMasterController::class, 'index'])->name('collections.index');
    Route::post('/collections-master', [CollectionMasterController::class, 'store'])->name('collections.store');
    Route::put('/collections-master/{id}', [CollectionMasterController::class, 'update'])->name('collections.update');
    Route::delete('/collections-master/{id}', [CollectionMasterController::class, 'destroy'])->name('collections.destroy');

    // 4. Products & Matrix
    Route::resource('products', ProductController::class);

    // 5. Orders & 5-Step Pipeline
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

    // 6. VIP Customers
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    // 7. Atelier Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/password', [SettingController::class, 'updatePassword'])->name('settings.password.update');
});
