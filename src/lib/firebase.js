import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (_) {
  // Browser doesn't support Firebase Messaging (Safari, old browsers, etc.)
}

export { messaging, getToken, onMessage };