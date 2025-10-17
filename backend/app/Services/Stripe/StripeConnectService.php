<?php

namespace App\Services\Stripe;

use App\Models\Tenant;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class StripeConnectService
{
    public function __construct(private readonly StripeClient $stripe)
    {
    }

    public function createOnboardingLink(Tenant $tenant): array
    {
        $accountId = $tenant->stripe_account_id ?? $this->createExpressAccount($tenant);

        $refreshUrl = config('tenant.stripe.refresh_url') ?? config('app.url');
        $returnUrl = config('tenant.stripe.return_url') ?? config('app.url');

        $link = $this->stripe->accountLinks->create([
            'account' => $accountId,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);

        return [
            'url' => $link->url,
            'expires_at' => $link->expires_at,
        ];
    }

    public function syncAccountStatus(Tenant $tenant): Tenant
    {
        if (! $tenant->stripe_account_id) {
            return $tenant;
        }

        $account = $this->stripe->accounts->retrieve($tenant->stripe_account_id, []);
        $status = $this->determineStatus($account);

        $tenant->update([
            'stripe_status' => $status,
        ]);

        return $tenant->refresh();
    }

    protected function createExpressAccount(Tenant $tenant): string
    {
        $account = $this->stripe->accounts->create([
            'type' => 'express',
            'country' => 'FR',
            'business_type' => 'company',
            'email' => $tenant->users()->first()?->email,
            'metadata' => [
                'tenant_id' => $tenant->id,
            ],
        ]);

        $tenant->update([
            'stripe_account_id' => $account->id,
            'stripe_status' => $this->determineStatus($account),
        ]);

        return $account->id;
    }

    protected function determineStatus(object $account): string
    {
        $transfers = Arr::get($account, 'capabilities.transfers');

        return match ($transfers) {
            'active' => 'active',
            'pending' => 'pending',
            default => 'not_connected',
        };
    }
}
