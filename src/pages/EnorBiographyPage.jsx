import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Music, Plane, Code, Award, Calendar, GraduationCap, MapPin, ExternalLink, ChevronRight, Mic2, Piano, Globe2, Layers, Sparkles, Building2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIMELINE = [
  { year: '2007', label: 'Naissance', desc: 'Aldan, République de Sakha (Iakoutie), Russie', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  { year: '2019', label: 'Maîtrise de Paris', desc: 'Début du chant classique & piano au CRR de Paris', icon: Music, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { year: '2020', label: 'Double cursus', desc: 'Lycées Lamartine & Octave Gréard + CRR de Paris', icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  { year: '2023', label: 'Orchestre de Paris', desc: 'Chœur de Jeunes — Carmina Burana, Fauré, Luminescence', icon: Mic2, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  { year: '2025', label: 'Collège d\'Alma', desc: 'Québec, Canada — Technologies Sonores', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { year: '2026', label: 'Brenne Aerial', desc: 'Fondation de l\'entreprise de services drone', icon: Plane, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
];

const REPERTOIRE = [
  { period: '2019–2023', ensemble: 'Maîtrise de Paris', works: ['Levantine Symphony n°1 — Ibrahim Maalouf', 'Stabat Mater — G. B. Pergolesi (Chapelle de Versailles)'] },
  { period: '2023–2025', ensemble: 'Chœur de Jeunes — Orchestre de Paris', works: ['Carmina Burana — Carl Orff', 'Œuvres de Gabriel Fauré', 'Spectacles Luminescence'] },
];

const SKILLS = [
  { icon: Code,    label: 'Développement web',       desc: 'VS Code, GitHub, technologies modernes' },
  { icon: Music,   label: 'Audio & Production',      desc: 'Pro Tools, Reaper, Cubase, mixage' },
  { icon: Plane,   label: 'Pilotage drone',          desc: 'DGAC certifié, captation 4K' },
  { icon: Globe2,  label: 'Montage vidéo',           desc: 'Adobe Premiere Pro, post-production' },
  { icon: Layers,  label: 'Communication digitale',  desc: 'Réseaux sociaux, gestion communauté' },
  { icon: Piano,   label: 'Musique classique',       desc: 'Ténor, piano — formation CRR Paris' },
];

const INTERESTS = ['Aéronautique', 'Drones', 'Musique classique', 'Piano', 'Développement web', 'Communautés numériques', 'Réseaux sociaux', 'Spéléologie', 'Technologies innovantes'];

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase flex items-center gap-2">
      <span className="w-6 h-px bg-primary/60" />{children}
    </p>
  );
}

export default function EnorBiographyPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [activeTab, setActiveTab] = useState('bio');

  const tabs = [
    { id: 'bio',      label: 'Biographie' },
    { id: 'musique',  label: 'Parcours Musical' },
    { id: 'drone',    label: 'Brenne Aerial' },
    { id: 'skills',   label: 'Compétences' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-end overflow-hidden">
        {/* BG layers */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-10 w-[500px] h-[500px] bg-primary/6 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent scan-line pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 pb-20 pt-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Profil — Biographie officielle
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="font-grotesk font-bold text-5xl sm:text-7xl lg:text-8xl leading-[0.92] tracking-tight mb-6"
              >
                Enor<br />
                <span className="gradient-text sky-glow-text">Lefoulon</span><br />
                <span className="text-foreground/80">Meyer</span>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="flex flex-wrap gap-2"
              >
                {['Ténor classique', 'Fondateur Brenne Aerial', 'Développeur', 'Créateur de contenu'].map(tag => (
                  <span key={tag} className="font-inter text-sm text-muted-foreground px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-wrap gap-3 lg:justify-end"
            >
              {[
                { icon: MapPin,    label: 'Né à Aldan, Russie',      sub: '9 août 2007' },
                { icon: Music,     label: 'Ténor — CRR Paris',       sub: 'Chant classique' },
                { icon: Plane,     label: 'Brenne Aerial',           sub: 'Fondateur & PDG' },
                { icon: MapPin,    label: 'Québec, Canada',          sub: 'Collège d\'Alma 2025' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 glass rounded-2xl px-4 py-3 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-grotesk font-semibold text-xs">{item.label}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>


      {/* ══════ TAB NAV ══════ */}
      <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* ══════ CONTENT ══════ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 space-y-24">

        {/* ── BIOGRAPHIE ── */}
        {activeTab === 'bio' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

            {/* Bio text */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-5">
                <SectionLabel>Biographie</SectionLabel>
                <h2 className="font-grotesk font-bold text-3xl sm:text-4xl leading-tight" style={{ textWrap: 'balance' }}>
                  Artiste, entrepreneur,<br /><span className="gradient-text">bâtisseur de projets.</span>
                </h2>
                <div className="space-y-4 font-inter text-muted-foreground leading-relaxed text-base" style={{ textWrap: 'pretty' }}>
                  <p>
                    Enor Lefoulon Meyer, né le <strong className="text-foreground">9 août 2007</strong> à Aldan, en République de Sakha (Iakoutie), Russie, est un artiste lyrique, musicien, créateur de contenu et entrepreneur français.
                  </p>
                  <p>
                    Reconnu pour son activité dans le domaine du <strong className="text-foreground">chant classique en tant que ténor</strong>, il est également connu pour avoir fondé <strong className="text-foreground">Brenne Aerial</strong>, société spécialisée dans les services aériens par drone.
                  </p>
                  <p>
                    Depuis son plus jeune âge, Enor développe une passion pour la musique, les technologies numériques et l'aéronautique. Son parcours se caractérise par la combinaison de disciplines artistiques et techniques rarement réunies chez une même personne.
                  </p>
                  <p>
                    Reconnu pour sa créativité, sa curiosité et sa polyvalence, il développe simultanément des projets dans les domaines <strong className="text-foreground">artistiques, technologiques et entrepreneuriaux</strong>.
                  </p>
                </div>
              </div>

              {/* Side card */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <p className="font-grotesk font-semibold text-sm text-muted-foreground uppercase tracking-widest">Fiche rapide</p>
                  {[
                    { label: 'Né le', value: '9 août 2007' },
                    { label: 'Lieu de naissance', value: 'Aldan, Iakoutie, Russie' },
                    { label: 'Nationalité', value: 'Française' },
                    { label: 'Voix', value: 'Ténor' },
                    { label: 'Entreprise', value: 'Brenne Aerial (2026)' },
                    { label: 'Études actuelles', value: 'Collège d\'Alma, Québec' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5 pb-3 border-b border-border last:border-0 last:pb-0">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
                      <span className="font-inter text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <SectionLabel>Chronologie</SectionLabel>
              <h3 className="font-grotesk font-bold text-2xl sm:text-3xl mb-10">Les grandes étapes</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
                <div className="space-y-6 pl-16">
                  {TIMELINE.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.year}
                        initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="relative group"
                      >
                        <div className={`absolute -left-16 w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-all duration-200">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className={`font-mono text-xs font-bold ${item.color}`}>{item.year}</span>
                            <h4 className="font-grotesk font-semibold text-sm">{item.label}</h4>
                          </div>
                          <p className="font-inter text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Formation */}
            <div>
              <SectionLabel>Formation</SectionLabel>
              <h3 className="font-grotesk font-bold text-2xl sm:text-3xl mb-8">Parcours académique</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { period: '2019–2025', school: 'CRR de Paris', detail: 'Piano et Chant classique', icon: Piano },
                  { period: '2020–2023', school: 'Lycées Lamartine & Gréard', detail: 'Double cursus avec le CRR de Paris', icon: GraduationCap },
                  { period: '2023–2025', school: 'Lycée Bergson', detail: 'Mathématiques, Physique, Musique — Paris 19e', icon: Award },
                  { period: '2025', school: 'Collège d\'Alma', detail: 'Québec, Canada — Technologies Sonores', icon: MapPin },
                ].map((e, i) => {
                  const Icon = e.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{e.period}</span>
                        <p className="font-grotesk font-semibold text-sm mt-0.5">{e.school}</p>
                        <p className="font-inter text-xs text-muted-foreground mt-0.5 leading-relaxed">{e.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MUSIQUE ── */}
        {activeTab === 'musique' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

            <div>
              <SectionLabel>Parcours Musical</SectionLabel>
              <h2 className="font-grotesk font-bold text-3xl sm:text-5xl mb-4 leading-tight" style={{ textWrap: 'balance' }}>
                Une voix de <span className="gradient-text">ténor</span><br />en formation constante.
              </h2>
              <p className="font-inter text-muted-foreground text-lg max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>
                Formé au Conservatoire à Rayonnement Régional de Paris depuis 2019, Enor a participé à des productions majeures de la scène musicale classique française.
              </p>
            </div>

            {/* Voice highlight */}
            <div className="relative rounded-3xl overflow-hidden border border-primary/20 p-10 lg:p-16"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 5%) 0%, hsl(214 50% 5%) 60%, hsl(195 80% 7%) 100%)' }}
            >
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 sky-glow">
                  <Mic2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="font-mono text-xs text-primary mb-2 uppercase tracking-widest">Corde vocale</p>
                  <h3 className="font-grotesk font-bold text-3xl sm:text-4xl mb-2">Ténor</h3>
                  <p className="font-inter text-muted-foreground leading-relaxed max-w-lg">
                    Tessiture ténorile travaillée au sein des plus grandes formations chórales parisiennes. Répertoire allant du baroque au contemporain.
                  </p>
                </div>
              </div>
            </div>

            {/* Repertoire */}
            <div className="space-y-6">
              {REPERTOIRE.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-7 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                    <span className="font-mono text-xs text-primary border border-primary/25 bg-primary/8 px-3 py-1.5 rounded-full">{r.period}</span>
                    <h4 className="font-grotesk font-bold text-lg">{r.ensemble}</h4>
                  </div>
                  <ul className="space-y-3">
                    {r.works.map((w, j) => (
                      <li key={j} className="flex items-start gap-3 font-inter text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: w.replace(/—/g, '<span class="text-muted-foreground/50"> — </span>') }} />
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Instruments */}
            <div>
              <SectionLabel>Instruments</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <p className="font-grotesk font-semibold text-sm">{inst.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">Niveau avancé</p>
                        </div>
                      </div>
                      <p className="font-inter text-xs text-muted-foreground mb-4 leading-relaxed">{inst.desc}</p>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${inst.level}%` }} viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DRONE ── */}
        {activeTab === 'drone' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

            <div>
              <SectionLabel>Brenne Aerial</SectionLabel>
              <h2 className="font-grotesk font-bold text-3xl sm:text-5xl mb-4 leading-tight" style={{ textWrap: 'balance' }}>
                L'entrepreneuriat au service<br />de <span className="gradient-text">l'aérien.</span>
              </h2>
              <p className="font-inter text-muted-foreground text-lg max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>
                Fondée en 2026, Brenne Aerial est née de la passion d'Enor pour l'aéronautique, la photographie et la vidéo.
              </p>
            </div>

            {/* Hero card */}
            <div className="relative rounded-3xl overflow-hidden border border-primary/25 p-10 lg:p-16"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 5%) 0%, hsl(214 50% 5%) 60%, hsl(195 80% 6%) 100%)' }}
            >
              <div className="absolute inset-0 grid-bg opacity-25" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
              <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/15 border border-primary/25 flex items-center justify-center sky-glow sm:mx-auto">
                  <Plane className="w-10 h-10 text-primary" />
                </div>
                <div className="sm:col-span-2">
                  <h3 className="font-grotesk font-bold text-3xl mb-2">brenneaerial.fr</h3>
                  <p className="font-inter text-muted-foreground leading-relaxed mb-5">
                    Services de captation aérienne professionnelle par drone — photographie, vidéo, inspections, suivi chantier, retour temps réel.
                  </p>
                  <Link to="/">
                    <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors sky-glow cursor-pointer text-sm">
                      Visiter Brenne Aerial <ExternalLink className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Services grid */}
            <div>
              <SectionLabel>Spécialisations</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Building2, label: 'Captation aérienne', desc: 'Photos et vidéos professionnelles en 4K depuis les airs' },
                  { icon: Award,     label: 'Inspections techniques', desc: 'Toitures, façades, infrastructures sans intervention humaine' },
                  { icon: Layers,    label: 'Suivi de chantiers',     desc: 'Monitoring régulier de l\'avancement de vos projets' },
                  { icon: Globe2,    label: 'Patrimoine & Tourisme',  desc: 'Valorisation de sites historiques et touristiques' },
                  { icon: Sparkles,  label: 'Événementiel',           desc: 'Captations live pour mariages, concerts, événements' },
                  { icon: Plane,     label: 'Retour temps réel',      desc: 'Streaming aérien en direct pour vos opérations' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-grotesk font-semibold text-sm mb-1.5">{s.label}</h4>
                      <p className="font-inter text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { val: '4K',   label: 'Qualité vidéo' },
                { val: '48h',  label: 'Délai réponse' },
                { val: '100%', label: 'Certifié DGAC' },
                { val: '2026', label: 'Fondation' },
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-2xl border border-primary/20 bg-primary/5 text-center">
                  <p className="font-grotesk font-bold text-3xl text-primary mb-1">{s.val}</p>
                  <p className="font-inter text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SKILLS ── */}
        {activeTab === 'skills' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

            <div>
              <SectionLabel>Compétences</SectionLabel>
              <h2 className="font-grotesk font-bold text-3xl sm:text-5xl mb-4 leading-tight" style={{ textWrap: 'balance' }}>
                Une polyvalence<br /><span className="gradient-text">rare et assumée.</span>
              </h2>
              <p className="font-inter text-muted-foreground text-lg max-w-2xl leading-relaxed">
                Art, technologie, entrepreneuriat — Enor combine des domaines qui semblent opposés pour créer des projets singuliers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SKILLS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-grotesk font-semibold text-base mb-1.5">{s.label}</h4>
                    <p className="font-inter text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Outils */}
            <div>
              <SectionLabel>Outils maîtrisés</SectionLabel>
              <div className="flex flex-wrap gap-2.5">
                {['Pro Tools', 'Reaper', 'Cubase', 'Adobe Premiere Pro', 'Visual Studio Code', 'GitHub', 'Figma', 'Logic Pro'].map(tool => (
                  <span key={tool} className="font-mono text-xs px-3 py-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-default">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Centres d'intérêt */}
            <div>
              <SectionLabel>Centres d'intérêt</SectionLabel>
              <h3 className="font-grotesk font-bold text-2xl mb-6">Passions & Loisirs</h3>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map(interest => (
                  <span key={interest} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/8 border border-primary/20 font-inter text-sm font-medium text-primary cursor-default hover:bg-primary/15 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>


      {/* ══════ CTA FOOTER ══════ */}
      <section className="py-20 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-card border border-primary/20 p-12 lg:p-16 text-center"
          >
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="font-mono text-xs text-primary mb-4 uppercase tracking-widest">Travailler ensemble</p>
              <h2 className="font-grotesk font-bold text-3xl sm:text-5xl mb-4" style={{ textWrap: 'balance' }}>
                Un projet aérien en tête ?
              </h2>
              <p className="font-inter text-muted-foreground text-base max-w-md mx-auto mb-8 leading-relaxed">
                Contactez Brenne Aerial pour un devis gratuit sous 48h.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quote">
                  <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors sky-glow cursor-pointer text-base">
                    Demander un devis <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="inline-flex items-center gap-2 border border-border text-foreground font-grotesk font-semibold px-8 py-4 rounded-xl hover:bg-secondary transition-colors cursor-pointer text-base">
                    Nous contacter
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}