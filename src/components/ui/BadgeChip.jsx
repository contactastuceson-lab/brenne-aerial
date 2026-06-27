import React from 'react';
import { BADGE_CONFIG } from '@/lib/droneUtils';
import BadgePopup from './BadgePopup';
import { Crown, Users, Star, Shield, Plane, BadgeCheck, CheckCircle, Zap, Award } from 'lucide-react';

const ICONS = {
  Fondateur: Crown,
  Collaborateur: Users,
  VIP: Star,
  Admin: Shield,
  Pilote: Plane,
  Officiel: BadgeCheck,
  'Vérifié': CheckCircle,
  'Beta Testeur': Zap,
  Partenaire: Award,
};

export default function BadgeChip({ badge, size = 'sm' }) {
  const cfg = BADGE_CONFIG[badge] || { color: 'text-muted-foreground', border: 'border-border', bg: 'bg-muted' };
  const Icon = ICONS[badge] || Shield;
  const isSmall = size === 'sm';

  return (
    <BadgePopup badgeKey={badge}>
      {isSmall ? (
        <span
          className={`inline-flex items-center justify-center font-mono border rounded-full ${cfg.border} ${cfg.bg} p-1`} 
          title={badge}
          aria-label={badge}
        >
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </span>
      ) : (
        <span className={`inline-flex items-center gap-1 font-mono border rounded-full ${
          'text-xs px-2.5 py-1'
        } ${cfg.border} ${cfg.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
          <span className={cfg.color}>{badge}</span>
        </span>
      )}
    </BadgePopup>
  );
}