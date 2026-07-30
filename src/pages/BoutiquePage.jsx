import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Crown, BadgeCheck, TrendingUp, Settings, Sparkles, Users,
  Star, Gem, Trophy, Rocket, Zap, Camera, Video, MessageCircle,
  Bell, Palette, Award, Heart, Flame, Shield, Eye, Megaphone,
  Coffee, Music, BookOpen, Headphones, Smartphone, Bot, Lock,
  Loader2, Coins, CheckCircle, ArrowRight, Tag,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { applySeoMeta } from '@/lib/seo';

const CATEGORIES = {
  abonnements: { label: 'Abonnements', icon: Crown, color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  badges: { label: 'Badges & Vérifications', icon: BadgeCheck, color: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-400/10' },
  boosts: { label: 'Boosts & Visibilité', icon: TrendingUp, color: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-400/10' },
  features: { label: 'Fonctionnalités', icon: Settings, color: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10' },
  exclusivites: { label: 'Exclusivités', icon: Sparkles, color: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/10' },
  communaute: { label: 'Communauté', icon: Users, color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
};

const SHOP_ITEMS = [
  // ── Abonnements ──
  { id: 'premium_1m', label: '1 mois Premium', desc: 'Accès Premium complet pendant 1 mois', cost: 50, category: 'abonnements', icon: Sparkles },
  { id: 'premium_3m', label: '3 mois Premium', desc: 'Premium pendant 3 mois — 13% de réduction', cost: 130, category: 'abonnements', icon: Sparkles },
  { id: 'premium_1y', label: '1 an Premium', desc: 'Premium pendant 12 mois — 25% de réduction', cost: 450, category: 'abonnements', icon: Crown },
  { id: 'business_1m', label: '1 mois Business', desc: 'Tous les avantages Business pendant 1 mois', cost: 200, category: 'abonnements', icon: Crown },
  { id: 'business_3m', label: '3 mois Business', desc: 'Business pendant 3 mois', cost: 550, category: 'abonnements', icon: Crown },
  { id: 'enterprise_1m', label: '1 mois Enterprise', desc: 'Le plan ultime pour institutions', cost: 500, category: 'abonnements', icon: Trophy },

  // ── Badges & Vérifications ──
  { id: 'badge_verified', label: 'Badge Vérifié', desc: 'Coche de vérification bleue', cost: 100, category: 'badges', icon: BadgeCheck },
  { id: 'badge_pro', label: 'Badge Pro', desc: 'Statut professionnel avec coche verte', cost: 300, category: 'badges', icon: Gem },
  { id: 'badge_certified', label: 'Badge Certifié', desc: 'Expertise reconnue avec coche dorée', cost: 400, category: 'badges', icon: Award },
  { id: 'badge_official', label: 'Badge Officiel', desc: 'Entité officielle avec coche violette', cost: 500, category: 'badges', icon: Shield },
  { id: 'badge_ambassador', label: 'Badge Ambassadeur', desc: 'Représentez une marque partenaire', cost: 350, category: 'badges', icon: Megaphone },
  { id: 'badge_scholar', label: 'Badge Érudit', desc: 'Reconnu pour vos connaissances', cost: 400, category: 'badges', icon: BookOpen },
  { id: 'badge_donor', label: 'Badge Donateur', desc: 'Soutien officiel de la plateforme', cost: 150, category: 'badges', icon: Heart },
  { id: 'badge_beta', label: 'Badge Beta Testeur', desc: 'Accès aux fonctionnalités en avant-première', cost: 80, category: 'badges', icon: Bot },
  { id: 'badge_mentor', label: 'Badge Mentor', desc: 'Accompagnez les nouveaux membres', cost: 250, category: 'badges', icon: Users },

  // ── Boosts & Visibilité ──
  { id: 'boost_1', label: 'Boost 1 publication', desc: 'Mise en avant d\'un post dans le feed', cost: 20, category: 'boosts', icon: Zap },
  { id: 'boost_3', label: 'Boost 3 publications', desc: '3 posts boostés dans le feed', cost: 50, category: 'boosts', icon: Zap },
  { id: 'boost_10', label: 'Boost 10 publications', desc: 'Pack de 10 boosts — économisez 30%', cost: 150, category: 'boosts', icon: Flame },
  { id: 'profile_featured_7d', label: 'Profil à la une (7 jours)', desc: 'Mise en avant dans l\'explorateur pendant 7 jours', cost: 80, category: 'boosts', icon: Star },
  { id: 'profile_featured_30d', label: 'Profil à la une (30 jours)', desc: 'Visibilité maximale pendant 30 jours', cost: 250, category: 'boosts', icon: Star },
  { id: 'post_pinned_24h', label: 'Post épinglé 24h', desc: 'Votre post épinglé en haut du feed', cost: 30, category: 'boosts', icon: Eye },
  { id: 'post_pinned_7d', label: 'Post épinglé 7 jours', desc: 'Épinglé pendant une semaine complète', cost: 150, category: 'boosts', icon: Eye },
  { id: 'top_explorer_30d', label: 'Top explorateur (30 jours)', desc: 'Position prioritaire dans les recherches', cost: 200, category: 'boosts', icon: TrendingUp },

  // ── Fonctionnalités ──
  { id: 'analytics_adv', label: 'Analytics avancées (1 mois)', desc: 'Statistiques détaillées de votre audience', cost: 100, category: 'features', icon: TrendingUp },
  { id: 'scheduled_posts', label: 'Publications programmées illimitées', desc: 'Programmez vos posts sans limite pendant 1 mois', cost: 80, category: 'features', icon: Bell },
  { id: 'storage_5gb', label: 'Stockage étendu (5 Go)', desc: 'Plus d\'espace pour vos médias', cost: 120, category: 'features', icon: Camera },
  { id: 'custom_colors', label: 'Couleurs de profil personnalisées', desc: 'Personnalisez l\'apparence de votre profil', cost: 60, category: 'features', icon: Palette },
  { id: 'custom_animated_badge', label: 'Badge animé personnalisé', desc: 'Créez votre propre badge animé', cost: 90, category: 'features', icon: Sparkles },
  { id: 'custom_notif_sound', label: 'Son de notification personnalisé', desc: 'Choisissez votre son de notification', cost: 40, category: 'features', icon: Bell },
  { id: 'particle_effects', label: 'Effets de particules de profil', desc: 'Ajoutez des effets visuels à votre profil', cost: 70, category: 'features', icon: Sparkles },
  { id: 'custom_watermark', label: 'Watermark personnalisé', desc: 'Ajoutez votre logo sur vos médias', cost: 50, category: 'features', icon: Shield },

  // ── Exclusivités & Expériences ──
  { id: 'vip_1m', label: 'Statut VIP (1 mois)', desc: 'Le statut le plus prestigieux pendant 1 mois', cost: 500, category: 'exclusivites', icon: Trophy },
  { id: 'early_access', label: 'Accès anticipé aux features', desc: 'Testez les nouveautés avant tout le monde', cost: 300, category: 'exclusivites', icon: Rocket },
  { id: 'call_pdg', label: 'Appel avec le PDG (30 min)', desc: 'Échange privé de 30 minutes avec le PDG d\'Eza', cost: 1000, category: 'exclusivites', icon: MessageCircle },
  { id: 'studio_visit', label: 'Visite du studio Eza', desc: 'Visite guidée des locaux d\'Eza', cost: 800, category: 'exclusivites', icon: Video },
  { id: 'tshirt_eza', label: 'T-shirt Eza', desc: 'Le t-shirt officiel de la communauté', cost: 400, category: 'exclusivites', icon: Coffee },
  { id: 'hoodie_eza', label: 'Hoodie Eza', desc: 'Le hoodie collector de la plateforme', cost: 600, category: 'exclusivites', icon: Coffee },
  { id: 'stickers_pack', label: 'Pack stickers Eza', desc: 'Pack de stickers exclusifs à coller partout', cost: 150, category: 'exclusivites', icon: Sparkles },
  { id: 'feature_naming', label: 'Nommage d\'une fonctionnalité', desc: 'Donnez votre nom à une future fonctionnalité', cost: 2000, category: 'exclusivites', icon: Award },
  { id: 'founder_cert', label: 'Certificat de membre fondateur', desc: 'Certificat officiel numéroté de membre fondateur', cost: 1500, category: 'exclusivites', icon: Crown },
  { id: 'vip_playlist', label: 'Playlist VIP personnalisée', desc: 'Une playlist curatoriale par notre équipe', cost: 120, category: 'exclusivites', icon: Music },

  // ── Communauté ──
  { id: 'vip_community', label: 'Création communauté VIP', desc: 'Créez une communauté avec des perks VIP', cost: 100, category: 'communaute', icon: Users },
  { id: 'community_1k', label: 'Communauté 1000 membres offerte', desc: 'Capacité étendue à 1000 membres', cost: 500, category: 'communaute', icon: Users },
  { id: 'pin_community', label: 'Épingler une communauté', desc: 'Votre communauté épinglée sur la page d\'accueil', cost: 200, category: 'communaute', icon: Eye },
  { id: 'sponsored_event', label: 'Événement sponsorisé', desc: 'Sponsorisez un événement communautaire', cost: 300, category: 'communaute', icon: Megaphone },
  { id: 'community_premium_design', label: 'Design premium de communauté', desc: 'Apparence premium pour votre communauté', cost: 150, category: 'communaute', icon: Palette },
  { id: 'community_space', label: 'Space communautaire mensuel', desc: 'Un Space audio dédié à votre communauté chaque mois', cost: 180, category: 'communaute', icon: Headphones },
];

const CATEGORY_ORDER = ['abonnements', 'badges', 'boosts', 'features', 'exclusivites', 'communaute'];

export default function BoutiquePage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('abonnements');
  const [redeeming, setRedeeming] = useState(null);
  const [redemptions, setRedemptions] = useState([]);

  useEffect(() => {
    applySeoMeta({
      title: 'Boutique Eza — Échangez vos crédits contre des récompenses',
      description: 'Boutique de récompenses Eza : abonnements, badges, boosts, exclusivités et plus encore.',
    });
    init();
  }, []);

  const init = useCallback(async () => {
    const ok = await base44.auth.isAuthenticated();
    if (!ok) { setAuthed(false); setLoading(false); return; }
    setAuthed(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      setCredits(me.referral_credits || 0);
      const reds = await base44.entities.RewardRedemption.filter({ user_email: me.email });
      setRedemptions(reds || []);
    } catch {}
    setLoading(false);
  }, []);

  const handleRedeem = async (item) => {
    if (credits < item.cost) {
      toast.error(`Il vous faut ${item.cost} crédits (vous en avez ${credits})`);
      return;
    }
    if (!confirm(`Échanger ${item.cost} crédits contre "${item.label}" ?`)) return;
    setRedeeming(item.id);
    try {
      const res = await base44.functions.invoke('redeemReferralReward', {
        rewardId: item.id,
        rewardLabel: item.label,
        rewardCategory: item.category,
        cost: item.cost,
      });
      const data = res.data || res;
      if (data?.success) {
        toast.success(`${item.label} réclamé ! Notre équipe traite votre demande.`);
        setCredits(data.remainingCredits);
        const me = await base44.auth.me();
        setCredits(me.referral_credits || 0);
        const reds = await base44.entities.RewardRedemption.filter({ user_email: me.email });
        setRedemptions(reds || []);
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
          <h1 className="font-grotesk font-black text-3xl text-foreground mb-3">Boutique Eza</h1>
          <p className="font-inter text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Échangez vos crédits de parrainage contre des récompenses exclusives.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => base44.auth.redirectToLogin('/boutique')}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
              Se connecter
            </button>
            <Link to="/parrainage" className="px-6 py-3 rounded-full border border-border bg-card text-foreground font-grotesk font-bold text-sm hover:bg-muted/50 transition-all">
              Gagner des crédits
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center sky-glow">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-grotesk font-black text-2xl text-foreground">Boutique Eza</h1>
              <p className="font-inter text-sm text-muted-foreground">Échangez vos crédits contre des récompenses</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-grotesk font-black text-xl text-primary">{credits}</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-1">crédits</p>
            </div>
          </div>
        </motion.div>

        {/* Pending redemptions */}
        {pendingRedemptions.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-400/30 bg-amber-400/8 mb-6">
            <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="font-inter text-xs text-muted-foreground">
              {pendingRedemptions.length} réclamation(s) en cours de traitement par notre équipe.
            </p>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORY_ORDER.map(catId => {
            const cat = CATEGORIES[catId];
            const Icon = cat.icon;
            const active = activeCategory === catId;
            const count = SHOP_ITEMS.filter(i => i.category === catId).length;
            return (
              <button key={catId} onClick={() => setActiveCategory(catId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 border transition-all ${
                  active ? `${cat.bg} ${cat.border} ${cat.color} font-bold` : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {cat.label}
                <span className="font-mono text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {SHOP_ITEMS.filter(i => i.category === activeCategory).map(item => {
            const cat = CATEGORIES[item.category];
            const Icon = item.icon;
            const canAfford = credits >= item.cost;
            const isRedeeming = redeeming === item.id;
            return (
              <div key={item.id} className={`rounded-2xl border ${cat.border} ${cat.bg} p-4 flex flex-col`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${cat.border}`} style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-grotesk font-bold text-sm text-foreground leading-tight">{item.label}</p>
                    <p className="font-inter text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-1.5">
                    <Coins className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span className={`font-mono text-sm font-bold ${cat.color}`}>{item.cost}</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford || isRedeeming}
                    className={`px-3 py-1.5 rounded-lg font-grotesk font-bold text-xs flex items-center gap-1.5 transition-all ${
                      canAfford ? 'bg-foreground text-background hover:bg-foreground/90' : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    }`}>
                    {isRedeeming ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                      canAfford ? <><Gift className="w-3 h-3" /> Réclamer</> : <><Lock className="w-3 h-3" /> {item.cost - credits} cr</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earn more CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="font-grotesk font-bold text-lg text-foreground">Pas assez de crédits ?</h2>
          </div>
          <p className="font-inter text-sm text-muted-foreground mb-5">
            Invitez vos amis sur Eza et gagnez jusqu'à <span className="font-bold text-primary">200 crédits</span> par filleul selon ses actions.
          </p>
          <Link to="/parrainage" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
            Parrainer mes amis <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* My redemptions */}
        {redemptions.length > 0 && (
          <div className="mt-8">
            <h2 className="font-grotesk font-bold text-sm text-foreground mb-4">Mes réclamations ({redemptions.length})</h2>
            <div className="space-y-2">
              {redemptions.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{r.item_label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/50">{r.cost} crédits</p>
                  </div>
                  <div className="flex-shrink-0">
                    {r.status === 'pending' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">En attente</span>}
                    {r.status === 'fulfilled' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">Honorée</span>}
                    {r.status === 'rejected' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/30">Refusée</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}