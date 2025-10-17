<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'event_id' => Event::factory(),
            'name' => fake()->word().' pass',
            'price_cents' => fake()->numberBetween(1000, 6000),
            'currency' => 'EUR',
            'quantity_total' => fake()->numberBetween(50, 500),
            'quantity_sold' => 0,
            'is_active' => true,
        ];
    }
}
