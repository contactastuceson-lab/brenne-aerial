import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Carte d'action proposée par Nexus : affiche l'action pending (à confirmer),
// ou le résultat exécuté / échoué. L'utilisateur confirme ou refuse.

const PARAM_LABELS = {
  amount: 'Montant',
  reason: 'Motif',
  wallet_name: 'Portefeuille',
  event_title: 'Événement',
  from_name: 'De',
  to_name: 'Vers',
};

export default function PendingActionCard({ ticket, onDone }) {
  const pa = ticket?.pending_action;
  const [busy, setBusy] = useState(false);
  if (!pa || pa.status === 'rejected') return null;

  const isPending = pa.status === 'pending';
  const isExecuted = pa.status === 'executed';
  const isFailed = pa.status === 'failed';

  const run = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke('nexusTicketAction', {
        ticketId: ticket.id,
        action: { type: pa.type, label: pa.label, params: pa.params || {} },
      });
      onDone?.();
    } catch (e) {
      onDone?.();
    } finally { setBusy(false); }
  };

  const refuse = async () => {
    setBusy(true);
    try {
      await base44.entities.SupportTicket.update(ticket.id, {
        pending_action: { ...pa, status: 'rejected' },
      });
      onDone?.();
    } finally { setBusy(false); }
  };

  const params = pa.params || {};
  const paramKeys = Object.keys(params).filter((k) => PARAM_LABELS[k] && params[k] != null && params[k] !== '');

  const tone = isExecuted ? 'green' : isFailed ? 'red' : 'amber';
  const toneCls = {
    green: 'border-green-500/30 bg-green-500/[0.06]',
    red: 'border-red-500/30 bg-red-500/[0.06]',
    amber: 'border-amber-400/30 bg-amber-400/[0.06]',
  }[tone];
  const iconCls = {
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-300',
  }[tone];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${toneCls} p-3 mb-3`}>
      <div className="flex items-start gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isExecuted ? 'bg-green-500/15' : isFailed ? 'bg-red-500/15' : 'bg-amber-400/15'}`}>
          {isExecuted ? <CheckCircle2 className={`w-4 h-4 ${iconCls}`} /> :
           isFailed ? <XCircle className={`w-4 h-4 ${iconCls}`} /> :
           <Zap className={`w-4 h-4 ${iconCls}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Action Nexus</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isPending ? 'bg-amber-400/15 text-amber-300' : isExecuted ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
              {isPending ? 'À confirmer' : isExecuted ? 'Effectuée' : 'Échec'}
            </span>
          </div>
          <p className="text-sm font-medium mt-1">{pa.label || pa.type}</p>
          {paramKeys.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
              {paramKeys.map((k) => (
                <span key={k} className="text-[11px] text-muted-foreground">
                  {PARAM_LABELS[k]}: <span className="text-foreground/80">{String(params[k])}</span>
                </span>
              ))}
            </div>
          )}
          {isFailed && pa.result?.error && (
            <p className="text-[11px] text-red-300/90 mt-1.5 flex items-start gap-1">
              <ShieldAlert className="w-3 h-3 flex-shrink-0 mt-0.5" /> {pa.result.error}
            </p>
          )}
          {isPending && (
            <div className="flex gap-2 mt-2.5">
              <button onClick={run} disabled={busy}
                className="flex-1 h-8 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, hsl(152 60% 42%), hsl(160 65% 38%))' }}>
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Exécuter
              </button>
              <button onClick={refuse} disabled={busy}
                className="h-8 px-3 rounded-lg text-xs font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors">
                Refuser
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}