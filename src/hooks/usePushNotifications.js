import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const VAPID_PUBLIC_KEY = 'BChyCdgbq1OWnEXlqjxkldpt9GyJjASfBedE6TZmg2Ke2TOXYylprgxzhtKnEiZEhf6Wxd8ExVj1eXc2uDlIP-g';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) arr[i] = rawData.charCodeAt(i);
  return arr;
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
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setIsSupported(false);
    }
    // setIsSupported after a tick so Firebase-less check still works
    setIsSupported(supported);
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
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') { setIsLoading(false); return false; }

      // Service Worker dédié aux push (scope /push/ pour ne pas écraser le SW Workbox)
      const reg = await navigator.serviceWorker.register('/push-sw.js', { scope: '/push/' });
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

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
      console.error('[WebPush] subscribe error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/push-sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      const user = await base44.auth.me();
      if (user) {
        const subs = await base44.entities.PushSubscription.filter({ user_email: user.email });
        for (const s of subs) await base44.entities.PushSubscription.delete(s.id);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('[WebPush] unsubscribe error:', err);
    }
    setIsLoading(false);
  };

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}