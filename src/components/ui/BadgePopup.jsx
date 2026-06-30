import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, BadgeCheck, Building2, Gem, Crown, Star, Shield, Plane, Users, Award, Zap, UserCheck, Heart } from 'lucide-react';

const BADGE_INFO = {
  verified:  {
    label: 'Vérifié',
    icon: CheckCircle,
    bg: '#0ea5e9',
    issuer: 'Équipe Brenne Aerial',
    criteria: [
      'Identité vérifiée via pièce d’identité',
      "Adresse e-mail confirmée",
      'Compte actif et respectueux des règles'
    ],
    short: "Identité confirmée par Brenne Aerial.",
    description: "Ce compte a été vérifié après une vérification d'identité et des informations fournies. Ce badge aide les autres utilisateurs à reconnaître des comptes authentiques.",
    helpLink: '#'
  },
  certified: {
    label: 'Certifié',
    icon: BadgeCheck,
    bg: '#f59e0b',
    issuer: 'Brenne Aerial - Certification Pro',
    criteria: [
      'Preuve de compétence professionnelle',
      'Portfolio ou certificats validés',
      'Contrôle qualité effectué'
    ],
    short: 'Qualification professionnelle validée.',
    description: "Utilisateur certifié ayant suivi et réussi un processus de qualification professionnel validé par Brenne Aerial.",
    helpLink: '#'
  },
  official:  {
    label: 'Officiel',
    icon: Building2,
    bg: '#a855f7',
    issuer: 'Brenne Aerial - Partenaires',
    criteria: ['Organisation vérifiée', 'Compte géré par l’entité officielle'],
    short: 'Compte officiel d’une organisation partenaire.',
    description: "Ce compte représente une organisation ou une marque officiellement reconnue par Brenne Aerial.",
    helpLink: '#'
  },
  pro: {
    label: 'Pro',
    icon: Gem,
    bg: '#10b981',
    issuer: 'Brenne Aerial - Pro',
    criteria: ['Preuve d’activité professionnelle', 'Services fournis'],
    short: 'Professionnel reconnu.',
    description: "Professionnel reconnu dans son domaine, bénéficiant d'accès et de fonctionnalités avancées.",
    helpLink: '#'
  },
  supreme: {
    label: 'Suprême',
    icon: Crown,
    gradient: true,
    issuer: 'Comité Brenne Aerial',
    criteria: ['Attribution sur invitation', 'Contribution exceptionnelle'],
    short: 'Badge prestigieux sur invitation.',
    description: "Badge rare attribué aux membres ayant contribué de manière exceptionnelle à la communauté.",
    helpLink: '#'
  },
  Fondateur: { label: 'Fondateur', icon: Star, bg: '#eab308', short: 'Membre fondateur.', description: 'Membre fondateur de la communauté Brenne Aerial.' },
  Collaborateur: { label: 'Collaborateur', icon: UserCheck, bg: '#3b82f6', short: 'Contributeur actif.', description: 'Collaborateur actif de Brenne Aerial.' },
  VIP: { label: 'VIP', icon: Award, bg: '#a855f7', short: 'Accès privilégié.', description: 'Membre VIP bénéficiant d’un accès privilégié.' },
  Admin: { label: 'Admin', icon: Shield, bg: '#ef4444', short: 'Administrateur.', description: 'Administrateur de la plateforme.' },
  Pilote: { label: 'Pilote', icon: Plane, bg: '#0ea5e9', short: 'Pilote certifié.', description: 'Pilote de drone certifié.' },
  Officiel: { label: 'Officiel', icon: CheckCircle, bg: '#06b6d4', short: 'Compte officiel.', description: 'Compte officiel reconnu par Brenne Aerial.' },
  'Vérifié': { label: 'Vérifié', icon: CheckCircle, bg: '#22c55e', short: 'Identité vérifiée.', description: 'Identité vérifiée par l’équipe Brenne Aerial.' },
  'Beta Testeur': { label: 'Beta Testeur', icon: Zap, bg: '#ec4899', short: 'Testeur bêta.', description: 'Membre ayant participé aux phases de test bêta.' },
  Partenaire: { label: 'Partenaire', icon: Award, bg: '#f97316', short: 'Partenaire officiel.', description: 'Partenaire officiel de Brenne Aerial.' },
  Donateur: { label: 'Donateur', icon: Heart, bg: '#ef4444', short: 'Supporteur du projet.', description: 'Membre ayant soutenu financièrement le projet.' },
};

/**
 * @param {{
 *   info: {
 *     label: string,
 *     icon: import('react').ComponentType<any>,
 *     bg?: string,
 *     gradient?: boolean,
 *     issuer?: string,
 *     criteria?: string[],
 *     short?: string,
 *     description?: string,
 *     helpLink?: string,
 *     hideAction?: boolean,
 *     content?: import('react').ReactNode,
 *   },
 *   anchorRect: DOMRect | null,
 *   onClose: () => void,
 * }} props
 */
function Popup({ info, anchorRect, onClose }) {
  const popupRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const pos = anchorRect
    ? { top: anchorRect.top + window.scrollY - 8, left: anchorRect.left + anchorRect.width / 2 }
    : { top: 0, left: 0 };
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // trigger entrance animation for modal variant
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    /** @param {MouseEvent} e */
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(/** @type {Node} */ (e.target))) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const Icon = info.icon;
  const criteria = /** @type {string[]} */ (info.criteria || []);
  // Special modal variant for verification-like badges (Vérifié / Certifié / Pro / Suprême / Officiel): slide up from bottom to center
  const labelNorm = (info.label || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const verificationKeywords = ['verif', 'certif', 'pro', 'suprem', 'supr', 'offic', 'official'];
  const isVerificationModal = verificationKeywords.some(k => labelNorm.includes(k));

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
          <div className="w-full bg-gradient-to-r from-primary/60 via-primary/40 to-amber-400/20 p-2">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-background/10 shadow-sm"
                style={info.gradient ? { background: 'linear-gradient(135deg,#f59e0b,#fde68a,#b45309)' } : { background: info.bg }}
              >
                <Icon className={`h-5 w-5 ${info.gradient ? 'text-yellow-900' : 'text-white'}`} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">Vérification</p>
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
        {/* Arrow */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />

        {/* Big icon */}
        <div className="flex flex-col items-center mb-3">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={info.gradient
              ? { background: 'linear-gradient(135deg, #f59e0b, #fde68a, #b45309)', boxShadow: '0 0 12px rgba(245,158,11,0.5)' }
              : { background: info.bg }
            }
          >
            <Icon className={`w-6 h-6 ${info.gradient ? 'text-yellow-900' : 'text-white'}`} strokeWidth={2.5} />
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

/**
 * @param {{
 *   badgeKey: keyof typeof BADGE_INFO,
 *   badgeInfo?: {
 *     label: string,
 *     icon: import('react').ComponentType<any>,
 *     bg?: string,
 *     gradient?: boolean,
 *     issuer?: string,
 *     criteria?: string[],
 *     short?: string,
 *     description?: string,
 *     helpLink?: string,
 *     hideAction?: boolean,
 *     content?: import('react').ReactNode,
 *   } | null,
 *   children: import('react').ReactNode,
 * }} props
 */
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
        <Popup info={info} anchorRect={anchorRef.current?.getBoundingClientRect() ?? null} onClose={() => setOpen(false)} />
      )}
    </span>
  );
}