<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tenant = \App\Models\Tenant::factory()->create([
            'name' => 'Demo Club',
            'slug' => 'demo-club',
            'subdomain' => 'demo',
            'stripe_status' => 'not_connected',
        ]);

        $owner = User::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Demo Owner',
            'email' => 'owner@example.com',
            'role' => 'owner',
        ]);

        $event = \App\Models\Event::factory()->create([
            'tenant_id' => $tenant->id,
            'title' => 'Soirée de lancement',
            'status' => 'published',
        ]);

        \App\Models\Ticket::factory(3)->create([
            'tenant_id' => $tenant->id,
            'event_id' => $event->id,
        ]);

        User::factory()->create([
            'tenant_id' => null,
            'name' => 'Platform Admin',
            'email' => 'admin@m4stage.test',
            'role' => 'platform_admin',
        ]);
    }
}
