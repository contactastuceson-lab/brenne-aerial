import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Camera, ChevronRight, ChevronLeft, Check, Plane, MapPin, Phone, User, Sparkles, FileText, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROJECT_TYPES = ['Événement (mariage, concert...)', 'Inspection (toiture, bâtiment)', 'Suivi de chantier', 'Immobilier / promotion', 'Communication entreprise', 'Photographie aérienne', 'Autre'];
const SECTORS = ['Particulier', 'Artisan / TPE', 'PME / Entreprise', 'Collectivité / Mairie', 'Association', 'Promoteur immobilier', 'Autre'];
const HOW_FOUND = ['Bouche à oreille', 'Google / Internet', 'Réseaux sociaux', 'Recommandation pro', 'Autre'];

const STEPS = [
  { id: 'welcome', title: 'Bienvenue !', subtitle: 'Personnalisons votre profil en quelques secondes' },
  { id: 'identity', title: 'Votre identité', subtitle: 'Nom et username visibles sur votre profil' },
  { id: 'contact', title: 'Coordonnées', subtitle: 'Pour vous contacter plus facilement' },
  { id: 'project', title: 'Votre projet', subtitle: 'Quelques infos pour mieux vous accompagner' },
  { id: 'done', title: 'C\'est parti !', subtitle: 'Votre profil est prêt' },
];

export default function OnboardingModal({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState({
    avatar_url: user?.avatar_url || '',
    display_name: user?.display_name || user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    project_types: [],
    sector: '',
    how_found: '',
  });
  const [usernameError, setUsernameError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const toggleProjectType = (i) => set('project_types', form.project_types.includes(i) ? form.project_types.filter(x => x !== i) : [...form.project_types, i]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('avatar_url', file_url);
    setUploadingAvatar(false);
  };

  const validateUsername = async (username) => {
    if (!username || username.length < 3) {
      setUsernameError('Au minimum 3 caractères');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError('Lettres, chiffres, - et _ uniquement');
      return false;
    }
    // Check if username is unique
    try {
      const result = await base44.functions.invoke('checkUsernameAvailable', { username });
      if (!result.data.available) {
        setUsernameError('Ce username est déjà pris');
        return false;
      }
    } catch (err) {
      setUsernameError('Erreur de vérification');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    // Only validate username if user changed it from the original
    if (form.username && form.username !== (user?.username || '')) {
      const isValid = await validateUsername(form.username);
      if (!isValid) {
        setSaving(false);
        return;
      }
    }
    // Ensure display_name is set, default to full_name if empty
    const dataToUpdate = {
      ...form,
      display_name: form.display_name || user?.full_name || '',
      onboarding_completed: true,
    };
    await base44.auth.updateMe(dataToUpdate);
    // Send welcome email (best effort, don't block)
    base44.functions.invoke('sendWelcomeEmail', {}).catch(() => {});
    setSaving(false);
    onComplete();
  };

  const canNext = () => {
    if (step === 0) return termsAccepted;
    if (step === 1) return true; // avatar + bio optional
    if (step === 2) return true; // phone optional
    if (step === 3) return true;
    return true;
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`flex-1 h-0.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-grotesk font-bold text-2xl mb-1">{STEPS[step].title}</h2>
              <p className="font-inter text-sm text-muted-foreground mb-6">{STEPS[step].subtitle}</p>

              {/* STEP 0 — Welcome + CGU */}
              {step === 0 && (
                <div className="text-center py-2 space-y-5">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Plane className="w-10 h-10 text-primary" />
                  </div>
                  <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">
                    Bienvenue sur <strong className="text-foreground">Brenne Aerial</strong> ! Prenez 1 minute pour compléter votre profil et rejoindre la communauté.
                  </p>
                  {/* CGU acceptance */}
                  <div className={`text-left rounded-xl border p-4 transition-all ${termsAccepted ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/40'}`}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <div
                        onClick={() => setTermsAccepted(v => !v)}
                        className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-primary border-primary' : 'border-border bg-background'}`}
                      >
                        {termsAccepted && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="font-inter text-sm text-foreground/80 leading-relaxed">
                        J'accepte les{' '}
                        <Link to="/legal/terms" target="_blank" className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5">
                          <FileText className="w-3 h-3" /> Conditions d'utilisation
                        </Link>{' '}
                        et la{' '}
                        <Link to="/legal/privacy" target="_blank" className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5">
                          <Shield className="w-3 h-3" /> Politique de confidentialité
                        </Link>{' '}
                        de Brenne Aerial.
                      </span>
                    </label>
                  </div>
                  {!termsAccepted && (
                    <p className="font-inter text-xs text-muted-foreground">Vous devez accepter les conditions pour continuer.</p>
                  )}
                </div>
              )}

              {/* STEP 1 — Identity */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3">
                    <label className="cursor-pointer group relative">
                      <div className="w-24 h-24 rounded-2xl bg-secondary border-2 border-dashed border-border group-hover:border-primary/50 overflow-hidden flex items-center justify-center transition-all">
                        {form.avatar_url
                          ? <img src={form.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <User className="w-10 h-10 text-muted-foreground" />
                        }
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                    <p className="font-inter text-xs text-muted-foreground">Photo de profil (optionnel)</p>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom d'affichage</label>
                    <Input value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Ex: Jean Dupont" className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1 block">Username <span className="text-primary">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input value={form.username} onChange={e => { set('username', e.target.value); setUsernameError(''); }} placeholder="jdupont" className="bg-secondary border-border pl-7" />
                    </div>
                    {usernameError && <p className="font-inter text-xs text-red-500 mt-1">{usernameError}</p>}
                    <p className="font-inter text-xs text-muted-foreground mt-1">Unique, visible sur votre profil (@username)</p>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1 block">Localisation (ville, région)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ex: Guéret, Creuse" className="bg-secondary border-border pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1 block">Courte bio (optionnel)</label>
                    <Textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Parlez-nous de vous..." className="bg-secondary border-border resize-none h-20" />
                  </div>
                </div>
              )}

              {/* STEP 2 — Contact */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1 block">Numéro de téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="06 12 34 56 78" className="bg-secondary border-border pl-9" type="tel" />
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1 block">Adresse e-mail</label>
                    <Input value={user?.email || ''} disabled className="bg-muted border-border opacity-60" />
                    <p className="font-inter text-xs text-muted-foreground mt-1">Votre email est lié à votre compte</p>
                  </div>
                </div>
              )}

              {/* STEP 3 — Project */}
              {step === 3 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Quel type de projet vous intéresse ? <span className="text-muted-foreground">(plusieurs possibles)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {PROJECT_TYPES.map(p => (
                        <button key={p} onClick={() => toggleProjectType(p)}
                          className={`px-3 py-1.5 rounded-full border font-inter text-xs transition-all ${form.project_types.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Vous représentez…</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SECTORS.map(s => (
                        <button key={s} onClick={() => set('sector', s)}
                          className={`px-3 py-2 rounded-xl border font-inter text-sm transition-all ${form.sector === s ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Comment avez-vous connu Brenne Aerial ?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {HOW_FOUND.map(h => (
                        <button key={h} onClick={() => set('how_found', h)}
                          className={`px-3 py-1.5 rounded-full border font-inter text-xs transition-all ${form.how_found === h ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:border-primary/40'}`}>
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 — Done */}
              {step === 4 && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-400" />
                  </div>
                  <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">
                    Votre profil est configuré ! Vous pouvez maintenant profiter de toutes les fonctionnalités de la plateforme.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-3">
            {step > 0 && step < STEPS.length - 1 ? (
              <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="w-4 h-4" /> Retour
              </Button>
            ) : <div />}

            {step < STEPS.length - 2 && (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="bg-primary text-primary-foreground gap-1.5 ml-auto">
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === STEPS.length - 2 && (
              <Button onClick={() => setStep(s => s + 1)} className="bg-primary text-primary-foreground gap-1.5 ml-auto">
                Terminer <Sparkles className="w-4 h-4" />
              </Button>
            )}
            {step === STEPS.length - 1 && (
              <Button onClick={handleFinish} disabled={saving} className="bg-primary text-primary-foreground gap-1.5 ml-auto">
                {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Accéder à la plateforme</>}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}