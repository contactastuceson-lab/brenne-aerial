import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const statusStyles = {
  pending: 'bg-chart-5/10 text-chart-5 border-chart-5/30',
  reviewing: 'bg-primary/10 text-primary border-primary/30',
  accepted: 'bg-accent/10 text-accent border-accent/30',
  refused: 'bg-destructive/10 text-destructive border-destructive/30',
  available: 'bg-accent/10 text-accent border-accent/30',
  booked: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const style = statusStyles[status] || statusStyles.pending;
  const label = t(`common.${status}`) || status;

  return (
    <span className={`inline-flex items-center font-mono text-xs px-2.5 py-0.5 rounded-full border ${style}`}>
      {label}
    </span>
  );
}