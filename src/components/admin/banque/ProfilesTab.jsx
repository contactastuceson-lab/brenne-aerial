import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, Wallet as WalletIcon, ArrowLeftRight, Snowflake, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const TYPE_LABELS = { epargne: 'Épargne', depenses: 'Dépenses', projet: 'Projet', custom: 'Personnalisé' };

export default function ProfilesTab() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [freezing, setFreezing] = useState(false);

  const toggleFreeze = async () => {
    if (!selected) return;
    const u = profile?.user || selected;
    const frozen = !!u.bank_frozen;
    const reason = frozen ? '' : (prompt('Motif du gel du compte bancaire ?') || '');
    if (!frozen && !reason.trim()) return;
    setFreezing(true);
    try {
      const res = await base44.functions.invoke('adminBanque', { action: 'set_bank_frozen', userId: selected.id, frozen: !frozen, reason });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(frozen ? 'Compte dégelé' : 'Compte gelé');
      const p = await base44.functions.invoke('adminBanque', { action: 'user_profile', userId: selected.id });
      setProfile(p.data);
    } catch { toast.error('Erreur'); }
    setFreezing(false);
  };

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

  const open = async (u) => {
    setSelected(u); setQ(''); setProfile(null);
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminBanque', { action: 'user_profile', userId: u.id });
      setProfile(res.data);
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <Input value={selected ? `${selected.full_name || ''} · ${selected.email}` : q}
          onChange={e => { setSelected(null); setProfile(null); setQ(e.target.value); }}
          onFocus={load} placeholder="Rechercher un utilisateur…" className="pl-8 text-xs" />
        {loading && <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" /></div>}
        {!selected && q && (
          <div className="absolute z-[60] left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.length === 0 ? <p className="px-3 py-2.5 text-xs text-muted-foreground/60">Aucun utilisateur</p> :
              suggestions.map(u => (
                <button key={u.id} onClick={() => open(u)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/60 text-left border-b border-border/40 last:border-0">
                  <span className="font-inter text-xs text-foreground truncate flex-1">{u.full_name}</span>
                  <span className="font-mono text-[10px] text-amber-400">{u.referral_credits || 0} cr</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {busy && <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}

      {profile && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-grotesk font-bold text-sm truncate">{profile.user?.full_name || '—'}</p>
                <p className="font-mono text-[10px] text-muted-foreground/60 truncate">{profile.user?.email}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="font-mono text-[10px] text-muted-foreground/60">Solde principal</p>
                <p className="font-grotesk font-black text-xl text-amber-400">{profile.user?.referral_credits || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
              {profile.user?.bank_frozen ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border border-red-400/30 bg-red-400/10 text-red-400">
                  <Snowflake className="w-3 h-3" /> Banque gelée
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Banque active
                </span>
              )}
              <button onClick={toggleFreeze} disabled={freezing}
                className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-grotesk font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                  profile.user?.bank_frozen
                    ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20'
                    : 'bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20'
                }`}>
                {freezing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Snowflake className="w-3.5 h-3.5" />}
                {profile.user?.bank_frozen ? 'Dégeler la banque' : 'Geler la banque'}
              </button>
            </div>
          </div>

          <div>
            <p className="font-grotesk font-bold text-sm mb-2">Portefeuilles ({profile.wallets?.length || 0})</p>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border/60">
              {(profile.wallets || []).map(w => (
                <div key={w.id} className="flex items-center gap-3 px-4 py-2.5">
                  <WalletIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{w.name} {w.frozen && <span className="text-sky-400 text-[10px]">· gelé</span>}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60">{TYPE_LABELS[w.type] || w.type}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-400">{w.balance || 0}</span>
                </div>
              ))}
              {(profile.wallets || []).length === 0 && <p className="px-4 py-4 text-center text-xs text-muted-foreground/50">Aucun portefeuille</p>}
            </div>
          </div>

          <div>
            <p className="font-grotesk font-bold text-sm mb-2">Transactions ({profile.txs?.length || 0})</p>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border/60 max-h-72 overflow-y-auto">
              {(profile.txs || []).slice(0, 50).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs text-foreground truncate">{t.note || t.type}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60">{t.type}</p>
                  </div>
                  <span className={`font-mono text-xs font-bold flex-shrink-0 ${(t.amount || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(t.amount || 0) >= 0 ? '+' : ''}{(t.amount || 0).toLocaleString('fr-FR')}</span>
                </div>
              ))}
              {(profile.txs || []).length === 0 && <p className="px-4 py-4 text-center text-xs text-muted-foreground/50">Aucune transaction</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}