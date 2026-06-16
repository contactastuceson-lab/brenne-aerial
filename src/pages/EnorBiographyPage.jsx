import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Music, Plane, Code, Award, GraduationCap, MapPin, ExternalLink,
  Mic2, Piano, Globe2, Layers, Sparkles, Building2, Star, ChevronRight,
  Calendar, Quote
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────── */
const TIMELINE = [
  { year: '2007', label: 'Naissance', desc: 'Aldan, République de Sakha (Iakoutie), Russie', icon: Star, color: 'bg-yellow-400' },
  { year: '2019', label: 'Maîtrise de Paris', desc: 'Début du chant classique & piano au CRR de Paris', icon: Music, color: 'bg-blue-400' },
  { year: '2020', label: 'Double cursus', desc: 'Lycées Lamartine & Octave Gréard + CRR de Paris', icon: GraduationCap, color: 'bg-purple-400' },
  { year: '2023', label: 'Orchestre de Paris', desc: 'Chœur de Jeunes — Carmina Burana, Fauré, Luminescence', icon: Mic2, color: 'bg-primary' },
  { year: '2025', label: 'Collège d\'Alma', desc: 'Québec, Canada — Technologies Sonores', icon: MapPin, color: 'bg-emerald-400' },
  { year: '2026', label: 'Brenne Aerial', desc: 'Fondation de l\'entreprise de services drone', icon: Plane, color: 'bg-accent' },
];

const REPERTOIRE = [
  {
    period: '2019–2023',
    ensemble: 'Maîtrise de Paris',
    works: [
      'Levantine Symphony n°1 — Ibrahim Maalouf',
      'Stabat Mater — G. B. Pergolesi (Chapelle de Versailles)',
    ],
  },
  {
    period: '2023–2025',
    ensemble: 'Chœur de Jeunes — Orchestre de Paris',
    works: [
      'Carmina Burana — Carl Orff',
      'Œuvres de Gabriel Fauré',
      'Spectacles Luminescence',
    ],
  },
];

const SKILLS = [
  { icon: Code,    label: 'Développement web',      desc: 'VS Code, GitHub, technologies modernes' },
  { icon: Music,   label: 'Audio & Production',     desc: 'Pro Tools, Reaper, Cubase, mixage' },
  { icon: Plane,   label: 'Pilotage drone',         desc: 'DGAC certifié, captation 4K' },
  { icon: Globe2,  label: 'Montage vidéo',          desc: 'Adobe Premiere Pro, post-production' },
  { icon: Layers,  label: 'Communication digitale', desc: 'Réseaux sociaux, gestion communauté' },
  { icon: Piano,   label: 'Musique classique',      desc: 'Ténor, piano — formation CRR Paris' },
];

const TOOLS = ['Pro Tools', 'Reaper', 'Cubase', 'Adobe Premiere Pro', 'Visual Studio Code', 'GitHub', 'Figma', 'Logic Pro'];

const INTERESTS = ['Aéronautique', 'Drones', 'Musique classique', 'Piano', 'Développement web', 'Communautés numériques', 'Réseaux sociaux', 'Spéléologie', 'Technologies innovantes'];

const TABS = [
  { id: 'bio',     label: 'Biographie' },
  { id: 'musique', label: 'Musique' },
  { id: 'drone',   label: 'Brenne Aerial' },
  { id: 'skills',  label: 'Compétences' },
];

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function EnorBiographyPage() {
  const [activeTab, setActiveTab] = useState('bio');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-background">

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-end overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <motion.div
            animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/6 rounded-full blur-[120px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/4 rounded-full blur-[100px] pointer-events-none"
          />
        </div>

        {/* Gradient fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 pb-24 pt-40">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 font-mono text-xs text-primary/80 border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Biographie officielle · Brenne Aerial
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Name block */}
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                className="font-grotesk font-black leading-[0.9] tracking-tight"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)' }}
              >
                Enor<br />
                <span className="gradient-text">Lefoulon</span><br />
                <span style={{ WebkitTextStroke: '1px hsl(var(--foreground)/30)', WebkitTextFillColor: 'transparent' }}>Meyer</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-2 mt-6"
              >
                {['Ténor classique', 'Fondateur Brenne Aerial', 'Développeur', 'Créateur de contenu'].map(tag => (
                  <span key={tag} className="font-inter text-sm px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground bg-background/60 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Info cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 grid grid-cols-2 gap-2"
            >
              {[
                { icon: Calendar, label: '9 août 2007',          sub: 'Aldan, Iakoutie, Russie' },
                { icon: Mic2,     label: 'Ténor',                sub: 'CRR de Paris' },
                { icon: Plane,    label: 'Brenne Aerial',        sub: 'Fondateur & PDG' },
                { icon: MapPin,   label: 'Québec, Canada',       sub: 'Collège d\'Alma 2025' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 backdrop-blur-md px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-grotesk font-semibold text-xs leading-tight truncate">{item.label}</p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ STICKY NAV ═══ */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-1.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-lg font-inter text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── BIOGRAPHIE ── */}
          {activeTab === 'bio' && (
            <div className="space-y-20">

              {/* Lead text + fiche */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {/* Pull quote */}
                  <div className="relative pl-6 border-l-2 border-primary/40">
                    <Quote className="absolute -top-1 -left-3 w-5 h-5 text-primary/40" />
                    <p className="font-grotesk font-medium text-xl text-foreground/80 leading-relaxed italic">
                      Artiste, entrepreneur et bâtisseur de projets, Enor Lefoulon Meyer incarne une génération qui refuse de choisir entre l'art et la technologie.
                    </p>
                  </div>

                  <div className="space-y-4 font-inter text-base text-muted-foreground leading-relaxed">
                    <p>
                      Enor Lefoulon Meyer, né le <strong className="text-foreground font-semibold">9 août 2007</strong> à Aldan, en République de Sakha (Iakoutie), Russie, est un artiste lyrique, musicien, créateur de contenu et entrepreneur français.
                    </p>
                    <p>
                      Reconnu pour son activité dans le domaine du <strong className="text-foreground font-semibold">chant classique en tant que ténor</strong>, il est également connu pour avoir fondé <strong className="text-foreground font-semibold">Brenne Aerial</strong>, société spécialisée dans les services aériens par drone.
                    </p>
                    <p>
                      Depuis son plus jeune âge, Enor développe une passion pour la musique, les technologies numériques et l'aéronautique. Son parcours se caractérise par la combinaison de disciplines artistiques et techniques rarement réunies chez une même personne.
                    </p>
                  </div>

                  {/* Formation */}
                  <div>
                    <h3 className="font-grotesk font-bold text-lg mb-5 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Formation
                    </h3>
                    <div className="space-y-3">
                      {[
                        { period: '2019–2025', school: 'CRR de Paris',               detail: 'Piano et Chant classique' },
                        { period: '2020–2023', school: 'Lycées Lamartine & Gréard',  detail: 'Double cursus avec le CRR de Paris' },
                        { period: '2023–2025', school: 'Lycée Bergson',              detail: 'Mathématiques, Physique, Musique — Paris 19e' },
                        { period: '2025',      school: 'Collège d\'Alma',            detail: 'Québec, Canada — Technologies Sonores' },
                      ].map((e, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/30 transition-colors">
                          <span className="font-mono text-xs text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5">{e.period}</span>
                          <div>
                            <p className="font-grotesk font-semibold text-sm">{e.school}</p>
                            <p className="font-inter text-xs text-muted-foreground mt-0.5">{e.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fiche identité */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border bg-secondary/30">
                      <p className="font-grotesk font-bold text-sm uppercase tracking-widest text-muted-foreground">Fiche</p>
                    </div>
                    <div className="divide-y divide-border/50">
                      {[
                        { label: 'Né le',            value: '9 août 2007' },
                        { label: 'Origine',          value: 'Aldan, Iakoutie, Russie' },
                        { label: 'Nationalité',      value: 'Française' },
                        { label: 'Voix',             value: 'Ténor' },
                        { label: 'Entreprise',       value: 'Brenne Aerial' },
                        { label: 'Études actuelles', value: 'Collège d\'Alma, QC' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-baseline justify-between gap-3 px-5 py-3">
                          <span className="font-inter text-xs text-muted-foreground flex-shrink-0">{label}</span>
                          <span className="font-inter text-sm font-medium text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: '200+', label: 'Missions drone' },
                      { val: '4K',   label: 'Qualité vidéo' },
                      { val: '6+',   label: 'Ans de chant' },
                      { val: '2',    label: 'Ensembles majeurs' },
                    ].map(s => (
                      <div key={s.val} className="rounded-xl border border-border/40 bg-card/40 p-4 text-center">
                        <p className="font-grotesk font-black text-2xl text-primary">{s.val}</p>
                        <p className="font-inter text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-grotesk font-bold text-2xl mb-10">Chronologie</h3>
                <div className="relative">
                  {/* Line */}
                  <div className="absolute left-[23px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
                  <div className="space-y-4">
                    {TIMELINE.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.year}
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                          className="flex items-start gap-5"
                        >
                          <div className={`w-12 h-12 rounded-xl ${item.color}/15 border border-current/20 flex items-center justify-center flex-shrink-0 relative z-10`}
                            style={{ borderColor: `color-mix(in srgb, currentColor 20%, transparent)` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: `hsl(var(--primary))` }} />
                          </div>
                          <div className="flex-1 rounded-xl border border-border/40 bg-card/40 px-5 py-4 hover:border-primary/25 transition-colors">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono text-xs font-bold text-primary">{item.year}</span>
                              <h4 className="font-grotesk font-semibold text-sm">{item.label}</h4>
                            </div>
                            <p className="font-inter text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MUSIQUE ── */}
          {activeTab === 'musique' && (
            <div className="space-y-16">

              {/* Hero musical */}
              <div className="relative rounded-3xl overflow-hidden border border-primary/20 p-10 lg:p-16"
                style={{ background: 'linear-gradient(135deg, hsl(205 90% 4%) 0%, hsl(214 50% 5%) 100%)' }}
              >
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 sky-glow">
                    <Mic2 className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-primary mb-2 uppercase tracking-widest">Tessiture vocale</p>
                    <h2 className="font-grotesk font-black text-4xl sm:text-5xl mb-3">Ténor</h2>
                    <p className="font-inter text-muted-foreground max-w-lg leading-relaxed">
                      Formé au Conservatoire à Rayonnement Régional de Paris depuis 2019, Enor a participé à des productions majeures de la scène classique française — du baroque au contemporain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Répertoire */}
              <div>
                <h3 className="font-grotesk font-bold text-2xl mb-8">Répertoire & Ensembles</h3>
                <div className="space-y-4">
                  {REPERTOIRE.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="rounded-2xl border border-border bg-card p-7 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                        <span className="font-mono text-xs text-primary border border-primary/25 bg-primary/8 px-3 py-1.5 rounded-full">{r.period}</span>
                        <h4 className="font-grotesk font-bold text-lg">{r.ensemble}</h4>
                      </div>
                      <ul className="space-y-2.5">
                        {r.works.map((w, j) => (
                          <li key={j} className="flex items-start gap-3 font-inter text-sm text-muted-foreground">
                            <span className="w-1 h-1 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Instruments */}
              <div>
                <h3 className="font-grotesk font-bold text-2xl mb-8">Instruments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { icon: Mic2,  name: 'Chant classique', desc: 'Tessiture ténor — Répertoire baroque, romantique, contemporain', level: 90 },
                    { icon: Piano, name: 'Piano',           desc: 'Formation au CRR de Paris depuis 2019', level: 75 },
                  ].map((inst, i) => {
                    const Icon = inst.icon;
                    return (
                      <div key={i} className="p-6 rounded-2xl border border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-grotesk font-bold text-base">{inst.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">Niveau avancé</p>
                          </div>
                        </div>
                        <p className="font-inter text-sm text-muted-foreground mb-4 leading-relaxed">{inst.desc}</p>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: `${inst.level}%` }}
                            viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── BRENNE AERIAL ── */}
          {activeTab === 'drone' && (
            <div className="space-y-16">

              {/* Hero */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="font-mono text-xs text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-px bg-primary/60" />Fondée en 2026
                  </p>
                  <h2 className="font-grotesk font-black text-4xl sm:text-5xl mb-5 leading-tight">
                    L'entrepreneuriat au service de <span className="gradient-text">l'aérien.</span>
                  </h2>
                  <p className="font-inter text-muted-foreground text-base leading-relaxed mb-6">
                    Brenne Aerial est née de la passion d'Enor pour l'aéronautique, la photographie et la vidéo. Spécialisée dans les services aériens par drone, elle propose des solutions complètes pour professionnels et particuliers.
                  </p>
                  <Link to="/">
                    <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors sky-glow cursor-pointer text-sm">
                      Visiter Brenne Aerial <ExternalLink className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: '4K',   label: 'Qualité vidéo' },
                    { val: '48h',  label: 'Délai réponse' },
                    { val: 'DGAC', label: 'Certifié' },
                    { val: '2026', label: 'Fondation' },
                  ].map(s => (
                    <div key={s.val} className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                      <p className="font-grotesk font-black text-3xl text-primary">{s.val}</p>
                      <p className="font-inter text-xs text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-grotesk font-bold text-2xl mb-8">Spécialisations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Building2, label: 'Captation aérienne',    desc: 'Photos et vidéos 4K depuis les airs' },
                    { icon: Award,     label: 'Inspections techniques', desc: 'Toitures, façades, infrastructures' },
                    { icon: Layers,    label: 'Suivi de chantiers',     desc: 'Monitoring régulier de l\'avancement' },
                    { icon: Globe2,    label: 'Patrimoine & Tourisme',  desc: 'Valorisation de sites historiques' },
                    { icon: Sparkles,  label: 'Événementiel',           desc: 'Mariages, concerts, événements live' },
                    { icon: Plane,     label: 'Retour temps réel',      desc: 'Streaming aérien en direct' },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                        className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-grotesk font-semibold text-sm mb-1">{s.label}</h4>
                        <p className="font-inter text-xs text-muted-foreground">{s.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── COMPÉTENCES ── */}
          {activeTab === 'skills' && (
            <div className="space-y-16">

              <div>
                <p className="font-mono text-xs text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-px bg-primary/60" />Polyvalence
                </p>
                <h2 className="font-grotesk font-black text-4xl sm:text-5xl mb-4 leading-tight">
                  Art, tech, entrepreneuriat —<br /><span className="gradient-text">tout à la fois.</span>
                </h2>
                <p className="font-inter text-muted-foreground text-base max-w-2xl leading-relaxed">
                  Enor combine des domaines qui semblent opposés pour créer des projets singuliers à la frontière de la création artistique et de l'innovation technologique.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SKILLS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                      className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-grotesk font-bold text-base mb-1">{s.label}</h4>
                      <p className="font-inter text-sm text-muted-foreground">{s.desc}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Outils */}
              <div>
                <h3 className="font-grotesk font-bold text-xl mb-5">Outils maîtrisés</h3>
                <div className="flex flex-wrap gap-2">
                  {TOOLS.map(tool => (
                    <span key={tool} className="font-mono text-xs px-3 py-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-default">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Centres d'intérêt */}
              <div>
                <h3 className="font-grotesk font-bold text-xl mb-5">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <span key={interest} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 font-inter text-sm text-primary cursor-default hover:bg-primary/15 transition-colors">
                      <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-card p-12 lg:p-16 text-center">
            <div className="absolute inset-0 grid-bg opacity-25" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-primary/60 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative">
              <p className="font-mono text-xs text-primary mb-4 uppercase tracking-widest">Contact</p>
              <h2 className="font-grotesk font-black text-3xl sm:text-4xl mb-4">Un projet en tête ?</h2>
              <p className="font-inter text-muted-foreground max-w-sm mx-auto mb-8 text-base">
                Contactez Brenne Aerial pour un devis gratuit sous 48h.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quote">
                  <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors sky-glow cursor-pointer">
                    Demander un devis <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="inline-flex items-center gap-2 border border-border text-foreground font-grotesk font-semibold px-8 py-3.5 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
                    Nous contacter
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}