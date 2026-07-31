import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TransferForm({ user, wallets, onDone }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('primary');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const sourceBalance = source === 'primary'
    ? (user?.referral_credits || 0)
    : (wallets.find(w => w.id === source)?.balance || 0);

  const submit = async () => {
    const amt = Math.floor(Number(amount) || 0);
    if (!recipient.trim()) return toast.error('Indiquez un destinataire');
    if (amt <= 0) return toast.error('Montant invalide');
    if (amt > sourceBalance) return toast.error('Solde insuffisant');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('transferCredits', {
        recipient: recipient.trim(), amount: amt, source_wallet_id: source, note
      });
      const data = res.data || res;
      if (data?.error) toast.error(data.error);
      else {
        toast.success(data.message || 'Transfert effectué');
        setRecipient(''); setAmount(''); setNote('');
        onDone?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || 'Erreur');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4 max-w-md">
      <div className="flex items-center gap-2">
        <Send className="w-4 h-4 text-primary" />
        <h3 className="font-grotesk font-bold text-sm">Transférer à un utilisateur Eza</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Destinataire (email ou @username)</label>
          <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="@username ou email" className="mt-1 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Source</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground">
              <option value="primary">Principal ({user?.referral_credits || 0})</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.balance || 0})</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Montant</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 text-sm" />
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Note (optionnel)</label>
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Pourquoi ?" className="mt-1 text-sm" />
        </div>
        <Button onClick={submit} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Envoyer {amount ? amount + ' crédits' : ''}
        </Button>
        <p className="font-inter text-[11px] text-muted-foreground/50">Disponible sur la source : {sourceBalance} crédits</p>
      </div>
    </div>
  );
}