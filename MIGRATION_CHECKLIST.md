# 📋 Checklist Complète: Migration Base44 → Render + Neon

## 🎯 Vue d'Ensemble

```
┌─────────────────────────────────────┐
│    VOTRE ARCHITECTURE ACTUELLE      │
├─────────────────────────────────────┤
│ Frontend: React + Vite              │
│ Backend: Base44 (Deno functions)    │
│ DB: Firestore (NoSQL)               │
│ Auth: Firebase + Base44             │
│ Hosting: Base44                     │
└─────────────────────────────────────┘
              ⬇️ MIGRER VERS ⬇️
┌─────────────────────────────────────┐
│   NOUVELLE ARCHITECTURE             │
├─────────────────────────────────────┤
│ Frontend: React + Vite → Netlify    │
│ Backend: Express + Node.js → Render │
│ DB: PostgreSQL (Neon)               │
│ Auth: Firebase + Custom JWT         │
│ Hosting: Render + Netlify           │
└─────────────────────────────────────┘
```

---

## 📅 Timeline Recommandée

**Durée totale: 3-4 semaines**

### Semaine 1: Infrastructure & Backend
- [ ] **Jour 1-2**: Créer comptes (Render, Neon, Netlify)
- [ ] **Jour 3**: Configurer PostgreSQL et tables
- [ ] **Jour 4-5**: Backend Express de base (auth + 5 routes)
- [ ] **Jour 6-7**: Tests locaux backend

### Semaine 2: Données & Routes
- [ ] **Jour 1-2**: Script migration Firestore → PostgreSQL
- [ ] **Jour 3-4**: Convertir 20-30 routes critiques
- [ ] **Jour 5-7**: Convertir routes restantes

### Semaine 3: Frontend & Déploiement
- [ ] **Jour 1-2**: Créer services Axios
- [ ] **Jour 3**: Mettre à jour AuthContext
- [ ] **Jour 4-5**: Remplacer base44Client partout
- [ ] **Jour 6**: Tests intégration frontend-backend
- [ ] **Jour 7**: Déployer sur Render + Netlify

### Semaine 4: Production & Monitoring
- [ ] **Jour 1-3**: Tests en production
- [ ] **Jour 4-5**: Bugs & optimisations
- [ ] **Jour 6-7**: Migration données finale + cutover

---

## 📦 Phase 1: Infrastructure (Jours 1-3)

### Infrastructure
- [ ] Créer compte Render.com
- [ ] Créer compte Neon.tech
- [ ] Créer compte Netlify.com (optionnel, Render aussi possible)
- [ ] Connecter GitHub à Render
- [ ] Créer PostgreSQL database sur Neon
- [ ] Obtenir CONNECTION_STRING Neon
- [ ] Copier les SQL migrations dans Neon dashboard

### Configuration Firebase
- [ ] Générer Firebase Service Account JSON
- [ ] Extraire FIREBASE_PROJECT_ID
- [ ] Extraire FIREBASE_PRIVATE_KEY
- [ ] Extraire FIREBASE_CLIENT_EMAIL
- [ ] Activer Firebase Admin SDK

### Services Externes
- [ ] Copier STRIPE_SECRET_KEY et STRIPE_PUBLIC_KEY
- [ ] Copier OUTLOOK_CLIENT_ID et OUTLOOK_CLIENT_SECRET
- [ ] Préparer JWT_SECRET (générer: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

---

## 💻 Phase 2: Backend Node.js (Jours 4-10)

### Structure & Setup
- [ ] `mkdir backend && cd backend`
- [ ] `npm init -y`
- [ ] Installer dépendances: `npm install express pg cors dotenv stripe firebase-admin jsonwebtoken`
- [ ] Créer structure: `mkdir -p src/{db,auth,routes,services,models,scripts}`

### Database
- [ ] Créer `src/db/pool.js` (connexion PostgreSQL)
- [ ] Créer `src/db/schema.sql` (toutes les tables)
- [ ] Exécuter schema.sql dans Neon dashboard
- [ ] Tester connexion: `node -e "import('./src/db/pool.js').then(()=>process.exit(0))"`

### Authentication
- [ ] Créer `src/auth/middleware.js` (JWT verification)
- [ ] Créer `src/auth/firebase.js` (Firebase Admin setup)
- [ ] Tester Firebase connection

### Routes de Base
- [ ] `src/routes/auth.js` (signup, login, verify)
- [ ] `src/routes/users.js` (get, update)
- [ ] `src/server.js` (Express app)
- [ ] Tester localement: `npm run dev`

### Routes CRUD (À convertir depuis Deno functions)
- [ ] `src/routes/appointments.js`
- [ ] `src/routes/messages.js`
- [ ] `src/routes/projects.js`
- [ ] `src/routes/billing.js`
- [ ] `src/routes/webhooks.js` (Stripe)
- [ ] ... (autres routes selon vos 60 functions)

### Services
- [ ] `src/services/email.js` (EmailNotification)
- [ ] `src/services/firebase.js` (FCM notifications)
- [ ] `src/services/stripe.js` (Stripe operations)
- [ ] `src/services/outlook.js` (Outlook sync)

### Tests Locaux
- [ ] `npm run dev` lancé
- [ ] Health check: `curl http://localhost:3000/health`
- [ ] Signup test: `curl -X POST http://localhost:3000/api/auth/signup ...`
- [ ] Login test
- [ ] Appointments CRUD test

---

## 🗃️ Phase 3: Migration de Données (Jours 11-13)

### Script de Migration
- [ ] Créer `src/scripts/migrate-firestore.js`
- [ ] Implémenter: export Firestore collections
- [ ] Implémenter: transform documents
- [ ] Implémenter: insert dans PostgreSQL

### Exécution
- [ ] Backup Firestore d'abord: `gcloud firestore export gs://your-bucket/backup`
- [ ] Tester migration sur une copie de DB
- [ ] Exécuter migration: `npm run migrate`
- [ ] Valider les données:
  - [ ] Comparer counts (Firestore vs PostgreSQL)
  - [ ] Vérifier foreign keys
  - [ ] Vérifier intégrité des données
  - [ ] Tester requêtes critiques

---

## 🎨 Phase 4: Frontend (Jours 14-17)

### Services API
- [ ] `src/api/client.js` (Axios + interceptors)
- [ ] `src/services/userService.js`
- [ ] `src/services/appointmentService.js`
- [ ] `src/services/messageService.js`
- [ ] `src/services/authService.js`
- [ ] `src/services/billingService.js`
- [ ] ... (tous les services selon les routes)

### Authentification
- [ ] `src/lib/auth-store.js` (Zustand) OU `AuthContext.jsx`
- [ ] Mettre à jour pour utiliser `authService`
- [ ] Tester login flow

### Remplacer base44Client
- [ ] Grep: `grep -r "base44Client" src/`
- [ ] Pour chaque fichier:
  - [ ] Remplacer `import { base44 }` par service imports
  - [ ] Remplacer `base44.X.Y()` par `service.method()`
  - [ ] Tester le composant

### Fichiers Critiques à Mettre à Jour
- [ ] `src/pages/Login.jsx`
- [ ] `src/pages/Signup.jsx`
- [ ] `src/lib/AuthContext.jsx`
- [ ] `src/pages/Appointments.jsx` (ou équivalent)
- [ ] `src/pages/Messages.jsx`
- [ ] `src/pages/Profile.jsx`
- [ ] `src/pages/Dashboard.jsx`
- [ ] ... (tous les fichiers utilisant base44)

### Variables d'Environnement Frontend
- [ ] Créer `.env.local`:
  ```
  VITE_API_URL=http://localhost:3000/api
  ```
- [ ] Créer `.env.production`:
  ```
  VITE_API_URL=https://brenne-aerial-backend.onrender.com/api
  ```

### Tests Frontend
- [ ] `npm run dev` lancé
- [ ] Login → vérifier token dans localStorage
- [ ] Logout → token supprimé
- [ ] Appointments list → données affichées
- [ ] Créer rendez-vous → nouveau rendez-vous apparaît
- [ ] Pas d'erreurs console

---

## 🚀 Phase 5: Déploiement (Jours 18-21)

### Backend sur Render

#### Créer le render.yaml
```yaml
services:
  - type: web
    name: brenne-aerial-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
```

#### Déployer
- [ ] Créer repo `brenne-aerial-backend` sur GitHub (optionnel)
- [ ] Ou: Utiliser le repo existant avec dossier `/backend`
- [ ] Sur Render.com:
  - [ ] New Web Service
  - [ ] Connecter GitHub repo
  - [ ] Branche: `main`
  - [ ] Root directory: `backend/` (si dans même repo)
  - [ ] Build command: `npm install`
  - [ ] Start command: `npm start`

#### Variables d'Environnement sur Render
- [ ] DATABASE_URL (depuis Neon)
- [ ] STRIPE_SECRET_KEY
- [ ] FIREBASE_PROJECT_ID
- [ ] FIREBASE_PRIVATE_KEY
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] JWT_SECRET
- [ ] NODE_ENV=production
- [ ] Tester après deploy: `curl https://brenne-aerial-backend.onrender.com/health`

### Frontend sur Netlify

#### Build & Déployer
- [ ] Sur Netlify.com:
  - [ ] New site from Git
  - [ ] Connecter repo GitHub
  - [ ] Branch: `main`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`

#### Variables d'Environnement
- [ ] VITE_API_URL=https://brenne-aerial-backend.onrender.com/api
- [ ] Re-deploy après update

#### Configuration netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[dev]
  command = "npm run dev"
  port = 5173

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Alternative: Frontend sur Render aussi
- [ ] Créer un second Web Service (static site)
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment: Node

---

## 🔗 Phase 6: Intégration Services (Jours 22-24)

### Stripe Webhooks
- [ ] Mettere à jour Stripe dashboard:
  - [ ] Old webhook: `https://votre-base44-url/webhooks/stripe`
  - [ ] New webhook: `https://brenne-aerial-backend.onrender.com/api/webhooks/stripe`
- [ ] Copier nouveau secret webhook
- [ ] Ajouter à env vars: STRIPE_WEBHOOK_SECRET

### Firebase Cloud Messaging
- [ ] FCM tokens stockés dans PostgreSQL (déjà fait)
- [ ] Endpoint `/api/notifications/register-token` pour enregistrer FCM token
- [ ] Tester: Envoyer une notification → apparaît sur l'app

### Outlook Calendar
- [ ] Reconfigurar OAuth2 Outlook (même que avant)
- [ ] Tester synchronisation rendez-vous

### Email Notifications
- [ ] Configurer SendGrid (ou Nodemailer)
- [ ] Tester email de bienvenue
- [ ] Tester email de confirmation

---

## ✅ Phase 7: Cutover Final (Jours 25-28)

### Avant le Cutover
- [ ] Faire backup complet Firestore
- [ ] Faire backup complet PostgreSQL
- [ ] Préparer rollback plan

### Jour du Cutover
- [ ] Notifier utilisateurs (maintenance)
- [ ] Arrêter Base44 (ou le mettre en mode readonly)
- [ ] Migration final Firestore → PostgreSQL
- [ ] Valider intégrité données
- [ ] Pointer domaine vers Render + Netlify
- [ ] Tester en production
- [ ] Monitorer logs

### Post-Cutover
- [ ] Monitoring 24h (logs, erreurs, performance)
- [ ] Support utilisateurs si problèmes
- [ ] Supprimer Base44 après stabilité confirmée (ex: 1 semaine)

---

## 🧪 Tests Essentiels

### Frontend Tests
```javascript
// Scénario 1: Login
1. Aller à /login
2. Entrer email/password
3. Cliquer "Connexion"
4. ✅ Redirection vers /dashboard
5. ✅ Token dans localStorage

// Scénario 2: Créer rendez-vous
1. Aller à /appointments/new
2. Remplir formulaire
3. Cliquer "Créer"
4. ✅ Rendez-vous apparaît dans la liste
5. ✅ Données dans PostgreSQL

// Scénario 3: Messages
1. Aller à /messages
2. Envoyer message à un utilisateur
3. ✅ Message apparaît immédiatement
4. ✅ Destinataire reçoit notification

// Scénario 4: Paiement Stripe
1. Aller à /billing
2. Cliquer "Upgrade"
3. ✅ Redirection vers Stripe checkout
4. ✅ Entrée paiement → webhook → DB update
```

### Backend Tests
```bash
# Authentification
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Créer rendez-vous
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Meeting","start_time":"2024-12-25T10:00:00Z"}'

# Envoyer message
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":"uuid","content":"Hello"}'
```

---

## 📊 Performance Monitoring

### Render Dashboard
- [ ] Monitorer CPU usage
- [ ] Monitorer memory usage
- [ ] Monitorer response times

### Neon Dashboard
- [ ] Monitorer storage used
- [ ] Monitorer query performance
- [ ] Configurer alerts si needed

### Frontend Performance
- [ ] Lighthouse score (target: >90)
- [ ] Core Web Vitals
- [ ] Network requests (pas de 404s)

---

## 🎓 Documentation Créée

Les 4 guides suivants ont été créés dans votre repo:

1. **MIGRATION_RENDER_NEON_PLAN.md** (26 jours)
   - Architecture complète
   - Étapes détaillées
   - Code examples

2. **MIGRATION_QUICK_START.md** (Résumé)
   - Vue d'ensemble
   - Défis majeurs
   - Approche parallélisée

3. **BACKEND_SETUP_GUIDE.md** (Pas à pas)
   - Structure Node.js
   - Express setup
   - PostgreSQL tables
   - Routes d'auth

4. **FRONTEND_MIGRATION_GUIDE.md** (Pas à pas)
   - Services Axios
   - AuthContext update
   - Remplacer base44Client
   - Examples complets

---

## 🔄 En Cas de Problème

### Backend ne démarre pas
- [ ] Vérifier DATABASE_URL
- [ ] Vérifier npm dependencies
- [ ] Vérifier variables d'environnement
- [ ] Checker logs: `npm run dev`

### Frontend ne connecte pas au backend
- [ ] Vérifier VITE_API_URL
- [ ] CORS activé sur backend
- [ ] Token JWT présent dans localStorage
- [ ] Check Network tab (erreurs 401, 403, 500)

### Données manquantes après migration
- [ ] Vérifier script migration (logs)
- [ ] Comparer counts
- [ ] Checker pour erreurs foreign keys
- [ ] Re-run migration si needed

### Firebase Cloud Messaging ne marche pas
- [ ] Vérifier FCM tokens dans DB
- [ ] Vérifier Firebase credentials
- [ ] Checker service worker: `/public/firebase-messaging-sw.js`

---

## 💾 Backups importants à Garder

- [ ] `MIGRATION_RENDER_NEON_PLAN.md` (ce guide)
- [ ] Export Firestore complet
- [ ] Export PostgreSQL (après migration)
- [ ] Firebase Service Account JSON
- [ ] Tous les secrets/API keys (vault)

---

## 🎉 Félicitations!

Si vous avez coché toutes les cases:
- ✅ Vous avez migré de Base44
- ✅ Vous avez un backend Node.js classique
- ✅ Vous avez PostgreSQL avec Neon
- ✅ Vous êtes sur Render + Netlify
- ✅ Vous êtes **libre** de Base44!

**Prochains buts:**
- Ajouter tests automatisés (Jest, Cypress)
- Configurer CI/CD (GitHub Actions)
- Optimiser performance
- Ajouter monitoring (Sentry, DataDog)

---

## 📞 Besoin d'Aide?

- **Express.js**: https://expressjs.com
- **PostgreSQL**: https://www.postgresql.org/docs
- **Render**: https://render.com/docs
- **Neon**: https://neon.tech/docs
- **Stack Overflow**: tag `javascript`, `node.js`, `express`, `postgresql`
- **GitHub Discussions**: Pour questions sur vos repos

---

**Bon courage pour la migration! 🚀**
