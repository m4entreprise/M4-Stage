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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('buyer_email');
            $table->string('buyer_name')->nullable();
            $table->unsignedInteger('amount_total_cents');
            $table->char('currency', 3)->default('EUR');
            $table->unsignedInteger('commission_rate_bps');
            $table->unsignedInteger('application_fee_amount_cents');
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_checkout_session_id')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status', 'created_at']);
            $table->unique(['tenant_id', 'stripe_checkout_session_id']);
            $table->unique(['tenant_id', 'stripe_payment_intent_id']);
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
