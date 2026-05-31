import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Megaphone, Plus, Trash2, Edit, Info, AlertTriangle, CheckCircle, AlertCircle, Save, X, Download, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_OPTS = [
  { value: 'info',    label: 'Info',    icon: Info,          color: 'text-primary' },
  { value: 'warning', label: 'Alerte',  icon: AlertTriangle, color: 'text-yellow-400' },
  { value: 'success', label: 'Succès',  icon: CheckCircle,   color: 'text-green-400' },
  { value: 'error',   label: 'Erreur',  icon: AlertCircle,   color: 'text-destructive' },
];

const DISPLAY_OPTS = [
  { value: 'banner', label: 'Bandeau en haut' },
  { value: 'popup',  label: 'Popup' },
  { value: 'both',   label: 'Bandeau + Popup' },
];

const TARGET_OPTS = [
  { value: 'all',            label: 'Tout le monde' },
  { value: 'users_only',    label: 'Membres connectés' },
  { value: 'visitors_only', label: 'Visiteurs uniquement' },
];

const EMPTY = { title: '', content: '', type: 'info', display_mode: 'banner', is_active: true, target: 'all', dismissible: true, expires_at: '', link_url: '', link_label: '' };

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn: () => base44.entities.Announcement.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editId) {
        await base44.entities.Announcement.update(editId, data);
      } else {
        await base44.entities.Announcement.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-admin'] });
      qc.invalidateQueries({ queryKey: ['announcements-banner'] });
      qc.invalidateQueries({ queryKey: ['announcements-popup'] });
      toast.success(editId ? 'Annonce modifiée' : 'Annonce créée');
      setForm(null);
      setEditId(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }) => base44.entities.Announcement.update(id, { is_active: val }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-admin'] });
      qc.invalidateQueries({ queryKey: ['announcements-banner'] });
      qc.invalidateQueries({ queryKey: ['announcements-popup'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-admin'] });
      toast.success('Annonce supprimée');
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids) => { await Promise.all(ids.map(id => base44.entities.Announcement.delete(id))); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-admin'] });
      qc.invalidateQueries({ queryKey: ['announcements-banner'] });
      setSelectedIds([]);
      toast.success('Annonces supprimées');
    },
  });

  const bulkToggle = useMutation({
    mutationFn: async ({ ids, val }) => { await Promise.all(ids.map(id => base44.entities.Announcement.update(id, { is_active: val }))); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-admin'] });
      qc.invalidateQueries({ queryKey: ['announcements-banner'] });
      setSelectedIds([]);
      toast.success('Annonces mises à jour');
    },
  });

  const notifyMutation = useMutation({
    mutationFn: async (id) => {
      const ann = announcements.find(a => a.id === id);
      if (!ann) throw new Error('Annonce non trouvée');
      // Get all users and send notification
      const users = await base44.asServiceRole.entities.User.list('', 1000);
      await Promise.all(users.map(u =>
        base44.integrations.Core.SendEmail({
          to: u.email,
          from_name: 'Brenne Aerial',
          subject: `📢 ${ann.title || 'Nouvelle annonce'}`,
          body: `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #e8edf5; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1a6fa8, #0e5a8a); padding: 32px 36px;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">📢 ${ann.title || 'Nouvelle annonce'}</h1>
  </div>
  <div style="padding: 32px 36px; background: #0d1f35;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #c8d8e8;">${ann.content.replace(/\n/g, '<br>')}</p>
    ${ann.link_url ? `<a href="${ann.link_url}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #1a6fa8, #0e5a8a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px;">${ann.link_label || 'En savoir plus'}</a>` : ''}
  </div>
  <div style="padding: 16px 36px; background: #060e1a; text-align: center;">
    <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.2);">Brenne Aerial • ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
</div>`
        })
      ));
    },
    onSuccess: () => {
      toast.success('Notification envoyée à tous les utilisateurs');
    },
    onError: (err) => {
      toast.error('Erreur lors de l\'envoi: ' + err.message);
    },
  });

  const filtered = announcements
    .filter(a => filterType === 'all' || a.type === filterType)
    .filter(a => filterActive === 'all' || (filterActive === 'active' ? a.is_active : !a.is_active));

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(a => a.id));

  const exportCSV = () => {
    const rows = [['Titre', 'Contenu', 'Type', 'Affichage', 'Cible', 'Active', 'Expire le']];
    filtered.forEach(a => rows.push([a.title || '', a.content, a.type, a.display_mode, a.target, a.is_active ? 'Oui' : 'Non', a.expires_at || '']));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const el = document.createElement('a'); el.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    el.download = 'annonces.csv'; el.click();
  };

  const openEdit = (a) => { setEditId(a.id); setForm({ ...a }); };
  const openNew = () => { setEditId(null); setForm({ ...EMPTY }); };
  const handleSave = () => {
    if (!form.content) { toast.error('Le contenu est requis'); return; }
    saveMutation.mutate({ ...form, expires_at: form.expires_at || null });
  };

  const typeIcon = (type) => {
    const t = TYPE_OPTS.find(t => t.value === type);
    if (!t) return null;
    const Icon = t.icon;
    return <Icon className={`w-3.5 h-3.5 ${t.color}`} />;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-primary" /> Annonces
          </h1>
          <p className="font-inter text-sm text-muted-foreground">{announcements.length} annonce{announcements.length > 1 ? 's' : ''} · {filtered.length} affichée{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV} className="border-border text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button onClick={openNew} className="bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Nouvelle annonce
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 font-inter text-xs text-foreground">
          <option value="all">Tous types</option>
          {TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 font-inter text-xs text-foreground">
          <option value="all">Toutes</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-inter text-xs text-muted-foreground">{selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}</span>
            <button onClick={() => bulkToggle.mutate({ ids: selectedIds, val: true })} className="font-inter text-xs px-2 py-1 rounded-lg bg-green-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20">Activer</button>
            <button onClick={() => bulkToggle.mutate({ ids: selectedIds, val: false })} className="font-inter text-xs px-2 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20">Désactiver</button>
            <button onClick={() => bulkDelete.mutate(selectedIds)} className="font-inter text-xs px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20">Supprimer</button>
          </div>
        )}
      </div>

      {/* Form */}
      {form && (
        <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-grotesk font-semibold text-base">{editId ? "Modifier l'annonce" : 'Nouvelle annonce'}</h2>
            <button onClick={() => { setForm(null); setEditId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Titre (optionnel)</label>
              <Input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Titre de l'annonce" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Type</label>
              <div className="flex gap-2">
                {TYPE_OPTS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))}
                      className={`flex-1 py-2 rounded-lg border font-inter text-xs flex items-center justify-center gap-1 transition-all ${form.type === t.value ? 'border-primary/50 bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                      <Icon className={`w-3 h-3 ${t.color}`} /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Contenu *</label>
            <Textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Message de l'annonce... Les URLs et emails sont auto-cliquables." className="bg-secondary border-border min-h-[80px]" />
            <p className="font-inter text-[10px] text-muted-foreground mt-1">💡 Les liens (https://...) et adresses email sont automatiquement rendus cliquables en bleu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Lien bouton d'action (optionnel)</label>
              <Input value={form.link_url || ''} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="https://exemple.com" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Texte du bouton</label>
              <Input value={form.link_label || ''} onChange={e => setForm(p => ({ ...p, link_label: e.target.value }))} placeholder="En savoir plus" className="bg-secondary border-border" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Affichage</label>
              <select value={form.display_mode} onChange={e => setForm(p => ({ ...p, display_mode: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground">
                {DISPLAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Cible</label>
              <select value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground">
                {TARGET_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Expire le (optionnel)</label>
              <Input type="date" value={form.expires_at || ''} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} className="bg-secondary border-border" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
              <span className="font-inter text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={form.dismissible !== false} onCheckedChange={v => setForm(p => ({ ...p, dismissible: v }))} />
              <span className="font-inter text-sm">Fermable par l'utilisateur</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => { setForm(null); setEditId(null); }} className="border-border text-xs">Annuler</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="bg-primary text-primary-foreground text-xs gap-1.5">
              <Save className="w-3 h-3" /> Sauvegarder
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-inter text-sm">
          <Megaphone className="w-8 h-8 mx-auto mb-3 opacity-30" />
          Aucune annonce
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all */}
          <div className="flex items-center gap-2 px-1">
            <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={toggleAll} className="w-3.5 h-3.5 accent-primary cursor-pointer" />
            <span className="font-inter text-xs text-muted-foreground">Tout sélectionner</span>
          </div>
          {filtered.map(a => (
            <div key={a.id} className={`bg-card border rounded-xl p-4 flex items-center gap-3 ${selectedIds.includes(a.id) ? 'border-primary/40 bg-primary/5' : a.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
              <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)}
                className="w-3.5 h-3.5 accent-primary cursor-pointer flex-shrink-0" />
              <div className="flex items-center gap-2 flex-shrink-0">
                {typeIcon(a.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  {a.title && <span className="font-grotesk font-semibold text-sm">{a.title}</span>}
                  <span className="font-mono text-[9px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded-full">{DISPLAY_OPTS.find(o => o.value === a.display_mode)?.label}</span>
                  <span className="font-mono text-[9px] text-muted-foreground bg-secondary border border-border px-1.5 py-0.5 rounded-full">{TARGET_OPTS.find(o => o.value === a.target)?.label}</span>
                  {a.link_url && <span className="font-mono text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">🔗 lien</span>}
                  {a.expires_at && <span className="font-mono text-[9px] text-muted-foreground">Expire: {format(new Date(a.expires_at), 'd MMM yy', { locale: fr })}</span>}
                </div>
                <p className="font-inter text-xs text-muted-foreground truncate">{a.content}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch checked={a.is_active} onCheckedChange={v => toggleActive.mutate({ id: a.id, val: v })} />
                <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-primary" title="Notifier les utilisateurs"
                  onClick={() => notifyMutation.mutate(a.id)} disabled={notifyMutation.isPending}>
                  {notifyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                </Button>
                <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(a)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(a.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}