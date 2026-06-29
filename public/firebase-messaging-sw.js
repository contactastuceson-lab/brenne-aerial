importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCVF8bvM1rRtNiLqVNWBAhz3mg7k3xHskU",
  authDomain: "brenne-aerial-92df2.firebaseapp.com",
  projectId: "brenne-aerial-92df2",
  storageBucket: "brenne-aerial-92df2.firebasestorage.app",
  messagingSenderId: "1089927039041",
  appId: "1:1089927039041:web:ee4d69b56fd8280268dec0",
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
