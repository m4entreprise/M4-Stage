<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $name = fake()->company();
        $slug = Str::slug($name.'-'.Str::random(4));

        return [
            'name' => $name,
            'slug' => $slug,
            'subdomain' => $slug,
            'stripe_status' => 'not_connected',
            'is_active' => true,
        ];
    }
}
