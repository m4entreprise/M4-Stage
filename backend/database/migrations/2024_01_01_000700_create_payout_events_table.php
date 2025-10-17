<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payout_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('stripe_event_id')->unique();
            $table->enum('kind', [
                'checkout_completed',
                'payment_succeeded',
                'payment_failed',
                'transfer_created',
                'payout_paid',
                'refund_succeeded',
            ]);
            $table->json('payload');
            $table->timestamps();

            $table->index('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payout_events');
    }
};
