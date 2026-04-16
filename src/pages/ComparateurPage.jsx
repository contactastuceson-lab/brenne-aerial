import React, { useState, useRef } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { ZoomIn, Camera, ArrowRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const COMPARISONS = [
  {
    id: 'fissure',
    label: 'Fissure de façade',
    standard: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60',
    drone: 'https://images.unsplash.com/photo-1618090584176-7132b9911657?w=800&auto=format&fit=crop&q=90',
    stdDesc: 'Photo smartphone — 12 MP — Distance 10m',
    droneDesc: 'Drone 45MP — Zoom optique x10 — Distance 5m',
  },
  {
    id: 'chantier',
    label: 'Vue de chantier',
    standard: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
    drone: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=90',
    stdDesc: 'Photo au sol — angle limité',
    droneDesc: 'Orthophoto drone — Vue verticale 100% du site',
  },
  {
    id: 'toit',
    label: 'Inspection toiture',
    standard: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
    drone: 'https://images.unsplash.com/photo-1611795664523-4eca7e1c9af7?w=800&auto=format&fit=crop&q=90',
    stdDesc: 'Jumelles depuis la rue — flou et angle difficile',
    droneDesc: 'Drone centimétrique — chaque tuile visible',
  },
];

function SliderComparator({ before, after, beforeDesc, afterDesc }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    setPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className="relative select-none overflow-hidden rounded-xl aspect-video cursor-col-resize"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After (drone) */}
      <img src={after} alt="Drone" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (standard) - clipped */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Standard" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (pos / 100) * 0.01 * 100}vw`, maxWidth: 'none' }} />
        <img src={before} alt="Standard" className="w-full h-full object-cover" />
      </div>

      {/* Divider */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 font-mono text-[10px] bg-black/70 text-white px-2 py-1 rounded">{beforeDesc}</div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] bg-primary/80 text-white px-2 py-1 rounded">{afterDesc}</div>
      <div className="absolute top-3 left-3 font-mono text-[10px] bg-black/50 text-white px-2 py-1 rounded">📱 Standard</div>
      <div className="absolute top-3 right-3 font-mono text-[10px] bg-primary/70 text-white px-2 py-1 rounded">🚁 Drone 45MP</div>
    </div>
  );
}

export default function ComparateurPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_comparateur_enabled');
  const [active, setActive] = useState(0);
  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Comparateur indisponible" message="Le comparateur de résolution est temporairement désactivé." />;
  const comp = COMPARISONS[active];

  return (
    <div className="pt-24 min-h-screen pb-20 px-5 lg:px-10">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <ZoomIn className="w-3.5 h-3.5" /> Comparateur interactif
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            La différence est <span className="gradient-text">spectaculaire.</span>
          </h1>
          <p className="font-inter text-muted-foreground max-w-2xl leading-relaxed">
            Glissez le curseur pour comparer une photo standard avec notre prise de vue drone 45 mégapixels. 
            La netteté peut faire toute la différence lors d'une inspection ou d'un diagnostic.
          </p>
        </motion.div>

        {/* Category selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {COMPARISONS.map((c, i) => (
            <button key={c.id} onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full font-inter text-sm border transition-all ${active === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Main comparator */}
        <motion.div key={active} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <SliderComparator
            before={comp.standard}
            after={comp.drone}
            beforeDesc={comp.stdDesc}
            afterDesc={comp.droneDesc}
          />
          <p className="font-inter text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-2">
            <Maximize2 className="w-3.5 h-3.5" /> Faites glisser le curseur pour comparer
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { val: '45MP', label: 'Résolution capteur' },
            { val: 'x10', label: 'Zoom optique' },
            { val: '2cm', label: 'Précision au sol (GSD)' },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="font-grotesk font-bold text-2xl text-primary">{s.val}</p>
              <p className="font-inter text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-card border border-primary/20 rounded-2xl p-8 text-center sky-glow">
          <Camera className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="font-grotesk font-bold text-xl mb-2">Convaincant ?</h2>
          <p className="font-inter text-sm text-muted-foreground mb-6">Demandez un test sur votre site. Nous capturons quelques photos gratuites pour vous montrer le potentiel.</p>
          <Link to="/quote">
            <Button size="lg" className="bg-primary sky-glow font-grotesk font-semibold gap-2">
              Demander un test gratuit <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}