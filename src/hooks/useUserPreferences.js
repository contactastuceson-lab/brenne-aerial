import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to load and apply user preferences globally
 * Handles theme, language, and other display preferences
 */
export function useUserPreferences(user) {
  const { data: preferences = null, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      // Preferences loaded from localStorage, no backend call needed
      return null;
    },
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Apply theme preference
  useEffect(() => {
    if (!preferences?.theme) return;

    const applyTheme = (theme) => {
      const html = document.documentElement;
      if (theme === 'light') {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
      } else if (theme === 'dark') {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
      } else {
        // auto - use system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          html.classList.add('dark');
          html.style.colorScheme = 'dark';
        } else {
          html.classList.remove('dark');
          html.style.colorScheme = 'light';
        }
      }
      // Save to localStorage for persistence
      localStorage.setItem('theme-preference', theme);
    };

    applyTheme(preferences.theme);
  }, [preferences?.theme]);

  // Apply language preference
  useEffect(() => {
    if (!preferences?.language) return;

    // Save to localStorage for manual application by the app
    localStorage.setItem('user-language', preferences.language);
    // You can also apply via document.documentElement.lang if needed
    document.documentElement.lang = preferences.language;
  }, [preferences?.language]);

  // Apply compact mode preference
  useEffect(() => {
    if (preferences?.compact_mode !== undefined) {
      if (preferences.compact_mode) {
        document.documentElement.classList.add('compact-mode');
      } else {
        document.documentElement.classList.remove('compact-mode');
      }
      localStorage.setItem('compact-mode', preferences.compact_mode);
    }
  }, [preferences?.compact_mode]);

  return {
    preferences,
    isLoading,
    theme: preferences?.theme || 'auto',
    language: preferences?.language || 'fr',
    compactMode: preferences?.compact_mode || false,
  };
}

export default useUserPreferences;