import React from 'react';
import { motion } from 'framer-motion';
import { Heart, HardHat, TreePine } from 'lucide-react';

const PROFILES = [
  {
    key: 'particulier',
    icon: Heart,
    label: 'Je suis un particulier',
    sub: 'Mariage · Captation · Immobilier',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    activeBg: 'bg-green-500',
    slugs: ['video_evenement', 'captation_particulier', 'immobilier_virtuelle', 'mariage_aero', 'contenu_social'],
  },
  {
    key: 'professionnel',
    icon: HardHat,
    label: 'Je suis un professionnel / BTP',
    sub: 'Suivi chantier · Inspection · Photogrammétrie',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    activeBg: 'bg-primary',
    slugs: ['suivi_chantier', 'inspection_toiture', 'photogrammetrie_3d', 'cartographie_releves', 'thermographie', 'captation_entreprise', 'retour_temps_reel', 'reportage', 'surveillance'],
  },
  {
    key: 'collectivite',
    icon: TreePine,
    label: 'Je suis une collectivité / Agriculteur',
    sub: 'Cartographie · Surveillance · Agriculture',
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    border: 'border-chart-5/30',
    activeBg: 'bg-chart-5',
    slugs: ['cartographie_releves', 'surveillance', 'agriculture', 'photogrammetrie_3d', 'thermographie'],
  },
];

export { PROFILES };

export default function NeedSelector({ active, onChange }) {
  return (
    <section className="px-5 lg:px-10 max-w-7xl mx-auto mb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="font-mono text-xs text-muted-foreground text-center mb-5 tracking-widest uppercase">— Filtrer par profil</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROFILES.map(p => {
            const Icon = p.icon;
            const isActive = active === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onChange(isActive ? null : p.key)}
                className={`relative group rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                  isActive
                    ? `${p.activeBg} border-transparent text-white shadow-lg scale-[1.02]`
                    : `bg-card ${p.border} hover:border-opacity-60 hover:scale-[1.01]`
                }`}
              >
                <Icon className={`w-7 h-7 mb-3 ${isActive ? 'text-white' : p.color}`} />
                <p className={`font-grotesk font-bold text-base mb-1 ${isActive ? 'text-white' : 'text-foreground'}`}>
                  {p.label}
                </p>
                <p className={`font-mono text-xs ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {p.sub}
                </p>
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}