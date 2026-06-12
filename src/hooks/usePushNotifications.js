import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getFirebaseMessaging } from '@/lib/firebase';

const VAPID_KEY = 'BChyCdgbq1OWnEXlqjxkldpt9GyJjASfBedE6TZmg2Ke2TOXYylprgxzhtKnEiZEhf6Wxd8ExVj1eXc2uDlIP-g';

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
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
      // Check if Firebase Messaging is actually supported in this browser
      getFirebaseMessaging().then(m => setIsSupported(!!m));
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
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') { setIsLoading(false); return false; }

      const fcm = await getFirebaseMessaging();
      if (!fcm) { setIsLoading(false); return false; }
      const { messaging, getToken, onMessage } = fcm;

      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      await new Promise((resolve) => {
        if (swReg.active && swReg.active.state === 'activated') { resolve(); return; }
        const sw = swReg.installing || swReg.waiting || swReg.active;
        const onStateChange = () => {
          if (sw.state === 'activated') { sw.removeEventListener('statechange', onStateChange); resolve(); }
        };
        if (sw) sw.addEventListener('statechange', onStateChange);
        else resolve();
      });

      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });

      const deviceName = `${navigator.platform || 'Appareil'} — ${getBrowserName()}`;
      await base44.functions.invoke('savePushSubscription', {
        subscription: { endpoint: token, type: 'fcm' },
        action: 'subscribe',
        device_name: deviceName,
      });

      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        if (Notification.permission === 'granted') {
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
        for (const sub of subs) await base44.entities.PushSubscription.delete(sub.id);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('[FCM] unsubscribe error:', err);
    }
    setIsLoading(false);
  };

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}