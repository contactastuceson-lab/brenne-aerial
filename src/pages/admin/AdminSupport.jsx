import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Ticket, RefreshCw, Search, Sparkles, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: ' Fonctionnalité', events: 'Événements', moderation: 'Modération', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: AlertCircle, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', icon: CheckCircle2, cls: 'text-muted-foreground bg-secondary border-border' },
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.SupportTicket.list('-created_date', 200).catch(() => []);
      setTickets(list || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (q) {
      const s = `${t.subject || ''} ${t.user_email || ''} ${t.ai_summary || ''}`.toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    ai: tickets.filter((t) => t.status === 'ai_resolved').length,
    human: tickets.filter((t) => t.status === 'awaiting_human').length,
  };

  const sendReply = async () => {
    if (!adminReply.trim() || !selected) return;
    setActing(true);
    try {
      const msgs = [...(selected.messages || []), { role: 'admin', content: adminReply.trim(), at: new Date().toISOString() }];
      const updated = await base44.entities.SupportTicket.update(selected.id, {
        messages: msgs,
        status: 'resolved',
        admin_notes: adminReply.trim(),
      });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setAdminReply('');
      if (selected.user_email) {
        await base44.integrations.Core.SendEmail({
          to: selected.user_email,
          subject: 'eza · Réponse à votre ticket',
          body: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#e2e8f0;background:#0b1120">
            <h2 style="color:#38bdf8">Réponse du support eza</h2>
            <p style="font-size:15px;line-height:1.6">${adminReply.trim().replace(/\n/g, '<br>')}</p>
            <p style="color:#64748b;font-size:13px;margin-top:24px">— Équipe eza</p></div>`,
        }).catch(() => {});
      }
    } finally {
      setActing(false);
    }
  };

  const setStatus = async (status) => {
    if (!selected) return;
    setActing(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { status });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-grotesk font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" /> Support — Tickets IA
          </h1>
          <p className="text-sm text-muted-foreground">Tous les tickets traités automatiquement par Nexus + escalades humaines.</p>
        </div>
        <button onClick={load} className="h-9 px-3 rounded-lg bg-secondary border border-border text-sm flex items-center gap-2 hover:bg-secondary/80">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', val: stats.total, cls: 'text-foreground' },
          { label: 'Ouverts', val: stats.open, cls: 'text-amber-400' },
          { label: 'Résolus IA', val: stats.ai, cls: 'text-green-400' },
          { label: 'Escaladés', val: stats.human, cls: 'text-orange-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className={`text-2xl font-grotesk font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (sujet, email, résumé IA)"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-border text-sm outline-none focus:ring-1 focus:ring-primary/40" />
        </div>
        {['all', 'open', 'ai_resolved', 'awaiting_human', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}>
            {f === 'all' ? 'Tous' : STATUS_META[f]?.label || f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-4">
        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Aucun ticket.
            </div>
          ) : (
            filtered.map((t) => {
              const meta = STATUS_META[t.status] || STATUS_META.open;
              const SIcon = meta.icon;
              return (
                <button key={t.id} onClick={() => setSelected(t)}
                  className={`w-full text-left rounded-xl border bg-card p-3 hover:border-primary/40 transition-colors ${
                    selected?.id === t.id ? 'border-primary' : 'border-border'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                      <SIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.user_email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${meta.cls}`}>{meta.label}</span>
                        <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[t.category] || '—'}</span>
                        <span className="text-[10px] text-muted-foreground">· {t.priority}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className="rounded-2xl border border-border bg-card p-4 h-fit lg:sticky lg:top-4">
          {!selected ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/40" />
              Sélectionnez un ticket pour le détails
            </div>
          ) : (
            <>
              <h3 className="text-sm font-grotesk font-bold mb-1">{selected.subject}</h3>
              <p className="text-xs text-muted-foreground mb-3">{selected.user_email}</p>
              {selected.ai_summary && (
                <div className="rounded-lg bg-secondary/60 border border-border p-3 mb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Résumé Nexus</p>
                  <p className="text-xs text-foreground/90">{selected.ai_summary}</p>
                </div>
              )}
              <div className="space-y-2 max-h-[300px] overflow-y-auto mb-3">
                {(selected.messages || []).map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${
                      m.role === 'user' ? 'text-primary-foreground' : m.role === 'admin' ? 'bg-primary/15 border border-primary/30' : 'bg-secondary border border-border'
                    }`} style={m.role === 'user' ? { background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' } : {}}>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Réponse admin (envoyée par email)…"
                rows={3}
                className="w-full bg-secondary/60 border border-border rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 resize-none mb-2" />
              <div className="flex gap-2 mb-2">
                <button onClick={sendReply} disabled={!adminReply.trim() || acting}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Répondre & résoudre
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['awaiting_human', 'resolved', 'closed'].map((s) => (
                  <button key={s} onClick={() => setStatus(s)} disabled={acting}
                    className="flex-1 h-8 rounded-lg bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40">
                    {STATUS_META[s]?.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}