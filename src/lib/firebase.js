import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBeK6XlNs9eVEB5kVwh_Khyr9qyemUpaLw",
  authDomain: "brenne-aerial-37443.firebaseapp.com",
  projectId: "brenne-aerial-37443",
  storageBucket: "brenne-aerial-37443.firebasestorage.app",
  messagingSenderId: "476607554573",
  appId: "1:476607554573:web:6e26e3b37fdc285979a144",
  measurementId: "G-LG10V62WRJ"
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