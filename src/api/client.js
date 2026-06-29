import axios from 'axios';

const viteMeta = /** @type {{ env?: { VITE_API_URL?: string } }} */ (import.meta);
const configuredApiUrl = (viteMeta.env?.VITE_API_URL || '').trim();
const fallbackApiUrl = typeof window !== 'undefined' ? window.location.origin : '';
const rawApiUrl = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, '');
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl.replace(/\/api$/, '') : rawApiUrl;

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const hasToken = Boolean(localStorage.getItem('jwt_token'));
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/signup') || error.config?.url?.includes('/auth/verify-token');
    const skipAuthRedirect = error.config?.headers?.['x-skip-auth-redirect'] === 'true' || error.config?.headers?.['X-Skip-Auth-Redirect'] === 'true';

    if (error.response?.status === 401 && hasToken && !isAuthRequest && !skipAuthRedirect) {
      // Token expired or invalid - clear it and redirect only for authenticated sessions
      localStorage.removeItem('jwt_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API Client for Brenne Aerial Backend
 * Handles authentication, users, and other endpoints
 */
export const apiClient = {
  // ======== AUTH ENDPOINTS ========
  auth: {
    /**
     * Sign up with email and password
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @param {string} display_name
     * @returns {Promise<{user: object, token: string}>}
     */
    signup: async (email, password, username, display_name) => {
      const response = /** @type {{ user?: object, token?: string }} */ (
        await axiosClient.post('/api/auth/signup', {
          email,
          password,
          username,
          display_name,
        })
      );

      if (response.token) {
          apiClient.setToken(response.token);
      }

      return response;
    },

    /**
     * Login with Firebase token
     * @param {string} email
     * @param {string} firebaseToken - Firebase ID token
     * @returns {Promise<{user: object, token: string}>}
     */
    loginWithFirebase: async (email, firebaseToken) => {
      const response = /** @type {{ user?: object, token?: string }} */ (
        await axiosClient.post('/api/auth/login', {
          email,
          firebaseToken,
        })
      );

      if (response.token) {
          apiClient.setToken(response.token);
      }

      return response;
    },

    /**
     * Verify Firebase token and get JWT
     * @param {string} firebaseToken
     * @returns {Promise<{user: object, token: string}>}
     */
    verifyToken: async (firebaseToken) => {
      const response = /** @type {{ user?: object, token?: string }} */ (
        await axiosClient.post('/api/auth/verify-token', {
          token: firebaseToken,
        })
      );

      if (response.token) {
          apiClient.setToken(response.token);
      }

      return response;
    },

    /**
     * Get current user (requires JWT)
     * @returns {Promise<object>}
     */
    getMe: async () => {
      return axiosClient.get('/api/auth/me', {
        headers: {
          'x-skip-auth-redirect': 'true',
        },
      });
    },

    /**
     * Logout - clears local token
     */
    logout: async () => {
      localStorage.removeItem('jwt_token');
      return axiosClient.post('/api/auth/logout');
    },

    /**
     * Register FCM token for push notifications
     * @param {string} fcmToken
     */
    registerFcmToken: async (fcmToken) => {
      return axiosClient.post('/api/auth/register-fcm-token', {
        fcmToken,
      });
    },
  },

  // ======== USERS ENDPOINTS ========
  users: {
    /**
     * Get current user profile
     * @returns {Promise<object>}
     */
    getMe: async () => {
      return axiosClient.get('/api/users/me', {
        headers: {
          'x-skip-auth-redirect': 'true',
        },
      });
    },

    /**
     * Get public profile by username
     * @param {string} username
     * @returns {Promise<object>}
     */
    getProfile: async (username) => {
      return axiosClient.get(`/api/users/${username}`);
    },

    /**
     * Update current user profile
     * @param {object} data
     * @returns {Promise<object>}
     */
    updateProfile: async (data) => {
      return axiosClient.put('/api/users/me', data);
    },

    /**
     * Get all users (admin only)
     * @returns {Promise<any[]>}
     */
    getAllUsers: async () => {
      return axiosClient.get('/api/users');
    },
  },

  // ======== UTILITY ========
  /**
   * Get JWT token from localStorage
   */
  getToken: () => localStorage.getItem('jwt_token'),

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => !!localStorage.getItem('jwt_token'),

  /**
   * Set JWT token in localStorage
   */
  setToken: (token) => localStorage.setItem('jwt_token', token),

  /**
   * Clear all auth data
   */
  clearAuth: () => {
    localStorage.removeItem('jwt_token');
    try { window.dispatchEvent(new CustomEvent('auth-changed', { detail: { authed: false } })); } catch (e) {}
  },
};

export default apiClient;
