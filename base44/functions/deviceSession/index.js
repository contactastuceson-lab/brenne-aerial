/**
 * Create or update device session
 * Called when user logs in to register their active device
 */
export async function createDeviceSession(req, res) {
  const { user_email, device_name, device_type, browser, os } = req.body;

  console.log('[createDeviceSession] Input:', { user_email, device_name, device_type });

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    // Get IP address
    const ip_address = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // Parse user agent for device info if not provided
    const user_agent = req.headers['user-agent'] || 'Unknown';
    
    console.log('[createDeviceSession] IP:', ip_address);

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
    const sessionId = Math.random().toString(36).substr(2, 9);

    console.log('[createDeviceSession] Detected:', { detectedBrowser, detectedOS, detectedDeviceType });

    // Try to get existing sessions
    let existingSessions = [];
    try {
      existingSessions = await base44.entities.DeviceSession.filter({
        user_email,
      });
      console.log('[createDeviceSession] Found existing sessions:', existingSessions.length);
    } catch (filterError) {
      console.warn('[createDeviceSession] Could not query existing sessions:', filterError);
    }

    let session;
    
    if (existingSessions.length > 0) {
      // Update existing session
      console.log('[createDeviceSession] Updating existing session...');
      try {
        session = await base44.entities.DeviceSession.update(existingSessions[0].id, {
          last_activity: now,
          is_current: true,
          device_name: finalDeviceName,
          browser: detectedBrowser,
          os: detectedOS,
          device_type: detectedDeviceType,
          ip_address,
        });
        console.log('[createDeviceSession] ✅ Updated:', session.id);
      } catch (updateError) {
        console.error('[createDeviceSession] Update failed:', updateError);
        // Create new one instead
        throw updateError;
      }
    } else {
      // Create new session
      console.log('[createDeviceSession] Creating new session...');
      const sessionData = {
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
      };

      console.log('[createDeviceSession] Creating with data:', sessionData);

      try {
        session = await base44.entities.DeviceSession.create(sessionData);
        console.log('[createDeviceSession] ✅ Created:', session.id);
      } catch (createError) {
        console.error('[createDeviceSession] Create failed:', createError);
        throw createError;
      }
    }

    // Mark all other sessions as not current (non-blocking)
    try {
      const otherSessions = await base44.entities.DeviceSession.filter({
        user_email,
      });

      for (const otherSession of otherSessions) {
        if (otherSession.id !== session.id) {
          await base44.entities.DeviceSession.update(otherSession.id, {
            is_current: false,
          });
        }
      }
      console.log('[createDeviceSession] Marked others as not current');
    } catch (error) {
      console.warn('[createDeviceSession] Could not update other sessions:', error);
      // Non-critical - continue anyway
    }

    res.json({
      success: true,
      session,
      message: 'Device session created/updated',
    });
  } catch (error) {
    console.error('[createDeviceSession] ❌ Final error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * List active device sessions
 */
export async function getDeviceSessions(req, res) {
  const { user_email } = req.query;

  console.log('[getDeviceSessions] Request for user:', user_email);

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    const sessions = await base44.entities.DeviceSession.filter({
      user_email,
    });

    console.log('[getDeviceSessions] ✅ Found sessions:', sessions.length);
    if (sessions.length > 0) {
      console.log('[getDeviceSessions] Session details:', sessions.map(s => ({
        id: s.id,
        device_name: s.device_name,
        is_current: s.is_current,
        created_at: s.created_at,
      })));
    }

    // Sort by last activity, current device first
    const sorted = sessions.sort((a, b) => {
      if (a.is_current) return -1;
      if (b.is_current) return 1;
      return new Date(b.last_activity) - new Date(a.last_activity);
    });

    res.json({ sessions: sorted });
  } catch (error) {
    console.error('[getDeviceSessions] ❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Disconnect device session
 */
export async function disconnectDevice(req, res) {
  const { user_email, session_id } = req.body;

  console.log('[disconnectDevice] Request:', { user_email, session_id });

  if (!user_email || !session_id) {
    return res.status(400).json({ error: 'user_email and session_id are required' });
  }

  try {
    // Find and delete the session
    console.log('[disconnectDevice] Searching for session...');
    const sessions = await base44.entities.DeviceSession.filter({
      user_email,
      session_id,
    });

    console.log('[disconnectDevice] Found sessions:', sessions.length);

    if (sessions.length === 0) {
      console.warn('[disconnectDevice] Session not found');
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionToDelete = sessions[0];
    console.log('[disconnectDevice] Deleting session:', sessionToDelete.device_name);

    await base44.entities.DeviceSession.delete(sessionToDelete.id);
    console.log('[disconnectDevice] ✅ Deleted');

    // Log this action (non-blocking)
    try {
      await base44.functions.invoke('logAuditAction', {
        user_email,
        action_type: 'device_disconnected',
        description: `Device disconnected: ${sessionToDelete.device_name}`,
        is_sensitive: true,
      });
      console.log('[disconnectDevice] ✅ Audit logged');
    } catch (auditError) {
      console.warn('[disconnectDevice] Could not log audit:', auditError);
    }

    res.json({
      success: true,
      message: `Device ${sessionToDelete.device_name} disconnected`,
    });
  } catch (error) {
    console.error('[disconnectDevice] ❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Disconnect all other devices
 */
export async function disconnectAllOtherDevices(req, res) {
  const { user_email } = req.body;

  console.log('[disconnectAllOtherDevices] Request for user:', user_email);

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    console.log('[disconnectAllOtherDevices] Fetching all non-current sessions...');
    const sessions = await base44.entities.DeviceSession.filter({
      user_email,
      is_current: false,
    });

    console.log('[disconnectAllOtherDevices] Found sessions to delete:', sessions.length);

    // Delete all non-current sessions
    let deletedCount = 0;
    for (const session of sessions) {
      try {
        await base44.entities.DeviceSession.delete(session.id);
        deletedCount++;
        console.log('[disconnectAllOtherDevices] ✅ Deleted:', session.device_name);
      } catch (deleteError) {
        console.error('[disconnectAllOtherDevices] Error deleting session:', deleteError);
      }
    }

    console.log('[disconnectAllOtherDevices] ✅ Deleted in total:', deletedCount);

    // Log this action (non-blocking)
    try {
      await base44.functions.invoke('logAuditAction', {
        user_email,
        action_type: 'all_other_devices_disconnected',
        description: `Disconnected ${deletedCount} other devices`,
        is_sensitive: true,
      });
      console.log('[disconnectAllOtherDevices] ✅ Audit logged');
    } catch (auditError) {
      console.warn('[disconnectAllOtherDevices] Could not log audit:', auditError);
    }

    res.json({
      success: true,
      message: `${deletedCount} devices disconnected`,
      count: deletedCount,
    });
  } catch (error) {
    console.error('[disconnectAllOtherDevices] ❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}
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
