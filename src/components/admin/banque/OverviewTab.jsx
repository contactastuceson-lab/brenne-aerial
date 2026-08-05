import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wallet, Coins, ArrowLeftRight, Activity, Loader2, Snowflake, ShieldCheck, AlertTriangle, Bell } from 'lucide-react';
import { toast } from 'sonner';

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
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-banque-overview'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminBanque', { action: 'overview' });
      return res.data;
    },
  });

  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(null); // 'freeze' | 'unfreeze' | null
  const [confirming, setConfirming] = useState(null); // 'freeze' | 'unfreeze' | null

  const runGlobal = async (action) => {
    setBusy(action);
    setConfirming(null);
    try {
      const res = await base44.functions.invoke('adminBanque', { action, reason, notify });
      if (action === 'freeze_all') {
        toast.error(`❄️ Gel global — ${res.data?.usersFrozen ?? 0} compte(s) + ${res.data?.walletsFrozen ?? 0} portefeuille(s)`);
      } else {
        toast.success(`✅ Dégel global — ${res.data?.usersUnfrozen ?? 0} compte(s) + ${res.data?.walletsUnfrozen ?? 0} portefeuille(s)`);
      }
      qc.invalidateQueries({ queryKey: ['admin-banque-overview'] });
    } catch (err) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const d = data || {};
  return (
    <div className="space-y-5">
      {/* Contrôle d'urgence — Gel / Dégel global */}
      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4 md:p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-grotesk font-bold text-sm text-foreground">Contrôle d'urgence</p>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">
              Gèle ou dégèle simultanément <strong>tous les comptes principaux</strong> et <strong>tous les portefeuilles</strong> de la plateforme.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Motif (optionnel) — ex: Audit de sécurité"
            className="flex-1 h-9 rounded-lg border border-border bg-secondary px-3 font-inter text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
          <label className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-secondary cursor-pointer select-none">
            <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} className="accent-red-500" />
            <Bell className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-inter text-xs text-muted-foreground">Notifier par email</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          {confirming === 'freeze' ? (
            <div className="flex gap-2 w-full sm:flex-1">
              <button
                onClick={() => runGlobal('freeze_all')}
                disabled={busy !== null}
                className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-inter font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {busy === 'freeze' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Snowflake className="w-4 h-4" />}
                Confirmer le gel global
              </button>
              <button onClick={() => setConfirming(null)} className="h-9 px-4 rounded-lg border border-border bg-card font-inter text-xs text-muted-foreground hover:text-foreground">Annuler</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming('freeze')}
              disabled={busy !== null}
              className="flex-1 h-9 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-inter font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Snowflake className="w-4 h-4" /> Gel global
            </button>
          )}

          {confirming === 'unfreeze' ? (
            <div className="flex gap-2 w-full sm:flex-1">
              <button
                onClick={() => runGlobal('unfreeze_all')}
                disabled={busy !== null}
                className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-inter font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {busy === 'unfreeze' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Confirmer le dégel
              </button>
              <button onClick={() => setConfirming(null)} className="h-9 px-4 rounded-lg border border-border bg-card font-inter text-xs text-muted-foreground hover:text-foreground">Annuler</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming('unfreeze')}
              disabled={busy !== null}
              className="flex-1 h-9 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-inter font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> Dégel global
            </button>
          )}
        </div>
      </div>
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