import React, { useState } from 'react';
import { Clock, AlertCircle, CheckCircle2, Search, ChevronRight, Filter, Zap } from 'lucide-react';

// Tableau des tickets actifs (ouverts + escaladés + résolus IA non fermés).
// L'admin peut filtrer par statut / catégorie, cliquer pour ouvrir le détail.

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération', messaging: 'Messagerie', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: AlertCircle, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
};

const PRIORITY_CLS = {
  urgent: 'text-red-400 bg-red-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  medium: 'text-amber-300 bg-amber-300/10',
  low: 'text-muted-foreground bg-secondary',
};

export default function ActiveTicketsTable({ tickets, onSelect, selectedId }) {
  const [statusFilter, setStatusFilter] = useState('active');
  const [catFilter, setCatFilter] = useState('all');
  const [q, setQ] = useState('');

  const base = tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved');
  let list = base;
  if (statusFilter === 'open') list = base.filter((t) => t.status === 'open');
  else if (statusFilter === 'escalated') list = base.filter((t) => t.status === 'awaiting_human');
  else if (statusFilter === 'pending') list = base.filter((t) => t.pending_action?.status === 'pending');
  if (catFilter !== 'all') list = list.filter((t) => t.category === catFilter);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((t) => `${t.subject || ''} ${t.user_email || ''} ${t.ai_summary || ''}`.toLowerCase().includes(s));
  }

  const counts = {
    active: base.length,
    open: base.filter((t) => t.status === 'open').length,
    escalated: base.filter((t) => t.status === 'awaiting_human').length,
    pending: base.filter((t) => t.pending_action?.status === 'pending').length,
  };

  const cats = Array.from(new Set(base.map((t) => t.category).filter(Boolean)));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-grotesk font-bold">Tickets actifs</h3>
          <p className="text-[11px] text-muted-foreground">En cours de traitement par Nexus ou escaladés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        {[
          { k: 'active', label: 'Tous', c: counts.active },
          { k: 'open', label: 'Ouverts', c: counts.open },
          { k: 'escalated', label: 'Escaladés', c: counts.escalated },
          { k: 'pending', label: 'Action en attente', c: counts.pending },
        ].map((f) => (
          <button key={f.k} onClick={() => setStatusFilter(f.k)}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
              statusFilter === f.k ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}>
            {f.label} <span className="opacity-70">{f.c}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-secondary/60 border border-border text-xs outline-none focus:ring-1 focus:ring-primary/40" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="h-8 px-2 rounded-lg bg-secondary/60 border border-border text-xs outline-none">
          <option value="all">Toutes catégories</option>
          {cats.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
        </select>
      </div>

      {/* Liste */}
      <div className="space-y-1.5 max-h-[480px] overflow-y-auto -mr-1 pr-1">
        {list.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Aucun ticket.</div>
        ) : list.map((t) => {
          const meta = STATUS_META[t.status] || STATUS_META.open;
          const SIcon = meta.icon;
          return (
            <button key={t.id} onClick={() => onSelect?.(t)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                selectedId === t.id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30 hover:border-primary/40'
              }`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                  <SIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium truncate flex-1">{t.subject}</p>
                    {t.pending_action?.status === 'pending' && (
                      <span className="text-[9px] px-1 py-0.5 rounded-full bg-violet-400/15 text-violet-400 flex items-center gap-0.5 flex-shrink-0">
                        <Zap className="w-2.5 h-2.5" /> action
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{t.user_email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${meta.cls}`}>{meta.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{CATEGORY_LABELS[t.category] || '—'}</span>
                    {t.priority && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${PRIORITY_CLS[t.priority] || PRIORITY_CLS.low}`}>{t.priority}</span>}
                    <span className="text-[9px] text-muted-foreground/60 ml-auto">{new Date(t.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}