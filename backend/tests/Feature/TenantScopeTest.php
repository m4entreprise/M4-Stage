<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_other_tenant_events(): void
    {
        $tenantA = Tenant::factory()->create(['slug' => 'tenant-a', 'subdomain' => 'tenant-a']);
        $tenantB = Tenant::factory()->create(['slug' => 'tenant-b', 'subdomain' => 'tenant-b']);

        $eventA = Event::factory()->create(['tenant_id' => $tenantA->id, 'status' => 'published']);
        $eventB = Event::factory()->create(['tenant_id' => $tenantB->id, 'status' => 'published']);

        $userA = User::factory()->create([
            'tenant_id' => $tenantA->id,
            'role' => 'owner',
        ]);

        Sanctum::actingAs($userA, ['*']);

        $response = $this->withHeaders(['X-Tenant' => $tenantA->id])
            ->getJson('/api/events');

        $response->assertOk();
        $response->assertJsonMissing(['id' => $eventB->id]);
        $response->assertJsonFragment(['id' => $eventA->id]);
    }
}
