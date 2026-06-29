import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    if (error.response?.status === 401) {
      // Token expired or invalid - clear it
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
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
      return axiosClient.post('/api/auth/signup', {
        email,
        password,
        username,
        display_name,
      });
    },

    /**
     * Login with Firebase token
     * @param {string} email
     * @param {string} firebaseToken - Firebase ID token
     * @returns {Promise<{user: object, token: string}>}
     */
    loginWithFirebase: async (email, firebaseToken) => {
      const response = await axiosClient.post('/api/auth/login', {
        email,
        firebaseToken,
      });
      
      // Store JWT token
      if (response.token) {
        localStorage.setItem('jwt_token', response.token);
      }
      
      return response;
    },

    /**
     * Verify Firebase token and get JWT
     * @param {string} firebaseToken
     * @returns {Promise<{user: object, token: string}>}
     */
    verifyToken: async (firebaseToken) => {
      const response = await axiosClient.post('/api/auth/verify-token', {
        token: firebaseToken,
      });
      
      // Store JWT token
      if (response.token) {
        localStorage.setItem('jwt_token', response.token);
      }
      
      return response;
    },

    /**
     * Get current user (requires JWT)
     * @returns {Promise<object>}
     */
    getMe: async () => {
      return axiosClient.get('/api/auth/me');
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
      return axiosClient.get('/api/users/me');
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
     * @returns {Promise<array>}
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
  },
};

export default apiClient;
