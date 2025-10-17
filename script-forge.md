# Script de déploiement Forge – M4‑Stage

```bash
cd "$FORGE_RELEASE_DIRECTORY"
bash deploy.sh

$ACTIVATE_RELEASE()
$RESTART_QUEUES()
```

> `deploy.sh` (placé à la racine du dépôt) se charge d’installer le backend, builder le frontend et copier `dist` vers `backend/public/app`. Les commandes `ACTIVATE_RELEASE` / `RESTART_QUEUES` doivent rester dans le script Forge car elles sont fournies par l’environnement Forge.
