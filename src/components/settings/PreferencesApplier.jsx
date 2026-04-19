import React, { useEffect } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

/**
 * Component that applies user preferences on mount
 * Should be placed inside AuthProvider to have access to user
 */
export function PreferencesApplier({ user }) {
  const { preferences, isLoading } = useUserPreferences(user);

  useEffect(() => {
    if (isLoading || !preferences) return;

    // Apply all preferences globally
    applyAllPreferences(preferences);
  }, [preferences, isLoading]);

  return null; // This component doesn't render anything
}

/**
 * Apply all user preferences to the DOM and localStorage
 */
function applyAllPreferences(preferences) {
  if (!preferences) return;

  // Apply theme
  applyTheme(preferences.theme);

  // Apply language
  if (preferences.language) {
    localStorage.setItem('user-language', preferences.language);
    document.documentElement.lang = preferences.language;
  }

  // Apply compact mode
  if (preferences.compact_mode) {
    document.documentElement.classList.add('compact-mode');
  } else {
    document.documentElement.classList.remove('compact-mode');
  }

  // Store notification preferences in context/state if needed
  localStorage.setItem('notification-prefs', JSON.stringify({
    email_notifications: preferences.email_notifications,
    push_notifications: preferences.push_notifications,
    quote_updates: preferences.quote_updates,
    appointment_reminders: preferences.appointment_reminders,
    new_messages: preferences.new_messages,
    badge_awarded: preferences.badge_awarded,
    donation_updates: preferences.donation_updates,
    newsletter: preferences.newsletter,
    marketing_emails: preferences.marketing_emails,
  }));
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  const html = document.documentElement;
  
  if (theme === 'light') {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
  } else if (theme === 'dark') {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else if (theme === 'auto') {
    // Use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }

  localStorage.setItem('theme-preference', theme);
}

export default PreferencesApplier;
