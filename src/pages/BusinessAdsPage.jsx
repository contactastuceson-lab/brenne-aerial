import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Megaphone, Plus, Trash2, Pencil, Loader2, RefreshCw,
  X, BarChart3, MousePointerClick, Eye, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, Lock, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { hasBusiness, getActiveTierLabel } from '@/lib/subscriptionGating';

const PLACEMENTS = [
  { key: 'feed_banner', label: 'Bannière du feed', desc: 'En haut du fil d\'actualité' },
  { key: 'between_posts', label: 'Entre les posts', desc: 'Au milieu du fil' },
  { key: 'sidebar', label: 'Sidebar', desc: 'Panneau latéral' },
];

const STATUS_CFG = {
  draft: { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: Clock },
  active: { label: 'En ligne', color: 'text-green-400 bg-green-400/10 border-green-400/30', icon: CheckCircle2 },
  paused: { label: 'En pause', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30', icon: AlertTriangle },
  ended: { label: 'Terminée', color: 'text-muted-foreground bg-muted/20 border-border', icon: AlertTriangle },
};

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n || 0);
}

export default function BusinessAdsPage() {
  const { user, isLoadingAuth } = useAuth();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const tierLabel = getActiveTierLabel(user?.perks);
  const canAccess = hasBusiness(user?.perks);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['business-ad-campaigns'],
    queryFn: async () => {
      const r = await base44.functions.invoke('manageBusinessAdCampaign', { action: 'list' });
      // Le backend renvoie { success, data: [...], credits } — gère les deux niveaux d'enveloppement
      const inner = r?.data ?? r;
      if (Array.isArray(inner?.data)) return { list: inner.data, credits: inner.credits ?? null };
      if (Array.isArray(inner)) return { list: inner, credits: null };
      return { list: [], credits: null };
    },
    enabled: !!user && canAccess,
    staleTime: 0,
  });

  const campaignList = Array.isArray(campaigns?.list) ? campaigns.list : [];
  const listCredits = campaigns?.credits ?? null;

  const remove = async (c) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      await base44.functions.invoke('manageBusinessAdCampaign', { action: 'delete', campaignId: c.id });
      toast.success('Campagne supprimée');
      qc.invalidateQueries({ queryKey: ['business-ad-campaigns'] });
    } catch (e) { toast.error(e?.message || 'Erreur'); }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-grotesk font-bold text-xl">Campagnes publicitaires</h2>
            <p className="text-sm text-muted-foreground mt-2">
              La création de campagnes publicitaires est réservée aux abonnés <span className="text-amber-400 font-bold">Business</span> et <span className="text-purple-400 font-bold">Enterprise</span>.
            </p>
          </div>
          <Button onClick={() => window.location.href = '/premium'} className="gap-2">
            <Crown className="w-4 h-4 text-amber-400" /> Passer à Business
          </Button>
        </div>
      </div>
    );
  }

  const activeCount = campaignList.filter(c => c.status === 'active').length;
  const pendingCount = campaignList.filter(c => c.status === 'draft').length;
  const totalImpressions = campaignList.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaignList.reduce((s, c) => s + (c.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-grotesk font-bold text-xl flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> Mes campagnes pub
          </h1>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">
            Diffusez votre marque sur tout l'écosystème Eza · Tier {tierLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {listCredits != null && (
            <div className="px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-400">{listCredits}</span>
              <span className="font-mono text-[10px] text-amber-400/70">crédits</span>
            </div>
          )}
          <Button size="sm" className="gap-1.5 text-xs h-9"
            onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
          <Megaphone className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="text-foreground font-medium text-sm mb-1">Comment ça marche</p>
          Créez votre campagne → elle est soumise à validation admin → une fois approuvée, elle apparaît dans l'app avec suivi des impressions et clics en temps réel. Modifiez le contenu à tout moment (re-validation si elle était en ligne).
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
           { label: 'Campagnes', value: campaignList.length, icon: Megaphone, color: 'text-primary' },
          { label: 'En ligne', value: activeCount, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'En attente', value: pendingCount, icon: Clock, color: 'text-amber-400' },
          { label: 'Impressions', value: formatNum(totalImpressions), icon: Eye, color: 'text-cyan-400' },
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

      {/* CTR banner */}
      {totalImpressions > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="font-mono text-[10px] text-muted-foreground">Taux de clics global (CTR)</p>
            <p className="font-grotesk font-black text-lg">{ctr}%</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-cyan-400 font-mono"><Eye className="w-3 h-3" /> {formatNum(totalImpressions)}</span>
            <span className="inline-flex items-center gap-1 text-primary font-mono"><MousePointerClick className="w-3 h-3" /> {formatNum(totalClicks)}</span>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : campaignList.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border bg-card">
          <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-grotesk font-bold text-sm">Aucune campagne</p>
          <p className="font-inter text-xs text-muted-foreground mt-1 mb-4">Créez votre première campagne publicitaire.</p>
          <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Commencer
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {campaignList.map(c => {
            const st = STATUS_CFG[c.status] || STATUS_CFG.draft;
            const StIcon = st.icon;
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
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border ${st.color}`}>
                      <StIcon className="w-2.5 h-2.5" /> {st.label}
                    </span>
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
                  <button onClick={() => { setEditing(c); setShowForm(true); }} title="Modifier"
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
          <BusinessCampaignForm
            campaign={editing}
            availableCredits={listCredits}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSaved={() => { setShowForm(false); setEditing(null); qc.invalidateQueries({ queryKey: ['business-ad-campaigns'] }); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BusinessCampaignForm({ campaign, availableCredits, onClose, onSaved }) {
  const isEdit = !!campaign;
  const MIN_BUDGET = 50;
  const [form, setForm] = useState({
    title: campaign?.title || '',
    advertiser_name: campaign?.advertiser_name || '',
    headline: campaign?.headline || '',
    body: campaign?.body || '',
    image_url: campaign?.image_url || '',
    cta_url: campaign?.cta_url || '',
    cta_label: campaign?.cta_label || 'En savoir plus',
    placement: campaign?.placement || 'feed_banner',
    starts_at: campaign?.starts_at?.slice(0, 16) || '',
    ends_at: campaign?.ends_at?.slice(0, 16) || '',
    budget_credits: campaign?.budget_credits || MIN_BUDGET,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('image_url', file_url);
      toast.success('Image uploadée');
    } catch { toast.error('Erreur upload'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.title) { toast.error('Titre requis'); return; }
    const budget = Number(form.budget_credits) || 0;
    if (!isEdit && budget < MIN_BUDGET) { toast.error(`Budget minimum : ${MIN_BUDGET} crédits Eza`); return; }
    if (!isEdit && availableCredits != null && budget > availableCredits) {
      toast.error(`Crédits insuffisants — vous avez ${availableCredits} crédits`); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        budget_credits: Number(form.budget_credits) || 0,
      };
      if (isEdit) {
        await base44.functions.invoke('manageBusinessAdCampaign', { action: 'update', campaignId: campaign.id, patch: payload });
        toast.success('Campagne mise à jour');
      } else {
        const r = await base44.functions.invoke('manageBusinessAdCampaign', { action: 'create', ...payload });
        const remaining = r?.data?.remainingCredits ?? r?.remainingCredits;
        toast.success(remaining != null ? `Campagne soumise — ${payload.budget_credits} crédits débités (${remaining} restants)` : 'Campagne soumise — en attente de validation');
      }
      onSaved();
    } catch (e) {
      toast.error(e?.message || 'Erreur');
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
          {!isEdit && (
            <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-3 py-2 text-[11px] text-amber-400 font-inter">
              Votre campagne sera soumise à validation admin avant d'être diffusée.
            </div>
          )}
          <Field label="Titre *">
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Promo été 2026" />
          </Field>
          <Field label="Nom de l'annonceur">
            <Input value={form.advertiser_name} onChange={e => set('advertiser_name', e.target.value)} placeholder="Votre marque" />
          </Field>
          <Field label="Accroche (headline)">
            <Input value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="-50% sur vos produits !" />
          </Field>
          <Field label="Texte descriptif">
            <textarea value={form.body} onChange={e => set('body', e.target.value)} rows={2}
              className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Profitez de l'offre limitée..." />
          </Field>
          <Field label="Image / créa">
            <div className="flex gap-2 items-center">
              <Input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." className="flex-1" />
              <label className="cursor-pointer px-3 py-2 rounded-lg border border-border bg-secondary text-xs whitespace-nowrap hover:bg-secondary/80 transition-colors">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Uploader'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {form.image_url && (
              <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-lg mt-2 border border-border" />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="URL de destination">
              <Input value={form.cta_url} onChange={e => set('cta_url', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Bouton CTA">
              <Input value={form.cta_label} onChange={e => set('cta_label', e.target.value)} placeholder="En savoir plus" />
            </Field>
          </div>
          <Field label="Emplacement">
            <div className="grid grid-cols-3 gap-2">
              {PLACEMENTS.map(p => (
                <button key={p.key} onClick={() => set('placement', p.key)} title={p.desc}
                  className={`px-2 py-2 rounded-xl border text-[10px] font-mono font-bold transition-all ${
                    form.placement === p.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début">
              <Input type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} />
            </Field>
            <Field label="Fin">
              <Input type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} />
            </Field>
          </div>
          <Field label={`Budget (crédits Eza)${!isEdit ? ` — minimum ${MIN_BUDGET}` : ''}`}>
            <Input type="number" min={MIN_BUDGET} value={form.budget_credits} onChange={e => set('budget_credits', e.target.value)} placeholder={String(MIN_BUDGET)} />
            {!isEdit && (
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Coût à la soumission : <span className="text-amber-400 font-bold">{Number(form.budget_credits) || 0} crédits</span></span>
                {availableCredits != null && (
                  <span className={Number(form.budget_credits) > availableCredits ? 'text-destructive' : 'text-muted-foreground'}>
                    Solde : {availableCredits}
                  </span>
                )}
              </div>
            )}
          </Field>
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>Annuler</Button>
          <Button className="flex-1 text-xs gap-1.5" onClick={save} disabled={saving || uploading}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isEdit ? 'Enregistrer' : 'Soumettre'}
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