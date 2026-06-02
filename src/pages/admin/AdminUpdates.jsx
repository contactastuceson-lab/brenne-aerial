import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Sparkles, Star, Zap, Wrench, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const TYPE_CONFIG = {
  feature:      { label: 'Nouveauté',     color: 'text-primary',    bg: 'bg-primary/10',    icon: Star },
  improvement:  { label: 'Amélioration',  color: 'text-accent',     bg: 'bg-accent/10',     icon: Zap },
  fix:          { label: 'Correction',    color: 'text-chart-5',    bg: 'bg-chart-5/10',    icon: Wrench },
  announcement: { label: 'Annonce',       color: 'text-purple-400', bg: 'bg-purple-400/5',  icon: Megaphone },
};

const EMPTY = { title: '', description: '', type: 'feature', emoji: '', is_published: true, published_at: new Date().toISOString().slice(0, 10) };

export default function AdminUpdates() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [form, setForm] = useState(EMPTY);

  const { data: updates = [] } = useQuery({
    queryKey: ['app-updates'],
    queryFn: () => base44.entities.AppUpdate.list('-created_date', 50),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing?.id
      ? base44.entities.AppUpdate.update(editing.id, data)
      : base44.entities.AppUpdate.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-updates'] });
      setEditing(null);
      toast.success(editing?.id ? 'Mise à jour modifiée' : 'Mise à jour créée');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppUpdate.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-updates'] });
      toast.success('Supprimée');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_published }) => base44.entities.AppUpdate.update(id, { is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-updates'] }),
  });

  const openNew = () => {
    setForm(EMPTY);
    setEditing({});
  };

  const openEdit = (u) => {
    setForm({ title: u.title, description: u.description, type: u.type || 'feature', emoji: u.emoji || '', is_published: u.is_published ?? true, published_at: u.published_at || new Date().toISOString().slice(0, 10) });
    setEditing(u);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error('Titre et description requis');
    saveMutation.mutate(form);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-2xl text-foreground">Mises à jour</h1>
            <p className="text-sm text-muted-foreground">Journal des nouveautés affichées aux utilisateurs</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Form */}
      {editing !== null && (
        <div className="mb-6 p-5 rounded-2xl border border-border bg-card space-y-4">
          <h3 className="font-semibold text-foreground">{editing?.id ? 'Modifier' : 'Nouvelle mise à jour'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Titre *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <div className="flex gap-2">
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Emoji" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="w-24" />
            </div>
          </div>
          <Textarea
            placeholder="Description *"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="min-h-[80px]"
          />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Date</label>
              <Input type="date" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
              <label className="text-sm text-muted-foreground">Publié</label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>Enregistrer</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {updates.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune mise à jour créée</p>
          </div>
        )}
        {updates.map(u => {
          const cfg = TYPE_CONFIG[u.type] || TYPE_CONFIG.feature;
          const Icon = cfg.icon;
          return (
            <div key={u.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                {u.emoji ? <span className="text-base">{u.emoji}</span> : <Icon className={`w-4 h-4 ${cfg.color}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                  {u.published_at && <span className="text-[10px] text-muted-foreground">{format(new Date(u.published_at), 'd MMM yyyy', { locale: fr })}</span>}
                  {!u.is_published && <Badge variant="outline" className="text-[10px] text-muted-foreground">Brouillon</Badge>}
                </div>
                <p className="font-semibold text-sm text-foreground">{u.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={u.is_published ?? true}
                  onCheckedChange={v => toggleMutation.mutate({ id: u.id, is_published: v })}
                />
                <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(u.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}