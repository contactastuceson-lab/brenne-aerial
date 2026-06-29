import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export { app };

// Lazy loader — call this only when you need messaging (avoids unsupported-browser crash at module init)
export async function getFirebaseMessaging() {
  try {
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
    const messaging = getMessaging(app);
    return { messaging, getToken, onMessage };
  } catch (_) {
    return null;
  }
}