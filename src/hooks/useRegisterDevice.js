import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const FINGERPRINT_KEY = 'ba_device_fingerprint';
const SESSION_KEY = 'ba_device_session_id';

function getOrCreateFingerprint() {
  let fp = localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(FINGERPRINT_KEY, fp);
  }
  return fp;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  let deviceType = 'desktop';
  if (ua.includes('Android') || ua.includes('iPhone')) deviceType = 'mobile';
  else if (ua.includes('iPad')) deviceType = 'tablet';

  return { browser, os, deviceType, device_name: `${os} ${browser}` };
}

export function useRegisterDevice(user) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user?.email || registeredRef.current) return;
    registeredRef.current = true;

    const fingerprint = getOrCreateFingerprint();
    const { browser, os, deviceType, device_name } = getDeviceInfo();

    base44.functions.invoke('createDeviceSession', {
      user_email: user.email,
      device_name,
      device_type: deviceType,
      browser,
      os,
      fingerprint,
    }).then((res) => {
      const sessionId = res?.data?.session?.session_id;
      if (sessionId) {
        sessionStorage.setItem(SESSION_KEY, sessionId);
      }
    }).catch(() => {
      // Silently fail — non-critical
    });
  }, [user?.email]);
}

export default useRegisterDevice;