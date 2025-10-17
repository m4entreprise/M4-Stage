import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  FileText,
  Home,
  LifeBuoy,
  Receipt,
  Settings,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/dashboard', label: 'Tableau de bord', icon: Home },
  { to: '/events', label: 'Événements', icon: CalendarDays },
  { to: '/orders', label: 'Commandes', icon: Receipt },
  { to: '/invoices', label: 'Factures', icon: FileText },
  { to: '/settings/stripe', label: 'Stripe Connect', icon: CreditCard },
];

export const Sidebar = () => (
  <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
    <div className="px-6 py-6">
      <div className="text-lg font-semibold text-slate-900">M4Stage</div>
      <p className="text-sm text-slate-500">Espace organisateur</p>
    </div>
    <nav className="flex-1 space-y-1 px-2">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="border-t border-slate-200 px-4 py-4 text-xs text-slate-400">
      v1.0.0
    </div>
  </aside>
);
