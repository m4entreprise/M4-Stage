<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PayoutEvent;
use App\Models\Tenant;
use App\Services\Orders\OrderService;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Symfony\Component\HttpKernel\Exception\HttpException;

class WebhookController extends Controller
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly OrderService $orderService
    ) {
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $secret = config('tenant.stripe.webhook_secret');

        if (! $secret) {
            throw new HttpException(500, 'Stripe webhook secret missing');
        }

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (\Throwable $exception) {
            Log::warning('Stripe webhook signature mismatch', ['message' => $exception->getMessage()]);

            return response()->json(['error' => 'invalid_signature'], 400);
        }

        if (PayoutEvent::query()->where('stripe_event_id', $event->id)->exists()) {
            return response()->json(['status' => 'duplicate']);
        }

        $object = $event->data->object ?? null;
        $tenantId = Arr::get($object, 'metadata.tenant_id');
        $tenant = null;

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant) {
                $this->tenantContext->set($tenant);
            }
        }

        try {
            $handled = match ($event->type) {
                'checkout.session.completed' => $this->handleCheckoutCompleted($object),
                'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($object),
                'payment_intent.payment_failed' => $this->handlePaymentFailed($object),
                'charge.refunded' => $this->handleRefunded($object),
                default => 'ignored',
            };

            if ($tenant) {
                PayoutEvent::create([
                    'tenant_id' => $tenant->id,
                    'stripe_event_id' => $event->id,
                    'kind' => $this->mapKind($event->type),
                    'payload' => json_decode(json_encode($event), true),
                ]);
            }
        } finally {
            $this->tenantContext->forget();
        }

        return response()->json(['status' => $handled]);
    }

    protected function handleCheckoutCompleted(object $session): string
    {
        $order = $this->findOrderFromMetadata($session);

        if (! $order) {
            return 'order_not_found';
        }

        $updates = [];

        if (! empty($session->payment_intent)) {
            $updates['stripe_payment_intent_id'] = $session->payment_intent;
        }

        if (! empty($session->id)) {
            $updates['stripe_checkout_session_id'] = $session->id;
        }

        if ($updates) {
            $order->fill($updates)->save();
        }

        if ($session->payment_status === 'paid') {
            $this->orderService->finalizePaidOrder($order);

            return 'paid';
        }

        return 'pending';
    }

    protected function handlePaymentIntentSucceeded(object $intent): string
    {
        $order = $this->findOrderFromMetadata($intent);

        if (! $order) {
            return 'order_not_found';
        }

        $order->stripe_payment_intent_id = $intent->id;
        $order->save();

        $this->orderService->finalizePaidOrder($order);

        return 'paid';
    }

    protected function handlePaymentFailed(object $intent): string
    {
        $order = $this->findOrderFromMetadata($intent);

        if (! $order) {
            return 'order_not_found';
        }

        $this->orderService->markAsFailed($order);

        return 'failed';
    }

    protected function handleRefunded(object $charge): string
    {
        $order = $this->findOrderFromMetadata($charge);

        if (! $order) {
            return 'order_not_found';
        }

        $this->orderService->markAsRefunded($order);

        return 'refunded';
    }

    protected function findOrderFromMetadata(object $stripeObject): ?Order
    {
        $metadata = (array) ($stripeObject->metadata ?? []);
        $orderId = $metadata['order_id'] ?? null;

        if (! $orderId) {
            return null;
        }

        return Order::find($orderId);
    }

    protected function mapKind(string $type): string
    {
        return match ($type) {
            'checkout.session.completed' => 'checkout_completed',
            'payment_intent.succeeded' => 'payment_succeeded',
            'payment_intent.payment_failed' => 'payment_failed',
            'charge.refunded' => 'refund_succeeded',
            default => 'payment_succeeded',
        };
    }
}
