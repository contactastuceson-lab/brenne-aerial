import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const TYPES = [
  { id: 'epargne', label: 'Épargne' },
  { id: 'depenses', label: 'Dépenses' },
  { id: 'projet', label: 'Projet' },
  { id: 'custom', label: 'Personnalisé' },
];

export default function CreateWalletDialog({ open, onClose, user, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('epargne');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return toast.error('Donnez un nom au portefeuille');
    setLoading(true);
    try {
      await base44.entities.Wallet.create({
        owner_id: user.id, owner_email: user.email,
        name: name.trim(), type, balance: 0
      });
      toast.success('Portefeuille créé');
      setName(''); onClose(); onCreated?.();
    } catch (err) { toast.error(err?.message || 'Erreur'); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Créer un portefeuille</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Nom</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Vacances, Pro, Fonds d'urgence…" className="mt-1 text-sm" />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-grotesk ${type === t.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}