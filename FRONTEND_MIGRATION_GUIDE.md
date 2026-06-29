# 🎨 Guide Frontend: Migration de Base44 à Express

## Concept Clé: Remplacer `base44Client` par Axios

**Avant (Base44):**
```javascript
import { base44 } from '@/api/base44Client';
const user = await base44.auth.me();
```

**Après (Express):**
```javascript
import client from '@/api/client';
const { data: user } = await client.get('/users/me');
```

---

## Étape 1: Créer le Client Axios

### `src/api/client.js` - HTTP Client
```javascript
import axios from 'axios';
import { useAuthStore } from '@/lib/auth-store.js';

// Créer instance Axios
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Ajouter token à chaque requête
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Gérer les erreurs 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

---

## Étape 2: Services API

### `src/services/userService.js`
```javascript
import client from '@/api/client';

export const userService = {
  // Get profil courant
  getMe: async () => {
    const { data } = await client.get('/users/me');
    return data;
  },

  // Get profil public
  getPublicProfile: async (username) => {
    const { data } = await client.get(`/users/${username}`);
    return data;
  },

  // Mettre à jour profil
  updateProfile: async (updates) => {
    const { data } = await client.put('/users/me', updates);
    return data;
  },

  // List all users (admin)
  listUsers: async () => {
    const { data } = await client.get('/users');
    return data;
  },

  // Get user by ID
  getById: async (id) => {
    const { data } = await client.get(`/users/${id}`);
    return data;
  }
};
```

### `src/services/appointmentService.js`
```javascript
import client from '@/api/client';

export const appointmentService = {
  // List appointments
  list: async (filters = {}) => {
    const { data } = await client.get('/appointments', { params: filters });
    return data;
  },

  // Get single appointment
  get: async (id) => {
    const { data } = await client.get(`/appointments/${id}`);
    return data;
  },

  // Create appointment
  create: async (appointmentData) => {
    const { data } = await client.post('/appointments', appointmentData);
    return data;
  },

  // Update appointment
  update: async (id, updates) => {
    const { data } = await client.put(`/appointments/${id}`, updates);
    return data;
  },

  // Delete appointment
  delete: async (id) => {
    await client.delete(`/appointments/${id}`);
  }
};
```

### `src/services/authService.js`
```javascript
import client from '@/api/client';

export const authService = {
  // Signup
  signup: async (email, password, username, displayName) => {
    const { data } = await client.post('/auth/signup', {
      email,
      password,
      username,
      display_name: displayName
    });
    return data;
  },

  // Login
  login: async (email, password) => {
    const { data } = await client.post('/auth/login', {
      email,
      password
    });
    return data;
  },

  // Verify Firebase token (exchange pour JWT)
  verifyToken: async (firebaseToken) => {
    const { data } = await client.post('/auth/verify-token', {}, {
      headers: {
        Authorization: `Bearer ${firebaseToken}`
      }
    });
    return data;
  },

  // Logout
  logout: async () => {
    await client.post('/auth/logout');
  },

  // Verify code (2FA)
  verifyCode: async (code) => {
    const { data } = await client.post('/auth/verify-code', { code });
    return data;
  }
};
```

### `src/services/messageService.js`
```javascript
import client from '@/api/client';

export const messageService = {
  // Get conversations
  getConversations: async () => {
    const { data } = await client.get('/messages/conversations');
    return data;
  },

  // Get messages with user
  getWithUser: async (userId) => {
    const { data } = await client.get(`/messages/with/${userId}`);
    return data;
  },

  // Send message
  send: async (recipientId, content) => {
    const { data } = await client.post('/messages', {
      recipient_id: recipientId,
      content
    });
    return data;
  },

  // Mark as read
  markAsRead: async (messageId) => {
    const { data } = await client.put(`/messages/${messageId}/read`);
    return data;
  }
};
```

---

## Étape 3: Auth Store (Pinia ou Context)

### `src/lib/auth-store.js` - Zustand/Pinia
```javascript
import { create } from 'zustand';
import { authService } from '@/services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  // Initialize
  initialize: async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        set({ token });
        // Optionnel: Vérifier que le token est valide
      } catch (error) {
        localStorage.removeItem('authToken');
        set({ token: null, user: null });
      }
    }
    set({ loading: false });
  },

  // Login
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('authToken', token);
      set({ user, token, loading: false });
      return { user, token };
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Signup
  signup: async (email, password, username, displayName) => {
    try {
      set({ loading: true, error: null });
      const { user, token } = await authService.signup(
        email,
        password,
        username,
        displayName
      );
      localStorage.setItem('authToken', token);
      set({ user, token, loading: false });
      return { user, token };
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null });
  },

  // Set user after verification
  setUser: (user) => {
    set({ user });
  }
}));
```

### **OU avec Context (Réact classique)**

```javascript
// src/lib/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
        // Récupérer l'utilisateur
        try {
          // Vous pouvez appeler /users/me si vous avez le JWT
          setUser({ /* user data */ });
        } catch (err) {
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    initialize();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('authToken', token);
      setUser(user);
      setToken(token);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  };

  const value = { user, token, loading, error, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Étape 4: Remplacer `base44` Partout

### Chercher tous les imports
```bash
grep -r "from '@/api/base44Client'" src/
grep -r "import.*base44" src/
```

### Pattern de Remplacement

**Avant:**
```javascript
import { base44 } from '@/api/base44Client';

const user = await base44.auth.me();
const appointments = await base44.appointments.find({});
await base44.messages.create({ ... });
```

**Après:**
```javascript
import { userService } from '@/services/userService';
import { appointmentService } from '@/services/appointmentService';
import { messageService } from '@/services/messageService';

const user = await userService.getMe();
const appointments = await appointmentService.list();
await messageService.send(recipientId, content);
```

---

## Étape 5: Mettre à Jour AuthContext.jsx

### Avant (Base44):
```javascript
import { base44 } from '@/api/base44Client';

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    const checkAppState = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAppState();
  }, []);
};
```

### Après (Express):
```javascript
import { userService } from '@/services/userService';

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await userService.getMe();
        setUser(user);
      } catch (error) {
        // Pas authentifié
      }
    };
    if (localStorage.getItem('authToken')) {
      checkAuth();
    }
  }, []);
};
```

---

## Étape 6: Variables d'Environnement Frontend

### `.env.local`
```bash
# Mode développement
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_CONFIG={"projectId":"brenne-aerial-37443",...}
```

### `.env.production`
```bash
# Mode production
VITE_API_URL=https://brenne-aerial-backend.onrender.com/api
```

### Utiliser dans le code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Étape 7: Exemple Complet: Page Login

### Avant (Base44):
```javascript
import { base44 } from '@/api/base44Client';

export const Login = () => {
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Base44 gère tout
      await base44.auth.createUserWithEmailAndPassword(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Après (Express):
```javascript
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/lib/auth-store';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Mot de passe"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Connexion</button>
    </form>
  );
};
```

---

## Étape 8: Exemple: Liste Rendez-vous

### Avant (Base44):
```javascript
import { base44 } from '@/api/base44Client';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Real-time listener Base44
    const unsubscribe = base44.appointments.onChange((appts) => {
      setAppointments(appts);
    });
    return unsubscribe;
  }, []);

  return (
    <div>
      {appointments.map(appt => (
        <div key={appt.id}>{appt.title}</div>
      ))}
    </div>
  );
};
```

### Après (Express):
```javascript
import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await appointmentService.list();
        setAppointments(data);
      } catch (error) {
        console.error('Failed to load appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Optionnel: Rafraîchir tous les 5 secondes (polling)
    const interval = setInterval(loadAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {appointments.map(appt => (
        <div key={appt.id}>{appt.title}</div>
      ))}
    </div>
  );
};
```

---

## Étape 9: React Query (TanStack Query) - Optionnel mais Recommandé

```javascript
// src/hooks/useAppointments.js
import { useQuery, useMutation } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointmentService';

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.list(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: (appointmentData) => appointmentService.create(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};
```

### Utiliser dans un composant:
```javascript
import { useAppointments, useCreateAppointment } from '@/hooks/useAppointments';

export const Appointments = () => {
  const { data: appointments, isLoading } = useAppointments();
  const createMutation = useCreateAppointment();

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      {appointments?.map(appt => (
        <div key={appt.id}>{appt.title}</div>
      ))}
    </div>
  );
};
```

---

## ✅ Checklist Frontend

- [ ] Créer `src/api/client.js` (Axios)
- [ ] Créer tous les `src/services/*.js`
- [ ] Créer `src/lib/auth-store.js` ou `AuthContext.jsx`
- [ ] Remplacer tous les imports `base44Client`
- [ ] Mettre à jour AuthContext.jsx
- [ ] Tester login/signup
- [ ] Tester les routes CRUD
- [ ] Variables d'environnement configurées
- [ ] Frontend lancé localement: `npm run dev`
- [ ] Connecté au backend Express

---

## 🧪 Tester l'Intégration

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Dans le navigateur:
# http://localhost:5173
# -> Essayer login/signup
# -> Vérifier Network tab (pas d'erreurs)
# -> Vérifier localStorage (authToken présent)
```

---

**Vous êtes prêt! Lancez le frontend et le backend côte à côte! 🚀**
