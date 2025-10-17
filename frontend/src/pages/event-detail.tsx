import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { api, getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Event, Ticket } from '@/types/api';

interface TicketFormValues {
  name: string;
  price: number;
  quantity_total: number;
}

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isTicketDialogOpen, setTicketDialogOpen] = useState(false);

  const eventQuery = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get<Event>(`/events/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  const event = eventQuery.data;

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (!event) return;
      const nextStatus = event.status === 'published' ? 'draft' : 'published';
      const response = await api.put<Event>(`/events/${event.id}`, { status: nextStatus });
      return response.data;
    },
    onSuccess: (updated) => {
      toast.success('Statut mis à jour.');
      eventQuery.refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Impossible de changer le statut.')),
  });

  const createTicketMutation = useMutation({
    mutationFn: async (payload: TicketFormValues) => {
      if (!event) throw new Error('Pas d’événement.');
      const response = await api.post<Ticket>(`/events/${event.id}/tickets`, {
        name: payload.name,
        price_cents: Math.round(payload.price * 100),
        quantity_total: Number(payload.quantity_total),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Billet ajouté.');
      setTicketDialogOpen(false);
      eventQuery.refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Impossible d’ajouter le billet.')),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    defaultValues: {
      name: '',
      price: 25,
      quantity_total: 100,
    },
  });

  const onCreateTicket = handleSubmit((values) => {
    createTicketMutation.mutate(values);
  });

  const publicUrl = useMemo(() => {
    if (!event) return null;
    const base = import.meta.env.VITE_PUBLIC_EVENT_BASE_URL ?? window.location.origin;
    return `${base}/e/${event.slug}`;
  }, [event]);

  const handleCopyUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Lien copié dans le presse-papier.');
  };

  if (eventQuery.isLoading || !event) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Retour
      </Button>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>Slug : {event.slug}</CardDescription>
          <CardContent className="space-y-4">
            <div className="flex gap-3 text-sm text-slate-600">
              <div>
                <div>Début</div>
                <div className="font-medium text-slate-900">{formatDateTime(event.starts_at)}</div>
              </div>
              {event.ends_at && (
                <div>
                  <div>Fin</div>
                  <div className="font-medium text-slate-900">{formatDateTime(event.ends_at)}</div>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              {event.venue && <div>Lieu : <span className="font-medium text-slate-900">{event.venue}</span></div>}
              {event.city && <div>Ville : <span className="font-medium text-slate-900">{event.city}</span></div>}
            </div>
            {event.description && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Description</h4>
                <p className="mt-1 text-sm text-slate-600">{event.description}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Badge variant={event.status === 'published' ? 'success' : event.status === 'draft' ? 'default' : 'warning'}>
                {event.status}
              </Badge>
              <Button variant="outline" onClick={() => toggleStatusMutation.mutate()} disabled={toggleStatusMutation.isPending}>
                {event.status === 'published' ? 'Repasse en brouillon' : 'Publier l’événement'}
              </Button>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-slate-500">Lien billetterie</div>
                  <div className="font-medium text-slate-900">{publicUrl}</div>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleCopyUrl}>
                  Copier
                </Button>
                <Button variant="ghost" className="gap-1" onClick={() => window.open(publicUrl ?? '#', '_blank')}>
                  <ExternalLink className="h-4 w-4" /> Ouvrir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Ajouter un billet</CardTitle>
          <CardDescription>Créez une nouvelle catégorie de place.</CardDescription>
          <CardContent>
            <Dialog open={isTicketDialogOpen} onOpenChange={(open) => {
              setTicketDialogOpen(open);
              if (!open) reset();
            }}>
              <DialogTrigger asChild>
                <Button>Ajouter un billet</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Billet</DialogTitle>
                <DialogDescription>Définissez un tarif fixe par billet.</DialogDescription>
                <form className="space-y-4" onSubmit={onCreateTicket}>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-name">Nom</Label>
                    <Input id="ticket-name" required {...register('name', { required: true })} />
                    {errors.name && <p className="text-xs text-rose-600">Nom requis.</p>}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-price">Prix (EUR)</Label>
                      <Input id="ticket-price" type="number" min="0" step="0.5" required {...register('price', { valueAsNumber: true, required: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-qty">Quantité totale</Label>
                      <Input id="ticket-qty" type="number" min="1" required {...register('quantity_total', { valueAsNumber: true, required: true })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" type="button" onClick={() => setTicketDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={createTicketMutation.isPending}>
                      {createTicketMutation.isPending ? 'Enregistrement...' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardTitle>Billets</CardTitle>
        <CardDescription>Suivi des stocks et prix.</CardDescription>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Prix</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {event.tickets?.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{ticket.name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatCurrency(ticket.price_cents, ticket.currency)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {ticket.quantity_sold} / {ticket.quantity_total}
                    </td>
                  </tr>
                ))}
                {!event.tickets?.length && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan={3}>
                      Aucun billet pour le moment.
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
