import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon, Coins, Plus, Send, History as HistoryIcon,
  Loader2, ArrowLeftRight, PiggyBank
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { applySeoMeta } from '@/lib/seo';
import WalletCard from '@/components/banque/WalletCard';
import TransferForm from '@/components/banque/TransferForm';
import CreateWalletDialog from '@/components/banque/CreateWalletDialog';
import MoveDialog from '@/components/banque/MoveDialog';
import TransactionHistory from '@/components/banque/TransactionHistory';

const TABS = [
  { id: 'solde', label: 'Solde', icon: WalletIcon },
  { id: 'transferer', label: 'Transférer', icon: Send },
  { id: 'historique', label: 'Historique', icon: HistoryIcon },
];

export default function BanquePage() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('solde');
  const [showCreate, setShowCreate] = useState(false);
  const [moveFrom, setMoveFrom] = useState(null);

  useEffect(() => {
    applySeoMeta({ title: 'Banque Eza — Gérez vos crédits', description: 'Portefeuilles, transferts P2P et historique de vos crédits Eza.' });
    (async () => {
      const ok = await base44.auth.isAuthenticated();
      if (!ok) { setLoading(false); return; }
      try { setUser(await base44.auth.me()); } catch {}
      setLoading(false);
    })();
  }, []);

  const loadWallets = useCallback(async () => {
    if (!user?.id) return;
    try { setWallets(await base44.entities.Wallet.filter({ owner_id: user.id }, '-created_date')); } catch {}
  }, [user?.id]);

  useEffect(() => { loadWallets(); }, [loadWallets]);

  const refreshUser = async () => { try { setUser(await base44.auth.me()); } catch {} };
  const afterOp = async () => { await refreshUser(); await loadWallets(); };

  const totalAssets = (user?.referral_credits || 0) + wallets.reduce((s, w) => s + (w.balance || 0), 0);

  const deleteWallet = async (w) => {
    if ((w.balance || 0) !== 0) return toast.error('Le solde doit être nul pour supprimer');
    if (!confirm(`Supprimer le portefeuille « ${w.name} » ?`)) return;
    try { await base44.entities.Wallet.delete(w.id); toast.success('Portefeuille supprimé'); loadWallets(); }
    catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 sky-glow">
          <WalletIcon className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-grotesk font-black text-2xl mb-2">Banque Eza</h1>
        <p className="font-inter text-sm text-muted-foreground mb-6 max-w-md">Connectez-vous pour gérer vos crédits, transferts et portefeuilles.</p>
        <button onClick={() => base44.auth.redirectToLogin('/banque')} className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition">Se connecter</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center sky-glow">
            <WalletIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-grotesk font-black text-2xl">Banque Eza</h1>
            <p className="font-inter text-sm text-muted-foreground">Gérez vos crédits et portefeuilles</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-grotesk font-black text-xl text-primary">{totalAssets}</span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-1">total</p>
          </div>
        </motion.div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map(t => {
            const Icon = t.icon; const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 border transition-all ${active ? 'bg-primary text-primary-foreground border-primary font-bold' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'}`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'solde' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"><PiggyBank className="w-5 h-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-grotesk font-bold text-sm">Compte principal</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60 uppercase">Crédits spendables (boutique, parrainage)</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">Solde</p>
                  <p className="font-grotesk font-black text-3xl text-primary">{user.referral_credits || 0}</p>
                </div>
                <button onClick={() => setMoveFrom('primary')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/10 text-foreground font-grotesk font-bold text-xs hover:bg-foreground/15 transition">
                  <ArrowLeftRight className="w-3 h-3" /> Déplacer
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="font-grotesk font-bold text-sm">Mes portefeuilles ({wallets.length})</h2>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-grotesk font-bold text-xs hover:bg-primary/20 transition">
                <Plus className="w-3.5 h-3.5" /> Créer
              </button>
            </div>
            {wallets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <PiggyBank className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="font-inter text-sm text-muted-foreground">Aucun portefeuille secondaire.</p>
                <p className="font-inter text-xs text-muted-foreground/60 mt-1">Créez-en un pour organiser vos crédits (épargne, projet…).</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wallets.map(w => (
                  <WalletCard key={w.id} wallet={w} onMove={() => setMoveFrom(w.id)} onDelete={() => deleteWallet(w)} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'transferer' && (
          <TransferForm user={user} wallets={wallets} onDone={afterOp} />
        )}

        {tab === 'historique' && <TransactionHistory user={user} />}

        <CreateWalletDialog open={showCreate} onClose={() => setShowCreate(false)} user={user} onCreated={loadWallets} />
        <MoveDialog key={moveFrom || 'closed'} open={!!moveFrom} onClose={() => setMoveFrom(null)} user={user} wallets={wallets} presetFrom={moveFrom} onDone={afterOp} />
      </div>
    </div>
  );
}