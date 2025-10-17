<?php

namespace App\Services\Stripe;

use App\Models\Order;
use App\Models\Tenant;
use Stripe\StripeClient;

class StripeCheckoutService
{
    public function __construct(private readonly StripeClient $stripe)
    {
    }

    /**
     * @param array<int, array{price_data?: array, quantity: int, adjustable_quantity?: array, price?: string}> $lineItems
     */
    public function createSession(Order $order, Tenant $tenant, array $lineItems, string $successUrl, string $cancelUrl): object
    {
        $payload = [
            'mode' => 'payment',
            'customer_email' => $order->buyer_email,
            'line_items' => $lineItems,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'order_id' => $order->id,
                'tenant_id' => $tenant->id,
            ],
            'payment_intent_data' => [
                'application_fee_amount' => $order->application_fee_amount_cents,
                'metadata' => [
                    'order_id' => $order->id,
                    'tenant_id' => $tenant->id,
                ],
            ],
        ];

        if ($tenant->stripe_status !== 'active' || ! $tenant->stripe_account_id) {
            abort(422, __('Le compte Stripe Connect doit être actif avant de vendre des billets.'));
        }

        $payload['payment_intent_data']['transfer_data'] = [
            'destination' => $tenant->stripe_account_id,
        ];

        return $this->stripe->checkout->sessions->create($payload);
    }

    public function retrieveSession(string $sessionId): object
    {
        return $this->stripe->checkout->sessions->retrieve($sessionId, []);
    }
}
