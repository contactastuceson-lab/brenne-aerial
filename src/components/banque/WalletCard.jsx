import { Wallet as WalletIcon, PiggyBank, Target, ArrowLeftRight, Trash2 } from 'lucide-react';

const TYPE_META = {
  epargne: { icon: PiggyBank, color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  depenses: { icon: WalletIcon, color: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-400/10' },
  projet: { icon: Target, color: 'text-violet-400', border: 'border-violet-400/30', bg: 'bg-violet-400/10' },
  custom: { icon: WalletIcon, color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
};

export default function WalletCard({ wallet, onMove, onDelete }) {
  const meta = TYPE_META[wallet.type] || TYPE_META.custom;
  const Icon = meta.icon;
  return (
    <div className={`rounded-2xl border ${meta.border} ${meta.bg} p-4`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.border}`} style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Icon className={`w-5 h-5 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-grotesk font-bold text-sm text-foreground truncate">{wallet.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground/60 uppercase">{wallet.type}</p>
          {wallet.frozen && <span className="mt-1 inline-block px-1.5 py-0.5 rounded-full text-[9px] font-mono border border-sky-400/30 bg-sky-400/10 text-sky-400">Gelé</span>}
        </div>
        {onDelete && (wallet.balance || 0) === 0 && (
          <button onClick={onDelete} className="text-muted-foreground/50 hover:text-destructive transition" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">Solde</p>
          <p className={`font-grotesk font-black text-2xl ${meta.color}`}>{wallet.balance || 0}</p>
        </div>
        <button onClick={onMove} disabled={!!wallet.frozen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/10 text-foreground font-grotesk font-bold text-xs hover:bg-foreground/15 transition disabled:opacity-40 disabled:cursor-not-allowed">
          <ArrowLeftRight className="w-3 h-3" /> {wallet.frozen ? 'Gelé' : 'Déplacer'}
        </button>
      </div>
    </div>
  );
}