import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { DashboardMetrics } from '@/types/api';

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const response = await api.get<DashboardMetrics>('/dashboard/overview');
      return response.data;
    },
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const { metrics, top_events: topEvents } = data;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardTitle>Chiffre d'affaires</CardTitle>
          <CardDescription>Période du {data.period.start} au {data.period.end}</CardDescription>
          <CardContent className="mt-5 text-3xl font-semibold text-slate-900">
            {formatCurrency(metrics.total_revenue_cents)}
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Billets vendus</CardTitle>
          <CardContent className="mt-5 text-3xl font-semibold text-slate-900">
            {metrics.tickets_sold}
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Commandes payées</CardTitle>
          <CardContent className="mt-5 text-3xl font-semibold text-slate-900">
            {metrics.orders_paid}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardTitle>Top événements</CardTitle>
        <CardDescription>Classement par chiffre d'affaires</CardDescription>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Événement</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Revenu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {topEvents.map((event) => {
                  const revenue = event.revenue ? Number(event.revenue) : 0;
                  return (
                    <tr key={event.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{event.title}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(event.starts_at)}</td>
                      <td className="px-4 py-3 text-right text-slate-900">
                        {revenue > 0 ? formatCurrency(revenue) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
