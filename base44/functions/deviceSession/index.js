/**
 * Create or update device session
 * Called when user logs in to register their active device
 */
export async function createDeviceSession(req, res) {
  const { user_email, device_name, device_type, browser, os } = req.body;

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    // Get IP address
    const ip_address = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Parse user agent for device info if not provided
    const user_agent = req.headers['user-agent'] || 'Unknown';
    
    // Detect device info from user-agent if not provided
    let detectedBrowser = browser || 'Unknown';
    let detectedOS = os || 'Unknown';
    let detectedDeviceType = device_type || 'desktop';

    if (!browser && user_agent) {
      // Simple user-agent parsing
      if (user_agent.includes('Chrome')) detectedBrowser = 'Chrome';
      else if (user_agent.includes('Firefox')) detectedBrowser = 'Firefox';
      else if (user_agent.includes('Safari')) detectedBrowser = 'Safari';
      else if (user_agent.includes('Edge')) detectedBrowser = 'Edge';

      if (user_agent.includes('Windows')) detectedOS = 'Windows';
      else if (user_agent.includes('Mac')) detectedOS = 'macOS';
      else if (user_agent.includes('Linux')) detectedOS = 'Linux';
      else if (user_agent.includes('Android')) {
        detectedOS = 'Android';
        detectedDeviceType = 'mobile';
      }
      else if (user_agent.includes('iPhone') || user_agent.includes('iPad')) {
        detectedOS = 'iOS';
        detectedDeviceType = user_agent.includes('iPad') ? 'tablet' : 'mobile';
      }
    }

    const finalDeviceName = device_name || `${detectedOS} ${detectedBrowser}`;
    const now = new Date().toISOString();

    // Check if session already exists for this device
    const existingSessions = await base44.entities.DeviceSession.filter({
      user_email,
      ip_address,
      browser: detectedBrowser,
    });

    let session;
    if (existingSessions.length > 0) {
      // Update existing session
      session = await base44.entities.DeviceSession.update(existingSessions[0].id, {
        last_activity: now,
        is_current: true,
      });
    } else {
      // Create new session
      const sessionId = Math.random().toString(36).substr(2, 9);
      
      session = await base44.entities.DeviceSession.create({
        session_id: sessionId,
        user_email,
        device_name: finalDeviceName,
        device_type: detectedDeviceType,
        browser: detectedBrowser,
        os: detectedOS,
        ip_address,
        user_agent,
        created_at: now,
        last_activity: now,
        is_current: true,
        is_trusted: false,
      });
    }

    // Mark all other sessions as not current
    const otherSessions = await base44.entities.DeviceSession.filter({
      user_email,
      session_id: { $ne: session.session_id },
    });

    for (const otherSession of otherSessions) {
      await base44.entities.DeviceSession.update(otherSession.id, {
        is_current: false,
      });
    }

    res.json({
      success: true,
      session,
      message: 'Device session created/updated',
    });
  } catch (error) {
    console.error('Create device session error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * List active device sessions
 */
export async function getDeviceSessions(req, res) {
  const { user_email } = req.query;

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    const sessions = await base44.entities.DeviceSession.filter({
      user_email,
    });

    // Sort by last activity, current device first
    const sorted = sessions.sort((a, b) => {
      if (a.is_current) return -1;
      if (b.is_current) return 1;
      return new Date(b.last_activity) - new Date(a.last_activity);
    });

    res.json({ sessions: sorted });
  } catch (error) {
    console.error('Get device sessions error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Disconnect device session
 */
export async function disconnectDevice(req, res) {
  const { user_email, session_id } = req.body;

  if (!user_email || !session_id) {
    return res.status(400).json({ error: 'user_email and session_id are required' });
  }

  try {
    // Find and delete the session
    const sessions = await base44.entities.DeviceSession.filter({
      user_email,
      session_id,
    });

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionToDelete = sessions[0];
    await base44.entities.DeviceSession.delete(sessionToDelete.id);

    // Log this action
    await base44.functions.invoke('logAuditAction', {
      user_email,
      action_type: 'device_disconnected',
      description: `Device disconnected: ${sessionToDelete.device_name}`,
      is_sensitive: true,
    });

    res.json({
      success: true,
      message: `Device ${sessionToDelete.device_name} disconnected`,
    });
  } catch (error) {
    console.error('Disconnect device error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Disconnect all other devices
 */
export async function disconnectAllOtherDevices(req, res) {
  const { user_email } = req.body;

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    const sessions = await base44.entities.DeviceSession.filter({
      user_email,
      is_current: false,
    });

    // Delete all non-current sessions
    for (const session of sessions) {
      await base44.entities.DeviceSession.delete(session.id);
    }

    // Log this action
    await base44.functions.invoke('logAuditAction', {
      user_email,
      action_type: 'all_other_devices_disconnected',
      description: `Disconnected ${sessions.length} other devices`,
      is_sensitive: true,
    });

    res.json({
      success: true,
      message: `${sessions.length} devices disconnected`,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Disconnect all devices error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default {
  createDeviceSession,
  getDeviceSessions,
  disconnectDevice,
  disconnectAllOtherDevices,
};
