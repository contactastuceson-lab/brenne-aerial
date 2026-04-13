import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, BadgeCheck, Building2, Gem, Crown, Star, Shield, Plane, Users, Award, Zap, UserCheck, Heart } from 'lucide-react';

const BADGE_INFO = {
  // Verification badges
  verified:  {
    label: 'Vérifié',
    icon: CheckCircle,
    color: 'text-sky-400',
    bg: 'bg-sky-500',
    description: "Ce compte a été vérifié par l'équipe Brenne Aerial. L'identité de l'utilisateur a été confirmée.",
  },
  certified: {
    label: 'Certifié',
    icon: BadgeCheck,
    color: 'text-amber-400',
    bg: 'bg-amber-500',
    description: "Utilisateur certifié ayant validé un processus de qualification professionnel auprès de Brenne Aerial.",
  },
  official: {
    label: 'Officiel',
    icon: Building2,
    color: 'text-purple-400',
    bg: 'bg-purple-500',
    description: "Compte officiel d'une organisation, entreprise ou entité partenaire de Brenne Aerial.",
  },
  pro: {
    label: 'Pro',
    icon: Gem,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500',
    description: "Professionnel reconnu dans son domaine, bénéficiant d'un accès et de fonctionnalités avancées.",
  },
  supreme: {
    label: 'Suprême',
    icon: Crown,
    color: 'text-yellow-300',
    gradient: true,
    description: "Le badge le plus rare et le plus prestigieux. Réservé aux membres d'exception ayant contribué de manière extraordinaire à la communauté Brenne Aerial.",
  },
  // Classic badges
  Fondateur: {
    label: 'Fondateur',
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500',
    description: "Membre fondateur de la communauté Brenne Aerial. A soutenu le projet dès ses débuts.",
  },
  Collaborateur: {
    label: 'Collaborateur',
    icon: UserCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500',
    description: "Collaborateur actif de Brenne Aerial, contribuant régulièrement aux projets et à la communauté.",
  },
  VIP: {
    label: 'VIP',
    icon: Award,
    color: 'text-purple-400',
    bg: 'bg-purple-500',
    description: "Membre VIP bénéficiant d'un accès privilégié et de services exclusifs.",
  },
  Admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-400',
    bg: 'bg-red-500',
    description: "Administrateur de la plateforme Brenne Aerial, responsable de la gestion et de la modération.",
  },
  Pilote: {
    label: 'Pilote',
    icon: Plane,
    color: 'text-primary',
    bg: 'bg-sky-600',
    description: "Pilote de drone certifié, ayant prouvé ses compétences techniques et sa maîtrise du pilotage.",
  },
  Officiel: {
    label: 'Officiel',
    icon: CheckCircle,
    color: 'text-accent',
    bg: 'bg-cyan-500',
    description: "Compte officiel reconnu par Brenne Aerial.",
  },
  'Vérifié': {
    label: 'Vérifié',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500',
    description: "Identité vérifiée par l'équipe Brenne Aerial.",
  },
  'Beta Testeur': {
    label: 'Beta Testeur',
    icon: Zap,
    color: 'text-pink-400',
    bg: 'bg-pink-500',
    description: "Membre ayant participé aux phases de test bêta de la plateforme. Merci pour votre précieux retour !",
  },
  Partenaire: {
    label: 'Partenaire',
    icon: Award,
    color: 'text-orange-400',
    bg: 'bg-orange-500',
    description: "Partenaire officiel de Brenne Aerial, collaborant dans le cadre d'un accord de partenariat.",
  },
  Donateur: {
    label: 'Donateur',
    icon: Heart,
    color: 'text-red-400',
    bg: 'bg-red-500',
    description: "Membre ayant soutenu financièrement le projet Brenne Aerial. Merci pour votre générosité !",
  },
};

export default function BadgePopup({ badgeKey, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const info = BADGE_INFO[badgeKey];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!info) return <>{children}</>;

  const Icon = info.icon;

  return (
    <span className="relative inline-flex" ref={ref}>
      <span
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="cursor-pointer inline-flex"
      >
        {children}
      </span>

      {open && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-card border border-border rounded-2xl shadow-xl p-4 text-left"
          onClick={e => e.stopPropagation()}
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />

          {/* Close */}
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>

          {/* Big icon */}
          <div className="flex flex-col items-center mb-3">
            <span
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${info.gradient ? '' : (info.bg || 'bg-sky-500')}`}
              style={info.gradient ? { background: 'linear-gradient(135deg, #f59e0b, #fde68a, #b45309)', boxShadow: '0 0 12px rgba(245,158,11,0.5)' } : {}}
            >
              <Icon className={`w-6 h-6 ${info.gradient ? 'text-yellow-900' : 'text-white'}`} strokeWidth={2.5} />
            </span>
            <p className={`font-grotesk font-bold text-sm ${info.gradient ? 'text-yellow-300' : info.color}`}>
              {info.label}
            </p>
          </div>

          <p className="font-inter text-[11px] text-muted-foreground leading-relaxed text-center">
            {info.description}
          </p>
        </div>
      )}
    </span>
  );
}