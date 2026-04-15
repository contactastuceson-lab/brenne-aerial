import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, CheckCircle, ArrowRight, Star, Clock, LogIn, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const HOW_IT_WORKS = [
  { step: '01', title: 'Vous parrainez', desc: 'Vous nous présentez un ami, collègue ou client qui a besoin de nos services drone.' },
  { step: '02', title: 'La mission se réalise', desc: 'On effectue la mission pour votre filleul. Dès validation, vous gagnez des crédits.' },
  { step: '03', title: 'Vous gagnez des crédits', desc: '30 minutes de vol offerts par parrainage validé — utilisables sur vos prochaines missions.' },
];

export default function ParrainagePage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState({ referred_name: '', referred_email: '', referred_phone: '', mission_description: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const totalCredits = myReferrals.filter(r => r.status === 'rewarded').reduce((a, r) => a + (r.credits_earned || 0), 0);
  const pendingCount = myReferrals.filter(r => r.status === 'pending').length;

  const handleSubmit = async () => {
    if (!form.referred_name || !form.referred_email) { toast.error('Nom et email du filleul requis'); return; }
    setSubmitting(true);
    await base44.entities.Referral.create({
      referrer_email: user.email,
      referrer_name: user.full_name,
      ...form,
      credits_earned: 0,
      status: 'pending',
    });
    toast.success('Parrainage enregistré ! Merci 🎉');
    setForm({ referred_name: '', referred_email: '', referred_phone: '', mission_description: '' });
    refetch();
    setSubmitting(false);
  };

  const statusConfig = {
    pending: { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
    validated: { label: 'Validé', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
    rewarded: { label: 'Récompensé ✓', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-5 overflow-hidden text-center">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Programme Pro</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-4">
              Parrainage <span className="gradient-text">Pro</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto">
              Présentez-nous vos contacts. Chaque mission réalisée vous rapporte <strong className="text-foreground">30 minutes de vol offertes</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-5 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="font-mono text-xs text-primary font-bold">{step.step}</span>
              </div>
              <h3 className="font-grotesk font-bold text-sm mb-2">{step.title}</h3>
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 pb-24">
        {!authChecked ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : !user ? (
          <div className="text-center py-10 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-grotesk font-bold text-xl">Connectez-vous pour parrainer</h2>
            <p className="font-inter text-sm text-muted-foreground">Un compte est nécessaire pour suivre vos filleuls et crédits.</p>
            <Button onClick={() => base44.auth.redirectToLogin('/parrainage')} className="bg-primary text-primary-foreground gap-2">
              <LogIn className="w-4 h-4" /> Se connecter
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Credits recap */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: myReferrals.length, label: 'Parrainages', icon: Users },
                { val: pendingCount, label: 'En attente', icon: Clock },
                { val: `${totalCredits} min`, label: 'Crédits gagnés', icon: Trophy },
              ].map(({ val, label, icon: Icon }) => (
                <div key={label} className="p-4 rounded-xl bg-card border border-border text-center">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="font-grotesk font-bold text-lg">{val}</p>
                  <p className="font-inter text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> Nouveau parrainage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom du filleul *</label>
                  <Input value={form.referred_name} onChange={e => setForm(p => ({ ...p, referred_name: e.target.value }))} placeholder="Marie Martin" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Email du filleul *</label>
                  <Input type="email" value={form.referred_email} onChange={e => setForm(p => ({ ...p, referred_email: e.target.value }))} placeholder="marie@exemple.fr" className="bg-secondary border-border" />
                </div>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                <Input value={form.referred_phone} onChange={e => setForm(p => ({ ...p, referred_phone: e.target.value }))} placeholder="06 XX XX XX XX" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Type de mission souhaitée</label>
                <Textarea value={form.mission_description} onChange={e => setForm(p => ({ ...p, mission_description: e.target.value }))}
                  placeholder="Ex: inspection toiture maison individuelle à Nantes…" className="bg-secondary border-border" rows={3} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground gap-2 font-grotesk font-semibold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Envoyer le parrainage
              </Button>
            </div>

            {/* History */}
            {myReferrals.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-grotesk font-semibold text-sm">Historique</h3>
                {myReferrals.map(r => {
                  const cfg = statusConfig[r.status] || statusConfig.pending;
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium truncate">{r.referred_name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{r.referred_email}</p>
                      </div>
                      {r.credits_earned > 0 && (
                        <span className="font-mono text-xs text-primary font-bold">+{r.credits_earned} min</span>
                      )}
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
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