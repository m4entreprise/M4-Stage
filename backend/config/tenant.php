<?php

return [
    'base_domain' => env('TENANT_DOMAIN', 'localhost'),
    'fallback_commission_bps' => (int) env('STRIPE_DEFAULT_COMMISSION_BPS', 200),
    'stripe' => [
        'secret' => env('STRIPE_SECRET'),
        'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'connect_client_id' => env('STRIPE_CONNECT_CLIENT_ID'),
        'refresh_url' => env('STRIPE_CONNECT_REFRESH_URL'),
        'return_url' => env('STRIPE_CONNECT_RETURN_URL'),
    ],
    'support_headers' => [
        'X-Tenant',
        'X-Tenant-Id',
    ],
];
