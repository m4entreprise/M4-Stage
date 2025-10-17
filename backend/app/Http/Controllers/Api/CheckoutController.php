<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutSessionRequest;
use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use App\Services\Stripe\StripeCheckoutService;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly StripeCheckoutService $checkoutService
    ) {
    }

    public function create(CheckoutSessionRequest $request): JsonResponse
    {
        $tenant = $this->tenantContext->ensureResolved();
        $payload = $request->validated();

        $event = $this->resolveEvent($payload);

        $ticketIds = collect($payload['items'])->pluck('ticket_id')->all();

        $order = null;
        $lineItems = [];

        DB::transaction(function () use ($tenant, $payload, $ticketIds, &$order, &$lineItems, $event) {
            $tickets = Ticket::query()
                ->where('event_id', $event->id)
                ->whereIn('id', $ticketIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($tickets->count() !== count($ticketIds)) {
                throw new UnprocessableEntityHttpException(__('Certains billets sont indisponibles.'));
            }

            $totalCents = 0;
            $orderItems = [];

            foreach ($payload['items'] as $item) {
                $ticket = $tickets[$item['ticket_id']];

                if (! $ticket->is_active) {
                    throw new UnprocessableEntityHttpException(__('Un billet sélectionné est inactif.'));
                }

                if ($ticket->remaining() < $item['quantity']) {
                    throw new UnprocessableEntityHttpException(__('Stock insuffisant pour le billet : :name', ['name' => $ticket->name]));
                }

                $lineItems[] = [
                    'quantity' => $item['quantity'],
                    'price_data' => [
                        'currency' => $ticket->currency,
                        'product_data' => [
                            'name' => $ticket->name,
                        ],
                        'unit_amount' => $ticket->price_cents,
                    ],
                ];

                $orderItems[] = [$ticket, $item['quantity']];
                $totalCents += $ticket->price_cents * $item['quantity'];
            }

            $commissionRate = $tenant->commissionRate();
            $applicationFee = (int) round($totalCents * ($commissionRate / 10000));

            $order = Order::create([
                'event_id' => $event->id,
                'buyer_email' => $payload['buyer_email'],
                'buyer_name' => $payload['buyer_name'] ?? null,
                'amount_total_cents' => $totalCents,
                'currency' => $tickets->first()->currency,
                'commission_rate_bps' => $commissionRate,
                'application_fee_amount_cents' => $applicationFee,
            ]);

            foreach ($orderItems as [$ticket, $quantity]) {
                $order->addItem($ticket, $quantity);
            }
        });

        $session = $this->checkoutService->createSession(
            $order,
            $tenant,
            $lineItems,
            $payload['success_url'],
            $payload['cancel_url']
        );

        $order->update([
            'stripe_checkout_session_id' => $session->id,
        ]);

        return response()->json([
            'checkout_url' => $session->url,
            'order_id' => $order->id,
        ]);
    }

    protected function resolveEvent(array $payload): Event
    {
        if (isset($payload['event_id'])) {
            return Event::findOrFail($payload['event_id']);
        }

        return Event::where('slug', $payload['event_slug'])->firstOrFail();
    }
}
