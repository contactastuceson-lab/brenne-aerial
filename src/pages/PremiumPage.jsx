import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronRight, ChevronLeft, Award, Shield, TrendingUp,
  MessageCircle, BarChart2, Megaphone, Palette,
  CheckCircle, Gem, BadgeCheck, Building2, ShieldCheck,
  User, Calendar, MapPin, Phone, Globe, Link2, Heart,
  Briefcase, Hash, Camera, Star, Users, Instagram,
  Youtube, Linkedin, ExternalLink, FileText, Loader2, AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// ─── Badge definitions (same as CertificationRequest) ───────────────────────
const BADGE_LEVELS = [
  {
    key: 'verified', label: 'Vérifié', icon: CheckCircle,
    color: 'text-sky-400', colorHex: '#38bdf8',
    border: 'border-sky-400/30', bg: 'bg-sky-400/10',
    price: 5, desc: 'Prouvez que votre identité est réelle',
    perks: ['Coche de vérification bleue', 'Identité confirmée publiquement', 'Réponses boostées dans le feed', 'Badge Vérifié sur votre profil'],
    steps: [
      { title: 'Identité', subtitle: 'Confirmez qui vous êtes', icon: User, fields: [
        { id: 'full_name', label: 'Nom complet réel', placeholder: 'Prénom Nom', type: 'text', required: true, icon: User },
        { id: 'birth_year', label: 'Année de naissance', placeholder: 'Ex: 1995', type: 'number', required: true, icon: Calendar },
        { id: 'city', label: 'Ville de résidence', placeholder: 'Ex: Paris', type: 'text', required: true, icon: MapPin },
        { id: 'phone', label: 'Numéro de téléphone (optionnel)', placeholder: '+33 6 00 00 00 00', type: 'text', required: false, icon: Phone },
      ]},
      { title: 'Présence en ligne', subtitle: 'Vos profils publics', icon: Globe, fields: [
        { id: 'social_main', label: 'Réseau social principal', placeholder: 'https://instagram.com/...', type: 'text', required: true, icon: Link2 },
        { id: 'social_secondary', label: 'Second réseau (optionnel)', placeholder: 'LinkedIn, TikTok, Twitter...', type: 'text', required: false, icon: Link2 },
        { id: 'website', label: 'Site web (optionnel)', placeholder: 'https://...', type: 'text', required: false, icon: Globe },
      ]},
      { title: 'Motivation', subtitle: 'Expliquez votre démarche', icon: Heart, fields: [
        { id: 'activity', label: 'Votre activité / domaine', placeholder: 'Influenceur, créateur, artiste, entrepreneur...', type: 'text', required: true, icon: Briefcase },
        { id: 'why_verified', label: 'Pourquoi souhaitez-vous être vérifié ?', placeholder: 'Décrivez l\'utilité de ce badge...', type: 'textarea', required: true },
      ]},
    ],
  },
  {
    key: 'pro', label: 'Pro', icon: Gem,
    color: 'text-emerald-400', colorHex: '#34d399',
    border: 'border-emerald-400/30', bg: 'bg-emerald-400/10',
    price: 10, desc: 'Montrez que vous exercez à titre professionnel',
    perks: ['Coche Pro verte', 'Profil professionnel mis en avant', 'Statistiques avancées', 'Badge Pro animé sur votre profil'],
    steps: [
      { title: 'Identité professionnelle', subtitle: 'Vos informations en tant que pro', icon: Briefcase, fields: [
        { id: 'pro_name', label: 'Nom / Nom commercial', placeholder: 'Votre nom ou structure', type: 'text', required: true, icon: User },
        { id: 'activity_type', label: 'Secteur d\'activité', placeholder: 'Photographie, marketing, drone...', type: 'text', required: true, icon: Briefcase },
        { id: 'siret', label: 'SIRET / SIREN (si applicable)', placeholder: '123 456 789', type: 'text', required: false, icon: Hash },
        { id: 'city', label: 'Ville d\'activité principale', placeholder: 'Ex: Lyon', type: 'text', required: true, icon: MapPin },
        { id: 'activity_since', label: 'Actif depuis (année)', placeholder: 'Ex: 2020', type: 'number', required: true, icon: Calendar },
      ]},
      { title: 'Portfolio & visibilité', subtitle: 'Montrez vos travaux', icon: Camera, fields: [
        { id: 'portfolio_url', label: 'Site web, portfolio ou chaîne principale', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
        { id: 'instagram', label: 'Instagram (optionnel)', placeholder: 'https://instagram.com/...', type: 'text', required: false, icon: Instagram },
        { id: 'linkedin', label: 'LinkedIn (optionnel)', placeholder: 'https://linkedin.com/in/...', type: 'text', required: false, icon: Linkedin },
      ]},
      { title: 'Expérience & audience', subtitle: 'Votre parcours et votre impact', icon: Trophy, fields: [
        { id: 'followers_or_clients', label: 'Audience ou nombre de clients', placeholder: 'Ex: 15 000 abonnés Instagram...', type: 'text', required: true, icon: Users },
        { id: 'specialties', label: 'Spécialités & services proposés', placeholder: 'Décrivez ce que vous proposez...', type: 'textarea', required: true },
      ]},
    ],
  },
  {
    key: 'certified', label: 'Certifié', icon: BadgeCheck,
    color: 'text-amber-400', colorHex: '#f59e0b',
    border: 'border-amber-400/30', bg: 'bg-amber-400/10',
    price: 20, desc: 'Expertise reconnue et références solides',
    popular: true,
    perks: ['Coche Certifiée dorée', 'Expertise validée par notre équipe', 'Priorité dans les recherches', 'Badge Certifié premium'],
    steps: [
      { title: 'Identité & domaine', subtitle: 'Votre expertise principale', icon: BadgeCheck, fields: [
        { id: 'full_name', label: 'Nom complet', placeholder: 'Prénom Nom', type: 'text', required: true, icon: User },
        { id: 'domain', label: 'Domaine d\'expertise principal', placeholder: 'Cinématographie, marketing digital...', type: 'text', required: true, icon: Briefcase },
        { id: 'years_xp', label: 'Années d\'expérience', placeholder: 'Ex: 6', type: 'number', required: true, icon: Calendar },
      ]},
      { title: 'Audience & impact', subtitle: 'Votre réputation et portée', icon: Star, fields: [
        { id: 'audience_size', label: 'Taille audience / base clients', placeholder: 'Ex: 50 000 abonnés...', type: 'text', required: true, icon: Users },
        { id: 'platforms', label: 'Plateformes actives', placeholder: 'Instagram, YouTube, LinkedIn...', type: 'text', required: true, icon: Globe },
        { id: 'portfolio_url', label: 'Portfolio ou chaîne principale', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
      ]},
      { title: 'Références', subtitle: 'Votre crédibilité prouvée', icon: Users, fields: [
        { id: 'notable_collaborations', label: 'Collaborations ou projets notables', placeholder: 'Marques, médias, institutions...', type: 'textarea', required: true },
        { id: 'awards', label: 'Prix, distinctions (optionnel)', placeholder: 'Récompenses, reconnaissances...', type: 'textarea', required: false },
      ]},
    ],
  },
  {
    key: 'official', label: 'Officiel', icon: Building2,
    color: 'text-purple-400', colorHex: '#a855f7',
    border: 'border-purple-400/30', bg: 'bg-purple-400/10',
    price: 40, desc: 'Pour les entités, marques ou organisations reconnues',
    perks: ['Coche Officielle violette', 'Entité reconnue officiellement', 'Support prioritaire dédié', 'Badge Officiel exclusif'],
    steps: [
      { title: 'Identité de l\'entité', subtitle: 'Votre organisation', icon: Building2, fields: [
        { id: 'entity_name', label: 'Nom légal de l\'entité', placeholder: 'Nom exact comme dans les statuts', type: 'text', required: true, icon: Building2 },
        { id: 'entity_type', label: 'Type d\'entité', placeholder: 'SA, SAS, Association, Média, Marque...', type: 'text', required: true, icon: FileText },
        { id: 'entity_siret', label: 'SIRET / RNA / N° d\'enregistrement', placeholder: '123 456 789...', type: 'text', required: true, icon: Hash },
      ]},
      { title: 'Présence officielle', subtitle: 'Vos canaux de communication', icon: Globe, fields: [
        { id: 'entity_website', label: 'Site web officiel', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
        { id: 'kbis_url', label: 'Preuve légale en ligne (Kbis, JO...)', placeholder: 'https://...', type: 'text', required: true, icon: ExternalLink },
        { id: 'entity_social', label: 'Réseau officiel (optionnel)', placeholder: 'Instagram, Facebook...', type: 'text', required: false, icon: Link2 },
      ]},
      { title: 'Votre rôle & usage', subtitle: 'Qui êtes-vous dans cette entité ?', icon: User, fields: [
        { id: 'your_role', label: 'Votre poste / fonction', placeholder: 'CEO, Fondateur, Responsable com...', type: 'text', required: true, icon: Briefcase },
        { id: 'contact_pro', label: 'Email professionnel', placeholder: 'contact@société.fr', type: 'text', required: true, icon: Phone },
        { id: 'why_official', label: 'Pourquoi le badge Officiel ?', placeholder: 'Communication, visibilité institutionnelle...', type: 'textarea', required: true },
      ]},
    ],
  },
  {
    key: 'supreme', label: 'Suprême', icon: ShieldCheck,
    color: 'text-yellow-400', colorHex: '#eab308',
    border: 'border-yellow-400/40', bg: 'bg-yellow-400/10',
    price: null, desc: 'Sur invitation uniquement — Le badge le plus rare',
    locked: true,
    perks: ['Badge le plus rare de la plateforme', 'Sur invitation de l\'équipe EZA uniquement', 'Tous les avantages des niveaux inférieurs'],
    steps: [],
  },
];

// placeholder Trophy import fix
import { Trophy } from 'lucide-react';

const PERKS_GLOBAL = [
  { icon: Shield, label: 'Identité vérifiée', desc: 'Badge exclusif sur votre profil' },
  { icon: TrendingUp, label: 'Boost de visibilité', desc: 'Publications prioritaires dans le feed' },
  { icon: BarChart2, label: 'Statistiques', desc: 'Performances en temps réel' },
  { icon: MessageCircle, label: 'Réponses boostées', desc: 'Remontez dans les discussions' },
  { icon: Megaphone, label: 'Mise en avant', desc: 'Apparaissez dans Découverte' },
  { icon: Palette, label: 'Badge animé', desc: 'Profil personnalisé selon votre niveau' },
];

// ─── Field input ─────────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const Icon = field.icon;
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="w-3 h-3" />}
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </label>
      {field.type === 'textarea' ? (
        <Textarea
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="h-24 resize-none bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/40 focus:border-white/25 rounded-xl"
        />
      ) : (
        <Input
          type={field.type}
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/40 focus:border-white/25 rounded-xl"
        />
      )}
    </div>
  );
}

// ─── Step progress dots ───────────────────────────────────────────────────────
function StepDots({ total, current, color }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i < current + 1 ? color.replace('text-', 'bg-') : 'bg-white/10'}`}
          style={{ width: i === current ? 24 : 8 }} />
      ))}
    </div>
  );
}

// ─── Badge selection card ─────────────────────────────────────────────────────
function BadgeCard({ level, onSelect, badgeCounts }) {
  const Icon = level.icon;
  const count = badgeCounts[level.key] || 0;

  return (
    <motion.button
      whileHover={!level.locked ? { scale: 1.015 } : {}}
      whileTap={!level.locked ? { scale: 0.99 } : {}}
      onClick={() => !level.locked && onSelect(level)}
      disabled={level.locked}
      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 group ${
        level.locked
          ? 'opacity-40 cursor-not-allowed border-white/10 bg-white/2'
          : `${level.border} ${level.bg} hover:brightness-110 cursor-pointer`
      } ${level.popular ? 'ring-1 ring-amber-400/40' : ''}`}
    >
      {level.popular && (
        <div className="inline-block mb-3 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/15 border border-amber-400/30">
          ★ Populaire
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${level.border}`}
            style={level.key === 'supreme'
              ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #f59e0b' }
              : { background: 'rgba(255,255,255,0.05)' }}>
            <Icon className={`w-5 h-5 ${level.color}`} style={level.key === 'supreme' ? { color: '#fde68a' } : {}} />
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`font-grotesk font-bold text-base ${level.color}`}>{level.label}</span>
              <span className="font-mono text-[9px] bg-white/6 border border-white/10 px-1.5 py-0.5 rounded-full text-muted-foreground">
                {count} {count <= 1 ? 'profil' : 'profils'}
              </span>
              {level.price && (
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${level.color} border-current/40 bg-current/10`}>
                  {level.price}€/mois
                </span>
              )}
            </div>
            <p className="font-inter text-xs text-muted-foreground leading-snug">{level.desc}</p>
          </div>
        </div>
        {!level.locked && (
          <ChevronRight className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 ${level.color} opacity-60`} />
        )}
      </div>
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PremiumPage() {
  const [user, setUser] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({});
  const [pendingRequest, setPendingRequest] = useState(null);

  // flow state: 'list' | 'form' | 'payment' | 'success'
  const [stage, setStage] = useState('list');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      if (!ok) return;
      const me = await base44.auth.me();
      setUser(me);
      if (me?.email) {
        base44.entities.CertificationRequest.filter({ user_email: me.email, status: 'pending' })
          .then(r => { if (r.length > 0) setPendingRequest(r[0]); })
          .catch(() => {});
      }
    });

    base44.entities.User.list().then(users => {
      const counts = { verified: 0, pro: 0, certified: 0, official: 0, supreme: 0 };
      users.forEach(u => {
        ['verified', 'pro', 'certified', 'official', 'supreme'].forEach(k => {
          if (u.verifications?.includes(k)) counts[k]++;
        });
      });
      setBadgeCounts(counts);
    }).catch(() => {});
  }, []);

  const handleSelect = (level) => {
    if (!user) { window.location.href = '/login'; return; }
    setSelectedLevel(level);
    setFormStep(0);
    setFormData({});
    setStage('form');
  };

  const handleFieldChange = (id, value) => setFormData(p => ({ ...p, [id]: value }));

  const currentStepDef = selectedLevel?.steps?.[formStep];
  const totalSteps = selectedLevel?.steps?.length || 0;
  const isLastStep = formStep === totalSteps - 1;

  const goNext = () => {
    const missing = currentStepDef?.fields.filter(f => f.required && !formData[f.id]?.toString().trim()) || [];
    if (missing.length > 0) {
      toast.error(`Champs requis : ${missing.map(m => m.label).join(', ')}`);
      return;
    }
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
        responses: { ...formData, badge_requested: selectedLevel.key },
        submitted_at: new Date().toISOString(),
      });
      await base44.functions.invoke('sendCertificationConfirmation', { certificationRequestId: request.id }).catch(() => {});
      if (selectedLevel.price > 0) setStage('payment');
      else setStage('success');
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCertificationPayment', {
        userEmail: user.email,
        userName: user.display_name || user.full_name,
        amount: selectedLevel.price * 100,
        badgeLevel: selectedLevel.label,
      });
      if (response.data?.url) window.location.href = response.data.url;
      else setStage('success');
    } catch {
      toast.error('Erreur de paiement. Veuillez réessayer.');
    }
    setLoading(false);
  };

  const goBack = () => {
    if (stage === 'payment') { setStage('form'); setFormStep(totalSteps - 1); }
    else if (stage === 'form' && formStep > 0) setFormStep(f => f - 1);
    else { setStage('list'); setSelectedLevel(null); setFormData({}); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">

        {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
        {stage === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-border">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] opacity-10 rounded-full"
                  style={{ background: 'radial-gradient(ellipse, #a855f7 0%, transparent 70%)' }} />
              </div>
              <div className="relative max-w-3xl mx-auto px-4 py-12 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-primary/30 bg-primary/10">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h1 className="font-grotesk font-black text-3xl md:text-4xl text-foreground mb-2">
                  Demande de <span className="text-primary">vérification</span>
                </h1>
                <p className="font-inter text-sm text-muted-foreground max-w-md mx-auto">
                  Sélectionnez le niveau correspondant à votre profil. Chaque niveau comporte plusieurs étapes de validation.
                </p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
              {/* Pending warning */}
              {pendingRequest && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-400/30 bg-amber-400/8">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-grotesk font-semibold text-sm text-amber-400">Demande en cours</p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">
                      Vous avez déjà une demande <span className="font-medium text-foreground capitalize">{pendingRequest.responses?.badge_requested}</span> en attente d'examen. Réponse sous 5 jours ouvrables.
                    </p>
                  </div>
                </div>
              )}

              {/* Badge list */}
              <div className="space-y-3">
                {BADGE_LEVELS.map(level => (
                  <BadgeCard key={level.key} level={level} onSelect={handleSelect} badgeCounts={badgeCounts} />
                ))}
              </div>

              {/* Why verify */}
              <div>
                <p className="font-grotesk font-bold text-sm text-foreground mb-3">Pourquoi se faire vérifier ?</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {PERKS_GLOBAL.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="font-grotesk font-semibold text-xs text-foreground">{p.label}</p>
                          <p className="font-inter text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-center text-[11px] text-muted-foreground/50 font-inter leading-relaxed">
                Les abonnements sont renouvelés automatiquement. Annulable à tout moment depuis votre{' '}
                <Link to="/espace-client" className="underline hover:text-muted-foreground/80">espace client</Link>. En vous abonnant, vous acceptez nos{' '}
                <Link to="/legal/terms" className="underline hover:text-muted-foreground/80">CGU</Link>.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── FORM VIEW ─────────────────────────────────────────────────── */}
        {stage === 'form' && selectedLevel && currentStepDef && (
          <motion.div key={`form-${formStep}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="max-w-xl mx-auto px-4 py-8">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
              <StepDots total={totalSteps} current={formStep} color={selectedLevel.color} />
              <span className="font-mono text-xs text-muted-foreground">{formStep + 1}/{totalSteps}</span>
            </div>

            {/* Badge header */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-6 ${selectedLevel.border} ${selectedLevel.bg}`}>
              {(() => { const Icon = selectedLevel.icon; return (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${selectedLevel.border}`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Icon className={`w-5 h-5 ${selectedLevel.color}`} />
                </div>
              ); })()}
              <div className="flex-1 min-w-0">
                <p className={`font-grotesk font-bold text-sm ${selectedLevel.color}`}>
                  {selectedLevel.label} — Étape {formStep + 1}/{totalSteps}
                </p>
                <p className="font-inter text-xs text-muted-foreground">{currentStepDef.subtitle}</p>
              </div>
            </div>

            {/* Step title */}
            <div className="flex items-center gap-2 mb-5">
              {(() => { const Icon = currentStepDef.icon; return <Icon className={`w-4 h-4 ${selectedLevel.color}`} />; })()}
              <h2 className="font-grotesk font-bold text-lg text-foreground">{currentStepDef.title}</h2>
            </div>

            {/* Fields */}
            <div className="space-y-4 mb-8">
              {currentStepDef.fields.map(field => (
                <FieldInput key={field.id} field={field} value={formData[field.id]} onChange={handleFieldChange} />
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={goNext}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-grotesk font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                selectedLevel.key === 'verified' ? 'bg-sky-400 text-black hover:bg-sky-300' :
                selectedLevel.key === 'pro' ? 'bg-emerald-400 text-black hover:bg-emerald-300' :
                selectedLevel.key === 'certified' ? 'bg-amber-400 text-black hover:bg-amber-300' :
                'bg-purple-400 text-black hover:bg-purple-300'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLastStep
                ? selectedLevel.price > 0 ? 'Continuer vers le paiement' : 'Soumettre le dossier'
                : 'Étape suivante'
              }
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </motion.div>
        )}

        {/* ── PAYMENT VIEW ──────────────────────────────────────────────── */}
        {stage === 'payment' && selectedLevel && (
          <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto px-4 py-12">

            <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>

            {/* Badge recap */}
            <div className={`flex flex-col items-center text-center p-6 rounded-2xl border mb-6 ${selectedLevel.border} ${selectedLevel.bg}`}>
              {(() => { const Icon = selectedLevel.icon; return (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border mb-4 ${selectedLevel.border}`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Icon className={`w-8 h-8 ${selectedLevel.color}`} />
                </div>
              ); })()}
              <p className="font-inter text-xs text-muted-foreground mb-1">Badge sélectionné</p>
              <h2 className={`font-grotesk font-black text-2xl ${selectedLevel.color}`}>{selectedLevel.label}</h2>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="font-grotesk font-black text-4xl text-foreground">{selectedLevel.price}€</span>
                <span className="font-inter text-sm text-muted-foreground">/ mois</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-1">Abonnement mensuel — résiliable à tout moment</p>
            </div>

            {/* Perks recap */}
            <div className="space-y-2 mb-6">
              {selectedLevel.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className={`w-4 h-4 flex-shrink-0 ${selectedLevel.color}`} />
                  <span className="font-inter text-sm text-muted-foreground">{perk}</span>
                </div>
              ))}
            </div>

            <p className="font-inter text-xs text-muted-foreground text-center mb-5">
              Après paiement, votre dossier sera examiné par notre équipe sous 5 jours ouvrables.
            </p>

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-grotesk font-black text-base flex items-center justify-center gap-2 transition-all ${
                selectedLevel.key === 'verified' ? 'bg-sky-400 text-black hover:bg-sky-300' :
                selectedLevel.key === 'pro' ? 'bg-emerald-400 text-black hover:bg-emerald-300' :
                selectedLevel.key === 'certified' ? 'bg-amber-400 text-black hover:bg-amber-300' :
                'bg-purple-400 text-black hover:bg-purple-300'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              S'abonner — {selectedLevel.price}€/mois
            </button>
          </motion.div>
        )}

        {/* ── SUCCESS VIEW ──────────────────────────────────────────────── */}
        {stage === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-grotesk font-black text-2xl text-foreground mb-2">Dossier envoyé !</h2>
            <p className="font-inter text-sm text-muted-foreground mb-2">
              Votre demande pour le badge{' '}
              <span className={`font-semibold ${selectedLevel?.color}`}>{selectedLevel?.label}</span>{' '}
              a bien été soumise.
            </p>
            <p className="font-inter text-xs text-muted-foreground mb-8">Réponse sous 5 jours ouvrables.</p>
            <button
              onClick={() => setStage('list')}
              className="px-8 py-3 rounded-xl font-grotesk font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Retour aux badges
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}