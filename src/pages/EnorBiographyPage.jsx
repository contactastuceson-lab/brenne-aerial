import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Music, Plane, Code, Award, GraduationCap, MapPin, ExternalLink,
  Mic2, Globe2, Layers, Sparkles, Building2, Star, ChevronRight,
  Calendar, Quote, ArrowUpRight, Play, Piano
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────── */
const TIMELINE = [
  { year: '2007', label: 'Naissance', desc: 'Aldan, République de Sakha (Iakoutie), Russie', icon: Star },
  { year: '2019', label: 'Maîtrise de Paris', desc: 'Début du chant classique & piano au CRR de Paris', icon: Music },
  { year: '2020', label: 'Double cursus', desc: 'Lycées Lamartine & Octave Gréard + CRR de Paris', icon: GraduationCap },
  { year: '2023', label: 'Orchestre de Paris', desc: 'Chœur de Jeunes — Carmina Burana, Fauré, Luminescence', icon: Mic2 },
  { year: '2025', label: 'Collège d\'Alma', desc: 'Québec, Canada — Technologies Sonores', icon: MapPin },
  { year: '2026', label: 'Brenne Aerial', desc: 'Fondation de l\'entreprise de services drone', icon: Plane },
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

const PHOTO = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/69e824fda_IMG_20260108_192238_6241-converti-depuis-webp.png';

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function EnorBiographyPage() {
  const [activeTab, setActiveTab] = useState('bio');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════
          HERO — MAGAZINE COVER SPLIT
      ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">

        {/* Full-bleed background photo (right side bleeds in) */}
        <div className="absolute inset-0">
          <motion.div style={{ scale: imgScale }} className="absolute inset-0 origin-right">
            <img
              src={PHOTO}
              alt="Enor Lefoulon Meyer"
              className="absolute right-0 top-0 h-full w-[55%] object-cover object-top"
              fetchpriority="high"
            />
          </motion.div>
          {/* Gradient mask: left solid → bleed into photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-20" />
        </div>

        {/* Animated ambient orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 pt-32 pb-28"
        >
          <div className="max-w-2xl">

            {/* Eyebrow breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground mb-10"
            >
              <span className="w-6 h-px bg-primary/60" />
              <span className="text-primary">Biographie</span>
              <span className="opacity-40">/</span>
              <span>Fondateur · Artiste · Entrepreneur</span>
            </motion.div>

            {/* Name — oversized editorial */}
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-grotesk font-black leading-[0.88] tracking-tight mb-2"
                style={{ fontSize: 'clamp(4rem, 11vw, 9.5rem)' }}>
                Enor
              </h1>
              <h1 className="font-grotesk font-black leading-[0.88] tracking-tight mb-2 gradient-text sky-glow-text"
                style={{ fontSize: 'clamp(4rem, 11vw, 9.5rem)' }}>
                Lefoulon
              </h1>
              <h1 className="font-grotesk font-black leading-[0.88] tracking-tight"
                style={{
                  fontSize: 'clamp(4rem, 11vw, 9.5rem)',
                  WebkitTextStroke: '1.5px hsl(var(--foreground)/20)',
                  WebkitTextFillColor: 'transparent',
                }}>
                Meyer
              </h1>
            </motion.div>

            {/* Subtitle line */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="flex items-center gap-4 mt-8 mb-6"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
              <span className="font-mono text-xs text-primary uppercase tracking-[0.2em]">né le 9 août 2007</span>
            </motion.div>

            {/* Role tags */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {[
                { label: 'Ténor classique', color: 'border-blue-400/30 text-blue-300 bg-blue-400/5' },
                { label: 'Fondateur & PDG', color: 'border-primary/30 text-primary bg-primary/5' },
                { label: 'Développeur', color: 'border-emerald-400/30 text-emerald-300 bg-emerald-400/5' },
                { label: 'Créateur de contenu', color: 'border-purple-400/30 text-purple-300 bg-purple-400/5' },
              ].map(tag => (
                <span key={tag.label} className={`font-inter text-xs px-3 py-1.5 rounded-full border ${tag.color} backdrop-blur-sm`}>
                  {tag.label}
                </span>
              ))}
            </motion.div>

            {/* Quick stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
              className="grid grid-cols-3 gap-3 max-w-md"
            >
              {[
                { val: '200+', sub: 'Missions drone' },
                { val: '6 ans', sub: 'Chant classique' },
                { val: '2',    sub: 'Ensembles majeurs' },
              ].map(s => (
                <div key={s.val} className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <p className="font-grotesk font-black text-xl text-primary">{s.val}</p>
                  <p className="font-inter text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>


      {/* ═══ STICKY NAV ═══ */}
      <div className="sticky top-16 z-30 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <nav className="flex gap-0 overflow-x-auto py-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 px-6 py-3 font-inter text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>


      {/* ═══ CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >

            {/* ════ BIOGRAPHIE ════ */}
            {activeTab === 'bio' && (
              <div className="space-y-24">

                {/* Lead section — editorial 2-col */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">

                  {/* Main text */}
                  <div className="lg:col-span-7 space-y-10">

                    {/* Pull quote */}
                    <blockquote className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent" />
                      <Quote className="w-8 h-8 text-primary/20 mb-3" />
                      <p className="font-grotesk font-semibold text-2xl sm:text-3xl text-foreground leading-tight tracking-tight">
                        "Artiste, entrepreneur et bâtisseur — une génération qui refuse de choisir entre l'art et la technologie."
                      </p>
                    </blockquote>

                    <div className="space-y-5 font-inter text-base text-muted-foreground leading-[1.85]">
                      <p>
                        <strong className="text-foreground font-semibold">Enor Lefoulon Meyer</strong>, né le 9 août 2007 à Aldan, en République de Sakha (Iakoutie), Russie, est un artiste lyrique, musicien, créateur de contenu et entrepreneur français.
                      </p>
                      <p>
                        Reconnu pour son activité dans le domaine du <strong className="text-foreground font-medium">chant classique en tant que ténor</strong>, il est également fondateur de <strong className="text-foreground font-medium">Brenne Aerial</strong>, société spécialisée dans les services aériens par drone.
                      </p>
                      <p>
                        Son parcours se distingue par la combinaison rare de disciplines artistiques et techniques — musique classique, développement web, pilotage drone et production audiovisuelle — portées par une vision entrepreneuriale affirmée dès l'adolescence.
                      </p>
                    </div>

                    {/* Formation — timeline verticale */}
                    <div>
                      <h3 className="font-grotesk font-bold text-lg mb-6 flex items-center gap-2.5">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Formation académique
                      </h3>
                      <div className="relative space-y-0">
                        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border/60 to-transparent" />
                        {[
                          { period: '2019–2025', school: 'CRR de Paris',              detail: 'Piano et Chant classique' },
                          { period: '2020–2023', school: 'Lycées Lamartine & Gréard', detail: 'Double cursus avec le CRR de Paris' },
                          { period: '2023–2025', school: 'Lycée Bergson',             detail: 'Mathématiques, Physique, Musique — Paris 19e' },
                          { period: '2025–',     school: 'Collège d\'Alma',           detail: 'Québec, Canada — Technologies Sonores' },
                        ].map((e, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-5 pb-5 last:pb-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 relative z-10 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className="font-mono text-[10px] text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded">{e.period}</span>
                                <p className="font-grotesk font-semibold text-sm">{e.school}</p>
                              </div>
                              <p className="font-inter text-xs text-muted-foreground">{e.detail}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar — fiche + stats */}
                  <div className="lg:col-span-5 space-y-5">

                    {/* Photo card */}
                    <div className="rounded-2xl overflow-hidden border border-border/50 aspect-[4/5] relative">
                      <img src={PHOTO} alt="Enor Lefoulon Meyer" className="w-full h-full object-cover object-top" />
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <p className="font-grotesk font-bold text-sm">Enor Lefoulon Meyer</p>
                        <p className="font-mono text-[10px] text-muted-foreground">Fondateur & PDG · Brenne Aerial</p>
                      </div>
                    </div>

                    {/* Fiche identité */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-border">
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Fiche d'identité</p>
                      </div>
                      <div className="divide-y divide-border/50">
                        {[
                          { label: 'Né le',            value: '9 août 2007' },
                          { label: 'Lieu de naissance', value: 'Aldan, Iakoutie, Russie' },
                          { label: 'Nationalité',      value: 'Française' },
                          { label: 'Tessiture vocale', value: 'Ténor' },
                          { label: 'Entreprise',       value: 'Brenne Aerial' },
                          { label: 'Études actuelles', value: 'Collège d\'Alma, QC' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-2.5">
                            <span className="font-inter text-xs text-muted-foreground flex-shrink-0">{label}</span>
                            <span className="font-inter text-xs font-medium text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: '200+', label: 'Missions drone', icon: Plane },
                        { val: '4K',   label: 'Qualité vidéo',  icon: Globe2 },
                        { val: '6 ans', label: 'De chant',       icon: Mic2 },
                        { val: '2',    label: 'Ensembles',      icon: Music },
                      ].map(s => {
                        const Icon = s.icon;
                        return (
                          <div key={s.val} className="rounded-xl border border-border/40 bg-card/60 p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-3.5 h-3.5 text-primary/60" />
                            </div>
                            <p className="font-grotesk font-black text-2xl text-primary leading-none">{s.val}</p>
                            <p className="font-inter text-[10px] text-muted-foreground mt-1">{s.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chronologie — horizontal scroller / vertical timeline */}
                <div>
                  <div className="flex items-center gap-4 mb-12">
                    <h3 className="font-grotesk font-bold text-2xl sm:text-3xl">Chronologie</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>

                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />

                    <div className="space-y-6">
                      {TIMELINE.map((item, i) => {
                        const Icon = item.icon;
                        const isRight = i % 2 === 0;
                        return (
                          <motion.div
                            key={item.year}
                            initial={{ opacity: 0, x: isRight ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="relative flex items-center gap-4 sm:gap-0"
                          >
                            {/* Left side (desktop) */}
                            <div className={`hidden sm:flex flex-1 ${isRight ? 'justify-end pr-10' : 'justify-start pl-10 order-last'}`}>
                              <div className={`rounded-2xl border border-border/50 bg-card p-5 max-w-xs w-full hover:border-primary/30 transition-colors ${isRight ? 'text-right' : 'text-left'}`}>
                                <span className="font-mono text-xs font-bold text-primary">{item.year}</span>
                                <h4 className="font-grotesk font-bold text-base mt-1">{item.label}</h4>
                                <p className="font-inter text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                              </div>
                            </div>

                            {/* Center dot */}
                            <div className="relative z-10 w-12 h-12 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center flex-shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sky-glow">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>

                            {/* Right side (desktop) / mobile only */}
                            <div className={`flex-1 sm:flex-none sm:hidden`}>
                              <div className="rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-colors">
                                <span className="font-mono text-xs font-bold text-primary">{item.year}</span>
                                <h4 className="font-grotesk font-bold text-base mt-1">{item.label}</h4>
                                <p className="font-inter text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                              </div>
                            </div>

                            {/* Hidden placeholder for desktop alternation */}
                            <div className={`hidden sm:block flex-1 ${isRight ? 'order-last pl-10' : 'pr-10'}`} />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ════ MUSIQUE ════ */}
            {activeTab === 'musique' && (
              <div className="space-y-20">

                {/* Hero banner */}
                <div className="relative rounded-3xl overflow-hidden border border-primary/15 min-h-[280px] flex items-center"
                  style={{ background: 'linear-gradient(135deg, hsl(214 50% 4%) 0%, hsl(205 70% 6%) 100%)' }}
                >
                  <div className="absolute inset-0 grid-bg opacity-15" />
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />
                  <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />

                  <div className="relative px-10 py-14 lg:px-16 max-w-2xl">
                    <p className="font-mono text-xs text-primary mb-4 uppercase tracking-widest">Tessiture vocale</p>
                    <h2 className="font-grotesk font-black text-6xl sm:text-8xl mb-5 leading-none">Ténor</h2>
                    <p className="font-inter text-muted-foreground text-base leading-relaxed max-w-lg">
                      Formé au Conservatoire à Rayonnement Régional de Paris depuis 2019, Enor a chanté dans des productions majeures de la scène classique française — du baroque au contemporain.
                    </p>
                    <div className="flex gap-3 mt-8">
                      <span className="font-mono text-xs border border-primary/25 bg-primary/8 text-primary px-3 py-1.5 rounded-full">Baroque</span>
                      <span className="font-mono text-xs border border-border bg-card text-muted-foreground px-3 py-1.5 rounded-full">Romantique</span>
                      <span className="font-mono text-xs border border-border bg-card text-muted-foreground px-3 py-1.5 rounded-full">Contemporain</span>
                    </div>
                  </div>
                </div>

                {/* Instruments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: Mic2,  name: 'Chant classique', sub: 'Tessiture ténor', desc: 'Répertoire baroque, romantique et contemporain. Formation au CRR de Paris de 2019 à 2025.', level: 90 },
                    { icon: Piano, name: 'Piano',           sub: 'Instrument polyphonique', desc: 'Étude du piano en parallèle du chant, au sein du CRR de Paris depuis 2019.', level: 75 },
                  ].map((inst, i) => {
                    const Icon = inst.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-2xl border border-border bg-card group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <p className="font-grotesk font-bold text-lg">{inst.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{inst.sub}</p>
                          </div>
                        </div>
                        <p className="font-inter text-sm text-muted-foreground mb-6 leading-relaxed">{inst.desc}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-mono text-[10px] text-muted-foreground">Niveau</span>
                            <span className="font-mono text-[10px] text-primary">{inst.level}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} whileInView={{ width: `${inst.level}%` }}
                              viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Répertoire */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="font-grotesk font-bold text-2xl">Répertoire & Ensembles</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {REPERTOIRE.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-border bg-card p-7 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex flex-col gap-2 mb-6">
                          <span className="font-mono text-xs text-primary border border-primary/20 bg-primary/5 px-3 py-1 rounded-full self-start">{r.period}</span>
                          <h4 className="font-grotesk font-bold text-xl">{r.ensemble}</h4>
                        </div>
                        <ul className="space-y-3">
                          {r.works.map((w, j) => (
                            <li key={j} className="flex items-start gap-3 font-inter text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* ════ BRENNE AERIAL ════ */}
            {activeTab === 'drone' && (
              <div className="space-y-20">

                {/* Split hero */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="w-6 h-px bg-primary/60" />
                      <span className="font-mono text-xs text-primary uppercase tracking-widest">Fondée en 2026</span>
                    </div>
                    <h2 className="font-grotesk font-black text-4xl sm:text-6xl mb-6 leading-[0.9] tracking-tight">
                      L'entrepreneuriat<br />au service de<br /><span className="gradient-text">l'aérien.</span>
                    </h2>
                    <p className="font-inter text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
                      Brenne Aerial est née de la passion d'Enor pour l'aéronautique, la photographie et la vidéo. Spécialisée dans les services aériens par drone, elle propose des solutions complètes pour professionnels et particuliers.
                    </p>
                    <Link to="/">
                      <button className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground font-grotesk font-semibold px-7 py-3.5 rounded-xl hover:bg-primary/90 transition-colors sky-glow cursor-pointer">
                        Visiter Brenne Aerial <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  {/* Stats bento */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: '4K',   label: 'Qualité vidéo',  sub: 'Captation HD' },
                      { val: '48h',  label: 'Délai réponse',  sub: 'Devis gratuit' },
                      { val: 'DGAC', label: 'Certifié',       sub: 'Télépilote homologué' },
                      { val: '2026', label: 'Fondation',      sub: 'Entreprise française' },
                    ].map(s => (
                      <div key={s.val} className="rounded-2xl border border-primary/15 bg-primary/5 p-6">
                        <p className="font-grotesk font-black text-4xl text-primary leading-none mb-2">{s.val}</p>
                        <p className="font-grotesk font-semibold text-sm">{s.label}</p>
                        <p className="font-inter text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services grid */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="font-grotesk font-bold text-2xl">Spécialisations</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Building2, label: 'Captation aérienne',     desc: 'Photos et vidéos 4K depuis les airs' },
                      { icon: Award,     label: 'Inspections techniques',  desc: 'Toitures, façades, infrastructures' },
                      { icon: Layers,    label: 'Suivi de chantiers',      desc: 'Monitoring régulier de l\'avancement' },
                      { icon: Globe2,    label: 'Patrimoine & Tourisme',   desc: 'Valorisation de sites historiques' },
                      { icon: Sparkles,  label: 'Événementiel',            desc: 'Mariages, concerts, événements live' },
                      { icon: Plane,     label: 'Retour temps réel',       desc: 'Streaming aérien en direct' },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                          className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/3 transition-all duration-200"
                        >
                          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <h4 className="font-grotesk font-bold text-sm mb-1.5">{s.label}</h4>
                          <p className="font-inter text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}


            {/* ════ COMPÉTENCES ════ */}
            {activeTab === 'skills' && (
              <div className="space-y-20">

                {/* Header */}
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-6 h-px bg-primary/60" />
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">Polyvalence</span>
                  </div>
                  <h2 className="font-grotesk font-black text-4xl sm:text-6xl mb-5 leading-[0.9]">
                    Art, tech,<br />entrepreneuriat —<br /><span className="gradient-text">tout à la fois.</span>
                  </h2>
                  <p className="font-inter text-muted-foreground text-base leading-relaxed">
                    Enor combine des domaines qui semblent opposés pour créer des projets singuliers à la frontière de la création artistique et de l'innovation technologique.
                  </p>
                </div>

                {/* Skills grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SKILLS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                        className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-grotesk font-bold text-base mb-2">{s.label}</h4>
                        <p className="font-inter text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Outils */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-grotesk font-bold text-xl">Outils maîtrisés</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TOOLS.map(tool => (
                      <span key={tool} className="font-mono text-xs px-4 py-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-default">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Centres d'intérêt */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-grotesk font-bold text-xl">Centres d'intérêt</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/6 border border-primary/15 font-inter text-sm text-primary/80 cursor-default hover:bg-primary/12 hover:text-primary transition-colors">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>


      {/* ═══ CTA FINAL ═══ */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-primary/15 p-12 lg:p-20 text-center"
            style={{ background: 'linear-gradient(135deg, hsl(214 40% 5%) 0%, hsl(205 50% 7%) 100%)' }}
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="font-mono text-xs text-primary mb-5 uppercase tracking-widest">Contact</p>
              <h2 className="font-grotesk font-black text-3xl sm:text-5xl mb-5 leading-tight">
                Un projet en tête ?
              </h2>
              <p className="font-inter text-muted-foreground max-w-sm mx-auto mb-10 text-base leading-relaxed">
                Contactez Brenne Aerial pour un devis gratuit sous 48h.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quote">
                  <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors sky-glow cursor-pointer">
                    Demander un devis <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="inline-flex items-center gap-2 border border-border/60 text-foreground font-grotesk font-semibold px-8 py-4 rounded-xl hover:bg-card transition-colors cursor-pointer">
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