# 🚀 Brenne Aerial Backend

Backend Node.js/Express pour Brenne Aerial.

## Démarrage Rapide

### 1. Installation
```bash
cd backend
npm install
```

### 2. Configuration PostgreSQL

**Option A: Neon (Recommandé - Cloud)**
- Aller sur https://neon.tech
- Créer une database
- Copier CONNECTION_STRING
- Ajouter à `.env.local`: `DATABASE_URL=postgresql://...`

**Option B: Local PostgreSQL**
```bash
createdb brenne_aerial
```

### 3. Créer les Tables
Copier le contenu de `src/db/schema.sql` et l'exécuter dans Neon ou PostgreSQL:
```bash
psql -d brenne_aerial -f src/db/schema.sql
```

### 4. Configuration Firebase
1. Aller à Firebase Console: https://console.firebase.google.com
2. Projet: `brenne-aerial-37443`
3. Settings → Service Accounts → Generate New Private Key
4. Copier les valeurs dans `.env.local`:
   - FIREBASE_PROJECT_ID
   - FIREBASE_PRIVATE_KEY_ID
   - FIREBASE_PRIVATE_KEY
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_CLIENT_ID

### 5. Démarrer Localement
```bash
npm run dev
```

✅ Server running on http://localhost:3000

## Variables d'Environnement

Voir `.env.example` pour la liste complète.

## API Endpoints

### Authentification
- `POST /api/auth/signup` - Créer compte
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-token` - Vérifier token Firebase
- `GET /api/auth/me` - Profil courant
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs
- `GET /api/users/me` - Profil courant
- `GET /api/users/:username` - Profil public
- `PUT /api/users/me` - Mettre à jour profil
- `GET /api/users` - Tous (admin seulement)

## Structure
```
backend/
├── src/
│   ├── server.js          # Express app
│   ├── db/
│   │   ├── pool.js        # PostgreSQL pool
│   │   └── schema.sql     # Tables
│   ├── auth/
│   │   ├── middleware.js  # JWT/Firebase verification
│   │   └── firebase.js    # Firebase admin
│   ├── routes/
│   │   ├── auth.js        # Auth endpoints
│   │   └── users.js       # User endpoints
│   ├── services/          # Stripe, Email, etc.
│   ├── models/            # DB queries
│   └── scripts/           # Migration scripts
├── package.json
├── .env.example
├── .env.local
└── render.yaml
```

## Déploiement sur Render

1. Pousser le code sur GitHub
2. Sur Render.com:
   - New Web Service
   - Connecter repo GitHub
   - Root directory: `backend/`
   - Build command: `npm install`
   - Start command: `npm start`
3. Ajouter DATABASE_URL et autres env vars
4. Deploy!

## Tester l'API

```bash
# Health check
curl http://localhost:3000/health

# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "testuser",
    "display_name": "Test User"
  }'

# Get user profile (need token)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Architecture

```
Frontend (React)
     ↓
Axios HTTP Client
     ↓
Express Backend
     ↓
PostgreSQL (Neon)
```

## Technologies

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Firebase** - Authentication
- **Stripe** - Payments
- **JWT** - Token auth
