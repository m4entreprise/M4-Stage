# Architecture fonctionnelle

## Vue d'ensemble

```
Client (SPA React) ──► API Laravel ──► MySQL (multi-tenant via tenant_id)
                        │
                        ├─► Stripe (Checkout + Connect Express)
                        ├─► Redis (queue Horizon + cache)
                        └─► S3 (stockage factures)
```

- **Tenancy** : tous les modèles métier possèdent un `tenant_id`. Un middleware (`ResolveTenant`) résout le tenant depuis le sous-domaine ou le header `X-Tenant` et injecte un scope global.
- **Auth** : Sanctum (tokens personnels) pour l'espace organisateur. Les tokens sont stockés côté SPA (Zustand) et envoyés dans l'entête `Authorization`.
- **Stripe** :
  - Création `Checkout Session` avec `application_fee_amount` (commission M4) + `transfer_data.destination` (compte Express du tenant).
  - Webhooks traitent `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` avec journalisation `payout_events`.
  - Onboarding Express (account link) et synchronisation `stripe_status`.
- **Facturation** : `InvoiceService` génère deux PDFs (reçu client + facture commission). Stockage S3, lien signé exposé via `/invoices/{id}`.
- **PDF/Queue** : génération en transaction + job (si besoin). Horizon surveille les jobs.

## Modules clés

- `App\Support\TenantContext` : singleton request-scoped contenant le tenant courant.
- `App\Scopes\TenantScope` + `BelongsToTenant` : ensures `tenant_id` scoping et auto-attribution à la création.
- `StripeConnectService` / `StripeCheckoutService` : wrap Stripe SDK et centralisent la logique (account link, checkout).
- `OrderService` : finalise commandes payées, met à jour stocks et factures.
- `PublicEventController` : endpoint public pour la billetterie (pas d'auth, slug).

## Flux de paiement

1. Client visite `/e/{slug}` → sélection billets → SPA appelle `POST /checkout/session`.
2. Backend crée la commande pending, calcule total + commission, appelle Stripe Checkout (transfer direct tenant).
3. Stripe redirige vers Checkout, à la réussite : webhooks marquent commande `paid`, incrémentent le stock, génèrent les 2 factures.
4. La plateforme conserve uniquement la commission dans son solde Stripe, le reste est versé au compte Express du tenant.

## Sécurité & conformité

- `tenant_id` obligatoire sur chaque requête API (policies + scope).
- Validation `FormRequest` sur toutes les mutations.
- Webhooks Stripe vérifiés par signature (`STRIPE_WEBHOOK_SECRET`) et idempotence via `payout_events`.
- Activity log (Spatie) enrichi de `tenant_id` pour audit.
- CSRF protégé par Sanctum côté organisateur, API publique en `POST` avec validations strictes.

## Frontend

- Auth persistante via Zustand + React Query pour synchroniser `/auth/me`.
- Layout responsive Tailwind/shadcn, toasts Sonner pour feedback.
- Modules : `Dashboard`, `Events`, `Orders`, `Invoices`, `Stripe Connect`, `PublicEvent`.
- Gestion multi-tenant côté client : header `X-Tenant` ajouté automatiquement dès qu'un tenant est connu.

## Backlog court terme

- Jobs artisan dédiés (`tenants:sync-stripe`, `invoicing:regenerate`).
- Implémentation exports CSV commandes/factures.
- Ajout tests additionnels (webhooks, policies d’accès) et tests e2e.
- Health-check complet `laravel/health` + UI Ops (Horizon, UptimeRobot).
