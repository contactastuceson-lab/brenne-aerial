import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'ba_device_session_id';

export function useRegisterDevice(user) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user?.email || registeredRef.current) return;

    // If we already have a session ID stored for this browser tab, skip
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      registeredRef.current = true;
      return;
    }

    registeredRef.current = true;

    const ua = navigator.userAgent;

    let browser = 'Unknown';
    if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    let deviceType = 'desktop';
    if (ua.includes('Android') || ua.includes('iPhone')) deviceType = 'mobile';
    else if (ua.includes('iPad')) deviceType = 'tablet';

    base44.functions.invoke('createDeviceSession', {
      user_email: user.email,
      device_name: `${os} ${browser}`,
      device_type: deviceType,
      browser,
      os,
    }).then((res) => {
      const sessionId = res?.data?.session?.session_id;
      if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
    }).catch(() => {
      // Silently fail — non-critical feature
    });
  }, [user?.email]);
}

export default useRegisterDevice;