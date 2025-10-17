import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { api, getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { CheckoutSessionResponse, PublicEventResponse, Ticket } from '@/types/api';

interface CheckoutForm {
  buyer_name: string;
  buyer_email: string;
}

export const PublicEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<CheckoutForm>({ buyer_email: '', buyer_name: '' });
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: async () => {
      const response = await api.get<PublicEventResponse>(`/public/events/${slug}`);
      return response.data;
    },
    enabled: Boolean(slug),
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Événement introuvable.');
      const items = Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => ({ ticket_id: Number(ticketId), quantity }));

      if (!items.length) {
        throw new Error('Sélectionnez au moins un billet.');
      }

      const currentUrl = window.location.origin + window.location.pathname;
      const response = await api.post<CheckoutSessionResponse>(
        '/checkout/session',
        {
          event_id: data.event.id,
          buyer_email: form.buyer_email,
          buyer_name: form.buyer_name,
          items,
          success_url: `${currentUrl}?success=1`,
          cancel_url: `${currentUrl}?canceled=1`,
        },
        {
          headers: {
            'X-Tenant': data.tenant.id,
          },
        },
      );

      return response.data;
    },
    onSuccess: (payload) => {
      window.location.href = payload.checkout_url;
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Impossible de créer la session de paiement.')),
  });

  const handleQuantityChange = (ticket: Ticket, value: number) => {
    setQuantities((prev) => ({ ...prev, [ticket.id]: Math.min(value, ticket.quantity_total - ticket.quantity_sold) }));
  };

  const total = useMemo(() => {
    if (!data) return 0;
    return data.event.tickets?.reduce((sum, ticket) => {
      const qty = quantities[ticket.id] ?? 0;
      return sum + ticket.price_cents * qty;
    }, 0) ?? 0;
  }, [data, quantities]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  const { event, tenant } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-10 px-4">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{tenant.name}</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">{event.title}</h1>
          <p className="mt-3 text-slate-600">{event.description}</p>
          <div className="mt-4 text-sm text-slate-500">
            <div>Début : {formatDateTime(event.starts_at)}</div>
            {event.ends_at && <div>Fin : {formatDateTime(event.ends_at)}</div>}
            {event.venue && <div>Lieu : {event.venue}</div>}
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <Card>
            <CardTitle>Billets disponibles</CardTitle>
            <CardDescription>Sélectionnez la quantité souhaitée pour chaque catégorie.</CardDescription>
            <CardContent className="space-y-4">
              {event.tickets?.length ? (
                event.tickets.map((ticket) => {
                  const remaining = ticket.quantity_total - ticket.quantity_sold;
                  return (
                    <div key={ticket.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                      <div>
                        <div className="text-base font-medium text-slate-900">{ticket.name}</div>
                        <div className="text-sm text-slate-500">
                          {formatCurrency(ticket.price_cents, ticket.currency)} · {remaining} restants
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleQuantityChange(ticket, Math.max((quantities[ticket.id] ?? 0) - 1, 0))}
                        >
                          -
                        </Button>
                        <div className="w-10 text-center text-sm font-medium text-slate-900">
                          {quantities[ticket.id] ?? 0}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleQuantityChange(ticket, (quantities[ticket.id] ?? 0) + 1)}
                          disabled={remaining <= (quantities[ticket.id] ?? 0)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  Aucune catégorie de billet n’est disponible pour le moment.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardTitle>Votre commande</CardTitle>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buyer_name">Nom complet</Label>
                <Input
                  id="buyer_name"
                  placeholder="Jean Dupont"
                  value={form.buyer_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, buyer_name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer_email">Email</Label>
                <Input
                  id="buyer_email"
                  type="email"
                  placeholder="jean.dupont@email.com"
                  value={form.buyer_email}
                  onChange={(event) => setForm((prev) => ({ ...prev, buyer_email: event.target.value }))}
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Total TTC</span>
                  <span className="text-xl font-semibold text-slate-900">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending || !form.buyer_email || total === 0}
              >
                {checkoutMutation.isPending ? 'Redirection en cours...' : 'Passer au paiement sécurisé'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
