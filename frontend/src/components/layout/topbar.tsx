import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const getStripeBadge = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Stripe actif', variant: 'success' as const };
    case 'pending':
      return { label: 'Stripe en attente', variant: 'warning' as const };
    default:
      return { label: 'Stripe non connecté', variant: 'danger' as const };
  }
};

export const Topbar = () => {
  const { user, logout } = useAuth();
  const tenant = useTenant();
  const stripe = getStripeBadge(tenant?.stripe_status ?? 'not_connected');

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-slate-500">{tenant ? tenant.name : 'Plateforme M4Stage'}</p>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Bienvenue, {user?.name ?? 'invité'}</h2>
          <Badge variant={stripe.variant}>{stripe.label}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">{user?.email}</span>
        <Button variant="ghost" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </div>
    </header>
  );
};
