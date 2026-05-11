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
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  // Order matters: Android must be checked before Linux
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  // Detect device type based on UA
  let deviceType = 'desktop';
  if (/Android.*Mobile|iPhone|iPod/.test(ua)) deviceType = 'mobile';
  else if (/iPad|Android(?!.*Mobile)/.test(ua)) deviceType = 'tablet';

  return { browser, os, deviceType, device_name: `${os} ${browser}` };
}

// Module-level flag so it only runs ONCE per page load, across all re-renders
let hasRegistered = false;

export function useRegisterDevice(user) {
  const emailRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;
    // Only register once per user per page load
    if (hasRegistered && emailRef.current === user.email) return;

    hasRegistered = true;
    emailRef.current = user.email;

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
      const session = res?.data?.session;
      const sessionId = session?.session_id || session?.id;
      if (sessionId) {
        sessionStorage.setItem(SESSION_KEY, sessionId);
      }
    }).catch(() => {
      // Silently fail — non-critical
    });
  }, [user?.email]);
}

export default useRegisterDevice;