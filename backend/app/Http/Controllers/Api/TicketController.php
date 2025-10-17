<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTicketRequest;
use App\Http\Requests\Api\UpdateTicketRequest;
use App\Models\Event;
use App\Models\Ticket;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function index(Event $event): JsonResponse
    {
        $this->tenantContext->ensureResolved();
        $this->authorize('view', $event);

        return response()->json(
            $event->tickets()->orderBy('price_cents')->get()
        );
    }

    public function store(StoreTicketRequest $request, Event $event): JsonResponse
    {
        $this->tenantContext->ensureResolved();
        $this->authorize('update', $event);

        $ticket = $event->tickets()->create($request->validated());

        return response()->json($ticket, 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $this->authorize('view', $ticket);

        return response()->json($ticket);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);

        $ticket->fill($request->validated());
        $ticket->save();

        return response()->json($ticket);
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        return response()->noContent();
    }
}
