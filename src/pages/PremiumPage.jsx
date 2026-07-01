import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronRight, ChevronLeft, Award, CheckCircle, Gem,
  BadgeCheck, Building2, ShieldCheck, User, Calendar, MapPin,
  Phone, Globe, Link2, Heart, Briefcase, Hash, Camera, Star,
  Users, Instagram, Linkedin, ExternalLink, FileText, Loader2,
  AlertCircle, Sparkles, Crown, Trophy, Info
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// ─── Badge definitions ────────────────────────────────────────────────────────
const TIERS = {
  premium: {
    id: 'premium',
    label: 'Premium',
    subtitle: 'Pour les créateurs & particuliers',
    icon: Sparkles,
    colorClass: 'text-sky-400',
    borderClass: 'border-sky-400/60',
    bgClass: 'bg-sky-400/5',
    glowClass: 'shadow-sky-400/20',
    badges: ['verified', 'pro'],
    monthlyPrice: { verified: 5, pro: 10 },
    yearlyPrice: { verified: 3.99, pro: 7.99 },
    perks: [
      { icon: CheckCircle, text: 'Coche de vérification EZA' },
      { icon: Sparkles, text: 'Moins de publicités dans votre fil' },
      { icon: Star, text: 'Réponses boostées dans le feed' },
      { icon: Trophy, text: 'Mise en avant dans l\'explorateur' },
      { icon: Check, text: 'Badge animé sur votre profil' },
    ],
  },
  business: {
    id: 'business',
    label: 'Business',
    subtitle: 'Pour les pros & organisations',
    icon: Crown,
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-400/60',
    bgClass: 'bg-amber-400/5',
    glowClass: 'shadow-amber-400/20',
    badges: ['certified', 'official'],
    monthlyPrice: { certified: 20, official: 40 },
    yearlyPrice: { certified: 15.99, official: 31.99 },
    perks: [
      { icon: BadgeCheck, text: 'Coche certifiée / officielle exclusive' },
      { icon: Users, text: 'Priorité absolue dans les recherches' },
      { icon: Globe, text: 'Analyse d\'audience complète' },
      { icon: Star, text: 'Publications sponsorisées gratuites (2/mois)' },
      { icon: Crown, text: 'Support prioritaire dédié 24h' },
      { icon: Check, text: 'Tous les avantages Premium' },
    ],
  },
};

const BADGE_LEVELS = [
  {
    key: 'verified', label: 'Vérifié', icon: CheckCircle, tier: 'premium',
    color: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-400/10',
    price: { monthly: 5, yearly: 3.99 },
    desc: 'Prouvez que votre identité est réelle',
    perks: ['Coche de vérification bleue', 'Identité confirmée publiquement', 'Réponses boostées', 'Badge Vérifié sur votre profil'],
    steps: [
      { title: 'Identité', subtitle: 'Confirmez qui vous êtes', icon: User, fields: [
        { id: 'full_name', label: 'Nom complet réel', placeholder: 'Prénom Nom', type: 'text', required: true, icon: User },
        { id: 'birth_year', label: 'Année de naissance', placeholder: 'Ex: 1995', type: 'number', required: true, icon: Calendar },
        { id: 'city', label: 'Ville de résidence', placeholder: 'Ex: Paris', type: 'text', required: true, icon: MapPin },
        { id: 'phone', label: 'Téléphone (optionnel)', placeholder: '+33 6 00 00 00 00', type: 'text', required: false, icon: Phone },
      ]},
      { title: 'Présence en ligne', subtitle: 'Vos profils publics', icon: Globe, fields: [
        { id: 'social_main', label: 'Réseau social principal', placeholder: 'https://instagram.com/...', type: 'text', required: true, icon: Link2 },
        { id: 'social_secondary', label: 'Second réseau (optionnel)', placeholder: 'LinkedIn, TikTok...', type: 'text', required: false, icon: Link2 },
        { id: 'website', label: 'Site web (optionnel)', placeholder: 'https://...', type: 'text', required: false, icon: Globe },
      ]},
      { title: 'Motivation', subtitle: 'Expliquez votre démarche', icon: Heart, fields: [
        { id: 'activity', label: 'Votre activité / domaine', placeholder: 'Créateur, artiste, entrepreneur...', type: 'text', required: true, icon: Briefcase },
        { id: 'why_verified', label: 'Pourquoi souhaitez-vous être vérifié ?', placeholder: "Décrivez l'utilité...", type: 'textarea', required: true },
      ]},
    ],
  },
  {
    key: 'pro', label: 'Pro', icon: Gem, tier: 'premium',
    color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10',
    price: { monthly: 10, yearly: 7.99 },
    desc: 'Montrez que vous exercez à titre professionnel',
    perks: ['Coche Pro verte', 'Profil pro mis en avant', 'Statistiques avancées', 'Badge Pro animé'],
    steps: [
      { title: 'Identité professionnelle', subtitle: 'Vos infos en tant que pro', icon: Briefcase, fields: [
        { id: 'pro_name', label: 'Nom / Nom commercial', placeholder: 'Votre nom ou structure', type: 'text', required: true, icon: User },
        { id: 'activity_type', label: "Secteur d'activité", placeholder: 'Photographie, marketing...', type: 'text', required: true, icon: Briefcase },
        { id: 'siret', label: 'SIRET (si applicable)', placeholder: '123 456 789', type: 'text', required: false, icon: Hash },
        { id: 'city', label: "Ville d'activité", placeholder: 'Ex: Lyon', type: 'text', required: true, icon: MapPin },
        { id: 'activity_since', label: 'Actif depuis (année)', placeholder: 'Ex: 2020', type: 'number', required: true, icon: Calendar },
      ]},
      { title: 'Portfolio & visibilité', subtitle: 'Montrez vos travaux', icon: Camera, fields: [
        { id: 'portfolio_url', label: 'Portfolio ou chaîne principale', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
        { id: 'instagram', label: 'Instagram (optionnel)', placeholder: 'https://instagram.com/...', type: 'text', required: false, icon: Instagram },
        { id: 'linkedin', label: 'LinkedIn (optionnel)', placeholder: 'https://linkedin.com/in/...', type: 'text', required: false, icon: Linkedin },
      ]},
      { title: 'Expérience & audience', subtitle: 'Votre impact', icon: Trophy, fields: [
        { id: 'followers_or_clients', label: 'Audience ou clients', placeholder: 'Ex: 15 000 abonnés...', type: 'text', required: true, icon: Users },
        { id: 'specialties', label: 'Spécialités & services', placeholder: 'Décrivez ce que vous proposez...', type: 'textarea', required: true },
      ]},
    ],
  },
  {
    key: 'certified', label: 'Certifié', icon: BadgeCheck, tier: 'business',
    color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10',
    price: { monthly: 20, yearly: 15.99 },
    desc: 'Expertise reconnue et références solides',
    perks: ['Coche Certifiée dorée', 'Expertise validée', 'Priorité dans les recherches', 'Badge Certifié premium'],
    steps: [
      { title: 'Identité & domaine', subtitle: 'Votre expertise', icon: BadgeCheck, fields: [
        { id: 'full_name', label: 'Nom complet', placeholder: 'Prénom Nom', type: 'text', required: true, icon: User },
        { id: 'domain', label: "Domaine d'expertise", placeholder: 'Cinématographie, marketing...', type: 'text', required: true, icon: Briefcase },
        { id: 'years_xp', label: "Années d'expérience", placeholder: 'Ex: 6', type: 'number', required: true, icon: Calendar },
      ]},
      { title: 'Audience & impact', subtitle: 'Votre portée', icon: Star, fields: [
        { id: 'audience_size', label: 'Taille audience / clients', placeholder: 'Ex: 50 000 abonnés...', type: 'text', required: true, icon: Users },
        { id: 'platforms', label: 'Plateformes actives', placeholder: 'Instagram, YouTube...', type: 'text', required: true, icon: Globe },
        { id: 'portfolio_url', label: 'Portfolio ou chaîne', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
      ]},
      { title: 'Références', subtitle: 'Crédibilité prouvée', icon: Users, fields: [
        { id: 'notable_collaborations', label: 'Collaborations notables', placeholder: 'Marques, médias, institutions...', type: 'textarea', required: true },
        { id: 'awards', label: 'Prix, distinctions (optionnel)', placeholder: 'Récompenses...', type: 'textarea', required: false },
      ]},
    ],
  },
  {
    key: 'official', label: 'Officiel', icon: Building2, tier: 'business',
    color: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/10',
    price: { monthly: 40, yearly: 31.99 },
    desc: 'Pour les entités, marques ou organisations reconnues',
    perks: ['Coche Officielle violette', 'Entité reconnue officiellement', 'Support prioritaire', 'Badge Officiel exclusif'],
    steps: [
      { title: "Identité de l'entité", subtitle: 'Votre organisation', icon: Building2, fields: [
        { id: 'entity_name', label: "Nom légal de l'entité", placeholder: 'Nom exact dans les statuts', type: 'text', required: true, icon: Building2 },
        { id: 'entity_type', label: "Type d'entité", placeholder: 'SA, SAS, Association, Marque...', type: 'text', required: true, icon: FileText },
        { id: 'entity_siret', label: "SIRET / RNA / N° d'enregistrement", placeholder: '123 456 789...', type: 'text', required: true, icon: Hash },
      ]},
      { title: 'Présence officielle', subtitle: 'Vos canaux', icon: Globe, fields: [
        { id: 'entity_website', label: 'Site web officiel', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
        { id: 'kbis_url', label: 'Preuve légale en ligne (Kbis, JO...)', placeholder: 'https://...', type: 'text', required: true, icon: ExternalLink },
        { id: 'entity_social', label: 'Réseau officiel (optionnel)', placeholder: 'Instagram, Facebook...', type: 'text', required: false, icon: Link2 },
      ]},
      { title: 'Votre rôle & usage', subtitle: "Qui êtes-vous ?", icon: User, fields: [
        { id: 'your_role', label: 'Votre poste', placeholder: 'CEO, Fondateur, Responsable com...', type: 'text', required: true, icon: Briefcase },
        { id: 'contact_pro', label: 'Email professionnel', placeholder: 'contact@société.fr', type: 'text', required: true, icon: Phone },
        { id: 'why_official', label: 'Pourquoi le badge Officiel ?', placeholder: 'Communication, visibilité...', type: 'textarea', required: true },
      ]},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const Icon = field.icon;
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="w-3 h-3" />}{field.label}
        {field.required && <span className="text-destructive">*</span>}
      </label>
      {field.type === 'textarea'
        ? <Textarea value={value || ''} onChange={e => onChange(field.id, e.target.value)} placeholder={field.placeholder}
            className="h-24 resize-none bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/40 rounded-xl" />
        : <Input type={field.type} value={value || ''} onChange={e => onChange(field.id, e.target.value)} placeholder={field.placeholder}
            className="bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/40 rounded-xl" />
      }
    </div>
  );
}

function StepDots({ total, current, colorClass }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= current ? colorClass : 'bg-white/10'}`}
          style={{ width: i === current ? 20 : 7 }} />
      ))}
    </div>
  );
}

const ctaBg = (key) => ({
  verified: 'bg-sky-400 hover:bg-sky-300 text-black',
  pro: 'bg-emerald-400 hover:bg-emerald-300 text-black',
  certified: 'bg-amber-400 hover:bg-amber-300 text-black',
  official: 'bg-purple-400 hover:bg-purple-300 text-black',
}[key] || 'bg-primary text-primary-foreground');

// ─── Tier card (plaque) ───────────────────────────────────────────────────────
function TierCard({ tier, billing, selected, onSelect }) {
  const isPremium = tier.id === 'premium';
  const primaryBadge = BADGE_LEVELS.find(b => b.key === tier.badges[0]);
  const secondaryBadge = BADGE_LEVELS.find(b => b.key === tier.badges[1]);
  const isSelected = selected?.id === tier.id;

  const loPrice = billing === 'monthly'
    ? tier.monthlyPrice[tier.badges[0]]
    : tier.yearlyPrice[tier.badges[0]];
  const hiPrice = billing === 'monthly'
    ? tier.monthlyPrice[tier.badges[1]]
    : tier.yearlyPrice[tier.badges[1]];

  const TierIcon = tier.icon;

  return (
    <button
      onClick={() => onSelect(tier)}
      className={`relative text-left flex flex-col p-5 rounded-2xl border-2 transition-all duration-200 w-full h-full
        ${isSelected ? `${tier.borderClass} ${tier.bgClass} shadow-xl ${tier.glowClass}` : 'border-white/10 bg-white/3 hover:border-white/20'}`}
    >
      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-grotesk font-black text-lg ${isSelected ? tier.colorClass : 'text-foreground'}`}>{tier.label}</span>
          {billing === 'yearly' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPremium ? 'text-sky-400 border-sky-400/30 bg-sky-400/10' : 'text-amber-400 border-amber-400/30 bg-amber-400/10'}`}>
              2 mois offerts
            </span>
          )}
        </div>
        <p className="font-inter text-xs text-muted-foreground">{tier.subtitle}</p>
      </div>

      {/* Price range */}
      <div className="flex items-baseline gap-1 mt-2 mb-4">
        <span className="font-grotesk font-black text-3xl text-foreground">{loPrice}€</span>
        <span className="font-inter text-sm text-muted-foreground">– {hiPrice}€ / mois</span>
      </div>

      {/* Badges pills */}
      <div className="flex gap-2 mb-4">
        {tier.badges.map(bKey => {
          const b = BADGE_LEVELS.find(x => x.key === bKey);
          const Icon = b.icon;
          return (
            <div key={bKey} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-grotesk font-semibold ${b.color} ${b.border} ${b.bg}`}>
              <Icon className="w-3 h-3" />{b.label}
            </div>
          );
        })}
      </div>

      {/* Perks */}
      <ul className="space-y-2.5 flex-1">
        {tier.perks.map((p, i) => {
          const Icon = p.icon;
          return (
            <li key={i} className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? tier.colorClass : 'text-muted-foreground/60'}`} />
              <span className="font-inter text-sm text-foreground/80 leading-snug">{p.text}</span>
            </li>
          );
        })}
      </ul>

      {/* Selected indicator */}
      {isSelected && (
        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${isPremium ? 'bg-sky-400' : 'bg-amber-400'}`}>
          <Check className="w-3 h-3 text-black" />
        </div>
      )}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PremiumPage() {
  const [user, setUser] = useState(null);
  const [billing, setBilling] = useState('monthly');
  const [selectedTier, setSelectedTier] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);

  // Form flow
  const [stage, setStage] = useState('list'); // list | chooseBadge | form | payment | success
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async ok => {
      if (!ok) return;
      const me = await base44.auth.me();
      setUser(me);
      if (me?.email) {
        base44.entities.CertificationRequest.filter({ user_email: me.email, status: 'pending' })
          .then(r => { if (r.length > 0) setPendingRequest(r[0]); }).catch(() => {});
      }
    });
  }, []);

  const handleSubscribe = () => {
    if (!selectedTier) return;
    if (!user) { window.location.href = '/login'; return; }
    // If tier has 2 badges, let user pick; if only 1, go straight
    setStage('chooseBadge');
  };

  const handleBadgeSelect = (badge) => {
    setSelectedBadge(badge);
    setFormStep(0);
    setFormData({});
    setStage('form');
  };

  const handleFieldChange = (id, value) => setFormData(p => ({ ...p, [id]: value }));

  const currentStepDef = selectedBadge?.steps?.[formStep];
  const totalSteps = selectedBadge?.steps?.length || 0;
  const isLastStep = formStep === totalSteps - 1;

  const goNext = () => {
    const missing = currentStepDef?.fields.filter(f => f.required && !formData[f.id]?.toString().trim()) || [];
    if (missing.length > 0) { toast.error(`Champs requis : ${missing.map(m => m.label).join(', ')}`); return; }
    if (!isLastStep) { setFormStep(f => f + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const request = await base44.entities.CertificationRequest.create({
        user_email: user.email,
        user_name: user.display_name || user.full_name,
        status: 'pending',
        responses: { ...formData, badge_requested: selectedBadge.key },
        submitted_at: new Date().toISOString(),
      });
      await base44.functions.invoke('sendCertificationConfirmation', { certificationRequestId: request.id }).catch(() => {});
      setStage('payment');
    } catch { toast.error('Une erreur est survenue.'); }
    setLoading(false);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const price = selectedBadge.price[billing];
      const response = await base44.functions.invoke('createCertificationPayment', {
        userEmail: user.email,
        userName: user.display_name || user.full_name,
        amount: Math.round(price * 100),
        badgeLevel: selectedBadge.label,
      });
      if (response.data?.url) window.location.href = response.data.url;
      else setStage('success');
    } catch { toast.error('Erreur de paiement.'); }
    setLoading(false);
  };

  const goBack = () => {
    if (stage === 'payment') setStage('form');
    else if (stage === 'form' && formStep > 0) setFormStep(f => f - 1);
    else if (stage === 'form') setStage('chooseBadge');
    else if (stage === 'chooseBadge') setStage('list');
    else { setStage('list'); setSelectedTier(null); setSelectedBadge(null); }
  };

  const tiersList = [TIERS.premium, TIERS.business];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence mode="wait">

        {/* ── LIST VIEW ───────────────────────────────────────────────── */}
        {stage === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col flex-1">
            <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-8 pb-32">

              {/* Billing toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center p-1 rounded-full bg-white/8 border border-white/10">
                  {['monthly', 'yearly'].map(b => (
                    <button key={b} onClick={() => setBilling(b)}
                      className={`px-6 py-2 rounded-full text-sm font-grotesk font-semibold transition-all ${billing === b ? 'bg-white text-black shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                      {b === 'monthly' ? 'Mensuel' : 'Annuel'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pending warning */}
              {pendingRequest && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-400/30 bg-amber-400/8 mb-6">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="font-inter text-xs text-muted-foreground">
                    Vous avez une demande <span className="font-semibold text-foreground capitalize">{pendingRequest.responses?.badge_requested}</span> en attente. Réponse sous 5 jours ouvrables.
                  </p>
                </div>
              )}

              {/* Two cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {tiersList.map(tier => (
                  <TierCard key={tier.id} tier={tier} billing={billing} selected={selectedTier} onSelect={setSelectedTier} />
                ))}
              </div>

              {/* Business CTA banner */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-grotesk font-bold text-sm text-foreground">Vous avez une entreprise ?</p>
                    <p className="font-inter text-xs text-muted-foreground">
                      Gagnez en crédibilité avec le plan <span className="text-amber-400">Business</span> — certifié ou officiel.
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedTier(TIERS.business)}
                  className="flex-shrink-0 px-4 py-2 rounded-full bg-foreground text-background text-xs font-grotesk font-bold hover:bg-foreground/90 transition-all whitespace-nowrap">
                  Découvrir Business
                </button>
              </div>

              {/* Suprême teaser */}
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-yellow-400/15 bg-yellow-400/3 opacity-50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #f59e0b' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: '#fde68a' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-grotesk font-bold text-sm text-yellow-400">Suprême</p>
                  <p className="font-inter text-xs text-muted-foreground">Sur invitation uniquement — Le badge le plus rare de la plateforme</p>
                </div>
                <span className="font-mono text-[9px] text-yellow-400/50 border border-yellow-400/15 px-2 py-0.5 rounded-full">Sur invitation</span>
              </div>
            </div>

            {/* ── Fixed bottom bar ───────────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm z-40">
              <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
                {/* Left: selected info */}
                <div className="flex-1 min-w-0">
                  {selectedTier ? (
                    <>
                      <p className={`font-grotesk font-bold text-sm ${selectedTier.colorClass}`}>{selectedTier.label}</p>
                      <p className="font-inter text-xs text-muted-foreground">
                        dès {billing === 'monthly' ? selectedTier.monthlyPrice[selectedTier.badges[0]] : selectedTier.yearlyPrice[selectedTier.badges[0]]}€ / mois
                        {billing === 'yearly' && <span className="ml-1 text-emerald-400">· 2 mois offerts</span>}
                      </p>
                    </>
                  ) : (
                    <p className="font-inter text-sm text-muted-foreground">Sélectionnez un plan pour continuer</p>
                  )}
                </div>
                {/* Right: CTA */}
                <button
                  onClick={handleSubscribe}
                  disabled={!selectedTier}
                  className={`px-6 py-3 rounded-full font-grotesk font-black text-sm transition-all ${selectedTier ? (selectedTier.id === 'premium' ? 'bg-sky-400 text-black hover:bg-sky-300' : 'bg-amber-400 text-black hover:bg-amber-300') : 'bg-white/10 text-muted-foreground cursor-not-allowed'}`}>
                  S'abonner et payer
                </button>
              </div>
              {/* Legal */}
              <div className="max-w-3xl mx-auto px-4 pb-3">
                <p className="text-[10px] text-muted-foreground/40 font-inter leading-relaxed">
                  En vous abonnant, vous acceptez nos <Link to="/legal/terms" className="underline hover:text-muted-foreground/70">CGU</Link>. Les abonnements se renouvellent automatiquement jusqu'à annulation. Résiliable à tout moment depuis votre <Link to="/espace-client" className="underline hover:text-muted-foreground/70">espace client</Link>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CHOOSE BADGE ────────────────────────────────────────────── */}
        {stage === 'chooseBadge' && selectedTier && (
          <motion.div key="chooseBadge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto px-4 py-8 w-full">
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
            <h2 className="font-grotesk font-black text-xl text-foreground mb-1">Choisissez votre badge</h2>
            <p className="font-inter text-sm text-muted-foreground mb-6">Plan <span className={`font-semibold ${selectedTier.colorClass}`}>{selectedTier.label}</span> — sélectionnez le niveau qui vous correspond.</p>
            <div className="space-y-3">
              {selectedTier.badges.map(bKey => {
                const badge = BADGE_LEVELS.find(b => b.key === bKey);
                const Icon = badge.icon;
                const price = badge.price[billing];
                return (
                  <button key={bKey} onClick={() => handleBadgeSelect(badge)}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border transition-all group ${badge.border} ${badge.bg} hover:brightness-110`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${badge.border}`}
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Icon className={`w-5 h-5 ${badge.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`font-grotesk font-bold text-sm ${badge.color}`}>{badge.label}</span>
                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badge.color} border-current/40 bg-current/10`}>{price}€/mois</span>
                      </div>
                      <p className="font-inter text-xs text-muted-foreground">{badge.desc}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${badge.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── FORM ────────────────────────────────────────────────────── */}
        {stage === 'form' && selectedBadge && currentStepDef && (
          <motion.div key={`form-${formStep}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="max-w-xl mx-auto px-4 py-8 w-full">
            <div className="flex items-center justify-between mb-6">
              <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
              <StepDots total={totalSteps} current={formStep} colorClass={selectedBadge.color.replace('text-', 'bg-')} />
              <span className="font-mono text-xs text-muted-foreground">{formStep + 1}/{totalSteps}</span>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-6 ${selectedBadge.border} ${selectedBadge.bg}`}>
              {(() => { const Icon = selectedBadge.icon; return (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${selectedBadge.border}`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Icon className={`w-5 h-5 ${selectedBadge.color}`} />
                </div>
              ); })()}
              <div>
                <p className={`font-grotesk font-bold text-sm ${selectedBadge.color}`}>{selectedBadge.label} — Étape {formStep + 1}/{totalSteps}</p>
                <p className="font-inter text-xs text-muted-foreground">{currentStepDef.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              {(() => { const Icon = currentStepDef.icon; return <Icon className={`w-4 h-4 ${selectedBadge.color}`} />; })()}
              <h2 className="font-grotesk font-bold text-lg text-foreground">{currentStepDef.title}</h2>
            </div>

            <div className="space-y-4 mb-8">
              {currentStepDef.fields.map(field => (
                <FieldInput key={field.id} field={field} value={formData[field.id]} onChange={handleFieldChange} />
              ))}
            </div>

            <button onClick={goNext} disabled={loading}
              className={`w-full py-3.5 rounded-xl font-grotesk font-bold text-sm flex items-center justify-center gap-2 transition-all ${ctaBg(selectedBadge.key)}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLastStep ? 'Continuer vers le paiement' : 'Étape suivante'}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </motion.div>
        )}

        {/* ── PAYMENT ─────────────────────────────────────────────────── */}
        {stage === 'payment' && selectedBadge && (
          <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto px-4 py-12 w-full">
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
            <div className={`flex flex-col items-center text-center p-6 rounded-2xl border mb-6 ${selectedBadge.border} ${selectedBadge.bg}`}>
              {(() => { const Icon = selectedBadge.icon; return (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border mb-4 ${selectedBadge.border}`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Icon className={`w-8 h-8 ${selectedBadge.color}`} />
                </div>
              ); })()}
              <p className="font-inter text-xs text-muted-foreground mb-1">Badge sélectionné</p>
              <h2 className={`font-grotesk font-black text-2xl ${selectedBadge.color}`}>{selectedBadge.label}</h2>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="font-grotesk font-black text-4xl text-foreground">{selectedBadge.price[billing]}€</span>
                <span className="font-inter text-sm text-muted-foreground">/ mois</span>
              </div>
              {billing === 'yearly' && <p className="font-mono text-xs text-emerald-400 mt-1">2 mois offerts avec l'abonnement annuel</p>}
              <p className="font-mono text-xs text-muted-foreground mt-1">Résiliable à tout moment</p>
            </div>
            <div className="space-y-2 mb-6">
              {selectedBadge.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className={`w-4 h-4 flex-shrink-0 ${selectedBadge.color}`} />
                  <span className="font-inter text-sm text-muted-foreground">{perk}</span>
                </div>
              ))}
            </div>
            <p className="font-inter text-xs text-muted-foreground text-center mb-5">
              Après paiement, votre dossier sera examiné par notre équipe sous 5 jours ouvrables.
            </p>
            <button onClick={handlePayment} disabled={loading}
              className={`w-full py-4 rounded-xl font-grotesk font-black text-base flex items-center justify-center gap-2 transition-all ${ctaBg(selectedBadge.key)}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              S'abonner — {selectedBadge.price[billing]}€/mois
            </button>
          </motion.div>
        )}

        {/* ── SUCCESS ─────────────────────────────────────────────────── */}
        {stage === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto px-4 py-20 text-center w-full">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-grotesk font-black text-2xl text-foreground mb-2">Dossier envoyé !</h2>
            <p className="font-inter text-sm text-muted-foreground mb-2">
              Votre demande pour le badge <span className={`font-semibold ${selectedBadge?.color}`}>{selectedBadge?.label}</span> a été soumise.
            </p>
            <p className="font-inter text-xs text-muted-foreground mb-8">Réponse sous 5 jours ouvrables.</p>
            <button onClick={() => { setStage('list'); setSelectedTier(null); setSelectedBadge(null); }}
              className="px-8 py-3 rounded-xl font-grotesk font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
              Retour aux badges
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}