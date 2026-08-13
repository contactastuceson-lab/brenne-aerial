import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle2, Sparkles, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EzaMailCard({ user, onProvisioned }) {
  const [loading, setLoading] = useState(false);
  const [localMail, setLocalMail] = useState(user?.eza_mail);

  // Verify on mount that the mailbox still exists on the mail side (catches retroactive deletions)
  useEffect(() => {
    const ezaMail = user?.eza_mail;
    if (!ezaMail) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke('provisionEzaMail', {});
        if (cancelled) return;
        const data = res?.data;
        if (data?.deleted) {
          setLocalMail(null);
          try { await base44.auth.updateMe({ eza_mail: '' }); } catch {}
        }
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [user?.eza_mail]);

  const provision = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('provisionEzaMail', {});
      const mail = res?.data?.eza_mail;
      if (mail) {
        try { await base44.auth.updateMe({ eza_mail: mail }); } catch {}
        window.location.href = `https://mail.ezagroup.fr/onboarding?address=${encodeURIComponent(mail)}`;
      } else {
        toast.error('Impossible de provisioning votre adresse EZA Mail');
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Erreur lors du provisioning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-4 md:p-5 mb-5"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(205 90% 58%) 0%, transparent 70%)' }} />
      <div className="relative flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(205 90% 58%) 0%, hsl(195 80% 50%) 100%)', boxShadow: '0 8px 24px hsl(205 90% 58% / 0.25)' }}>
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {localMail ? (
            <>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-green-400">Adresse officielle prête</p>
              </div>
              <p className="font-grotesk font-bold text-base md:text-lg text-foreground truncate mt-0.5">{localMail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Votre boîte EZA Mail est active — connexion unique (SSO).</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">EZA Mail officielle</p>
              </div>
              <p className="font-grotesk font-bold text-base text-foreground mt-0.5">Activez votre adresse @ezagroup.fr</p>
              <p className="text-xs text-muted-foreground mt-0.5">Générée automatiquement, connexion unique à tous les services EZA.</p>
            </>
          )}
        </div>
        {!localMail && (
          <button
            onClick={provision}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
            {loading ? 'Création...' : 'Activer'}
          </button>
        )}
      </div>
    </motion.div>
  );
}