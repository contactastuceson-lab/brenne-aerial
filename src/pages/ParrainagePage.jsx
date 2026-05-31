import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Users, Clock, Trophy, LogIn, Loader2, Copy, Check, Share2, Star, Zap, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const STEPS = [
  {
    icon: Share2,
    num: '01',
    title: 'Générez votre lien',
    desc: 'Créez votre lien de parrainage unique en un clic et partagez-le à qui vous voulez.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    icon: Zap,
    num: '02',
    title: 'Votre filleul commande',
    desc: 'Il clique sur votre lien, remplit le formulaire de devis, et la mission se réalise.',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    icon: Star,
    num: '03',
    title: 'Vous gagnez des crédits',
    desc: '30 minutes de vol offertes par parrainage validé, cumulables sans limite.',
    color: 'text-chart-5',
    bg: 'bg-chart-5/10 border-chart-5/20',
  },
];

const STATUS_CFG = {
  pending:   { label: 'En attente',   color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/30' },
  validated: { label: 'Validé',       color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
  rewarded:  { label: '+ Crédits ✓', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
};

function generateCode(email) {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${rand}`;
}

export default function ParrainagePage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_parrainage_enabled');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Le lien actif = dernier referral créé (ou on peut en créer un nouveau)
  const latestReferral = myReferrals[0];
  const referralLink = latestReferral
    ? `${window.location.origin}/parrainage/rejoindre?code=${latestReferral.referral_code}&parrain=${encodeURIComponent(user?.full_name || '')}`
    : null;

  const handleCreateLink = async () => {
    setCreating(true);
    const code = generateCode(user.email);
    await base44.entities.Referral.create({
      referrer_email: user.email,
      referrer_name: user.full_name,
      referral_code: code,
      credits_earned: 0,
      status: 'pending',
    });
    refetch();
    setCreating(false);
    toast.success('Lien de parrainage créé ! 🎉');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Brenne Aerial – Parrainage',
        text: `${user.full_name} vous invite à découvrir Brenne Aerial 🚁`,
        url: referralLink,
      });
    } else {
      handleCopy();
    }
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
              Partagez votre lien unique. Chaque mission réalisée via votre lien vous rapporte{' '}
              <strong className="text-foreground">30 minutes de vol offertes</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-grotesk font-bold text-2xl mb-2">Comment ça marche ?</h2>
          <p className="font-inter text-sm text-muted-foreground">3 étapes simples pour gagner des crédits</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative p-7 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
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
      <section className="py-8 px-5 max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-8 text-center">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-grotesk font-bold text-2xl mb-1">30 min de vol offerts</h3>
            <p className="font-inter text-sm text-muted-foreground">par parrainage validé — cumulables sans limite</p>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <div className="max-w-3xl mx-auto px-5 pb-28">
        {!authChecked ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-16 rounded-2xl bg-card border border-border p-10 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-grotesk font-bold text-xl">Connectez-vous pour commencer</h2>
            <p className="font-inter text-sm text-muted-foreground">Un compte est requis pour générer votre lien de parrainage.</p>
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
                <div key={label} className="p-5 rounded-2xl bg-card border border-border text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                  <p className={`font-grotesk font-bold text-2xl ${color}`}>{val}</p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Lien de parrainage */}
            <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-4">
              <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" /> Votre lien de parrainage
              </h2>

              {referralLink ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary border border-border">
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-xs text-muted-foreground truncate flex-1">{referralLink}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2 border-border">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copié !' : 'Copier le lien'}
                    </Button>
                    <Button onClick={handleShare} className="flex-1 bg-primary text-primary-foreground gap-2">
                      <Share2 className="w-4 h-4" /> Partager
                    </Button>
                  </div>
                  <p className="font-inter text-xs text-muted-foreground text-center">
                    Partagez ce lien par WhatsApp, SMS, email ou réseaux sociaux — votre filleul n'a qu'à cliquer pour demander un devis.
                  </p>
                  <button onClick={handleCreateLink} disabled={creating} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-1">
                    + Générer un nouveau lien
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <p className="font-inter text-sm text-muted-foreground">Vous n'avez pas encore de lien de parrainage.</p>
                  <Button onClick={handleCreateLink} disabled={creating} className="bg-primary text-primary-foreground gap-2 h-11 px-8 font-grotesk font-semibold rounded-xl sky-glow">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                    {creating ? 'Création…' : 'Générer mon lien de parrainage'}
                  </Button>
                </div>
              )}
            </div>

            {/* Historique */}
            {myReferrals.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-grotesk font-semibold text-sm text-muted-foreground uppercase tracking-wider">Parrainages utilisés ({myReferrals.length})</h3>
                {myReferrals.map((r, i) => {
                  const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending;
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-grotesk font-bold text-sm text-primary">
                          {r.referred_name ? r.referred_name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-semibold truncate">{r.referred_name || 'Lien non encore utilisé'}</p>
                        <p className="font-mono text-xs text-muted-foreground truncate">{r.referred_email || `Code: ${r.referral_code}`}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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