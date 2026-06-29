# ✅ Backend Setup Complet!

## 📦 Ce Qui Vient D'Être Créé

### Structure
```
backend/
├── src/
│   ├── server.js                  # Express app (lancé)
│   ├── db/
│   │   ├── pool.js                # PostgreSQL pool (connexion)
│   │   └── schema.sql             # Toutes les tables
│   ├── auth/
│   │   ├── middleware.js          # JWT + Firebase verification
│   │   └── firebase.js            # Firebase Admin SDK
│   ├── routes/
│   │   ├── auth.js                # signup, login, verify
│   │   └── users.js               # profil, update
│   ├── services/                  # Prêt pour Stripe, Email, etc.
│   └── scripts/                   # Migration scripts
├── package.json                   # ✅ Dépendances installées
├── .env.local                     # ✅ Variables créées
├── .env.example                   # ✅ Exemple env
├── .gitignore                     # ✅ Git setup
├── render.yaml                    # ✅ Config Render
└── README.md                      # ✅ Documentation
```

## 🎯 Étape 1: Configurer Neon PostgreSQL (5 min)

### A. Créer Database sur Neon
1. Aller à https://neon.tech
2. Sign Up (gratuit)
3. Créer un projet: "brenne-aerial"
4. Dans Settings → Connection string → Copier `DATABASE_URL`

### B. Configurer Backend
1. Ouvrir `backend/.env.local`
2. Remplacer `DATABASE_URL=postgresql://localhost/brenne_aerial` par votre Neon URL
3. Exemple: `DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neon?sslmode=require`

### C. Créer les Tables
**Option 1: Depuis Neon Dashboard (Plus facile)**
1. Neon Dashboard → SQL Editor
2. Copier tout le contenu de `backend/src/db/schema.sql`
3. Coller dans SQL Editor
4. Exécuter ✅

**Option 2: Depuis CLI**
```bash
psql "postgresql://..." -f backend/src/db/schema.sql
```

## 🎯 Étape 2: Configurer Firebase (5 min)

### A. Récupérer les Credentials
1. Aller à https://console.firebase.google.com
2. Projet: "brenne-aerial-37443"
3. Settings (engrenage) → Service Accounts
4. "Generate New Private Key"
5. Télécharger le JSON

### B. Extraire les Valeurs
Ouvrir le JSON téléchargé et copier dans `backend/.env.local`:
```
FIREBASE_PROJECT_ID=brenne-aerial-37443
FIREBASE_PRIVATE_KEY_ID=xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=xxxxx@xxxxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxx
```

⚠️ **Important**: La `FIREBASE_PRIVATE_KEY` doit avoir des `\n` littéraux (pas des vraies nouvelles lignes)

## 🎯 Étape 3: Générer JWT_SECRET (1 min)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier le résultat dans `backend/.env.local`:
```
JWT_SECRET=<résultat>
```

## 🚀 Étape 4: Lancer Localement

```bash
cd backend
npm run dev
```

✅ Vous devriez voir:
```
✅ PostgreSQL connecté
✅ Firebase Admin initialized
✅ Server running on http://localhost:3000
```

## 🧪 Étape 5: Tester les Routes

### 1. Health Check
```bash
curl http://localhost:3000/health
```
Réponse: `{"status":"OK",...}`

### 2. API Info
```bash
curl http://localhost:3000/api
```

### 3. Signup (Test sans Firebase pour l'instant)
```bash
# Vous verrez une erreur si Firebase n'est pas configuré
# C'est normal, ça signifie que les routes fonctionnent!
```

## 📋 Checklist: Vous Êtes Prêt Quand

- [ ] `backend/` folder existe avec tous les fichiers
- [ ] `npm install` réussi (333 packages)
- [ ] `backend/.env.local` rempli avec DATABASE_URL
- [ ] Neon database créée et tables insérées
- [ ] Firebase credentials ajoutées à `.env.local`
- [ ] `JWT_SECRET` généré et ajouté
- [ ] `npm run dev` fonctionne sans erreur
- [ ] `curl http://localhost:3000/health` retourne `{status: "OK"}`

## 🎯 Prochaines Étapes

### Prochainement (Jour 2):
1. **Créer plus de routes** (appointments, messages, etc.)
2. **Intégrer Stripe webhooks**
3. **Services Outlook + Email**

### Puis (Jour 3):
1. **Tester avec le Frontend**
2. **Créer services Axios côté frontend**
3. **Remplacer base44Client**

### Finalement (Jour 4-5):
1. **Déployer sur Render**
2. **Configurer domain + DNS**
3. **Monitoring + Logs**

## 📞 Problèmes?

### "PostgreSQL non connecté"
- Vérifier DATABASE_URL dans .env.local
- Vérifier que Neon database est créée
- Tester: `psql <DATABASE_URL>`

### "Firebase Admin initialization error"
- Vérifier FIREBASE_PRIVATE_KEY
- Vérifier qu'il y a des `\n` littérales dans la clé
- Vérifier FIREBASE_PROJECT_ID

### "Cannot find module"
- Vérifier que `npm install` s'est bien exécuté
- Supprimer `node_modules/` et relancer `npm install`

## 🎉 Bravo!

Votre backend Node.js est prêt! Vous avez:
- ✅ Express server
- ✅ PostgreSQL setup
- ✅ Firebase integration
- ✅ JWT authentication
- ✅ Routes de base (auth + users)
- ✅ Prêt à déployer sur Render

**Prochaine étape: Configurer le Frontend!** 🚀
