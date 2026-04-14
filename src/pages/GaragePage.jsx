import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Camera, Wind, Battery, Cpu, ChevronRight, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DEFAULT_DRONES = [
  {
    id: 'matrice',
    name: "L'Aigle",
    subtitle: 'DJI Matrice 30T',
    tagline: 'Pour l\'industrie extrême',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
    color: '#38aadc',
    badge: 'INDUSTRIE',
    specs: [
      { icon: Wind, label: 'Résistance vent', value: '15 m/s (Force 7)' },
      { icon: Battery, label: 'Autonomie', value: '41 minutes' },
      { icon: Camera, label: 'Caméra', value: 'Thermique + 4K HDR' },
      { icon: Shield, label: 'Indice IP', value: 'IP55 — Résiste à la pluie' },
    ],
    usages: ['Inspection toiture & industrielle', 'Thermographie bâtiment', 'Surveillance longue durée', 'Missions en conditions extrêmes'],
    desc: 'Notre cheval de bataille pour les missions critiques. Résistant à la pluie, au froid et aux vents violents, il embarque une caméra thermique et une zoom 4K. Idéal pour les inspections d\'infrastructures.'
  },
  {
    id: 'fpv',
    name: 'Le Guêpier',
    subtitle: 'Drone FPV Cinématique',
    tagline: 'La vitesse à l\'état pur',
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80',
    color: '#f59e0b',
    badge: 'FPV',
    specs: [
      { icon: Zap, label: 'Vitesse max', value: '120 km/h' },
      { icon: Camera, label: 'Caméra', value: '4K 120fps GoPro' },
      { icon: Battery, label: 'Autonomie', value: '8–12 minutes' },
      { icon: Cpu, label: 'Pilotage', value: 'Manuel — Lunettes VR' },
    ],
    usages: ['Vidéo cinématique immersive', 'Passages en espaces confinés', 'Événementiel sportif', 'Publicités & clips musicaux'],
    desc: 'Pour les séquences impossibles. Le Guêpier peut se faufiler dans un tunnel, dépasser une voiture sur une piste ou descendre en piqué à 100 km/h. Une arme pour les productions cinématographiques d\'exception.'
  },
  {
    id: 'mavic',
    name: "L'Albatros",
    subtitle: 'DJI Mavic 3 Pro',
    tagline: 'L\'image parfaite, partout',
    image: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=800&auto=format&fit=crop&q=80',
    color: '#8b5cf6',
    badge: 'CINÉMA',
    specs: [
      { icon: Camera, label: 'Résolution', value: '50MP Hasselblad' },
      { icon: Battery, label: 'Autonomie', value: '43 minutes' },
      { icon: Wind, label: 'Stabilisation', value: '3 axes — RockSteady' },
      { icon: Cpu, label: 'Capteurs', value: 'RGB + Tele + MFT' },
    ],
    usages: ['Événements & mariages', 'Photographie immobilière', 'Films institutionnels', 'Contenu réseaux sociaux'],
    desc: 'Notre outil universel pour la qualité d\'image maximale. Triple caméra Hasselblad, image 50 mégapixels et 43 minutes d\'autonomie. Il fait le bonheur des clients immobiliers, des mariages et des productions institutionnelles.'
  },
];

export default function GaragePage() {
  const [selected, setSelected] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });
  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  const drones = DEFAULT_DRONES.map(d => ({
    ...d,
    name: sMap[`garage_${d.id}_name`] || d.name,
    subtitle: sMap[`garage_${d.id}_subtitle`] || d.subtitle,
    tagline: sMap[`garage_${d.id}_tagline`] || d.tagline,
    desc: sMap[`garage_${d.id}_desc`] || d.desc,
    badge: sMap[`garage_${d.id}_badge`] || d.badge,
  }));

  const drone = selected ? drones.find(d => d.id === selected) : null;

  return (
    <div className="pt-24 min-h-screen pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Notre flotte
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            Le <span className="gradient-text">Garage</span>
          </h1>
          <p className="font-inter text-muted-foreground max-w-xl leading-relaxed">
            Chaque machine est choisie pour une mission précise. Découvrez notre flotte, 
            ses capacités techniques et les missions pour lesquelles elle excelle.
          </p>
        </motion.div>
      </div>

      {/* Drone Grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {drones.map((drone, i) => (
            <motion.div
              key={drone.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(drone.id)}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card cursor-pointer hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
              style={{ '--drone-color': drone.color }}
            >
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${drone.color}20`, color: drone.color, border: `1px solid ${drone.color}40` }}>
                {drone.badge}
              </div>

              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img src={drone.image} alt={drone.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, hsl(var(--card)) 0%, transparent 60%)` }} />
                <div className="absolute inset-0 grid-bg opacity-30" />
              </div>

              {/* Content */}
              <div className="p-6 -mt-8 relative">
                <h2 className="font-grotesk font-bold text-2xl" style={{ color: drone.color }}>{drone.name}</h2>
                <p className="font-mono text-xs text-muted-foreground mb-1">{drone.subtitle}</p>
                <p className="font-inter text-sm text-foreground/80 italic mb-4">"{drone.tagline}"</p>

                {/* Mini specs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {drone.specs.slice(0, 2).map((spec, si) => {
                    const Icon = spec.icon;
                    return (
                      <div key={si} className="bg-secondary/60 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon className="w-3 h-3" style={{ color: drone.color }} />
                          <p className="font-mono text-[9px] text-muted-foreground uppercase">{spec.label}</p>
                        </div>
                        <p className="font-inter text-xs font-semibold">{spec.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 font-inter text-xs font-medium" style={{ color: drone.color }}>
                  Voir les specs complètes <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {drone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden rounded-t-2xl">
                <img src={drone.image} alt={drone.name} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, hsl(var(--card)) 0%, transparent 50%)` }} />
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6">
                  <h2 className="font-grotesk font-bold text-3xl" style={{ color: drone.color }}>{drone.name}</h2>
                  <p className="font-mono text-xs text-muted-foreground">{drone.subtitle}</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">{drone.desc}</p>

                <div>
                  <p className="font-inter text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Caractéristiques techniques</p>
                  <div className="grid grid-cols-2 gap-3">
                    {drone.specs.map((spec, si) => {
                      const Icon = spec.icon;
                      return (
                        <div key={si} className="bg-secondary/60 rounded-xl p-3 border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3.5 h-3.5" style={{ color: drone.color }} />
                            <p className="font-mono text-[9px] text-muted-foreground uppercase">{spec.label}</p>
                          </div>
                          <p className="font-inter text-sm font-semibold">{spec.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-inter text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Missions principales</p>
                  <div className="space-y-1.5">
                    {drone.usages.map((u, ui) => (
                      <div key={ui} className="flex items-center gap-2.5 font-inter text-sm">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: drone.color }} />
                        {u}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}