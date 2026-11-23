<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'sequel247' => [
        'env' => env('SEQUEL247_ENV', 'test'),
        'client_code' => env('SEQUEL247_CLIENT_CODE', ''),
        'store_code' => env('SEQUEL247_STORE_CODE', ''),
        'origin_pincode' => env('SEQUEL247_ORIGIN_PINCODE', ''),
        'test_token' => env('SEQUEL247_TEST_TOKEN', ''),
        'test_endpoint' => env('SEQUEL247_TEST_ENDPOINT', 'https://test.sequel247.com/'),
        'prod_token' => env('SEQUEL247_PROD_TOKEN', ''),
        'prod_endpoint' => env('SEQUEL247_PROD_ENDPOINT', 'https://sequel247.com/'),
    ],

];
