import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins, Loader2, Plus, Minus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SoldesTab() {
  const qc = useQueryClient();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [found, setFound] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const load = async () => {
    if (users.length > 0 || loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminGetUsers', {});
      setUsers(res.data?.users || []);
    } catch {}
    setLoading(false);
  };

  const suggestions = q.trim()
    ? users.filter(u => (u.email || '').toLowerCase().includes(q.toLowerCase()) || (u.full_name || '').toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  const apply = async (delta) => {
    if (!found) return;
    setApplying(true);
    try {
      const newCredits = Math.max(0, (found.referral_credits || 0) + delta);
      await base44.functions.invoke('adminUpdateUser', {
        id: found.id, data: { referral_credits: newCredits, credit_reason: reason.trim() || null },
      });
      setFound({ ...found, referral_credits: newCredits });
      toast.success(delta >= 0 ? `+${delta} crédits (email envoyé)` : `${delta} crédits retirés (email envoyé)`);
      setReason(''); setAmount('');
      qc.invalidateQueries({ queryKey: ['admin-banque-overview'] });
    } catch { toast.error('Erreur'); }
    setApplying(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 rounded-t-2xl">
        <Coins className="w-4 h-4 text-amber-400" />
        <p className="font-grotesk font-semibold text-sm">Ajuster le solde principal d'un utilisateur</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input value={found ? `${found.full_name || ''} · ${found.email}` : q}
            onChange={e => { setFound(null); setQ(e.target.value); }}
            onFocus={load} placeholder="Rechercher par nom ou email…" className="pl-8 text-xs" />
          {loading && <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" /></div>}
          {!found && q && (
            <div className="absolute z-[60] left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.length === 0 ? <p className="px-3 py-2.5 text-xs text-muted-foreground/60">Aucun utilisateur</p> :
                suggestions.map(u => (
                  <button key={u.id} onClick={() => { setFound(u); setQ(''); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/60 text-left border-b border-border/40 last:border-0">
                    <span className="font-inter text-xs text-foreground truncate flex-1">{u.full_name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground/60">{u.email}</span>
                    <span className="font-mono text-[10px] text-amber-400">{u.referral_credits || 0} cr</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {found && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm text-foreground truncate">{found.full_name}</p>
              <p className="font-mono text-[10px] text-muted-foreground/60 truncate">{found.email}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-muted-foreground/60">Solde</p>
              <p className="font-grotesk font-black text-lg text-amber-400">{found.referral_credits || 0}</p>
            </div>
          </div>
        )}
        {found && (
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motif (envoyé par email)…" className="text-xs" />
        )}
        {found && (
          <div className="flex flex-wrap items-center gap-2">
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Montant" className="w-32" />
            <Button onClick={() => apply(parseInt(amount) || 0)} disabled={applying || !amount || (parseInt(amount) || 0) <= 0}
              size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Créditer
            </Button>
            <Button onClick={() => apply(-(parseInt(amount) || 0))} disabled={applying || !amount || (parseInt(amount) || 0) <= 0}
              size="sm" className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5" /> Débiter
            </Button>
            <div className="flex gap-1 ml-auto">
              {[10, 50, 100, 500].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}