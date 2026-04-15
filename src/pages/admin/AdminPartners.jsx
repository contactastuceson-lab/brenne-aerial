import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Loader2, X, Check, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['couvreur', 'architecte', 'geometre', 'btp', 'immobilier', 'autre'];
const EMPTY = { name: '', category: 'couvreur', description: '', website: '', phone: '', email: '', location: '', logo_url: '', is_featured: false, is_active: true };

function PartnerForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-grotesk font-bold text-sm">{initial?.id ? 'Modifier le partenaire' : 'Nouveau partenaire'}</h3>
        <button onClick={onCancel}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom *</label>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Couverture Dupont" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Catégorie *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full bg-secondary border border-border rounded-md px-3 py-2 font-inter text-sm text-foreground">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Localisation</label>
          <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Nantes (44)" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Site web</label>
          <Input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://…" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
          <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="02 40 XX XX XX" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Email</label>
          <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@partenaire.fr" className="bg-secondary border-border" />
        </div>
      </div>
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">Description</label>
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description du partenaire…" className="bg-secondary border-border" rows={2} />
      </div>
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">URL Logo</label>
        <Input value={form.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="https://…" className="bg-secondary border-border" />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
          <span className="font-inter text-xs text-muted-foreground">Mettre en avant</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
          <span className="font-inter text-xs text-muted-foreground">Visible sur le site</span>
        </label>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(form)} disabled={!form.name || isSaving} className="bg-primary text-primary-foreground gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {initial?.id ? 'Enregistrer' : 'Ajouter'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="border-border">Annuler</Button>
      </div>
    </motion.div>
  );
}

export default function AdminPartners() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => base44.entities.Partner.list('-created_date', 200),
  });

  const create = useMutation({
    mutationFn: d => base44.entities.Partner.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partners'] }); setShowForm(false); toast.success('Partenaire ajouté'); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Partner.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partners'] }); setEditing(null); toast.success('Mis à jour'); },
  });
  const remove = useMutation({
    mutationFn: id => base44.entities.Partner.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partners'] }); toast.success('Supprimé'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Partenaires</h1>
          <p className="font-inter text-xs text-muted-foreground mt-1">{partners.length} partenaire{partners.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); }} className="bg-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      <AnimatePresence>
        {(showForm || editing) && (
          <PartnerForm
            initial={editing}
            onSave={data => { if (editing?.id) update.mutate({ id: editing.id, data }); else create.mutate(data); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            isSaving={create.isPending || update.isPending}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(p => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`bg-card border rounded-xl p-4 space-y-2 ${p.is_active ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="font-grotesk font-bold text-sm text-primary">{p.name[0]}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-grotesk font-semibold text-sm truncate">{p.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground capitalize">{p.category} · {p.location || '—'}</p>
                  </div>
                </div>
                {p.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
              </div>
              {p.description && <p className="font-inter text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 border-border gap-1 text-xs" onClick={() => { setEditing(p); setShowForm(false); }}>
                  <Pencil className="w-3 h-3" /> Modifier
                </Button>
                <Button size="sm" variant="outline" className="border-border p-2"
                  onClick={() => update.mutate({ id: p.id, data: { is_active: !p.is_active } })}>
                  {p.is_active ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 p-2"
                  onClick={() => { if (window.confirm('Supprimer ce partenaire ?')) remove.mutate(p.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}