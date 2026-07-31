import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, RefreshCw, Loader2, History } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function TransactionHistory({ user }) {
  const [txs, setTxs] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.CreditTransaction.filter({ owner_id: user.id }, '-created_date', 100);
      setTxs(list || []);
    } catch { setTxs([]); }
    setLoading(false);
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  if (!txs || txs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border flex items-center justify-center mx-auto mb-3">
          <History className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <p className="font-grotesk font-semibold text-sm">Aucune transaction</p>
        <p className="font-inter text-xs text-muted-foreground mt-1">Vos transferts et déplacements apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="font-grotesk font-semibold text-sm">Historique ({txs.length})</p>
        <button onClick={load} className="text-muted-foreground/60 hover:text-foreground"><RefreshCw className="w-3.5 h-3.5" /></button>
      </div>
      <div className="divide-y divide-border/60">
        {txs.map(t => {
          const isIn = t.type === 'transfer_in';
          const isOut = t.type === 'transfer_out';
          const isMove = t.type === 'wallet_move';
          const Icon = isMove ? ArrowLeftRight : isIn ? ArrowDownLeft : ArrowUpRight;
          const color = isMove ? 'text-sky-400' : isIn ? 'text-emerald-400' : 'text-rose-400';
          const label = isMove
            ? `Déplacé ${t.from_wallet_name || ''} → ${t.to_wallet_name || ''}`
            : isIn
              ? `Reçu de ${t.counterparty_name || t.counterparty_username || 'un utilisateur'}`
              : `Envoyé à ${t.counterparty_name || t.counterparty_username || 'un utilisateur'}`;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm text-foreground truncate">{label}</p>
                <p className="font-mono text-[10px] text-muted-foreground/60">{fmtDate(t.created_date)}{t.note ? ' · ' + t.note : ''}</p>
              </div>
              <p className={`font-grotesk font-black text-sm flex-shrink-0 ${color}`}>
                {isMove ? '' : isIn ? '+' : '−'}{Math.abs(t.amount || 0)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}