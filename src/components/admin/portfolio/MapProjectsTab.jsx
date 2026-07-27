import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, Edit, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadOrUrl from '@/components/ui/ImageUploadOrUrl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const BLANK = { title: '', city: '', category: 'immobilier', description: '', lat: '', lng: '', thumbnail: '', video_id: '', is_active: true };
const CATS = ['immobilier', 'mariage', 'tourisme'];

export default function MapProjectsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['adm-map-projects'],
    queryFn: () => base44.entities.MapProject.list('-created_date', 200),
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng) };
      return editing ? base44.entities.MapProject.update(editing.id, payload) : base44.entities.MapProject.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-map-projects'] }); setOpen(false); setEditing(null); setForm(BLANK); toast.success('Projet carte sauvegardé'); },
    onError: e => toast.error(e.message || 'Erreur'),
  });

  const del = useMutation({
    mutationFn: id => base44.entities.MapProject.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-map-projects'] }); toast.success('Supprimé'); },
  });

  const openEdit = p => { setForm({ ...p, lat: p.lat ?? '', lng: p.lng ?? '' }); setEditing(p); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-inter text-sm text-muted-foreground">{items.length} points sur la carte</p>
        <Button onClick={() => { setForm(BLANK); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nouveau point
        </Button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {p.thumbnail && <img src={p.thumbnail} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-semibold text-sm truncate">{p.title}</p>
                <span className="font-mono text-[10px] text-primary flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city} · {p.category}</span>
              </div>
              <span className={`font-mono text-[10px] ${p.is_active ? 'text-green-400' : 'text-muted-foreground'}`}>{p.is_active ? 'Actif' : 'Inactif'}</span>
              <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-grotesk font-bold">{editing ? 'Modifier' : 'Créer'} un point carte</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Ville *" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="bg-secondary border-border" />
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Latitude *" type="number" step="any" value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Longitude *" type="number" step="any" value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <Textarea placeholder="Description courte" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-secondary border-border h-20" />
            <ImageUploadOrUrl label="Miniature" value={form.thumbnail} onChange={v => setForm(p => ({ ...p, thumbnail: v }))} previewHeight="h-28" />
            <Input placeholder="ID YouTube (optionnel)" value={form.video_id} onChange={e => setForm(p => ({ ...p, video_id: e.target.value }))} className="bg-secondary border-border" />
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
              <span className="font-inter text-xs">Visible sur la carte</span>
            </label>
            <Button onClick={() => save.mutate()} disabled={!form.title || !form.city || form.lat === '' || form.lng === '' || save.isPending} className="w-full bg-primary text-primary-foreground font-grotesk">
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}