import { useEffect } from 'react';
import { awardDailyLogin } from '@/lib/rewardActions';

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'light') {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
  } else if (theme === 'dark') {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else {
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

function applyCompactMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('compact-mode');
  } else {
    document.documentElement.classList.remove('compact-mode');
  }
}

export function PreferencesApplier({ user }) {
  // Apply theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference') || 'auto';
    applyTheme(savedTheme);
  }, []);

  // Apply compact mode from localStorage on mount
  useEffect(() => {
    const compact = localStorage.getItem('compact-mode') === 'true';
    applyCompactMode(compact);
  }, []);

  // When user loads, apply their saved preferences from profile
  useEffect(() => {
    if (!user) return;
    if (user.compact_mode !== undefined) {
      applyCompactMode(user.compact_mode);
      localStorage.setItem('compact-mode', user.compact_mode);
    }
    if (user.preferences_language) {
      localStorage.setItem('user-language', user.preferences_language);
      document.documentElement.lang = user.preferences_language;
      window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: user.preferences_language } }));
    }
  }, [user?.id]);

  // Bonus de connexion quotidienne — déclenché une fois au chargement de l'utilisateur
  useEffect(() => {
    if (user?.id) awardDailyLogin();
  }, [user?.id]);

  return null;
}

export default PreferencesApplier;