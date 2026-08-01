import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Search, Coins, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AdminRegisterDialog({ open, onClose, events, onDone }) {
  const [eventId, setEventId] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selected, setSelected] = useState(null);
  const [charge, setCharge] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEventId(events[0]?.id || '');
      setQuery(''); setSelected(null); setCharge(true);
      setLoadingUsers(true);
      base44.entities.User.list('-created_date', 200)
        .then((u) => setUsers(u || []))
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false));
    }
  }, [open, events]);

  const filtered = useMemo(() => {
    if (!query) return users.slice(0, 30);
    const q = query.toLowerCase();
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [users, query]);

  const selectedEvent = events.find((e) => e.id === eventId);
  const creditsCost = selectedEvent ? Number(selectedEvent.price_credits || 0) : 0;

  const submit = async () => {
    if (!eventId || !selected) return;
    setSaving(true);
    try {
      const res = await base44.functions.invoke('adminManageEvent', {
        action: 'admin_register', event_id: eventId, user_id: selected.id, charge_credits: charge,
      });
      toast.success(`Inscription créée${res?.data?.credits_paid ? ` — ${res.data.credits_paid} crédits débités` : ''}`);
      onDone && onDone();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Échec de l\'inscription');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscrire un utilisateur</DialogTitle>
          <DialogDescription>Ajoutez manuellement une inscription à un événement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Événement</Label>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            {creditsCost > 0 && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" /> Coût : {creditsCost} crédits
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Utilisateur</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Email, nom, username…" className="pl-9" />
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border mt-1">
                {filtered.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">Aucun utilisateur</p>
                ) : filtered.map((u) => (
                  <button key={u.id} onClick={() => setSelected(u)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${selected?.id === u.id ? 'bg-primary/15' : 'hover:bg-secondary/40'}`}>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-grotesk font-bold text-xs truncate">{u.full_name || '—'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {selected?.id === u.id && <UserCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Switch checked={charge} onCheckedChange={setCharge} id="charge" disabled={creditsCost === 0} />
            <Label htmlFor="charge">
              {creditsCost > 0
                ? `Débiter ${creditsCost} crédits à l'utilisateur`
                : 'Événement gratuit'}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={submit} disabled={saving || !eventId || !selected}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Confirmer l'inscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}