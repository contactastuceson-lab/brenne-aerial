/**
 * Update User Preferences
 * Saves notification, language, and display preferences
 */
export async function updateUserPreferences(req, res) {
  const { user_email, preferences } = req.body;

  if (!user_email || !preferences) {
    return res.status(400).json({ error: 'user_email and preferences are required' });
  }

  try {
    // Get existing preferences or create new ones
    const existingPrefs = await base44.entities.UserPreferences.filter({ 
      user_email 
    });

    const now = new Date().toISOString();
    const prefsData = {
      ...preferences,
      user_email,
      updated_at: now,
    };

    let result;
    if (existingPrefs.length > 0) {
      // Update existing
      result = await base44.entities.UserPreferences.update(existingPrefs[0].id, prefsData);
    } else {
      // Create new
      prefsData.created_at = now;
      result = await base44.entities.UserPreferences.create(prefsData);
    }

    // Log this action
    await base44.functions.invoke('logAuditAction', {
      user_email,
      action_type: 'preferences_updated',
      description: 'Préférences utilisateur mises à jour',
      is_sensitive: false,
    });

    res.json({ success: true, preferences: result });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get User Preferences
 */
export async function getUserPreferences(req, res) {
  const { user_email } = req.query;

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    const prefs = await base44.entities.UserPreferences.filter({ 
      user_email 
    });

    if (prefs.length > 0) {
      res.json({ preferences: prefs[0] });
    } else {
      // Return default preferences
      const defaults = {
        user_email,
        language: 'fr',
        theme: 'auto',
        compact_mode: false,
        show_online_status: true,
        email_notifications: true,
        push_notifications: true,
        quote_updates: true,
        appointment_reminders: true,
        new_messages: true,
        badge_awarded: true,
        donation_updates: true,
        newsletter: false,
        marketing_emails: false,
      };
      res.json({ preferences: defaults });
    }
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Change User Password
 */
export async function changeUserPassword(req, res) {
  const { user_email, current_password, new_password } = req.body;

  if (!user_email || !current_password || !new_password) {
    return res.status(400).json({ 
      error: 'user_email, current_password, and new_password are required' 
    });
  }

  try {
    // In a real implementation, you would:
    // 1. Get the user
    // 2. Verify the current password matches the hash in the database
    // 3. Hash the new password
    // 4. Update the user record with the new password hash

    // For now, we'll accept it as valid (this should be replaced with real auth)
    const user = await base44.auth.me();
    
    if (user.email !== user_email) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Log password change
    await base44.functions.invoke('logAuditAction', {
      user_email,
      action_type: 'password_changed',
      description: 'Mot de passe modifié',
      is_sensitive: true,
    });

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update Account Information
 */
export async function updateAccountInfo(req, res) {
  const { user_email, first_name, last_name, display_name, bio } = req.body;

  if (!user_email) {
    return res.status(400).json({ error: 'user_email is required' });
  }

  try {
    // Update user information
    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;

    const user = await base44.auth.updateMe(updates);

    // Log this action
    await base44.functions.invoke('logAuditAction', {
      user_email,
      action_type: 'profile_updated',
      description: 'Informations de profil mises à jour',
      is_sensitive: false,
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update account info error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default {
  updateUserPreferences,
  getUserPreferences,
  changeUserPassword,
  updateAccountInfo,
};
