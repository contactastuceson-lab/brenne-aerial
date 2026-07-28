import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Plus, RefreshCw, Trash2, Pencil, Star, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const VERIF_OPTIONS = ['verified', 'pro', 'certified', 'official', 'supreme'];
const BADGE_OPTIONS = ['Fondateur', 'Collaborateur', 'VIP', 'Admin', 'Pilote', 'Officiel', 'Vérifié', 'Beta Testeur', 'Partenaire'];

function Avatar({ p }) {
  return (
    <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
      {p.avatar_url
        ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
        : <span className="w-full h-full flex items-center justify-center font-grotesk font-bold text-sm text-primary">{(p.full_name || '?')[0]}</span>}
    </div>
  );
}

function EditDialog({ open, onOpenChange, editing, onSave }) {
  const [form, setForm] = useState(editing || {});
  React.useEffect(() => { setForm(editing || {}); }, [editing]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, val) => setForm(f => {
    const arr = f[k] || [];
    return { ...f, [k]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing?.id ? 'Modifier le profil' : 'Nouveau profil'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Username</label>
              <Input value={form.username || ''} onChange={e => set('username', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Niche</label>
              <Input value={form.niche || ''} onChange={e => set('niche', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Nom affiché</label>
              <Input value={form.display_name || ''} onChange={e => set('display_name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Nom complet</label>
              <Input value={form.full_name || ''} onChange={e => set('full_name', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Bio</label>
            <Textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Localisation</label>
              <Input value={form.location || ''} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Site web</label>
              <Input value={form.website || ''} onChange={e => set('website', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Avatar URL</label>
            <Input value={form.avatar_url || ''} onChange={e => set('avatar_url', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Abonnés</label>
              <Input type="number" value={form.followers_count || 0} onChange={e => set('followers_count', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Abonnements</label>
              <Input type="number" value={form.following_count || 0} onChange={e => set('following_count', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Posts</label>
              <Input type="number" value={form.posts_count || 0} onChange={e => set('posts_count', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Vérifications</label>
            <div className="flex flex-wrap gap-1.5">
              {VERIF_OPTIONS.map(v => {
                const active = (form.verifications || []).includes(v);
                return (
                  <button key={v} type="button" onClick={() => toggleArr('verifications', v)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Badges</label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map(v => {
                const active = (form.badges || []).includes(v);
                return (
                  <button key={v} type="button" onClick={() => toggleArr('badges', v)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${active ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
            Mettre en avant (featured)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}><X className="w-4 h-4 mr-1" /> Annuler</Button>
          <Button onClick={() => onSave(form)}><Save className="w-4 h-4 mr-1" /> Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSampleProfiles() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-sample-profiles'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSampleProfiles', {});
      return res.data || res || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form) => {
      if (form.id) {
        const { id, created_date, updated_date, created_by_id, ...patch } = form;
        return base44.entities.SampleProfile.update(id, patch);
      }
      return base44.entities.SampleProfile.create({ followers_count: 0, following_count: 0, posts_count: 0, verifications: [], badges: [], ...form });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sample-profiles'] });
      qc.invalidateQueries({ queryKey: ['sample-profiles'] });
      toast.success('Profil enregistré');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: e => toast.error(e?.message || 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SampleProfile.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sample-profiles'] });
      qc.invalidateQueries({ queryKey: ['sample-profiles'] });
      toast.success('Profil supprimé');
    },
    onError: e => toast.error(e?.message || 'Erreur'),
  });

  const filtered = profiles.filter(p => !search || (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || (p.username || '').toLowerCase().includes(search.toLowerCase()) || (p.niche || '').toLowerCase().includes(search.toLowerCase()));

  const handleSeed = async () => {
    try {
      const res = await base44.functions.invoke('seedSampleProfiles', {});
      toast.success(`${res.created || 100} profils générés`);
      qc.invalidateQueries({ queryKey: ['admin-sample-profiles'] });
      qc.invalidateQueries({ queryKey: ['sample-profiles'] });
    } catch (e) {
      toast.error(e?.message || 'Erreur');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" /> Profils suggérés
          </h1>
          <p className="font-inter text-sm text-muted-foreground">Profils créateurs crédibles affichés parmi les membres</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Régénérer 100
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Rechercher (nom, username, niche)..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-full" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun profil trouvé</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const isSupreme = (p.verifications || []).includes('supreme');
            return (
              <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5">
                <Avatar p={p} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-grotesk font-semibold text-sm truncate">{p.display_name || p.full_name}</p>
                    {isSupreme && <span className="text-xs">👑</span>}
                    {(p.verifications || []).includes('verified') && <span className="text-[10px] text-accent">✓</span>}
                    {p.is_featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground truncate">@{p.username}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(p.badges || []).slice(0, 3).map(b => (
                      <span key={b} className="font-mono text-[9px] bg-secondary border border-border px-1.5 py-0.5 rounded-full">{b}</span>
                    ))}
                    {(p.verifications || []).slice(0, 2).map(v => (
                      <span key={v} className="font-mono text-[9px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-full">{v}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground hidden sm:block">
                  <p>{(p.followers_count || 0).toLocaleString('fr-FR')}</p>
                  <p className="opacity-60">abonnés</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSave={saveMutation.mutate} />
    </div>
  );
}