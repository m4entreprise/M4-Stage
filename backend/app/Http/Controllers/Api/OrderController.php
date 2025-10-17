<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
        $this->authorizeResource(Order::class, 'order');
    }

    public function index(Request $request): JsonResponse
    {
        $this->tenantContext->ensureResolved();

        $orders = Order::query()
            ->with(['event', 'items.ticket'])
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['event', 'items.ticket', 'invoices']));
    }
}
