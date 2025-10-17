export type StripeStatus = 'not_connected' | 'pending' | 'active';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  stripe_status: StripeStatus;
  commission_rate_bps: number | null;
  theme_json?: Record<string, unknown> | null;
}

export interface User {
  id: number;
  tenant_id: string | null;
  name: string;
  email: string;
  role: 'platform_admin' | 'owner' | 'manager' | 'staff';
  tenant?: Tenant | null;
}

export interface Event {
  id: number;
  tenant_id: string;
  title: string;
  slug: string;
  description?: string | null;
  venue?: string | null;
  city?: string | null;
  starts_at: string;
  ends_at?: string | null;
  status: 'draft' | 'published' | 'archived';
  cover_image_path?: string | null;
  tickets?: Ticket[];
}

export interface Ticket {
  id: number;
  tenant_id: string;
  event_id: number;
  name: string;
  price_cents: number;
  currency: string;
  quantity_total: number;
  quantity_sold: number;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  ticket_id: number;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  ticket?: Ticket;
}

export interface Order {
  id: number;
  tenant_id: string;
  event_id: number;
  buyer_email: string;
  buyer_name?: string | null;
  amount_total_cents: number;
  application_fee_amount_cents: number;
  commission_rate_bps: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at?: string | null;
  created_at?: string;
  items?: OrderItem[];
  event?: Event;
  invoices?: Invoice[];
}

export interface Invoice {
  id: number;
  tenant_id: string;
  order_id?: number | null;
  type: 'client_receipt' | 'm4_commission';
  number: string;
  pdf_path: string;
  amount_cents: number;
  currency: string;
  issued_at: string;
  order?: Order;
}

export interface DashboardMetrics {
  period: { start: string; end: string };
  metrics: {
    total_revenue_cents: number;
    tickets_sold: number;
    orders_paid: number;
  };
  top_events: Array<{
    id: number;
    title: string;
    starts_at: string;
    revenue?: number;
  }>;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  order_id: number;
}

export interface ApiPagination<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface PublicEventResponse {
  event: Event;
  tenant: Pick<Tenant, 'id' | 'name' | 'theme_json'>;
}
