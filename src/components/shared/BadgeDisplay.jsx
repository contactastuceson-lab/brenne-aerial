import React from 'react';
import { Shield, Crown, Star, Award, User } from 'lucide-react';
import BadgePopup from '@/components/ui/BadgePopup';

const badgeConfig = {
  Fondateur: { icon: Crown, className: 'badge-shimmer font-mono text-xs font-bold px-3 py-1 rounded-full border border-accent/30 bg-accent/10' },
  Administrateur: { icon: Shield, className: 'font-mono text-xs font-bold px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary' },
  VIP: { icon: Star, className: 'font-mono text-xs font-bold px-3 py-1 rounded-full border border-chart-5/30 bg-chart-5/10 text-chart-5' },
  Modérateur: { icon: Award, className: 'font-mono text-xs font-bold px-3 py-1 rounded-full border border-chart-2/30 bg-chart-2/10 text-chart-2' },
  Utilisateur: { icon: User, className: 'font-mono text-xs font-bold px-3 py-1 rounded-full border border-muted-foreground/30 bg-muted text-muted-foreground' },
};

export default function BadgeDisplay({ badges = [], size = 'sm' }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const config = badgeConfig[badge] || badgeConfig.Utilisateur;
        const Icon = config.icon;
        return (
          <BadgePopup key={badge} badgeKey={badge}>
            <span className={`inline-flex items-center gap-1.5 ${config.className}`}>
              <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
              {badge}
            </span>
          </BadgePopup>
        );
      })}
    </div>
  );
}