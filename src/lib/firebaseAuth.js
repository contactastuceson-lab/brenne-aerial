import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { app } from './firebase';
import { apiClient } from '@/api/client';

// Get auth lazily to avoid initialization errors
const getAuthInstance = () => getAuth(app);

// Setup providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

/**
 * Firebase Auth Utilities
 * Handles Firebase auth + backend JWT integration
 */
export const firebaseAuthService = {
  /**
   * Sign up with email and password
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @param {string} displayName
   * @returns {Promise<{user: object, token: string}>}
   */
  signup: async (email, password, username, displayName) => {
    try {
      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
      const firebaseUser = userCredential.user;
      
      // 2. Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();
      
      // 3. Register in backend (this will create PostgreSQL user)
      const response = await apiClient.auth.signup(
        email,
        password,
        username,
        displayName || username
      );
      
      // 4. Store JWT from backend
      apiClient.setToken(response.token);
      
      return response;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cet email est déjà utilisé');
      }
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string}>}
   */
  loginWithEmail: async (email, password) => {
    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(getAuthInstance(), email, password);
      const firebaseUser = userCredential.user;
      
      // 2. Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();
      
      // 3. Verify with backend (get JWT)
      const response = await apiClient.auth.loginWithFirebase(email, firebaseToken);
      
      // 4. Token already stored by apiClient
      return response;
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect');
      }
      throw error;
    }
  },

  /**
   * Login with Google
   * @returns {Promise<{user: object, token: string}>}
   */
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(getAuthInstance(), googleProvider);
      const firebaseUser = result.user;
      const firebaseToken = await firebaseUser.getIdToken();
      
      // Call backend to verify and get JWT
      const response = await apiClient.auth.loginWithFirebase(
        firebaseUser.email,
        firebaseToken
      );
      
      return response;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Authentification annulée');
      }
      throw error;
    }
  },

  /**
   * Login with Facebook
   * @returns {Promise<{user: object, token: string}>}
   */
  loginWithFacebook: async () => {
    try {
      const result = await signInWithPopup(getAuthInstance(), facebookProvider);
      const firebaseUser = result.user;
      const firebaseToken = await firebaseUser.getIdToken();
      
      const response = await apiClient.auth.loginWithFirebase(
        firebaseUser.email,
        firebaseToken
      );
      
      return response;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Authentification annulée');
      }
      throw error;
    }
  },

  /**
   * Login with Microsoft
   * @returns {Promise<{user: object, token: string}>}
   */
  loginWithMicrosoft: async () => {
    try {
      const result = await signInWithPopup(getAuthInstance(), microsoftProvider);
      const firebaseUser = result.user;
      const firebaseToken = await firebaseUser.getIdToken();
      
      const response = await apiClient.auth.loginWithFirebase(
        firebaseUser.email,
        firebaseToken
      );
      
      return response;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Authentification annulée');
      }
      throw error;
    }
  },

  /**
   * Generic login with provider
   * @param {string} provider - 'google' | 'facebook' | 'microsoft'
   * @returns {Promise<{user: object, token: string}>}
   */
  loginWithProvider: async (provider) => {
    switch (provider) {
      case 'google':
        return firebaseAuthService.loginWithGoogle();
      case 'facebook':
        return firebaseAuthService.loginWithFacebook();
      case 'microsoft':
        return firebaseAuthService.loginWithMicrosoft();
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await signOut(getAuthInstance());
      apiClient.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Get current user from Firebase
   * @returns {firebase.User | null}
   */
  getCurrentUser: () => getAuthInstance().currentUser,

  /**
   * Subscribe to auth state changes
   * @param {function} callback
   * @returns {function} unsubscribe
   */
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(getAuthInstance(), async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in - verify with backend if needed
        try {
          const firebaseToken = await firebaseUser.getIdToken();
          const userData = await apiClient.auth.verifyToken(firebaseToken);
          callback(userData);
        } catch (error) {
          console.error('Failed to verify token with backend:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  /**
   * Get JWT token from localStorage
   */
  getJWTToken: () => apiClient.getToken(),

  /**
   * Check if user has valid JWT
   */
  isAuthenticated: () => apiClient.isAuthenticated(),
};

export default firebaseAuthService;
