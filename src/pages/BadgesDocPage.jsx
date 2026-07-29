import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Shield } from 'lucide-react';
import VerificationMark from '@/components/ui/VerificationMark';
import { VERIFICATION_CONFIG } from '@/components/ui/VerificationChip';

const BADGE_CATEGORIES = [
  {
    title: 'Statuts principaux',
    description: "Les badges de statut les plus prestigieux, attribués par vérification d'identité ou activité professionnelle.",
    badges: ['verified', 'certified', 'official', 'pro', 'supreme', 'government'],
  },
  {
    title: 'Rôles & Staff',
    description: "Badges attribués aux membres de l'équipe et aux modérateurs de la communauté.",
    badges: ['moderator', 'developer', 'translator', 'mentor', 'organizer', 'protector'],
  },
  {
    title: 'Engagement',
    description: "Badges récompensant l'engagement actif et le soutien à la plateforme.",
    badges: ['beta', 'donor', 'ambassador', 'scholar', 'pioneer', 'advocate'],
  },
  {
    title: 'Soutien',
    description: "Badges reconnaissant les contributions régulières et l'innovation.",
    badges: ['contributor', 'early_supporter', 'innovator'],
  },
  {
    title: 'Rôles système',
    description: "Badges internes attribués aux fondateurs, administrateurs et pilotes.",
    badges: ['urgency'],
    systemBadges: [
      { label: 'Fondateur', color: 'text-amber-400', desc: "Membre fondateur de la communauté Eza." },
      { label: 'Collaborateur', color: 'text-blue-400', desc: "Collaborateur actif d\u2019Eza." },
      { label: 'VIP', color: 'text-purple-400', desc: "Membre VIP bénéficiant d\u2019un accès privilégié." },
      { label: 'Admin', color: 'text-red-400', desc: "Administrateur de la plateforme." },
      { label: 'Pilote', color: 'text-sky-400', desc: "Pilote de drone certifié." },
      { label: 'Officiel', color: 'text-cyan-400', desc: "Compte officiel reconnu par Eza." },
      { label: 'Vérifié', color: 'text-emerald-400', desc: "Identité vérifiée par l\u2019équipe Eza." },
      { label: 'Beta Testeur', color: 'text-rose-400', desc: "Membre ayant participé aux phases de test bêta." },
      { label: 'Partenaire', color: 'text-orange-400', desc: "Partenaire officiel d\u2019Eza." },
      { label: 'Donateur', color: 'text-red-300', desc: "Membre ayant soutenu financièrement le projet." },
    ],
  },
];

export default function BadgesDocPage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative px-5 py-16 max-w-5xl mx-auto">
          <Link to="/documentation" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la documentation
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-[11px] tracking-[3px] uppercase text-primary/70">Documentation</span>
          </div>
          <h1 className="font-grotesk font-black text-3xl sm:text-4xl leading-tight">
            Badges & <span className="gradient-text">Certifications</span>
          </h1>
          <p className="font-inter text-sm text-muted-foreground mt-3 max-w-2xl">
            Découvrez tous les badges du système Eza, leur signification, leur couleur et les conditions d'attribution. Les badges sont classés par catégorie.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10 space-y-12">
        {BADGE_CATEGORIES.map((cat, ci) => (
          <motion.section
            key={cat.title}
            id={cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.05 }}
          >
            <div className="mb-5">
              <h2 className="font-grotesk font-bold text-xl text-foreground mb-1">{cat.title}</h2>
              <p className="font-inter text-sm text-muted-foreground">{cat.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.badges.map((key) => {
                const cfg = VERIFICATION_CONFIG[key];
                if (!cfg) return null;
                return (
                  <div
                    key={key}
                    id={key}
                    className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-start scroll-mt-20"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <VerificationMark type={key} size="2em" marginLeft="0" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-grotesk font-bold text-sm text-foreground">{cfg.label}</p>
                      <span className={`inline-block text-[10px] font-mono mt-0.5 ${cfg.color}`}>{key}</span>
                      <p className="font-inter text-xs text-muted-foreground leading-relaxed mt-1.5">{cfg.description}</p>
                      {cfg.price && cfg.price !== '—' && (
                        <p className="font-mono text-[10px] text-muted-foreground/70 mt-1.5">Prix : {cfg.price}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {cat.systemBadges?.map((b) => (
                <div key={b.label} className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <Shield className={`w-6 h-6 ${b.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-grotesk font-bold text-sm text-foreground">{b.label}</p>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed mt-1.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}

        <div className="pt-8 border-t border-border text-center">
          <p className="font-inter text-xs text-muted-foreground">
            Pour attribuer un badge, rendez-vous dans <Link to="/admin/badges" className="text-primary hover:underline">l'espace administration</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}