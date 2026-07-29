import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';

export default function ListDialog({ open, onClose, user, onSaved, list = null }) {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [isPrivate, setIsPrivate] = useState(list?.is_private ?? true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set(list?.member_ids || []));
  const [saving, setSaving] = useState(false);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['public-users-for-lists'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return res.data || res;
    },
    enabled: open,
    staleTime: 60000,
  });

  const filtered = allUsers
    .filter(u => u.id !== user?.id)
    .filter(u => !search || (u.display_name || u.full_name || u.username || '').toLowerCase().includes(search.toLowerCase()))
    .slice(0, 30);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const memberIds = Array.from(selected);
      const memberUsernames = allUsers.filter(u => memberIds.includes(u.id)).map(u => u.username).filter(Boolean);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        owner_id: user.id,
        owner_username: user.username,
        member_ids: memberIds,
        member_usernames: memberUsernames,
        is_private: isPrivate,
      };
      if (list?.id) {
        await base44.entities.UserList.update(list.id, payload);
        toast.success('Liste mise à jour');
      } else {
        await base44.entities.UserList.create(payload);
        toast.success('Liste créée');
      }
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
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[88vh]"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-grotesk font-bold text-base">{list ? 'Modifier la liste' : 'Nouvelle liste'}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="font-inter text-xs text-muted-foreground">Nom</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Devs, IA, Actu Drone"
                  className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="De quoi parle cette liste ?"
                  className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[60px]" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="accent-primary" />
                <span className="font-inter text-sm">Liste privée</span>
              </label>
              <div>
                <label className="font-inter text-xs text-muted-foreground">Membres ({selected.size})</label>
                <div className="relative mt-1 mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher des utilisateurs…"
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {filtered.map(u => {
                    const sel = selected.has(u.id);
                    return (
                      <button key={u.id} onClick={() => toggle(u.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-colors text-left ${sel ? 'border-primary/40 bg-primary/10' : 'border-transparent hover:bg-white/5'}`}>
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-xs">{(u.display_name || u.full_name || 'U')[0]}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1"><span className="font-inter text-sm font-semibold truncate">{u.display_name || u.full_name}</span><VerificationIcons verifications={u.verifications} size="sm" user={u} /></div>
                          {u.username && <span className="font-mono text-[10px] text-muted-foreground">@{u.username}</span>}
                        </div>
                        {sel && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border">
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {list ? 'Enregistrer' : 'Créer la liste'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}