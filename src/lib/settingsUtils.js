import { base44 } from '@/api/base44Client';

/**
 * Safely invoke a Base44 function with automatic error handling
 */
export async function invokeSafeFunction(functionName, params = {}) {
  try {
    const result = await base44.functions.invoke(functionName, params);
    if (!result) {
      throw new Error(`No response from ${functionName}`);
    }
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error(`Error invoking ${functionName}:`, error);
    return {
      success: false,
      data: null,
      error: error.message || `Failed to invoke ${functionName}`,
    };
  }
}

/**
 * Get user preferences with fallback to defaults
 */
export async function getUserPreferencesGracefully(userEmail) {
  if (!userEmail) {
    return getDefaultPreferences();
  }

  const result = await invokeSafeFunction('getUserPreferences', {
    user_email: userEmail,
  });

  if (result.success && result.data?.preferences) {
    return result.data.preferences;
  }

  // Fallback to defaults on error
  console.warn('Failed to load preferences, using defaults');
  return { ...getDefaultPreferences(), user_email: userEmail };
}

/**
 * Get default user preferences
 */
export function getDefaultPreferences() {
  return {
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
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(userEmail, preferences) {
  return invokeSafeFunction('updateUserPreferences', {
    user_email: userEmail,
    preferences: preferences,
  });
}

/**
 * Change user password (requires current password)
 */
export async function changePassword(userEmail, currentPassword, newPassword) {
  return invokeSafeFunction('changeUserPassword', {
    user_email: userEmail,
    current_password: currentPassword,
    new_password: newPassword,
  });
}

/**
 * Update account information
 */
export async function updateAccountInfo(userEmail, updates) {
  return invokeSafeFunction('updateAccountInfo', {
    user_email: userEmail,
    ...updates,
  });
}

/**
 * Log an audit action
 */
export async function logAuditAction(userEmail, actionType, description, isSensitive = false) {
  return invokeSafeFunction('logAuditAction', {
    user_email: userEmail,
    action_type: actionType,
    description: description,
    is_sensitive: isSensitive,
  }).catch(err => {
    // Don't throw audit log errors - just log them
    console.error('Audit logging failed:', err);
    return { success: false };
  });
}
