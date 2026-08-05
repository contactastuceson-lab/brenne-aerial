import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Loader2, Upload, X, FileText, ArrowRight, ArrowLeft, Check,
  Lock, Bug, HelpCircle, CreditCard, Wallet, Sparkles, Calendar,
  Shield, MessageSquare, Ban, Hash, Users, Radio, CircleDot, Gift,
  Ticket, Award, ShoppingCart, LifeBuoy, MessageCircle, BookOpen, Star,
  BadgeCheck, Heart, List, Megaphone, ChevronDown,
} from 'lucide-react';

const MAX_FILES = 5;
const MAX_DESC = 500;

const CATEGORY_ICONS = {
  account: Lock, billing: CreditCard, credits: Wallet, bug: Bug,
  feature: Sparkles, events: Calendar, moderation: Shield,
  messaging: MessageSquare, other: HelpCircle,
};

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération',
  messaging: 'Messagerie', other: 'Autre',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

const ELEMENT_TYPES = [
  { id: 'none', label: 'Aucun', icon: Ban },
  { id: 'post', label: 'Publication', icon: Hash },
  { id: 'wallet', label: 'Portefeuille', icon: Wallet },
  { id: 'event', label: 'Événement', icon: Calendar },
  { id: 'conversation', label: 'Conversation', icon: MessageSquare },
  { id: 'community', label: 'Communauté', icon: Users },
  { id: 'space', label: 'Space', icon: Radio },
  { id: 'story', label: 'Story', icon: CircleDot },
  { id: 'referral', label: 'Parrainage', icon: Gift },
  { id: 'registration', label: 'Inscription', icon: Ticket },
  { id: 'reward', label: 'Récompense', icon: Award },
  { id: 'cart', label: 'Panier', icon: ShoppingCart },
  { id: 'ticket', label: 'Ticket', icon: LifeBuoy },
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  { id: 'forum', label: 'Sujet forum', icon: BookOpen },
  { id: 'review', label: 'Avis', icon: Star },
  { id: 'certification', label: 'Certification', icon: BadgeCheck },
  { id: 'donation', label: 'Don', icon: Heart },
  { id: 'list', label: 'Liste', icon: List },
  { id: 'ad', label: 'Campagne pub', icon: Megaphone },
];

const TYPE_LABEL = Object.fromEntries(ELEMENT_TYPES.map((t) => [t.id, t.label]));
const isImg = (u) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u);

export default function NewTicketDialog({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [elementType, setElementType] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [convLabel, setConvLabel] = useState('');
  const [showElementPicker, setShowElementPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const reset = useCallback(() => {
    setStep(1); setDescription(''); setFileUrls([]); setSuggestions([]);
    setSelectedSuggestion(null); setSelectedCategory(null); setShowCatPicker(false);
    setElementType(null); setItems([]); setItemsLoading(false);
    setSelectedItem(null); setConvLabel(''); setShowElementPicker(false);
    setCreatedTicket(null); setSubmitting(false);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_FILES - fileUrls.length);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const res = await base44.integrations.Core.UploadFile({ file: f });
        const url = res?.file_url || res?.data?.file_url;
        if (url) setFileUrls((prev) => [...prev, url]);
      }
    } catch {
      toast.error('Upload échoué');
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeFile = (url) => setFileUrls((prev) => prev.filter((u) => u !== url));

  const goAnalyze = async () => {
    if (!description.trim()) { toast.error('Décrivez votre problème'); return; }
    setStep(2);
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke('analyzeSupportCategory', { description, file_urls: fileUrls });
      const data = res?.data || res;
      const suggs = Array.isArray(data?.suggestions) ? data.suggestions : [];
      if (suggs.length === 0) {
        suggs.push({ label: 'Demande générale', category: 'other', element_type: 'none', description: 'Question ou problème général', related_item_id: null, related_item_label: null });
      }
      setSuggestions(suggs);
      setSelectedSuggestion(suggs[0]);
      setSelectedCategory(suggs[0].category);
      setElementType(suggs[0].element_type && suggs[0].element_type !== 'none' ? suggs[0].element_type : 'none');
      setStep(3);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Analyse échouée');
      setStep(1);
    }
    setAnalyzing(false);
  };

  const loadForType = async (type) => {
    setElementType(type);
    setSelectedItem(null);
    setConvLabel('');
    if (type === 'none' || type === 'conversation') { setItems([]); return; }
    setItemsLoading(true);
    try {
      let list = [];
      if (type === 'post') {
        const ps = await base44.entities.Post.filter({ author_id: user.id }, '-created_date', 30).catch(() => []);
        list = (ps || []).map((p) => ({ id: p.id, label: (p.content || '(sans texte)').slice(0, 80), sub: `${p.likes_count || 0} likes · ${p.views_count || 0} vues`, obj: p }));
      } else if (type === 'wallet') {
        const ws = await base44.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        list = [{ id: 'main_account', label: 'Compte principal', sub: `${Number(user?.referral_credits || 0)} crédits`, obj: { id: 'main_account', name: 'Compte principal', balance: Number(user?.referral_credits || 0) } }];
        (ws || []).forEach((w) => list.push({ id: w.id, label: w.name || 'Portefeuille', sub: `${w.balance || 0} crédits${w.frozen ? ' · gelé' : ''}`, obj: w }));
      } else if (type === 'event') {
        const es = await base44.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        list = (es || []).filter((e) => e.status !== 'cancelled' && e.status !== 'ended' && (!e.end_date || new Date(e.end_date).getTime() >= Date.now()))
          .map((e) => ({ id: e.id, label: e.title, sub: `${e.start_date ? e.start_date.slice(0, 10) : '?'}${e.city ? ' · ' + e.city : ''} · ${e.price_credits || 0} cr`, img: e.image_url, obj: e }));
      } else if (type === 'community') {
        const cs = await base44.entities.Community.filter({}, '-members_count', 60).catch(() => []);
        list = (cs || []).filter((c) => c.type === 'open' || c.owner_id === user.id || (c.member_ids || []).includes(user.id))
          .map((c) => ({ id: c.id, label: c.name, sub: `${c.members_count || 0} membres`, img: c.cover_url, obj: c }));
      } else if (type === 'space') {
        const ss = await base44.entities.Space.filter({ host_id: user.id }, '-created_date', 30).catch(() => []);
        list = (ss || []).map((s) => ({ id: s.id, label: s.title, sub: s.status, obj: s }));
      } else if (type === 'story') {
        const st = await base44.entities.Story.filter({ author_id: user.id }, '-created_date', 30).catch(() => []);
        list = (st || []).filter((s) => !s.expires_at || new Date(s.expires_at).getTime() > Date.now())
          .map((s) => ({ id: s.id, label: s.text ? s.text.slice(0, 60) : `Story ${s.media_type}`, sub: s.media_type, img: s.media_type === 'image' ? s.media_url : null, obj: s }));
      } else if (type === 'referral') {
        let rs = await base44.entities.Referral.filter({ referrer_email: user.email }).catch(() => []);
        if (!rs?.length) rs = await base44.entities.Referral.filter({ referred_email: user.email }).catch(() => []);
        list = (rs || []).map((r) => ({ id: r.id, label: r.referred_email || r.referred_name || 'Filleul', sub: `${r.status} · ${r.credits_earned || 0} cr`, obj: r }));
      } else if (type === 'registration') {
        const regs = await base44.entities.EventRegistration.filter({ user_id: user.id, status: 'registered' }, '-created_date', 50).catch(() => []);
        list = (regs || []).map((r) => ({ id: r.id, label: r.event_title || 'Inscription', sub: `${r.credits_paid || 0} cr${r.ticket_code ? ' · ' + r.ticket_code : ''}`, img: r.event_image_url, obj: r }));
      } else if (type === 'reward') {
        const rws = await base44.entities.RewardRedemption.filter({ user_email: user.email }, '-created_date', 50).catch(() => []);
        list = (rws || []).map((r) => ({ id: r.id, label: r.item_label, sub: `${r.cost || 0} cr · ${r.status}`, obj: r }));
      } else if (type === 'cart') {
        const carts = await base44.entities.Cart.filter({ owner_id: user.id, status: 'active' }).catch(() => []);
        const active = (carts || [])[0];
        if (active) list = [{ id: active.id, label: `Panier (${(active.items || []).length} art.)`, sub: `${active.total_credits || 0} cr`, obj: active }];
      } else if (type === 'ticket') {
        const ts = await base44.entities.SupportTicket.filter({ user_email: user.email }, '-created_date', 30).catch(() => []);
        list = (ts || []).map((t) => ({ id: t.id, label: t.subject || '(sans sujet)', sub: `#${String(t.id).slice(-6)} · ${t.status}`, obj: t }));
      } else if (type === 'discussion') {
        const ds = await base44.entities.Discussion.filter({ author_id: user.id }, '-created_date', 30).catch(() => []);
        list = (ds || []).map((d) => ({ id: d.id, label: d.title || '(sans titre)', sub: `${d.replies_count || 0} réponses`, obj: d }));
      } else if (type === 'forum') {
        const fs = await base44.entities.ForumTopic.filter({ author: user.id }, '-created_date', 30).catch(() => []);
        list = (fs || []).map((f) => ({ id: f.id, label: f.title || '(sans titre)', sub: `${f.replies_count || 0} réponses · ${f.views_count || 0} vues`, obj: f }));
      } else if (type === 'review') {
        const rs = await base44.entities.Review.filter({ author_email: user.email }, '-created_date', 30).catch(() => []);
        list = (rs || []).map((r) => ({ id: r.id, label: r.comment ? r.comment.slice(0, 60) : `Avis ${r.rating || '?'}/5`, sub: `${r.rating || '?'}/5`, obj: r }));
      } else if (type === 'certification') {
        const cs = await base44.entities.CertificationRequest.filter({ user_email: user.email }, '-created_date', 30).catch(() => []);
        list = (cs || []).map((c) => ({ id: c.id, label: 'Demande de certification', sub: c.status, obj: c }));
      } else if (type === 'donation') {
        const ds = await base44.entities.Donation.filter({ donor_email: user.email }, '-created_date', 30).catch(() => []);
        list = (ds || []).map((d) => ({ id: d.id, label: `Don de ${d.amount || 0} €`, sub: d.status, obj: d }));
      } else if (type === 'list') {
        const ls = await base44.entities.UserList.filter({ owner_id: user.id }, '-created_date', 30).catch(() => []);
        list = (ls || []).map((l) => ({ id: l.id, label: l.name, sub: `${(l.member_ids || []).length} membres`, obj: l }));
      } else if (type === 'ad') {
        const as = await base44.entities.AdCampaign.filter({ owner_id: user.id }, '-created_date', 30).catch(() => []);
        list = (as || []).map((a) => ({ id: a.id, label: a.title || 'Campagne', sub: `${a.status} · ${a.credits_remaining || 0} cr`, obj: a }));
      }
      setItems(list || []);
    } catch {}
    setItemsLoading(false);
  };

  const buildRelatedItem = () => {
    const et = elementType || selectedSuggestion?.element_type || 'none';
    if (et === 'none') return { type: 'none', id: null, label: null };
    if (et === 'conversation') return { type: 'conversation', id: null, label: convLabel || null };
    // Si pas d'ajustement et l'IA a détecté l'élément, on l'utilise
    if (!showElementPicker && selectedSuggestion?.related_item_id && et === selectedSuggestion.element_type) {
      return { type: et, id: selectedSuggestion.related_item_id, label: selectedSuggestion.related_item_label };
    }
    if (!selectedItem) return { type: et, id: null, label: null };
    const obj = selectedItem.obj;
    let label = selectedItem.label;
    if (et === 'post') label = (obj.content || '').slice(0, 120);
    else if (et === 'wallet') label = `${obj.name || 'Portefeuille'} (${obj.balance || 0} cr)`;
    else if (et === 'event') label = `${obj.title || 'Événement'} · ${obj.start_date ? obj.start_date.slice(0, 10) : '?'}`;
    else if (et === 'community') label = obj.name;
    else if (et === 'space') label = obj.title;
    else if (et === 'story') label = `Story ${obj.media_type}`;
    else if (et === 'referral') label = `Parrainage ${obj.referred_email || ''}`.trim();
    else if (et === 'registration') label = `Inscription ${obj.event_title || ''}`.trim();
    else if (et === 'reward') label = obj.item_label;
    else if (et === 'cart') label = `Panier (${(obj.items || []).length} articles)`;
    else if (et === 'ticket') label = `Ticket #${String(obj.id).slice(-6)}`;
    else if (et === 'discussion') label = obj.title;
    else if (et === 'forum') label = obj.title;
    else if (et === 'review') label = `Avis ${obj.rating || '?'}/5`;
    else if (et === 'certification') label = 'Demande de certification';
    else if (et === 'donation') label = `Don de ${obj.amount || 0} €`;
    else if (et === 'list') label = obj.name;
    else if (et === 'ad') label = obj.title;
    return { type: et, id: selectedItem.id, label };
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const sugg = selectedSuggestion || { label: 'Demande générale', category: 'other', element_type: 'none' };
      const subject = description.trim().slice(0, 80) || sugg.label;
      const ri = buildRelatedItem();
      const ticket = await base44.entities.SupportTicket.create({
        subject,
        description: description.trim(),
        file_urls: fileUrls,
        category: selectedCategory || sugg.category,
        related_item_id: ri.id,
        related_item_type: ri.type,
        related_item_label: ri.label,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        status: 'open',
        handled_by: 'ai',
        messages: [{ role: 'user', content: description.trim(), at: new Date().toISOString(), attachments: fileUrls }],
      });
      setCreatedTicket(ticket);
      setStep(5);
      onCreated?.(ticket);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Création du ticket échouée');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md bg-card border-border overflow-hidden p-0">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #F37322, #F97316)' }} />
        <div className="p-5 md:p-6">
          <p className="text-[11px] text-muted-foreground mb-1">Soumettre un ticket de support</p>

          <div className="flex items-center gap-1.5 mb-5">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-secondary'}`} />
            ))}
          </div>

          {/* STEP 1 — Description + image */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-grotesk font-bold text-lg mb-1">Décrivez-nous votre problème</h2>
                <p className="text-xs text-muted-foreground">Décrivez ce qui s'est passé. Vous pouvez joindre une capture d'écran — Nexus analysera l'image et le texte.</p>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder={`Exemple :\n• Ce que vous essayiez de faire\n• Ce qui s'est passé à la place\n• Tout message d'erreur`}
                  rows={6}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none placeholder:text-muted-foreground/50"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length} / {MAX_DESC}</p>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Image / capture d'écran <span className="text-muted-foreground">(optionnel, max {MAX_FILES})</span></label>
                <label className="block w-full rounded-xl border border-dashed border-border bg-background/50 px-3 py-5 text-center cursor-pointer hover:border-primary/40 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 mx-auto animate-spin text-muted-foreground" /> :
                    <><Upload className="w-4 h-4 mx-auto mb-1 text-muted-foreground" /><p className="text-xs text-muted-foreground">Glissez une image ou un fichier ici</p></>}
                  <input type="file" multiple className="hidden" onChange={handleFiles} accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
                </label>
                {fileUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fileUrls.map((u) => (
                      <div key={u} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-secondary group">
                        {isImg(u) ? <img src={u} alt="" className="w-full h-full object-cover" /> :
                          <div className="w-full h-full flex items-center justify-center"><FileText className="w-4 h-4 text-muted-foreground" /></div>}
                        <button onClick={() => removeFile(u)} className="absolute top-0 right-0 w-4 h-4 bg-destructive text-white flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={goAnalyze} disabled={!description.trim()}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 inline-flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                style={{ background: '#0F172A' }}>
                Analyser {fileUrls.length > 0 ? 'avec l\'image' : ''} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2 — Analyse IA */}
          {step === 2 && analyzing && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary mx-auto mb-4 animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Analyse de votre demande…</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">Nexus examine votre description{fileUrls.length > 0 ? ' et votre image' : ''} pour identifier le problème.</p>
            </div>
          )}

          {/* STEP 3 — 3 catégories proposées par l'IA */}
          {step === 3 && suggestions.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-grotesk font-bold text-lg mb-1">Quel type de problème ?</h2>
                <p className="text-xs text-muted-foreground">Sélectionnez la catégorie qui correspond le mieux.</p>
              </div>

              <div className="space-y-2">
                {suggestions.map((sugg, i) => {
                  const Icon = CATEGORY_ICONS[sugg.category] || HelpCircle;
                  const active = selectedSuggestion?.label === sugg.label;
                  return (
                    <button key={i} onClick={() => { setSelectedSuggestion(sugg); setSelectedCategory(sugg.category); setElementType(sugg.element_type && sugg.element_type !== 'none' ? sugg.element_type : 'none'); }}
                      className={`relative w-full text-left rounded-2xl border p-3.5 transition-all ${active ? 'border-primary bg-primary/[0.06]' : 'border-border bg-background/40 hover:border-foreground/30'}`}>
                      {active && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></span>}
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary/15' : 'bg-secondary'}`}>
                          <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <p className="font-grotesk font-bold text-sm">{sugg.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 h-10 rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                  Retour
                </button>
                <button onClick={() => setStep(4)} disabled={!selectedSuggestion}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 inline-flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  style={{ background: '#0F172A' }}>
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Élément proposé directement par l'IA */}
          {step === 4 && selectedSuggestion && (
            <div className="space-y-4">
              <div>
                <h2 className="font-grotesk font-bold text-lg mb-1">Élément concerné</h2>
                <p className="text-xs text-muted-foreground">Nexus a identifié l'élément lié à votre demande. Confirmez ou ajustez.</p>
              </div>

              {/* Si l'IA a détecté un élément précis → on l'affiche directement */}
              {!showElementPicker && selectedSuggestion.related_item_id && selectedSuggestion.element_type && selectedSuggestion.element_type !== 'none' && selectedSuggestion.element_type !== 'conversation' ? (
                <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15">
                      {(() => { const EtIcon = ELEMENT_TYPES.find((t) => t.id === selectedSuggestion.element_type)?.icon || FileText; return <EtIcon className="w-5 h-5 text-primary" />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                        {TYPE_LABEL[selectedSuggestion.element_type]}
                      </p>
                      <p className="font-grotesk font-bold text-sm">{selectedSuggestion.related_item_label || 'Élément identifié'}</p>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border border-green-400/20 bg-green-400/10 text-green-400 mt-1.5">
                        <Check className="w-2.5 h-2.5" /> Détecté par Nexus
                      </span>
                    </div>
                  </div>
                </div>
              ) : !showElementPicker && selectedSuggestion.element_type === 'conversation' ? (
                <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Conversation</p>
                      <p className="font-grotesk font-bold text-sm">{selectedSuggestion.related_item_label || 'Discussion'}</p>
                    </div>
                  </div>
                </div>
              ) : !showElementPicker ? (
                <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-center">
                  <Ban className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">Aucun élément spécifique identifié — vous pouvez préciser si besoin.</p>
                </div>
              ) : null}

              {/* Ajuster : picker compact */}
              {!showElementPicker ? (
                <button onClick={() => { setShowElementPicker(true); if (elementType && elementType !== 'none' && elementType !== 'conversation') loadForType(elementType); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 transition-colors">
                  Ce n'est pas le bon élément ? <ChevronDown className="w-3.5 h-3.5" /> Ajuster
                </button>
              ) : (
                <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Ajuster l'élément</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ELEMENT_TYPES.map((t) => {
                      const Ic = t.icon;
                      const active = elementType === t.id;
                      return (
                        <button key={t.id} onClick={() => loadForType(t.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-full border inline-flex items-center gap-1.5 transition-colors ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/40 text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                          <Ic className="w-3.5 h-3.5" /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                  {elementType === 'none' && (
                    <p className="text-xs text-muted-foreground text-center py-2">Aucun élément spécifique.</p>
                  )}
                  {elementType === 'conversation' && (
                    <input value={convLabel} onChange={(e) => setConvLabel(e.target.value)}
                      placeholder="Ex: Discussion avec @username…"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40" />
                  )}
                  {elementType && elementType !== 'none' && elementType !== 'conversation' && (
                    <>
                      {itemsLoading ? (
                        <div className="text-center py-4"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
                      ) : items.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">Aucun élément trouvé pour « {TYPE_LABEL[elementType]} ».</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {items.map((it) => {
                            const active = selectedItem?.id === it.id;
                            return (
                              <button key={it.id} onClick={() => setSelectedItem(active ? null : it)}
                                className={`w-full text-left p-2 rounded-lg border text-xs transition-colors flex items-center gap-2 ${active ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}>
                                {it.img ? <img src={it.img} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> :
                                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">{(() => { const Ic = ELEMENT_TYPES.find((t) => t.id === elementType)?.icon || FileText; return <Ic className="w-3.5 h-3.5 text-muted-foreground" />; })()}</div>}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{it.label}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{it.sub}</p>
                                </div>
                                {active && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(3)}
                  className="flex-1 h-10 rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                  Retour
                </button>
                <button onClick={submit} disabled={submitting}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 inline-flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  style={{ background: '#0F172A' }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Confirmer et envoyer</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Succès */}
          {step === 5 && createdTicket && (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h2 className="font-grotesk font-bold text-lg">Ticket créé 🎉</h2>
                <p className="text-xs text-muted-foreground mt-1">#{String(createdTicket.id).slice(-6)} · Nexus IA répond en direct…</p>
              </div>
              <button onClick={handleClose} className="h-10 px-5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2 mx-auto"
                style={{ background: '#0F172A' }}>
                Voir ma conversation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}