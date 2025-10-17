<?php

namespace App\Providers;

use App\Services\Billing\InvoiceService;
use Stripe\StripeClient;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(StripeClient::class, function () {
            $secret = config('tenant.stripe.secret') ?: 'sk_test_placeholder';

            return new StripeClient($secret);
        });

        $this->app->singleton(InvoiceService::class, fn () => new InvoiceService());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
