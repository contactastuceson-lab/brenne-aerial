import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Eye, EyeOff, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const CATS = ['evenement', 'inspection', 'chantier', 'particulier', 'entreprise', 'formation'];
const MEDIA_TYPES = ['image', 'youtube', 'tiktok', 'instagram', 'vimeo'];

const BLANK = { title: '', description: '', category: 'evenement', media_type: 'image', media_url: '', thumbnail_url: '', client_name: '', is_featured: false, is_published: true };

export default function AdminPortfolio() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['adm-portfolio'],
    queryFn: () => base44.entities.Project.list('-created_date', 100),
  });

  const save = useMutation({
    mutationFn: () => editing ? base44.entities.Project.update(editing.id, form) : base44.entities.Project.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-portfolio'] }); setOpen(false); setEditing(null); setForm(BLANK); toast.success('Sauvegardé'); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-portfolio'] }); toast.success('Supprimé'); },
  });

  const toggle = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-portfolio'] }),
  });

  const openEdit = (p) => { setForm({ ...p }); setEditing(p); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Portfolio</h1>
          <p className="font-inter text-sm text-muted-foreground">{projects.length} projets</p>
        </div>
        <Button onClick={() => { setForm(BLANK); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Ajouter
        </Button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="rounded-xl overflow-hidden bg-card border border-border">
              <div className="relative aspect-video overflow-hidden bg-secondary">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs">{p.media_type}</div>
                )}
                {p.is_featured && <div className="absolute top-2 right-2"><Star className="w-4 h-4 text-chart-5 fill-chart-5" /></div>}
                {!p.is_published && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="font-mono text-xs text-muted-foreground">Non publié</span></div>}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-grotesk font-semibold text-sm truncate">{p.title}</p>
                    <span className="font-mono text-[10px] text-primary">{p.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="text-xs flex-1">Modifier</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle.mutate({ id: p.id, data: { is_published: !p.is_published } })}>
                    {p.is_published ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">{editing ? 'Modifier' : 'Ajouter'} un projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.media_type} onValueChange={v => setForm(p => ({ ...p, media_type: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{MEDIA_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="URL média (YouTube, image...)" value={form.media_url} onChange={e => setForm(p => ({ ...p, media_url: e.target.value }))} className="bg-secondary border-border" />
            <Input placeholder="URL miniature" value={form.thumbnail_url} onChange={e => setForm(p => ({ ...p, thumbnail_url: e.target.value }))} className="bg-secondary border-border" />
            <Input placeholder="Nom client" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} className="bg-secondary border-border" />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-secondary border-border" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} />
                <span className="font-inter text-xs">À la une</span>
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