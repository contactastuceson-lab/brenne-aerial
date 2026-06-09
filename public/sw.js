self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Brenne Aerial', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(url) && 'focus' in client) return client.focus();
        }
        return clients.openWindow(url);
      })
  );
});
