<?php

use App\Http\Controllers\Api\Admin\AdminCollectionApiController;
use App\Http\Controllers\Api\Admin\AdminCustomerApiController;
use App\Http\Controllers\Api\Admin\AdminDashboardApiController;
use App\Http\Controllers\Api\Admin\AdminMasterApiController;
use App\Http\Controllers\Api\Admin\AdminProductApiController;
use App\Http\Controllers\Api\Admin\AdminSettingApiController;
use App\Http\Controllers\Api\AppointmentApiController;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CollectionApiController;
use App\Http\Controllers\Api\CustomerDesignApiController;
use App\Http\Controllers\Api\DesignLogApiController;
use App\Http\Controllers\Api\GoldRateApiController;
use App\Http\Controllers\Api\OrderApiController;
use App\Http\Controllers\Api\PricingApiController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\RazorpayApiController;
use App\Http\Controllers\Api\SequelApiController;
use App\Http\Controllers\Api\Admin\AdminJewelryConfigApiController;
use App\Http\Controllers\Api\JewelryConfigurationApiController;
use App\Http\Controllers\Api\UserAddressApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| 1. PUBLIC STOREFRONT & AUTHENTICATION ENDPOINTS
|--------------------------------------------------------------------------
*/

// Customer Auth (Registration, OTP verification, Login, Password recovery)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthApiController::class, 'register']);
    Route::post('/verify-otp', [AuthApiController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthApiController::class, 'resendOtp']);
    Route::post('/login', [AuthApiController::class, 'login']);
    Route::post('/forgot-password', [AuthApiController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthApiController::class, 'resetPassword']);
});

// Dedicated Admin Login Endpoint
Route::post('/admin/auth/login', [AuthApiController::class, 'adminLogin']);

// Live Gold Spot Rates
Route::get('/gold-rate/today', [GoldRateApiController::class, 'today']);
Route::post('/gold-rate/settings', [GoldRateApiController::class, 'updateRates']);

// Catalog, Categories & Customizer
Route::get('/collections', [CollectionApiController::class, 'index']);
Route::get('/products', [ProductApiController::class, 'index']);
Route::get('/products/{design_code}', [ProductApiController::class, 'show']);
Route::post('/price/calculate', [PricingApiController::class, 'calculate']);
Route::get('/masters', [AdminMasterApiController::class, 'index']);

// Dynamic Jewelry Configuration & Combination Validation Engine
Route::get('/config/purities-by-finish', [JewelryConfigurationApiController::class, 'getPuritiesByFinish']);
Route::get('/products/{id}/combinations', [JewelryConfigurationApiController::class, 'getProductCombinations']);
Route::post('/products/{id}/validate-combination', [JewelryConfigurationApiController::class, 'validateCombination']);

// Public Atelier Craft Design Log
Route::get('/design-log', [DesignLogApiController::class, 'index']);
Route::get('/design-log/{identifier}', [DesignLogApiController::class, 'show']);

// Storefront Orders, Tracking & Checkout
Route::post('/orders', [OrderApiController::class, 'store']);
Route::post('/checkout', [OrderApiController::class, 'store']);
Route::get('/orders/{order_number}', [OrderApiController::class, 'show']);

// Public Logistics & Courier Serviceability (Sequel 247)
Route::get('/logistics/info', [SequelApiController::class, 'configInfo']);
Route::post('/logistics/check-serviceability', [SequelApiController::class, 'checkServiceability']);
Route::post('/logistics/calculate-edd', [SequelApiController::class, 'calculateEDD']);

// Secure Razorpay Payments
Route::get('/payment/razorpay/config', [RazorpayApiController::class, 'configInfo']);
Route::post('/payment/razorpay/order', [RazorpayApiController::class, 'createOrder']);
Route::post('/payment/razorpay/verify', [RazorpayApiController::class, 'verifyPayment']);
Route::post('/payment/razorpay/webhook', [RazorpayApiController::class, 'webhook']);

// Storefront Appointment Booking
Route::post('/appointments', [AppointmentApiController::class, 'store']);


/*
|--------------------------------------------------------------------------
| 2. AUTHENTICATED CUSTOMER PORTAL (Sanctum auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Authenticated Profile, Password & Email Changes
    Route::get('/auth/me', [AuthApiController::class, 'me']);
    Route::match(['put', 'post'], '/auth/profile', [AuthApiController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthApiController::class, 'changePassword']);
    Route::post('/auth/send-email-change-otp', [AuthApiController::class, 'sendEmailChangeOtp']);
    Route::post('/auth/verify-email-change-otp', [AuthApiController::class, 'verifyEmailChangeOtp']);
    Route::post('/auth/logout', [AuthApiController::class, 'logout']);

    // Customer Private Orders History (Strictly scoped to authenticated user)
    Route::get('/user/orders', [OrderApiController::class, 'userOrders']);

    // Customer Appointments History
    Route::get('/user/appointments', [AppointmentApiController::class, 'userAppointments']);

    // Customer Custom Bespoke Design Log
    Route::get('/user/designs', [CustomerDesignApiController::class, 'index']);
    Route::post('/user/designs', [CustomerDesignApiController::class, 'store']);
    Route::get('/user/designs/{id}', [CustomerDesignApiController::class, 'show']);
    Route::put('/user/designs/{id}', [CustomerDesignApiController::class, 'update']);
    Route::delete('/user/designs/{id}', [CustomerDesignApiController::class, 'destroy']);

    // Customer Saved Addresses
    Route::get('/user/addresses', [UserAddressApiController::class, 'index']);
    Route::post('/user/addresses', [UserAddressApiController::class, 'store']);
    Route::put('/user/addresses/{id}', [UserAddressApiController::class, 'update']);
    Route::delete('/user/addresses/{id}', [UserAddressApiController::class, 'destroy']);

    // Customer Collection / Acquired Pieces
    Route::get('/user/collection', [OrderApiController::class, 'userCollection']);
});


/*
|--------------------------------------------------------------------------
| 3. ADMIN MANAGEMENT PORTAL (Sanctum + Admin RBAC)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['admin'])->group(function () {
    // Admin Identity & Logout
    Route::get('/auth/me', [AuthApiController::class, 'me']);
    Route::post('/auth/logout', [AuthApiController::class, 'logout']);

    // Executive Dashboard
    Route::get('/dashboard', [AdminDashboardApiController::class, 'index']);

    // Collections Management
    Route::get('/collections', [AdminCollectionApiController::class, 'index']);
    Route::post('/collections', [AdminCollectionApiController::class, 'store']);
    Route::get('/collections/{id}', [AdminCollectionApiController::class, 'show']);
    Route::put('/collections/{id}', [AdminCollectionApiController::class, 'update']);
    Route::delete('/collections/{id}', [AdminCollectionApiController::class, 'destroy']);
    Route::post('/collections/upload-image', [AdminCollectionApiController::class, 'uploadImage']);

    // Products Catalog Management
    Route::get('/products', [AdminProductApiController::class, 'index']);
    Route::post('/products', [AdminProductApiController::class, 'store']);
    Route::post('/products/upload-media', [AdminProductApiController::class, 'uploadMedia']);
    Route::get('/products/{id}', [AdminProductApiController::class, 'show']);
    Route::put('/products/{id}', [AdminProductApiController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductApiController::class, 'destroy']);
    Route::post('/products/preview-price', [AdminProductApiController::class, 'previewPrice']);
    Route::get('/option-masters', [AdminProductApiController::class, 'optionMasters']);

    // Dedicated Customization Masters Module
    Route::get('/masters', [AdminMasterApiController::class, 'index']);
    Route::post('/masters', [AdminMasterApiController::class, 'store']);
    Route::get('/masters/{id}', [AdminMasterApiController::class, 'show']);
    Route::put('/masters/{id}', [AdminMasterApiController::class, 'update']);
    Route::delete('/masters/{id}', [AdminMasterApiController::class, 'destroy']);
    Route::post('/masters/{id}/values', [AdminMasterApiController::class, 'storeValue']);
    Route::put('/masters/values/{id}', [AdminMasterApiController::class, 'updateValue']);
    Route::delete('/masters/values/{id}', [AdminMasterApiController::class, 'destroyValue']);
    Route::post('/masters/upload-image', [AdminMasterApiController::class, 'uploadImage']);
    Route::post('/masters/reset', [AdminMasterApiController::class, 'reset']);

    // Dedicated Relational Jewelry Configuration & Variant Matrix Engine
    Route::get('/config/metal-types', [AdminJewelryConfigApiController::class, 'indexMetalTypes']);
    Route::post('/config/metal-types', [AdminJewelryConfigApiController::class, 'storeMetalType']);
    Route::put('/config/metal-types/{id}', [AdminJewelryConfigApiController::class, 'updateMetalType']);
    Route::delete('/config/metal-types/{id}', [AdminJewelryConfigApiController::class, 'destroyMetalType']);

    Route::get('/config/purities', [AdminJewelryConfigApiController::class, 'indexPurities']);
    Route::post('/config/purities', [AdminJewelryConfigApiController::class, 'storePurity']);
    Route::put('/config/purities/{id}', [AdminJewelryConfigApiController::class, 'updatePurity']);
    Route::delete('/config/purities/{id}', [AdminJewelryConfigApiController::class, 'destroyPurity']);

    Route::get('/config/finishes', [AdminJewelryConfigApiController::class, 'indexFinishes']);
    Route::post('/config/finishes', [AdminJewelryConfigApiController::class, 'storeFinish']);
    Route::put('/config/finishes/{id}', [AdminJewelryConfigApiController::class, 'updateFinish']);
    Route::delete('/config/finishes/{id}', [AdminJewelryConfigApiController::class, 'destroyFinish']);

    Route::get('/config/finish-purities', [AdminJewelryConfigApiController::class, 'indexFinishPurities']);
    Route::post('/config/finish-purities/sync', [AdminJewelryConfigApiController::class, 'syncFinishPurities']);

    Route::get('/config/sizes', [AdminJewelryConfigApiController::class, 'indexSizes']);
    Route::post('/config/sizes', [AdminJewelryConfigApiController::class, 'storeSize']);
    Route::put('/config/sizes/{id}', [AdminJewelryConfigApiController::class, 'updateSize']);
    Route::delete('/config/sizes/{id}', [AdminJewelryConfigApiController::class, 'destroySize']);

    Route::get('/config/stones', [AdminJewelryConfigApiController::class, 'indexStones']);
    Route::post('/config/stones', [AdminJewelryConfigApiController::class, 'storeStone']);
    Route::put('/config/stones/{id}', [AdminJewelryConfigApiController::class, 'updateStone']);
    Route::delete('/config/stones/{id}', [AdminJewelryConfigApiController::class, 'destroyStone']);

    // Product-Level Finish -> Purity Matrix & Product Variants Management
    Route::get('/products/{id}/finish-purities', [AdminJewelryConfigApiController::class, 'getProductFinishPurities']);
    Route::post('/products/{id}/finish-purities/sync', [AdminJewelryConfigApiController::class, 'syncProductFinishPurities']);
    Route::get('/products/{id}/variants', [AdminJewelryConfigApiController::class, 'getProductVariants']);
    Route::post('/products/{id}/variants', [AdminJewelryConfigApiController::class, 'storeProductVariant']);
    Route::put('/products/{id}/variants/{variantId}', [AdminJewelryConfigApiController::class, 'updateProductVariant']);
    Route::delete('/products/{id}/variants/{variantId}', [AdminJewelryConfigApiController::class, 'destroyProductVariant']);

    // Orders & 5-Step Fulfillment Tracking
    Route::get('/orders', [OrderApiController::class, 'adminIndex']);
    Route::get('/orders/{id}', [OrderApiController::class, 'adminShow']);
    Route::put('/orders/{id}/status', [OrderApiController::class, 'updateStatus']);
    Route::put('/orders/{id}/fulfillment', [OrderApiController::class, 'updateFulfillment']);
    Route::post('/orders/{id}/comments', [OrderApiController::class, 'addComment']);
    Route::put('/orders/{id}/notes', [OrderApiController::class, 'updateNotes']);
    Route::put('/orders/{id}/shipping-address', [OrderApiController::class, 'updateShippingAddress']);
    Route::put('/orders/{orderId}/items/{itemId}/certificate', [OrderApiController::class, 'updateOrderItemCertificate']);
    Route::post('/upload-certificate', [OrderApiController::class, 'uploadCertificate']);

    // Sequel 247 Logistics Integration
    Route::get('/logistics/config', [SequelApiController::class, 'configInfo']);
    Route::post('/orders/{id}/sequel-docket', [SequelApiController::class, 'createDocket']);
    Route::get('/orders/{id}/sequel-track', [SequelApiController::class, 'trackDocket']);
    Route::post('/orders/{id}/sequel-cancel', [SequelApiController::class, 'cancelDocket']);

    // Live Gold Rates Configuration
    Route::get('/gold-rates', [GoldRateApiController::class, 'today']);
    Route::post('/gold-rates', [GoldRateApiController::class, 'updateRates']);

    // Patrons & Customers Management
    Route::get('/customers', [AdminCustomerApiController::class, 'index']);
    Route::get('/customers/{id}', [AdminCustomerApiController::class, 'show']);
    Route::put('/customers/{id}/status', [AdminCustomerApiController::class, 'updateStatus']);
    Route::delete('/customers/{id}', [AdminCustomerApiController::class, 'destroy']);
    Route::get('/users', [AdminCustomerApiController::class, 'index']);

    // Consultations & Appointments Management
    Route::get('/appointments', [AppointmentApiController::class, 'index']);
    Route::put('/appointments/{id}/status', [AppointmentApiController::class, 'updateStatus']);

    // Atelier & External API Configurations (Production & Testing)
    Route::get('/settings', [AdminSettingApiController::class, 'index']);
    Route::post('/settings', [AdminSettingApiController::class, 'update']);
    Route::post('/settings/test-connection', [AdminSettingApiController::class, 'testConnection']);
});
