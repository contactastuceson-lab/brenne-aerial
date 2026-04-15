import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Shield, AlertTriangle, CheckCircle, Loader2, ArrowRight, Phone, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const STEPS = ['upload', 'form', 'analyzing', 'result'];

export default function ToitureCheckupPage() {
  const [step, setStep] = useState('upload');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '' });
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Veuillez sélectionner une image'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStep('form');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.address) { toast.error('Veuillez remplir tous les champs'); return; }
    setStep('analyzing');

    try {
      // Upload photo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });

      // AI Analysis
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en inspection de toiture par drone. Analyse cette photo de toiture et identifie les zones à risque potentielles. 
        Adresse du bien: ${form.address}
        
        Donne une analyse structurée avec:
        1. Les zones à risque visibles (gouttières, tuiles, faîtage, etc.)
        2. Niveau de risque global: faible / modéré / élevé
        3. Recommandations pour une inspection drone professionnelle
        4. 2-3 points précis qui justifient une intervention
        
        Sois professionnel mais accessible, parle comme si tu t'adressais au propriétaire.`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            zones_risque: { type: 'array', items: { type: 'string' } },
            niveau_risque: { type: 'string' },
            recommandations: { type: 'string' },
            points_cles: { type: 'array', items: { type: 'string' } },
            resume: { type: 'string' }
          }
        }
      });

      // Save to DB
      await base44.entities.RoofCheckup.create({
        ...form,
        photo_url: file_url,
        ai_analysis: JSON.stringify(analysis),
        ai_risk_level: analysis.niveau_risque || 'modéré',
        status: 'analyzed'
      });

      setResult({ ...analysis, photo_url: file_url });
      setStep('result');
    } catch (err) {
      toast.error('Erreur lors de l\'analyse. Veuillez réessayer.');
      setStep('form');
    }
  };

  const riskColor = {
    'faible': 'text-green-400',
    'modéré': 'text-amber-400',
    'élevé': 'text-red-400',
  };
  const riskBg = {
    'faible': 'bg-green-400/10 border-green-400/30',
    'modéré': 'bg-amber-400/10 border-amber-400/30',
    'élevé': 'bg-red-400/10 border-red-400/30',
  };

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-mono px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              🆓 Gratuit — Sans engagement
            </span>
            <h1 className="font-grotesk font-bold text-4xl sm:text-6xl mb-4">
              Check-up Toiture <span className="gradient-text">par IA</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto">
              Uploadez une photo de votre toiture (depuis le sol ou Google Maps). Notre IA détecte les zones à risque en 30 secondes.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 pb-24">

        {/* Step: Upload */}
        {step === 'upload' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('photo-input').click()}
              className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-card'
              }`}
            >
              <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              <Upload className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
              <p className="font-grotesk font-bold text-lg mb-2">Déposez votre photo ici</p>
              <p className="font-inter text-sm text-muted-foreground mb-4">ou cliquez pour sélectionner un fichier</p>
              <span className="font-mono text-xs text-muted-foreground/60">JPG, PNG, WEBP — Max 10 Mo</span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Shield, text: 'Analyse IA en 30s' },
                { icon: CheckCircle, text: '100% gratuit' },
                { icon: Mail, text: 'Rapport par email' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center p-4 rounded-xl bg-card border border-border">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="font-inter text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Form */}
        {step === 'form' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {photoPreview && (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={photoPreview} alt="Toiture" className="w-full max-h-64 object-cover" />
                <button onClick={() => { setPhotoPreview(null); setPhotoFile(null); setStep('upload'); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="font-inter text-xs text-white/80">✅ Photo chargée — remplissez vos informations</p>
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h2 className="font-grotesk font-bold text-lg">Vos coordonnées</h2>
              <p className="font-inter text-sm text-muted-foreground">Nous vous envoyons le rapport complet par email.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom complet *</label>
                  <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Jean Dupont" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Email *</label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jean@exemple.fr" className="bg-secondary border-border" />
                </div>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="06 XX XX XX XX" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Adresse du bien *</label>
                <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="12 rue des Lilas, 44000 Nantes" className="bg-secondary border-border" />
              </div>

              <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground gap-2 font-grotesk font-semibold">
                Lancer l'analyse IA gratuite <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="font-inter text-xs text-muted-foreground text-center">
                🔒 Vos données sont confidentielles. Aucun démarchage abusif.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step: Analyzing */}
        {step === 'analyzing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <Loader2 className="w-20 h-20 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary/60" />
              </div>
            </div>
            <h2 className="font-grotesk font-bold text-2xl">Analyse en cours…</h2>
            <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">Notre IA examine votre photo et identifie les zones à risque. Cela prend environ 30 secondes.</p>
            {photoPreview && (
              <div className="relative mx-auto w-48 rounded-xl overflow-hidden border border-primary/20 opacity-60">
                <img src={photoPreview} alt="" className="w-full object-cover" />
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Risk level */}
            <div className={`p-5 rounded-2xl border ${riskBg[result.niveau_risque] || riskBg['modéré']}`}>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className={`w-6 h-6 ${riskColor[result.niveau_risque] || 'text-amber-400'}`} />
                <div>
                  <p className="font-inter text-xs text-muted-foreground uppercase tracking-widest">Niveau de risque détecté</p>
                  <p className={`font-grotesk font-bold text-xl capitalize ${riskColor[result.niveau_risque] || 'text-amber-400'}`}>
                    {result.niveau_risque || 'Modéré'}
                  </p>
                </div>
              </div>
              <p className="font-inter text-sm leading-relaxed">{result.resume}</p>
            </div>

            {/* Zones */}
            {result.zones_risque?.length > 0 && (
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-grotesk font-semibold text-sm mb-3">🔍 Zones à surveiller</h3>
                <ul className="space-y-2">
                  {result.zones_risque.map((z, i) => (
                    <li key={i} className="flex items-start gap-2 font-inter text-sm text-muted-foreground">
                      <span className="text-amber-400 mt-0.5">▸</span> {z}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Points clés */}
            {result.points_cles?.length > 0 && (
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-grotesk font-semibold text-sm mb-3">✅ Recommandations</h3>
                <ul className="space-y-2">
                  {result.points_cles.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 font-inter text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-4">
              <p className="font-grotesk font-bold text-lg">Obtenez un rapport complet par drone</p>
              <p className="font-inter text-sm text-muted-foreground">
                Notre pilote certifié DGAC réalise une inspection précise avec rapport photo HD pour votre assurance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/quote">
                  <Button className="bg-primary text-primary-foreground gap-2 font-grotesk font-semibold w-full sm:w-auto">
                    Demander un devis gratuit <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
                <a href="/contact">
                  <Button variant="outline" className="border-border gap-2 w-full sm:w-auto">
                    <Phone className="w-4 h-4" /> Nous appeler
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}