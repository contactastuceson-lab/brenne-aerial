import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = [
  { id: 'todo', label: 'À faire', color: 'text-sky-400' },
  { id: 'in_progress', label: 'En cours', color: 'text-amber-400' },
  { id: 'review', label: 'À valider', color: 'text-violet-400' },
  { id: 'done', label: 'Terminé', color: 'text-emerald-400' },
];

export default function TaskDetailDialog({ task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setResult(task.result || '');
    }
  }, [task]);

  const save = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        result: result.trim(),
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm('Supprimer définitivement cette tâche ?')) return;
    await onDelete(task.id);
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-grotesk flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Détail de la tâche
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Titre</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Statut</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-grotesk font-bold border transition-all ${
                    status === s.id
                      ? `bg-primary/15 border-primary/40 ${s.color}`
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description / Consignes</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="resize-y" />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Résultat / Rendu de l'IA
            </label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={8}
              placeholder="Résultat produit par l'IA après exécution de la tâche…"
              className="resize-y font-mono text-xs"
            />
          </div>

          {task.created_date && (
            <p className="font-mono text-[10px] text-muted-foreground/50">
              Créée le {format(new Date(task.created_date), "dd/MM/yyyy 'à' HH:mm")}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="destructive" onClick={remove} disabled={busy} className="mr-auto">
            <Trash2 className="w-4 h-4" /> Supprimer
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Fermer</Button>
          <Button onClick={save} disabled={!title.trim() || busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}