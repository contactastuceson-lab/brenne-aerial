importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeK6XlNs9eVEB5kVwh_Khyr9qyemUpaLw",
  authDomain: "brenne-aerial-37443.firebaseapp.com",
  projectId: "brenne-aerial-37443",
  storageBucket: "brenne-aerial-37443.firebasestorage.app",
  messagingSenderId: "476607554573",
  appId: "1:476607554573:web:6e26e3b37fdc285979a144",
});

const messaging = firebase.messaging();

// Notifications reçues quand l'app est en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Message reçu en arrière-plan:', payload);

  const { title, body, icon, click_action } = payload.notification || {};

  self.registration.showNotification(title || 'Brenne Aerial', {
    body: body || '',
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: { url: click_action || 'https://brenneaerial.fr' },
    vibrate: [200, 100, 200],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://brenneaerial.fr';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
