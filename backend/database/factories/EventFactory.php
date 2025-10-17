<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);
        $slug = Str::slug($title.'-'.Str::random(5));

        return [
            'tenant_id' => Tenant::factory(),
            'title' => $title,
            'slug' => $slug,
            'description' => fake()->paragraph(),
            'venue' => fake()->company().' Hall',
            'city' => fake()->city(),
            'starts_at' => now()->addDays(fake()->numberBetween(7, 30)),
            'ends_at' => now()->addDays(fake()->numberBetween(7, 30))->addHours(4),
            'status' => 'draft',
        ];
    }

    public function published(): self
    {
        return $this->state(fn () => ['status' => 'published']);
    }
}
