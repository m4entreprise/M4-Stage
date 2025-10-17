<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreEventRequest;
use App\Http\Requests\Api\UpdateEventRequest;
use App\Models\Event;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function index(): JsonResponse
    {
        $this->tenantContext->ensureResolved();
        $this->authorize('viewAny', Event::class);

        $events = Event::query()
            ->withCount('tickets')
            ->orderByDesc('starts_at')
            ->paginate(15);

        return response()->json($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $tenant = $this->tenantContext->ensureResolved();
        $this->authorize('create', Event::class);

        $event = Event::create($request->validated());

        return response()->json($event, 201);
    }

    public function show(Event $event): JsonResponse
    {
        $this->authorize('view', $event);
        $event->load('tickets');

        return response()->json($event);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);
        $event->fill($request->validated());
        $event->save();

        return response()->json($event);
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);
        $event->delete();

        return response()->noContent();
    }
}
