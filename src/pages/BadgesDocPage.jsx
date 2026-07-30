import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle2, Sparkles, Coins, Award, BookOpen } from 'lucide-react';
import VerificationMark from '@/components/ui/VerificationMark';
import { BADGE_DOC_DATA, BADGE_DOC_CATEGORIES } from '@/lib/badgesDocContent';

const CATEGORY_ICONS = {
  'Statuts principaux': Shield,
  'Rôles & Staff': Award,
  'Engagement': Sparkles,
  'Soutien': CheckCircle2,
  'Rôles système': Coins,
};

export default function BadgesDocPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative px-5 py-16 max-w-5xl mx-auto">
          <Link to="/documentation" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la documentation
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/!20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-[11px] tracking-[3px] uppercase text-primary/70">Documentation</span>
          </div>
          <h1 className="font-grotesk font-black text-3xl sm:text-4xl leading-tight">
            Badges & <span className="gradient-text">Certifications</span>
          </h1>
          <p className="font-inter text-sm text-muted-foreground mt-3 max-w-2xl">
            Découvrez en détail tous les badges du système Eza : leur signification, les conditions d'attribution, les avantages associés et leur prix. Chaque badge est classé par catégorie et reflète un niveau distinct de confiance ou de reconnaissance.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {BADGE_DOC_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.title] || BookOpen;
              return (
                <a key={cat.title} href={`#${cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Icon className="w-3.5 h-3.5" /> {cat.title}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 py-10 space-y-14">
        {BADGE_DOC_CATEGORIES.map((cat, ci) => {
          const CatIcon = CATEGORY_ICONS[cat.title] || BookOpen;
          return (
            <motion.section
              key={cat.title}
              id={cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <CatIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-grotesk font-bold text-xl text-foreground">{cat.title}</h2>
                  <p className="font-inter text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cat.badges.map((key) => {
                  const data = BADGE_DOC_DATA[key];
                  if (!data) return null;
                  return (
                    <div
                      key={key}
                      id={key}
                      className="bg-card border border-border rounded-2xl overflow-hidden scroll-mt-20 hover:border-primary/30 transition-colors"
                    >
                      {/* Badge header */}
                      <div className="flex items-center gap-3 p-5 border-b border-border/60">
                        <div className="flex-shrink-0">
                          <VerificationMark type={key} size="2.2em" marginLeft="0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-grotesk font-bold text-base ${data.color}`}>{data.label}</h3>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{key}</span>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground/70 mt-0.5">{data.price}</p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        {/* Description */}
                        <p className="font-inter text-sm text-foreground/80 leading-relaxed">{data.description}</p>

                        {/* Criteria */}
                        <div>
                          <p className="font-grotesk font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Conditions d'attribution
                          </p>
                          <ul className="space-y-1.5">
                            {data.criteria.map((c, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary/50 mt-0.5 flex-shrink-0 text-xs">▸</span>
                                <span className="font-inter text-xs text-muted-foreground leading-relaxed">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Perks */}
                        <div>
                          <p className="font-grotesk font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Avantages
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {data.perks.map((p, i) => (
                              <span key={i} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${data.color} border-current/20 bg-current/5`}>
                                <span className="w-1 h-1 rounded-full bg-current" /> {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}

        {/* Footer CTA */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border">
            <div className="text-center sm:text-left">
              <p className="font-grotesk font-bold text-sm text-foreground">Vous souhaitez obtenir un badge ?</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Découvrez les forfats disponibles et souscrivez en ligne.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/premium" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-grotesk font-bold hover:bg-primary/90 transition-all whitespace-nowrap">
                Voir les forfaits
              </Link>
              <Link to="/admin/badges" className="px-5 py-2.5 rounded-full border border-border text-xs font-grotesk font-bold text-muted-foreground hover:text-foreground transition-all whitespace-nowrap">
                Espace admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}