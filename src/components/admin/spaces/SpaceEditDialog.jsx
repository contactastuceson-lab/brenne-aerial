import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function SpaceEditDialog({ space, open, onClose }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (space) {
      setTitle(space.title || '');
      setDescription(space.description || '');
    }
  }, [space]);

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Space.update(space.id, { title, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-spaces'] });
      toast.success('Space modifié');
      onClose();
    },
    onError: () => toast.error('Erreur lors de la modification'),
  });

  if (!open || !space) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-grotesk font-bold text-base">Modifier le Space</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/8 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Titre</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du Space" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description / sujet" rows={4} />
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title.trim()} className="flex-1">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}