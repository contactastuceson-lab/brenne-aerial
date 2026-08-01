import React from 'react';
import { Ticket, Clock, Zap, TrendingUp, AlertCircle, Sparkles, Coins, Bot } from 'lucide-react';

// KPIs du dashboard support : tickets actifs, escalades, actions IA en attente,
// crédits distribués par Nexus. Données agrégées côté parent.

export default function SupportKpis({ tickets, creditsDistributed, creditsToday, nexusActionsCount }) {
  const active = tickets.filter((t) => t.status === 'open').length;
  const escalated = tickets.filter((t) => t.status === 'awaiting_human').length;
  const pending = tickets.filter((t) => t.pending_action?.status === 'pending').length;
  const aiResolved = tickets.filter((t) => t.status === 'ai_resolved').length;

  const cards = [
    { label: 'Tickets actifs', val: active, icon: Clock, cls: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', sub: `${aiResolved} résolus par l'IA` },
    { label: 'Escalades humaines', val: escalated, icon: AlertCircle, cls: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', sub: 'à reprendre' },
    { label: 'Actions IA en attente', val: pending, icon: Zap, cls: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', sub: 'confirmation requise' },
    { label: 'Crédits distribués', val: creditsDistributed, icon: Coins, cls: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', sub: `+${creditsToday} aujourd'hui` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Ic = c.icon;
        return (
          <div key={c.label} className={`rounded-2xl border ${c.bg} bg-card p-4 flex items-start gap-3`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
              <Ic className={`w-5 h-5 ${c.cls}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-grotesk font-bold ${c.cls}`}>{c.val}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}