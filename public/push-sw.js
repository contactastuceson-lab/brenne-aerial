// Service Worker dédié aux notifications push (scope: /push/)
// Gère la réception des Web Push et le clic sur les notifications.
const ICON_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/53f8e6b37_1782606023373.png';

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'eza';
  const options = {
    body: data.body || '',
    icon: data.icon || ICON_URL,
    badge: data.badge || ICON_URL,
    tag: data.tag || undefined,
    renotify: !!data.tag,
    data: { url: data.url || '/', id: data.id || '' },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = (event.notification.data && event.notification.data.url) || '/';
  const fullUrl = path.startsWith('http') ? path : (self.location.origin + path);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(fullUrl);
    })
  );
});
