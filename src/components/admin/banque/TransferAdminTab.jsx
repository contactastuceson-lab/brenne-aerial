import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeftRight, Search, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function UserPicker({ label, users, loading, value, onSelect, onLoad }) {
  const [q, setQ] = useState('');
  const suggestions = q.trim()
    ? users.filter(u => (u.email || '').toLowerCase().includes(q.toLowerCase()) || (u.full_name || '').toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];
  return (
    <div className="relative">
      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">{label}</label>
      <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-[26px]" />
      <Input value={value ? `${value.full_name || ''} · ${value.email}` : q}
        onChange={e => { onSelect(null); setQ(e.target.value); }}
        onFocus={onLoad} placeholder="Rechercher…" className="pl-8 mt-1 text-xs" />
      {loading && <div className="absolute right-2.5 top-[26px]"><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" /></div>}
      {!value && q && (
        <div className="absolute z-[60] left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.length === 0 ? <p className="px-3 py-2.5 text-xs text-muted-foreground/60">Aucun utilisateur</p> :
            suggestions.map(u => (
              <button key={u.id} onClick={() => { onSelect(u); setQ(''); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/60 text-left border-b border-border/40 last:border-0">
                <span className="font-inter text-xs text-foreground truncate flex-1">{u.full_name}</span>
                <span className="font-mono text-[10px] text-amber-400">{u.referral_credits || 0} cr</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function TransferAdminTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const load = async () => {
    if (users.length > 0 || loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminGetUsers', {});
      setUsers(res.data?.users || []);
    } catch {}
    setLoading(false);
  };

  const run = async () => {
    const amt = Math.floor(Number(amount) || 0);
    if (!from || !to) return toast.error('Sélectionnez un expéditeur et un destinataire');
    if (from.id === to.id) return toast.error('Même compte');
    if (amt <= 0) return toast.error('Montant invalide');
    if ((from.referral_credits || 0) < amt) return toast.error(`Solde insuffisant (${from.referral_credits || 0} cr)`);
    if (!confirm(`Virer ${amt} crédits de ${from.full_name} vers ${to.full_name} ?`)) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminBanque', { action: 'admin_transfer', fromUserId: from.id, toUserId: to.id, amount: amt, reason: reason.trim() });
      if (res.data?.error) { toast.error(res.data.error); return; }
      setResult(res.data);
      toast.success(`${amt} crédits transférés`);
      setFrom({ ...from, referral_credits: (from.referral_credits || 0) - amt });
      setTo({ ...to, referral_credits: (to.referral_credits || 0) + amt });
      setAmount(''); setReason('');
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <p className="font-grotesk font-semibold text-sm">Virement entre comptes</p>
        </div>
        <p className="font-inter text-xs text-muted-foreground">Débite le solde principal d'un utilisateur au profit d'un autre. Tracé dans le ledger, email envoyé aux deux parties.</p>
        <UserPicker label="Expéditeur (source)" users={users} loading={loading} value={from} onSelect={setFrom} onLoad={load} />
        {from && <p className="font-mono text-[10px] text-muted-foreground/60 -mt-2">Solde source : <span className="text-amber-400">{from.referral_credits || 0} cr</span></p>}
        <UserPicker label="Destinataire" users={users} loading={loading} value={to} onSelect={setTo} onLoad={load} />
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Montant</label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 text-sm" />
        </div>
        <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motif (envoyé par email)…" className="text-sm" />
        <Button onClick={run} disabled={busy} className="w-full gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Virer
        </Button>
      </div>
      {result && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4">
          <p className="font-grotesk font-bold text-sm text-emerald-400">Virement effectué</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">{result.amount} crédits transférés. Nouveaux solds : {result.fromBalance} / {result.toBalance}.</p>
        </div>
      )}
    </div>
  );
}