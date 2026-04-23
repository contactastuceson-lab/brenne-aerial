# Guide de Débogage - Gestion des Appareils Connectés

## 🔍 Statut de l'Implémentation

Tous les composants pour la gestion des appareils sont en place:
- ✅ Entity `DeviceSession` définie
- ✅ 4 fonctions backend créées avec logging détaillé
- ✅ Hook `useRegisterDevice` intégré dans les layouts
- ✅ Composant `ActiveDevices` implémenté
- ✅ Fallback mechanisms en place

**Problème actuel**: Les appareils ne s'affichent pas malgré tout le code en place.

## 🛠️ Comment Déboguer

### Étape 1: Ouvrir la Console Navigateur

1. Dans votre navigateur Chrome/Firefox/Edge:
   - **Windows/Linux**: `F12` ou `Ctrl+Shift+I`
   - **Mac**: `Cmd+Option+I`
2. Allez à l'onglet **Console**
3. Assurez-vous que le "Log Level" est sur "Verbose" ou "All"

### Étape 2: Se Connecter et Checker les Logs

Cherchez les logs avec ces préfixes:
```
[Device Registration] Starting for user:
[Device Registration] Device detected as:
[createDeviceSession] 
[getDeviceSessions]
[ActiveDevices]
```

### Étape 3: Interpréter les Logs

#### Scénario A: Logs `[Device Registration]` n'apparaissent pas
**Diagnostic**: Le hook useRegisterDevice n'exécute pas du tout.

**Causes possibles**:
- L'hook n'est pas appelé dans le Layout
- La dépendance `user` n'est pas définie au moment où le hook s'exécute
- La vérification localStorage bloque l'exécution

**Correction**:
```javascript
// Vérifier dans PublicLayout.jsx ou AdminLayout.jsx that useRegisterDevice is called
useRegisterDevice(user);
```

#### Scénario B: Logs `[Device Registration]` apparaissent mais s'arrêtent brutalement
**Diagnostic**: Le hook s'exécute mais échoue quelque part.

**Causes possibles**:
- `user.email` est undefined 
- `base44.functions.invoke()` n'est pas accessible
- L'appel réseau vers le backend échoue

**Correction**:
Vérifiez que:
```javascript
console.log('User object:', user);  // Doit avoir un email
console.log('user.email:', user?.email);
```

#### Scénario C: Logs `[createDeviceSession]` apparaissent au SERVEUR
**Diagnostic**: Le frontend envoie la requête, le backend la reçoit.

**Informations à chercher**:
```
[createDeviceSession] Input: { user_email, device_name, device_type }
[createDeviceSession] IP: xxx.xxx.xxx.xxx
[createDeviceSession] Detected: { browser, os, deviceType }
```

Si vous voyez ces logs mais pas `✅ Created:`, le problème est dans la création de l'entity DeviceSession.

#### Scénario D: Logs apparaissent mais `[getDeviceSessions]` retourne 0 sessions
**Diagnostic**: Les sessions sont créées mais pas trouvées à la requête.

**Causes possibles**:
- `user_email` est différent entre création et lecture (capitalisation, whitespace)
- Délai entre création et requête (timing issue)
- Entity filter n'utilise pas le bon champ

## 📊 Architecture du Flux

```
┌─ PublicLayout / AdminLayout ─┐
│                              │
│ ┌──────────────────────────┐ │
│ │ useRegisterDevice Hook   │ │
│ │ (Appel du frontend)      │ │
│ └────────────┬─────────────┘ │
│              │                │
└──────────────┼────────────────┘
               │
               ▼
        API Call to Backend
     base44.functions.invoke(
       'createDeviceSession', {...}
     )
               │
               ▼
   ┌────────────────────────────┐
   │ Function createDeviceSession│
   │ (Backend logging)           │
   │ - Detect browser/OS/IP      │
   │ - Create/Update DeviceSession│
   │ - Mark others as not_current│
   └────────┬───────────────────┘
            │
            ▼
   ┌─────────────────────────┐
   │ DeviceSession Entity    │
   │ (Base44 Data Storage)   │
   └────────┬────────────────┘
            │
            ▼
   ┌─────────────────────────┐
   │ ActiveDevices Component │
   │ (Frontend query)         │
   │ useQuery → getDeviceSessions
   └────────┬────────────────┘
            │
            ▼
   Display "0 appareil actif"
   or list of devices
```

## 🔧 Points de Debugging Supplémentaires

### Dans le Frontend (useRegisterDevice.js)
Vérifiez ces logs successivement:

```javascript
console.log('[Device Registration] Starting for user:', user?.email);
// → Si ce log n'apparaît pas, le hook n's'exécute pas

console.log('[Device Registration] Device:', { browser, os, deviceType });
// → Si absent, la détection échoue

console.log('[Device Registration] Calling createDeviceSession...');
// → Si absent, user.email est probablement undefined

console.log('[Device Registration] ✅ Success:', response);
// → Si absent, l'appel réseau a échoué

console.log('[Device Registration] ❌ Error:', error);
// → Voir le message d'erreur complet
```

### Dans le Backend (deviceSession/index.js)
Regardez les logs serveur:

```
[createDeviceSession] Input: {...}
[createDeviceSession] Found existing sessions: X
[createDeviceSession] Detected: {...}
[createDeviceSession] Creating/Updating session...
[createDeviceSession] ✅ Created: <session-id>
```

Si `Creating/Updating session` n'est pas suivi par `✅ Created:`, il y a une erreur d'exception.

### Dans ActiveDevices (Frontend)
Logs du chargement des appareils:

```javascript
console.log('[ActiveDevices] Fetching devices for:', user?.email);
// → Vérifie que le composant essaie de charger

console.log('[ActiveDevices] Found sessions:', sessions.length);
// → Nombre d'appareils trouvés

console.log('[ActiveDevices] State:', { devicesCount, isLoading, error });
// → État complet du composant
```

## 🔐 Cas de Test

### Test 1: Auto-registration basique
1. Ouvrir les DevTools
2. Effacer le localStorage: `localStorage.clear()`
3. Se connecter
4. Chercher `[Device Registration]` logs
5. Aller à Settings → Security → Active Devices
6. Vérifier si un appareil apparaît

### Test 2: Éviter la double-registration
1. Se connecter
2. Recharger la page
3. Chercher `[Device Registration]` logs
4. Si aucun log après rechargement, c'est bon (localStorage a bloqué la re-registration)

### Test 3: Backend Response
1. Se connecter
2. Ouvrir onglet Network des DevTools
3. Chercher requêtes vers `createDeviceSession` et `getDeviceSessions`
4. Vérifier les réponses JSON

## 📝 Prochaines Étapes de Debugging

1. **Vérifier le User Object**: 
   ```
   Avant useRegisterDevice, log le user complet
   user = { email, full_name, ... }
   ```

2. **Vérifier le localStorage**:
   ```javascript
   console.log('localStorage:', localStorage.getItem(`device_registered_${user?.email}`));
   ```

3. **Vérifier DeviceSession Entity**:
   ```
   Si createDeviceSession échoue, vérifier que DeviceSession.jsonc existe dans base44/entities/
   ```

4. **Network requests**:
   ```
   DevTools → Network tab
   Filtrer par "deviceSession" ou "createDeviceSession"
   Vérifier status 200 et response body
   ```

## 🚀 Commandes Utiles (Console Frontend)

```javascript
// Vérifier l'utilisateur actuel
console.log(window.__app_user__);

// Vérifier si base44 est disponible
console.log(typeof base44);

// Vérifier localStorage
localStorage.getItem('device_registered_your-email@example.com');

// Forcer la re-registration
localStorage.clear();
// Puis recharger la page

// Manuellement appeler createDeviceSession
base44.functions.invoke('createDeviceSession', {
  user_email: 'your-email@example.com'
}).then(r => console.log('Success:', r))
  .catch(e => console.error('Error:', e));
```

## 📞 Information pour le Support

Quand vous rapportez le problème, incluez:

1. **Screenshots des logs de console avec [Device Registration]**
2. **Network tab → Réponses de createDeviceSession et getDeviceSessions**
3. **User email utilisé**
4. **Browser et OS**
5. **Si le message d'erreur complet apparaît dans les logs**

---

**Dernier update**: Session debugging améliorée avec 3 niveaux de fallback et logging détaillé à chaque étape.
