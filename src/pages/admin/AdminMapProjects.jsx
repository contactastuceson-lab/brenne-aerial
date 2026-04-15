import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, MapPin, Eye, EyeOff, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['immobilier', 'mariage', 'tourisme'];
const CATEGORY_COLORS = { immobilier: '#38aadc', mariage: '#f59e0b', tourisme: '#1dd8b4' };

const EMPTY_FORM = { title: '', city: '', category: 'immobilier', description: '', lat: '', lng: '', thumbnail: '', video_id: '', is_active: true };

// French cities quick-pick
const QUICK_CITIES = [
  { city: 'Paris', lat: 48.8566, lng: 2.3522 },
  { city: 'Lyon', lat: 45.764, lng: 4.8357 },
  { city: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { city: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  { city: 'Nice', lat: 43.7102, lng: 7.262 },
  { city: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { city: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { city: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { city: 'Rennes', lat: 48.1173, lng: -1.6778 },
  { city: 'Montpellier', lat: 43.6108, lng: 3.8767 },
];

function ProjectForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleQuickCity = (c) => {
    setForm(p => ({ ...p, city: c.city, lat: c.lat, lng: c.lng }));
  };

  const valid = form.title && form.city && form.lat && form.lng && form.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-primary/30 rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-grotesk font-bold text-sm">{initial?.id ? 'Modifier le point' : 'Nouveau point'}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>

      {/* Quick city picker */}
      <div>
        <p className="font-inter text-xs text-muted-foreground mb-2">Ville rapide :</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CITIES.map(c => (
            <button key={c.city} onClick={() => handleQuickCity(c)}
              className={`px-2.5 py-1 rounded-full font-inter text-xs border transition-all ${form.city === c.city ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}>
              {c.city}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Titre *</label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Villa Prestige Paris" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Ville *</label>
          <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Paris" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Catégorie *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full bg-secondary border border-border rounded-md px-3 py-2 font-inter text-sm text-foreground">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">ID Vidéo YouTube</label>
          <Input value={form.video_id} onChange={e => set('video_id', e.target.value)} placeholder="dQw4w9WgXcQ" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Latitude *</label>
          <Input type="number" value={form.lat} onChange={e => set('lat', parseFloat(e.target.value))} placeholder="48.8566" className="bg-secondary border-border" />
        </div>
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1 block">Longitude *</label>
          <Input type="number" value={form.lng} onChange={e => set('lng', parseFloat(e.target.value))} placeholder="2.3522" className="bg-secondary border-border" />
        </div>
      </div>

      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">URL Miniature</label>
        <Input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." className="bg-secondary border-border" />
      </div>

      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">Description</label>
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Courte description du projet..." className="bg-secondary border-border min-h-[70px]" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
        <span className="font-inter text-xs text-muted-foreground">Visible sur la carte</span>
      </label>

      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(form)} disabled={!valid || isSaving} className="bg-primary text-primary-foreground gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {initial?.id ? 'Enregistrer' : 'Créer le point'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="border-border">Annuler</Button>
      </div>
    </motion.div>
  );
}

export default function AdminMapProjects() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['map-projects-admin'],
    queryFn: () => base44.entities.MapProject.list('-created_date', 100),
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.MapProject.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['map-projects-admin'] }); setShowForm(false); toast.success('Point créé'); },
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MapProject.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['map-projects-admin'] }); setEditing(null); toast.success('Point mis à jour'); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.MapProject.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['map-projects-admin'] }); toast.success('Point supprimé'); },
  });

  const toggleActive = (p) => update.mutate({ id: p.id, data: { is_active: !p.is_active } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Carte Interactive</h1>
          <p className="font-inter text-xs text-muted-foreground mt-1">{projects.length} point{projects.length !== 1 ? 's' : ''} géographique{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); }} className="bg-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Ajouter un point
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {(showForm || editing) && (
          <ProjectForm
            initial={editing}
            onSave={(data) => {
              if (editing?.id) update.mutate({ id: editing.id, data });
              else create.mutate(data);
            }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            isSaving={create.isPending || update.isPending}
          />
        )}
      </AnimatePresence>

      {/* Projects list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-inter text-sm">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          Aucun point pour le moment. Ajoutez votre premier projet sur la carte.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {projects.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${p.is_active ? 'border-border' : 'border-border opacity-60'}`}
              >
                {/* Thumbnail */}
                <div className="relative h-36 bg-secondary">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-2 left-2 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${CATEGORY_COLORS[p.category]}20`, border: `1px solid ${CATEGORY_COLORS[p.category]}40`, color: CATEGORY_COLORS[p.category] }}>
                    {p.category}
                  </span>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(p)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
                    title={p.is_active ? 'Masquer' : 'Afficher'}
                  >
                    {p.is_active ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-grotesk font-semibold text-sm text-foreground truncate">{p.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 mb-2">
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-inter text-xs text-muted-foreground">{p.city}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/50 ml-auto">
                      {typeof p.lat === 'number' ? p.lat.toFixed(3) : '—'}, {typeof p.lng === 'number' ? p.lng.toFixed(3) : '—'}
                    </span>
                  </div>
                  {p.description && (
                    <p className="font-inter text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-border gap-1.5 text-xs"
                      onClick={() => { setEditing(p); setShowForm(false); }}>
                      <Pencil className="w-3 h-3" /> Modifier
                    </Button>
                    <Button size="sm" variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => { if (window.confirm('Supprimer ce point ?')) remove.mutate(p.id); }}
                      disabled={remove.isPending}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}