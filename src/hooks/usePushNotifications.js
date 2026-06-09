import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { messaging, getToken, onMessage } from '@/lib/firebase';

const VAPID_KEY = 'BLi1I-uHAqIFmwF3u6eR50tTwm9q4v3-iMLtCeHzCEcd2i5g2ZZtc4ZArsib7XHOhogyc16QPcLi5opFS548Gqo';

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Navigateur';
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    console.log('[FCM] Support check — Notification:', 'Notification' in window, '| SW:', 'serviceWorker' in navigator);
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;
      const subs = await base44.entities.PushSubscription.filter({ user_email: user.email });
      setIsSubscribed(subs.length > 0);
    } catch (_) {}
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      console.log('[FCM] Requesting permission...');
      const perm = await Notification.requestPermission();
      setPermission(perm);
      console.log('[FCM] Permission:', perm);
      if (perm !== 'granted') {
        setIsLoading(false);
        return false;
      }

      console.log('[FCM] Registering service worker...');
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
      console.log('[FCM] SW ready, getting FCM token...');

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('[FCM] Token obtained:', token?.substring(0, 20) + '...');

      const deviceName = `${navigator.platform || 'Appareil'} — ${getBrowserName()}`;
      await base44.functions.invoke('savePushSubscription', {
        subscription: { endpoint: token, type: 'fcm' },
        action: 'subscribe',
        device_name: deviceName,
      });

      // Listen to foreground messages
      onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message:', payload);
        const { title, body } = payload.notification || {};
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title || 'Brenne Aerial', { body, icon: '/icon-192.png' });
        }
      });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('[FCM] subscribe error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      if (user) {
        const subs = await base44.entities.PushSubscription.filter({ user_email: user.email });
        for (const sub of subs) {
          await base44.entities.PushSubscription.delete(sub.id);
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('[FCM] unsubscribe error:', err);
    }
    setIsLoading(false);
  };

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}