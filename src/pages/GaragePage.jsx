import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Camera, Wind, Battery, Cpu, X, ChevronRight, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const DEFAULT_DRONES = [
  {
    id: 'matrice',
    name: "L'Aigle",
    subtitle: 'DJI Matrice 30T',
    tagline: 'Pour l\'industrie extrême',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=85',
    color: '#38aadc',
    badge: 'INDUSTRIE',
    specs: [
      { icon: Wind,    label: 'Résistance vent', value: '15 m/s (Force 7)' },
      { icon: Battery, label: 'Autonomie',        value: '41 minutes' },
      { icon: Camera,  label: 'Caméra',           value: 'Thermique + 4K HDR' },
      { icon: Shield,  label: 'Étanchéité',       value: 'IP55 — Résiste à la pluie' },
    ],
    usages: ['Inspection toiture & industrielle', 'Thermographie bâtiment', 'Surveillance longue durée', 'Missions en conditions extrêmes'],
    desc: 'Notre cheval de bataille pour les missions critiques. Résistant à la pluie, au froid et aux vents violents, il embarque une caméra thermique et une zoom 4K. Idéal pour les inspections d\'infrastructures exigeantes.',
  },
  {
    id: 'fpv',
    name: 'Le Guêpier',
    subtitle: 'Drone FPV Cinématique',
    tagline: 'La vitesse à l\'état pur',
    image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=1200&auto=format&fit=crop&q=85',
    color: '#f59e0b',
    badge: 'FPV',
    specs: [
      { icon: Zap,     label: 'Vitesse max',  value: '120 km/h' },
      { icon: Camera,  label: 'Caméra',       value: '4K 120fps GoPro' },
      { icon: Battery, label: 'Autonomie',    value: '8–12 minutes' },
      { icon: Cpu,     label: 'Pilotage',     value: 'Manuel — Lunettes VR' },
    ],
    usages: ['Vidéo cinématique immersive', 'Passages en espaces confinés', 'Événementiel sportif', 'Publicités & clips musicaux'],
    desc: 'Pour les séquences impossibles. Le Guêpier peut se faufiler dans un tunnel, dépasser une voiture sur une piste ou descendre en piqué à 100 km/h. Une arme pour les productions cinématographiques d\'exception.',
  },
  {
    id: 'mavic',
    name: "L'Albatros",
    subtitle: 'DJI Mavic 3 Pro',
    tagline: 'L\'image parfaite, partout',
    image: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=1200&auto=format&fit=crop&q=85',
    color: '#8b5cf6',
    badge: 'CINÉMA',
    specs: [
      { icon: Camera,  label: 'Résolution',   value: '50MP Hasselblad' },
      { icon: Battery, label: 'Autonomie',    value: '43 minutes' },
      { icon: Wind,    label: 'Stabilisation',value: '3 axes RockSteady' },
      { icon: Cpu,     label: 'Capteurs',     value: 'RGB + Tele + MFT' },
    ],
    usages: ['Événements & mariages', 'Photographie immobilière', 'Films institutionnels', 'Contenu réseaux sociaux'],
    desc: 'Notre outil universel pour la qualité d\'image maximale. Triple caméra Hasselblad, image 50 mégapixels et 43 minutes d\'autonomie. Il fait le bonheur des clients immobiliers, des mariages et des productions institutionnelles.',
  },
];

function DroneModal({ drone, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ boxShadow: `0 0 80px ${drone.color}18` }}
      >
        {/* Cover */}
        <div className="relative h-60 sm:h-72 overflow-hidden rounded-t-3xl sm:rounded-t-3xl flex-shrink-0">
          <img src={drone.image} alt={drone.name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.5) saturate(0.7)' }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, hsl(var(--card)) 0%, transparent 55%)` }} />
          {/* Color accent line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: drone.color }} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-5 left-6 right-16">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
              style={{ background: `${drone.color}25`, color: drone.color, border: `1px solid ${drone.color}40` }}>
              {drone.badge}
            </span>
            <h2 className="font-grotesk font-bold text-3xl text-white leading-tight">{drone.name}</h2>
            <p className="font-mono text-xs mt-0.5" style={{ color: drone.color }}>{drone.subtitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-7">
          <p className="font-inter text-base text-foreground/70 leading-relaxed">{drone.desc}</p>

          {/* Specs grid */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Caractéristiques techniques</p>
            <div className="grid grid-cols-2 gap-3">
              {drone.specs.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="rounded-xl p-3.5 border border-border bg-secondary/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: drone.color }} />
                      <p className="font-mono text-[9px] uppercase text-muted-foreground tracking-wider">{spec.label}</p>
                    </div>
                    <p className="font-grotesk font-semibold text-sm">{spec.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usages */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Missions principales</p>
            <div className="space-y-2">
              {drone.usages.map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${drone.color}20`, border: `1px solid ${drone.color}40` }}>
                    <Check className="w-3 h-3" style={{ color: drone.color }} />
                  </div>
                  <span className="font-inter text-sm text-foreground/80">{u}</span>
                </div>
              ))}
            </div>
          </div>

          <Link to="/quote" onClick={onClose}>
            <button className="w-full py-3.5 rounded-xl font-grotesk font-semibold text-sm transition-colors duration-150 cursor-pointer"
              style={{ background: drone.color, color: '#fff' }}>
              Réserver cette machine
            </button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GaragePage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_garage_enabled');
  const [selected, setSelected] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });
  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Garage indisponible" message="La page Garage est temporairement désactivée." />;

  const drones = DEFAULT_DRONES.map(d => ({
    ...d,
    name:     sMap[`garage_${d.id}_name`]     || d.name,
    subtitle: sMap[`garage_${d.id}_subtitle`] || d.subtitle,
    tagline:  sMap[`garage_${d.id}_tagline`]  || d.tagline,
    desc:     sMap[`garage_${d.id}_desc`]     || d.desc,
    badge:    sMap[`garage_${d.id}_badge`]    || d.badge,
  }));

  const activeDrone = selected ? drones.find(d => d.id === selected) : null;

  return (
    <div className="min-h-screen pb-24">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-5 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Notre flotte — {drones.length} machines
            </div>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-5 leading-[1.05]">
              Le <span className="gradient-text">Garage</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-lg leading-relaxed">
              Chaque machine est choisie pour une mission précise. Matériel professionnel, certifié, assuré — taillé pour la performance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Drone cards ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {drones.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              onClick={() => setSelected(d.id)}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card cursor-pointer transition-all duration-300 hover:-translate-y-2"
              style={{ boxShadow: 'none' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px ${d.color}20`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Color top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 group-hover:h-1"
                style={{ background: d.color }} />

              {/* Badge */}
              <div className="absolute top-5 left-5 z-10 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${d.color}20`, color: d.color, border: `1px solid ${d.color}40` }}>
                {d.badge}
              </div>

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={d.image}
                  alt={d.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: 'brightness(0.55) saturate(0.7)' }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, hsl(var(--card)) 5%, transparent 65%)` }} />
              </div>

              {/* Content */}
              <div className="p-6 -mt-6 relative">
                <h2 className="font-grotesk font-bold text-2xl mb-0.5" style={{ color: d.color }}>{d.name}</h2>
                <p className="font-mono text-xs text-muted-foreground mb-1">{d.subtitle}</p>
                <p className="font-inter text-sm text-foreground/60 italic mb-5">"{d.tagline}"</p>

                {/* 2 key specs */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {d.specs.slice(0, 2).map((spec, si) => {
                    const Icon = spec.icon;
                    return (
                      <div key={si} className="rounded-xl p-3 border border-border/60 bg-secondary/40">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3 h-3" style={{ color: d.color }} />
                          <p className="font-mono text-[9px] text-muted-foreground uppercase">{spec.label}</p>
                        </div>
                        <p className="font-inter text-xs font-semibold">{spec.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 font-inter text-xs font-medium transition-gap duration-150"
                  style={{ color: d.color }}>
                  Voir les specs complètes
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 mt-14">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div>
            <p className="font-grotesk font-bold text-xl mb-1">Pas sûr de quelle machine vous faut ?</p>
            <p className="font-inter text-sm text-muted-foreground">Notre équipe sélectionne le matériel adapté à chaque mission.</p>
          </div>
          <Link to="/quote" className="flex-shrink-0">
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-grotesk font-semibold text-sm hover:bg-primary/90 transition-colors duration-150 cursor-pointer whitespace-nowrap">
              Demander un devis <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* ── Drone detail modal ── */}
      <AnimatePresence>
        {activeDrone && <DroneModal drone={activeDrone} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}