import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DistributionTab() {
  const [amount, setAmount] = useState('');
  const [segment, setSegment] = useState('all');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    const amt = Math.floor(Number(amount) || 0);
    if (amt <= 0) return toast.error('Montant invalide');
    if (!confirm(`Créditer ${amt} crédits à ${segment === 'all' ? 'tous les utilisateurs' : 'tous les utilisateurs vérifiés'} ?${notify ? ' (email envoyé)' : ''}`)) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminBanque', {
        action: 'bulk_distribute', amount: amt, segment, reason: reason.trim(), notify,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      setResult(res.data);
      toast.success(`${res.data?.processed || 0} utilisateurs crédités`);
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 max-w-md space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-primary" />
          <p className="font-grotesk font-semibold text-sm">Distribution groupée</p>
        </div>
        <p className="font-inter text-xs text-muted-foreground">Crédite le solde principal de plusieurs utilisateurs en une fois. Chaque opération est tracée dans le ledger.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Montant / utilisateur</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 text-sm" />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Segment</label>
            <select value={segment} onChange={e => setSegment(e.target.value)} className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground">
              <option value="all">Tous les utilisateurs</option>
              <option value="verified">Utilisateurs vérifiés</option>
            </select>
          </div>
        </div>
        <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motif (ex: bonus de fin d'année)…" className="text-sm" />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} />
          Envoyer un email à chaque utilisateur (plus lent)
        </label>
        <Button onClick={run} disabled={busy} className="w-full gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Distribuer
        </Button>
      </div>
      {result && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4 max-w-md">
          <p className="font-grotesk font-bold text-sm text-emerald-400">Distribution terminée</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">{result.processed} utilisateur(s) crédités de {amount} crédits chacun.</p>
        </div>
      )}
    </div>
  );
}