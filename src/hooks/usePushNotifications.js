import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const VAPID_PUBLIC_KEY = 'BLi1I-uHAqIFmwF3u6eR50tTwm9q4v3-iMLtCeHzCEcd2i5g2ZZtc4ZArsib7XHOhogyc16QPcLi5opFS548Gqo';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

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
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (_) {}
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setIsLoading(false);
        return false;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const deviceName = `${navigator.platform || 'Appareil'} — ${getBrowserName()}`;
      await base44.functions.invoke('savePushSubscription', {
        subscription: sub.toJSON(),
        action: 'subscribe',
        device_name: deviceName,
      });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await base44.functions.invoke('savePushSubscription', {
            subscription: sub.toJSON(),
            action: 'unsubscribe',
          });
          await sub.unsubscribe();
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    }
    setIsLoading(false);
  };

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}