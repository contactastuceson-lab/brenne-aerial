import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Calculator, CheckCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SECTORS = [
  { key: 'agriculture', label: '🌾 Agriculture', desc: 'Cartographie, monitoring cultures' },
  { key: 'btp', label: '🏗️ BTP / Chantier', desc: 'Suivi de chantier, relevé topographique' },
  { key: 'evenement', label: '🎉 Événement', desc: 'Mariage, concert, sport' },
  { key: 'immobilier', label: '🏠 Immobilier', desc: 'Photo/vidéo biens, promoteur' },
  { key: 'industrie', label: '⚙️ Industrie', desc: 'Inspection, thermographie' },
  { key: 'media', label: '🎬 Médias / Cinéma', desc: 'Film, clip, publicité' },
];

const SURFACES = [
  { key: 'small', label: '< 1 ha', desc: 'Terrain, maison, bâtiment' },
  { key: 'medium', label: '1–10 ha', desc: 'Petit chantier, exploitation' },
  { key: 'large', label: '10–100 ha', desc: 'Grand domaine, chantier majeur' },
  { key: 'xlarge', label: '> 100 ha', desc: 'Projet industriel, agricole' },
  { key: 'na', label: 'N/A', desc: 'Événement, pas de surface' },
];

const DETAILS = [
  { key: 'photo', label: '📸 Photos HD', desc: 'Clichés haute résolution' },
  { key: 'video4k', label: '🎥 Vidéo 4K', desc: 'Montage inclus ou rush bruts' },
  { key: 'model3d', label: '🗺️ Modèle 3D', desc: 'Nuage de points, orthophoto' },
  { key: 'thermal', label: '🌡️ Thermique', desc: 'Caméra infrarouge' },
  { key: 'live', label: '📡 Live Stream', desc: 'Retour temps réel' },
];

const PRICE_MATRIX = {
  agriculture: { small: [300, 600], medium: [500, 1200], large: [1000, 3000], xlarge: [2500, 6000], na: [300, 600] },
  btp:         { small: [400, 800], medium: [700, 1500], large: [1500, 4000], xlarge: [3000, 8000], na: [400, 800] },
  evenement:   { small: [350, 700], medium: [500, 1000], large: [800, 1800], xlarge: [1500, 3500], na: [350, 1000] },
  immobilier:  { small: [250, 500], medium: [400, 900], large: [800, 2000], xlarge: [1500, 3500], na: [250, 500] },
  industrie:   { small: [500, 1000], medium: [900, 2000], large: [1800, 5000], xlarge: [4000, 10000], na: [500, 1000] },
  media:       { small: [600, 1500], medium: [1000, 2500], large: [2000, 5000], xlarge: [4000, 12000], na: [600, 2500] },
};

const DETAIL_MULTIPLIER = { photo: 1, video4k: 1.3, model3d: 1.6, thermal: 1.8, live: 1.5 };

export default function QuoteCalculatorPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_calculator_enabled');
  const [step, setStep] = useState(0);
  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Calculateur indisponible" message="Le calculateur de devis est temporairement désactivé." />;
  const [sector, setSector] = useState(null);
  const [surface, setSurface] = useState(null);
  const [detail, setDetail] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });
  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  const pageTitle = sMap['calc_title'] || 'Calculateur de Devis Express';
  const pageDesc = sMap['calc_desc'] || 'Obtenez une estimation de prix en moins de 60 secondes.';

  const getEstimate = () => {
    if (!sector || !surface || !detail) return null;
    const base = PRICE_MATRIX[sector]?.[surface] || [300, 800];
    const mult = DETAIL_MULTIPLIER[detail] || 1;
    return [Math.round(base[0] * mult / 50) * 50, Math.round(base[1] * mult / 50) * 50];
  };

  const estimate = getEstimate();
  const steps = [
    {
      title: 'Votre secteur d\'activité',
      subtitle: 'Quelle est votre domaine ?',
      options: SECTORS,
      value: sector,
      set: setSector,
    },
    {
      title: 'Surface à couvrir',
      subtitle: 'Quelle est la zone concernée ?',
      options: SURFACES,
      value: surface,
      set: setSurface,
    },
    {
      title: 'Niveau de prestation',
      subtitle: 'Quel type de rendu souhaitez-vous ?',
      options: DETAILS,
      value: detail,
      set: setDetail,
    },
  ];

  const current = steps[step];

  return (
    <div className="pt-24 min-h-screen pb-20 px-5 lg:px-10">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <Calculator className="w-3.5 h-3.5" /> Estimation instantanée
          </div>
          <h1 className="font-grotesk font-bold text-4xl mb-3 gradient-text">{pageTitle}</h1>
          <p className="font-inter text-muted-foreground">{pageDesc}</p>
        </motion.div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-6">
                <p className="font-mono text-xs text-muted-foreground">Étape {step + 1}/3</p>
                <h2 className="font-grotesk font-bold text-2xl">{current.title}</h2>
                <p className="font-inter text-sm text-muted-foreground">{current.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {current.options.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      current.set(opt.key);
                      setTimeout(() => setStep(s => Math.min(s + 1, 3)), 200);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                      current.value === opt.key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60'
                    }`}
                  >
                    <p className="font-grotesk font-semibold text-sm mb-0.5">{opt.label}</p>
                    <p className="font-inter text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-card border border-primary/30 rounded-2xl p-8 text-center sky-glow mb-6">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="font-mono text-xs text-primary mb-2 uppercase tracking-widest">Estimation indicative</p>
                <div className="font-grotesk font-bold text-5xl gradient-text mb-2">
                  {estimate ? `${estimate[0]}€ – ${estimate[1]}€` : '—'}
                </div>
                <p className="font-inter text-sm text-muted-foreground">HT — Hors frais de déplacement</p>
                <div className="mt-6 p-4 bg-secondary/50 rounded-xl text-left space-y-2">
                  <p className="font-inter text-xs text-muted-foreground"><span className="text-foreground font-semibold">Secteur :</span> {SECTORS.find(s => s.key === sector)?.label}</p>
                  <p className="font-inter text-xs text-muted-foreground"><span className="text-foreground font-semibold">Surface :</span> {SURFACES.find(s => s.key === surface)?.label}</p>
                  <p className="font-inter text-xs text-muted-foreground"><span className="text-foreground font-semibold">Prestation :</span> {DETAILS.find(d => d.key === detail)?.label}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <Link to="/quote">
                  <Button size="lg" className="w-full bg-primary sky-glow gap-2 font-grotesk font-semibold">
                    <Mail className="w-4 h-4" /> Demander un devis précis
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="w-full gap-2 font-grotesk font-semibold">
                    <Phone className="w-4 h-4" /> Nous appeler
                  </Button>
                </Link>
              </div>
              <Button variant="ghost" onClick={() => { setStep(0); setSector(null); setSurface(null); setDetail(null); }} className="w-full gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" /> Recommencer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}