import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wallet, Coins, ArrowLeftRight, Activity, Loader2 } from 'lucide-react';

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="font-grotesk font-black text-2xl text-foreground">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export default function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-banque-overview'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminBanque', { action: 'overview' });
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const d = data || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Wallet} label="Portefeuilles" value={d.totalWallets ?? 0} color="bg-sky-400/10 text-sky-400" />
        <Stat icon={Coins} label="Crédits détenus" value={(d.totalHeld ?? 0).toLocaleString('fr-FR')} color="bg-amber-400/10 text-amber-400" />
        <Stat icon={ArrowLeftRight} label="Transactions totales" value={d.totalTxs ?? 0} color="bg-emerald-400/10 text-emerald-400" />
        <Stat icon={Activity} label="Transactions 30j" value={d.recentTxs ?? 0} color="bg-purple-400/10 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="font-grotesk font-semibold text-sm">Derniers portefeuilles</p></div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
            {(d.wallets || []).map((w) => (
              <div key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm text-foreground truncate">{w.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60 truncate">{w.owner_email || w.owner_id}</p>
                </div>
                <span className="font-mono text-xs font-bold text-amber-400">{(w.balance || 0).toLocaleString('fr-FR')}</span>
              </div>
            ))}
            {(d.wallets || []).length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground/50">Aucun portefeuille</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="font-grotesk font-semibold text-sm">Dernières transactions</p></div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
            {(d.txs || []).map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm text-foreground truncate">{t.note || t.type}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60">{t.type}</p>
                </div>
                <span className={`font-mono text-xs font-bold ${(t.amount || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(t.amount || 0) >= 0 ? '+' : ''}{(t.amount || 0).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
            {(d.txs || []).length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground/50">Aucune transaction</p>}
          </div>
        </div>
      </div>
    </div>
  );
}