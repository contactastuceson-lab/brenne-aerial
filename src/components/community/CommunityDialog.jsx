import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CommunityDialog({ open, onClose, user, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('open');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const slug = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);
      await base44.entities.Community.create({
        name: name.trim(),
        slug,
        description: description.trim(),
        owner_id: user.id,
        owner_name: user.full_name,
        owner_username: user.username,
        type,
        member_ids: [user.id],
        members_count: 1,
      });
      toast.success('Communauté créée');
      setName(''); setDescription(''); setType('open');
      onSaved?.();
      onClose();
    } catch {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-grotesk font-bold text-base">Nouvelle communauté</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="font-inter text-xs text-muted-foreground">Nom</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Pilotes IA, Créateurs Vidéo"
                className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Objet de la communauté"
                className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[60px]" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground">Type</label>
              <div className="mt-1 flex gap-2">
                <button onClick={() => setType('open')} className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${type === 'open' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-white/5'}`}>Publique</button>
                <button onClick={() => setType('closed')} className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${type === 'closed' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-white/5'}`}>Fermée</button>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">{type === 'open' ? 'Ouverte — visible et rejoignable par tous.' : 'Fermée — posts visibles par les membres uniquement.'}</p>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <button onClick={handleSave} disabled={saving}
              className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Créer la communauté
            </button>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}