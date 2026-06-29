import { apiClient } from '@/api/client';

const auth = {
  me: async () => apiClient.auth.getMe(),
  isAuthenticated: async () => apiClient.isAuthenticated(),
  logout: async (redirectTo) => {
    apiClient.clearAuth();
    if (typeof window !== 'undefined' && redirectTo) {
      window.location.href = redirectTo;
    }
  },
  redirectToLogin: (path) => {
    if (typeof window === 'undefined') return;
    if (!path || path === '/') {
      window.location.href = '/login';
      return;
    }
    window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
  },
  updateMe: async (data) => apiClient.users.updateProfile(data),
};

const unsupportedEntityMethod = (entityName, method) => async () => {
  throw new Error(`Base44 entity \"${entityName}.${method}\" is not supported. Migrate this call to a backend API endpoint.`);
};

const entityHandler = {
  get(target, entityName) {
    const methods = ['list', 'filter', 'get', 'create', 'update', 'delete', 'subscribe'];
    const entityProxy = {};
    methods.forEach((method) => {
      entityProxy[method] = unsupportedEntityMethod(entityName, method);
    });
    return entityProxy;
  },
};

const unsupportedFunction = async (name) => {
  throw new Error(`Base44 function \"${name}\" is not supported. Migrate this call to a backend API endpoint.`);
};

export const base44 = {
  auth,
  functions: {
    invoke: async (name) => unsupportedFunction(name),
  },
  entities: new Proxy({}, entityHandler),
  integrations: {
    Core: {
      UploadFile: async () => {
        throw new Error('Base44 Core.UploadFile is not supported. Migrate uploads to a backend API.');
      },
    },
  },
};
