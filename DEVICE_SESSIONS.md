# Appareil Connecté - Auto-Registration System

## Pourquoi tu ne voyais aucun appareil ?

Avant, les appareils n'étaient **pas créés automatiquement** lors de la connexion. Maintenant, ils sont enregistrés automatiquement !

## Comment ça marche

### 1️⃣ **Connexion Utilisateur**
- Quand tu te connectes à l'app, le hook `useRegisterDevice` détecte votre navigateur
- Il envoie les infos au backend

### 2️⃣ **Enregistrement du Dispositif**
- Le backend crée une **DeviceSession** avec :
  - 🌐 **Navigateur** (Chrome, Firefox, Safari, etc.)
  - 💻 **Système d'exploitation** (Windows, macOS, Linux, iOS, Android)
  - 📱 **Type d'appareil** (desktop, mobile, tablet)
  - 🔗 **Adresse IP**
  - 🖥️ **User-Agent** (détails techniques)
  - ⏰ **Timestamp** (date/heure de connexion)

### 3️⃣ **Affichage dans Paramètres**
- Tu vois dans **Sécurité & Confidentialité** → **Sécurité** :
  - ✅ **Appareil actuel** (en vert)
  - 📊 **Autres appareils connectés**

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🟢 Appareil Actuel | Mis en évidence, c'est celui que tu utilises maintenant |
| 📱 Autres Appareils | Tous les autres appareils connectés à ton compte |
| 🔌 Déconnecter | Clique sur un appareil pour le déconnecter |
| 💥 Déco Tout | Déconnecte tous les autres appareils à la fois |
| ⏰ Dernière Activité | Vois quand chaque appareil a été utilisé |
| 🗺️ Info IP | Adresse IP de connexion pour chaque appareil |

## Architecture

### Backend Functions

**`createDeviceSession()`**
- Appelée automatiquement lors de la connexion
- Détecte le navigateur, l'OS, le type d'appareil
- Crée ou met à jour la session en base de données
- Marque tous les autres appareils comme non-courants

**`getDeviceSessions()`**
- Récupère toutes les sessions d'un utilisateur
- Classées par : courant d'abord, puis par dernière activité

**`disconnectDevice()`**
- Déconnecte un appareil spécifique
- Crée une entrée audit logging

**`disconnectAllOtherDevices()`**
- Déconnecte tous les appareils sauf le courant
- Utilise un audit log centralisé

### Frontend Components

**`useRegisterDevice(user)` Hook**
- Détecte automatiquement l'appareil du navigateur
- Enregistre la session quand l'utilisateur se connecte
- Non-bloquant (n'affecte pas la connexion si ça échoue)

**`PublicLayout` & `AdminLayout`**
- Intègrent le hook automatiquement
- Aucune action manuelle requise

**`ActiveDevices` Component**
- Affiche la liste des appareils
- Permet la déconnexion
- Auto-refresh toutes les minutes

## Détection Automatique

L'app détecte automatiquement :

| Info | Détection |
|---|---|
| **Chrome** | Cherche "Chrome" dans user-agent |
| **Firefox** | Cherche "Firefox" dans user-agent |
| **Safari** | Cherche "Safari" dans user-agent |
| **Edge** | Cherche "Edge" dans user-agent |
| **Windows** | Cherche "Windows" dans user-agent |
| **macOS** | Cherche "Mac" dans user-agent |
| **Linux** | Cherche "Linux" dans user-agent |
| **Android** | Cherche "Android" dans user-agent |
| **iOS** | Cherche "iPhone" ou "iPad" dans user-agent |
| **Mobile** | iPhone détecté → type = "mobile" |
| **Tablet** | iPad détecté → type = "tablet" |

## Sécurité

### ✅ Mesures Prises
- Chaque session enregistrée avec **adresse IP**
- Audit logging de chaque **déconnexion**
- Seul toi peux voir **tes propres appareils**
- Backend vérifie que l'appareil appartient à l'utilisateur

### 🔒 Cas d'usage
- **Détecte le partage de compte** : Si tu vois des appareils inconnus
- **Localise les connexions suspectes** : Via IP + timestamp
- **Sécurise ton compte** : Déconnecte les sessions non utilisées
- **Force logout global** : Déco tous les autres appareils

## Exemple de Session

```json
{
  "id": "uuid-unique",
  "session_id": "abc123xyz",
  "user_email": "user@example.com",
  "device_name": "Windows Chrome",
  "device_type": "desktop",
  "browser": "Chrome",
  "os": "Windows",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "created_at": "2026-04-19T10:30:00Z",
  "last_activity": "2026-04-19T14:45:00Z",
  "is_current": true,
  "is_trusted": false
}
```

## Flux de Données

```
1. Utilisateur se connecte
   ↓
2. Layout charge (PublicLayout ou AdminLayout)
   ↓
3. useRegisterDevice hook s'exécute
   ↓
4. Détecte browser/OS/IP via user-agent & serveur
   ↓
5. Appelle createDeviceSession() backend
   ↓
6. Backend crée/met à jour DeviceSession
   ↓
7. ActiveDevices component query getDeviceSessions()
   ↓
8. Affiche la liste des appareils
```

## FAQ

### Les appareils s'affichent après combien de temps ?
- **Immédiatement** après la connexion
- Le hook s'exécute automatiquement
- Aucune action de ta part nécessaire

### Je vois un appareil inconnu, que faire ?
1. Va dans **Paramètres** → **Sécurité & Confidentialité** → **Sécurité**
2. Clique **Déco** sur l'appareil inconnu
3. Change ton mot de passe pour plus de sécurité

### Puis-je faire confiance à ces appareils ?
- Oui, ils sont détectés automatiquement à partir de ton navigateur
- Si tu vois un appareil différent = quelqu'un a accès à ton compte

### Les appareils se déconnectent automatiquement ?
- Non, ils restent actifs tant que tu ne les déconnectes pas
- Il n'y a pas de timeout automatique
- La session reste valide même si navigateur est fermé

### IP address = Location exacte ?
- Non, c'est juste l'adresse IP du réseau
- Ça peut être approximatif (à la ville près généralement)
- Utile pour voir d'où vient une connexion

## Fichiers Modifiés

### Backend
- `base44/functions/deviceSession/index.js` (NEW)

### Frontend
- `src/hooks/useRegisterDevice.js` (NEW)
- `src/components/layout/PublicLayout.jsx` (UPDATED)
- `src/components/admin/AdminLayout.jsx` (UPDATED)
- `src/components/security/ActiveDevices.jsx` (UPDATED)

## Prochaines Améliorations Possibles

- [ ] **Appareil de confiance** : Marquer des appareils comme fiables
- [ ] **Géolocalisation réelle** : Afficher la vraie location via IP
- [ ] **Notifications** : Alerte si connexion depuis nouvel appareil
- [ ] **Timeout de session** : Déconnecter après X jours d'inactivité
- [ ] **Nom personnalisé** : Renommer les appareils ("Mon iPhone", etc.)
- [ ] **Historique** : Voir l'historique de tous les appareils passés
- [ ] **2FA par appareil** : Protection supplémentaire
- [ ] **Device fingerprinting** : Empreinte unique pour chaque appareil
