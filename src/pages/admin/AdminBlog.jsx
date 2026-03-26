import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Eye, EyeOff, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BLANK = { title: '', excerpt: '', content: '', cover_url: '', category: 'actualite', author: 'Enor Lefoulon Meyer', is_published: false, reading_time: 3 };
const CATS = ['actualite', 'conseil', 'technique', 'projet', 'formation'];

export default function AdminBlog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['adm-blog'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
  });

  const save = useMutation({
    mutationFn: () => editing ? base44.entities.BlogPost.update(editing.id, form) : base44.entities.BlogPost.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-blog'] }); setOpen(false); setEditing(null); setForm(BLANK); toast.success('Article sauvegardé'); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-blog'] }); toast.success('Supprimé'); },
  });

  const toggle = useMutation({
    mutationFn: ({ id, v }) => base44.entities.BlogPost.update(id, { is_published: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-blog'] }),
  });

  const openEdit = (p) => { setForm({ ...p }); setEditing(p); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Blog & Actualités</h1>
          <p className="font-inter text-sm text-muted-foreground">{posts.length} articles</p>
        </div>
        <Button onClick={() => { setForm(BLANK); setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nouvel article
        </Button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              {p.cover_url && <img src={p.cover_url} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-semibold text-sm truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-primary">{p.category}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{p.created_date ? format(new Date(p.created_date), 'd MMM', { locale: fr }) : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] ${p.is_published ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {p.is_published ? 'Publié' : 'Brouillon'}
                </span>
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => toggle.mutate({ id: p.id, v: !p.is_published })}>
                  {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">{editing ? 'Modifier' : 'Créer'} un article</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Temps de lecture (min)" type="number" value={form.reading_time} onChange={e => setForm(p => ({ ...p, reading_time: parseInt(e.target.value) || 3 }))} className="bg-secondary border-border" />
            </div>
            <Input placeholder="URL de couverture" value={form.cover_url} onChange={e => setForm(p => ({ ...p, cover_url: e.target.value }))} className="bg-secondary border-border" />
            <Textarea placeholder="Résumé court..." value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} className="bg-secondary border-border h-20" />
            <Textarea placeholder="Contenu complet de l'article..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="bg-secondary border-border min-h-[200px]" />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} />
                <span className="font-inter text-xs">Publier immédiatement</span>
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