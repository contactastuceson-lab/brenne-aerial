# 🚀 Plan Complet de Migration: Base44 → Render + Neon

## 📋 Résumé Exécutif

Vous avez une application Base44 complexe (60+ fonctions serverless, 50+ entités, authentification Firebase, Firestore, Stripe). Voici comment **complètement sortir de base44** et migrer vers Render + Neon.

---

## 1️⃣ ANALYSE ACTUELLE DE VOTRE ARCHITECTURE

### Frontend
- **Framework**: React 18.2 + Vite
- **Dépendances majeures**: React Router, React Query, Radix UI, Firebase SDK
- **Build**: `npm run build` → `/dist`
- **État**: Fonctionne indépendamment, prêt à migrer

### Backend (Actuellement Base44)
- **Runtime**: Deno (sur plateforme Base44)
- **Fonctions**: 60+ Deno functions (serverless)
- **SDK**: `@base44/sdk` v0.8+
- **Authentification**: Firebase + Base44
- **Données**: Firestore (Firebase document store)

### Services Externes
- **Firebase**: Auth + Firestore + Cloud Messaging
- **Stripe**: Paiements/abonnements
- **Outlook**: Intégration calendrier
- **SendGrid/Email**: Notifications email
- **Neon/PostgreSQL**: À configurer

### Données à Migrer
- **Entités**: 50+ collections Firestore
- **Utilisateurs**: Rôles complexes (owner, admin, VIP, etc.)
- **Fonctions**: 60+ serverless functions

---

## 2️⃣ PLAN ÉTAPE PAR ÉTAPE

### Phase 1: Préparation & Infrastructure (1-2 jours)

#### 1.1 Créer les Comptes & Services
```bash
# 1. Render (render.com)
- Créer compte Render
- Connexion GitHub

# 2. Neon PostgreSQL (neon.tech)
- Créer projet Neon
- Créer database
- Obtenir CONNECTION_STRING

# 3. Auth0 (optionnel mais recommandé)
- Remplacer Firebase Auth si souhaité
- OU: Garder Firebase Auth + implémenter custom JWT
```

#### 1.2 Configurer PostgreSQL
```bash
# Neon connection string
DATABASE_URL=postgresql://user:password@host:port/database

# Tables à créer: Users, Appointments, Messages, etc.
# Basé sur vos 50+ entités Firestore
```

#### 1.3 Préparer Variables d'Environnement
```bash
# Backend (.env.local)
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLIC_KEY=pk_...
FIREBASE_PROJECT_ID=brenne-aerial-37443
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
OUTLOOK_CLIENT_ID=...
OUTLOOK_CLIENT_SECRET=...
JWT_SECRET=your_secret
APP_URL=https://brenne-aerial.onrender.com
```

---

### Phase 2: Créer le Backend Node.js/Express (3-5 jours)

#### 2.1 Structure du Projet Backend
```
backend/
├── src/
│   ├── server.js              # Express app
│   ├── db/
│   │   ├── pool.js            # PostgreSQL pool
│   │   └── migrations/        # SQL migrations
│   ├── auth/
│   │   ├── middleware.js      # JWT verification
│   │   └── firebase.js        # Firebase integration
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   ├── users.js           # /api/users/*
│   │   ├── messages.js        # /api/messages/*
│   │   ├── appointments.js    # /api/appointments/*
│   │   └── ...                # 60+ routes (basé sur functions)
│   ├── services/
│   │   ├── email.js           # SendGrid
│   │   ├── stripe.js          # Stripe webhooks
│   │   ├── outlook.js         # Outlook sync
│   │   └── firebase-admin.js  # FCM
│   ├── models/
│   │   ├── user.js            # User queries
│   │   ├── appointment.js     # Appointment queries
│   │   └── ...
│   └── utils/
│       ├── validators.js
│       └── helpers.js
├── .env.local
├── package.json
└── render.yaml                # Render config
```

#### 2.2 Créer package.json Backend
```json
{
  "name": "brenne-aerial-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node src/db/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "stripe": "^14.21.0",
    "firebase-admin": "^12.0.0",
    "jsonwebtoken": "^9.1.2",
    "nodemailer": "^6.9.7",
    "axios": "^1.6.8"
  }
}
```

#### 2.3 Implémenter l'Authentification

**Option A: Firebase Auth (Plus simple, garder ce qui existe)**
```javascript
// src/auth/middleware.js
import admin from 'firebase-admin';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Option B: JWT Custom (Plus de contrôle)**
```javascript
// src/auth/middleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 2.4 Implémenter Express Server
```javascript
// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
// ... autres routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### Phase 3: Migrer les Données (2-3 jours)

#### 3.1 Créer les Tables PostgreSQL

**user** - Base
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  bio TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  website VARCHAR(255),
  avatar_url TEXT,
  cover_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  verified_status VARCHAR(20) DEFAULT 'no',
  account_status VARCHAR(20) DEFAULT 'active',
  two_factor_enabled BOOLEAN DEFAULT false,
  totp_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

**appointments**
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

**... Créer toutes les autres tables selon vos entités**

#### 3.2 Script de Migration Firestore → PostgreSQL
```javascript
// src/scripts/migrate-firestore.js
import admin from 'firebase-admin';
import { pool } from '../db/pool.js';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});

const db = admin.firestore();

async function migrateUsers() {
  const usersSnapshot = await db.collection('users').get();
  const client = await pool.connect();
  
  try {
    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      await client.query(
        `INSERT INTO users 
        (id, email, username, display_name, bio, phone, location, website, avatar_url, cover_url, role, verified_status, account_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          doc.id, user.email, user.username, user.display_name, 
          user.bio, user.phone, user.location, user.website,
          user.avatar_url, user.cover_url, user.role || 'user',
          user.verified_status || 'no', user.account_status || 'active'
        ]
      );
    }
    console.log('✅ Users migrated');
  } finally {
    client.release();
  }
}

// Appeler tous les migrate* functions
await migrateUsers();
// ... autres collections
```

---

### Phase 4: Convertir les Fonctions Base44 → Routes Express (4-5 jours)

#### 4.1 Pattern de Conversion

**Base44 Function (Deno)**
```typescript
// base44/functions/createBillingPortal/entry.ts
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    // ... logic
  }
});
```

**Express Route (Node.js)**
```javascript
// src/routes/billing.js
import express from 'express';
import { verifyToken } from '../auth/middleware.js';
import stripe from 'stripe';

const router = express.Router();
const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-billing-portal', verifyToken, async (req, res) => {
  try {
    const user = req.user; // From middleware
    
    // Get customer from Stripe
    const customers = await stripeClient.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (!customers.data.length) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const session = await stripeClient.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: process.env.APP_URL + '/billing'
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### 4.2 Liste des 60+ Fonctions à Convertir

| Fonction Base44 | Route Express | Priorité |
|---|---|---|
| createBillingPortal | POST /api/billing/portal | 🔴 Haute |
| sendVerificationCode | POST /api/auth/send-verification | 🔴 Haute |
| verifyLoginCode | POST /api/auth/verify | 🔴 Haute |
| createDeviceSession | POST /api/sessions/create | 🔴 Haute |
| emailNotification | POST /api/email/send | 🟡 Moyenne |
| generateQuotePDF | POST /api/quotes/pdf | 🟡 Moyenne |
| handleStripeWebhook | POST /api/webhooks/stripe | 🔴 Haute |
| deleteOutlookAppointment | DELETE /api/appointments/:id/outlook | 🟡 Moyenne |
| sendBroadcastPush | POST /api/notifications/broadcast | 🟡 Moyenne |
| ... (50+ autres) | ... | ... |

#### 4.3 Convertir les 10 Fonctions Critiques D'abord
1. **Authentification** (verifyLoginCode, sendVerificationCode)
2. **Sessions** (createDeviceSession, deleteDeviceSession)
3. **Paiements** (createBillingPortal, handleStripeWebhook)
4. **Notifications** (emailNotification, sendBroadcastPush)
5. **Données** (Toutes les GET/POST/PUT/DELETE pour entités)

---

### Phase 5: Configurer le Frontend (1-2 jours)

#### 5.1 Remplacer l'API Base44 Client

**Avant (Base44)**
```javascript
// src/api/base44Client.js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  token: import.meta.env.VITE_BASE44_TOKEN,
  serverUrl: '',
  appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL
});
```

**Après (Express)**
```javascript
// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Intercepter les requêtes pour ajouter le JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
```

#### 5.2 Créer des Services API

```javascript
// src/services/userService.js
import client from '@/api/client';

export const userService = {
  getCurrentUser: () => client.get('/users/me'),
  updateProfile: (data) => client.put('/users/me', data),
  getPublicProfile: (username) => client.get(`/users/${username}`),
};

// src/services/appointmentService.js
export const appointmentService = {
  list: () => client.get('/appointments'),
  create: (data) => client.post('/appointments', data),
  update: (id, data) => client.put(`/appointments/${id}`, data),
  delete: (id) => client.delete(`/appointments/${id}`),
};
```

#### 5.3 Mettre à Jour AuthContext

```javascript
// src/lib/AuthContext.jsx
import { useEffect, useState } from 'react';
import client from '@/api/client';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await client.get('/users/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('authToken', data.token);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 5.4 Variables d'Environnement Frontend

```env
# .env.local
VITE_API_URL=http://localhost:3000/api  # Dev
VITE_API_URL=https://brenne-aerial-backend.onrender.com/api  # Production
```

---

### Phase 6: Déployer sur Render (1 jour)

#### 6.1 Backend Render Setup

**render.yaml**
```yaml
services:
  - type: web
    name: brenne-aerial-backend
    env: node
    region: fra  # Frankfurt, Europe
    plan: standard
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: brenne-aerial-postgres
          property: connectionString
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: JWT_SECRET
        sync: false

databases:
  - name: brenne-aerial-postgres
    engine: postgresql
    version: "15"
    plan: starter
```

**Deploy sur Render**
```bash
# 1. Push votre repo GitHub
git push origin main

# 2. Créer nouveau Web Service sur render.com
# - Connecter le repo GitHub
# - Choisir la branche (main)
# - Utiliser le render.yaml

# 3. Ajouter les variables d'environnement dans Render dashboard
```

#### 6.2 Frontend Render Setup

**Render Static Site**
```bash
# 1. Build: npm run build
# 2. Publish directory: ./dist
# 3. Root directory: ./

# Variable d'environnement
VITE_API_URL=https://brenne-aerial-backend.onrender.com/api
```

---

### Phase 7: Configurer les Services Externes (2-3 jours)

#### 7.1 Firebase Cloud Messaging → Neon + Node Backend

**Garder FCM, mais via backend**
```javascript
// src/services/notifications.js
import admin from 'firebase-admin';

const messaging = admin.messaging();

export async function sendNotification(userId, title, body) {
  // Récupérer le token FCM de l'utilisateur depuis PostgreSQL
  const result = await pool.query(
    'SELECT fcm_token FROM users WHERE id = $1',
    [userId]
  );
  
  if (result.rows[0]?.fcm_token) {
    await messaging.send({
      token: result.rows[0].fcm_token,
      notification: { title, body }
    });
  }
}
```

#### 7.2 Stripe Webhooks

```javascript
// src/routes/webhooks.js
import express from 'express';
import stripe from 'stripe';

const router = express.Router();

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch(event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Mettre à jour la DB
        break;
      case 'payment_intent.succeeded':
        // Traiter le paiement
        break;
    }
    
    res.json({received: true});
  } catch (error) {
    res.status(400).send(`Webhook error: ${error.message}`);
  }
});

export default router;
```

#### 7.3 Outlook Integration

```javascript
// src/services/outlook.js
import axios from 'axios';

export async function syncOutlookAppointment(appointmentData) {
  const token = await getOutlookToken(); // Implémenter OAuth2
  
  await axios.post('https://graph.microsoft.com/v1.0/me/events', {
    subject: appointmentData.title,
    start: { dateTime: appointmentData.start_time, timeZone: 'UTC' },
    end: { dateTime: appointmentData.end_time, timeZone: 'UTC' }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

---

### Phase 8: Tests & Optimisation (2-3 jours)

#### 8.1 Tests Frontend
```bash
npm run build
npm run preview
```

#### 8.2 Tests Backend
```bash
npm test
npm run dev  # Test localement
```

#### 8.3 Tests d'Intégration
- Login → Session → Appointment → Notification
- Paiement → Stripe webhook → DB update
- Authentification → JWT validation

---

## 3️⃣ TIMELINE GLOBALE

| Phase | Durée | Priorité |
|-------|-------|----------|
| 1. Préparation | 1-2 jours | 🔴 Critique |
| 2. Backend Node.js | 3-5 jours | 🔴 Critique |
| 3. Migration Données | 2-3 jours | 🔴 Critique |
| 4. Convertir Functions | 4-5 jours | 🔴 Critique |
| 5. Frontend Update | 1-2 jours | 🟡 Important |
| 6. Déploiement | 1 jour | 🟡 Important |
| 7. Services Externes | 2-3 jours | 🟡 Important |
| 8. Tests & Bugfix | 2-3 jours | 🟢 Essentiel |
| **TOTAL** | **16-26 jours** | **3-4 semaines** |

---

## 4️⃣ ALTERNATIVES PLUS RAPIDES

### Option A: Supabase (Plus rapide: 2 semaines)
- PostgreSQL + Auth + Real-time inclus
- SDK similaire à Firebase
- Moins de code à écrire

### Option B: Firebase → Firestore sur Render (1 semaine)
- Garder le même backend logique
- Juste conteneuriser et déployer

### Option C: Neon + Custom JWT (Recommandé, 3 semaines)
- Maximum de contrôle
- PostgreSQL natif
- Scalabilité facile

---

## 5️⃣ RESSOURCES & LIENS

- **Render Docs**: https://render.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Express.js**: https://expressjs.com
- **PostgreSQL Migrations**: https://node-postgres.com
- **Firebase Admin SDK**: https://firebase.google.com/docs/admin/setup

---

## 6️⃣ CHECKLIST FINAL

- [ ] Comptes créés (Render, Neon)
- [ ] DB PostgreSQL configurée
- [ ] Backend Node.js créé
- [ ] Routes API implémentées
- [ ] Données migrées depuis Firestore
- [ ] Frontend connecté au nouveau backend
- [ ] Services externes reconfigurés
- [ ] Tests passent
- [ ] Déployé sur Render
- [ ] Domaine pointé vers Render

---

**Vous êtes prêt à quitter Base44 ! 🚀**

Voulez-vous que je commence par créer la structure du backend Node.js ?
