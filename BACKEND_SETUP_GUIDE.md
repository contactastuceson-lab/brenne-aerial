# 🛠️ Démarrage du Backend Node.js: Guide Pas à Pas

## Étape 1: Créer le Projet Backend

```bash
# À la racine de votre projet
mkdir backend
cd backend
npm init -y
```

### package.json complet:
```json
{
  "name": "brenne-aerial-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "NODE_ENV=development node --watch src/server.js",
    "migrate": "node src/scripts/migrate-firestore.js",
    "seed": "node src/scripts/seed-db.js"
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
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Installer les dépendances:
```bash
npm install
npm install --save-dev nodemon
```

---

## Étape 2: Créer la Structure des Dossiers

```bash
mkdir -p src/{db,auth,routes,services,models,scripts,utils}
touch src/server.js
touch src/.env.local
touch .env.example
```

---

## Étape 3: Configuration PostgreSQL

### `src/db/pool.js` - Connexion PostgreSQL
```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Erreur pool PostgreSQL:', err);
});

// Test de connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL non connecté:', err);
  } else {
    console.log('✅ PostgreSQL connecté:', res.rows[0].now);
  }
});

export default pool;
```

### `src/db/schema.sql` - Toutes les Tables

**Copier/coller ce SQL dans Neon Dashboard:**

```sql
-- Users Table
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
  role VARCHAR(50) DEFAULT 'user', -- user, admin, owner, vip, etc.
  verified_status VARCHAR(20) DEFAULT 'no', -- yes, no, pending
  account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned, restricted
  two_factor_enabled BOOLEAN DEFAULT false,
  totp_secret VARCHAR(255),
  fcm_token TEXT, -- Firebase Cloud Messaging token
  badges TEXT[], -- Array of badges
  verifications TEXT[], -- Array of verifications
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  ui_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  blocked_day_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Projects Table (Drone/Aerial projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(author_id, target_user_id)
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- message, appointment, payment, etc.
  title VARCHAR(255),
  body TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Payments/Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50), -- basic, premium, enterprise
  status VARCHAR(50), -- active, cancelled, expired
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Audit Log Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## Étape 4: Authentification & Middleware

### `src/auth/middleware.js` - JWT Verification
```javascript
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Option 1: Vérifier Firebase ID Token
export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
};

// Option 2: Vérifier JWT Custom (Recommandé avec Express)
export const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Générer JWT depuis userId/email
export const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware optionnel (permet d'être anonyme)
export const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignorer l'erreur, continuer comme anonyme
    }
  }

  next();
};

// Middleware pour les admins
export const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};
```

### `src/auth/firebase.js` - Firebase Admin Setup
```javascript
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

export const firebaseApp = admin.app();
export const firebaseAuth = admin.auth();
export const firebaseMessaging = admin.messaging();
export const firebaseDB = admin.firestore();

export default admin;
```

---

## Étape 5: Routes d'Authentification

### `src/routes/auth.js` - Login, Signup, etc.
```javascript
import express from 'express';
import { pool } from '../db/pool.js';
import { generateJWT, verifyFirebaseToken } from '../auth/middleware.js';
import { firebaseAuth } from '../auth/firebase.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, username, display_name } = req.body;

  try {
    // 1. Créer utilisateur dans Firebase
    const firebaseUser = await firebaseAuth.createUser({
      email,
      password,
      displayName: display_name
    });

    // 2. Créer utilisateur dans PostgreSQL
    const result = await pool.query(
      `INSERT INTO users 
      (id, email, username, display_name, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [firebaseUser.uid, email, username, display_name, 'user']
    );

    // 3. Générer JWT
    const token = generateJWT(result.rows[0]);

    res.status(201).json({
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier avec Firebase
    // (Normalement côté frontend avec Firebase SDK)
    // Ici on reçoit déjà le token Firebase

    // Récupérer utilisateur PostgreSQL
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = generateJWT(user);

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/verify-token (Vérifier un token Firebase)
router.post('/verify-token', verifyFirebaseToken, async (req, res) => {
  try {
    // req.user vient du middleware Firebase
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [req.user.email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not registered' });
    }

    const user = result.rows[0];
    const jwtToken = generateJWT(user);

    res.json({ user, token: jwtToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/auth/me (Profil utilisateur courant)
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [req.user.email]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Client supprime le token du localStorage
  res.json({ message: 'Logged out' });
});

export default router;
```

---

## Étape 6: Routes CRUD Utilisateurs

### `src/routes/users.js` - Profils
```javascript
import express from 'express';
import { pool } from '../db/pool.js';
import { verifyJWT, optionalAuth, requireAdmin } from '../auth/middleware.js';

const router = express.Router();

// GET /api/users/:username (Profil public)
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, display_name, bio, avatar_url, role, verified_status, badges FROM users WHERE username = $1',
      [req.params.username]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/me (Profil courant, authentifié)
router.get('/me', verifyJWT, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/me (Mettre à jour profil)
router.put('/me', verifyJWT, async (req, res) => {
  const { display_name, bio, phone, location, website, avatar_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
      SET display_name = $1, bio = $2, phone = $3, location = $4, website = $5, avatar_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [display_name, bio, phone, location, website, avatar_url, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users (List all - Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, display_name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## Étape 7: Server Principal

### `src/server.js` - Express App
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

---

## Étape 8: Variables d'Environnement

### `.env.local` (À remplir)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Firebase
FIREBASE_PROJECT_ID=brenne-aerial-37443
FIREBASE_PRIVATE_KEY_ID=xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=xxxxx@xxxxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxx

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# URLs
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:3000
NODE_ENV=development

# Email
SENDGRID_API_KEY=SG.xxxxx

# Outlook
OUTLOOK_CLIENT_ID=xxxxx
OUTLOOK_CLIENT_SECRET=xxxxx
```

### `.env.example` (Sans secrets, pour partager)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_PROJECT_ID=your_project_id
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## Étape 9: Lancer Localement

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm run dev

# Vous verrez:
# ✅ PostgreSQL connecté
# ✅ Server running on http://localhost:3000
```

---

## Étape 10: Tester les Routes

### Avec curl:
```bash
# Test health
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

# Get user public profile
curl http://localhost:3000/api/users/testuser

# Get my profile (besoin token)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ✅ Checklist: Vous Êtes Prêt Quand

- [ ] PostgreSQL connectée à Neon
- [ ] Backend Node.js lancé localement
- [ ] Routes /api/auth/* fonctionnent
- [ ] Routes /api/users/* fonctionnent
- [ ] Données utilisateurs dans PostgreSQL
- [ ] JWT génération fonctionne
- [ ] Authentification Firebase fonctionne

**Prochaine étape:** Convertir les 60 Deno functions → Express routes! 🚀
