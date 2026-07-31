import { useEffect, useState } from 'react';
import { Wallet, ArrowRight, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function WalletSummary({ user }) {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Wallet.filter({ owner_id: user.id }).then(setWallets).catch(() => {});
  }, [user?.id]);

  const total = (user?.referral_credits || 0) + wallets.reduce((s, w) => s + (w.balance || 0), 0);

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-primary" />
        <h3 className="font-grotesk font-bold text-sm">Portefeuille Eza</h3>
      </div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Total</p>
          <p className="font-grotesk font-black text-3xl text-primary flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-primary" />{total}
          </p>
        </div>
        <Link to="/banque" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-xs hover:bg-primary/90 transition">
          Ouvrir la banque <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-inter text-muted-foreground">Principal</span>
          <span className="font-mono font-bold text-foreground">{user?.referral_credits || 0}</span>
        </div>
        {wallets.map(w => (
          <div key={w.id} className="flex items-center justify-between text-xs">
            <span className="font-inter text-muted-foreground truncate">{w.name}</span>
            <span className="font-mono font-bold text-foreground ml-2">{w.balance || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}