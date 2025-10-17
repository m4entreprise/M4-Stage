import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { api, getErrorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { ApiPagination, Event } from '@/types/api';

interface EventFormValues {
  title: string;
  description?: string;
  venue?: string;
  city?: string;
  starts_at: string;
  ends_at?: string;
}

const statusVariant: Record<Event['status'], 'default' | 'success' | 'warning'> = {
  draft: 'default',
  published: 'success',
  archived: 'warning',
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get<ApiPagination<Event>>('/events');
      return response.data;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: EventFormValues) => {
      const response = await api.post<Event>('/events', payload);
      return response.data;
    },
    onSuccess: (event) => {
      toast.success('Événement créé.');
      setDialogOpen(false);
      eventsQuery.refetch();
      navigate(`/events/${event.id}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Impossible de créer l’événement.'));
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      title: '',
      description: '',
      venue: '',
      city: '',
      starts_at: '',
      ends_at: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    createEventMutation.mutate(values);
  });

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      reset();
    }
  };

  if (eventsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const events = eventsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Événements</h1>
          <p className="text-sm text-slate-500">Gérez vos événements publiés ou en brouillon.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Créer un événement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Nouvel événement</DialogTitle>
            <DialogDescription className="mb-4 text-slate-500">
              Renseignez les informations principales. Vous pourrez compléter ensuite.
            </DialogDescription>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" required {...register('title', { required: true })} />
                {errors.title && <p className="text-xs text-rose-600">Titre requis.</p>}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Début</Label>
                  <Input id="starts_at" type="datetime-local" required {...register('starts_at', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">Fin</Label>
                  <Input id="ends_at" type="datetime-local" {...register('ends_at')} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="venue">Lieu</Label>
                  <Input id="venue" placeholder="Nom du club / salle" {...register('venue')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" placeholder="Paris" {...register('city')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                  {...register('description')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardTitle>Liste des évènements</CardTitle>
        <CardDescription>Accédez au détail et au suivi des ventes.</CardDescription>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Dates</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{event.title}</div>
                      <div className="text-xs text-slate-500">Slug : {event.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>Début : {formatDateTime(event.starts_at)}</div>
                      {event.ends_at && <div>Fin : {formatDateTime(event.ends_at)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" onClick={() => navigate(`/events/${event.id}`)}>
                        Ouvrir
                      </Button>
                    </td>
                  </tr>
                ))}
                {!events.length && (
                  <tr>
                    <td className="px-4 py-12 text-center text-slate-500" colSpan={4}>
                      Aucun événement pour le moment.
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
