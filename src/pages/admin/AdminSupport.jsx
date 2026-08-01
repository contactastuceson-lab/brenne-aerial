import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Sparkles, Bot, Send, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import SupportKpis from '@/components/admin/support/SupportKpis';
import PendingActionsPanel from '@/components/admin/support/PendingActionsPanel';
import ActiveTicketsTable from '@/components/admin/support/ActiveTicketsTable';
import CreditsRecap from '@/components/admin/support/CreditsRecap';
import NexusActionLog from '@/components/admin/support/NexusActionLog';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération', messaging: 'Messagerie', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu IA', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', cls: 'text-muted-foreground bg-secondary border-border' },
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [acting, setActing] = useState(false);
  const [credits, setCredits] = useState({ total: 0, today: 0, recent: 0 });
  const [lastSync, setLastSync] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.SupportTicket.list('-created_date', 200).catch(() => []);
      setTickets(list || []);
      setLastSync(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Actualisation temps réel des tickets
  useEffect(() => {
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type === 'create') {
        base44.entities.SupportTicket.get(event.id).then((t) => setTickets((prev) => [t, ...prev])).catch(() => {});
      } else if (event.type === 'update') {
        setTickets((prev) => prev.map((t) => (t.id === event.id ? { ...t, ...event.data } : t)));
        if (selected?.id === event.id) setSelected((prev) => ({ ...prev, ...event.data }));
      } else if (event.type === 'delete') {
        setTickets((prev) => prev.filter((t) => t.id !== event.id));
      }
    });
    return unsub;
  }, [selected?.id]);

  const sendReply = async () => {
    if (!adminReply.trim() || !selected) return;
    setActing(true);
    try {
      const msgs = [...(selected.messages || []), { role: 'admin', content: adminReply.trim(), at: new Date().toISOString() }];
      const updated = await base44.entities.SupportTicket.update(selected.id, {
        messages: msgs, status: 'resolved', admin_notes: adminReply.trim(),
      });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setAdminReply('');
      if (selected.user_email) {
        await base44.integrations.Core.SendEmail({
          to: selected.user_email, subject: 'eza · Réponse à votre ticket',
          body: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#e2e8f0;background:#0b1120"><h2 style="color:#38bdf8">Réponse du support eza</h2><p style="font-size:15px;line-height:1.6">${adminReply.trim().replace(/\n/g, '<br>')}</p><p style="color:#64748b;font-size:13px;margin-top:24px">— Équipe eza</p></div>`,
        }).catch(() => {});
      }
    } finally { setActing(false); }
  };

  const setStatus = async (status) => {
    if (!selected) return;
    setActing(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { status });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } finally { setActing(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-grotesk font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Centre de commande Nexus
          </h1>
          <p className="text-sm text-muted-foreground">
            Supervision des tickets, actions IA en attente & crédits distribués
            {lastSync && <span className="text-[11px] text-muted-foreground/60 ml-2">· MAJ {lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <button onClick={load} className="h-9 px-3 rounded-lg bg-secondary border border-border text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <SupportKpis tickets={tickets} creditsDistributed={credits.total} creditsToday={credits.today} nexusActionsCount={credits.recent} />

      {/* Ligne 1 : tickets actifs + actions en attente */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <ActiveTicketsTable tickets={tickets} onSelect={setSelected} selectedId={selected?.id} />
        <PendingActionsPanel tickets={tickets} onAction={load} />
      </div>

      {/* Ligne 2 : crédits distribués + journal Nexus */}
      <div className="grid lg:grid-cols-2 gap-4">
        <CreditsRecap onCount={setCredits} />
        <NexusActionLog />
      </div>

      {/* Détail ticket (Dialog) */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-start justify-between gap-2 font-grotesk">
                  <span className="flex-1">{selected.subject}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 mt-1 ${STATUS_META[selected.status]?.cls}`}>{STATUS_META[selected.status]?.label}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground mb-2">
                <span>{selected.user_email}</span>
                <span>·</span>
                <span className="px-1.5 py-0.5 rounded-full bg-secondary">{CATEGORY_LABELS[selected.category] || '—'}</span>
                <span>·</span>
                <span className="px-1.5 py-0.5 rounded-full bg-secondary">priorité {selected.priority}</span>
                {selected.related_item_label && (<><span>·</span><span className="text-foreground/70">{selected.related_item_label}</span></>)}
              </div>

              {selected.escalation_reason && (
                <div className="rounded-lg bg-orange-400/10 border border-orange-400/20 p-2.5 mb-3 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-300/90">{selected.escalation_reason}</p>
                </div>
              )}

              {selected.ai_summary && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Résumé Nexus</p>
                  <p className="text-xs text-foreground/90">{selected.ai_summary}</p>
                </div>
              )}

              <div className="space-y-2 max-h-[320px] overflow-y-auto mb-3 -mr-1 pr-1">
                {(selected.messages || []).map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                      m.role === 'user' ? 'text-white' : m.role === 'admin' ? 'bg-primary/15 border border-primary/30' : 'bg-secondary border border-border'
                    }`} style={m.role === 'user' ? { background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' } : {}}>
                      {m.action && (m.action.status === 'pending' || m.action.status === 'executed' || m.action.status === 'failed') && (
                        <p className="text-[10px] mb-1 px-1.5 py-0.5 rounded bg-black/20 inline-flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> {m.action.label || m.action.type}
                        </p>
                      )}
                      <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{m.content || ''}</ReactMarkdown></div>
                    </div>
                  </div>
                ))}
              </div>

              <textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Réponse admin (envoyée par email)…" rows={3}
                className="w-full bg-secondary/60 border border-border rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 resize-none mb-2" />
              <div className="flex gap-2 mb-2">
                <button onClick={sendReply} disabled={!adminReply.trim() || acting}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Répondre & résoudre
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['awaiting_human', 'resolved', 'closed'].map((s) => (
                  <button key={s} onClick={() => setStatus(s)} disabled={acting}
                    className="flex-1 h-8 rounded-lg bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                    {STATUS_META[s]?.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}