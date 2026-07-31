import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeftRight, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const TYPE_META = {
  transfer_in: { label: 'Virement reçu', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  transfer_out: { label: 'Virement envoyé', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  wallet_move: { label: 'Déplacement', color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  admin_credit: { label: 'Crédit admin', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  admin_debit: { label: 'Débit admin', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  reward: { label: 'Récompense', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  boutique_spend: { label: 'Achat boutique', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
};

export default function TransactionsTab() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['admin-banque-txs'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminBanque', { action: 'list_transactions' });
      return res.data?.txs || [];
    },
  });

  const filtered = typeFilter === 'all' ? txs : txs.filter(t => t.type === typeFilter);

  const reverse = async (t) => {
    if (!confirm(`Annuler / rembourser cette transaction de ${Math.abs(t.amount || 0)} cr ?\nLe montant sera re-crédité au solde principal du propriétaire.`)) return;
    setBusy(t.id);
    try {
      const res = await base44.functions.invoke('adminBanque', { action: 'reverse_transaction', transactionId: t.id });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(`Re-crédité de ${res.data?.credited || 0} cr`);
      qc.invalidateQueries({ queryKey: ['admin-banque-txs'] });
      qc.invalidateQueries({ queryKey: ['admin-banque-overview'] });
    } catch { toast.error('Erreur'); }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap items-center">
        <button onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-grotesk font-bold border ${typeFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
          Tous ({txs.length})
        </button>
        {Object.entries(TYPE_META).map(([k, m]) => {
          const count = txs.filter(t => t.type === k).length;
          if (count === 0) return null;
          return (
            <button key={k} onClick={() => setTypeFilter(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-grotesk font-bold border ${typeFilter === k ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {m.label} ({count})
            </button>
          );
        })}
        <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-banque-txs'] })}
          className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/50 text-sm">Aucune transaction</div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="max-h-[65vh] overflow-y-auto divide-y divide-border/60">
            {filtered.map(t => {
              const m = TYPE_META[t.type] || { label: t.type, color: 'text-muted-foreground bg-muted/40 border-border' };
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0">
                    <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{t.note || m.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60 truncate">
                      {t.owner_id?.slice(-8)}{t.counterparty_name ? ` · ${t.counterparty_name}` : ''}
                      {t.from_wallet_name ? ` · ${t.from_wallet_name}→${t.to_wallet_name || ''}` : t.to_wallet_name ? ` · →${t.to_wallet_name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${m.color}`}>{m.label}</span>
                    <span className={`font-mono text-sm font-bold ${(t.amount || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(t.amount || 0) >= 0 ? '+' : ''}{(t.amount || 0).toLocaleString('fr-FR')}
                    </span>
                    <button onClick={() => reverse(t)} disabled={busy === t.id} title="Annuler / rembourser"
                      className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center hover:bg-amber-400/20 transition-all">
                      {busy === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}