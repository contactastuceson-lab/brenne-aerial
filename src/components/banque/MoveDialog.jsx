import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, ArrowLeftRight } from 'lucide-react';

export default function MoveDialog({ open, onClose, user, wallets, presetFrom, onDone }) {
  const [from, setFrom] = useState(presetFrom || 'primary');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fromBalance = from === 'primary'
    ? (user?.referral_credits || 0)
    : (wallets.find(w => w.id === from)?.balance || 0);

  const submit = async () => {
    const amt = Math.floor(Number(amount) || 0);
    if (!to) return toast.error('Choisissez la destination');
    if (from === to) return toast.error('Source = destination');
    if (amt <= 0) return toast.error('Montant invalide');
    if (amt > fromBalance) return toast.error('Solde insuffisant');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('moveCredits', { from, to, amount: amt });
      const data = res.data || res;
      if (data?.error) toast.error(data.error);
      else { toast.success(data.message || 'Déplacement effectué'); setAmount(''); onClose(); onDone?.(); }
    } catch (err) { toast.error(err?.response?.data?.error || err?.message || 'Erreur'); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Déplacer des crédits</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Depuis</label>
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground">
              <option value="primary">Principal ({user?.referral_credits || 0})</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.balance || 0})</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Vers</label>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground">
              <option value="">Choisir…</option>
              {from !== 'primary' && <option value="primary">Principal</option>}
              {wallets.filter(w => w.id !== from).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Montant</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 text-sm" />
            <p className="font-inter text-[11px] text-muted-foreground/50 mt-1">Disponible : {fromBalance} crédits</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />} Déplacer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}