<?php

return [
    'env' => env('RAZORPAY_ENV', 'test'),
    'test_key_id' => env('RAZORPAY_TEST_KEY_ID', env('RAZORPAY_KEY_ID', '')),
    'test_key_secret' => env('RAZORPAY_TEST_KEY_SECRET', env('RAZORPAY_KEY_SECRET', '')),
    'live_key_id' => env('RAZORPAY_LIVE_KEY_ID', ''),
    'live_key_secret' => env('RAZORPAY_LIVE_KEY_SECRET', ''),
    'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET', ''),
    'key_id' => env('RAZORPAY_KEY_ID', ''),
    'key_secret' => env('RAZORPAY_KEY_SECRET', ''),
    'currency' => env('RAZORPAY_CURRENCY', 'INR'),
    'merchant_name' => env('RAZORPAY_MERCHANT_NAME', 'PINTAARA'),
];
