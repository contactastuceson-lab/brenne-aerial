import React from 'react';
import { AFFILIATION_STATUSES, STATUS_ORDER } from '@/lib/affiliationStatus';

export default function AffiliationStats({ affiliations }) {
  const total = affiliations.length;
  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = affiliations.filter(a => a.status === s).length;
    return acc;
  }, {});
  const publicCount = affiliations.filter(a => a.visibility === 'public').length;

  const cards = [
    { label: 'Total affiliations', value: total, cls: 'border-border' },
    { label: 'En attente', value: counts.pending, cls: 'border-amber-400/20', text: 'text-amber-400' },
    { label: 'Acceptées', value: counts.accepted, cls: 'border-emerald-400/20', text: 'text-emerald-400' },
    { label: 'Refusées', value: counts.rejected, cls: 'border-red-400/20', text: 'text-red-400' },
    { label: 'Supprimées', value: counts.removed, cls: 'border-zinc-400/20', text: 'text-zinc-400' },
    { label: 'Logos publics', value: publicCount, cls: 'border-primary/20', text: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map(c => (
        <div key={c.label} className={`bg-card border ${c.cls} rounded-xl p-3`}>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
          <p className={`font-grotesk font-bold text-xl ${c.text || ''}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}