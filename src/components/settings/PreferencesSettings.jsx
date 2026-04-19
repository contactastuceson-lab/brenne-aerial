import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Eye, Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function PreferencesSettings({ user }) {
  const queryClient = useQueryClient();
  
  // Fetch user preferences
  const { data: fetchedPrefs = null } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      const result = await base44.functions.invoke('getUserPreferences', {
        user_email: user.email,
      });
      return result.preferences || null;
    },
    enabled: !!user?.email,
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    theme: 'auto',
    compact_mode: false,
    show_online_status: true,
  });

  // Load fetched preferences
  useEffect(() => {
    if (fetchedPrefs) {
      setPreferences({
        language: fetchedPrefs.language || 'fr',
        theme: fetchedPrefs.theme || 'auto',
        compact_mode: fetchedPrefs.compact_mode || false,
        show_online_status: fetchedPrefs.show_online_status !== undefined ? fetchedPrefs.show_online_status : true,
      });
    }
  }, [fetchedPrefs]);

  const saveMutation = useMutation({
    mutationFn: async (newPrefs) => {
      // Save preferences to database
      const result = await base44.functions.invoke('updateUserPreferences', {
        user_email: user.email,
        preferences: newPrefs,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success('Préférences sauvegardées');
      // Apply theme change immediately
      applyTheme(preferences.theme);
    },
    onError: (error) => {
      console.error('Error saving preferences:', error);
      toast.error('Erreur lors de la sauvegarde');
    },
  });

  // Apply theme to document
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
  };

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = () => {
    saveMutation.mutate(preferences);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Langue</h3>
        </div>

        <div className="space-y-2">
          {[
            { value: 'fr', label: '🇫🇷 Français' },
            { value: 'en', label: '🇬🇧 English' },
            { value: 'es', label: '🇪🇸 Español' },
            { value: 'de', label: '🇩🇪 Deutsch' },
          ].map(lang => (
            <label
              key={lang.value}
              className="flex items-center p-3 rounded-lg border border-border/50 hover:border-border cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="language"
                value={lang.value}
                checked={preferences.language === lang.value}
                onChange={e => handleChange('language', e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-inter text-sm ml-3">{lang.label}</span>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Thème</h3>
        </div>

        <div className="space-y-2">
          {[
            { value: 'auto', label: '🌗 Automatique', desc: 'Suit vos préférences système' },
            { value: 'light', label: '☀️ Clair', desc: 'Toujours en thème clair' },
            { value: 'dark', label: '🌙 Sombre', desc: 'Toujours en thème sombre' },
          ].map(theme => (
            <label
              key={theme.value}
              className="flex items-start p-3 rounded-lg border border-border/50 hover:border-border cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="theme"
                value={theme.value}
                checked={preferences.theme === theme.value}
                onChange={e => handleChange('theme', e.target.value)}
                className="w-4 h-4 mt-1"
              />
              <div className="flex-1 ml-3">
                <p className="font-inter text-sm font-medium">{theme.label}</p>
                <p className="font-inter text-xs text-muted-foreground">{theme.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Affichage</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
            <div className="flex-1">
              <p className="font-inter text-sm font-medium">Mode compact</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Interface plus compacte</p>
            </div>
            <button
              onClick={() => handleChange('compact_mode', !preferences.compact_mode)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                preferences.compact_mode ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                animate={{ x: preferences.compact_mode ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
            <div className="flex-1">
              <p className="font-inter text-sm font-medium">Afficher le statut en ligne</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Les autres voient si vous êtes actif</p>
            </div>
            <button
              onClick={() => handleChange('show_online_status', !preferences.show_online_status)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                preferences.show_online_status ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                animate={{ x: preferences.show_online_status ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <Button
        onClick={saveChanges}
        disabled={saveMutation.isPending}
        className="w-full gap-2"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Settings className="w-4 h-4" />
            Sauvegarder les préférences
          </>
        )}
      </Button>
    </motion.div>
  );
}
