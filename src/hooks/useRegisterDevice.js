import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to create/register a device session when user logs in
 * Should be called once after user authentication
 */
export function useRegisterDevice(user) {
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    if (!user?.email) {
      hasRegisteredRef.current = false;
      return;
    }

    // Only register once per user session
    if (hasRegisteredRef.current && localStorage.getItem(`device_registered_${user.email}`) === 'true') {
      return;
    }

    // Register device on mount (after user logs in)
    console.log('[Device Registration] Starting for user:', user.email);
    registerDevice(user.email).then(() => {
      hasRegisteredRef.current = true;
      localStorage.setItem(`device_registered_${user.email}`, 'true');
      console.log('[Device Registration] ✅ Success');
    }).catch((err) => {
      console.error('[Device Registration] ❌ Failed:', err);
    });
  }, [user?.email]);
}

/**
 * Create or update device session for current device
 */
export async function registerDevice(userEmail) {
  if (!userEmail) {
    console.warn('[registerDevice] No user email provided');
    return;
  }

  try {
    // Extract device info from user-agent
    const userAgent = navigator.userAgent;
    console.log('[registerDevice] User-Agent:', userAgent);
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    // Detect device type
    let deviceType = 'desktop';
    if (userAgent.includes('Android')) deviceType = 'mobile';
    else if (userAgent.includes('iPhone')) deviceType = 'mobile';
    else if (userAgent.includes('iPad')) deviceType = 'tablet';

    console.log('[registerDevice] Detected:', { browser, os, deviceType });

    // Create device session
    console.log('[registerDevice] Calling createDeviceSession...');
    const result = await base44.functions.invoke('createDeviceSession', {
      user_email: userEmail,
      device_name: `${os} ${browser}`,
      device_type: deviceType,
      browser,
      os,
    });

    console.log('[registerDevice] ✅ Device registered:', result);
    return result;
  } catch (error) {
    console.error('[registerDevice] ❌ Error:', error);
    // Try with fallback entity creation
    return await createDeviceSessionFallback(userEmail);
  }
}

/**
 * Fallback: Create device session directly via entity
 */
async function createDeviceSessionFallback(userEmail) {
  try {
    console.log('[Fallback] Creating device session directly via entity...');
    const userAgent = navigator.userAgent;
    
    // Detect info
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';

    const session = await base44.entities.DeviceSession.create({
      session_id: Math.random().toString(36).substr(2, 9),
      user_email: userEmail,
      device_name: `${os} ${browser}`,
      device_type: 'desktop',
      browser: browser,
      os: os,
      ip_address: 'unknown',
      user_agent: userAgent,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      is_current: true,
      is_trusted: false,
    });

    console.log('[Fallback] ✅ Device created via entity:', session);
    return session;
  } catch (fallbackError) {
    console.error('[Fallback] ❌ Also failed:', fallbackError);
    throw fallbackError;
  }
}

export default useRegisterDevice;
