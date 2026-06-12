import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Play, Camera, Building2, HardHat, Video, Wifi, Briefcase,
  ChevronDown, Star, Award, Zap, Mail, FolderOpen, ScanSearch, Users,
  MapPin, Shield, CheckCircle2, Sparkles, Layers, Globe2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DroneWeatherWidget from '@/components/home/DronWeatherWidget';

const SERVICES_PREVIEW = [
  { icon: Video,     label: 'Vidéo événement',       desc: 'Captez chaque instant depuis les airs',           color: 'from-blue-500/20 to-cyan-500/10', border: 'group-hover:border-blue-400/50' },
  { icon: Building2, label: 'Inspection toiture',    desc: 'Diagnostic précis sans intervention humaine',      color: 'from-violet-500/20 to-purple-500/10', border: 'group-hover:border-violet-400/50' },
  { icon: HardHat,   label: 'Suivi chantier',        desc: 'Monitoring aérien de vos chantiers',              color: 'from-amber-500/20 to-orange-500/10', border: 'group-hover:border-amber-400/50' },
  { icon: Camera,    label: 'Captation particulier', desc: 'Vos souvenirs et propriétés vus du ciel',         color: 'from-emerald-500/20 to-teal-500/10', border: 'group-hover:border-emerald-400/50' },
  { icon: Briefcase, label: 'Captation entreprise',  desc: 'Clips institutionnels et vidéos marketing',       color: 'from-sky-500/20 to-blue-500/10', border: 'group-hover:border-sky-400/50' },
  { icon: Wifi,      label: 'Retour temps réel',     desc: 'Diffusion live de vos opérations',               color: 'from-rose-500/20 to-pink-500/10', border: 'group-hover:border-rose-400/50' },
  { icon: Video,     label: 'Contenu réseaux',       desc: 'Vidéos créatives pour vos plateformes',          color: 'from-indigo-500/20 to-blue-500/10', border: 'group-hover:border-indigo-400/50' },
  { icon: Camera,    label: 'Reportage',             desc: 'Documentaires et contenus éditoriaux',           color: 'from-teal-500/20 to-cyan-500/10', border: 'group-hover:border-teal-400/50' },
  { icon: Building2, label: 'Visite immobilière',    desc: 'Tour 360° de vos propriétés',                   color: 'from-orange-500/20 to-amber-500/10', border: 'group-hover:border-orange-400/50' },
  { icon: Camera,    label: 'Mariage',               desc: 'Captez votre plus beau jour depuis le ciel',     color: 'from-pink-500/20 to-rose-500/10', border: 'group-hover:border-pink-400/50' },
];

const SOON = [
  { icon: Building2, label: 'Photogramm. 3D',         desc: 'Modélisation 3D précise de vos projets' },
  { icon: HardHat,   label: 'Cartographie/Relevés',   desc: 'Cartes géoréférencées et relevés topographiques' },
  { icon: Camera,    label: 'Thermographie',           desc: 'Inspection thermique infrarouge' },
  { icon: Video,     label: 'Surveillance aérienne',  desc: 'Gardiennage et monitoring continu' },
  { icon: HardHat,   label: 'Agriculture/Monitoring', desc: 'Surveillance de cultures et monitoring aérien' },
];

const TRUST_POINTS = [
  { icon: Shield,       label: 'Certifié DGAC',      desc: 'Pilote homologué, assurance RC pro' },
  { icon: Zap,          label: 'Réponse en 48h',     desc: 'Devis gratuit, sans engagement' },
  { icon: Star,         label: '200+ missions',      desc: "Depuis 2023, partout en France" },
  { icon: CheckCircle2, label: 'Vidéo 4K',           desc: 'Captation haute définition garantie' },
];

function CountUp({ end, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  const isNumeric = /^\d+$/.test(end.replace(/[^0-9]/g, ''));
  const numericEnd = parseInt(end.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = end.replace(/[0-9]/g, '');

  useEffect(() => {
    if (!isNumeric || ref.current) return;
    ref.current = true;
    let start = 0;
    const step = numericEnd / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numericEnd) { setCount(numericEnd); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return <>{isNumeric ? `${count}${suffix}` : end}</>;
}

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const [activeService, setActiveService] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });
  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  const heroTitle1 = sMap['hero_title_1'] || 'Services drone';
  const heroTitle2 = sMap['hero_title_2'] || 'professionnels.';
  const heroDesc = sMap['hero_desc'] || 'Brenne Aerial propulse votre vision avec des solutions drone 4K de pointe — événements, inspections, chantiers, captations premium. Devis en 48h.';
  const heroBadge = sMap['hero_badge'] || 'Solutions drone professionnelles';
  const heroCta1 = sMap['hero_cta_primary'] || 'Demander un devis';
  const heroCta2 = sMap['hero_cta_secondary'] || 'Voir le portfolio';
  const heroImage = sMap['hero_image_url'] || 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=1800&auto=format&fit=crop&q=80';
  const weatherEnabled = sMap['weather_widget_enabled'] !== 'false';
  const weatherLocation = sMap['weather_location'] || 'Brenne, France';
  const aboutName = sMap['about_name'] || 'Enor Lefoulon Meyer';
  const aboutTitle = sMap['about_title'] || 'Fondateur & PDG';
  const aboutPhoto = sMap['about_photo_url'] || 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/69e824fda_IMG_20260108_192238_6241-converti-depuis-webp.png';
  const aboutHeadline = sMap['about_headline'] || "Expertise aérienne\nau service de vos projets.";
  const aboutDesc = sMap['about_desc'] || "Brenne Aerial offre des solutions drone complètes pour vos besoins professionnels : vidéo événement, inspections, chantiers, captations spécialisées. Réactivité, qualité 4K et tarifs justes.";
  const newsletterUrl = sMap['newsletter_url'] || 'https://a4835101.sibforms.com/serve/MUIFAC3C5UXdgrZ-CYR3iV27NCBuTTlUAVw80srFWWQ1uQqa9zEJu_QjFXyxzE_cjXKKN4npfoqMKMs9lLTQwXf3ox21FCxhlCz_wVgMTyX86xIWn29NjWLwDgvg5YGhFZ2acj3HZshol1zV0zwpXdvgB0dhKU6CE25yH20lCqS0cWOYOEXnQyfPG4HwSVpt7onwP66N9DD1OCspXQ==';

  const stats = [
    { val: sMap['stat_1_val'] || '200+', label: sMap['stat_1_label'] || 'Missions réalisées' },
    { val: sMap['stat_2_val'] || '4K',   label: sMap['stat_2_label'] || 'Qualité vidéo' },
    { val: sMap['stat_3_val'] || '99%',  label: sMap['stat_3_label'] || 'Satisfaction client' },
    { val: sMap['stat_4_val'] || '48h',  label: sMap['stat_4_label'] || 'Délai de réponse' },
  ];

  const PAGE_KEYS = [
    'page_homepage_enabled','page_services_enabled','page_portfolio_enabled','page_blog_enabled',
    'page_contact_enabled','page_quote_enabled','page_planning_enabled','page_discover_enabled',
    'page_messages_enabled','page_espace_client_enabled',
  ];
  const hasDisabled = PAGE_KEYS.some(k => sMap[k] === 'false');
  const isOffline = sMap['site_offline'] === 'true';
  const statusColor = isOffline ? 'red' : hasDisabled ? 'yellow' : 'green';
  const statusText = isOffline ? 'Site temporairement hors ligne' : hasDisabled ? 'Certains services indisponibles' : 'Tous les systèmes opérationnels';
  const dotClass = isOffline ? 'bg-red-500' : hasDisabled ? 'bg-yellow-400' : 'bg-green-500';
  const pingClass = isOffline ? 'bg-red-400' : hasDisabled ? 'bg-yellow-300' : 'bg-green-400';
  const textClass = isOffline ? 'text-red-400' : hasDisabled ? 'text-yellow-400' : 'text-green-400';
  const borderClass = isOffline ? 'border-red-500/20 hover:border-red-500/40' : hasDisabled ? 'border-yellow-400/20 hover:border-yellow-400/40' : 'border-green-500/20 hover:border-green-500/40';
  const bgClass = isOffline ? 'bg-red-500/5 hover:bg-red-500/10' : hasDisabled ? 'bg-yellow-400/5 hover:bg-yellow-400/10' : 'bg-green-500/5 hover:bg-green-500/10';

  const { data: projects = [] } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => base44.entities.Project.filter({ is_featured: true, is_published: true }, '-created_date', 3),
  });

  return (
    <div className="relative overflow-x-hidden">

      {/* ══════════════════════════════════════
          HERO — CINEMATIC FULL-SCREEN
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">

        {/* Parallax background */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 origin-center">
          <img
            src={heroImage}
            alt="Drone aerial view"
            fetchpriority="high"
            className="w-full h-full object-cover"
            style={{ opacity: 0.3 }}
          />
        </motion.div>

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Animated orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-accent/6 rounded-full blur-3xl pointer-events-none"
        />

        {/* Scan line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent scan-line pointer-events-none" />

        {/* CONTENT */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative max-w-7xl mx-auto px-6 sm:px-10 w-full pt-28 pb-20">
          <div className="max-w-4xl">

            {/* Badge pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {heroBadge}
              <span className="w-px h-3 bg-primary/30" />
              <MapPin className="w-3 h-3 opacity-70" />
              <span className="opacity-70">France</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-grotesk font-bold text-5xl sm:text-6xl lg:text-8xl xl:text-9xl leading-[0.95] tracking-tight mb-8"
              style={{ textWrap: 'balance' }}
            >
              {heroTitle1}
              <br />
              <span className="gradient-text sky-glow-text">{heroTitle2}</span>
            </motion.h1>

            {/* Desc */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
              className="font-inter text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10"
              style={{ textWrap: 'pretty' }}
            >
              {heroDesc}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-3 mb-14"
            >
              <Link to="/quote">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-grotesk font-semibold px-8 h-14 text-base sky-glow gap-2 cursor-pointer">
                  {heroCta1} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="border-white/20 text-foreground hover:bg-white/5 font-grotesk font-semibold px-8 h-14 text-base gap-2.5 backdrop-blur-sm cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Play className="w-3 h-3 text-primary ml-0.5" />
                  </div>
                  {heroCta2}
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-8"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                  className="flex flex-col"
                >
                  <span className="font-grotesk font-bold text-3xl text-primary tabular-nums">
                    <CountUp end={s.val} />
                  </span>
                  <span className="font-inter text-xs text-muted-foreground mt-0.5">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Weather widget */}
            {weatherEnabled && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 max-w-xl">
                <DroneWeatherWidget location={weatherLocation} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50"
        >
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 h-1.5 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>


      {/* ══════════════════════════════════════
          STATUS BAR
      ══════════════════════════════════════ */}
      <div className="px-5 lg:px-10 pt-5">
        <div className="max-w-7xl mx-auto">
          <a href="/uptime" className={`flex items-center justify-between gap-4 px-5 py-3 rounded-xl border ${borderClass} ${bgClass} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingClass} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotClass}`} />
              </span>
              <span className={`font-inter text-sm font-medium ${textClass}`}>État des services</span>
              <span className="hidden sm:inline font-mono text-xs text-muted-foreground">— {statusText}</span>
            </div>
            <div className="hidden sm:block pointer-events-none">
              <iframe src="https://status.brenneaerial.fr/badge?theme=dark" width="250" height="30" frameBorder="0" scrolling="no" style={{ colorScheme: 'normal', display: 'block' }} title="Statut Brenne Aerial" />
            </div>
            <span className={`sm:hidden font-mono text-xs ${textClass} group-hover:underline flex-shrink-0`}>Voir →</span>
          </a>
        </div>
      </div>


      {/* ══════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════ */}
      <section className="py-16 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {TRUST_POINTS.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-grotesk font-semibold text-sm truncate">{t.label}</p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5 truncate">{t.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          SERVICES — BENTO GRID
      ══════════════════════════════════════ */}
      <section className="py-24 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-primary mb-3 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-6 h-px bg-primary/60" />Nos prestations
                </p>
                <h2 className="font-grotesk font-bold text-4xl sm:text-5xl leading-tight" style={{ textWrap: 'balance' }}>
                  Services <span className="gradient-text">drone</span>
                </h2>
                <p className="font-inter text-muted-foreground mt-3 max-w-md text-base leading-relaxed" style={{ textWrap: 'pretty' }}>
                  Des solutions aériennes sur-mesure pour chaque besoin, de la captation au monitoring industriel.
                </p>
              </div>
              <Link to="/services" className="hidden sm:inline-flex items-center gap-2 font-inter text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer flex-shrink-0">
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Active services grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
            {SERVICES_PREVIEW.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to="/services" className={`block p-5 rounded-2xl border border-border bg-card transition-all duration-300 group h-full cursor-pointer relative overflow-hidden ${s.border}`}>
                    {/* Hover gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-grotesk font-semibold text-sm mb-1.5 leading-snug">{s.label}</h3>
                      <p className="font-inter text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                    <ArrowRight className="absolute bottom-4 right-4 w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Soon */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Bientôt disponible</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 opacity-50">
              {SOON.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="p-4 rounded-2xl border border-border/40 bg-muted/10">
                    <Icon className="w-5 h-5 text-muted-foreground mb-3" />
                    <p className="font-grotesk font-semibold text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="font-inter text-xs text-muted-foreground/60 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          CEO PITCH — SPLIT LAYOUT
      ══════════════════════════════════════ */}
      <section className="py-28 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        {/* Glowing accent */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative max-w-sm mx-auto lg:mx-0">
                {/* Decorative frame */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent" />
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden border border-primary/10">
                  <img
                    src={aboutPhoto}
                    alt={`${aboutName} — CEO`}
                    loading="lazy"
                    className="w-full object-cover aspect-[3/4]"
                    style={{ filter: 'contrast(1.08) saturate(0.85)' }}
                  />
                  {/* Overlay info card */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background/95 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="font-grotesk font-bold text-primary text-sm">ELM</span>
                      </div>
                      <div>
                        <p className="font-grotesk font-semibold text-sm">{aboutName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-muted-foreground">{aboutTitle}</span>
                          <span className="badge-founder font-mono text-[10px] font-bold">★ Fondateur</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl border border-primary/20"
                >
                  <Globe2 className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-grotesk font-bold text-xs">DGAC Certifié</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Pilote homologué</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl border border-primary/20"
                >
                  <Layers className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-grotesk font-bold text-xs">200+ Missions</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Depuis 2023</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-mono text-xs text-primary mb-5 tracking-widest uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-primary/60" />À propos
              </p>
              <h2 className="font-grotesk font-bold text-4xl sm:text-5xl mb-8 leading-tight" style={{ textWrap: 'balance' }}>
                <span dangerouslySetInnerHTML={{ __html: aboutHeadline.replace(/\n/g, '<br/>') }} />
              </h2>
              <div className="space-y-4 font-inter text-muted-foreground leading-relaxed text-base" style={{ textWrap: 'pretty' }}>
                <p>{aboutDesc}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2.5 mt-8">
                {[
                  { icon: Award,        label: 'Certifié DGAC' },
                  { icon: Zap,          label: 'Réponse 48h' },
                  { icon: Star,         label: '200+ missions' },
                  { icon: CheckCircle2, label: 'Vidéo 4K' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-inter text-xs font-medium text-primary">
                    <Icon className="w-3 h-3" />{label}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex gap-3 flex-wrap">
                <Link to="/about">
                  <Button variant="outline" className="border-border font-grotesk font-semibold cursor-pointer">En savoir plus</Button>
                </Link>
                <Link to="/quote">
                  <Button className="bg-primary text-primary-foreground font-grotesk font-semibold sky-glow gap-2 cursor-pointer">
                    Travailler avec nous <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          FEATURED PROJECTS
      ══════════════════════════════════════ */}
      {projects.length > 0 && (
        <section className="py-24 px-5 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
              <div>
                <p className="font-mono text-xs text-primary mb-3 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-6 h-px bg-primary/60" />Réalisations récentes
                </p>
                <h2 className="font-grotesk font-bold text-4xl sm:text-5xl">Portfolio <span className="gradient-text">sélection</span></h2>
              </div>
              <Link to="/portfolio" className="hidden sm:inline-flex items-center gap-2 font-inter text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to="/portfolio" className="block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 group cursor-pointer">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={p.thumbnail_url || 'https://images.unsplash.com/photo-1617129514963-a4d80e74f8af?w=600&auto=format&fit=crop&q=60'}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      {p.media_type === 'youtube' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                            <Play className="w-5 h-5 text-primary ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{p.category}</span>
                      <h3 className="font-grotesk font-semibold text-sm mt-1.5 group-hover:text-primary transition-colors">{p.title}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ══════════════════════════════════════
          ESPACE CLIENT BANNER
      ══════════════════════════════════════ */}
      <section className="py-10 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-primary/25 p-8 lg:p-12"
            style={{ background: 'linear-gradient(135deg, hsl(205 90% 5%) 0%, hsl(214 50% 5%) 60%, hsl(195 80% 6%) 100%)' }}
          >
            <div className="absolute inset-0 grid-bg opacity-25" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 sky-glow">
                  <FolderOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-xs text-primary mb-1 tracking-widest uppercase">Espace Client</p>
                  <h3 className="font-grotesk font-bold text-2xl sm:text-3xl">Accéder à mes relevés aériens</h3>
                  <p className="font-inter text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                    Photos 4K, vidéos, rapports et attestations de vol — disponibles en permanence dans votre espace personnel.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full lg:w-auto">
                <Link to="/espace-client" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary text-primary-foreground font-grotesk font-semibold gap-2 sky-glow w-full cursor-pointer">
                    <FolderOpen className="w-4 h-4" /> Mon espace client
                  </Button>
                </Link>
                <Link to="/toiture-checkup" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-primary/30 text-foreground font-grotesk font-semibold gap-2 w-full cursor-pointer">
                    <ScanSearch className="w-4 h-4 text-primary" /> Check-up toiture IA
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div className="relative mt-8 pt-6 border-t border-primary/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/toiture-checkup', icon: ScanSearch, label: 'Check-up toiture IA', desc: 'Analyse gratuite' },
                { href: '/partenaires',     icon: Building2,  label: 'Annuaire partenaires', desc: 'Notre réseau' },
                { href: '/parrainage',      icon: Users,      label: 'Parrainage Pro',        desc: 'Gagnez des crédits' },
                { href: '/quote',           icon: Zap,        label: 'Devis en 2 min',        desc: 'Réponse sous 48h' },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} to={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/8 border border-transparent hover:border-primary/15 transition-all duration-200 group cursor-pointer">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-inter text-xs font-semibold group-hover:text-primary transition-colors truncate">{label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════ */}
      <section className="py-16 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-primary/25 p-10 lg:p-16"
            style={{ background: 'linear-gradient(135deg, hsl(214 40% 7%) 0%, hsl(205 40% 10%) 100%)' }}
          >
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-5">
                  <Mail className="w-3.5 h-3.5" /> Newsletter
                </div>
                <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mb-3" style={{ textWrap: 'balance' }}>
                  Restez dans <span className="gradient-text">la boucle.</span>
                </h2>
                <p className="font-inter text-muted-foreground text-sm leading-relaxed">
                  Actualités, nouveaux projets, conseils drone et annonces exclusives — directement dans votre boîte mail.
                </p>
              </div>
              <div className="flex-shrink-0 text-center">
                <a
                  href={newsletterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-grotesk font-semibold px-8 py-4 rounded-xl sky-glow text-base cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                  S'inscrire à la newsletter
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="font-mono text-xs text-muted-foreground mt-3">Gratuit — Désinscription en 1 clic</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="py-28 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden bg-card border border-primary/20 p-14 lg:p-24 text-center"
          >
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            {/* Twin glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="font-mono text-xs text-primary mb-6 tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <span className="w-6 h-px bg-primary/60" />Prêt à décoller ?<span className="w-6 h-px bg-primary/60" />
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-grotesk font-bold text-4xl sm:text-6xl mb-6 leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Votre projet mérite<br />
                <span className="gradient-text sky-glow-text">la meilleure altitude.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="font-inter text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed"
                style={{ textWrap: 'pretty' }}
              >
                Obtenez un devis gratuit en moins de 2 minutes. Réponse garantie sous 48h.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3"
              >
                <Link to="/quote">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-grotesk font-semibold px-10 h-14 text-base sky-glow gap-2 cursor-pointer">
                    Devis gratuit <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-border font-grotesk font-semibold px-10 h-14 text-base cursor-pointer">
                    Nous contacter
                  </Button>
                </Link>
              </motion.div>
              <p className="font-inter text-xs text-muted-foreground mt-10 pt-8 border-t border-primary/10">
                Des questions ? Consultez notre{' '}
                <a href="https://support.brenneaerial.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">documentation</a>{' '}
                ou contactez notre{' '}
                <a href="https://support.brenneaerial.org/support" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">support</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}