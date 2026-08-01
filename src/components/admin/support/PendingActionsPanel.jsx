import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, Loader2, ChevronRight, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Panneau des actions IA en attente de confirmation : Nexus a proposé une
// action (remboursement, dégel, inscription, etc.), l'admin peut l'approuver
// (exécution immédiate) ou la refuser. Sert de file de contrôle de l'autonomie.

const TYPE_LABELS = {
  grant_credits: 'Crédit de courtoisie',
  refund_credits: 'Remboursement crédits',
  cancel_event_registration: 'Annulation inscription',
  move_credits: 'Transfert crédits',
  unfreeze_wallet: 'Dégel portefeuille',
  register_event: 'Inscription événement',
};

export default function PendingActionsPanel({ tickets, onAction }) {
  const [busy, setBusy] = useState(null);
  const pending = tickets.filter((t) => t.pending_action?.status === 'pending');

  const approve = async (t) => {
    setBusy(t.id);
    try {
      const pa = t.pending_action;
      await base44.functions.invoke('nexusTicketAction', {
        ticketId: t.id,
        action: { type: pa.type, label: pa.label, params: pa.params || {} },
      });
      onAction?.();
    } catch {}
    setBusy(null);
  };

  const refuse = async (t) => {
    setBusy(t.id);
    try {
      await base44.entities.SupportTicket.update(t.id, {
        pending_action: { ...t.pending_action, status: 'rejected' },
      });
      onAction?.();
    } catch {}
    setBusy(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-violet-400/15 flex items-center justify-center">
          <Zap className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-grotesk font-bold">Actions IA en attente</h3>
          <p className="text-[11px] text-muted-foreground">Proposées par Nexus — approuvez ou refusez</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-400/15 text-violet-400 font-bold">{pending.length}</span>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
          <CheckCircle2 className="w-7 h-7 text-green-400/60" />
          <span>Aucune action en attente — Nexus est sous contrôle.</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto -mr-1 pr-1">
          {pending.map((t) => {
            const pa = t.pending_action;
            const params = pa.params || {};
            const isBusy = busy === t.id;
            return (
              <motion.div key={t.id} layout
                className="rounded-xl border border-violet-400/20 bg-violet-400/[0.04] p-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-400/15 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{pa.label || TYPE_LABELS[pa.type] || pa.type}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      #{String(t.id).slice(-6)} · {t.user_email}
                    </p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                      {Object.entries(params).filter(([k]) => !['event_id','registration_id','from_wallet_id','to_wallet_id','wallet_id'].includes(k)).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="text-[10px] text-muted-foreground">
                          <span className="text-muted-foreground/60">{k}:</span> <span className="text-foreground/80">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button onClick={() => approve(t)} disabled={isBusy}
                    className="flex-1 h-8 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg, hsl(152 60% 42%), hsl(160 65% 38%))' }}>
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Approuver
                  </button>
                  <button onClick={() => refuse(t)} disabled={isBusy}
                    className="h-8 px-3 rounded-lg text-xs font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Refuser
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}