<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Production-ready CORS whitelist configuring Storefront (3000), Admin (3001)
    | and production domains.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
        'http://127.0.0.1:3000',
        env('ADMIN_URL', 'http://localhost:3001'),
        'http://127.0.0.1:3001',
        'https://pintaara.com',
        'https://www.pintaara.com',
        'https://admin.pintaara.com',
    ]),

    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
