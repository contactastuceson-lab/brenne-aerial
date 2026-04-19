/**
 * Log audit action - called when sensitive actions occur
 */
export async function logAuditAction(req, res) {
  const { 
    user_email, 
    action_type, 
    description, 
    resource_type, 
    resource_id,
    is_sensitive 
  } = req.body;
  
  try {
    // Get client IP
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'] || 'Unknown';
    
    // Create audit log
    await base44.entities.AuditLog.create({
      user_email,
      action_type,
      description,
      resource_type: resource_type || null,
      resource_id: resource_id || null,
      ip_address,
      user_agent,
      timestamp: new Date().toISOString(),
      is_sensitive: is_sensitive || false,
      status: 'success',
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Middleware to automatically log sensitive actions
 * Call this from other functions
 */
export async function auditLog(user_email, action_type, description, isService = false) {
  try {
    await base44.entities.AuditLog.create({
      user_email,
      action_type,
      description,
      timestamp: new Date().toISOString(),
      is_sensitive: [
        'password_change',
        '2fa_enabled',
        '2fa_disabled',
        'data_export',
        'data_deleted',
        'user_deleted',
        'permission_changed',
        'role_changed',
        'suspension',
        'ban',
      ].includes(action_type),
      status: 'success',
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}
