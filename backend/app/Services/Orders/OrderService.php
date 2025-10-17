<?php

namespace App\Services\Orders;

use App\Models\Order;
use App\Models\PayoutEvent;
use App\Models\Ticket;
use App\Services\Billing\InvoiceService;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private readonly InvoiceService $invoiceService)
    {
    }

    public function finalizePaidOrder(Order $order): Order
    {
        if ($order->status === 'paid') {
            return $order;
        }

        DB::transaction(function () use ($order) {
            $order->loadMissing(['items.ticket', 'tenant']);

            foreach ($order->items as $item) {
                $ticket = Ticket::whereKey($item->ticket_id)->lockForUpdate()->first();

                if (! $ticket) {
                    continue;
                }

                $ticket->increment('quantity_sold', $item->quantity);
            }

            $order->markAsPaid();
            $order->save();

            $this->invoiceService->generateClientInvoice($order);
            $this->invoiceService->generateCommissionInvoice($order);
        });

        return $order->refresh();
    }

    public function markAsFailed(Order $order): Order
    {
        $order->markAsFailed();
        $order->save();

        return $order;
    }

    public function markAsRefunded(Order $order): Order
    {
        $order->markAsRefunded();
        $order->save();

        return $order;
    }
}
