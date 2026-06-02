import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, Loader2, Calculator, Video, Building2, HardHat, Camera, Briefcase, Wifi, Sparkles, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { calculatePrice, formatPrice, SERVICE_PRICES, getServicePrices } from '@/lib/droneUtils';
import { toast } from 'sonner';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import AddressAutocomplete from '@/components/quote/AddressAutocomplete';

const SERVICE_OPTIONS = [
  { key: 'video_evenement',      icon: Video,       label: 'Vidéo événement' },
  { key: 'inspection_toiture',   icon: Building2,   label: 'Inspection toiture' },
  { key: 'suivi_chantier',       icon: HardHat,     label: 'Suivi chantier' },
  { key: 'captation_particulier',icon: Camera,      label: 'Captation particulier' },
  { key: 'captation_entreprise', icon: Briefcase,   label: 'Captation entreprise' },
  { key: 'retour_temps_reel',    icon: Wifi,        label: 'Retour temps réel' },
  { key: 'photogrammetrie_3d',   icon: Building2,   label: 'Photogrammétrie 3D',        disabled: true },
  { key: 'cartographie_releves', icon: Camera,      label: 'Cartographie/Relevés',      disabled: true },
  { key: 'thermographie',        icon: Camera,      label: 'Thermographie infrarouge',  disabled: true },
  { key: 'surveillance',         icon: Video,       label: 'Surveillance/Gardiennage',  disabled: true },
  { key: 'contenu_social',       icon: Video,       label: 'Contenu réseaux sociaux' },
  { key: 'reportage',            icon: Video,       label: 'Reportage/Documentaire' },
  { key: 'mariage_aero',         icon: Camera,      label: 'Mariage photo aérienne' },
  { key: 'immobilier_virtuelle', icon: Building2,   label: 'Visite immobilière virtuelle' },
  { key: 'agriculture',          icon: HardHat,     label: 'Agriculture/Monitoring',    disabled: true },
  { key: 'autre',                icon: Sparkles,    label: 'Autre' },
];

const DURATIONS = [
  { key: '1h', label: '1 heure' },
  { key: '2-3h', label: '2 à 3 heures' },
  { key: 'demi-journee', label: 'Demi-journée' },
  { key: 'journee', label: 'Journée complète' },
  { key: 'multi-jours', label: 'Multi-jours' },
];

const STEPS = ['Service', 'Détails', 'Contact', 'Récapitulatif'];

export default function QuotePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [quotesEnabled, setQuotesEnabled] = useState(true);
  const [servicePrices, setServicePrices] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    service_type: '', description: '', date_souhaitee: '', horaire: '',
    location: '', duree_estimee: '1h', company: '',
    client_name: '', client_email: '', client_phone: '',
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const init = async () => {
      try {
        const settings = await base44.entities.AppSettings.list().catch(() => []);
        const map = Object.fromEntries(settings.map(x => [x.key, x.value]));
        setQuotesEnabled(map['page_quote_enabled'] !== 'false' && map['quotes_enabled'] !== 'false');
        const prices = await getServicePrices();
        setServicePrices(prices);

        // Si connecté, pré-remplir le formulaire
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const user = await base44.auth.me();
          setForm(p => ({ ...p, client_name: user.full_name, client_email: user.email, client_phone: user.phone || '' }));
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const prices = servicePrices || SERVICE_PRICES;
  const estimatedPrice = form.service_type && form.duree_estimee
    ? calculatePrice(form.service_type, form.duree_estimee, prices)
    : null;

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setUploadedFiles(prev => [...prev, ...urls]);
    setUploading(false);
    toast.success(`${files.length} fichier(s) uploadé(s)`);
  };

  const handleSubmit = async () => {
    if (sending) return; // anti double-submit
    setSending(true);
    try {
      const quote = await base44.entities.Quote.create({
        ...form,
        fichiers_urls: uploadedFiles,
        prix_estime: estimatedPrice,
        status: 'pending',
      });
      setSent(true);

      // Envoi de la confirmation en arrière-plan
      base44.functions.invoke('sendQuoteConfirmation', {
        clientName: form.client_name,
        clientEmail: form.client_email,
        serviceType: form.service_type,
        estimatedPrice: estimatedPrice,
        quoteId: quote?.id || '',
        dateStr: form.date_souhaitee || null,
      }).catch(err => {
        console.error('Erreur envoi confirmation:', err);
        // Erreur silencieuse - le devis a réussi à être créé
      });
    } catch (err) {
      toast.error('Erreur lors de la création de votre demande');
      console.error(err);
      setSending(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!form.service_type;
    if (step === 1) return !!form.description && !!form.duree_estimee;
    if (step === 2) return !!form.client_name && !!form.client_email;
    return true;
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quotesEnabled) {
    return <FeatureDisabled title="Devis désactivés" message="Les demandes de devis sont temporairement désactivées. Revenez bientôt ou contactez-nous directement." />;
  }

  if (sent) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6 sky-glow">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-grotesk font-bold text-3xl mb-3">Demande envoyée !</h2>
          <p className="font-inter text-muted-foreground mb-2">
            Merci <strong>{form.client_name}</strong>. Votre devis a bien été reçu.
          </p>
          <p className="font-inter text-sm text-muted-foreground">
            Réponse garantie sous <span className="text-primary font-semibold">48 heures</span> à {form.client_email}.
          </p>
          <p className="font-inter text-xs text-muted-foreground mt-4">
            Des questions en attendant ? Consultez notre <a href="https://support.brenneaerial.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">documentation</a> ou <a href="https://support.brenneaerial.org/support" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">contactez le support</a>.
          </p>
          {estimatedPrice && (
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="font-mono text-xs text-muted-foreground mb-1">Prix estimatif</p>
              <p className="font-grotesk font-bold text-2xl text-primary">{formatPrice(estimatedPrice)}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">* Hors frais de déplacement</p>
            </div>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/espace-client')} className="gap-2 bg-primary text-primary-foreground font-grotesk">
              <LogIn className="w-4 h-4" /> Espace client
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="gap-2 border-border font-grotesk">
              <Home className="w-4 h-4" /> Accueil
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen py-20 px-5 lg:px-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="font-mono text-xs text-primary mb-3 tracking-widest uppercase">— Devis gratuit</p>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-2">
            Votre <span className="gradient-text">projet</span>
          </h1>
          <p className="font-inter text-muted-foreground text-sm">Réponse sous 48h garantie.</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${
                  i < step ? 'bg-primary border-primary text-primary-foreground' :
                  i === step ? 'border-primary bg-primary/10' : 'border-border'
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="hidden sm:inline font-inter text-xs">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

            {/* Step 0 — Service */}
            {step === 0 && (
              <div>
                <h2 className="font-grotesk font-semibold text-lg mb-5">Quel service vous intéresse ?</h2>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {SERVICE_OPTIONS.filter(s => !s.disabled).map(s => {
                    const Icon = s.icon;
                    const sel = form.service_type === s.key;
                    return (
                      <button key={s.key} onClick={() => u('service_type', s.key)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                          sel ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-muted-foreground/40'
                        }`}>
                        <Icon className={`w-6 h-6 mb-2.5 ${sel ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`font-grotesk font-semibold text-sm ${sel ? 'text-primary' : ''}`}>{s.label}</p>
                        {prices[s.key] ? (
                          <p className="font-mono text-[10px] text-muted-foreground mt-1">
                            Dès {formatPrice(prices[s.key].base)}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Bientôt disponible */}
                {SERVICE_OPTIONS.some(s => s.disabled) && (
                  <div>
                    <h3 className="font-grotesk font-semibold text-sm text-muted-foreground mb-3">Bientôt disponible</h3>
                    <div className="grid grid-cols-2 gap-3 opacity-60">
                      {SERVICE_OPTIONS.filter(s => s.disabled).map(s => {
                        const Icon = s.icon;
                        return (
                          <div key={s.key}
                            className="p-4 rounded-xl border border-border/50 bg-muted/20 text-left">
                            <Icon className="w-6 h-6 mb-2.5 text-muted-foreground" />
                            <p className="font-grotesk font-semibold text-sm text-muted-foreground">{s.label}</p>
                            <p className="font-mono text-[10px] text-muted-foreground/70 mt-1">Disponible prochainement</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 1 — Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-2 block">Description du projet *</label>
                  <Textarea value={form.description} onChange={e => u('description', e.target.value)}
                    placeholder="Décrivez votre projet, vos attentes, le contexte..." className="bg-card border-border min-h-[130px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-2 block">Date souhaitée</label>
                    <Input type="date" value={form.date_souhaitee} onChange={e => u('date_souhaitee', e.target.value)} className="bg-card border-border" />
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-2 block">Horaire souhaité</label>
                    <Input placeholder="ex: 10h00 - 14h00" value={form.horaire} onChange={e => u('horaire', e.target.value)} className="bg-card border-border" />
                  </div>
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-2 block">Lieu de la prestation</label>
                  <AddressAutocomplete
                    value={form.location}
                    onChange={val => u('location', val)}
                    placeholder="Adresse, ville, pays..."
                  />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-2 block">Durée estimée *</label>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map(d => (
                      <button key={d.key} onClick={() => u('duree_estimee', d.key)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
                          form.duree_estimee === d.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        }`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price estimator */}
                {estimatedPrice && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">Estimation automatique</p>
                      <p className="font-grotesk font-bold text-xl text-primary">{formatPrice(estimatedPrice)}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Prix indicatif, hors frais de déplacement</p>
                    </div>
                  </div>
                )}
                {/* File upload */}
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-2 block">Fichiers / Photos (optionnel)</label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-card hover:border-primary/40 cursor-pointer transition-colors">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                    <span className="font-inter text-xs text-muted-foreground">
                      {uploadedFiles.length > 0 ? `${uploadedFiles.length} fichier(s) uploadé(s)` : 'Cliquez pour uploader'}
                    </span>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*,video/*,.pdf" />
                  </label>
                </div>
              </div>
            )}

            {/* Step 2 — Contact */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-2 block">Nom complet *</label>
                    <Input value={form.client_name} onChange={e => u('client_name', e.target.value)} className="bg-card border-border" />
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-2 block">Email *</label>
                    <Input type="email" value={form.client_email} onChange={e => u('client_email', e.target.value)} className="bg-card border-border" />
                  </div>
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-2 block">Téléphone</label>
                  <Input type="tel" value={form.client_phone} onChange={e => u('client_phone', e.target.value)} className="bg-card border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-2 block">Société (optionnel)</label>
                  <Input value={form.company} onChange={e => u('company', e.target.value)} className="bg-card border-border" />
                </div>
              </div>
            )}

            {/* Step 3 — Summary */}
            {step === 3 && (
              <div className="space-y-3">
                <h2 className="font-grotesk font-semibold text-lg mb-5">Récapitulatif de votre demande</h2>
                <div className="p-5 rounded-xl bg-card border border-border space-y-3">
                  {[
                    ['Service', prices[form.service_type]?.label || SERVICE_OPTIONS.find(s => s.key === form.service_type)?.label],
                    ['Durée', DURATIONS.find(d => d.key === form.duree_estimee)?.label],
                    ['Date', form.date_souhaitee || '—'],
                    ['Horaire', form.horaire || '—'],
                    ['Lieu', form.location || '—'],
                    ['Client', form.client_name],
                    ['Email', form.client_email],
                    ['Téléphone', form.client_phone || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                      <span className="font-inter text-xs text-muted-foreground">{k}</span>
                      <span className="font-mono text-xs text-right max-w-[200px] truncate">{v}</span>
                    </div>
                  ))}
                </div>
                {estimatedPrice && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <p className="font-mono text-xs text-muted-foreground mb-1">Prix estimatif</p>
                    <p className="font-grotesk font-bold text-3xl text-primary">{formatPrice(estimatedPrice)}</p>
                  </div>
                )}
                {uploadedFiles.length > 0 && (
                  <p className="font-mono text-xs text-muted-foreground">{uploadedFiles.length} fichier(s) joint(s)</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="border-border font-grotesk">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="bg-primary text-primary-foreground font-grotesk font-semibold sky-glow">
              Suivant <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={sending} className="bg-primary text-primary-foreground font-grotesk font-semibold px-8 sky-glow">
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Envoyer ma demande
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}