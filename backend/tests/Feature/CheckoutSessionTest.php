<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\Ticket;
use App\Services\Stripe\StripeCheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_session_creation_calculates_commission(): void
    {
        $tenant = Tenant::factory()->create([
            'stripe_status' => 'active',
            'stripe_account_id' => 'acct_test123',
            'commission_rate_bps' => 200,
        ]);

        $event = Event::factory()->create([
            'tenant_id' => $tenant->id,
            'status' => 'published',
        ]);

        $ticket = Ticket::factory()->create([
            'tenant_id' => $tenant->id,
            'event_id' => $event->id,
            'price_cents' => 2500,
            'quantity_total' => 100,
            'quantity_sold' => 0,
        ]);

        $this->mock(StripeCheckoutService::class, function ($mock) use ($tenant) {
            $mock->shouldReceive('createSession')->once()->andReturn((object) [
                'id' => 'cs_test_123',
                'url' => 'https://stripe.test/checkout',
            ]);
        });

        $response = $this->withHeaders(['X-Tenant' => $tenant->id])->postJson('/api/checkout/session', [
            'event_id' => $event->id,
            'buyer_email' => 'client@example.com',
            'buyer_name' => 'Client Test',
            'items' => [
                ['ticket_id' => $ticket->id, 'quantity' => 2],
            ],
            'success_url' => 'https://example.com/success',
            'cancel_url' => 'https://example.com/cancel',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['checkout_url' => 'https://stripe.test/checkout']);

        $this->assertDatabaseHas('orders', [
            'tenant_id' => $tenant->id,
            'event_id' => $event->id,
            'amount_total_cents' => 5000,
            'application_fee_amount_cents' => 100,
        ]);
    }
}
