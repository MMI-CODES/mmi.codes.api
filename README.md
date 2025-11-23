# mmi.codes.api (Backend)

API REST pour le portail étudiant MMI. Développée avec **Node.js**, **Express** et **SQLite3**.

## 🚀 Installation

1.  Allez dans le dossier de l'API.
2.  Installez les dépendances :

```bash
npm install
```

## 🛠️ Démarrage Local

Pour lancer le serveur en local :

```bash
npm start
```

Le serveur écoute sur le port `3000`.

## 🐳 Docker

L'API est conteneurisée pour faciliter le déploiement.

### Variables d'environnement

| Variable | Description | Valeur par défaut |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | Mot de passe pour les actions d'administration (POST/DELETE) | `84679512` |

### Persistance des données

La base de données SQLite est stockée dans `/app/data`. Il est **crucial** de monter un volume pour ne pas perdre les données lors du redémarrage du conteneur.

### Commandes Docker

**1. Construire l'image :**

```bash
docker build -t mmi-codes-api .
```

**2. Lancer le conteneur :**

```bash
docker run -d \
  -p 3000:3000 \
  -v mmi-data:/app/data \
  -e ADMIN_PASSWORD="votre_mot_de_passe_securise" \
  --name api \
  mmi-codes-api
```

*   `-p 3000:3000` : Expose le port 3000.
*   `-v mmi-data:/app/data` : Utilise un volume nommé `mmi-data` pour persister la base de données.
*   `-e ADMIN_PASSWORD="..."` : Définit le mot de passe administrateur.

## 🔒 Sécurité

Les routes `POST /api/tools` et `DELETE /api/tools/:id` sont protégées. Elles nécessitent le header `x-admin-password` correspondant à la variable d'environnement `ADMIN_PASSWORD`.
