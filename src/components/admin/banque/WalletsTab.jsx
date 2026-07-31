import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Wallet as WalletIcon, Plus, Trash2, Loader2, RefreshCw, Search, Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const TYPE_LABELS = {
  epargne: 'Épargne', depenses: 'Dépenses', projet: 'Projet', custom: 'Personnalisé',
};

export default function WalletsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editWallet, setEditWallet] = useState(null); // wallet en édition de solde
  const [busy, setBusy] = useState(null);

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['admin-banque-wallets'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminBanque', { action: 'list_wallets' });
      return res.data?.wallets || [];
    },
  });

  const filtered = search.trim()
    ? wallets.filter(w => {
        const q = search.toLowerCase();
        return (w.owner_email || '').toLowerCase().includes(q)
          || (w.name || '').toLowerCase().includes(q)
          || (w.owner_id || '').toLowerCase().includes(q);
      })
    : wallets;

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-banque-wallets'] });

  const saveBalance = async () => {
    if (!editWallet) return;
    setBusy(editWallet.id);
    try {
      const res = await base44.functions.invoke('adminBanque', {
        action: 'adjust_wallet',
        walletId: editWallet.id,
        newBalance: editWallet.newBalance,
        reason: editWallet.reason,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Solde mis à jour');
      setEditWallet(null);
      refresh();
      qc.invalidateQueries({ queryKey: ['admin-banque-overview'] });
    } catch (e) { toast.error('Erreur'); }
    setBusy(null);
  };

  const remove = async (w) => {
    if (!confirm(`Supprimer le portefeuille "${w.name}" ?\nLe solde doit être nul.`)) return;
    setBusy(w.id);
    try {
      const res = await base44.functions.invoke('adminBanque', { action: 'delete_wallet', walletId: w.id });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Portefeuille supprimé');
      refresh();
    } catch (e) { toast.error('Erreur'); }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par email, nom…" className="pl-8 text-xs" />
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refresh}><RefreshCw className="w-3.5 h-3.5" /></Button>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5" /> Portefeuille
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/50 text-sm">Aucun portefeuille</div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/60">
            {filtered.map(w => (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-sky-400/10 flex items-center justify-center flex-shrink-0">
                  <WalletIcon className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm text-foreground truncate">{w.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60 truncate">
                    {w.owner_email || w.owner_id} · {TYPE_LABELS[w.type] || w.type}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-amber-400 flex-shrink-0">{(w.balance || 0).toLocaleString('fr-FR')} cr</span>
                <button onClick={() => setEditWallet({ ...w, newBalance: w.balance || 0, reason: '' })} disabled={busy === w.id}
                  className="w-7 h-7 rounded-lg bg-secondary/60 border border-border flex items-center justify-center hover:bg-secondary transition-all">
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => remove(w)} disabled={busy === w.id}
                  className="w-7 h-7 rounded-lg bg-red-400/10 border border-red-400/30 flex items-center justify-center hover:bg-red-400/20 transition-all">
                  {busy === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Édition de solde */}
      <Dialog open={!!editWallet} onOpenChange={(o) => !o && setEditWallet(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajuster le solde</DialogTitle></DialogHeader>
          {editWallet && (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/40 border border-border p-3">
                <p className="font-inter text-sm text-foreground">{editWallet.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground/60">{editWallet.owner_email || editWallet.owner_id}</p>
                <p className="font-mono text-xs text-amber-400 mt-1">Solde actuel : {editWallet.balance || 0} cr</p>
              </div>
              <Input type="number" value={editWallet.newBalance} onChange={e => setEditWallet({ ...editWallet, newBalance: e.target.value })}
                placeholder="Nouveau solde" className="text-sm" />
              <Input value={editWallet.reason} onChange={e => setEditWallet({ ...editWallet, reason: e.target.value })}
                placeholder="Motif (optionnel)…" className="text-sm" />
              <Button onClick={saveBalance} disabled={busy === editWallet.id} className="w-full">
                {busy === editWallet.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateWalletDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={refresh} />
    </div>
  );
}

function CreateWalletDialog({ open, onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const submit = async () => {
    if (!owner || !name) { toast.error('Sélectionnez un utilisateur et un nom'); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminBanque', {
        action: 'create_wallet',
        ownerId: owner.id,
        ownerEmail: owner.email,
        name, type, balance: Number(balance) || 0,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Portefeuille créé');
      onClose();
      setOwner(null); setName(''); setType('custom'); setBalance('0');
      onCreated();
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Créer un portefeuille</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input value={owner ? `${owner.full_name || ''} · ${owner.email}` : q}
              onChange={e => { setOwner(null); setQ(e.target.value); }}
              onFocus={load} placeholder="Utilisateur…" className="pl-8 text-xs" />
            {loading && <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" /></div>}
            {!owner && q && (
              <div className="absolute z-[60] left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                {suggestions.length === 0 ? <p className="px-3 py-2.5 text-xs text-muted-foreground/60">Aucun utilisateur</p> :
                  suggestions.map(u => (
                    <button key={u.id} onClick={() => { setOwner(u); setQ(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/60 text-left">
                      <span className="font-inter text-xs text-foreground truncate flex-1">{u.full_name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/60">{u.email}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du portefeuille" className="text-sm" />
          <div className="flex gap-2">
            <select value={type} onChange={e => setType(e.target.value)}
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm">
              <option value="custom">Personnalisé</option>
              <option value="epargne">Épargne</option>
              <option value="depenses">Dépenses</option>
              <option value="projet">Projet</option>
            </select>
            <Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="Solde initial" className="w-32 text-sm" />
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Créer</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}