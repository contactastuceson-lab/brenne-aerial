import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe2, LifeBuoy, Activity, Cloud, Shield, ExternalLink,
  ArrowUpRight, Search, Layers, ChevronRight
} from 'lucide-react';

const SERVICES = [
  {
    id: 'main',
    category: 'Site principal',
    items: [
      {
        name: 'Brenne Aerial',
        url: 'https://brenneaerial.fr',
        display: 'brenneaerial.fr',
        desc: 'Site officiel de Brenne Aerial — devis, portfolio, planning, services drone professionnels.',
        icon: Globe2,
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        hoverBorder: 'hover:border-primary/50',
        badge: 'Principal',
        badgeColor: 'bg-primary/10 text-primary border-primary/20',
      },
    ],
  },
  {
    id: 'support',
    category: 'Support & Statut',
    items: [
      {
        name: 'Support Brenne Aerial',
        url: 'https://support.brenneaerial.org',
        display: 'support.brenneaerial.org',
        desc: 'Centre d\'aide, documentation, tickets de support et base de connaissances pour les clients.',
        icon: LifeBuoy,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
        hoverBorder: 'hover:border-blue-400/50',
        badge: 'Support',
        badgeColor: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      },
      {
        name: 'Status Page',
        url: 'https://status.brenneaerial.fr',
        display: 'status.brenneaerial.fr',
        desc: 'Tableau de bord de disponibilité en temps réel — incidents, maintenances et historique des services.',
        icon: Activity,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/20',
        hoverBorder: 'hover:border-emerald-400/50',
        badge: 'Statut',
        badgeColor: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
      },
    ],
  },
  {
    id: 'cloud',
    category: 'Infrastructure Cloud',
    items: [
      {
        name: 'Brenne Aerial Cloud',
        url: 'https://brenneaerial.cloud',
        display: 'brenneaerial.cloud',
        desc: 'Plateforme cloud de Brenne Aerial — stockage, ressources et services numériques dédiés.',
        icon: Cloud,
        color: 'text-cyan-400',
        bg: 'bg-cyan-400/10',
        border: 'border-cyan-400/20',
        hoverBorder: 'hover:border-cyan-400/50',
        badge: 'Cloud',
        badgeColor: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
      },
      {
        name: 'BigSecureCloud',
        url: 'https://bigsecurecloud.fr',
        display: 'bigsecurecloud.fr',
        desc: 'Infrastructure sécurisée de stockage et d\'hébergement — sécurité et confidentialité des données.',
        icon: Shield,
        color: 'text-violet-400',
        bg: 'bg-violet-400/10',
        border: 'border-violet-400/20',
        hoverBorder: 'hover:border-violet-400/50',
        badge: 'Sécurité',
        badgeColor: 'bg-violet-400/10 text-violet-400 border-violet-400/20',
      },
    ],
  },
];

const ALL_ITEMS = SERVICES.flatMap(s => s.items);

export default function EcosystemePage() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? ALL_ITEMS.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.display.toLowerCase().includes(search.toLowerCase()) ||
        i.desc.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 pb-20 px-6 sm:px-10">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/25 bg-primary/5 px-4 py-2 rounded-full mb-8"
          >
            <Layers className="w-3.5 h-3.5" />
            Écosystème Brenne Aerial
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-grotesk font-black text-5xl sm:text-7xl leading-[0.9] tracking-tight mb-6"
          >
            L'univers<br /><span className="gradient-text">Brenne Aerial</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="font-inter text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Tous les services, plateformes et outils qui composent l'écosystème numérique de Brenne Aerial.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="relative max-w-md mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </motion.div>
        </div>
      </section>


      {/* ═══ CONTENT ═══ */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pb-24 space-y-16">

        {/* Search results */}
        {filtered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-muted-foreground mb-5 uppercase tracking-widest">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour « {search} »
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((item, i) => <ServiceCard key={i} item={item} i={i} />)}
              {filtered.length === 0 && (
                <p className="col-span-2 text-center font-inter text-muted-foreground py-12">Aucun service trouvé.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Categorized grid */}
        {!filtered && SERVICES.map((section, si) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: si * 0.1 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-grotesk font-bold text-xl">{section.category}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              <span className="font-mono text-xs text-muted-foreground">{section.items.length} service{section.items.length > 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.items.map((item, i) => <ServiceCard key={i} item={item} i={i} />)}
            </div>
          </motion.div>
        ))}


        {/* All links — compact table */}
        {!filtered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-grotesk font-bold text-xl">Index complet</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-3 sm:grid-cols-4 px-5 py-3 border-b border-border">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground col-span-1">Service</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground col-span-1 hidden sm:block">Domaine</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground col-span-1">Catégorie</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground col-span-1 text-right">Lien</span>
              </div>
              {ALL_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-3 sm:grid-cols-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors group items-center"
                  >
                    <div className="flex items-center gap-3 col-span-1">
                      <div className={`w-7 h-7 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <span className="font-inter text-sm font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground col-span-1 hidden sm:block truncate">{item.display}</span>
                    <div className="col-span-1">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ArrowUpRight className={`w-4 h-4 ${item.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ item, i }) {
  const Icon = item.icon;
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
      className={`group block p-6 rounded-2xl border ${item.border} bg-card ${item.hoverBorder} transition-all duration-200 hover:bg-secondary/20`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${item.color}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full border ${item.badgeColor}`}>{item.badge}</span>
          <ArrowUpRight className={`w-4 h-4 ${item.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>

      <h3 className="font-grotesk font-bold text-base mb-1">{item.name}</h3>
      <p className={`font-mono text-xs ${item.color} mb-3`}>{item.display}</p>
      <p className="font-inter text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
    </motion.a>
  );
}