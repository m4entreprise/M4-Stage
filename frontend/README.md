# M4Stage Frontend (React + Vite)

SPA en React/TypeScript pour le back-office organisateur et la billetterie publique. UI construite avec TailwindCSS, Radix UI et React Query.

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

La variable `VITE_API_URL` doit pointer vers l'API Laravel (ex: `http://localhost:8000/api`). `VITE_PUBLIC_EVENT_BASE_URL` est utilisée pour générer les liens publics (par défaut l'adresse du frontend).

## Structure

- `src/routes` – Définition du router, `ProtectedRoute`.
- `src/pages` – Pages métiers (dashboard, événements, commandes, Stripe, public event).
- `src/components` – UI (boutons, cartes, layout) et composants partagés.
- `src/store` – State global (Zustand) pour l'authentification.
- `src/lib` – Axios instance, utilitaires (formatage).
- `src/providers` – Providers globaux (auth synchronisée avec l'API).

## Fonctionnalités

- Authentification Sanctum (token) avec persistance locale.
- Dashboard analytics (CA, tickets vendus, top événements).
- CRUD événements et billetterie (dialogues de création, liens publics).
- Listing commandes et factures avec téléchargement.
- Onboarding Stripe Connect Express.
- Page publique `/e/:slug` pour l'achat de billets (redirection Stripe Checkout).

## Lint & build

```bash
npm run lint
npm run build
```
