import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to create/register a device session when user logs in
 * Should be called once after user authentication
 */
export function useRegisterDevice(user) {
  useEffect(() => {
    if (!user?.email) return;

    // Register device on mount (after user logs in)
    registerDevice(user.email);
  }, [user?.email]);
}

/**
 * Create or update device session for current device
 */
export async function registerDevice(userEmail) {
  if (!userEmail) return;

  try {
    // Extract device info from user-agent
    const userAgent = navigator.userAgent;
    
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

    // Create device session
    const result = await base44.functions.invoke('createDeviceSession', {
      user_email: userEmail,
      device_name: `${os} ${browser}`,
      device_type: deviceType,
      browser,
      os,
    });

    console.log('Device registered:', result);
    return result;
  } catch (error) {
    console.error('Failed to register device:', error);
    // Don't throw - this is non-critical
  }
}

export default useRegisterDevice;
