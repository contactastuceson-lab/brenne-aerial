import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Check, Award, AlertCircle, ChevronRight,
  CheckCircle, BadgeCheck, Building2, Gem, ShieldCheck,
  Link2, FileText, Users, Star, Camera, Linkedin, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const BADGE_LEVELS = [
  {
    key: 'verified',
    label: 'Vérifié',
    icon: CheckCircle,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    price: 0,
    desc: 'Prouvez que votre identité est réelle',
    requirements: 'Compte réel, profil complet, lien vers un réseau social public.',
    fields: [
      { id: 'social_link', label: 'Lien vers votre profil public', placeholder: 'Instagram, LinkedIn, TikTok...', type: 'text', required: true, icon: Link2 },
      { id: 'full_name_confirm', label: 'Votre vrai nom complet', placeholder: 'Prénom Nom', type: 'text', required: true, icon: FileText },
      { id: 'why', label: 'Pourquoi souhaitez-vous être vérifié ?', placeholder: 'En quelques mots...', type: 'textarea', required: true },
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    icon: Gem,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    price: 500,
    desc: 'Montrez que vous exercez à titre professionnel',
    requirements: 'Attestation SIRET, portfolio ou galerie de travaux, présence en ligne active.',
    fields: [
      { id: 'siret', label: 'Numéro SIRET ou SIREN', placeholder: '123 456 789 00010', type: 'text', required: true, icon: FileText },
      { id: 'portfolio_url', label: 'URL de votre portfolio / site professionnel', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
      { id: 'instagram_or_social', label: 'Page professionnelle (réseau social)', placeholder: 'https://instagram.com/...', type: 'text', required: false, icon: Camera },
      { id: 'projects_count', label: 'Nombre de projets réalisés à ce jour', placeholder: 'Ex: 45', type: 'number', required: true, icon: Star },
      { id: 'specialties', label: 'Décrivez vos spécialités et services', placeholder: 'Vidéo événementiel, inspection toiture, mapping...', type: 'textarea', required: true },
    ],
  },
  {
    key: 'certified',
    label: 'Certifié',
    icon: BadgeCheck,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    price: 1000,
    desc: 'Certifications officielles et expertise reconnue',
    requirements: 'Attestation DGAC A1/A2/A3, expérience significative, références clients.',
    fields: [
      { id: 'dgac_cert', label: 'Numéro de téléopérateur DGAC', placeholder: 'FR-DGAC-...', type: 'text', required: true, icon: BadgeCheck },
      { id: 'dgac_category', label: 'Catégories obtenues', placeholder: 'A1, A2, A3, STS...', type: 'text', required: true, icon: FileText },
      { id: 'years_xp', label: 'Années d\'expérience pilotage professionnel', placeholder: 'Ex: 4', type: 'number', required: true, icon: Star },
      { id: 'portfolio_url', label: 'Portfolio ou références clients', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
      { id: 'linkedin', label: 'Profil LinkedIn', placeholder: 'https://linkedin.com/in/...', type: 'text', required: false, icon: Linkedin },
      { id: 'achievements', label: 'Vos réalisations notables', placeholder: 'Projets marquants, médias couverts, entreprises clientes...', type: 'textarea', required: true },
    ],
  },
  {
    key: 'official',
    label: 'Officiel',
    icon: Building2,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    price: 0,
    desc: 'Pour les entités, marques ou organisations reconnues',
    requirements: 'Preuve de représentation légale d\'une entité officielle (entreprise, association, institution).',
    fields: [
      { id: 'entity_name', label: 'Nom de l\'entité / organisation', placeholder: 'Nom légal exact', type: 'text', required: true, icon: Building2 },
      { id: 'entity_website', label: 'Site web officiel', placeholder: 'https://...', type: 'text', required: true, icon: Globe },
      { id: 'entity_role', label: 'Votre rôle au sein de cette entité', placeholder: 'CEO, Responsable communication...', type: 'text', required: true, icon: Users },
      { id: 'entity_proof', label: 'Preuve de représentation (URL Kbis, page À propos, etc.)', placeholder: 'https://...', type: 'text', required: true, icon: FileText },
      { id: 'why_official', label: 'Pourquoi souhaitez-vous le badge Officiel ?', placeholder: 'Contexte et objectif...', type: 'textarea', required: true },
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
    requirements: 'Non accessible par formulaire. Attribué uniquement par l\'équipe Brenne Aerial à des membres d\'exception.',
    locked: true,
    fields: [],
  },
];

export default function CertificationRequest({ onClose, user }) {
  const [step, setStep] = useState('choose'); // choose, form, payment, success
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [certEnabled, setCertEnabled] = useState(true);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'certifications_enabled' }).then(s => {
      if (s.length > 0) setCertEnabled(s[0].value === 'true');
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    const missing = selectedLevel.fields.filter(f => f.required && !formData[f.id]);
    if (missing.length > 0) {
      toast.error(`Champs requis : ${missing.map(m => m.label).join(', ')}`);
      return;
    }
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

    if (selectedLevel.price > 0) {
      setStep('payment');
    } else {
      setStep('success');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    const response = await base44.functions.invoke('createCertificationPayment', {
      userEmail: user.email,
      userName: user.full_name,
      amount: selectedLevel.price,
    });
    if (response.data?.url) {
      window.location.href = response.data.url;
    } else {
      setStep('success');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-base">Demande de vérification</h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                {step === 'choose' ? 'Choisissez votre niveau' : step === 'form' ? `Badge ${selectedLevel?.label}` : step === 'payment' ? 'Finaliser' : 'Confirmé'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
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

            {/* STEP 1: CHOOSE LEVEL */}
            {certEnabled && step === 'choose' && (
              <motion.div key="choose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="font-inter text-sm text-muted-foreground mb-5">
                  Sélectionnez le niveau de vérification correspondant à votre profil. Chaque niveau a des preuves spécifiques à fournir.
                </p>
                <div className="space-y-3">
                  {BADGE_LEVELS.map(level => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.key}
                        onClick={() => { if (!level.locked) { setSelectedLevel(level); setStep('form'); } }}
                        disabled={level.locked}
                        className={`w-full text-left rounded-xl border p-4 transition-all group ${
                          level.locked
                            ? 'opacity-50 cursor-not-allowed border-border bg-secondary/30'
                            : `${level.border} ${level.bg} hover:scale-[1.01] hover:shadow-lg cursor-pointer`
                        }`}
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
                                {level.price > 0 && (
                                  <span className="font-mono text-[9px] bg-secondary border border-border px-1.5 py-0.5 rounded-full text-muted-foreground">{(level.price / 100).toFixed(0)}€</span>
                                )}
                                {level.locked && (
                                  <span className="font-mono text-[9px] bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-1.5 py-0.5 rounded-full">Sur invitation</span>
                                )}
                              </div>
                              <p className="font-inter text-[11px] text-muted-foreground">{level.desc}</p>
                            </div>
                          </div>
                          {!level.locked && <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                        </div>
                        {!level.locked && (
                          <p className="font-inter text-[10px] text-muted-foreground mt-2 ml-12">{level.requirements}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: FORM */}
            {certEnabled && step === 'form' && selectedLevel && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className={`rounded-xl border p-4 ${selectedLevel.bg} ${selectedLevel.border}`}>
                  <p className="font-inter text-xs text-muted-foreground">
                    <span className={`font-grotesk font-semibold ${selectedLevel.color}`}>{selectedLevel.label}</span> — {selectedLevel.requirements}
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedLevel.fields.map(field => {
                    const Icon = field.icon;
                    return (
                      <div key={field.id}>
                        <label className="font-inter text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          {Icon && <Icon className="w-3 h-3" />}
                          {field.label}
                          {field.required && <span className="text-destructive">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            value={formData[field.id] || ''}
                            onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="bg-secondary border-border resize-none h-24 font-inter text-sm"
                          />
                        ) : (
                          <Input
                            type={field.type}
                            value={formData[field.id] || ''}
                            onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="bg-secondary border-border font-inter"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setStep('choose'); setFormData({}); }} className="border-border flex-1">
                    Retour
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1 gap-2 bg-primary text-primary-foreground">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    {selectedLevel.price > 0 ? `Continuer → Paiement` : 'Soumettre ma demande'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT */}
            {certEnabled && step === 'payment' && selectedLevel && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-6 py-4">
                <div className={`w-16 h-16 rounded-2xl ${selectedLevel.bg} border ${selectedLevel.border} flex items-center justify-center mx-auto`}>
                  {React.createElement(selectedLevel.icon, { className: `w-8 h-8 ${selectedLevel.color}` })}
                </div>
                <div>
                  <h3 className="font-grotesk font-bold text-lg mb-1">Finaliser la demande</h3>
                  <p className="font-inter text-sm text-muted-foreground">Badge <span className={`font-semibold ${selectedLevel.color}`}>{selectedLevel.label}</span></p>
                  <p className="font-grotesk font-bold text-2xl text-primary mt-2">{(selectedLevel.price / 100).toFixed(0)}€</p>
                </div>
                <p className="font-inter text-xs text-muted-foreground max-w-xs mx-auto">
                  Après paiement, votre dossier sera examiné par notre équipe. Vous recevrez une réponse sous 5 jours ouvrables.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('form')} className="border-border flex-1" disabled={loading}>Retour</Button>
                  <Button onClick={handlePayment} disabled={loading} className="flex-1 gap-2 bg-primary text-primary-foreground">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Payer {(selectedLevel.price / 100).toFixed(0)}€
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-grotesk font-bold text-xl mb-2">Demande envoyée !</h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Votre dossier pour le badge <span className={`font-semibold ${selectedLevel?.color}`}>{selectedLevel?.label}</span> a bien été soumis. Notre équipe l'examinera sous 5 jours ouvrables.
                  </p>
                </div>
                <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">Fermer</Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}