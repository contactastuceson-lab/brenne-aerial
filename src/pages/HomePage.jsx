import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Camera, Building2, HardHat, Video, Wifi, Briefcase, ChevronDown, Star, Award, Zap, Mail, FolderOpen, ScanSearch, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DroneWeatherWidget from '@/components/home/DronWeatherWidget';

const SERVICES_PREVIEW = [
  { icon: Video,      label: 'Vidéo événement',       desc: 'Captez chaque instant depuis les airs' },
  { icon: Building2,  label: 'Inspection toiture',    desc: 'Diagnostic précis sans intervention humaine' },
  { icon: HardHat,    label: 'Suivi chantier',        desc: 'Monitoring aérien de vos chantiers' },
  { icon: Camera,     label: 'Captation particulier', desc: 'Vos souvenirs et propriétés vus du ciel' },
  { icon: Briefcase,  label: 'Captation entreprise',  desc: 'Clips institutionnels et vidéos marketing' },
  { icon: Wifi,       label: 'Retour temps réel',     desc: 'Diffusion live de vos opérations' },
  { icon: Video,      label: 'Contenu réseaux',       desc: 'Vidéos créatives pour vos plateformes' },
  { icon: Camera,     label: 'Reportage',             desc: 'Documentaires et contenus éditoriaux' },
  { icon: Building2,  label: 'Visite immobilière',    desc: 'Tour 360° de vos propriétés' },
  { icon: Camera,     label: 'Mariage photo aérienne',desc: 'Captez votre plus beau jour depuis le ciel' },
  // Bientôt disponible
  { icon: Building2,  label: 'Photogramm. 3D',        desc: 'Modélisation 3D précise de vos projets',       disabled: true },
  { icon: HardHat,    label: 'Cartographie/Relevés',  desc: 'Cartes géoréférencées et relevés topographiques', disabled: true },
  { icon: Camera,     label: 'Thermographie',         desc: 'Inspection thermique infrarouge',              disabled: true },
  { icon: Video,      label: 'Surveillance aérienne', desc: 'Gardiennage et monitoring continu',            disabled: true },
  { icon: HardHat,    label: 'Agriculture/Monitoring',desc: 'Surveillance de cultures et monitoring aérien',disabled: true },
];

const STATS = [
  { val: '200+', label: 'Missions réalisées' },
  { val: '4K',   label: 'Qualité vidéo' },
  { val: '99%',  label: 'Satisfaction client' },
  { val: '48h',  label: 'Délai de réponse' },
];

export default function HomePage() {
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

  const { data: projects = [] } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => base44.entities.Project.filter({ is_featured: true, is_published: true }, '-created_date', 3),
  });

  return (
    <div className="relative">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Drone aerial view"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="video-overlay absolute inset-0" />
          <div className="video-overlay-bottom absolute bottom-0 left-0 right-0 h-48" />
        </div>

        {/* Scan line effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent scan-line pointer-events-none" />



        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-5 lg:px-10 w-full pt-24 pb-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {heroBadge}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="font-grotesk font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tight mb-6"
            >
              {heroTitle1}
              <br />
              <span className="gradient-text sky-glow-text">{heroTitle2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="font-inter text-lg text-muted-foreground max-w-xl leading-relaxed mb-8"
            >
              {heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/quote">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-grotesk font-semibold px-6 sky-glow">
                  {heroCta1} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary font-grotesk font-semibold px-6 gap-2">
                  <Play className="w-4 h-4 text-primary" /> {heroCta2}
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 mt-12"
            >
              {stats.map(s => (
                <div key={s.label}>
                  <div className="font-grotesk font-bold text-2xl text-primary">{s.val}</div>
                  <div className="font-inter text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Weather widget */}
            {weatherEnabled && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-6 max-w-xl">
                <DroneWeatherWidget location={weatherLocation} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* ─── STATUS BADGE ─── */}
      {(() => {
        const PAGE_KEYS = [
          'page_homepage_enabled','page_services_enabled','page_portfolio_enabled','page_blog_enabled',
          'page_contact_enabled','page_quote_enabled','page_planning_enabled','page_discover_enabled',
          'page_messages_enabled','page_espace_client_enabled','page_partenaires_enabled',
          'page_parrainage_enabled','page_avant_apres_enabled','page_certification_enabled',
          'page_donation_enabled','page_garage_enabled','page_calculator_enabled',
          'page_reglementation_enabled','page_simulateur_enabled','page_comparateur_enabled',
          'page_flash_enabled','messaging_enabled','registration_open',
        ];
        const hasDisabled = PAGE_KEYS.some(k => sMap[k] === 'false');
        const isOffline = sMap['site_offline'] === 'true';
        const isAllGood = !hasDisabled && !isOffline;
        const color = isOffline ? 'red' : hasDisabled ? 'yellow' : 'green';
        const statusText = isOffline
          ? 'Site temporairement hors ligne'
          : hasDisabled
          ? 'Certains services indisponibles'
          : 'Tous les systèmes opérationnels';
        const dotColor = isOffline ? 'bg-red-500' : hasDisabled ? 'bg-yellow-400' : 'bg-green-500';
        const pingColor = isOffline ? 'bg-red-400' : hasDisabled ? 'bg-yellow-300' : 'bg-green-400';
        const textColor = isOffline ? 'text-red-400' : hasDisabled ? 'text-yellow-400' : 'text-green-400';
        const borderColor = isOffline ? 'border-red-500/20 hover:border-red-500/40' : hasDisabled ? 'border-yellow-400/20 hover:border-yellow-400/40' : 'border-green-500/20 hover:border-green-500/40';
        const bgColor = isOffline ? 'bg-red-500/5 hover:bg-red-500/10' : hasDisabled ? 'bg-yellow-400/5 hover:bg-yellow-400/10' : 'bg-green-500/5 hover:bg-green-500/10';
        return (
      <div className="px-5 lg:px-10 pt-4">
        <div className="max-w-7xl mx-auto">
          <a href="/uptime" className={`flex items-center justify-between gap-4 px-5 py-3 rounded-xl border ${borderColor} ${bgColor} transition-all duration-300 group`}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
              </span>
              <span className={`font-inter text-sm font-medium ${textColor}`}>État des services</span>
              <span className="hidden sm:inline font-mono text-xs text-muted-foreground">— {statusText}</span>
            </div>
            <div className="hidden sm:block pointer-events-none">
              <iframe
                src="https://status.brenneaerial.fr/badge?theme=dark"
                width="250"
                height="30"
                frameBorder="0"
                scrolling="no"
                style={{ colorScheme: 'normal', display: 'block' }}
                title="Statut Brenne Aerial"
              />
            </div>
            <span className={`sm:hidden font-mono text-xs ${textColor} group-hover:underline flex-shrink-0`}>Voir →</span>
          </a>
        </div>
      </div>
        );
      })()}



      {/* ─── SERVICES PREVIEW ─── */}
      <section className="py-24 px-5 lg:px-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">— Nos prestations</p>
              <h2 className="font-grotesk font-bold text-3xl sm:text-4xl">
                Services <span className="gradient-text">drone</span>
              </h2>
            </div>
            <Link to="/services" className="hidden sm:flex items-center gap-1.5 font-inter text-sm text-muted-foreground hover:text-primary transition-colors">
              Tous les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {SERVICES_PREVIEW.filter(s => !s.disabled).map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to="/services"
                  className="block p-5 rounded-xl border transition-all duration-300 group h-full bg-card border-border hover:border-primary/30 hover:sky-glow">
                  <div className="flex justify-between items-start mb-4">
                    <s.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-grotesk font-semibold text-sm mb-1.5">{s.label}</h3>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bientôt disponible */}
          {SERVICES_PREVIEW.some(s => s.disabled) && (
            <div>
              <h3 className="font-grotesk font-semibold text-sm text-muted-foreground mb-3">Bientôt disponible</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 opacity-60">
                {SERVICES_PREVIEW.filter(s => s.disabled).map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label}
                      className="p-5 rounded-xl border border-border/50 bg-muted/20 h-full">
                      <div className="flex justify-between items-start mb-4">
                        <Icon className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-grotesk font-semibold text-sm mb-1.5 text-muted-foreground">{s.label}</h3>
                      <p className="font-inter text-xs text-muted-foreground/70 leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ─── CEO PITCH ─── */}
      <section className="py-24 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-xl" />
                <img
                  src={aboutPhoto}
                  alt={`${aboutName} — CEO`}
                  className="relative w-full max-w-sm mx-auto rounded-2xl object-cover aspect-[3/4]"
                  style={{ filter: 'contrast(1.05) saturate(0.9)' }}
                />
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-grotesk font-bold text-primary text-sm">ELM</span>
                    </div>
                    <div>
                      <p className="font-grotesk font-semibold text-sm">{aboutName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs text-muted-foreground">{aboutTitle}</span>
                        <span className="badge-founder font-mono text-[10px] font-bold">★ Fondateur</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— À propos</p>
              <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mb-6">
                <span dangerouslySetInnerHTML={{ __html: aboutHeadline.replace(/\n/g, '<br/>') }} />
              </h2>
              <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
                <p>{aboutDesc}</p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-inter text-sm">Certifié DGAC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-inter text-sm">Réponse 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-inter text-sm">200+ missions</span>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Link to="/about">
                  <Button variant="outline" className="border-border font-grotesk font-semibold">En savoir plus</Button>
                </Link>
                <Link to="/quote">
                  <Button className="bg-primary text-primary-foreground font-grotesk font-semibold sky-glow">
                    Travailler avec nous <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROJECTS ─── */}
      {projects.length > 0 && (
        <section className="py-24 px-5 lg:px-10 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">— Réalisations récentes</p>
              <h2 className="font-grotesk font-bold text-3xl sm:text-4xl">Portfolio <span className="gradient-text">sélection</span></h2>
            </div>
            <Link to="/portfolio" className="hidden sm:flex items-center gap-1.5 font-inter text-sm text-muted-foreground hover:text-primary transition-colors">
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to="/portfolio" className="block rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 group">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={p.thumbnail_url || `https://images.unsplash.com/photo-1617129514963-a4d80e74f8af?w=600&auto=format&fit=crop&q=60`}
                      alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    {p.media_type === 'youtube' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="font-mono text-[10px] text-primary">{p.category}</span>
                    <h3 className="font-grotesk font-semibold text-sm mt-1">{p.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── NEWSLETTER ─── */}
      <section className="py-20 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-primary/30 p-10 lg:p-16"
            style={{ background: 'linear-gradient(135deg, hsl(214 40% 7%) 0%, hsl(205 40% 10%) 100%)' }}
          >
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            {/* Glow blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
                  <Mail className="w-3.5 h-3.5" />
                  Newsletter
                </div>
                <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mb-3">
                  Restez dans <span className="gradient-text">la boucle.</span>
                </h2>
                <p className="font-inter text-muted-foreground text-sm max-w-md">
                  Actualités, nouveaux projets, conseils drone et annonces exclusives — directement dans votre boîte mail.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href={newsletterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-grotesk font-semibold px-8 py-4 rounded-xl sky-glow text-base"
                >
                  <Mail className="w-5 h-5" />
                  S'inscrire à la newsletter
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="font-mono text-xs text-muted-foreground mt-3 text-center">Gratuit — Désinscription en 1 clic</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MODE CLIENT ─── */}
      <section className="py-16 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-primary/30 p-8 lg:p-12"
            style={{ background: 'linear-gradient(135deg, hsl(205 90% 6%) 0%, hsl(214 50% 5%) 50%, hsl(195 80% 7%) 100%)' }}
          >
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="relative flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 sky-glow">
                  <FolderOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-xs text-primary mb-1 tracking-widest uppercase">— Espace Client</p>
                  <h2 className="font-grotesk font-bold text-2xl sm:text-3xl">Accéder à mes relevés aériens</h2>
                  <p className="font-inter text-sm text-muted-foreground mt-1 max-w-md">Photos 4K, vidéos, rapports et attestations de vol — disponibles en permanence dans votre espace personnel.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link to="/espace-client">
                  <Button size="lg" className="bg-primary text-primary-foreground font-grotesk font-semibold gap-2 sky-glow w-full sm:w-auto">
                    <FolderOpen className="w-4 h-4" /> Mon espace client
                  </Button>
                </Link>
                <Link to="/toiture-checkup">
                  <Button size="lg" variant="outline" className="border-primary/30 text-foreground font-grotesk font-semibold gap-2 w-full sm:w-auto">
                    <ScanSearch className="w-4 h-4 text-primary" /> Check-up toiture gratuit
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick links row */}
            <div className="relative mt-8 pt-6 border-t border-primary/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: '/toiture-checkup', icon: ScanSearch, label: 'Check-up toiture IA', desc: 'Analyse gratuite' },
                { href: '/partenaires', icon: Building2, label: 'Annuaire partenaires', desc: 'Notre réseau' },
                { href: '/parrainage', icon: Users, label: 'Parrainage Pro', desc: 'Gagnez des crédits' },
                { href: '/quote', icon: Zap, label: 'Devis en 2 min', desc: 'Réponse sous 48h' },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} to={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/15 transition-all group">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-inter text-xs font-semibold group-hover:text-primary transition-colors">{label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-card border border-primary/20 p-12 lg:p-20 text-center sky-glow"
          >
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative">
              <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Prêt à décoller ?</p>
              <h2 className="font-grotesk font-bold text-3xl sm:text-5xl mb-4">
                Votre projet mérite<br />
                <span className="gradient-text">la meilleure altitude.</span>
              </h2>
              <p className="font-inter text-muted-foreground text-base mb-8 max-w-md mx-auto">
                Obtenez un devis gratuit en moins de 2 minutes. Réponse garantie sous 48h.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quote">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-grotesk font-semibold px-8 sky-glow">
                    Devis gratuit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-border font-grotesk font-semibold px-8">
                    Nous contacter
                  </Button>
                </Link>
              </div>
              <p className="font-inter text-xs text-muted-foreground mt-8 pt-8 border-t border-primary/10">
                Des questions ? Consultez notre <a href="https://support.brenneaerial.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">documentation</a> ou contactez notre <a href="https://support.brenneaerial.org/support" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">support</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}