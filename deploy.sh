#!/usr/bin/env bash
set -euo pipefail

# Normaliser la variable Forge (certaines plateformes ajoutent un \r)
FORGE_RELEASE_DIRECTORY="${FORGE_RELEASE_DIRECTORY%$'\r'}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

if [[ ! -d "$BACKEND_DIR" ]] || [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "backend/ ou frontend/ introuvable depuis $ROOT" >&2
  exit 1
fi

COMPOSER_CMD=${FORGE_COMPOSER:-composer}
PHP_CMD=${FORGE_PHP:-php}

echo "▶ Backend: installation des dépendances"
cd "$BACKEND_DIR"
$COMPOSER_CMD install --no-dev --no-interaction --prefer-dist --optimize-autoloader

echo "▶ Backend: optimisations Artisan"
$PHP_CMD artisan optimize
$PHP_CMD artisan storage:link || true
$PHP_CMD artisan migrate --force

echo "▶ Frontend: build Vite"
cd "$FRONTEND_DIR"
npm ci
npm run build

echo "▶ Publication du bundle dans backend/public/app"
PUBLIC_DIR="$BACKEND_DIR/public/app"
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"
cp -R "$FRONTEND_DIR/dist/"* "$PUBLIC_DIR/"

echo "✔ Deploy script terminé (activation release / restart queues à effectuer dans le script Forge)."
