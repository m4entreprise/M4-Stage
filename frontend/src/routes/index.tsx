import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { EventsPage } from '@/pages/events';
import { EventDetailPage } from '@/pages/event-detail';
import { OrdersPage } from '@/pages/orders';
import { InvoicesPage } from '@/pages/invoices';
import { StripeSettingsPage } from '@/pages/stripe-settings';
import { PublicEventPage } from '@/pages/public-event';

const DashboardRoutes = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

export const AppRoutes = () =>
  useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '/e/:slug', element: <PublicEventPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardRoutes />,
          children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: '/dashboard', element: <DashboardPage /> },
            { path: '/events', element: <EventsPage /> },
            { path: '/events/:id', element: <EventDetailPage /> },
            { path: '/orders', element: <OrdersPage /> },
            { path: '/invoices', element: <InvoicesPage /> },
            { path: '/settings/stripe', element: <StripeSettingsPage /> },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ]);
