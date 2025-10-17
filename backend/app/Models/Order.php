<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Order extends Model
{
    use BelongsToTenant;
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'event_id',
        'buyer_email',
        'buyer_name',
        'amount_total_cents',
        'currency',
        'commission_rate_bps',
        'application_fee_amount_cents',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function markAsPaid(?\DateTimeInterface $paidAt = null): void
    {
        $this->status = 'paid';
        $this->paid_at = $paidAt ?? now();
    }

    public function markAsFailed(): void
    {
        $this->status = 'failed';
    }

    public function markAsRefunded(): void
    {
        $this->status = 'refunded';
    }

    public function totalItemsQuantity(): int
    {
        return (int) $this->items->sum('quantity');
    }

    public function itemsTotal(): int
    {
        return (int) $this->items->sum('total_price_cents');
    }

    public function addItem(Ticket $ticket, int $quantity): OrderItem
    {
        $unitPrice = $ticket->price_cents;
        $total = $unitPrice * $quantity;

        return $this->items()->create([
            'tenant_id' => $this->tenant_id,
            'ticket_id' => $ticket->id,
            'quantity' => $quantity,
            'unit_price_cents' => $unitPrice,
            'total_price_cents' => $total,
        ]);
    }
}
