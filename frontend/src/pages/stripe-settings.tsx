import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';
import type { Tenant } from '@/types/api';

const statusLabels: Record<Tenant['stripe_status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  active: { label: 'Connecté', variant: 'success' },
  pending: { label: 'En cours de validation', variant: 'warning' },
  not_connected: { label: 'Non connecté', variant: 'danger' },
};

export const StripeSettingsPage = () => {
  const { tenant } = useAuth();
  const updateTenant = useAuthStore((state) => state.updateTenant);

  const statusQuery = useQuery({
    queryKey: ['stripe-status'],
    queryFn: async () => {
      const response = await api.get<{ stripe_status: Tenant['stripe_status']; stripe_account_id?: string | null }>('/stripe/connect/status');
      if (tenant) {
        updateTenant({ ...tenant, stripe_status: response.data.stripe_status } satisfies Tenant);
      }
      return response.data;
    },
    enabled: Boolean(tenant),
    staleTime: 30_000,
  });

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<{ onboarding_url: string }>('/stripe/connect/link');
      return response.data.onboarding_url;
    },
    onSuccess: (url) => {
      toast.success('Redirection vers Stripe Connect...');
      window.location.href = url;
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Impossible de démarrer l’onboarding.')),
  });

  const status = tenant ? statusLabels[tenant.stripe_status] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Stripe Connect</h1>
        <p className="text-sm text-slate-500">Connectez votre compte Stripe Express pour recevoir les paiements directement.</p>
      </div>

      <Card>
        <CardTitle>Statut du compte</CardTitle>
        <CardDescription>Mise à jour automatique via les webhooks Stripe.</CardDescription>
        <CardContent className="space-y-4">
          {!tenant ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Spinner /> Chargement du tenant...
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Badge variant={status?.variant ?? 'default'}>{status?.label ?? 'Inconnu'}</Badge>
              <Button variant="ghost" className="gap-2" onClick={() => statusQuery.refetch()} disabled={statusQuery.isRefetching}>
                <RefreshCw className="h-4 w-4" /> Rafraîchir
              </Button>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              Stripe Connect Express est requis pour percevoir les revenus. Une fois votre compte actif, les ventes
              seront automatiquement partagées entre M4Stage et votre solde Stripe.
            </p>
          </div>

          <Button onClick={() => onboardingMutation.mutate()} disabled={onboardingMutation.isPending || tenant?.stripe_status === 'active'}>
            {tenant?.stripe_status === 'active' ? 'Compte actif' : 'Lancer l’onboarding Stripe'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
