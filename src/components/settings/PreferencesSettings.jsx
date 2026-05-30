import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const LANG_OPTIONS = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'de', label: '🇩🇪 Deutsch' },
];

function loadLocalPrefs() {
  return {
    language: localStorage.getItem('user-language') || 'fr',
    compact_mode: localStorage.getItem('compact-mode') === 'true',
    show_online_status: localStorage.getItem('show-online-status') !== 'false',
  };
}

function applyCompactMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('compact-mode');
  } else {
    document.documentElement.classList.remove('compact-mode');
  }
  localStorage.setItem('compact-mode', enabled);
}

function applyLanguage(lang) {
  localStorage.setItem('user-language', lang);
  document.documentElement.lang = lang;
  // Dispatch event so LanguageContext can react
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
}

export default function PreferencesSettings({ user }) {
  const [prefs, setPrefs] = useState(loadLocalPrefs);
  const [saving, setSaving] = useState(false);

  // Sync with user data from DB if available
  useEffect(() => {
    if (user?.preferences_language) {
      setPrefs(prev => ({ ...prev, language: user.preferences_language }));
    }
    if (user?.compact_mode !== undefined) {
      setPrefs(prev => ({ ...prev, compact_mode: user.compact_mode }));
    }
    if (user?.show_online_status !== undefined) {
      setPrefs(prev => ({ ...prev, show_online_status: user.show_online_status }));
    }
  }, [user?.preferences_language, user?.compact_mode, user?.show_online_status]);

  const handleChange = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Apply immediately
      applyLanguage(prefs.language);
      applyCompactMode(prefs.compact_mode);
      localStorage.setItem('show-online-status', prefs.show_online_status);

      // Persist to user profile
      await base44.auth.updateMe({
        preferences_language: prefs.language,
        compact_mode: prefs.compact_mode,
        show_online_status: prefs.show_online_status,
      });

      toast.success('Préférences sauvegardées');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Language */}
      <div className="rounded-2xl p-6" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Langue</h3>
        </div>
        <div className="space-y-2">
          {LANG_OPTIONS.map(lang => (
            <label
              key={lang.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                prefs.language === lang.value
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border/50 hover:border-border'
              }`}
            >
              <input
                type="radio"
                name="language"
                value={lang.value}
                checked={prefs.language === lang.value}
                onChange={e => handleChange('language', e.target.value)}
                className="w-4 h-4 accent-primary"
              />
              <span className="font-inter text-sm ml-3">{lang.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Display */}
      <div className="rounded-2xl p-6" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Affichage</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'compact_mode', label: 'Mode compact', desc: 'Interface plus compacte' },
            { key: 'show_online_status', label: 'Afficher le statut en ligne', desc: 'Les autres voient si vous êtes actif' },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors cursor-pointer"
              onClick={() => handleChange(key, !prefs[key])}
            >
              <div>
                <p className="font-inter text-sm font-medium">{label}</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${prefs[key] ? 'bg-primary' : 'bg-secondary'}`}>
                <motion.div
                  layout
                  className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow"
                  animate={{ x: prefs[key] ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <Button onClick={saveChanges} disabled={saving} className="w-full gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
        Sauvegarder les préférences
      </Button>
    </motion.div>
  );
}