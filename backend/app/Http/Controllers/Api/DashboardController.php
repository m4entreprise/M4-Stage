<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Order;
use App\Support\TenantContext;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function overview(Request $request): JsonResponse
    {
        $tenant = $this->tenantContext->ensureResolved();

        $start = $request->date('start_date', CarbonImmutable::now()->startOfMonth());
        $end = $request->date('end_date', CarbonImmutable::now()->endOfMonth());

        $ordersQuery = Order::query()
            ->where('status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->with('items');

        $revenueQuery = clone $ordersQuery;
        $ticketsQuery = clone $ordersQuery;
        $countQuery = clone $ordersQuery;

        $totalRevenue = (int) $revenueQuery->sum('amount_total_cents');
        $ticketsSold = (int) $ticketsQuery->get()->pluck('items')->flatten()->sum('quantity');

        $topEvents = Event::query()
            ->withSum(['orders as revenue' => fn ($query) => $query->where('status', 'paid')], 'amount_total_cents')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get(['id', 'title', 'starts_at']);

        return response()->json([
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'metrics' => [
                'total_revenue_cents' => $totalRevenue,
                'tickets_sold' => $ticketsSold,
                'orders_paid' => $countQuery->count(),
            ],
            'top_events' => $topEvents,
        ]);
    }
}
