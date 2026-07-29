import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, CheckCircle, Star, Shield, Plane, Users, Award, Zap, UserCheck, Heart, Megaphone, Code, Languages, GraduationCap, BookOpen, Compass, Sparkles, CalendarDays, GitPullRequest, Clock, ShieldCheck, Lightbulb } from 'lucide-react';
import VerificationMark from '@/components/ui/VerificationMark';

const BADGE_INFO = {
  verified:  {
    label: 'Vérifié',
    icon: CheckCircle,
    bg: '#0ea5e9',
    issuer: 'Équipe Eza',
    criteria: [
      'Identité vérifiée via pièce d\u2019identité',
      "Adresse e-mail confirmée",
      'Compte actif et respectueux des règles'
    ],
    short: "Identité confirmée par Eza.",
    description: "Ce compte a été vérifié après une vérification d'identité et des informations fournies. Ce badge aide les autres utilisateurs à reconnaître des comptes authentiques.",
    helpLink: '#'
  },
  certified: {
    label: 'Certifié',
    icon: Check,
    bg: '#f59e0b',
    issuer: 'Eza - Certification Pro',
    criteria: [
      'Preuve de compétence professionnelle',
      'Portfolio ou certificats validés',
      'Contrôle qualité effectué'
    ],
    short: 'Qualification professionnelle validée.',
    description: "Utilisateur certifié ayant suivi et réussi un processus de qualification professionnel validé par Eza.",
    helpLink: '#'
  },
  official:  {
    label: 'Officiel',
    icon: Check,
    bg: '#a855f7',
    issuer: 'Eza - Partenaires',
    criteria: ['Organisation vérifiée', 'Compte géré par l\u2019entité officielle'],
    short: 'Compte officiel d\u2019une organisation partenaire.',
    description: "Ce compte représente une organisation ou une marque officiellement reconnue par Eza.",
    helpLink: '#'
  },
  pro: {
    label: 'Pro',
    icon: Check,
    bg: '#10b981',
    issuer: 'Eza - Pro',
    criteria: ['Preuve d\u2019activité professionnelle', 'Services fournis'],
    short: 'Professionnel reconnu.',
    description: "Professionnel reconnu dans son domaine, bénéficiant d'accès et de fonctionnalités avancées.",
    helpLink: '#'
  },
  supreme: {
    label: 'Suprême',
    icon: Check,
    bg: '#f59e0b',
    issuer: 'Équipe eza',
    criteria: ['Attribution sur invitation', 'Contribution exceptionnelle'],
    short: 'Badge prestigieux sur invitation.',
    description: "Badge rare attribué aux membres ayant contribué de manière exceptionnelle à la communauté.",
    helpLink: '#'
  },
  government: { label: 'Gouvernement et multilatéral', icon: Check, bg: '#71717a', issuer: 'Équipe eza', short: 'Institution vérifiée.', description: 'Compte officiel d\u2019une institution gouvernementale ou multilatérale vérifiée.' },
  urgency: { label: 'Urgence', icon: Zap, bg: '#ef4444', issuer: 'Eza - Urgence', criteria: ['Habilitation aux interventions urgentes', 'Disponibilité 24/7'], short: 'Interventions urgentes sur le terrain.', description: 'Professionnel habilité à intervenir en urgence sur le terrain pour des situations critiques.' },
  moderator: { label: 'Modérateur', icon: Shield, bg: '#dc2626', issuer: 'Équipe eza', criteria: ['Formation à la modération', 'Expérience communautaire'], short: 'Régule la communauté Eza.', description: 'Modérateur de la communauté Eza chargé de réguler les discussions et traiter les signalements.' },
  beta: { label: 'Beta Testeur', icon: Zap, bg: '#ec4899', issuer: 'Équipe eza', short: 'Testeur des nouvelles fonctionnalités.', description: 'Pionnier participant activement aux tests des nouvelles fonctionnalités d\u2019Eza avant leur lancement.' },
  donor: { label: 'Donateur', icon: Heart, bg: '#fca5a5', issuer: 'Équipe eza', short: 'Soutient financièrement Eza.', description: 'Membre qui soutient financièrement Eza par des dons réguliers ou exceptionnels.' },
  ambassador: { label: 'Ambassadeur', icon: Megaphone, bg: '#f97316', issuer: 'Eza - Partenaires', criteria: ['Représente une marque partenaire', 'Accord de partenariat signé'], short: 'Représentant officiel d\u2019une marque partenaire.', description: 'Ambassadeur officiel représentant une marque partenaire d\u2019Eza sur la plateforme.' },
  developer: { label: 'Développeur', icon: Code, bg: '#3b82f6', issuer: 'Équipe eza', criteria: ['Contributions au code source', 'Pull requests acceptées'], short: 'Contribue au code source d\u2019Eza.', description: 'Développeur qui contribue activement au développement du code source de la plateforme Eza.' },
  translator: { label: 'Traducteur', icon: Languages, bg: '#06b6d4', issuer: 'Équipe eza', criteria: ['Traductions validées', 'Langue maternelle vérifiée'], short: 'Traduit la plateforme en d\u2019autres langues.', description: 'Bénévole dévoué à la traduction de la plateforme Eza dans de nouvelles langues.' },
  mentor: { label: 'Mentor', icon: GraduationCap, bg: '#9333ea', issuer: 'Équipe eza', criteria: ['Expérience communautaire reconnue', 'Disponibilité pour accompagner'], short: 'Accompagne les nouveaux membres.', description: 'Mentor expérimenté qui accompagne et conseille les nouveaux membres de la communauté Eza.' },
  scholar: { label: 'Érudit', icon: BookOpen, bg: '#6366f1', issuer: 'Équipe eza', criteria: ['Travaux de recherche validés', 'Connaissances approfondies'], short: 'Connaissances approfondies et recherche.', description: 'Membre reconnu pour ses connaissances approfondies et son travail de recherche sur des sujets de pointe.' },
  pioneer: { label: 'Pionnier', icon: Compass, bg: '#059669', issuer: 'Équipe eza', criteria: ['Inscription lors du lancement', 'Fidélité depuis les débuts'], short: 'Premier membre dès le lancement.', description: 'Un des premiers membres à avoir rejoint Eza dès son lancement, contribuant à poser les bases de la communauté.' },
  advocate: { label: 'Avocat', icon: Sparkles, bg: '#ec4899', issuer: 'Équipe eza', criteria: ['Engagement actif dans le plaidoyer', 'Participation aux initiatives'], short: 'Militant pour les valeurs d\u2019Eza.', description: 'Militant actif qui défend les valeurs de la communauté Eza et participe aux initiatives solidaires.' },
  organizer: { label: 'Organisateur', icon: CalendarDays, bg: '#14b8a6', issuer: 'Équipe eza', criteria: ['Événements organisés avec succès', 'Expérience reconnue'], short: 'Organise des événements communautaires.', description: 'Organisateur d\u2019événements et de rencontres au sein de la communauté Eza.' },
  contributor: { label: 'Contributeur', icon: GitPullRequest, bg: '#8b5cf6', issuer: 'Équipe eza', criteria: ['Contributions régulières', 'Participation active aux projets'], short: 'Contributeur régulier aux projets.', description: 'Membre contribuant régulièrement aux projets, discussions et initiatives de la communauté Eza.' },
  early_supporter: { label: 'Soutien historique', icon: Clock, bg: '#d97706', issuer: 'Équipe eza', criteria: ['Soutien dès les tout débuts', 'Fidélité démontrée'], short: 'A soutenu Eza dès le début.', description: 'Membre qui a soutenu Eza dès les tout débuts du projet, contribuant à son développement et sa croissance.' },
  protector: { label: 'Protecteur', icon: ShieldCheck, bg: '#64748b', issuer: 'Équipe eza', criteria: ['Veille à la sécurité communautaire', 'Formation à la sécurité'], short: 'Veille à la sécurité de la communauté.', description: 'Protecteur de la communauté, chargé de faire respecter les règles et d\u2019assurer un environnement sûr.' },
  innovator: { label: 'Innovateur', icon: Lightbulb, bg: '#d946ef', issuer: 'Équipe eza', criteria: ['Idées novantes proposées', 'Fonctionnalités originales'], short: 'Propose des idées novantes.', description: 'Membre qui propose régulièrement des idées novantes et des fonctionnalités originales pour améliorer Eza.' },
  Fondateur: { label: 'Fondateur', icon: Star, bg: '#eab308', short: 'Membre fondateur.', description: 'Membre fondateur de la communauté eza.' },
  Collaborateur: { label: 'Collaborateur', icon: UserCheck, bg: '#3b82f6', short: 'Contributeur actif.', description: 'Collaborateur actif d\u2019Eza.' },
  VIP: { label: 'VIP', icon: Award, bg: '#a855f7', short: 'Accès privilégié.', description: 'Membre VIP bénéficiant d\u2019un accès privilégié.' },
  Admin: { label: 'Admin', icon: Shield, bg: '#ef4444', short: 'Administrateur.', description: 'Administrateur de la plateforme.' },
  Pilote: { label: 'Pilote', icon: Plane, bg: '#0ea5e9', short: 'Pilote certifié.', description: 'Pilote de drone certifié.' },
  Officiel: { label: 'Officiel', icon: CheckCircle, bg: '#06b6d4', short: 'Compte officiel.', description: 'Compte officiel reconnu par Eza.' },
  'Vérifié': { label: 'Vérifié', icon: CheckCircle, bg: '#22c55e', short: 'Identité vérifiée.', description: 'Identité vérifiée par l\u2019équipe Eza.' },
  'Beta Testeur': { label: 'Beta Testeur', icon: Zap, bg: '#ec4899', short: 'Testeur bêta.', description: 'Membre ayant participé aux phases de test bêta.' },
  Partenaire: { label: 'Partenaire', icon: Award, bg: '#f97316', short: 'Partenaire officiel.', description: 'Partenaire officiel d\u2019Eza.' },
  Donateur: { label: 'Donateur', icon: Heart, bg: '#ef4444', short: 'Supporteur du projet.', description: 'Membre ayant soutenu financièrement le projet.' },
};

// Gradient header reserved for the main status badges only
const GRADIENT_BG = {
  supreme: 'linear-gradient(135deg, #fde047, #eab308, #a16207)',
  verified: 'linear-gradient(135deg, #38bdf8, #0ea5e9, #0284c7)',
  certified: 'linear-gradient(135deg, #fde047, #eab308, #a16207)',
  official: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
  pro: 'linear-gradient(135deg, #34d399, #10b981, #047857)',
  government: 'linear-gradient(135deg, #a4b0b8, #71717a, #52525b)',
};

function Popup({ info, badgeKey, anchorRect, onClose }) {
  const popupRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const pos = anchorRect
    ? { top: anchorRect.top + window.scrollY - 8, left: anchorRect.left + anchorRect.width / 2 }
    : { top: 0, left: 0 };
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(/** @type {Node} */ (e.target))) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const Icon = info.icon || Check;
  const criteria = /** @type {string[]} */ (info.criteria || []);
  const labelNorm = (info.label || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const verificationKeywords = ['verif', 'certif', 'pro', 'suprem', 'supr', 'offic', 'official', 'gouvern', 'multilat',
    'urgence', 'moderat', 'beta', 'donat', 'ambassad', 'develop', 'traduct', 'mentor', 'erudit', 'scholar',
    'pionn', 'avocat', 'organis', 'contribu', 'soutien', 'protect', 'innovat'];
  const isVerificationModal = verificationKeywords.some(k => labelNorm.includes(k));
  const headerBg = GRADIENT_BG[badgeKey] || 'linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.4), hsl(38 93% 58% / 0.2))';

  if (isVerificationModal) {
    const startStyle = { transform: 'translateY(100%)', opacity: 0 };
    const endStyle = { transform: 'translateY(0)', opacity: 1, transition: 'transform 360ms cubic-bezier(.2,.9,.3,1), opacity 360ms ease' };
    return createPortal(
      <div className="fixed inset-0 z-[9999]" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <div
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          style={entered ? endStyle : startStyle}
          className="absolute inset-x-0 bottom-0 w-full h-[24vh] max-h-[28vh] flex flex-col bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden"
        >
          <div className="relative w-full p-2" style={{ background: headerBg }}>
            <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 text-white/80 hover:bg-black/20 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-background/10 shadow-sm">
                <VerificationMark type={badgeKey} size="2em" marginLeft="0" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">Badge</p>
                <h3 className="mt-0.5 truncate text-sm font-extrabold text-white">{info.label}</h3>
                <p className="mt-0.5 text-[11px] text-white/80">{info.short || info.description}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 pb-2">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Badge vérifié</p>
              {info.content ? (
                <div className="text-sm leading-6 text-foreground">{info.content}</div>
              ) : (
                <p className="text-sm leading-6 text-foreground">{info.description}</p>
              )}
              {criteria.length > 0 && (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {criteria.slice(0, 2).map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
            </div>
          </div>

          {info.hideAction ? null : (
            <div className="border-t border-border bg-card p-2">
              <a href={info.helpLink || '#'} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Plus d'infos
              </a>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={popupRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)', zIndex: 9999 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="w-56 bg-card border border-border rounded-2xl shadow-2xl p-4 text-left">
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />

        <div className="flex flex-col items-center mb-3">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={info.gradient
              ? { background: 'linear-gradient(135deg, #f59e0b, #fde68a, #b45309)', boxShadow: '0 0 12px rgba(245,158,11,0.5)' }
              : { background: info.bg }
            }
          >
            <Icon className="w-6 h-6 text-[#050d1a]" strokeWidth={3.5} />
          </span>
          <p className="font-grotesk font-bold text-sm" style={info.gradient ? { color: '#fde68a' } : { color: info.bg }}>
            {info.label}
          </p>
        </div>

        <p className="font-inter text-[11px] text-muted-foreground leading-relaxed text-center">
          {info.description}
        </p>
      </div>
    </div>,
    document.body
  );
}

export default function BadgePopup({ badgeKey, badgeInfo = null, children }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const info = /** @type {{
      label: string,
      icon: import('react').ComponentType<any>,
      bg?: string,
      gradient?: boolean,
      issuer?: string,
      criteria?: string[],
      short?: string,
      description?: string,
      helpLink?: string,
      hideAction?: boolean,
      content?: import('react').ReactNode,
    }} */ (badgeInfo || BADGE_INFO[badgeKey]);

  if (!info) return <>{children}</>;

  return (
    <span className="relative inline-flex" ref={anchorRef}>
      <span
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(o => !o); }}
        className="cursor-pointer inline-flex"
      >
        {children}
      </span>

      {open && (
        <Popup info={info} badgeKey={badgeKey} anchorRect={anchorRef.current?.getBoundingClientRect() ?? null} onClose={() => setOpen(false)} />
      )}
    </span>
  );
}