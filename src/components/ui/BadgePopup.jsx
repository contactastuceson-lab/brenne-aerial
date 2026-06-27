import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, BadgeCheck, Building2, Gem, Crown, Star, Shield, Plane, Users, Award, Zap, UserCheck, Heart } from 'lucide-react';

const BADGE_INFO = {
  verified:  { label: 'Vérifié', icon: CheckCircle, bg: '#0ea5e9', description: "Ce compte a été vérifié par l'équipe Brenne Aerial. L'identité de l'utilisateur a été confirmée." },
  certified: { label: 'Certifié', icon: BadgeCheck, bg: '#f59e0b', description: "Utilisateur certifié ayant validé un processus de qualification professionnel auprès de Brenne Aerial." },
  official:  { label: 'Officiel', icon: Building2, bg: '#a855f7', description: "Compte officiel d'une organisation ou entité partenaire de Brenne Aerial." },
  pro:       { label: 'Pro', icon: Gem, bg: '#10b981', description: "Professionnel reconnu dans son domaine, bénéficiant d'accès et de fonctionnalités avancées." },
  supreme:   { label: 'Suprême', icon: Crown, gradient: true, description: "Le badge le plus rare et le plus prestigieux. Réservé aux membres d'exception ayant contribué de manière extraordinaire à la communauté Brenne Aerial." },
  Fondateur: { label: 'Fondateur', icon: Star, bg: '#eab308', description: "Membre fondateur de la communauté Brenne Aerial. A soutenu le projet dès ses débuts." },
  Collaborateur: { label: 'Collaborateur', icon: UserCheck, bg: '#3b82f6', description: "Collaborateur actif de Brenne Aerial, contribuant régulièrement aux projets et à la communauté." },
  VIP: { label: 'VIP', icon: Award, bg: '#a855f7', description: "Membre VIP bénéficiant d'un accès privilégié et de services exclusifs." },
  Admin: { label: 'Admin', icon: Shield, bg: '#ef4444', description: "Administrateur de la plateforme Brenne Aerial, responsable de la gestion et de la modération." },
  Pilote: { label: 'Pilote', icon: Plane, bg: '#0ea5e9', description: "Pilote de drone certifié, ayant prouvé ses compétences techniques et sa maîtrise du pilotage." },
  Officiel: { label: 'Officiel', icon: CheckCircle, bg: '#06b6d4', description: "Compte officiel reconnu par Brenne Aerial." },
  'Vérifié': { label: 'Vérifié', icon: CheckCircle, bg: '#22c55e', description: "Identité vérifiée par l'équipe Brenne Aerial." },
  'Beta Testeur': { label: 'Beta Testeur', icon: Zap, bg: '#ec4899', description: "Membre ayant participé aux phases de test bêta de la plateforme. Merci pour votre précieux retour !" },
  Partenaire: { label: 'Partenaire', icon: Award, bg: '#f97316', description: "Partenaire officiel de Brenne Aerial, collaborant dans le cadre d'un accord de partenariat." },
  Donateur: { label: 'Donateur', icon: Heart, bg: '#ef4444', description: "Membre ayant soutenu financièrement le projet Brenne Aerial. Merci pour votre générosité !" },
};

function Popup({ info, anchorEl, onClose }) {
  const popupRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 8,
      left: rect.left + rect.width / 2,
    });
  }, [anchorEl]);

  useEffect(() => {
    // trigger entrance animation for modal variant
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          anchorEl && !anchorEl.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorEl]);

  const Icon = info.icon;
  // Special modal variant for verification-like badges (Vérifié / Certifié / Pro / Suprême / Officiel): slide up from bottom to center
  const labelNorm = (info.label || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const verificationKeywords = ['verif', 'certif', 'pro', 'suprem', 'supr', 'offic', 'official'];
  const isVerificationModal = verificationKeywords.some(k => labelNorm.includes(k));

  if (isVerificationModal) {
    const startStyle = { transform: 'translateY(100%)', opacity: 0 };
    const endStyle = { transform: 'translateY(0)', opacity: 1, transition: 'transform 360ms cubic-bezier(.2,.9,.3,1), opacity 360ms ease' };
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-end justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <div
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          style={entered ? endStyle : startStyle}
          className="relative w-full max-w-5xl h-[60vh] bg-card border-t border-border rounded-t-3xl shadow-2xl p-6 text-left mx-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={info.gradient ? { background: 'linear-gradient(135deg,#f59e0b,#fde68a,#b45309)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' } : { background: info.bg }}
              >
                <Icon className={`w-8 h-8 ${info.gradient ? 'text-yellow-900' : 'text-white'}`} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-grotesk font-extrabold text-2xl leading-tight" style={info.gradient ? { color: '#fde68a' } : { color: info.bg }}>{info.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">{info.description}</p>
              </div>
            </div>

            <button onClick={onClose} className="rounded-full bg-background/80 border border-border p-2 text-muted-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Détails</p>
              <p className="mt-2 text-base text-foreground leading-relaxed">{info.description}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actions</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="font-medium text-foreground">Voir la vérification complète</li>
                  <li className="text-muted-foreground">Contacter l'équipe support</li>
                </ul>
              </div>
              <div className="mt-4">
                <a href="#" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Plus d'infos</a>
              </div>
            </div>
          </div>
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

        {/* Close */}
        <button onClick={onClose} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-3 h-3" />
        </button>

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

export default function BadgePopup({ badgeKey, children }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const info = BADGE_INFO[badgeKey];

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
        <Popup info={info} anchorEl={anchorRef.current} onClose={() => setOpen(false)} />
      )}
    </span>
  );
}