import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { ApiPagination, Invoice } from '@/types/api';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const typeLabels: Record<Invoice['type'], { label: string; variant: 'default' | 'success' }> = {
  client_receipt: { label: 'Reçu client', variant: 'default' },
  m4_commission: { label: 'Commission M4', variant: 'success' },
};

export const InvoicesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get<ApiPagination<Invoice>>('/invoices');
      return response.data;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await api.get<{ invoice: Invoice; download_url: string }>(`/invoices/${invoiceId}`);
      return response.data.download_url;
    },
    onSuccess: (url) => {
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Lien de téléchargement indisponible.');
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Téléchargement impossible.')),
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Factures</h1>
        <p className="text-sm text-slate-500">Téléchargez les reçus clients et la facture de commission M4.</p>
      </div>

      <Card>
        <CardTitle>Historique</CardTitle>
        <CardDescription>Documents générés automatiquement après chaque commande.</CardDescription>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Numéro</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Montant</th>
                  <th className="px-4 py-3 text-left">Émise le</th>
                  <th className="px-4 py-3 text-left">Commande</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.data.map((invoice) => {
                  const descriptor = typeLabels[invoice.type];
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{invoice.number}</td>
                      <td className="px-4 py-3">
                        <Badge variant={descriptor.variant}>{descriptor.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-900">{formatCurrency(invoice.amount_cents, invoice.currency)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(invoice.issued_at)}</td>
                      <td className="px-4 py-3 text-slate-500">{invoice.order_id ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => downloadMutation.mutate(invoice.id)}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="h-4 w-4" /> Télécharger
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!data.data.length && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan={6}>
                      Aucune facture disponible pour le moment.
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
