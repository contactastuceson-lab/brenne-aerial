import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  inspection: 'Inspection', immobilier: 'Immobilier',
  evenement: 'Événement', retouche: 'Retouche', chantier: 'Chantier',
};

const EMPTY = {
  title: '', category: 'inspection', before_url: '', after_url: '',
  before_label: 'Avant', after_label: 'Après', description: '', is_published: true, order: 0,
};

export default function AdminBeforeAfter() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: items = [] } = useQuery({
    queryKey: ['before-after-admin'],
    queryFn: () => base44.entities.BeforeAfterGallery.list('order'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editId
      ? base44.entities.BeforeAfterGallery.update(editId, data)
      : base44.entities.BeforeAfterGallery.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['before-after-admin'] });
      setShowForm(false); setEditId(null); setForm(EMPTY);
      toast.success(editId ? 'Mis à jour' : 'Créé');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeforeAfterGallery.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['before-after-admin'] }); toast.success('Supprimé'); },
  });

  const togglePublish = (item) => {
    base44.entities.BeforeAfterGallery.update(item.id, { is_published: !item.is_published })
      .then(() => qc.invalidateQueries({ queryKey: ['before-after-admin'] }));
  };

  const openEdit = (item) => { setForm({ ...EMPTY, ...item }); setEditId(item.id); setShowForm(true); };
  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl">Galerie Avant/Après</h1>
            <p className="font-mono text-xs text-muted-foreground">{items.length} comparaison(s)</p>
          </div>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-grotesk font-bold text-lg">{editId ? 'Modifier' : 'Nouvelle comparaison'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Titre *</label>
                <Input value={form.title} onChange={f('title')} required placeholder="Ex: Inspection toiture Lyon" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Catégorie</label>
                <select value={form.category} onChange={f('category')}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">URL image Avant *</label>
                <Input value={form.before_url} onChange={f('before_url')} required placeholder="https://..." />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">URL image Après *</label>
                <Input value={form.after_url} onChange={f('after_url')} required placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Label gauche</label>
                  <Input value={form.before_label} onChange={f('before_label')} placeholder="Avant" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Label droite</label>
                  <Input value={form.after_label} onChange={f('after_label')} placeholder="Après" />
                </div>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={f('description')} rows={2}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Description optionnelle..." />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Ordre</label>
                <Input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} placeholder="0" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={form.is_published}
                  onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
                <label htmlFor="is_published" className="font-inter text-sm">Publié</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-inter text-sm">
          Aucune comparaison. Cliquez sur "Ajouter" pour commencer.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                <img src={item.before_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-semibold text-sm truncate">{item.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{CATEGORY_LABELS[item.category] || item.category}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => togglePublish(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  title={item.is_published ? 'Dépublier' : 'Publier'}>
                  {item.is_published
                    ? <Eye className="w-4 h-4 text-green-400" />
                    : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => openEdit(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => deleteMutation.mutate(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}