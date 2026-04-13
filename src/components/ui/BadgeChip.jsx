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
  return (
    <BadgePopup badgeKey={badge}>
      <span className={`inline-flex items-center gap-1 font-mono border rounded-full ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${cfg.border} ${cfg.bg}`}>
        <Icon className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} ${cfg.color}`} />
        <span className={cfg.color}>{badge}</span>
      </span>
    </BadgePopup>
  );
}