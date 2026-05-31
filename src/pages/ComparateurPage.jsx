import React, { useState, useRef } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { ZoomIn, Camera, ArrowRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Même image haute qualité — on simule la dégradation "standard" via CSS
const COMPARISONS = [
  {
    id: 'toiture',
    label: 'Inspection toiture',
    image: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=1600&auto=format&fit=crop&q=95',
    // filtres CSS appliqués côté "standard"
    stdFilter: 'blur(3.5px) saturate(0.6) brightness(0.85)',
    stdDesc: 'Smartphone 12MP — Distance 30m — flou de distance',
    droneDesc: 'Drone 45MP — Distance 5m — netteté centimétrique',
  },
  {
    id: 'chantier',
    label: 'Suivi de chantier',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=95',
    stdFilter: 'blur(4px) saturate(0.5) brightness(0.8) contrast(0.85)',
    stdDesc: 'Photo au sol — angle limité — distorsion perspective',
    droneDesc: 'Orthophoto drone — Vue à la verticale — GSD 2cm/px',
  },
  {
    id: 'facade',
    label: 'Façade & fissures',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&auto=format&fit=crop&q=95',
    stdFilter: 'blur(5px) saturate(0.4) brightness(0.75) contrast(0.8)',
    stdDesc: 'Jumelles depuis la rue — flou, tremblement, mauvais angle',
    droneDesc: 'Drone zoom x10 — chaque fissure identifiée',
  },
  {
    id: 'paysage',
    label: 'Vue aérienne',
    image: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=1600&auto=format&fit=crop&q=95',
    stdFilter: 'blur(2px) saturate(0.55) brightness(0.8) contrast(0.9)',
    stdDesc: 'Photo au sol — champ de vision limité',
    droneDesc: 'Vue aérienne drone — 100% du site cartographié',
  },
];

function SliderComparator({ image, stdFilter, beforeDesc, afterDesc }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const updatePos = (clientX) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - rect.left;
    setPos(Math.max(2, Math.min(98, (x / rect.width) * 100)));
  };

  const handleMouseMove = (e) => { if (dragging) updatePos(e.clientX); };
  const handleTouchMove = (e) => { e.preventDefault(); updatePos(e.touches[0].clientX); };

  return (
    <div
      ref={ref}
      className="relative select-none overflow-hidden rounded-xl aspect-video cursor-col-resize touch-none"
      onMouseMove={handleMouseMove}
      onMouseDown={(e) => { setDragging(true); updatePos(e.clientX); }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={handleTouchMove}
      onTouchStart={(e) => updatePos(e.touches[0].clientX)}
    >
      {/* RIGHT side — Drone (sharp) */}
      <img
        src={image}
        alt="Drone HD"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* LEFT side — Standard (degraded via CSS filter), clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={image}
          alt="Standard"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: ref.current ? `${ref.current.offsetWidth}px` : '100%',
            maxWidth: 'none',
            filter: stdFilter,
          }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        style={{ left: `${pos}%` }}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-white/80 flex items-center justify-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 7L1 4m0 6l3-3M10 7l3-3m0 6-3-3" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Top labels */}
      <div className="absolute top-3 left-3 font-mono text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">📱 Standard</div>
      <div className="absolute top-3 right-3 font-mono text-[10px] font-bold bg-primary/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">🚁 Drone 45MP</div>

      {/* Bottom descriptions */}
      <div className="absolute bottom-3 left-3 font-mono text-[9px] bg-black/70 text-gray-300 px-2 py-1 rounded max-w-[45%] leading-tight">{beforeDesc}</div>
      <div className="absolute bottom-3 right-3 font-mono text-[9px] bg-primary/70 text-white px-2 py-1 rounded max-w-[45%] leading-tight text-right">{afterDesc}</div>
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
            image={comp.image}
            stdFilter={comp.stdFilter}
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