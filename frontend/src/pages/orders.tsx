import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { ApiPagination, Order } from '@/types/api';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const statusLabel: Record<Order['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'En attente', variant: 'warning' },
  paid: { label: 'Payée', variant: 'success' },
  failed: { label: 'Échec', variant: 'danger' },
  refunded: { label: 'Remboursée', variant: 'default' },
};

export const OrdersPage = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get<ApiPagination<Order>>('/orders');
      return response.data;
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const query = search.toLowerCase();
  const filteredOrders = data.data.filter((order) => {
    const emailMatch = order.buyer_email.toLowerCase().includes(query);
    const eventTitle = order.event?.title?.toLowerCase() ?? '';
    return emailMatch || eventTitle.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Commandes</h1>
          <p className="text-sm text-slate-500">Suivez les paiements réalisés via Stripe Checkout.</p>
        </div>
        <Input
          placeholder="Rechercher par email ou événement"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-80"
        />
      </div>

      <Card>
        <CardTitle>Historique</CardTitle>
        <CardDescription>Dernières commandes enregistrées.</CardDescription>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Événement</th>
                  <th className="px-4 py-3 text-left">Montant</th>
                  <th className="px-4 py-3 text-left">Commission M4</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredOrders.map((order) => {
                  const status = statusLabel[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(order.created_at ?? '')}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{order.buyer_name ?? '—'}</div>
                        <div className="text-xs text-slate-500">{order.buyer_email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{order.event?.title ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-900">{formatCurrency(order.amount_total_cents, order.currency)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatCurrency(order.application_fee_amount_cents, order.currency)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {!filteredOrders.length && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan={6}>
                      Aucune commande ne correspond à la recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
