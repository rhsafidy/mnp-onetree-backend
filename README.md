# Un Touriste — Un Arbre | Backend API
**Madagascar National Parks | DSII / RCDA | NestJS + Prisma + PostgreSQL**

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | NestJS 10 |
| ORM | Prisma 5 |
| Base de données | PostgreSQL |
| Auth | JWT (access 15min + refresh 7j) |
| Validation | class-validator |
| Documentation | Swagger / OpenAPI |
| Upload fichiers | Multer |

---

## Installation

### 1. Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### 2. Cloner et installer

```bash
cd backend
npm install
```

### 3. Variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs :
# DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

### 4. Base de données

```bash
# Créer les tables
npm run prisma:migrate

# Générer le client Prisma
npm run prisma:generate

# Injecter les données initiales
npm run prisma:seed
```

### 5. Lancer en développement

```bash
npm run start:dev
# API disponible sur http://localhost:3000/api/v1
# Swagger sur     http://localhost:3000/api/docs
```

---

## Endpoints

### Auth

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/auth/login` | Login → access + refresh token |
| POST | `/api/v1/auth/refresh` | Renouveler l'access token |
| POST | `/api/v1/auth/logout` | Invalider le refresh token |

### Users

| Méthode | Route | Rôle requis |
|---------|-------|-------------|
| GET | `/api/v1/users` | admin |
| GET | `/api/v1/users/me` | tous |
| POST | `/api/v1/users` | admin |
| PATCH | `/api/v1/users/:id` | admin |
| DELETE | `/api/v1/users/:id` | admin |

### Parcels

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/parcels` | Liste toutes les parcelles + comptage arbres |
| GET | `/api/v1/parcels/:id` | Détail d'une parcelle |
| POST | `/api/v1/parcels` | Créer (admin) |
| PATCH | `/api/v1/parcels/:id` | Modifier (admin) |
| DELETE | `/api/v1/parcels/:id` | Supprimer (admin) |

### Trees

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/trees` | Liste avec filtres |
| GET | `/api/v1/trees/stats` | Comptage par statut |
| GET | `/api/v1/trees/qr/:externalId` | Chercher par QR code |
| GET | `/api/v1/trees/:id` | Détail + photos |
| POST | `/api/v1/trees` | Planter un arbre |
| PATCH | `/api/v1/trees/:id` | Mise à jour (suivi mensuel) |
| DELETE | `/api/v1/trees/:id` | Supprimer |

**Filtres GET /trees :**
```
?parcelId=xxx
?healthStatus=planted
?touristId=xxx
```

### Tourists

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/tourists` | Liste tous les touristes |
| GET | `/api/v1/tourists/:id` | Détail + arbres parrainés |
| POST | `/api/v1/tourists` | Créer un touriste |
| PATCH | `/api/v1/tourists/:id` | Modifier |
| DELETE | `/api/v1/tourists/:id` | Supprimer |

### Photos

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/photos/upload` | Upload photo (multipart/form-data) |
| GET | `/api/v1/photos?treeId=xxx` | Photos d'un arbre |
| DELETE | `/api/v1/photos/:id` | Supprimer |

**Corps du upload :**
```
file:   [fichier JPEG]
treeId: uuid de l'arbre
type:   plantation | monthly | replanting
```

### Sync (endpoints mobiles)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/sync/push` | Mobile → Serveur (envoi des données offline) |
| GET | `/api/v1/sync/pull?since=ISO_DATE` | Serveur → Mobile (récupérer les nouveautés) |

---

## Flux de synchronisation mobile

### PUSH — Mobile envoie ses données

```json
POST /api/v1/sync/push
Authorization: Bearer <accessToken>

{
  "deviceId": "868676d72543c968",
  "entries": [
    {
      "typeAction":   "CREATE",
      "tableTarget":  "trees",
      "entityId":     "uuid-de-larbre",
      "payloadJson":  "{\"id\":\"uuid\",\"external_id\":\"QR-00001\",\"health_status\":\"planted\",\"height_cm\":35,\"latitude\":-18.8210,\"longitude\":48.4215,\"plantation_date\":\"2026-04-22T09:30:00.000Z\"}"
    },
    {
      "typeAction":   "CREATE",
      "tableTarget":  "tourists",
      "entityId":     "uuid-du-touriste",
      "payloadJson":  "{\"id\":\"uuid\",\"name\":\"Jean Dupont\",\"email\":\"jean@example.com\",\"nationality\":\"French\"}"
    },
    {
      "typeAction":   "UPDATE",
      "tableTarget":  "trees",
      "entityId":     "uuid-de-larbre",
      "payloadJson":  "{\"tourist_id\":\"uuid-du-touriste\"}"
    }
  ]
}
```

**Réponse :**
```json
{
  "synced":   3,
  "failed":   0,
  "errors":   [],
  "syncedAt": "2026-04-22T12:30:00.000Z"
}
```

### PULL — Mobile récupère les nouveautés

```
GET /api/v1/sync/pull?since=2026-04-01T00:00:00.000Z
Authorization: Bearer <accessToken>
```

**Réponse :**
```json
{
  "trees":    [...],
  "parcels":  [...],
  "tourists": [...],
  "pulledAt": "2026-04-22T12:30:00.000Z"
}
```

---

## Utilisateurs par défaut (seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@mnp.mg | MNP@2026 | admin |
| agent@mnp.mg | MNP@2026 | agent |
| accueil@mnp.mg | MNP@2026 | receptionist |

> ⚠️ Changer les mots de passe en production.

---

## Structure du projet

```
src/
├── main.ts                   Démarrage, Swagger, pipes globaux
├── app.module.ts             Module racine
├── prisma/
│   ├── prisma.service.ts     Client Prisma (singleton global)
│   └── prisma.module.ts      Module global
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts       Login, refresh, logout
│   ├── auth.controller.ts    POST /auth/login|refresh|logout
│   ├── strategies/
│   │   ├── jwt.strategy.ts   Vérification du Bearer token
│   │   └── local.strategy.ts Vérification email/password
│   ├── guards/
│   │   ├── jwt-auth.guard.ts  Protège les routes avec JWT
│   │   ├── local-auth.guard.ts Pour le login
│   │   └── roles.guard.ts    Contrôle d'accès par rôle
│   ├── decorators/
│   │   ├── roles.decorator.ts  @Roles('admin')
│   │   └── current-user.decorator.ts @CurrentUser()
│   └── dto/
│       ├── login.dto.ts
│       └── refresh.dto.ts
├── users/          CRUD agents MNP
├── parcels/        CRUD parcelles de restauration
├── trees/          CRUD arbres + stats
├── tourists/       CRUD touristes parrains
├── photos/         Upload + gestion photos
└── sync/
    ├── sync.service.ts    Traitement du batch mobile
    ├── sync.controller.ts POST /sync/push, GET /sync/pull
    └── dto/sync-payload.dto.ts
prisma/
├── schema.prisma   Schéma de la base de données
└── seed.ts         Données initiales
```

---

## Cohérence avec l'application mobile

| Mobile (Flutter/SQLite) | API (NestJS/PostgreSQL) |
|-------------------------|-------------------------|
| `Tree.externalId` | `tree.externalId` (UNIQUE) |
| `Tree.syncPending = true` | → entre dans `sync_queue` Flutter |
| `SyncService.syncAll()` | → `POST /sync/push` |
| `SyncService.getPullData()` | → `GET /sync/pull` |
| `PhotoRepository.saveLocally()` | → `POST /photos/upload` |
| `SessionService.saveSession()` | ← `POST /auth/login` |
| `SessionService.token` | → `Authorization: Bearer` header |

---

## Déploiement production

```bash
# Build
npm run build

# Migrer la DB de production
npm run prisma:migrate:prod

# Démarrer
npm run start
```

Variables d'environnement obligatoires en production :

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<chaîne aléatoire longue>
JWT_REFRESH_SECRET=<autre chaîne aléatoire>
NODE_ENV=production
```
