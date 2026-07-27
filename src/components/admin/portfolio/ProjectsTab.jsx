import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, Edit, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadOrUrl from '@/components/ui/ImageUploadOrUrl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const BLANK = { title: '', description: '', category: 'evenement', media_type: 'image', media_url: '', thumbnail_url: '', tags: '', client_name: '', date_realisation: '', is_featured: false, is_published: true, order: 0 };
const CATS = ['evenement', 'inspection', 'chantier', 'particulier', 'entreprise', 'formation'];
const MEDIA = ['image', 'youtube', 'tiktok', 'instagram', 'vimeo'];

export default function ProjectsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['adm-portfolio-projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], order: Number(form.order) || 0 };
      return editing ? base44.entities.Project.update(editing.id, payload) : base44.entities.Project.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-portfolio-projects'] }); setOpen(false); setEditing(null); setForm(BLANK); toast.success('Projet sauvegardé'); },
    onError: e => toast.error(e.message || 'Erreur'),
  });

  const del = useMutation({
    mutationFn: id => base44.entities.Project.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-portfolio-projects'] }); toast.success('Supprimé'); },
  });

  const openEdit = p => { setForm({ ...p, tags: (p.tags || []).join(', '), date_realisation: p.date_realisation || '' }); setEditing(p); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-inter text-sm text-muted-foreground">{projects.length} projets</p>
        <Button onClick={() => { setForm(BLANK); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nouveau projet
        </Button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              {(p.thumbnail_url || p.media_url) && <img src={p.thumbnail_url || p.media_url} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-grotesk font-semibold text-sm truncate">{p.title}</p>
                  {p.is_featured && <Star className="w-3 h-3 fill-chart-5 text-chart-5 flex-shrink-0" />}
                </div>
                <span className="font-mono text-[10px] text-primary">{p.category} · {p.media_type}</span>
                <span className={`font-mono text-[10px] ml-2 ${p.is_published ? 'text-green-400' : 'text-muted-foreground'}`}>{p.is_published ? 'Publié' : 'Brouillon'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-grotesk font-bold">{editing ? 'Modifier' : 'Créer'} un projet</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.media_type} onValueChange={v => setForm(p => ({ ...p, media_type: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{MEDIA.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Nom du client" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Date de réalisation (AAAA-MM-JJ)" type="date" value={form.date_realisation} onChange={e => setForm(p => ({ ...p, date_realisation: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Ordre (nombre)" type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <ImageUploadOrUrl label="Miniature" value={form.thumbnail_url} onChange={v => setForm(p => ({ ...p, thumbnail_url: v }))} previewHeight="h-28" />
            {form.media_type !== 'image' && (
              <Input placeholder="URL de la vidéo (YouTube, TikTok…)" value={form.media_url} onChange={e => setForm(p => ({ ...p, media_url: e.target.value }))} className="bg-secondary border-border" />
            )}
            {form.media_type === 'image' && (
              <ImageUploadOrUrl label="Image principale" value={form.media_url} onChange={v => setForm(p => ({ ...p, media_url: v }))} previewHeight="h-28" />
            )}
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-secondary border-border h-20" />
            <Input placeholder="Tags (séparés par des virgules)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="bg-secondary border-border" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} />
                <span className="font-inter text-xs">Projet vedette</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} />
                <span className="font-inter text-xs">Publié</span>
              </label>
            </div>
            <Button onClick={() => save.mutate()} disabled={!form.title || save.isPending} className="w-full bg-primary text-primary-foreground font-grotesk">
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}