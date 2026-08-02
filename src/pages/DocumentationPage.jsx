import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Book, ArrowRight, Sparkles, Users, Award, Code2, Zap,
  MessageSquare, Map, FileText, Shield, Bell, Smartphone,
  Network, Crown, Coins, Gift, Palette, Database, Lock,
  Rocket, Layers, Terminal, BookOpen,
} from 'lucide-react';
import { DOC_TOPICS, getDocImage } from '@/lib/docsContent';
import DocIcon from '@/components/docs/DocIcon';

const ORANGE = '#ff6d3f';
const BLUE = '#38aadc';
const GREEN = '#1dd8b4';
const VIOLET = '#a78bfa';
const ROSE = '#fb7185';
const AMBER = '#f59e0b';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: ORANGE }} />
        <div className="relative px-5 py-16 md:py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[10px] tracking-[2px] uppercase text-primary">Documentation EZA</span>
            </div>
            <h1 className="font-grotesk font-black text-4xl md:text-5xl leading-[1.05] tracking-tight">
              Que découvrirez-vous <br className="hidden md:block" />
              sur <span className="gradient-text">EZA</span> ?
            </h1>
            <p className="font-inter text-muted-foreground mt-5 max-w-md leading-relaxed">
              Tout ce dont vous avez besoin pour comprendre la plateforme EZA —
              du réseau social à l'économie de crédits, en passant par les
              certifications, le forum et le système de design.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                to="/documentation/overview"
                className="group inline-flex items-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm text-white transition-transform active:scale-95"
                style={{ background: ORANGE }}
              >
                Commencer
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/documentation/stack"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm border border-border bg-card hover:border-foreground/20 transition-colors"
              >
                <Terminal className="w-4 h-4 text-muted-foreground" />
                Documentation technique
              </Link>
            </div>
          </div>

          {/* Aperçu app mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl sky-glow">
              <div className="h-9 flex items-center gap-1.5 px-4 border-b border-border bg-secondary/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 text-[10px] font-mono text-muted-foreground">eza.group</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <div className="flex-1">
                    <div className="h-3 w-28 rounded bg-secondary mb-1.5" />
                    <div className="h-2 w-20 rounded bg-secondary/60" />
                  </div>
                </div>
                <div className="h-24 rounded-lg bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-border flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary/60" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 rounded bg-secondary/80 w-full" />
                  <div className="h-2.5 rounded bg-secondary/60 w-4/5" />
                  <div className="h-2.5 rounded bg-secondary/40 w-3/5" />
                </div>
                <div className="flex gap-2 pt-1">
                  <div className="h-8 w-20 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-[10px] font-semibold text-primary">J'aime</div>
                  <div className="h-8 w-20 rounded-lg bg-secondary/60 border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground">Répondre</div>
                </div>
              </div>
            </div>
            {/* floating badges */}
            <div className="absolute -top-3 -left-3 rounded-xl border border-border bg-card px-3 py-2 shadow-lg flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-semibold">Certifié</span>
            </div>
            <div className="absolute -bottom-3 -right-3 rounded-xl border border-border bg-card px-3 py-2 shadow-lg flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-semibold">+50 crédits</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== À PROPOS ===== */}
      <section className="px-5 py-16 md:py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="font-mono text-[11px] tracking-[2px] uppercase" style={{ color: BLUE }}>À propos d'EZA</span>
            <h2 className="font-grotesk font-bold text-2xl md:text-3xl mt-3 leading-tight">
              Transformer une communauté en un véritable écosystème
            </h2>
            <div className="mt-5 space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                EZA est une plateforme tout-en-un qui réunit un réseau social,
                une messagerie, un forum, un portfolio, un blog, des
                certifications et un système d'économie interne — le tout dans
                une seule application responsive, installable en PWA.
              </p>
              <p>
                Chaque fonctionnalité partage la même identité, le même système
                de design et les mêmes utilisateurs. Un auteur de publication
                est aussi un membre de communauté, un certifié et un
                parrain potentiel.
              </p>
            </div>
            <Link
              to="/documentation/overview"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              Lire la vue d'ensemble <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'Réseau social', c: BLUE },
              { icon: MessageSquare, label: 'Messagerie', c: GREEN },
              { icon: Map, label: 'Portfolio', c: VIOLET },
              { icon: Award, label: 'Certifications', c: AMBER },
              { icon: Coins, label: 'Crédits & Boutique', c: ORANGE },
              { icon: Network, label: 'Écosystème', c: GREEN },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${f.c}15`, border: `1px solid ${f.c}30` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.c }} />
                </div>
                <span className="text-sm font-semibold">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POINT DE DÉPART ===== */}
      <section className="px-5 py-16 border-t border-border bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-grotesk font-bold text-2xl md:text-3xl">Choisissez un point de départ</h2>
            <p className="text-muted-foreground mt-2 text-sm">Trois entrées pour explorer la plateforme selon votre profil.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Rocket, title: 'Premiers pas', desc: "Découvrez l'interface, créez votre profil et publiez votre premier contenu.", c: ORANGE, to: '/documentation/social' },
              { icon: Users, title: 'Communauté', desc: 'Rejoignez le forum, les communautés, les Spaces audio et échangez.', c: BLUE, to: '/documentation/forum' },
              { icon: Award, title: 'Certifications', desc: 'Demandez un badge de vérification et gagnez en crédibilité.', c: GREEN, to: '/documentation/certifications' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden group hover-lift"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: s.c }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.c}15`, border: `1px solid ${s.c}30` }}>
                  <s.icon className="w-6 h-6" style={{ color: s.c }} />
                </div>
                <h3 className="font-grotesk font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                <Link to={s.to} className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: s.c }}>
                  Explorer <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONSTRUISEZ-LE À VOTRE FAÇON ===== */}
      <section className="px-5 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-grotesk font-bold text-2xl md:text-3xl">Construisez-le à votre façon</h2>
          <p className="text-muted-foreground mt-2 text-sm">Deux parcours selon que vous venez utiliser ou comprendre la plateforme.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Construire avec l'IA — orange */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-1.5" style={{ background: ORANGE }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}30` }}>
                  <Sparkles className="w-5 h-5" style={{ color: ORANGE }} />
                </div>
                <h3 className="font-grotesk font-bold text-lg">Explorer la plateforme</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { t: 'Vue d\'ensemble', to: '/documentation/overview' },
                  { t: 'Réseau social', to: '/documentation/social' },
                  { t: 'Messagerie', to: '/documentation/messaging' },
                  { t: 'Forum & discussions', to: '/documentation/forum' },
                  { t: 'Portfolio', to: '/documentation/portfolio' },
                  { t: 'Blog & articles', to: '/documentation/blog' },
                ].map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-center justify-between py-2.5 group">
                    <span className="text-sm">{l.t}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Construire avec du code — blue */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-1.5" style={{ background: BLUE }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${BLUE}15`, border: `1px solid ${BLUE}30` }}>
                  <Code2 className="w-5 h-5" style={{ color: BLUE }} />
                </div>
                <h3 className="font-grotesk font-bold text-lg">Pour les développeurs</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { t: 'Stack technique', to: '/documentation/stack' },
                  { t: 'Modèle de données', to: '/documentation/data' },
                  { t: 'Système de design', to: '/documentation/design' },
                  { t: 'Intégrations & services', to: '/documentation/integrations' },
                  { t: 'Authentification', to: '/documentation/auth' },
                  { t: 'Conventions de code', to: '/documentation/conventions' },
                ].map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-center justify-between py-2.5 group">
                    <span className="text-sm">{l.t}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOUS LES SUJETS ===== */}
      <section className="px-5 py-16 border-t border-border bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-grotesk font-bold text-2xl md:text-3xl">Toute la documentation</h2>
            <p className="text-muted-foreground mt-2 text-sm">{DOC_TOPICS.length} sujets complets à explorer en détail.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOC_TOPICS.map((t, i) => (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 6) * 0.04 }}
              >
                <Link
                  to={`/documentation/${t.slug}`}
                  className="group relative block h-full bg-card border border-border rounded-2xl overflow-hidden hover-lift"
                >
                  <div className="relative h-24 overflow-hidden">
                    <img src={getDocImage(t.slug)} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div
                      className="absolute top-3 left-3 w-11 h-11 rounded-xl flex items-center justify-center border backdrop-blur-sm"
                      style={{ background: `${t.color}30`, borderColor: `${t.color}50` }}
                    >
                      <DocIcon name={t.icon} className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: t.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-grotesk font-bold text-base text-foreground">{t.title}</h2>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {t.isNew && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed">{t.tagline}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-5 py-10 text-center">
        <p className="font-mono text-[10px] text-muted-foreground/40">© 2026 EZA by EZA Group · Documentation publique</p>
      </div>
    </div>
  );
}