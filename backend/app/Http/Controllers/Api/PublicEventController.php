<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;

class PublicEventController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->with(['tickets' => fn ($query) => $query->where('is_active', true)])
            ->firstOrFail();

        $this->tenantContext->set($event->tenant);

        return response()->json([
            'event' => $event,
            'tenant' => $event->tenant()->select('id', 'name', 'theme_json')->first(),
        ]);
    }
}
