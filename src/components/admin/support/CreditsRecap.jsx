import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Gift, RefreshCw, Loader2, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Récapitulatif des crédits distribués par Nexus : agrège les CreditTransaction
// de type admin_credit/reward (amount > 0) + RewardLog courtesy/refund, et
// affiche le total, la répartition par type, et l'historique récent.

const TYPE_META = {
  admin_credit: { label: 'Crédit admin', cls: 'text-green-400 bg-green-400/10' },
  reward: { label: 'Récompense', cls: 'text-blue-400 bg-blue-400/10' },
  boutique_spend: { label: 'Dépense boutique', cls: 'text-orange-400 bg-orange-400/10' },
  transfer_in: { label: 'Transfert entrant', cls: 'text-cyan-400 bg-cyan-400/10' },
  transfer_out: { label: 'Transfert sortant', cls: 'text-amber-400 bg-amber-400/10' },
};

export default function CreditsRecap({ onCount }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('summary');

  const load = async () => {
    setLoading(true);
    try {
      const txs = await base44.asServiceRole.entities.CreditTransaction.list('-created_date', 200).catch(() => []);
      const rewards = await base44.asServiceRole.entities.RewardLog.list('-created_date', 100).catch(() => []);
      const list = txs || [];
      const distributed = list.filter((t) => (t.type === 'admin_credit' || t.type === 'reward') && Number(t.amount) > 0);
      const total = distributed.reduce((s, t) => s + Number(t.amount || 0), 0);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const totalToday = distributed.filter((t) => new Date(t.created_date) >= today).reduce((s, t) => s + Number(t.amount || 0), 0);

      // répartition par type
      const byType = {};
      distributed.forEach((t) => { byType[t.type] = (byType[t.type] || 0) + Number(t.amount || 0); });

      // par motif (note) top
      const byNote = {};
      distributed.slice(0, 80).forEach((t) => {
        const n = (t.note || '').slice(0, 40) || '—';
        byNote[n] = (byNote[n] || 0) + 1;
      });
      const topNotes = Object.entries(byNote).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // RewardLog courtesy/refund
      const courtesy = (rewards || []).filter((r) => r.action === 'courtesy_credit' || r.action === 'refund_credit');
      const courtesyTotal = courtesy.reduce((s, r) => s + Number(r.credits || 0), 0);

      setData({ total, totalToday, byType, recent: distributed.slice(0, 12), topNotes, courtesyCount: courtesy.length, courtesyTotal });
      onCount?.({ total, today: totalToday, recent: distributed.length });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-green-400/10 flex items-center justify-center">
          <Coins className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-grotesk font-bold">Crédits distribués</h3>
          <p className="text-[11px] text-muted-foreground">Crédits & remboursements Nexus (admin_credit + reward)</p>
        </div>
        <button onClick={load} className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-3">
        {['summary', 'recent'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`h-7 px-3 rounded-lg text-[11px] font-medium transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'summary' ? 'Récap' : 'Historique'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 text-center"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
      ) : !data ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Données indisponibles.</div>
      ) : tab === 'summary' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-green-400/10 border border-green-400/20 p-3">
              <p className="text-xl font-grotesk font-bold text-green-400">{data.total}</p>
              <p className="text-[10px] text-muted-foreground">Total cumulé</p>
            </div>
            <div className="rounded-xl bg-secondary/40 border border-border p-3">
              <p className="text-xl font-grotesk font-bold text-foreground">{data.totalToday}</p>
              <p className="text-[10px] text-muted-foreground">Aujourd'hui</p>
            </div>
          </div>
          {Object.keys(data.byType).length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Répartition par type</p>
              <div className="space-y-1">
                {Object.entries(data.byType).sort((a, b) => b[1] - a[1]).map(([type, amt]) => {
                  const meta = TYPE_META[type] || { label: type, cls: 'text-muted-foreground bg-secondary' };
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (amt / data.total) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-foreground/80 w-12 text-right">{amt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {data.topNotes.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Motifs fréquents</p>
              <div className="space-y-1">
                {data.topNotes.map(([note, c]) => (
                  <div key={note} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground truncate flex-1 mr-2">{note}</span>
                    <span className="text-foreground/70 font-medium">{c}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.courtesyCount > 0 && (
            <div className="rounded-xl bg-violet-400/10 border border-violet-400/20 p-2.5 flex items-center gap-2">
              <Gift className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-medium">{data.courtesyCount} gestes de courtoisie Nexus</p>
                <p className="text-[10px] text-muted-foreground">{data.courtesyTotal} crédits au total</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto -mr-1 pr-1">
          {data.recent.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">Aucune distribution récente.</p>
          ) : data.recent.map((t) => {
            const meta = TYPE_META[t.type] || { label: t.type, cls: 'text-muted-foreground bg-secondary' };
            return (
              <div key={t.id} className="flex items-center gap-2.5 rounded-lg bg-secondary/30 border border-border p-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.cls}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">{t.note || meta.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t.counterparty_name || t.owner_id?.slice?.(-6) || '—'} · {new Date(t.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className="text-sm font-grotesk font-bold text-green-400 flex-shrink-0">+{t.amount}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}