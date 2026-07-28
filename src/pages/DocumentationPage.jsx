import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, ArrowRight } from 'lucide-react';
import { DOC_TOPICS } from '@/lib/docsContent';
import DocIcon from '@/components/docs/DocIcon';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative px-5 py-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-[11px] tracking-[3px] uppercase text-primary/70">Documentation</span>
          </div>
          <h1 className="font-grotesk font-black text-3xl sm:text-4xl leading-tight">
            Tout ce qu'il faut savoir sur <span className="gradient-text">EZA</span>
          </h1>
          <p className="font-inter text-sm text-muted-foreground mt-3 max-w-2xl">
            Un guide complet des fonctionnalités publiques. Choisissez un thème pour explorer chaque partie en détail.
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOC_TOPICS.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/documentation/${t.slug}`}
                className="group block h-full bg-card border border-border rounded-2xl p-5 hover-lift"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border"
                    style={{ background: `${t.color}15`, borderColor: `${t.color}30` }}
                  >
                    <DocIcon name={t.icon} className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="font-grotesk font-bold text-base text-foreground mb-1">{t.title}</h2>
                <p className="font-inter text-xs text-muted-foreground leading-relaxed">{t.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border text-center">
          <p className="font-mono text-[10px] text-muted-foreground/40">© 2026 EZA by EZA Group · Documentation publique</p>
        </div>
      </div>
    </div>
  );
}