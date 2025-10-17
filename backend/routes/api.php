<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\PublicEventController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\StripeConnectController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard/overview', [DashboardController::class, 'overview']);

    Route::apiResource('events', EventController::class);
    Route::apiResource('events.tickets', TicketController::class)->shallow();

    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);

    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);

    Route::post('stripe/connect/link', [StripeConnectController::class, 'createLink']);
    Route::get('stripe/connect/status', [StripeConnectController::class, 'status']);
});

Route::post('checkout/session', [CheckoutController::class, 'create']);
Route::post('webhooks/stripe', [WebhookController::class, 'handle']);

Route::prefix('public')->group(function () {
    Route::get('events/{slug}', [PublicEventController::class, 'show']);
});
