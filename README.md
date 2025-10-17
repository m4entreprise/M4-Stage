# M4-Stage

Plateforme SaaS multi-tenant pour organisateurs d'événements avec gestion du paiement Stripe Connect Express, facturation automatisée et tableau de bord temps réel.

## Structure du dépôt

- `backend/` – API Laravel 11 (tenancy single-DB, Stripe Checkout & Connect, webhooks, PDF DomPDF, Activity Log).
- `frontend/` – SPA React/TypeScript (Vite, Tailwind, Radix UI, React Query, Zustand) pour le dashboard organisateur et la billetterie publique.
- `docs/` – Notes d'architecture et scripts d'exploitation.
- `info.md` – Spécifications d'origine + journal de développement continu.

## Prérequis

- PHP 8.3+, Composer 2.6+
- Node.js 20+, npm
- MySQL/MariaDB, Redis (queues/session)
- Stripe API keys (clé secrète, webhook secret, Connect client ID)
- S3 compatible (Backblaze/Scaleway) pour les PDFs de facture

## Mise en route rapide

### Backend (`backend/`)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Services conseillés : `php artisan queue:work`, `php artisan horizon`, `php artisan schedule:run` (via cron).

Tests :

```bash
php artisan test
```

### Frontend (`frontend/`)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Les pages internes sont protégées par token (Sanctum). La page publique de billetterie reste accessible sur `/e/:slug`.

## Fonctionnalités livrées

- Multi-tenancy par `tenant_id` avec middleware de résolution (sous-domaine ou header `X-Tenant`).
- CRUD événements & billets, calcul d’inventaire, blocking des ventes si Stripe Connect inactif.
- Checkout Stripe (application fee, transfer_data) + webhooks idempotents qui mettent à jour commandes/stocks et génèrent deux factures PDF.
- Tableau de bord (CA, billets vendus, top events), listings commandes/factures, téléchargement lien S3.
- Onboarding Stripe Express (création/rafraîchissement du lien) et suivi statut.
- Page publique d’achat de billets avec redirection instantanée vers Stripe Checkout.
- Tests feature clés (`TenantScopeTest`, `CheckoutSessionTest`).

## Documentation complémentaire

- `backend/README.md` – détails API + scripts artisan à prévoir.
- `frontend/README.md` – usage du SPA et structure UI.
- `docs/` – ajouter les guides de déploiement (Forge, Horizon, Health) et procédures d’exploitation.

Contribuer : veillez à conserver le `journal de développement` dans `info.md` à jour lors de nouvelles itérations.
