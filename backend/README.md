# M4Stage API (Laravel 11)

Backend Laravel pour la plateforme M4Stage. Fournit l'API multi-tenant, l'intégration Stripe Connect Express, la génération de factures PDF et les webhooks de paiement.

## Prérequis

- PHP 8.3+
- Composer 2.6+
- MySQL/MariaDB
- Redis
- Node.js 20+ (pour Vite/Tailwind si besoin d'assets Mail/PDF)
- Stripe (clé secrète, webhook signing secret et Connect client id)

## Installation locale

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
```

Démarrer les services de développement :

```bash
php artisan serve
php artisan queue:work
php artisan horizon
```

## Tests

```bash
php artisan test
```

## Scripts utiles

- `php artisan tenants:sync-stripe` (à créer) : synchronisation périodique de l'état Connect.
- `php artisan invoicing:regenerate` (à créer) : régénération des factures si besoin.

## Structure clés

- `app/Http` : contrôleurs API, middleware multitenant, FormRequests.
- `app/Services` : Stripe (Checkout & Connect) + facturation PDF.
- `app/Support/TenantContext.php` : contexte courant du tenant résolu depuis le sous-domaine ou les headers (`X-Tenant`).
- `app/Policies` : policies d'accès scoping strict par `tenant_id`.
- `database/migrations` : schéma complet (tenants, events, tickets, orders, invoices, payout_events).
- `resources/views/invoices` : templates Blade pour PDF.

## Webhooks Stripe

Configurer Stripe à pointer vers `/api/webhooks/stripe` et fournir `STRIPE_WEBHOOK_SECRET`. L'API journalise chaque événement dans `payout_events` (idempotence) puis met à jour commandes, stocks et factures.

## Next Steps

- Ajouter des commandes artisan pour le monitoring (`laravel/health`) et la remontée Horizon.
- Provisionner un bucket S3 et mettre à jour `FILESYSTEM_DISK`.
- Connecter le frontend React (`frontend/`) aux endpoints documentés.
