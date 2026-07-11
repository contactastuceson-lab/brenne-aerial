import VerificationMark from '@/components/ui/VerificationMark';
import { BADGE_CONFIG } from '@/lib/droneUtils';

const MARK_TYPES = { Officiel: 'official', Vérifié: 'verified', Fondateur: 'supreme', Admin: 'government' };

export default function BadgeChip({ badge, size = 'sm' }) {
  const cfg = BADGE_CONFIG[badge] || { color: 'text-muted-foreground', border: 'border-border', bg: 'bg-muted' };
  const markType = MARK_TYPES[badge] || 'verified';
  if (size === 'sm') return <span title={badge} aria-label={badge} className={`inline-flex items-center justify-center border rounded-full ${cfg.border} ${cfg.bg}`}><VerificationMark type={markType} /></span>;
  return <span title={badge} className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-1 text-xs ${cfg.border} ${cfg.bg}`}><VerificationMark type={markType} /><span className={cfg.color}>{badge}</span></span>;
}