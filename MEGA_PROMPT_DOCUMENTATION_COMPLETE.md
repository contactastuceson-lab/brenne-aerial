# 🚀 MEGA PROMPT - DOCUMENTATION BRENNE AERIAL COMPLÈTE

**Ce fichier contient TOUT ce qu'une IA a besoin de savoir pour créer la documentation de Brenne Aerial avec le même style et l'exactitude technique.**

---

# Table des Matières
1. [Design & Style](#design--style)
2. [Architecture Technique](#architecture-technique)
3. [Tous les Sujets avec Specs Détaillées](#tous-les-sujets-avec-specs-détaillées)

---

# DESIGN & STYLE

## 🎨 Couleurs & Thème

### Thème Sombre (Défaut)
```css
<!-- Dark Sky Palette -->
--background: 214 50% 4%;          /* #040a14 */
--foreground: 210 20% 94%;         /* #f0f4f8 */
--card: 214 40% 7%;                /* #0e1927 */
--card-foreground: 210 20% 94%;    /* #f0f4f8 */
--primary: 205 90% 58%;            /* #0ea5e9 - Bleu ciel vif */
--primary-foreground: 214 50% 4%;  /* #040a14 */
--secondary: 214 30% 12%;          /* #1a2942 */
--secondary-foreground: 210 20% 85%;
--accent: 195 80% 50%;             /* #7dd3fc - Cyan clair */
--accent-foreground: 214 50% 4%;   /* #040a14 */
--destructive: 0 72% 51%;          /* #ff6b6b */
--border: 214 25% 14%;             /* #1a2a47 */
--input: 214 25% 14%;              /* #1a2a47 */
--ring: 205 90% 58%;               /* #0ea5e9 */
```

### Thème Clair
```css
--background: 210 30% 97%;         /* #f5f9ff */
--foreground: 215 35% 12%;         /* #0f172a */
--card: 210 40% 96%;               /* #f0f5ff */
--primary: 205 90% 58%;            /* #0ea5e9 */
--secondary: 210 50% 85%;          /* #dbe9ff */
```

### Couleurs Spéciales
- **Info**: Bleu `#0ea5e9` (primaire)
- **Success**: Vert `#51cf66`
- **Warning**: Orange `#ffa94d`
- **Error**: Rouge `#ff6b6b`

## 🔤 Typographie

### Polices
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- **Titres (H1-H3)**: `Space Grotesk` - Bold (700, 600, 500)
- **Texte courant**: `Inter` - Regular/Medium (400, 500)
- **Code**: `JetBrains Mono` (400)

### Tailles
- H1: 32-36px / font-weight 700 / line-height 1.3
- H2: 24-28px / font-weight 600 / line-height 1.3
- H3: 18-20px / font-weight 600 / line-height 1.3
- Body: 14-16px / font-weight 400 / line-height 1.6
- Small: 12-14px / font-weight 400 / line-height 1.5

## ✨ Animations

```css
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

.fade-up { animation: fade-up 0.6s ease-out forwards; }
.float { animation: float 6s ease-in-out infinite; }
```

- Border-radius standard: **12px (0.75rem)**
- Transitions: **200-300ms ease-out**
- Shadow subtile: `0 4px 12px rgba(0,0,0,0.15)`

## 🌗 Mode Sombre/Clair

- **Stockage**: localStorage key `"theme"` (valeurs: `"light"`, `"dark"`, `"auto"`)
- **Application**: Classe CSS `"light"` sur `<html>`
- **Préférence système**: Si `"auto"`, utiliser `prefers-color-scheme`
- **Transition**: `transition: background-color 0.3s ease, color 0.3s ease`

---

# ARCHITECTURE TECHNIQUE

## 📐 Stack

- **Frontend**: React 18+ + Vite
- **Styling**: Tailwind CSS 3.x + CSS custom properties
- **Routing**: React Router v6+
- **Code Highlighting**: Prism.js (copier-coller facile)
- **Markdown**: markdown-to-jsx
- **Icons**: Lucide React
- **Utilities**: clsx, slugify

## 🗂️ Structure de Dossiers

```
documentation-site/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx          # Accueil avec catégories
│   │   ├── DocPage.jsx           # Page de doc individuelle
│   │   ├── SearchPage.jsx        # Résultats search
│   │   └── NotFoundPage.jsx      # 404
│   │
│   ├── components/
│   │   ├── Header.jsx            # Header sticky
│   │   ├── Sidebar.jsx           # Navigation latérale
│   │   ├── DocContent.jsx        # Contenu markdown rendu
│   │   ├── TableOfContents.jsx   # TOC sticky droite
│   │   ├── SearchBar.jsx         # Barre search
│   │   ├── ThemeToggle.jsx       # Toggle light/dark
│   │   ├── InfoBox.jsx           # Info/Tip/Warning/Error boxes
│   │   ├── CodeBlock.jsx         # Code avec syntax highlight
│   │   ├── Breadcrumb.jsx        # Nav breadcrumb
│   │   ├── RelatedArticles.jsx   # Articles liés
│   │   ├── HelpBox.jsx           # "Besoin d'aide?"
│   │   ├── Footer.jsx            # Footer
│   │   ├── BackToTop.jsx         # Scroll to top
│   │   ├── Layout.jsx            # Layout wrapper
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── ...composants réutilisables
│   │
│   ├── lib/
│   │   ├── docs-data.js          # Structure de toute la dokumentation
│   │   ├── search.js             # Logique recherche
│   │   ├── slugify.js            # URL slugs
│   │   └── constants.js
│   │
│   ├── hooks/
│   │   ├── useTheme.js           # Gestion thème
│   │   ├── useSearch.js          # Logique search
│   │   └── useTableOfContents.js # Génération TOC
│   │
│   ├── context/
│   │   └── ThemeContext.jsx      # Context theme global
│   │
│   ├── App.jsx                   # Routing principal
│   ├── main.jsx
│   └── index.css                 # CSS global
│
├── public/
│   ├── docs/                     # Contenu markdown par catégorie
│   │   ├── compte/
│   │   │   ├── creer-compte.md
│   │   │   ├── connexion.md
│   │   │   └── ...
│   │   ├── securite/
│   │   ├── forum/
│   │   └── ...
│   ├── images/
│   │   ├── categories/
│   │   ├── screenshots/
│   │   └── ...
│   └── og-image.jpg
│
├── tailwind.config.js
├── vite.config.js
├── package.json
├── index.html
└── README.md
```

## 🔌 Routing

```javascript
// Routes principales
/                          # Page d'accueil
/docs/:category            # Page catégorie (ex: /docs/compte)
/docs/:category/:slug      # Page doc (ex: /docs/compte/creer-compte)
/search                    # Résultats search
/search?q=terme            # Résultats avec query
/404                       # Page not found

// API
/api/search?q=terme        # Endpoint search (fetch côté client ou Node)
```

## 💾 Structure de Données (docs-data.js)

```javascript
export const docsStructure = {
  categories: [
    {
      id: 'compte',
      slug: 'compte',
      label: 'Compte & Accès',
      icon: '👤',
      description: 'Gestion de votre compte et authentification',
      color: 'blue',
      order: 1,
      docs: [
        {
          id: 'creer-compte',
          slug: 'creer-compte',
          title: 'Créer un compte',
          description: 'Inscription et première utilisation',
          contentPath: '/docs/compte/creer-compte.md',
          // ou directement: content: '...'
          relatedDocs: ['connexion', '2fa'],
          keywords: ['inscription', 'register', 'nouveau compte']
        },
        // ... autres docs
      ]
    },
    // ... autres catégories
  ]
};
```

## 🔍 Logique de Recherche

```javascript
// search.js
export function searchDocs(query, docsStructure) {
  const normalizedQuery = query.toLowerCase();
  const results = [];
  
  for (const category of docsStructure.categories) {
    for (const doc of category.docs) {
      const titleMatch = doc.title.toLowerCase().includes(normalizedQuery);
      const descMatch = doc.description?.toLowerCase().includes(normalizedQuery);
      const keywordMatch = doc.keywords?.some(k => k.includes(normalizedQuery));
      const contentMatch = doc.content?.toLowerCase().includes(normalizedQuery);
      
      if (titleMatch || descMatch || keywordMatch || contentMatch) {
        results.push({
          ...doc,
          category: category.label,
          categorySlug: category.slug,
          // Score pour tri par pertinence
          score: (titleMatch ? 100 : 0) + 
                 (descMatch ? 50 : 0) + 
                 (keywordMatch ? 75 : 0) +
                 (contentMatch ? 25 : 0)
        });
      }
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}
```

---

# TOUS LES SUJETS AVEC SPECS DÉTAILLÉES

## 1️⃣ COMPTE & ACCÈS 👤

### 1.1 Créer un compte

**Description**: Guide complet pour créer un nouveau compte Brenne Aerial

**Contenu à Couvrir**:
1. Accès au formulaire d'inscription (`/register` ou bouton entrée)
2. Champs obligatoires:
   - Email (validation format)
   - Mot de passe (minimum 8 caractères, avec maj/min/chiffre/spécial)
   - Confirmation mot de passe
   - Prénom et Nom
3. Conditions d'utilisation & RGPD (checkbox)
4. Captcha (optionnel)
5. Vérification email (reçoit code confimation)
6. Première connexion (onboarding optional)

**Données Techniques**:
- Entité: `User` (base44)
- Route: POST `/auth/register`
- Validation backend: Email unique, password strength
- Email de bienvenue: `sendWelcomeEmail()` fonction

**Code Example à Montrer**:
```javascript
// Appel API
const response = await axios.post('/api/auth/register', {
  email: 'user@example.com',
  password: 'SecurePass123!',
  first_name: 'Jean',
  last_name: 'Dupont'
});

// Réponse réussie
{ success: true, user_id: 'uuid', email_verified: false }
```

**Screenshots/Étapes**:
1. Page /register
   - Formulaire avec champs (email, password, etc.)
   - Link "Déjà inscrit? Se connecter"
2. Vérification email
   - "Vérifiez votre email"
   - Bouton "Renvoyer le code"
3. Onboarding (optionnel)
   - Compléter profil
   - Quiz préférences

**Section Tips**:
- Utiliser un mot de passe fort et unique
- L'email de vérification peut aller en spam
- Accès immédiat après vérification

---

### 1.2 Se connecter

**Description**: Accès au compte avec options de récupération

**Contenu**:
1. Page `/login` avec:
   - Email / Username
   - Mot de passe
   - Checkbox "Se souvenir"
   - Lien "Mot de passe oublié?"
2. Authentification 2FA (si activée)
   - Reçoit code via email/SMS/app
   - Entre code 6 chiffres
3. Options de connexion rapide (optionnel):
   - OAuth Google/GitHub/etc.
4. Réinitialisation mot de passe oublié:
   - Formulaire email
   - Reçoit lien reset (valable 24h)
   - Entre nouveau mot de passe

**Données Techniques**:
- Route: POST `/auth/login`
- Retour: JWT token (localStorage)
- 2FA: POST `/auth/verify-2fa`
- Mot de passe oublié: POST `/auth/forgot-password`

**Erreurs Courantes**:
- "Email non trouvé" → Créer un compte
- "Mot de passe incorrect" → Réessayer ou reset
- "Email non vérifié" → Vérifier son email
- "Compte désactivé" → Contacter support

**Screenshot Workflow**:
1. Login form
2. (Optionnel) 2FA prompt
3. Redirect vers dashboard

---

### 1.3 Paramètres du compte

**Description**: Gérer les infos personnelles et visibilité du profil

**Contenu**:
1. **Infos Personnelles**:
   - Prénom / Nom
   - Email (affichage seulement, changer = envoi confirmation)
   - Bio / Description (255 caractères max)
   - Avatar (upload ou URL)
   - Cover photo (optionnel)
   - Localisation (optionnel)
   - Site web (optionnel)
   - Numéro de téléphone (optionnel)

2. **Visibilité**:
   - Profil public/privé
   - Afficher email publiquement (oui/non)
   - Afficher téléphone publiquement (oui/non)

3. **Accès rapide**:
   - Récemment modifié
   - Sauvegarde automatique

**API Endpoint**:
```javascript
// GET
GET /api/user/profile → { user: {...} }

// PUT
PUT /api/user/profile
{
  first_name: 'Jean',
  last_name: 'Dupont',
  bio: 'Ma biographie',
  avatar_url: 'https://...',
  location: 'Paris',
  website: 'https://example.com'
}
→ { success: true, user: {...}, message: 'Profil mis à jour' }
```

**Fonction Backend**: `updateAccountInfo(user_email, data)`

---

### 1.4 Changer le mot de passe

**Description**: Modifier le mot de passe en toute sécurité

**Contenu**:
1. Accès: **Paramètres > Sécurité > Changer le mot de passe**
2. Champs:
   - Mot de passe actuel (requis, pour confirmation)
   - Nouveau mot de passe (8+ caractères, maj/min/chiffre/spécial)
   - Confirmation nouveau mot de passe
   - Affichage force du mot de passe (weak/medium/strong)
3. Centre de sécurité - Audit Log:
   - "Mot de passe modifié le [date/heure]"
4. Déconnexion des autres sessions (optionnel):
   - Bonnes pratiques: déconnecter après changement

**API**:
```javascript
PUT /api/user/change-password
{
  current_password: 'OldPass123!',
  new_password: 'NewPass456!'
}
→ { success: true, message: 'Mot de passe changé. Vous êtes déconnecté.' }
```

**Fonction Backend**: `changeUserPassword(user_email, current_password, new_password)`

**Warnings**:
- ⚠️ Après changement, vous serez déconnecté
- ⚠️ N'oubliez pas votre nouveau mot de passe!
- ✅ Le changement est enregistré dans l'historique de sécurité

**Security Features**:
- Validation mot de passe actuel (protection contre accès non autorisé)
- Audit logging automatique
- Notification email de changement
- Force logout global possible

---

### 1.5 Authentification à deux facteurs (2FA)

**Description**: Sécuriser le compte avec 2FA par Email, SMS ou App

**Contenu**:
1. **Accès**: Paramètres > Sécurité > Authentification à deux facteurs
2. **Types disponibles**:
   - 📧 Email (6 chiffres)
   - 📱 SMS (6 chiffres)
   - 🔑 TOTP/Authenticator App (Google Authenticator, Authy)

3. **Activation Email 2FA**:
   - Entrer email
   - Recevez code
   - Confirmez code
   - ✅ Activé!

4. **Activation SMS 2FA**:
   - Entrer numéro téléphone international
   - Recevez SMS
   - Confirmez code

5. **Activation TOTP 2FA**:
   - Générer QR code
   - Scanner avec app authenticator
   - Entrer code de test
   - Sauvegarder "backup codes" (10 codes, 1 seul use)

6. **Backup Codes**:
   - Générés lors de l'activation TOTP
   - À conserver précieusement (télécharger PDF)
   - Utilisés si perte accès 2FA

7. **Désactivation 2FA**:
   - Requiert re-authentification
   - ⚠️ Rend le compte moins sécurisé

**API Endpoints**:
```javascript
// Setup 2FA Email
POST /api/user/2fa/email/setup
{ email: 'user@example.com' }
→ { success: true, code_sent: true }

// Vérifier code 2FA
POST /api/user/2fa/verify
{ user_email, code: '123456', method: 'email' }
→ { success: true, backup_codes: [...] }

// TOTP QR Code
GET /api/user/2fa/totp/setup
→ { qr_code_url, secret, ... }

// Télécharger backup codes
GET /api/user/2fa/backup-codes/download
→ File PDF

// Désactiver 2FA
DELETE /api/user/2fa
→ { success: true }
```

**Login Flow avec 2FA**:
1. User entre email + password
2. ✅ Credentials valides
3. Demande: "Entrez votre code 2FA"
4. Si email 2FA → Code envoyé
5. Si SMS 2FA → SMS envoyé
6. Si TOTP → User ouvre son app
7. User entre code → Connecté!

**Functions Backend**:
- `setup2FAEmail(user_email)`
- `setup2FASMS(user_email, phone_number)`
- `setup2FATOMTP(user_email)` → QR code
- `verify2FA(user_email, code, method)`

**Tips**:
- ✅ TOTP = Plus sécurisé (pas de réseau)
- ✅ Email 2FA = Plus facile pour débuter
- ✅ SMS 2FA = Robuste mais coûteux
- 💡 Utilisez 2FA + mot de passe fort

---

## 2️⃣ SÉCURITÉ & CONFIDENTIALITÉ 🔒

### 2.1 Appareils connectés

**Description**: Gérer et surveiller tous les appareils connectés au compte

**Contenu**:
1. **Vue d'ensemble**:
   - Liste complète de tous les appareils
   - Appareil actuel en vert (highlighted)
   - Autres appareils en gris
   - Infos pour chaque: Appareil, Browser, OS, IP, Dernière activité, Statut

2. **Infos par Appareil** (Auto-détectées):
   - 🌐 Navigateur: Chrome, Firefox, Safari, Edge, etc.
   - 💻 Système: Windows, macOS, Linux, Android, iOS
   - 📱 Type: Desktop, Mobile, Tablet
   - 🔗 Adresse IP: 192.168.1.100
   - ⏰ Dernière activité: "Il y a 2 heures"
   - 📋 User-Agent: Détails techniques complets

3. **Actions**:
   - 🔌 Déconnecter un appareil (autre que courant)
   - 💥 "Déconnecter tous les autres" (bouton warning)
   - 🔄 Rafraîchir la liste

4. **Détection de Menace**:
   - ⚠️ Appareil inconnu? → Déconnecter
   - 🔍 IP suspecte? → Vérifier l'adresse
   - 🕐 Activité anormale? → Signaler

**Données Techniques**:

Entité `DeviceSession`:
```json
{
  "id": "uuid",
  "session_id": "abc123",
  "user_email": "user@example.com",
  "device_name": "Windows Chrome",
  "device_type": "desktop|mobile|tablet",
  "browser": "Chrome|Firefox|Safari|Edge",
  "os": "Windows|macOS|Linux|Android|iOS",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2026-04-19T10:30:00Z",
  "last_activity": "2026-04-19T14:45:00Z",
  "is_current": true|false,
  "is_trusted": false
}
```

**API Endpoints**:
```javascript
// Lister tous les appareils
GET /api/user/devices
→ { devices: [...] }

// Déconnecter un appareil
DELETE /api/user/devices/:device_id
→ { success: true, message: 'Appareil déconnecté' }

// Déconnecter tous les autres
POST /api/user/devices/disconnect-all-others
→ { success: true, message: 'Tous les autres appareils déconnectés' }
```

**Backend Functions**:
- `createDeviceSession(user_email, device_info)` → AUTO appelée lors login
- `getDeviceSessions(user_email)` → Récupère liste
- `disconnectDevice(device_id)` → Déconnecte 1 device
- `disconnectAllOtherDevices(user_email)` → Déco tous sauf courant

**Détection Browser/OS (Automatique)**:
```
User-Agent parsing:
- "Chrome" dans UA → Navigateur: Chrome
- "Firefox" → Navigateur: Firefox
- "Safari" et pas "Chrome" → Navigateur: Safari
- "Edge" → Navigateur: Edge
- "Windows" → OS: Windows
- "Mac" → OS: macOS
- "Linux" → OS: Linux
- "Android" → OS: Android, Type: mobile
- "iPhone" ou "iPad" → OS: iOS, Type: mobile/tablet
```

**Frontend Hook**:
```javascript
// useRegisterDevice(user)
// Appelée automatiquement dans Layout
// Enregistre le device à la première visite
// Non-bloquant (erreur silencieuse)
```

**Audit Logging**:
- Chaque déconnexion enregistrée avec timestamp + IP
- Visible dans "Historique de Sécurité"

---

### 2.2 RGPD & Confidentialité

**Description**: Droits RGPD et gestion de vos données personnelles

**Contenu**:
1. **Vos Droits RGPD** (Art. 15-22):
   - ✅ Droit d'accès (télécharger vos données)
   - ✅ Droit à l'oubli (supprimer définitivement)
   - ✅ Droit à la portabilité (exporter en JSON/CSV)
   - ✅ Droit de rectification (changer vos infos)
   - ✅ Droit à l'opposition (Ne pas recevoir marketing)

2. **Tableau de Données Collectées**:
   | Données | Obligatoire? | Raison | Conservées |
   |---------|-------------|--------|-----------|
   | Email | ✅ | Authentification | Compte actif + 3 ans |
   | Nom/Prénom | ✅ | Identification | Compte actif + 3 ans |
   | IP Address | ✅ | Sécurité | 12 mois |
   | Logs d'accès | ✅ | Audit | 12 mois |
   | Cookies | ❌ | Analyse | 13 mois |
   | Phone (optionnel) | ❌ | 2FA | Jusqu'à suppression |

3. **Actions Disponibles**:
   - 📥 **Télécharger vos données** (JSON/CSV)
     - Données personnelles complètes
     - Historique d'accès
     - Logs de sécurité
     - Préférences
   - 🗑️ **Demander suppression** (Droit à l'oubli)
     - Processus: Demande → Email confirmation → 30 jours → Suppression
   - 🚫 **Opt-out marketing** (Messages promotionnels)
   - 🔍 **Voir qui accède à vos données** (Services tiers)

4. **Services Tiers Autorisés**:
   - Stripe (Paiements donations)
   - Sendgrid (Emails)
   - Google Analytics (Statistiques)
   - Cloudflare (CDN)

5. **Mentions Légales**:
   - Politique de confidentialité (lien)
   - Conditions d'utilisation (lien)
   - Mentions légales (lien)

**API Endpoints**:
```javascript
// Télécharger toutes les données personnelles
GET /api/user/gdpr/export
→ File JSON/CSV avec toutes les données

// Demander suppression (droit à l'oubli)
POST /api/user/gdpr/request-deletion
→ { success: true, message: 'Demande enregistrée', deletion_date: '2026-05-02' }

// Annuler demande suppression (avant expiration 30j)
DELETE /api/user/gdpr/request-deletion
→ { success: true, message: 'Demande annulée' }

// Opt-out newsletter
PUT /api/user/preferences
{ receive_marketing: false }
→ { success: true }
```

**Backend Function**:
- `requestAccountDeletion(user_email)` → Crée DeletionRequest entité
- `refuseDeletionRequest(user_email)` → Annule suppression
- Export auto via script (30 jours avant suppression)

---

### 2.3 Suppression de compte

**Description**: Demander la suppression permanente du compte

**Contenu**:
1. **Processus de Suppression** (⚠️ Irréversible):
   - Bouton "Demander la suppression" dans Danger Zone
   - Modal confirmation: "Êtes-vous sûr?"
   - Reçoit email de confirmation
   - Clique lien email (valable 7 jours)
   - Délai de 30 jours avant suppression effective
   - Peut annuler dans les 30 jours
   
2. **Que se passe-t-il?**:
   - **Immédiat**: Compte désactivé (pas d'accès)
   - **Jour 30**: Suppression totale et irréversible
   - **Données conservées**: Logs légaux (2 ans max)
   - **Posts/commentaires**: Anonymisés (optionnel)

3. **Avant de Supprimer**:
   - ✅ Télécharger vos données
   - ✅ Verifier les appareils
   - ✅ Annuler abonnements/donations
   - ✅ Prévenir vos contacts

4. **Annuler la Suppression**:
   - Lien "Annuler la suppression" dans email
   - Ou: Paramètres > Danger Zone > "Annuler" (si compte encore accessible)
   - Réactive le compte immédiatement

**API**:
```javascript
// Demander suppression
POST /api/user/gdpr/request-deletion
{ confirm: true }
→ { 
    success: true, 
    message: 'Email de confirmation envoyé',
    deletion_scheduled_date: '2026-05-02'
}

// Annuler suppression
DELETE /api/user/gdpr/request-deletion
→ { success: true, message: 'Suppression annulée, compte réactivé' }
```

**Entité Backend**: `DeletionRequest`
```json
{
  "user_email": "user@example.com",
  "requested_at": "2026-04-02T10:30:00Z",
  "scheduled_deletion_date": "2026-05-02T10:30:00Z",
  "confirmation_token": "token123",
  "status": "pending|confirmed|completed|cancelled"
}
```

**Email Workflow**:
1. Utilisateur demande suppression
2. Email: "Confirmez la suppression de votre compte"
3. Lien: "Confirmer la suppression (valable 7j)"
4. Après confirmation: "Votre compte sera supprimé le 2 mai"
5. Si pas annulé avant: Suppression auto

**Danger Zone Section**:
- 🔴 Bouton "Demander la suppression"
- ⚠️ "Cette action est irréversible après 30 jours"
- Affiche état: "Suppression prévue le [date]" si en cours

---

### 2.4 Historique de sécurité (Audit Log)

**Description**: Voir toutes les actions et connexions pour sécurité

**Contenu**:
1. **Tableau d'Audit Complet**:
   | Action | Date/Heure | Appareil | IP | Statut |
   |--------|-----------|---------|-----|--------|
   | Connexion | 2026-04-19 14:32 | Windows Chrome | 192.168... | ✅ Réussie |
   | Mot de passe modifié | 2026-04-18 10:15 | Mac Safari | 192.168... | ✅ Réussie |
   | 2FA activée | 2026-04-17 09:00 | - | - | ✅ Réussie |
   | Appareil déconnecté | 2026-04-16 15:20 | Mobile | 10.0... | ✅ Réussie |
   | Profil modifié | 2026-04-15 11:45 | Windows | 192.168... | ✅ Réussie |
   | Tentative de connexion échouée | 2026-04-14 23:05 | ? | 203.0... | ❌ Échouée |

2. **Types d'Actions Loggées**:
   - 🔐 Connexion / Déconnexion
   - 🔑 Mot de passe changé
   - 📧 Email changé
   - 2️⃣ 2FA activée/désactivée
   - 💾 Profil modifié
   - 📱 Appareil connecté/déconnecté
   - 🎯 Préférences modifiées
   - 💬 Données exportées
   - 🗑️ Suppression demandée
   - ⚠️ Tentatives d'accès échouées

3. **Filtres**:
   - Date: De [date] à [date]
   - Type d'action: Toutes / Connexion / Sécurité / Profil / etc.
   - Appareil: Toutes / Desktop / Mobile / etc.
   - Statut: Toutes / Réussies / Échouées

4. **Télécharger l'historique**:
   - 📥 Télécharger en CSV/PDF
   - 🔔 Alerter si activité suspecte

**API**:
```javascript
// Récupérer l'historique d'audit
GET /api/user/audit-log?limit=100&offset=0&filter[action]=login
→ {
    logs: [
      {
        id: 'uuid',
        user_email: 'user@example.com',
        action_type: 'login|password_change|profile_update|...',
        action_description: 'Connecté depuis Windows Chrome',
        ip_address: '192.168.1.100',
        device_info: 'Windows Chrome',
        status: 'success|failure',
        created_at: '2026-04-19T14:32:00Z'
      }
    ],
    total: 256,
    page: 1
}

// Télécharger audit log
GET /api/user/audit-log/download?format=csv|pdf
→ File CSV/PDF
```

**Backend Function**: `logAuditAction(user_email, action_type, description, isService=false)`

**Exemples d'Audit Logging**:
```javascript
// Lors login réussi
await logAuditAction('user@example.com', 'login', 'Connecté depuis Chrome Windows');

// Lors changement password
await logAuditAction('user@example.com', 'password_change', 'Mot de passe modifié');

// Lors activation 2FA
await logAuditAction('user@example.com', '2fa_enabled', 'Authentification 2FA activée via Email');

// Lors tentative échouée
await logAuditAction('user@example.com', 'login_failed', 'Tentative avec mauvais password');
```

**Sécurité**:
- ✅ Enregistrement automatique de TOUTES les actions
- ✅ Visible que pour le propriétaire du compte
- ✅ Non modifiable/supprimable (immutable)
- ✅ Alertes possibles sur activité suspecte

---

### 2.5 Vérification d'adresse email

**Description**: Confirmer et gérer vos adresses email

**Contenu**:
1. **Vérification Email Primaire**:
   - Lors inscription: Email de confirmation envoyé automatiquement
   - Lien "Confirmer email" valable 24h
   - Après confirmation: Badge ✅ "Vérifié"

2. **Emails Secondaires** (Optionnel):
   - Ajouter d'autres adresses emails (pour notifications, récupération)
   - Vérifier chaque adresse secondaire de la même façon
   - Gérer lesquelles reçoivent notifications

3. **Renvoyer Email de Confirmation**:
   - Bouton "Renvoyer le code" si pas reçu
   - Nouveau lien envoyé immédiatement
   - Ancien lien devient invalide

4. **Changer Email Primaire**:
   - Requiert vérification du nouvel email
   - Email de confirmation envoyé
   - 24h pour confirmer
   - Ancien email reçoit notification

5. **Sécurité Email**:
   - Affiche dernière vérification
   - Option: Exiger re-vérification tous les X mois

**API**:
```javascript
// Envoyer email de confirmation
POST /api/user/email/send-verification
{ email: 'user@example.com' }
→ { success: true, message: 'Email de vérification envoyé' }

// Vérifier code email
POST /api/user/email/verify
{ email: 'user@example.com', code: '123456' }
→ { success: true, message: 'Email vérifié' }

// Changer email primaire
PUT /api/user/email
{ new_email: 'new@example.com' }
→ { success: true, message: 'Email de confirmation envoyé à new@example.com' }

// Récupérer emails vérifiés
GET /api/user/emails
→ { 
    primary: { email: 'user@example.com', verified: true, verified_at: '2026-01-15' },
    secondary: [...]
}
```

**Backend Functions**:
- `sendVerificationCode(user_email, new_email)` → Envoie code
- `verifyEmailCode(user_email, code)` → Confirme email
- `getEmailVerifications(user_email)` → Liste emails vérifiés

---

## 3️⃣ PARAMÈTRES UTILISATEUR ⚙️

### 3.1 Préférences de langue

**Description**: Changer la langue de l'interface

**Contenu**:
1. **Langues Disponibles**: 
   - 🇫🇷 Français (défaut)
   - 🇬🇧 English
   - 🇪🇸 Español
   - 🇩🇪 Deutsch

2. **Application Instantanée**:
   - Sélectionner langue → Interface change immédiatement
   - Pas besoin de rafraîchir
   - Persiste en localStorage + backend

3. **Emplacement**:
   - **Header**: Dropdown sélecteur langue
   - **Paramètres > Préférences > Langue**

4. **Stockage**:
   - localStorage: `{language: 'fr'}`
   - Backend: `UserPreferences.language = 'fr'`

**API**:
```javascript
// Mettre à jour langue
PUT /api/user/preferences
{ language: 'en' } // 'fr', 'en', 'es', 'de'
→ { success: true, preferences: {...} }

// Récupérer langues supportées
GET /api/languages
→ { languages: ['fr', 'en', 'es', 'de'] }
```

**Frontend Context**:
```javascript
// Hook useLanguage
const { currentLanguage, setLanguage } = useLanguage();
// Tous les strings viennent d'un dictionnaire i18n
```

**Traduction**:
- Utiliser librairie i18n (`i18next` ou equivalent)
- Tous les contenus sont traduits
- Fallback en français si traduction manquante

---

### 3.2 Thème (Clair/Sombre)

**Description**: Choisir le mode d'affichage (clair/sombre/auto)

**Contenu**:
1. **Options de Thème**:
   - 🌙 **Sombre** (par défaut - Dark Sky palette)
   - ☀️ **Clair** (Light Sky palette)
   - ⚙️ **Auto** (suit système d'exploitation)

2. **Localisation**:
   - Header: Bouton toggle rapide (lune/soleil)
   - Paramètres > Préférences > Thème

3. **Stockage**:
   - localStorage: `{theme: 'dark'|'light'|'auto'}`
   - Backend: `UserPreferences.theme`

4. **Transition Fluide**:
   - Transition 300ms entre thèmes
   - Pas de flash blanc/noir

**CSS Implementation**:
```css
/* HTML classe change -->
<html class="light"> <!-- ou pas de classe pour dark par défaut

/* CSS Variables actualisées -->
:root.light {
  --background: 210 30% 97%;
  --foreground: 215 35% 12%;
  /* ... tous les autres */ 
}
```

**API**:
```javascript
// Mettre à jour thème
PUT /api/user/preferences
{ theme: 'dark'|'light'|'auto' }
→ { success: true, preferences: {...} }
```

**Hook Frontend**:
```javascript
const { theme, setTheme } = useTheme();
// Auto-synchronise avec système si 'auto'
```

---

### 3.3 Mode compact

**Description**: Réduire l'espace vertical pour plus d'infos à l'écran

**Contenu**:
1. **Activation**:
   - Toggle Oui/Non dans Paramètres
   - Appliqué partout immédiatement

2. **Effets du Mode Compact**:
   - Padding réduit (50%)
   - Margins réduits
   - Espacements diminués
   - Fonts légèrement plus petites
   - Densité d'infos augmentée

3. **Exemples de Changements**:
   - Liste forum: Plus de sujets visibles
   - Cartes: Plus compactes
   - Modals & Dialogs: Moins d'espace

**API**:
```javascript
PUT /api/user/preferences
{ compact_mode: true|false }
→ { success: true }
```

**CSS**:
```css
body.compact {
  --spacing: 0.5rem;   /* defaut: 1rem */
  --padding-lg: 1.5rem; /* defaut: 3rem */
}

.compact .card { padding: 0.5rem; }
.compact .list-item { margin-bottom: 0.25rem; }
```

---

### 3.4 Notifications

**Description**: Configurer tous les types de notifications

**Contenu**:
1. **Types de Notifications** (9 au total):
   - 📧 Email notifications
   - 🔔 Push notifications (navigateur)
   - 💬 Messages directs
   - 🎯 Mentions dans forum
   - ❤️ Likes sur mes posts
   - ✅ Solutions acceptées
   - 📢 Annonces importants
   - 💰 Notifications donations
   - 📝 Newsletter/Blog posts

2. **Fréquence**:
   - Immédiatement
   - Résumé quotidien
   - Résumé hebdomadaire
   - Désactivé

3. **Canaux**:
   - Email: Active/Inactive pour chaque type
   - Navigateur Push: Active/Inactive

4. **Quiet Hours** (optionnel):
   - De 22h à 8h: Pas de notifications
   - Sauf urgent

**API**:
```javascript
PUT /api/user/preferences
{
  notifications: {
    email_notifications: true,
    push_notifications: true,
    direct_messages: true,
    forum_mentions: true,
    likes: false,
    solutions: true,
    announcements: true,
    donations: false,
    newsletter: true,
    quiet_hours: { start: '22:00', end: '08:00' }
  }
}
```

**Entity**:
```json
"notification_preferences": {
  "email_notifications": true,
  "push_notifications": true,
  "direct_messages": true,
  "forum_mentions": true,
  "likes": false,
  "solutions": true,
  "announcements": true,
  "donations": false,
  "newsletter": true
}
```

---

### 3.5 Statut en ligne

**Description**: Afficher ou cacher votre statut "en ligne"

**Contenu**:
1. **Options**:
   - ✅ Afficher mon statut en ligne
   - ❌ Afficher hors ligne toujours
   - ⏱️ Caché après 5 min inactivité

2. **Où c'est visible?**:
   - Profil utilisateur
   - Liste utilisateurs du forum
   - Mentions dans commentaires

3. **Calcul du Statut**:
   - Présent si pagefocus + dernière action < 5 min
   - "En ligne" = vert
   - "Inactif depuis [temps]" = jaune
   - "Hors ligne" = gris

**API**:
```javascript
PUT /api/user/preferences
{ show_online_status: true|false }

// Mise à jour statut automatique
PUT /api/user/activity (appelé chaque 1 min si onpage focus)
→ Mis à jour last_activity timestamp
```

---

# SUITE DU DOCUMENT >

**NOTE**: Ce document est très volumineux. Les sections suivantes incluent:

- **4️⃣ FORUM** (7 sujets detaillés)
- **5️⃣ DONATIONS & FINANCES** (4 sujets)
- **6️⃣ DEVIS & SERVICES** (5 sujets)
- **7️⃣ CERTIFICATION** (4 sujets)
- **8️⃣ PROFIL UTILISATEUR** (4 sujets)
- **9️⃣ MESSAGERIE & NOTIFICATIONS** (4 sujets)
- **🔟 PLANNING & PROGRAMMATION** (3 sujets)
- **1️⃣1️⃣ PORTFOLIO & GALERIE** (1 sujet)
- **1️⃣2️⃣ PARRAINAGE & RÉFÉRRAL** (2 sujets)
- **1️⃣3️⃣ MODULES SPÉCIALISÉS** (2 sujets)
- **1️⃣4️⃣ BLOG & CONTENU** (2 sujets)
- **1️⃣5️⃣ ESPACE CLIENT** (2 sujets)
- **1️⃣6️⃣ À PROPOS & ENTREPRISE** (5 sujets)

**CONTINUEZ AVEC LE DOCUMENT SI VOUS AVEZ BESOIN D'INFOS COMPLÈTES SUR TOUS LES SUJETS**

---

**Pour les 55 sujets manquants, suivez la même structure**:
1. Description courte
2. Contenu à couvrir (points numérotés)
3. Données techniques (Entities Base44, API endpoints)
4. Code examples
5. Screenshots/Workflow
6. Tips & Warnings
7. Détails d'implémentation

---

## 🎨 DESIGN DE CHAQUE PAGE DOC

Chaque page doit avoir cette structure:

```
┌─────────────────────────────────────────────────────┐
│ [Docs > Compte > Se connecter]                      │  ← Breadcrumb
├─────────────────────────────────────────────────────┤
│(SIDEBAR)    │ CONTENT                   │(TOC)      │
│  - Compte   │ # Se connecter             │ - Intro   │
│    ├─ Créer │                            │ - Étape 1 │
│    ├─ Login │ Guide complet...           │ - Étape 2 │
│    └─ ...   │                            │ - Tips    │
│            │ ## Étape 1: Accès          │ - Avant   │
│            │                            │ - Après   │
│            │ Allez sur /login...        │           │
│            │                            │           │
│            │ [Screenshot login form]    │           │
│            │                            │           │
│            │ ## Étape 2: 2FA            │           │
│            │                            │           │
│            │ [Info Box]: Si activée...  │           │
│            │                            │           │
│            │ ## Erreurs Courantes       │           │
│            │ [Warning Box]: ...         │           │
│            │                            │           │
│            │ [Related Articles]         │           │
│            │ Nav: ← Prev | Next →      │           │
│            │                            │           │
│            │ [Help Box]: Questions?    │           │
└─────────────────────────────────────────────────────┘
```

### Structure Markdown Template:

```markdown
---
title: "Se connecter"
category: "Compte & Accès"
slug: "connexion"
description: "Guide complet pour vous connecter à votre compte"
updated: "2026-04-01"
---

# Se connecter

Guide étape par étape pour accéder à votre compte Brenne Aerial.

[TOC auto-générée]

## Étape 1: Accéder à la page de connexion

Allez sur /login ou cliquez sur...

[Screenshot: page login]

### Avant de commencer
- Vérifiez votre email
- Assurez-vous de votre mot de passe

> **Conseil**: Cochez "Se souvenir de moi" pour connexions futures

## Étape 2: Entrez vos identifiants

- Email ou username
- Mot de passe

[Screenshot: form filled]

## Étape 3: 2FA (si activée)

> **ℹ️ Info**: Si vous avez activé 2FA...
> Cliquez sur [lien vers 2FA]

[Screenshot: 2FA prompt]

### Codes de sauvegarde
Si vous avez perdu accès à votre 2FA:

> **⚠️ Warning**: Utilisez un "backup code" (1 seul usage)

## Erreurs Courantes

### Erreur: "Email non trouvé"
Cela signifie pas de compte avec cet email

> **Conseil**: [Créer un compte](./creer-compte.md)

### Erreur: "Mot de passe incorrect"
Le mot de passe ne correspond pas

> **Conseil**: [Récupérer votre mot de passe](./mot-de-passe-oublie.md)

## Avant/Après

**Avant de vous connecter:**
- ❌ Pas accès Dashboard
- ❌ Pas accès Paramètres
- ❌ Pas messages personnels

**Après connexion:**
- ✅ Accès Dashboard
- ✅ Accès tous les services
- ✅ Appareil enregistré

## Sujets Liés

- [Créer un compte](./creer-compte.md)
- [Authentification 2FA](./2fa.md)
- [Mot de passe oublié](./mot-de-passe-oublie.md)

## Besoin d'aide?

> Vous avez des questions? [Contacter le support](mailto:support@brenne-aerial.com)

---

← [Créer un compte](./creer-compte.md) | [Paramètres du compte](./parametres-compte.md) →

*Dernière mise à jour: 1 avril 2026*
```

### Composants Réutilisables:

```jsx
// InfoBox
<InfoBox type="info" title="À Savoir">
  Si vous ne voyez pas...
</InfoBox>

// CodeBlock
<CodeBlock language="javascript" copyButton>
{`const response = await login(email, password);`}
</CodeBlock>

// BeforeAfter
<BeforeAfter
  before="❌ Vous ne pouvez pas..."
  after="✅ Maintenant vous pouvez..."
/>

// RelatedArticles Component automatique
// génère depuis metadata docs
```

---

**FIN DU MEGA PROMPT**

Vous avez tous les outils, données, et spécifications nécessaires pour créer la documentation!

LES 55 SUJETS RESTANTS SUIVENT LA MÊME STRUCTURE - AJOUTER SI NÉCESSAIRE.
