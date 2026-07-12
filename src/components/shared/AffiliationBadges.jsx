/**
 * AffiliationBadges — Affiche les badges d'affiliation d'un utilisateur.
 * Utilisable dans les publications, profils, commentaires, notifications, etc.
 *
 * Props:
 *   userId   – ID de l'utilisateur (charge ses affiliations via le cache)
 *   size     – 'sm' | 'md'
 *   max      – nombre max de badges affichés (défaut: 2)
 */
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Star, Shield, Code2, Headset, Handshake,
  Newspaper, Video, ShieldAlert, Crown, Briefcase, Users,
  UserCheck, Award, Zap
} from 'lucide-react';
import { useOrganizationAffiliations } from '@/hooks/useOrganizationAffiliations';
import AffiliationModal from '@/components/ui/AffiliationModal';
import { handleIdentityClick } from '@/lib/identityClick';

// Configuration visuelle par rôle d'affiliation
const ROLE_CONFIG = {
  // Rôles généraux
  employe:      { label: 'Employé',      icon: Briefcase,   color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',   border: 'rgba(59,130,246,0.35)'  },
  employee:     { label: 'Employé',      icon: Briefcase,   color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',   border: 'rgba(59,130,246,0.35)'  },
  fondateur:    { label: 'Fondateur',    icon: Star,        color: '#eab308', bg: 'rgba(234,179,8,0.15)',    border: 'rgba(234,179,8,0.40)'   },
  founder:      { label: 'Fondateur',    icon: Star,        color: '#eab308', bg: 'rgba(234,179,8,0.15)',    border: 'rgba(234,179,8,0.40)'   },
  administrateur:{ label: 'Admin',       icon: Shield,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.35)'   },
  admin:        { label: 'Admin',        icon: Shield,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.35)'   },
  developpeur:  { label: 'Dev',          icon: Code2,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.30)'  },
  developer:    { label: 'Dev',          icon: Code2,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.30)'  },
  support:      { label: 'Support',      icon: Headset,     color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',    border: 'rgba(6,182,212,0.30)'   },
  partenaire:   { label: 'Partenaire',   icon: Handshake,   color: '#f97316', bg: 'rgba(249,115,22,0.12)',   border: 'rgba(249,115,22,0.30)'  },
  partner:      { label: 'Partenaire',   icon: Handshake,   color: '#f97316', bg: 'rgba(249,115,22,0.12)',   border: 'rgba(249,115,22,0.30)'  },
  presse:       { label: 'Presse',       icon: Newspaper,   color: '#64748b', bg: 'rgba(100,116,139,0.12)',  border: 'rgba(100,116,139,0.30)' },
  press:        { label: 'Presse',       icon: Newspaper,   color: '#64748b', bg: 'rgba(100,116,139,0.12)',  border: 'rgba(100,116,139,0.30)' },
  createur:     { label: 'Créateur',     icon: Video,       color: '#ec4899', bg: 'rgba(236,72,153,0.12)',   border: 'rgba(236,72,153,0.30)'  },
  creator:      { label: 'Créateur',     icon: Video,       color: '#ec4899', bg: 'rgba(236,72,153,0.12)',   border: 'rgba(236,72,153,0.30)'  },
  moderateur:   { label: 'Modérateur',   icon: ShieldAlert, color: '#10b981', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.30)'  },
  moderator:    { label: 'Modérateur',   icon: ShieldAlert, color: '#10b981', bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.30)'  },
  membre:       { label: 'Membre',       icon: Users,       color: '#94a3b8', bg: 'rgba(148,163,184,0.10)',  border: 'rgba(148,163,184,0.25)' },
  member:       { label: 'Membre',       icon: Users,       color: '#94a3b8', bg: 'rgba(148,163,184,0.10)',  border: 'rgba(148,163,184,0.25)' },
  // fallback
  default:      { label: 'Affilié',      icon: Building2,   color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',   border: 'rgba(56,189,248,0.30)'  },
};

function getRoleConfig(role) {
  if (!role) return ROLE_CONFIG.default;
  const key = role.toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z]/g, '');
  return ROLE_CONFIG[key] || ROLE_CONFIG.default;
}

function SingleBadge({ affiliation, size, onOpen }) {
  const cfg = getRoleConfig(affiliation.role);
  const Icon = cfg.icon;
  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-1 rounded-full font-inter font-semibold transition-all hover:brightness-110"
      style={{ fontSize: isSmall ? '10px' : '11px', padding: isSmall ? '2px 6px' : '3px 8px', color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, lineHeight: 1.4 }}
    >
      <Icon style={{ width: isSmall ? 9 : 11, height: isSmall ? 9 : 11, flexShrink: 0 }} strokeWidth={2.5} />
      <span className="truncate max-w-[80px]">{affiliation.organizationName || cfg.label}</span>
    </button>
  );
}

export default function AffiliationBadges({ userId, size = 'sm', max = 2 }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { affiliations, loading } = useOrganizationAffiliations(
    userId ? { userId } : null
  );

  const visible = useMemo(
    () => affiliations.filter((a) => a?.status === 'accepted' && a?.visibility === 'public'),
    [affiliations]
  );

  if (loading || visible.length === 0) return null;

  const shown = visible.slice(0, max);
  const extra = visible.length - shown.length;

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {shown.map((aff) => (
        <SingleBadge key={aff.id} affiliation={aff} size={size} onOpen={(event) => handleIdentityClick({ event, navigate, pathname: location.pathname, user: { id: userId }, onProfileClick: () => setOpen(true) })} />
      ))}
      <AffiliationModal user={{ id: userId }} open={open} onOpenChange={setOpen} />
      {extra > 0 && (
        <span
          className="inline-flex items-center rounded-full font-mono font-bold"
          style={{
            fontSize: '10px',
            padding: '2px 5px',
            color: '#94a3b8',
            background: 'rgba(148,163,184,0.08)',
            border: '1px solid rgba(148,163,184,0.2)',
          }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}