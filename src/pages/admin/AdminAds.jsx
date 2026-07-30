import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Megaphone, Plus, Trash2, Pencil, Play, Pause, Loader2, RefreshCw,
  X, BarChart3, MousePointerClick, Eye, TrendingUp, CheckSquare, Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const PLACEMENTS = [
  { key: 'feed_banner', label: 'Banniere du feed' },
  { key: 'between_posts', label: 'Entre les posts' },
  { key: 'sidebar', label: 'Sidebar' },
];

const STATUS_CFG = {
  draft: { label: 'Brouillon', color: 'text-muted-foreground bg-muted/20 border-border' },
  active: { label: 'Active', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  paused: { label: 'Pause', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  ended: { label: 'Terminee', color: 'text-muted-foreground bg-muted/20 border-border' },
};

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n || 0);
}

export default function AdminAds() {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin-ad-campaigns'],
    queryFn: () => base44.entities.AdCampaign.list('-created_date', 100),
    staleTime: 0,
  });

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  const toggleStatus = async (c) => {
    const next = c.status === 'active' ? 'paused' : 'active';
    try {
      await base44.entities.AdCampaign.update(c.id, { status: next });
      toast.success(next === 'active' ? 'Campagne activee' : 'Campagne mise en pause');
      qc.invalidateQueries({ queryKey: ['admin-ad-campaigns'] });
    } catch (e) { toast.error(e.message || 'Erreur'); }
  };

  const remove = async (c) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      await base44.entities.AdCampaign.delete(c.id);
      toast.success('Campagne supprimee');
      qc.invalidateQueries({ queryKey: ['admin-ad-campaigns'] });
    } catch (e) { toast.error(e.message || 'Erreur'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-grotesk font-bold text-xl flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> Gestion publicitaire
          </h1>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">
            Creez et gerer les campagnes publicitaires affichees dans l'app.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs h-9"
          onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Nouvelle campagne
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Campagnes', value: campaigns.length, icon: Megaphone, color: 'text-primary' },
          { label: 'Actives', value: activeCount, icon: Play, color: 'text-green-400' },
          { label: 'Impressions', value: formatNum(totalImpressions), icon: Eye, color: 'text-cyan-400' },
          { label: 'CTR', value: ctr + '%', icon: TrendingUp, color: 'text-amber-400' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <Icon className={`w-4 h-4 mb-2 ${s.color}`} />
              <p className="font-grotesk font-black text-2xl">{s.value}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border bg-card">
          <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-grotesk font-bold text-sm">Aucune campagne</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">Creez votre premiere campagne publicitaire.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => {
            const st = STATUS_CFG[c.status] || STATUS_CFG.draft;
            const ctr = (c.impressions || 0) > 0 ? ((c.clicks || 0) / c.impressions * 100).toFixed(1) : '0.0';
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                {c.image_url ? (
                  <img src={c.image_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-border flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-grotesk font-bold text-sm truncate">{c.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {PLACEMENTS.find(p => p.key === c.placement)?.label || c.placement}
                    {c.advertiser_name ? ` · ${c.advertiser_name}` : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-cyan-400">
                      <Eye className="w-3 h-3" /> {formatNum(c.impressions || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-primary">
                      <MousePointerClick className="w-3 h-3" /> {formatNum(c.clicks || 0)}
                    </span>
                    <span className="font-mono text-[10px] text-amber-400">{ctr}% CTR</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleStatus(c)} title={c.status === 'active' ? 'Mettre en pause' : 'Activer'}
                    className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors">
                    {c.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setEditing(c); setShowForm(true); }} title="Editer"
                    className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(c)} title="Supprimer"
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CampaignForm
            campaign={editing}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSaved={() => { setShowForm(false); setEditing(null); qc.invalidateQueries({ queryKey: ['admin-ad-campaigns'] }); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CampaignForm({ campaign, onClose, onSaved }) {
  const isEdit = !!campaign;
  const [form, setForm] = useState({
    title: campaign?.title || '',
    advertiser_name: campaign?.advertiser_name || '',
    headline: campaign?.headline || '',
    body: campaign?.body || '',
    image_url: campaign?.image_url || '',
    cta_url: campaign?.cta_url || '',
    cta_label: campaign?.cta_label || 'En savoir plus',
    placement: campaign?.placement || 'feed_banner',
    budget_credits: campaign?.budget_credits || 0,
    starts_at: campaign?.starts_at?.slice(0, 16) || '',
    ends_at: campaign?.ends_at?.slice(0, 16) || '',
    status: campaign?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) { toast.error('Titre requis'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        budget_credits: Number(form.budget_credits) || 0,
      };
      if (isEdit) {
        await base44.entities.AdCampaign.update(campaign.id, payload);
        toast.success('Campagne mise a jour');
      } else {
        await base44.entities.AdCampaign.create(payload);
        toast.success('Campagne creee');
      }
      onSaved();
    } catch (e) {
      toast.error(e.message || 'Erreur');
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-grotesk font-bold text-base">{isEdit ? 'Modifier' : 'Nouvelle'} campagne</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Titre *">
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Campagne Eza Pro" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Annonceur">
              <Input value={form.advertiser_name} onChange={e => set('advertiser_name', e.target.value)} placeholder="Eza" />
            </Field>
            <Field label="Budget (credits)">
              <Input type="number" value={form.budget_credits} onChange={e => set('budget_credits', e.target.value)} placeholder="1000" />
            </Field>
          </div>
          <Field label="Accroche (headline)">
            <Input value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="Decouvrez Eza Business" />
          </Field>
          <Field label="Texte descriptif">
            <Input value={form.body} onChange={e => set('body', e.target.value)} placeholder="Boostez votre visibilite..." />
          </Field>
          <Field label="Image (URL)">
            <Input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="URL de destination">
              <Input value={form.cta_url} onChange={e => set('cta_url', e.target.value)} placeholder="https://eza.group" />
            </Field>
            <Field label="Bouton CTA">
              <Input value={form.cta_label} onChange={e => set('cta_label', e.target.value)} placeholder="En savoir plus" />
            </Field>
          </div>
          <Field label="Emplacement">
            <div className="grid grid-cols-3 gap-2">
              {PLACEMENTS.map(p => (
                <button key={p.key} onClick={() => set('placement', p.key)}
                  className={`px-2 py-2 rounded-xl border text-[10px] font-mono font-bold transition-all ${
                    form.placement === p.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Debut">
              <Input type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} />
            </Field>
            <Field label="Fin">
              <Input type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} />
            </Field>
          </div>
          <Field label="Statut">
            <div className="flex gap-2">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button key={key} onClick={() => set('status', key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                    form.status === key ? cfg.color + ' ring-2 ring-primary/30' : 'border-border text-muted-foreground'
                  }`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>Annuler</Button>
          <Button className="flex-1 text-xs gap-1.5" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isEdit ? 'Enregistrer' : 'Creer'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}