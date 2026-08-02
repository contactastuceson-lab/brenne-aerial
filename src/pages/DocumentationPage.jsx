import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, BookOpen, Layers, Zap, Shield, Search,
} from 'lucide-react';
import {
  DOC_TOPICS, getDocImage, DOC_CATEGORIES,
  DOC_TOPIC_COUNT, DOC_SECTION_COUNT,
} from '@/lib/docsContent';
import DocIcon from '@/components/docs/DocIcon';
import DocNavbar from '@/components/docs/DocNavbar';
import DocSuggestions from '@/components/docs/DocSuggestions';

const GREEN = '#00c853';

const STATS = [
  { icon: BookOpen, label: 'Guides', value: DOC_TOPIC_COUNT },
  { icon: Layers, label: 'Sections', value: DOC_SECTION_COUNT },
  { icon: Zap, label: 'Temps réel', value: 'Live' },
  { icon: Shield, label: 'Sécurisé', value: 'RGPD' },
];

function SubNav() {
  const items = [
    { label: 'Documentation', to: '/support/documentation', active: true },
    { label: 'Communauté', to: '/forum' },
    { label: 'Support', to: '/support' },
    { label: 'Journal des modifications', to: '/uptime' },
  ];
  return (
    <div className="sticky top-14 z-30 w-full border-b bg-background/95 backdrop-blur" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center gap-5 overflow-x-auto no-scrollbar">
        {items.map((it) => (
          <Link key={it.to} to={it.to} className="relative text-xs font-medium whitespace-nowrap pb-3 pt-3 transition-colors" style={it.active ? { color: GREEN } : { color: 'hsl(var(--muted-foreground))' }}>
            {it.label}
            {it.active && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full" style={{ background: GREEN }} />}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DocumentationPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const q = query.trim().toLowerCase();
  const filtered = DOC_TOPICS.filter((t) => {
    const matchCat = cat === 'all' || t.cat === cat;
    const matchQ = !q || (t.title + ' ' + t.tagline + ' ' + t.intro).toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background">
      <DocNavbar />
      <SubNav />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(ellipse, #38aadc, transparent 70%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-primary">Centre d'aide eza</span>
          </div>
          <h1 className="font-grotesk font-black text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Tout savoir sur <span className="gradient-text">eza</span>,<br className="hidden md:block" /> simplement.
          </h1>
          <p className="font-inter text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed text-base">
            {DOC_TOPIC_COUNT} guides clairs et pratiques pour maîtriser toute la plateforme —
            du réseau social à l'économie de crédits, des Spaces audio au support IA Nexus.
            Écrits pour vous, pas pour les développeurs.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un guide…"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mt-10">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1.5 text-primary/60" />
                <div className="font-grotesk font-black text-xl text-foreground">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUGGESTIONS PERSONNALISÉES ===== */}
      <DocSuggestions />

      {/* ===== TOUS LES GUIDES ===== */}
      <section className="px-4 sm:px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-grotesk font-bold text-2xl md:text-3xl">Toute la documentation</h2>
            <p className="text-muted-foreground mt-2 text-sm">{filtered.length} guide{filtered.length > 1 ? 's' : ''} · {DOC_SECTION_COUNT} sections au total</p>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 mb-10">
          {DOC_CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <button key={c.id} onClick={() => setCat(c.id)} className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all ${active ? 'text-white' : 'text-muted-foreground hover:text-foreground border-border bg-card'}`} style={active ? { background: c.color, borderColor: c.color, boxShadow: `0 0 20px ${c.color}40` } : {}}>
                {c.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Aucun guide ne correspond à « {query} ».</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <motion.div key={t.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 6) * 0.04 }}>
                <Link to={`/support/documentation/${t.slug}`} className="group relative block h-full rounded-2xl border border-border bg-card overflow-hidden hover-lift">
                  <div className="relative h-28 overflow-hidden">
                    <img src={getDocImage(t.slug)} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    <div className="absolute top-3 left-3 w-11 h-11 rounded-xl flex items-center justify-center border backdrop-blur-md" style={{ background: `${t.color}30`, borderColor: `${t.color}50` }}>
                      <DocIcon name={t.icon} className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 w-1 h-16 rounded-full" style={{ background: t.color, boxShadow: `0 0 12px ${t.color}80` }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-grotesk font-bold text-base text-foreground">{t.title}</h3>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed mb-3">{t.tagline}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                      <span className="font-mono">{(t.sections || []).length} sections</span>
                      <span>·</span>
                      <span style={{ color: t.color }} className="font-medium">{DOC_CATEGORIES.find((c) => c.id === t.cat)?.label || ''}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground/40">© 2026 eza · Documentation publique · {DOC_TOPIC_COUNT} guides</p>
      </div>
    </div>
  );
}