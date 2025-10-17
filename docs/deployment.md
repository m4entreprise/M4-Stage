# Guide de déploiement M4-Stage

## Backend Laravel (Forge / VPS)

1. **Provision serveur** : Ubuntu 22.04, PHP 8.3, Nginx, MySQL 8, Redis.
2. **Cloner le dépôt** sur `/var/www/m4-stage/backend`.
3. **Variables d’environnement `.env`** :
   - `APP_URL`, `APP_ENV=production`, `APP_DEBUG=false`
   - Database (`DB_*`), Redis (`REDIS_*`)
   - Stripe : `STRIPE_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`, `STRIPE_CONNECT_REFRESH_URL`, `STRIPE_CONNECT_RETURN_URL`
   - Stockage : `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`, `AWS_DEFAULT_REGION`
   - `STRIPE_DEFAULT_COMMISSION_BPS` (ex: `200`), `SANCTUM_STATEFUL_DOMAINS`
4. **Install** :
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link
   ```
5. **Optimisations** : `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.
6. **Queue & Horizon** : démarrer `php artisan horizon` via Supervisor/Forge (process monitor). Activer notifications email sur échec.
7. **Scheduler** : add cron `* * * * * php /path/artisan schedule:run >> /dev/null 2>&1` (sync Stripe status, jobs planifiés).
8. **Webhooks Stripe** : exposer `https://app.m4stage.com/api/webhooks/stripe` + valider signature (`STRIPE_WEBHOOK_SECRET`).
9. **Sauvegardes** : backup MySQL quotidien + snapshots S3 des PDFs (`storage/app`).

## Frontend (Vercel/Netlify ou Nginx)

1. **Build** :
   ```bash
   npm install
   npm run build
   ```
   Génère `dist/` à servir statiquement.
2. **Variables** :
   - `VITE_API_URL=https://api.m4stage.com/api`
   - `VITE_PUBLIC_EVENT_BASE_URL=https://app.m4stage.com`
3. **Headers** : forcer HTTPS et `Cache-Control: public, max-age=300`.
4. **Fallback** : route SPA -> `index.html` (sauf `/e/*` qui reste gérée par la SPA également).

## Monitoring & observabilité

- **Laravel Health** : installer checks DB/Redis/Queue/S3/Stripe et exposer `/healthz` (ping par UptimeRobot).
- **Horizon dashboard** : protéger via basic auth ou VPN.
- **Logs** : envoyer `stack` (daily) vers service (Datadog/Logtail).
- **Alerting Stripe** : configurer emails Stripe connect + webhooks.

## Tâches à planifier

- `tenants:sync-stripe` (à implémenter) toutes les 15 minutes pour rafraîchir `stripe_status`.
- Rotation des PDF (> 30 jours) selon besoins légaux.
- Export des commandes (CSV) si requis.

## Checklist pre-prod

- [ ] Tenants de test avec Stripe Express sandbox connectés.
- [ ] Scénario E2E : onboarding -> création événement -> vente -> webhooks -> factures.
- [ ] Sauvegardes automatiques activées et test de restauration.
- [ ] Domaines configurés (`app.m4stage.com`, `*.m4stage.com`) + SSL wildcard.
