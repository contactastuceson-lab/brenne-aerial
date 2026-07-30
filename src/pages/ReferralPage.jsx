import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Copy, Check, Mail, Users, Coins, Sparkles, Trophy,
  Crown, Gem, Star, CheckCircle, Loader2, Share2, Award,
  TrendingUp, UserPlus, Zap, Lock,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { applySeoMeta } from '@/lib/seo';

const CREDITS_PER_REFERRAL = 50;

const EARNING_METHODS = [
  { icon: UserPlus, label: "Filleul s'inscrit", credits: 50, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/30' },
  { icon: CheckCircle, label: 'Filleul publie son 1er post', credits: 20, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { icon: Award, label: 'Filleul obtient un badge', credits: 30, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { icon: Crown, label: 'Filleul souscrit Premium', credits: 100, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
];

const REWARDS = [
  { id: 'premium_month', label: '1 mois Premium gratuit', cost: 50, icon: Sparkles, color: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-400/10' },
  { id: 'verified_badge', label: 'Badge Vérifié offert', cost: 100, icon: CheckCircle, color: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-400/10' },
  { id: 'boost_posts', label: 'Boost de 3 publications', cost: 150, icon: Star, color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  { id: 'business_month', label: '1 mois Business offert', cost: 200, icon: Crown, color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  { id: 'pro_badge', label: 'Badge Pro offert', cost: 300, icon: Gem, color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  { id: 'vip_status', label: 'Statut VIP pendant 1 mois', cost: 500, icon: Trophy, color: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/10' },
];

export default function ReferralPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    applySeoMeta({
      title: 'Parrainage Eza — Invitez vos amis, gagnez des récompenses',
      description: 'Programme de parrainage Eza : invitez vos amis et gagnez des crédits échangeables contre des récompenses exclusives.',
    });
    init();
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const me = await base44.auth.me();
      setUser(me);
      setCredits(me.referral_credits || 0);
      const refs = await base44.entities.Referral.filter({ referrer_email: me.email });
      setReferrals(refs || []);
    } catch {}
  }, [user]);

  const processPendingReferral = useCallback(async (refCode) => {
    setProcessing(true);
    try {
      const res = await base44.functions.invoke('processReferral', { referralCode: refCode });
      const data = res.data || res;
      if (data?.success) {
        toast.success(`Parrainage validé ! ${data.referrerName} a reçu ${CREDITS_PER_REFERRAL} crédits.`);
      } else if (data?.alreadyProcessed) {
        // Silent — already processed
      } else if (data?.error && !data.error.includes('vous-même') && !data.error.includes('invalide')) {
        toast.error(data.error);
      }
      localStorage.removeItem('eza_ref_code');
    } catch {}
    setProcessing(false);
  }, []);

  const init = useCallback(async () => {
    // Capture ref code from URL
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref');
    if (refFromUrl) {
      localStorage.setItem('eza_ref_code', refFromUrl);
      window.history.replaceState({}, '', window.location.pathname);
    }

    const ok = await base44.auth.isAuthenticated();
    if (!ok) { setAuthed(false); setLoading(false); return; }
    setAuthed(true);

    try {
      const me = await base44.auth.me();
      setUser(me);
      setCredits(me.referral_credits || 0);

      const refs = await base44.entities.Referral.filter({ referrer_email: me.email });
      setReferrals(refs || []);

      // Process pending referral from localStorage
      const pendingRef = localStorage.getItem('eza_ref_code');
      if (pendingRef && pendingRef !== me.username) {
        await processPendingReferral(pendingRef);
        // Refresh after processing
        const refreshed = await base44.auth.me();
        setUser(refreshed);
        setCredits(refreshed.referral_credits || 0);
        const newRefs = await base44.entities.Referral.filter({ referrer_email: refreshed.email });
        setReferrals(newRefs || []);
      }
    } catch {}
    setLoading(false);
  }, [processPendingReferral]);

  const referralCode = user?.username || '';
  const referralLink = referralCode ? `${window.location.origin}/parrainage?ref=${referralCode}` : '';

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copie impossible');
    }
  };

  const handleInviteEmail = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !referralLink) return;
    const subject = encodeURIComponent('Rejoins-moi sur Eza 🚀');
    const body = encodeURIComponent(
      `Salut !\n\nJe t'invite à rejoindre Eza, la plateforme communautaire où créateurs, professionnels et institutions se rassemblent.\n\nInscris-toi avec mon code de parrainage : ${referralCode}\n\n👉 ${referralLink}\n\nÀ très vite !`
    );
    window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
    setInviteEmail('');
    toast.success("Votre client mail va s'ouvrir…");
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins-moi sur Eza',
          text: `Utilise mon code de parrainage : ${referralCode}`,
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleRedeem = async (reward) => {
    if (credits < reward.cost) {
      toast.error(`Il vous faut ${reward.cost} crédits (vous en avez ${credits})`);
      return;
    }
    if (!confirm(`Échanger ${reward.cost} crédits contre "${reward.label}" ?`)) return;
    setRedeeming(reward.id);
    try {
      const res = await base44.functions.invoke('redeemReferralReward', {
        rewardId: reward.id,
        rewardLabel: reward.label,
        cost: reward.cost,
      });
      const data = res.data || res;
      if (data?.success) {
        toast.success(`${reward.label} réclamé ! Notre équipe traite votre demande.`);
        setCredits(data.remainingCredits);
        await refreshData();
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erreur lors de la réclamation');
    }
    setRedeeming(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 sky-glow">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-grotesk font-black text-3xl text-foreground mb-3">Programme de parrainage Eza</h1>
          <p className="font-inter text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Invitez vos amis sur Eza et gagnez des crédits échangeables contre des récompenses exclusives : Premium, badges, boosts et plus encore.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => base44.auth.redirectToLogin('/parrainage')}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
              Se connecter
            </button>
            <button onClick={() => window.location.href = '/register'}
              className="px-6 py-3 rounded-full border border-border bg-card text-foreground font-grotesk font-bold text-sm hover:bg-muted/50 transition-all">
              Créer un compte
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-10 max-w-lg">
            {EARNING_METHODS.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border ${m.border} ${m.bg}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${m.color}`} />
                  <div className="text-left">
                    <p className="font-inter text-[11px] text-muted-foreground leading-tight">{m.label}</p>
                    <p className={`font-mono text-[10px] font-bold ${m.color}`}>+{m.credits} cr</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  const validatedCount = referrals.filter(r => r.status === 'validated' || r.status === 'rewarded').length;
  const totalEarned = referrals.reduce((sum, r) => sum + (r.credits_earned || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center sky-glow">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-grotesk font-black text-2xl text-foreground">Parrainage Eza</h1>
              <p className="font-inter text-sm text-muted-foreground">Invitez vos amis, gagnez des récompenses</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={Coins} label="Crédits" value={credits} color="text-sky-400" bg="bg-sky-400/10" border="border-sky-400/30" />
          <StatCard icon={Users} label="Filleuls" value={validatedCount} color="text-emerald-400" bg="bg-emerald-400/10" border="border-emerald-400/30" />
          <StatCard icon={TrendingUp} label="Gagnés" value={totalEarned} color="text-amber-400" bg="bg-amber-400/10" border="border-amber-400/30" />
        </div>

        {/* Referral code + link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 mb-6 glass-card">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">Votre code de parrainage</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 px-4 py-3 rounded-xl bg-secondary/50 border border-border">
              <span className="font-grotesk font-black text-xl text-primary">@{referralCode}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border text-xs text-muted-foreground truncate font-mono">
              {referralLink}
            </div>
            <button onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-grotesk font-bold text-xs flex items-center gap-1.5 transition-all flex-shrink-0 ${copied ? 'bg-emerald-400 text-black' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
            </button>
          </div>
          <button onClick={handleShare}
            className="w-full py-2.5 rounded-xl border border-border bg-secondary/30 text-foreground text-xs font-grotesk font-bold flex items-center justify-center gap-1.5 hover:bg-secondary/50 transition-all">
            <Share2 className="w-3.5 h-3.5" /> Partager le lien
          </button>
        </motion.div>

        {/* Invite by email */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-grotesk font-bold text-sm text-foreground">Inviter par email</h2>
          </div>
          <form onSubmit={handleInviteEmail} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="email@ami.fr"
              required
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
            />
            <button type="submit"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-grotesk font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all whitespace-nowrap">
              <Mail className="w-3.5 h-3.5" /> Envoyer l'invitation
            </button>
          </form>
          <p className="font-inter text-[11px] text-muted-foreground/50 mt-2">
            Votre client mail s'ouvrira avec un message pré-rempli contenant votre code.
          </p>
        </motion.div>

        {/* How to earn */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-6">
          <h2 className="font-grotesk font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Comment gagner des crédits
          </h2>
          <div className="space-y-2">
            {EARNING_METHODS.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${m.border} ${m.bg}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg} border ${m.border}`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <p className="flex-1 font-inter text-sm text-foreground/80">{m.label}</p>
                  <span className={`font-mono text-sm font-bold ${m.color}`}>+{m.credits}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Referrals list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mb-6">
          <h2 className="font-grotesk font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Vos filleuls ({referrals.length})
          </h2>
          {referrals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-inter text-sm text-muted-foreground/60">Aucun filleul pour l'instant</p>
              <p className="font-inter text-xs text-muted-foreground/40 mt-1">Partagez votre code pour commencer à gagner des crédits</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-grotesk font-bold text-xs text-primary">
                      {(r.referred_name || r.referred_email || '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{r.referred_name || r.referred_email}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/50 truncate">{r.referred_email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.status === 'validated' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">Validé</span>
                    )}
                    {r.status === 'rewarded' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">Récompensé</span>
                    )}
                    {r.status === 'pending' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">En attente</span>
                    )}
                    {r.credits_earned > 0 && <span className="font-mono text-xs font-bold text-sky-400">+{r.credits_earned}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rewards shop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-grotesk font-bold text-sm text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" /> Boutique de récompenses
            </h2>
            <span className="font-mono text-xs text-muted-foreground">{credits} crédits</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REWARDS.map(reward => {
              const Icon = reward.icon;
              const canAfford = credits >= reward.cost;
              const isRedeeming = redeeming === reward.id;
              return (
                <div key={reward.id} className={`rounded-2xl border ${reward.border} ${reward.bg} p-4 flex flex-col`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${reward.border}`} style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Icon className={`w-5 h-5 ${reward.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-grotesk font-bold text-sm text-foreground">{reward.label}</p>
                      <p className={`font-mono text-xs font-bold ${reward.color}`}>{reward.cost} crédits</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || isRedeeming}
                    className={`w-full py-2.5 rounded-xl font-grotesk font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      canAfford ? 'bg-foreground text-background hover:bg-foreground/90' : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    }`}>
                    {isRedeeming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                      canAfford ? <><Gift className="w-3.5 h-3.5" /> Réclamer</> : <><Lock className="w-3.5 h-3.5" /> {reward.cost - credits} cr manquants</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Processing notification */}
        {processing && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-card border border-border shadow-xl flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="font-inter text-xs text-foreground">Traitement du parrainage…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-3 text-center`}>
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <p className="font-grotesk font-black text-xl text-foreground">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">{label}</p>
    </div>
  );
}