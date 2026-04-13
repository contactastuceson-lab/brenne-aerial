import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Check, Award, AlertCircle, ChevronRight, ChevronLeft,
  CheckCircle, BadgeCheck, Building2, Gem, ShieldCheck,
  Link2, FileText, Users, Star, Camera, Globe, User, Phone,
  MapPin, Briefcase, BookOpen, Trophy, Heart, Linkedin, Instagram,
  Youtube, ExternalLink, Upload, Calendar, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ── Badge levels with multi-step forms ──────────────────────────────────────
const BADGE_LEVELS = [
  {
    key: 'verified',
    label: 'Vérifié',
    icon: CheckCircle,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    glow: 'shadow-sky-400/20',
    price: 0,
    desc: 'Prouvez que votre identité est réelle',
    steps: [
      {
        title: 'Identité',
        subtitle: 'Confirmez qui vous êtes',
        icon: User,
        fields: [
          { id: 'full_name', label: 'Nom complet réel', placeholder: 'Prénom Nom', type: 'text', required: true, icon: User },
          { id: 'birth_year', label: 'Année de naissance', placeholder: 'Ex: 1995', type: 'number', required: true, icon: Calendar },
          { id: 'city', label: 'Ville de résidence', placeholder: 'Ex: Paris', type: 'text', required: true, icon: MapPin },
          { id: 'phone', label: 'Numéro de téléphone', placeholder: '+33 6 00 00 00 00', type: 'text', required: false, icon: Phone },
        ],
      },
      {
        title: 'Présence en ligne',
        subtitle: 'Vos profils publics',
        icon: Globe,
        fields: [
          { id: 'social_main', label: 'Réseau social principal (profil public)', placeholder: 'https://instagram.com/...', type: 'text', required: true, icon: Link2 },
          { id: 'social_secondary', label: 'Second réseau (optionnel)', placeholder: 'LinkedIn, TikTok, Twitter...', type: 'text', required: false, icon: Link2 },
          { id: 'website', label: 'Site web personnel (optionnel)', placeholder: 'https://...', type: 'text', required: false, icon: Globe },
        ],
      },
      {
        title: 'Motivation',
        subtitle: 'Expliquez votre démarche',
        icon: Heart,
        fields: [
          { id: 'why_verified', label: 'Pourquoi souhaitez-vous être vérifié ?', placeholder: 'Décrivez l\'utilité de ce badge pour vous et votre activité sur la plateforme...', type: 'textarea', required: true },
          { id: 'community_contribution', label: 'Comment contribuez-vous à la communauté ?', placeholder: 'Partagez du contenu, aidez d\'autres membres, organisez des évènements...', type: 'textarea', required: false },
        ],
      },
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    icon: Gem,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    glow: 'shadow-emerald-400/20',
    price: 500,
    desc: 'Montrez que vous exercez à titre professionnel',
    steps: [
      {
        title: 'Identité professionnelle',
        subtitle: 'Vos informations en tant que pro',
        icon: Briefcase,
        fields: [
          { id: 'pro_name', label: 'Nom / Nom commercial', placeholder: 'Votre nom ou celui de votre structure', type: 'text', required: true, icon: User },
          { id: 'siret', label: 'Numéro SIRET ou SIREN', placeholder: '123 456 789 00010', type: 'text', required: true, icon: Hash },
          { id: 'city', label: 'Ville d\'activité principale', placeholder: 'Ex: Bordeaux', type: 'text', required: true, icon: MapPin },
          { id: 'activity_since', label: 'Actif depuis (année)', placeholder: 'Ex: 2019', type: 'number', required: true, icon: Calendar },
        ],
      },
      {
        title: 'Portfolio & références',
        subtitle: 'Montrez vos travaux',
        icon: Camera,
        fields: [
          { id: 'portfolio_url', label: 'Site web ou portfolio principal', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
          { id: 'instagram', label: 'Instagram professionnel', placeholder: 'https://instagram.com/...', type: 'text', required: false, icon: Instagram },
          { id: 'youtube', label: 'Chaîne YouTube / showreel', placeholder: 'https://youtube.com/...', type: 'text', required: false, icon: Youtube },
          { id: 'linkedin', label: 'Profil LinkedIn', placeholder: 'https://linkedin.com/in/...', type: 'text', required: false, icon: Linkedin },
        ],
      },
      {
        title: 'Expérience',
        subtitle: 'Votre parcours professionnel',
        icon: Trophy,
        fields: [
          { id: 'projects_count', label: 'Nombre de projets réalisés', placeholder: 'Ex: 60', type: 'number', required: true, icon: Star },
          { id: 'specialties', label: 'Spécialités & services proposés', placeholder: 'Vidéo événementiel, mariage, immobilier, cartographie...', type: 'textarea', required: true },
          { id: 'notable_clients', label: 'Clients ou projets notables', placeholder: 'Marques, institutions, événements connus...', type: 'textarea', required: false },
          { id: 'revenue_range', label: 'Chiffre d\'affaires annuel estimé (€)', placeholder: 'Ex: 15000', type: 'number', required: false, icon: Briefcase },
        ],
      },
      {
        title: 'Motivation',
        subtitle: 'Pourquoi le badge Pro ?',
        icon: Heart,
        fields: [
          { id: 'why_pro', label: 'Pourquoi souhaitez-vous le badge Pro ?', placeholder: 'Développer votre visibilité, crédibiliser votre offre, accéder à des fonctionnalités avancées...', type: 'textarea', required: true },
          { id: 'goals', label: 'Quels sont vos objectifs sur la plateforme ?', placeholder: 'Trouver des clients, partager votre expertise, collaborer avec d\'autres pros...', type: 'textarea', required: false },
        ],
      },
    ],
  },
  {
    key: 'certified',
    label: 'Certifié',
    icon: BadgeCheck,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    glow: 'shadow-amber-400/20',
    price: 1000,
    desc: 'Certifications officielles et expertise reconnue',
    steps: [
      {
        title: 'Certifications officielles',
        subtitle: 'Vos accréditations DGAC et autres',
        icon: BadgeCheck,
        fields: [
          { id: 'dgac_operator_number', label: 'Numéro de télépilote DGAC', placeholder: 'FR-DGAC-...', type: 'text', required: true, icon: Hash },
          { id: 'dgac_categories', label: 'Catégories obtenues', placeholder: 'A1, A2, A3, STS-FR-01...', type: 'text', required: true, icon: FileText },
          { id: 'other_certs', label: 'Autres certifications (optionnel)', placeholder: 'CEAS, formation spécialisée, certif étrangère...', type: 'text', required: false, icon: Award },
          { id: 'insurance', label: 'Assurance RC Pro (assureur + n° contrat)', placeholder: 'Ex: AXA - Contrat N°123456', type: 'text', required: true, icon: FileText },
        ],
      },
      {
        title: 'Expérience terrain',
        subtitle: 'Votre vécu de pilote pro',
        icon: Trophy,
        fields: [
          { id: 'years_xp', label: 'Années d\'expérience en pilotage pro', placeholder: 'Ex: 5', type: 'number', required: true, icon: Calendar },
          { id: 'flight_hours', label: 'Heures de vol estimées', placeholder: 'Ex: 300', type: 'number', required: false, icon: Star },
          { id: 'drone_models', label: 'Drones utilisés professionnellement', placeholder: 'DJI Mavic 3, Matrice 300, FPV custom...', type: 'textarea', required: true },
          { id: 'missions_types', label: 'Types de missions réalisées', placeholder: 'Inspection, cartographie, cinématique, événementiel...', type: 'textarea', required: true },
        ],
      },
      {
        title: 'Portfolio & visibilité',
        subtitle: 'Vos travaux et présence digitale',
        icon: Camera,
        fields: [
          { id: 'portfolio_url', label: 'Portfolio ou site professionnel', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
          { id: 'linkedin', label: 'LinkedIn professionnel', placeholder: 'https://linkedin.com/in/...', type: 'text', required: false, icon: Linkedin },
          { id: 'youtube_showreel', label: 'Showreel YouTube', placeholder: 'https://youtube.com/...', type: 'text', required: false, icon: Youtube },
          { id: 'press_or_media', label: 'Apparitions presse / médias (URL)', placeholder: 'Articles, reportages, interviews...', type: 'text', required: false, icon: ExternalLink },
        ],
      },
      {
        title: 'Références clients',
        subtitle: 'Votre crédibilité sur le terrain',
        icon: Users,
        fields: [
          { id: 'notable_clients', label: 'Clients ou projets notables', placeholder: 'Marques, communes, institutions, événements...', type: 'textarea', required: true },
          { id: 'testimonials', label: 'Liens vers avis / témoignages clients', placeholder: 'Google, réseaux, mails (copié/collé accepté)...', type: 'textarea', required: false },
        ],
      },
      {
        title: 'Motivation',
        subtitle: 'Votre vision et objectifs',
        icon: Heart,
        fields: [
          { id: 'why_certified', label: 'Pourquoi souhaitez-vous le badge Certifié ?', placeholder: 'Valoriser votre expertise, vous démarquer, rassurer vos clients...', type: 'textarea', required: true },
          { id: 'community_value', label: 'Quelle valeur apportez-vous à la communauté Brenne Aerial ?', placeholder: 'Partage de connaissances, mentorat, contenu de qualité...', type: 'textarea', required: true },
        ],
      },
    ],
  },
  {
    key: 'official',
    label: 'Officiel',
    icon: Building2,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    glow: 'shadow-purple-400/20',
    price: 0,
    desc: 'Pour les entités, marques ou organisations reconnues',
    steps: [
      {
        title: 'Identité de l\'entité',
        subtitle: 'Votre organisation',
        icon: Building2,
        fields: [
          { id: 'entity_name', label: 'Nom légal de l\'entité', placeholder: 'Nom exact comme dans les statuts', type: 'text', required: true, icon: Building2 },
          { id: 'entity_type', label: 'Type d\'entité', placeholder: 'SA, SAS, Association loi 1901, Commune, Institution...', type: 'text', required: true, icon: FileText },
          { id: 'entity_siret', label: 'SIRET / RNA / N° d\'enregistrement', placeholder: '123 456 789...', type: 'text', required: true, icon: Hash },
          { id: 'entity_founded', label: 'Année de création', placeholder: 'Ex: 2015', type: 'number', required: false, icon: Calendar },
        ],
      },
      {
        title: 'Présence officielle',
        subtitle: 'Vos canaux de communication',
        icon: Globe,
        fields: [
          { id: 'entity_website', label: 'Site web officiel', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
          { id: 'entity_linkedin', label: 'Page LinkedIn de l\'entité', placeholder: 'https://linkedin.com/company/...', type: 'text', required: false, icon: Linkedin },
          { id: 'entity_social', label: 'Autre réseau officiel', placeholder: 'Instagram, Facebook, Twitter...', type: 'text', required: false, icon: Link2 },
          { id: 'kbis_url', label: 'Lien Kbis / preuve légale en ligne', placeholder: 'Infogreffe, Journal officiel, page À propos...', type: 'text', required: true, icon: ExternalLink },
        ],
      },
      {
        title: 'Votre rôle',
        subtitle: 'Qui êtes-vous dans cette entité ?',
        icon: User,
        fields: [
          { id: 'your_role', label: 'Votre poste / fonction', placeholder: 'CEO, Responsable communication, Directeur...', type: 'text', required: true, icon: Briefcase },
          { id: 'contact_pro', label: 'Email professionnel de contact', placeholder: 'contact@société.fr', type: 'text', required: true, icon: Phone },
          { id: 'team_size', label: 'Taille de l\'équipe / organisation', placeholder: 'Ex: 12 personnes', type: 'text', required: false, icon: Users },
        ],
      },
      {
        title: 'Usage & motivation',
        subtitle: 'Pourquoi Brenne Aerial ?',
        icon: Heart,
        fields: [
          { id: 'why_official', label: 'Pourquoi souhaitez-vous le badge Officiel ?', placeholder: 'Communication de l\'entité, recherche de prestataires, visibilité institutionnelle...', type: 'textarea', required: true },
          { id: 'use_cases', label: 'Comment comptez-vous utiliser la plateforme ?', placeholder: 'Publier des appels à prestataires, partager des projets, recruter des pilotes...', type: 'textarea', required: true },
          { id: 'partnership', label: 'Seriez-vous ouvert à un partenariat officiel avec Brenne Aerial ?', placeholder: 'Co-branding, événements, contenu co-produit...', type: 'textarea', required: false },
        ],
      },
    ],
  },
  {
    key: 'supreme',
    label: 'Suprême',
    icon: ShieldCheck,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/40',
    price: 0,
    desc: 'Sur invitation uniquement — Le badge le plus rare',
    locked: true,
    steps: [],
  },
];

// ── Field renderer ────────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const Icon = field.icon;
  return (
    <div>
      <label className="font-inter text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
        <span>{field.label}</span>
        {field.required && <span className="text-destructive">*</span>}
      </label>
      {field.type === 'textarea' ? (
        <Textarea
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="bg-secondary border-border resize-none h-24 font-inter text-sm"
        />
      ) : (
        <Input
          type={field.type}
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="bg-secondary border-border font-inter text-sm"
        />
      )}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total, color }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < current ? color.replace('text-', 'bg-') : 'bg-secondary'}`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CertificationRequest({ onClose, user }) {
  const [stage, setStage] = useState('choose'); // choose | form | payment | success
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [certEnabled, setCertEnabled] = useState(true);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'certifications_enabled' }).then(s => {
      if (s.length > 0) setCertEnabled(s[0].value === 'true');
    }).catch(() => {});
  }, []);

  const handleFieldChange = (id, value) => setFormData(p => ({ ...p, [id]: value }));

  const currentStepDef = selectedLevel?.steps?.[formStep];

  const goNext = () => {
    if (!currentStepDef) return;
    const missing = currentStepDef.fields.filter(f => f.required && !formData[f.id]?.toString().trim());
    if (missing.length > 0) {
      toast.error(`Champs requis : ${missing.map(m => m.label).join(', ')}`);
      return;
    }
    if (formStep < selectedLevel.steps.length - 1) {
      setFormStep(f => f + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const request = await base44.entities.CertificationRequest.create({
      user_email: user.email,
      user_name: user.full_name,
      status: 'pending',
      responses: { ...formData, badge_requested: selectedLevel.key },
      submitted_at: new Date().toISOString(),
    });
    await base44.functions.invoke('sendCertificationConfirmation', { certificationRequestId: request.id }).catch(() => {});
    setLoading(false);
    if (selectedLevel.price > 0) setStage('payment');
    else setStage('success');
  };

  const handlePayment = async () => {
    setLoading(true);
    const response = await base44.functions.invoke('createCertificationPayment', {
      userEmail: user.email,
      userName: user.full_name,
      amount: selectedLevel.price,
    });
    if (response.data?.url) window.location.href = response.data.url;
    else setStage('success');
    setLoading(false);
  };

  const totalSteps = selectedLevel?.steps?.length || 0;
  const isLastStep = formStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-base">
                {stage === 'choose' ? 'Demande de vérification' :
                 stage === 'form' ? `${selectedLevel?.label} — Étape ${formStep + 1}/${totalSteps}` :
                 stage === 'payment' ? 'Finaliser' : 'Confirmé'}
              </h2>
              {stage === 'form' && currentStepDef && (
                <p className="font-mono text-[10px] text-muted-foreground">{currentStepDef.subtitle}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">

            {/* DISABLED */}
            {!certEnabled && (
              <motion.div key="disabled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-8">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                <p className="font-grotesk font-semibold">Certifications temporairement fermées</p>
                <p className="font-inter text-sm text-muted-foreground">Réessayez ultérieurement.</p>
                <Button onClick={onClose} className="w-full">Fermer</Button>
              </motion.div>
            )}

            {/* CHOOSE LEVEL */}
            {certEnabled && stage === 'choose' && (
              <motion.div key="choose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <p className="font-inter text-sm text-muted-foreground mb-4">Sélectionnez le niveau correspondant à votre profil. Chaque niveau comporte plusieurs étapes de validation.</p>
                {BADGE_LEVELS.map(level => {
                  const Icon = level.icon;
                  return (
                    <button
                      key={level.key}
                      onClick={() => { if (!level.locked) { setSelectedLevel(level); setFormStep(0); setStage('form'); } }}
                      disabled={level.locked}
                      className={`w-full text-left rounded-xl border p-4 transition-all group ${level.locked ? 'opacity-50 cursor-not-allowed border-border bg-secondary/30' : `${level.border} ${level.bg} hover:scale-[1.01] cursor-pointer`}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${level.bg} border ${level.border}`}
                            style={level.key === 'supreme' ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #f59e0b' } : {}}>
                            <Icon className={`w-4 h-4 ${level.color}`} style={level.key === 'supreme' ? { color: '#fde68a' } : {}} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-grotesk font-bold text-sm ${level.color}`} style={level.key === 'supreme' ? { color: '#f59e0b' } : {}}>{level.label}</p>
                              {level.price > 0 && <span className="font-mono text-[9px] bg-secondary border border-border px-1.5 py-0.5 rounded-full text-muted-foreground">{(level.price / 100).toFixed(0)}€</span>}
                              {!level.locked && level.steps.length > 0 && <span className="font-mono text-[9px] bg-secondary border border-border px-1.5 py-0.5 rounded-full text-muted-foreground">{level.steps.length} étapes</span>}
                              {level.locked && <span className="font-mono text-[9px] bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-1.5 py-0.5 rounded-full">Sur invitation</span>}
                            </div>
                            <p className="font-inter text-[11px] text-muted-foreground">{level.desc}</p>
                          </div>
                        </div>
                        {!level.locked && <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* FORM STEPS */}
            {certEnabled && stage === 'form' && selectedLevel && currentStepDef && (
              <motion.div key={`form-${formStep}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                <ProgressBar current={formStep + 1} total={totalSteps} color={selectedLevel.color} />

                {/* Step title */}
                <div className={`rounded-xl border p-3 ${selectedLevel.bg} ${selectedLevel.border} flex items-center gap-3 mb-2`}>
                  {React.createElement(currentStepDef.icon, { className: `w-4 h-4 flex-shrink-0 ${selectedLevel.color}` })}
                  <div>
                    <p className={`font-grotesk font-bold text-sm ${selectedLevel.color}`}>{currentStepDef.title}</p>
                    <p className="font-inter text-[11px] text-muted-foreground">{currentStepDef.subtitle}</p>
                  </div>
                </div>

                {currentStepDef.fields.map(field => (
                  <FieldInput key={field.id} field={field} value={formData[field.id]} onChange={handleFieldChange} />
                ))}
              </motion.div>
            )}

            {/* PAYMENT */}
            {certEnabled && stage === 'payment' && selectedLevel && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center space-y-6 py-4">
                <div className={`w-16 h-16 rounded-2xl ${selectedLevel.bg} border ${selectedLevel.border} flex items-center justify-center mx-auto`}>
                  {React.createElement(selectedLevel.icon, { className: `w-8 h-8 ${selectedLevel.color}` })}
                </div>
                <div>
                  <h3 className="font-grotesk font-bold text-lg mb-1">Finaliser la demande</h3>
                  <p className="font-inter text-sm text-muted-foreground">Badge <span className={`font-semibold ${selectedLevel.color}`}>{selectedLevel.label}</span></p>
                  <p className="font-grotesk font-bold text-3xl text-primary mt-2">{(selectedLevel.price / 100).toFixed(0)}€</p>
                </div>
                <p className="font-inter text-xs text-muted-foreground max-w-xs mx-auto">Après paiement, votre dossier complet sera examiné par notre équipe sous 5 jours ouvrables.</p>
              </motion.div>
            )}

            {/* SUCCESS */}
            {stage === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-grotesk font-bold text-xl mb-2">Dossier envoyé !</h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Votre demande pour le badge <span className={`font-semibold ${selectedLevel?.color}`}>{selectedLevel?.label}</span> a bien été soumis. Réponse sous 5 jours ouvrables.
                  </p>
                </div>
                <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">Fermer</Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {certEnabled && (stage === 'form' || stage === 'payment') && (
          <div className="flex-shrink-0 border-t border-border p-4 flex gap-3 bg-card">
            <Button
              variant="outline"
              className="border-border gap-2"
              onClick={() => {
                if (stage === 'payment') { setStage('form'); setFormStep(totalSteps - 1); }
                else if (formStep > 0) setFormStep(f => f - 1);
                else { setStage('choose'); setFormData({}); }
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>
            <Button
              onClick={stage === 'payment' ? handlePayment : goNext}
              disabled={loading}
              className="flex-1 gap-2 bg-primary text-primary-foreground"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {stage === 'payment'
                ? `Payer ${(selectedLevel.price / 100).toFixed(0)}€`
                : isLastStep
                  ? selectedLevel.price > 0 ? 'Continuer → Paiement' : 'Soumettre le dossier'
                  : `Étape suivante`
              }
              {!loading && stage !== 'payment' && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}