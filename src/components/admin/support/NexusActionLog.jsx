import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Journal d'autonomie Nexus : derniers logs d'automatisation liés au support
// (reply_support_ticket, nexus_ticket_action) + last_action_log des tickets.
// Donne à l'admin une trace lisible des décisions IA récentes.

export default function NexusActionLog() {
  const [logs, setLogs] = useState([]);
  const [ticketLogs, setTicketLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const autoLogs = await base44.asServiceRole.entities.AutomationLog.list('-run_at', 40).catch(() => []);
      const supportLogs = (autoLogs || []).filter((l) => /nexus|ticket|support/i.test(l.automation_name || ''));
      setLogs(supportLogs.slice(0, 15));
      const tickets = await base44.asServiceRole.entities.SupportTicket.list('-updated_date', 60).catch(() => []);
      setTicketLogs((tickets || []).filter((t) => t.last_action_log).slice(0, 12));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-grotesk font-bold">Journal d'autonomie Nexus</h3>
          <p className="text-[11px] text-muted-foreground">Dernières décisions & actions exécutées par l'IA</p>
        </div>
        <button onClick={load} className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {/* Actions exécutées sur tickets */}
          {ticketLogs.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Actions exécutées
              </p>
              <div className="space-y-1">
                {ticketLogs.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-[11px] rounded-lg bg-secondary/30 border border-border p-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.pending_action?.status === 'executed' || (t.last_action_log || '').startsWith('✅') ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-foreground/80 truncate flex-1">{t.last_action_log}</span>
                    <span className="text-muted-foreground/60 text-[10px] flex-shrink-0">{new Date(t.updated_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Logs d'automatisation */}
          {logs.length > 0 ? (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Bot className="w-3 h-3" /> Exécutions
              </p>
              <div className="space-y-1">
                {logs.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 text-[11px] rounded-lg bg-secondary/30 border border-border p-2">
                    {l.status === 'success' ? <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                      : <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0" />}
                    <span className="text-foreground/80 truncate flex-1">{l.summary || l.label}</span>
                    <span className="text-muted-foreground/60 text-[10px] flex-shrink-0">{l.run_at ? new Date(l.run_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-xs text-muted-foreground">Aucune exécution récente.</p>
          )}
        </div>
      )}
    </div>
  );
}