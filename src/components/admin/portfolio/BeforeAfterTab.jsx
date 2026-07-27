import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadOrUrl from '@/components/ui/ImageUploadOrUrl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const BLANK = { title: '', category: 'inspection', before_url: '', after_url: '', before_label: 'Avant', after_label: 'Après', description: '', is_published: true, order: 0 };
const CATS = ['inspection', 'immobilier', 'evenement', 'retouche', 'chantier'];

export default function BeforeAfterTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['adm-before-after'],
    queryFn: () => base44.entities.BeforeAfterGallery.list('-created_date', 200),
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, order: Number(form.order) || 0 };
      return editing ? base44.entities.BeforeAfterGallery.update(editing.id, payload) : base44.entities.BeforeAfterGallery.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-before-after'] }); setOpen(false); setEditing(null); setForm(BLANK); toast.success('Comparaison sauvegardée'); },
    onError: e => toast.error(e.message || 'Erreur'),
  });

  const del = useMutation({
    mutationFn: id => base44.entities.BeforeAfterGallery.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-before-after'] }); toast.success('Supprimé'); },
  });

  const openEdit = p => { setForm({ ...p, order: p.order ?? 0 }); setEditing(p); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-inter text-sm text-muted-foreground">{items.length} comparaisons</p>
        <Button onClick={() => { setForm(BLANK); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle comparaison
        </Button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(g => (
            <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="flex flex-shrink-0 rounded-lg overflow-hidden h-12 w-20 border border-border">
                <img src={g.before_url} alt="" className="w-1/2 h-full object-cover" />
                <img src={g.after_url} alt="" className="w-1/2 h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-semibold text-sm truncate">{g.title}</p>
                <span className="font-mono text-[10px] text-primary">{g.category}</span>
                <span className={`font-mono text-[10px] ml-2 ${g.is_published ? 'text-green-400' : 'text-muted-foreground'}`}>{g.is_published ? 'Publié' : 'Brouillon'}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => openEdit(g)}><Edit className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => del.mutate(g.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-grotesk font-bold">{editing ? 'Modifier' : 'Créer'} une comparaison</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Ordre (nombre)" type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <ImageUploadOrUrl label="Image AVANT *" value={form.before_url} onChange={v => setForm(p => ({ ...p, before_url: v }))} previewHeight="h-28" />
            <ImageUploadOrUrl label="Image APRÈS *" value={form.after_url} onChange={v => setForm(p => ({ ...p, after_url: v }))} previewHeight="h-28" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Label avant" value={form.before_label} onChange={e => setForm(p => ({ ...p, before_label: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Label après" value={form.after_label} onChange={e => setForm(p => ({ ...p, after_label: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-secondary border-border h-20" />
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} />
              <span className="font-inter text-xs">Publié</span>
            </label>
            <Button onClick={() => save.mutate()} disabled={!form.title || !form.before_url || !form.after_url || save.isPending} className="w-full bg-primary text-primary-foreground font-grotesk">
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}