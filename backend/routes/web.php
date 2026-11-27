<?php

use App\Http\Controllers\Admin\AdminWebController;
use App\Http\Controllers\Admin\AdminOptionController;
use Illuminate\Support\Facades\Route;

// Redirect root to admin
Route::get('/', function () {
    return redirect('/admin');
});

Route::prefix('admin')->group(function () {
    Route::get('/login', [AdminWebController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AdminWebController::class, 'login'])->name('admin.login.submit');
    Route::post('/logout', [AdminWebController::class, 'logout'])->name('admin.logout');

    Route::middleware(['web', 'admin.web'])->group(function () {
        Route::get('/', [AdminWebController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('/global-search', [AdminWebController::class, 'globalSearch'])->name('admin.global-search');

        // Orders
        Route::get('/orders', [AdminWebController::class, 'orders'])->name('admin.orders');
        Route::get('/orders/{id}', [AdminWebController::class, 'orderDetail'])->name('admin.orders.show');
        Route::get('/orders/{id}/invoice', [AdminWebController::class, 'orderInvoice'])->name('admin.orders.invoice');
        Route::post('/orders/{id}/status', [AdminWebController::class, 'updateOrderStatus'])->name('admin.orders.status');
        Route::post('/orders/{id}/tracking', [AdminWebController::class, 'updateTrackingDetails'])->name('admin.orders.tracking');
        Route::post('/orders/{id}/send-email', [AdminWebController::class, 'sendOrderEmail'])->name('admin.orders.send-email');
        Route::get('/orders/{id}/preview-email/{type}', [AdminWebController::class, 'previewOrderEmail'])->name('admin.orders.preview-email');
        Route::delete('/orders/{id}', [AdminWebController::class, 'deleteOrder'])->name('admin.orders.delete');
        Route::post('/orders/{id}/restore', [AdminWebController::class, 'restoreOrder'])->name('admin.orders.restore');
        Route::delete('/orders/{id}/force', [AdminWebController::class, 'forceDeleteOrder'])->name('admin.orders.force-delete');
        Route::post('/orders/{id}/items/{itemId}/upload-document', [AdminWebController::class, 'uploadOrderItemDocument'])->name('admin.orders.items.upload-document');
        Route::delete('/orders/{id}/items/{itemId}/certificates/{certIndex}', [AdminWebController::class, 'deleteOrderItemCertificate'])->name('admin.orders.items.delete-cert');
        Route::post('/orders/{id}/sequel-docket', [AdminWebController::class, 'createSequelDocket'])->name('admin.orders.sequel-docket');

        // Products
        Route::get('/products', [AdminWebController::class, 'products'])->name('admin.products');
        Route::get('/products/create', [AdminWebController::class, 'createProduct'])->name('admin.products.create');
        Route::post('/products', [AdminWebController::class, 'storeProduct'])->name('admin.products.store');
        Route::get('/products/{id}', fn($id) => redirect()->route('admin.products.edit', $id));
        Route::get('/products/{id}/edit', [AdminWebController::class, 'editProduct'])->name('admin.products.edit');
        Route::put('/products/{id}', [AdminWebController::class, 'updateProduct'])->name('admin.products.update');
        Route::delete('/products/{id}', [AdminWebController::class, 'deleteProduct'])->name('admin.products.delete');

        // Product Options & Variants Management
        Route::get('/product-options', [AdminOptionController::class, 'index'])->name('admin.product-options');
        Route::post('/product-options', [AdminOptionController::class, 'storeGroup'])->name('admin.product-options.store');
        Route::put('/product-options/{id}', [AdminOptionController::class, 'updateGroup'])->name('admin.product-options.update');
        Route::delete('/product-options/{id}', [AdminOptionController::class, 'deleteGroup'])->name('admin.product-options.delete');
        Route::post('/product-options/{groupId}/values', [AdminOptionController::class, 'storeValue'])->name('admin.product-options.values.store');
        Route::put('/product-options/values/{id}', [AdminOptionController::class, 'updateValue'])->name('admin.product-options.values.update');
        Route::delete('/product-options/values/{id}', [AdminOptionController::class, 'deleteValue'])->name('admin.product-options.values.delete');
        Route::post('/product-options/sort', [AdminOptionController::class, 'updateSort'])->name('admin.product-options.sort');
        Route::get('/api/product-option-groups', [AdminOptionController::class, 'apiGroups'])->name('admin.product-options.api');

        // Design Logs
        Route::get('/design-logs', [AdminWebController::class, 'designLogs'])->name('admin.design-logs');
        Route::get('/design-logs/create', [AdminWebController::class, 'createDesignLog'])->name('admin.design-logs.create');
        Route::post('/design-logs', [AdminWebController::class, 'storeDesignLog'])->name('admin.design-logs.store');
        Route::get('/design-logs/{id}', [AdminWebController::class, 'showDesignLog'])->name('admin.design-logs.show');
        Route::get('/design-logs/{id}/edit', [AdminWebController::class, 'editDesignLog'])->name('admin.design-logs.edit');
        Route::put('/design-logs/{id}', [AdminWebController::class, 'updateDesignLog'])->name('admin.design-logs.update');
        Route::delete('/design-logs/{id}', [AdminWebController::class, 'deleteDesignLog'])->name('admin.design-logs.delete');

        // Upload Image
        Route::post('/upload-image', [AdminWebController::class, 'uploadImage'])->name('admin.upload-image');

        // Collections
        Route::get('/collections', [AdminWebController::class, 'collections'])->name('admin.collections');
        Route::post('/collections', [AdminWebController::class, 'storeCollection'])->name('admin.collections.store');
        Route::put('/collections/{id}', [AdminWebController::class, 'updateCollection'])->name('admin.collections.update');
        Route::delete('/collections/{id}', [AdminWebController::class, 'deleteCollection'])->name('admin.collections.delete');

        // Customers
        Route::get('/customers', [AdminWebController::class, 'customers'])->name('admin.customers');
        Route::post('/customers/{id}', [AdminWebController::class, 'updateCustomer'])->name('admin.customers.update');
        Route::put('/customers/{id}', [AdminWebController::class, 'updateCustomer'])->name('admin.customers.update.put');
        Route::delete('/customers/{id}', [AdminWebController::class, 'destroyCustomer'])->name('admin.customers.destroy');

        // Bookings / Appointments
        Route::get('/appointments', [\App\Http\Controllers\Admin\AdminAppointmentController::class, 'index'])->name('admin.appointments');
        Route::put('/appointments/{id}', [\App\Http\Controllers\Admin\AdminAppointmentController::class, 'update'])->name('admin.appointments.update');
        Route::delete('/appointments/{id}', [\App\Http\Controllers\Admin\AdminAppointmentController::class, 'destroy'])->name('admin.appointments.delete');

        // Live Gold Rates
        Route::get('/gold-rates', [AdminWebController::class, 'goldRates'])->name('admin.gold-rates');
        Route::get('/gold-rates/live-feed', [AdminWebController::class, 'liveGoldRatesFeed'])->name('admin.gold-rates.feed');
        Route::post('/gold-rates', [AdminWebController::class, 'updateGoldRates'])->name('admin.gold-rates.update');

        // Currency & FX Rates (Frankfurter API)
        Route::get('/currencies', [\App\Http\Controllers\Admin\AdminCurrencyController::class, 'index'])->name('admin.currencies');
        Route::post('/currencies/sync', [\App\Http\Controllers\Admin\AdminCurrencyController::class, 'sync'])->name('admin.currencies.sync');
        Route::post('/currencies/update', [\App\Http\Controllers\Admin\AdminCurrencyController::class, 'update'])->name('admin.currencies.update');
        Route::post('/currencies/add', [\App\Http\Controllers\Admin\AdminCurrencyController::class, 'store'])->name('admin.currencies.store');
        Route::delete('/currencies/{id}', [\App\Http\Controllers\Admin\AdminCurrencyController::class, 'destroy'])->name('admin.currencies.destroy');

        // Masters (Hidden and redirected to dynamic Options & Variants)
        Route::get('/masters', function () {
            return redirect()->route('admin.product-options');
        })->name('admin.masters');

        // Compatibility Master - redirected to Products (all managed per product)
        Route::get('/compatibility-master', function () {
            return redirect()->route('admin.products');
        });

        // Settings
        Route::get('/settings', [AdminWebController::class, 'settings'])->name('admin.settings');
        Route::post('/settings', [AdminWebController::class, 'updateSettings'])->name('admin.settings.update');

        // Email Templates
        Route::get('/email-templates', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'index'])->name('admin.email-templates');
        Route::get('/email-templates/create', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'create'])->name('admin.email-templates.create');
        Route::post('/email-templates', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'store'])->name('admin.email-templates.store');
        Route::get('/email-templates/{id}/edit', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'edit'])->name('admin.email-templates.edit');
        Route::put('/email-templates/{id}', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'update'])->name('admin.email-templates.update');
        Route::delete('/email-templates/{id}', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'destroy'])->name('admin.email-templates.delete');
        Route::post('/email-templates/preview', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'preview'])->name('admin.email-templates.preview');
        Route::post('/email-templates/{id}/test', [\App\Http\Controllers\Admin\AdminEmailTemplateController::class, 'sendTest'])->name('admin.email-templates.test');
    });
});
