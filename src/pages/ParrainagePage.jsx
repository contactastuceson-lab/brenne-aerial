import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Users, Clock, Trophy, LogIn, Loader2, ArrowRight, CheckCircle2, Star, Zap, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STEPS = [
  {
    icon: Share2,
    num: '01',
    title: 'Vous recommandez',
    desc: 'Présentez-nous un ami, collègue ou client qui a besoin de services drone.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    icon: Zap,
    num: '02',
    title: 'La mission se réalise',
    desc: 'Votre filleul commande une prestation. Dès validation, vos crédits sont confirmés.',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    icon: Star,
    num: '03',
    title: 'Vous gagnez des crédits',
    desc: '30 minutes de vol offertes par parrainage validé, utilisables sur vos prochaines missions.',
    color: 'text-chart-5',
    bg: 'bg-chart-5/10 border-chart-5/20',
  },
];

const STATUS_CFG = {
  pending:   { label: 'En attente',     color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/30' },
  validated: { label: 'Validé',         color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
  rewarded:  { label: '+ Crédits ✓',   color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
};

export default function ParrainagePage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_parrainage_enabled');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState({ referred_name: '', referred_email: '', referred_phone: '', mission_description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
      setAuthChecked(true);
    });
  }, []);

  const { data: myReferrals = [], refetch } = useQuery({
    queryKey: ['my-referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Parrainage indisponible" message="Le programme de parrainage est temporairement désactivé." />;

  const totalCredits = myReferrals.filter(r => r.status === 'rewarded').reduce((a, r) => a + (r.credits_earned || 0), 0);
  const pendingCount = myReferrals.filter(r => r.status === 'pending').length;
  const rewardedCount = myReferrals.filter(r => r.status === 'rewarded').length;

  const handleSubmit = async () => {
    if (!form.referred_name || !form.referred_email) {
      toast.error('Nom et email du filleul requis');
      return;
    }
    setSubmitting(true);
    await base44.entities.Referral.create({
      referrer_email: user.email,
      referrer_name: user.full_name,
      ...form,
      credits_earned: 0,
      status: 'pending',
    });

    // Envoyer un email au filleul
    try {
      await base44.integrations.Core.SendEmail({
        to: form.referred_email,
        subject: `🚁 ${user.full_name} vous recommande Brenne Aerial`,
        body: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#060e1a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060e1a;padding:40px 16px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0c1a30;border:1px solid rgba(56,170,220,0.2);border-radius:16px;overflow:hidden;">
<tr><td style="height:3px;background:linear-gradient(90deg,#38aadc,#1dd8b4,#38aadc);"></td></tr>
<tr><td style="padding:40px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#38aadc;">BRENNE AERIAL</p>
  <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#e8edf5;">Vous avez été recommandé·e 🎉</h1>
  <p style="margin:0 0 20px;font-size:14px;color:#6a8aaa;line-height:1.7;">
    Bonjour <strong style="color:#a0c0d8;">${form.referred_name}</strong>,<br/>
    <strong style="color:#e8edf5;">${user.full_name}</strong> vous recommande les services de Brenne Aerial — spécialiste de la captation drone en France.
  </p>
  ${form.mission_description ? `<div style="background:rgba(56,170,220,0.06);border-left:3px solid #38aadc;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
    <p style="margin:0;font-size:13px;color:#c8d8e8;line-height:1.6;">"${form.mission_description}"</p>
  </div>` : ''}
  <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr><td style="border-radius:10px;background:linear-gradient(135deg,#1a6aaa,#38aadc);">
      <a href="https://brenneaerial.fr/quote" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;">Demander un devis gratuit →</a>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:16px 40px;border-top:1px solid rgba(56,170,220,0.1);text-align:center;">
  <p style="font-size:11px;color:#1e3050;margin:0;">Brenne Aerial · <a href="https://brenneaerial.fr" style="color:#38aadc;text-decoration:none;">brenneaerial.fr</a></p>
</td></tr>
</table></td></tr></table></body></html>`,
      });
    } catch (_) {}

    toast.success('Parrainage enregistré ! Un email a été envoyé à votre filleul 🎉');
    setForm({ referred_name: '', referred_email: '', referred_phone: '', mission_description: '' });
    setShowForm(false);
    refetch();
    setSubmitting(false);
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-28 px-5 overflow-hidden text-center">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Gift className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-xs text-primary tracking-widest uppercase">Programme Parrainage</span>
            </div>
            <h1 className="font-grotesk font-bold text-5xl sm:text-7xl leading-tight">
              Recommandez,<br /><span className="gradient-text">gagnez.</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Présentez Brenne Aerial à votre réseau. Chaque mission réalisée vous rapporte{' '}
              <strong className="text-foreground">30 minutes de vol offertes</strong>.
            </p>
            {authChecked && !user && (
              <Button onClick={() => base44.auth.redirectToLogin('/parrainage')} className="bg-primary text-primary-foreground gap-2 h-12 px-8 text-base font-semibold rounded-xl">
                <LogIn className="w-5 h-5" /> Commencer à parrainer
              </Button>
            )}
            {authChecked && user && (
              <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground gap-2 h-12 px-8 text-base font-semibold rounded-xl sky-glow">
                <Gift className="w-5 h-5" /> Parrainer quelqu'un
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-grotesk font-bold text-2xl mb-2">Comment ça marche ?</h2>
          <p className="font-inter text-sm text-muted-foreground">3 étapes simples pour gagner des crédits</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative p-7 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${step.bg}`}>
                  <Icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest">{step.num}</span>
                <h3 className="font-grotesk font-bold text-base mt-1 mb-2">{step.title}</h3>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="w-5 h-5 text-border" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Reward banner */}
      <section className="py-10 px-5 max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-8 text-center">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="font-grotesk font-bold text-2xl mb-2">30 min de vol offerts</h3>
            <p className="font-inter text-sm text-muted-foreground">par parrainage validé — cumulables sans limite</p>
          </div>
        </div>
      </section>

      {/* Dashboard utilisateur */}
      <div className="max-w-3xl mx-auto px-5 pb-28">
        {!authChecked ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-16 space-y-5 rounded-2xl bg-card border border-border p-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-grotesk font-bold text-xl">Connectez-vous pour commencer</h2>
            <p className="font-inter text-sm text-muted-foreground">Un compte est requis pour suivre vos filleuls et vos crédits.</p>
            <Button onClick={() => base44.auth.redirectToLogin('/parrainage')} className="bg-primary text-primary-foreground gap-2 h-10 px-6">
              <LogIn className="w-4 h-4" /> Se connecter
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: myReferrals.length, label: 'Parrainages', icon: Users, color: 'text-primary' },
                { val: pendingCount, label: 'En attente', icon: Clock, color: 'text-amber-400' },
                { val: `${totalCredits} min`, label: 'Crédits gagnés', icon: Trophy, color: 'text-chart-5' },
              ].map(({ val, label, icon: Icon, color }) => (
                <div key={label} className="p-5 rounded-2xl bg-card border border-border text-center hover:border-primary/30 transition-colors">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                  <p className={`font-grotesk font-bold text-2xl ${color}`}>{val}</p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA parrainer */}
            {!showForm && (
              <motion.button
                onClick={() => setShowForm(true)}
                className="w-full p-5 rounded-2xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all flex items-center justify-center gap-3 group"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              >
                <Gift className="w-5 h-5 text-primary" />
                <span className="font-grotesk font-semibold text-primary">Ajouter un nouveau parrainage</span>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            )}

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="p-6 rounded-2xl bg-card border border-primary/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" /> Nouveau parrainage
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Annuler</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Nom du filleul *</label>
                      <Input value={form.referred_name} onChange={e => setForm(p => ({ ...p, referred_name: e.target.value }))} placeholder="Marie Martin" className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Email du filleul *</label>
                      <Input type="email" value={form.referred_email} onChange={e => setForm(p => ({ ...p, referred_email: e.target.value }))} placeholder="marie@exemple.fr" className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Téléphone <span className="text-muted-foreground/50">(optionnel)</span></label>
                    <Input value={form.referred_phone} onChange={e => setForm(p => ({ ...p, referred_phone: e.target.value }))} placeholder="06 XX XX XX XX" className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Type de mission souhaitée <span className="text-muted-foreground/50">(optionnel)</span></label>
                    <Textarea value={form.mission_description} onChange={e => setForm(p => ({ ...p, mission_description: e.target.value }))}
                      placeholder="Ex: inspection toiture maison individuelle à Nantes…" className="bg-secondary border-border resize-none" rows={3} />
                  </div>
                  <div className="pt-1">
                    <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground gap-2 h-11 font-grotesk font-semibold rounded-xl sky-glow">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {submitting ? 'Envoi en cours…' : 'Envoyer le parrainage'}
                    </Button>
                    <p className="font-inter text-xs text-muted-foreground text-center mt-2">Un email d'invitation sera automatiquement envoyé à votre filleul.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            {myReferrals.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-grotesk font-semibold text-sm text-muted-foreground uppercase tracking-wider">Historique ({myReferrals.length})</h3>
                {myReferrals.map((r, i) => {
                  const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending;
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-border transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-grotesk font-bold text-sm text-primary">{r.referred_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-semibold truncate">{r.referred_name}</p>
                        <p className="font-mono text-xs text-muted-foreground truncate">{r.referred_email}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        {r.credits_earned > 0 && (
                          <span className="font-mono text-xs text-chart-5 font-bold bg-chart-5/10 border border-chart-5/20 px-2 py-0.5 rounded-full">+{r.credits_earned} min</span>
                        )}
                        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}