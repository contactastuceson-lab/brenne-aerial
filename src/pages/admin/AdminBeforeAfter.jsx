import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Save, X, Eye, EyeOff, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const EMPTY = {
  title: '', category: 'inspection', before_url: '', after_url: '',
  before_label: 'Avant', after_label: 'Après', description: '', is_published: true, order: 0,
};

const CATEGORIES = [
  { key: 'inspection', label: 'Inspection' },
  { key: 'immobilier', label: 'Immobilier' },
  { key: 'chantier', label: 'Chantier' },
  { key: 'retouche', label: 'Retouche' },
  { key: 'evenement', label: 'Événement' },
];

export default function AdminBeforeAfter() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-before-after'],
    queryFn: () => base44.entities.BeforeAfterGallery.list('-order'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingId
      ? base44.entities.BeforeAfterGallery.update(editingId, data)
      : base44.entities.BeforeAfterGallery.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-before-after'] });
      setShowForm(false); setEditingId(null); setForm(EMPTY);
      toast.success(editingId ? 'Mis à jour' : 'Ajouté');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeforeAfterGallery.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-before-after'] }); toast.success('Supprimé'); },
  });

  const togglePublish = (item) => {
    base44.entities.BeforeAfterGallery.update(item.id, { is_published: !item.is_published })
      .then(() => qc.invalidateQueries({ queryKey: ['admin-before-after'] }));
  };

  const openEdit = (item) => { setEditingId(item.id); setForm({ ...EMPTY, ...item }); setShowForm(true); };
  const openNew = () => { setEditingId(null); setForm(EMPTY); setShowForm(true); };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="font-inter text-xs text-muted-foreground mb-1 block">{label}</label>
      <Input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="bg-secondary border-border" placeholder={placeholder} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-primary" /> Galerie Avant / Après
          </h1>
          <p className="font-inter text-sm text-muted-foreground">{items.length} comparaison{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew} className="bg-primary gap-2 text-xs">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-inter text-sm">Aucun élément. Ajoutez votre première comparaison.</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {/* Preview thumbnails */}
              <div className="flex gap-1 flex-shrink-0">
                {[item.before_url, item.after_url].map((url, i) => (
                  url
                    ? <img key={i} src={url} alt="" className="w-14 h-10 object-cover rounded-lg border border-border" />
                    : <div key={i} className="w-14 h-10 bg-secondary rounded-lg border border-border" />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-semibold text-sm truncate">{item.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{item.category} · ordre {item.order}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(item)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${item.is_published ? 'border-green-400/30 bg-green-400/10 text-green-400' : 'border-border text-muted-foreground'}`}>
                  {item.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <Button size="sm" variant="outline" className="text-xs h-8 px-3" onClick={() => openEdit(item)}>Modifier</Button>
                <button onClick={() => deleteMutation.mutate(item.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-grotesk font-bold text-lg">{editingId ? 'Modifier' : 'Ajouter'} une comparaison</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {field('title', 'Titre *', 'text', 'Ex: Toiture avant/après traitement')}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Catégorie</label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {field('before_url', 'URL image AVANT *', 'url', 'https://...')}
              {field('after_url', 'URL image APRÈS *', 'url', 'https://...')}
              <div className="grid grid-cols-2 gap-3">
                {field('before_label', 'Label Avant', 'text', 'Avant')}
                {field('after_label', 'Label Après', 'text', 'Après')}
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              {field('order', 'Ordre d\'affichage', 'number', '0')}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="pub" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <label htmlFor="pub" className="font-inter text-sm cursor-pointer">Publié (visible sur le site)</label>
              </div>
              <Button onClick={() => saveMutation.mutate(form)} disabled={!form.title || !form.before_url || !form.after_url || saveMutation.isPending} className="w-full bg-primary">
                <Save className="w-4 h-4 mr-2" /> Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}