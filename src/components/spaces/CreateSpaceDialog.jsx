import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreateSpaceDialog({ open, onClose, user, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleMode, setScheduleMode] = useState('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('Titre requis'); return; }
    if (scheduleMode === 'schedule' && !scheduledAt) { toast.error('Date requise'); return; }
    setSaving(true);
    try {
      const res = await base44.functions.invoke('createSpace', {
        title: title.trim(),
        description: description.trim(),
        scheduled_at: scheduleMode === 'schedule' ? new Date(scheduledAt).toISOString() : null,
      });
      const data = res.data || res;
      if (data.error) { toast.error(data.error); setSaving(false); return; }
      toast.success(scheduleMode === 'schedule' ? 'Space programmé' : 'Space démarré');
      setTitle(''); setDescription(''); setScheduleMode('now'); setScheduledAt('');
      onCreated?.(data.space);
      onClose();
    } catch {
      toast.error('Erreur');
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
              <h3 className="font-grotesk font-bold text-base flex items-center gap-2"><Radio className="w-4 h-4 text-red-400" /> Nouveau Space</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-inter text-xs text-muted-foreground">Titre</label>
                <input value={title} onChange={e => setTitle(e.target.value.slice(0, 80))} placeholder="ex: Débat IA & création, AMA drone…"
                  className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 200))} placeholder="Sujet, invités…"
                  className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[56px]" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setScheduleMode('now')} className={`flex-1 py-2 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 ${scheduleMode === 'now' ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-border text-muted-foreground hover:bg-white/5'}`}>
                  <Radio className="w-3.5 h-3.5" /> Maintenant
                </button>
                <button onClick={() => setScheduleMode('schedule')} className={`flex-1 py-2 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 ${scheduleMode === 'schedule' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-border text-muted-foreground hover:bg-white/5'}`}>
                  <Calendar className="w-3.5 h-3.5" /> Programmer
                </button>
              </div>
              {scheduleMode === 'schedule' && (
                <div>
                  <label className="font-inter text-xs text-muted-foreground">Date & heure</label>
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <button onClick={handleCreate} disabled={saving}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {scheduleMode === 'schedule' ? 'Programmer' : 'Démarrer le direct'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}