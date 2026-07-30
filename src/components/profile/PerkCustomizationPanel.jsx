import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Sparkles, Bell, Shield, Camera, BellRing, Save, Loader2,
  TrendingUp, CalendarClock, Lock,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  getCustomization, isPerkActive, ACCENT_PRESETS, NOTIF_SOUNDS, playNotifSound,
} from '@/lib/perkCustomization';

export default function PerkCustomizationPanel({ user, onSaved }) {
  const perks = user?.perks || {};
  const cust = getCustomization(perks);
  const [draft, setDraft] = useState(cust);
  const [saving, setSaving] = useState(false);

  const has = (k) => isPerkActive(perks, k);
  const hasColors = has('custom_colors');
  const hasBadge = has('custom_animated_badge');
  const hasSound = has('custom_notif_sound');
  const hasParticles = has('particle_effects');
  const hasWatermark = has('custom_watermark');
  const hasStorage = has('storage_until');
  const hasScheduled = has('scheduled_posts_until');
  const hasAnalytics = has('analytics_until');

  const anyEditable = hasColors || hasBadge || hasSound || hasParticles || hasWatermark;
  const anyInfo = hasStorage || hasScheduled || hasAnalytics;

  if (!anyEditable && !anyInfo) return null;

  const update = (patch) => setDraft(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const merged = { ...perks, customization: { ...perks.customization, ...draft } };
      await base44.auth.updateMe({ perks: merged });
      toast.success('Personnalisation enregistrée');
      onSaved?.();
    } catch (e) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(cust);

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-cyan-400" />
        <h3 className="font-grotesk font-bold text-sm text-cyan-400">Personnalisation de vos avantages</h3>
      </div>

      <div className="space-y-5">
        {/* Couleur d'accent */}
        {hasColors && (
          <div>
            <p className="font-inter text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" /> Couleur d'accent du profil
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {ACCENT_PRESETS.map(c => (
                <button key={c} onClick={() => update({ accentColor: c })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${draft.accentColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ background: c, boxShadow: draft.accentColor === c ? `0 0 12px ${c}` : 'none' }}
                  aria-label={c} />
              ))}
              <input type="color" value={draft.accentColor || '#22d3ee'}
                onChange={e => update({ accentColor: e.target.value })}
                className="w-8 h-8 rounded-full bg-transparent border border-border cursor-pointer" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Appliquée à votre avatar et au contour de votre profil public.
            </p>
          </div>
        )}

        {/* Badge animé personnalisé */}
        {hasBadge && (
          <div>
            <p className="font-inter text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Texte du badge animé
            </p>
            <input
              type="text"
              value={draft.badgeText || ''}
              onChange={e => update({ badgeText: e.target.value.slice(0, 24) })}
              placeholder="ex: Créateur·trice, Fondateur, Maker…"
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-400/50"
            />
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Affiché sous votre nom avec une animation dégradé. Max 24 caractères.
            </p>
          </div>
        )}

        {/* Son de notification */}
        {hasSound && (
          <div>
            <p className="font-inter text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyan-400" /> Son de notification
            </p>
            <div className="flex flex-wrap gap-2">
              {NOTIF_SOUNDS.map(s => (
                <button key={s.id}
                  onClick={() => { update({ notifSound: s.id }); playNotifSound(s.pattern); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    (draft.notifSound || 'default') === s.id
                      ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
                      : 'border-border text-muted-foreground hover:bg-secondary/40'
                  }`}>
                  <BellRing className="w-3 h-3" /> {s.label}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Joué à chaque nouvelle notification. Cliquez pour écouter.
            </p>
          </div>
        )}

        {/* Couleur des particules */}
        {hasParticles && (
          <div>
            <p className="font-inter text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Couleur des particules de profil
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {ACCENT_PRESETS.slice(0, 8).map(c => (
                <button key={c} onClick={() => update({ particleColor: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${draft.particleColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ background: c }} aria-label={c} />
              ))}
              <input type="color" value={draft.particleColor || '#22d3ee'}
                onChange={e => update({ particleColor: e.target.value })}
                className="w-7 h-7 rounded-full bg-transparent border border-border cursor-pointer" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Particules flottantes animées autour de votre avatar sur votre profil public.
            </p>
          </div>
        )}

        {/* Watermark */}
        {hasWatermark && (
          <div>
            <p className="font-inter text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Texte du watermark
            </p>
            <input
              type="text"
              value={draft.watermarkText || ''}
              onChange={e => update({ watermarkText: e.target.value.slice(0, 40) })}
              placeholder="ex: @monusername · eza.group"
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-400/50"
            />
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Incrusté automatiquement sur vos images lors de l'upload. Max 40 caractères.
            </p>
          </div>
        )}

        {/* Infos (perks actifs non éditables) */}
        {anyInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/40">
            {hasAnalytics && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-inter text-[11px] text-foreground">Analytics avancées actives</span>
              </div>
            )}
            {hasScheduled && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                <CalendarClock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-inter text-[11px] text-foreground">Posts programmés illimités</span>
              </div>
            )}
            {hasStorage && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                <Camera className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-inter text-[11px] text-foreground">Stockage étendu (8 médias/post)</span>
              </div>
            )}
          </div>
        )}

        {/* Save */}
        {anyEditable && (
          <div className="flex items-center justify-between pt-1">
            <p className="font-mono text-[10px] text-muted-foreground/50">
              {dirty ? 'Modifications non enregistrées' : 'À jour'}
            </p>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-grotesk font-bold text-xs hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
          </div>
        )}

        {/* Locked hint */}
        {!anyEditable && anyInfo && (
          <p className="font-mono text-[10px] text-muted-foreground/50 pt-1">
            <Lock className="w-3 h-3 inline mr-1" />
            D'autres options de personnalisation sont débloquables dans la boutique.
          </p>
        )}
      </div>
    </div>
  );
}