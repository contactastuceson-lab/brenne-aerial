import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Loader2, Upload, X, FileText, ArrowRight, ArrowLeft, Check,
  Lock, Bug, HelpCircle, CreditCard, Wallet, Sparkles, Calendar,
  Shield, MessageSquare, Ban, Hash, Users, Radio, CircleDot, Gift,
  Ticket, Award, ShoppingCart, LifeBuoy, MessageCircle, BookOpen, Star,
  BadgeCheck, Heart, List, Megaphone,
} from 'lucide-react';

const MAX_FILES = 5;
const MAX_DESC = 500;

const CATEGORY_ICONS = {
  account: Lock, billing: CreditCard, credits: Wallet, bug: Bug,
  feature: Sparkles, events: Calendar, moderation: Shield,
  messaging: MessageSquare, other: HelpCircle,
};

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

// Étapes : 1 description, 2 analyse IA, 3 catégorie, 4 élément concerné, 5 succès.

export default function NewTicketDialog({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [docSuggestions, setDocSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [elementType, setElementType] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [convLabel, setConvLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const reset = useCallback(() => {
    setStep(1); setDescription(''); setFileUrls([]); setSuggestions([]); setDocSuggestions([]);
    setSelected(null); setElementType(null); setItems([]); setItemsLoading(false);
    setSelectedItem(null); setConvLabel(''); setCreatedTicket(null); setSubmitting(false); setDocSuggestions([]);
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
      const res = await base44.functions.invoke('analyzeSupportCategory', { description });
      const data = res?.data || res;
      const sugg = data?.suggestions || [];
      if (!sugg.length) {
        setSuggestions([{ label: 'Autre', category: 'other', element_type: 'none', description: '' }]);
      } else {
        setSuggestions(sugg.slice(0, 3));
      }
      setDocSuggestions(Array.isArray(data?.doc_suggestions) ? data.doc_suggestions.slice(0, 3) : []);
      setStep(3);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Analyse échouée');
      setStep(1);
    }
    setAnalyzing(false);
  };

  // Charge les items réels pour un type d'élément.
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

  const pickCategory = (sugg) => {
    setSelected(sugg);
    const et = ELEMENT_TYPES.some((t) => t.id === sugg.element_type) ? sugg.element_type : 'none';
    setElementType(et);
    setSelectedItem(null);
    // Si l'IA a déjà détecté l'élément précis, on le pré-sélectionne et on
    // passe directement à la sélection (skip de la grille si déjà identifié).
    if (sugg.related_item_id && et !== 'none' && et !== 'conversation') {
      setSelectedItem({ id: sugg.related_item_id, label: sugg.related_item_label || '', auto: true });
    }
    setStep(4);
    if (et !== 'none' && et !== 'conversation' && !sugg.related_item_id) loadForType(et);
  };

  const buildRelatedItem = () => {
    const et = elementType || 'none';
    if (et === 'none') return { type: 'none', id: null, label: null };
    if (et === 'conversation') return { type: 'conversation', id: null, label: convLabel || null };
    if (!selectedItem) return { type: et, id: null, label: null };
    if (selectedItem.auto) return { type: et, id: selectedItem.id, label: selectedItem.label };
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
    const sugg = selected || { label: 'Autre', category: 'other', element_type: 'none' };
    setSubmitting(true);
    try {
      const subject = description.trim().slice(0, 80) || sugg.label;
      const ri = buildRelatedItem();
      const ticket = await base44.entities.SupportTicket.create({
        subject,
        description: description.trim(),
        file_urls: fileUrls,
        category: sugg.category,
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

  const Footer = ({ onBack, onNext, nextLabel = 'Continuer', nextDisabled = false, loading = false }) => (
    <>
      <div className="flex gap-2">
        {onBack && (
          <button onClick={onBack}
            className="flex-1 h-10 rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
            Retour
          </button>
        )}
        {onNext ? (
          <button onClick={onNext} disabled={nextDisabled || loading}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:saturate-50 inline-flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            style={{ background: '#0F172A' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{nextLabel} <ArrowRight className="w-4 h-4" /></>}
          </button>
        ) : null}
      </div>
      <div className="border-t border-border mt-3 pt-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          Besoin d'aide immédiate ? Consultez notre{' '}
          <a href="/support/documentation" className="underline hover:text-foreground">documentation</a> ou rejoignez notre{' '}
          <a href="/forum" className="underline hover:text-foreground">communauté</a>.
        </p>
      </div>
    </>
  );

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

          {/* STEP 1 — Description */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-grotesk font-bold text-lg mb-1">Décrivez-nous votre problème</h2>
                <p className="text-xs text-muted-foreground">Partagez ce que vous faisiez, ce qui s'est mal passé et comment nous pouvons reproduire le problème.</p>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder={`Exemple :\n• Ce que vous essayiez de faire\n• Ce qui s'est passé à la place\n• Tout message d'erreur\n• Étapes pour reproduire (si pertinent)`}
                  rows={7}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none placeholder:text-muted-foreground/50"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length} / {MAX_DESC}</p>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Pièces jointes <span className="text-muted-foreground">(optionnel, max {MAX_FILES})</span></label>
                <label className="block w-full rounded-xl border border-dashed border-border bg-background/50 px-3 py-5 text-center cursor-pointer hover:border-primary/40 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 mx-auto animate-spin text-muted-foreground" /> :
                    <><Upload className="w-4 h-4 mx-auto mb-1 text-muted-foreground" /><p className="text-xs text-muted-foreground">Glissez et déposez des fichiers ici</p></>}
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
              <Footer onNext={goAnalyze} nextDisabled={!description.trim()} />
            </div>
          )}

          {/* STEP 2 — Analyse IA */}
          {step === 2 && analyzing && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary mx-auto mb-4 animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Analyse de votre problème…</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">Nexus examine votre description pour vous orienter.</p>
            </div>
          )}

          {/* STEP 3 — Catégorie */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-grotesk font-bold text-lg mb-1">Quel type de problème rencontrez-vous ?</h2>
                <p className="text-xs text-muted-foreground">Sélectionnez la catégorie qui correspond le mieux — cela aide Nexus à vous guider.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {suggestions.map((s, i) => {
                  const Icon = CATEGORY_ICONS[s.category] || HelpCircle;
                  const active = selected?.i === i;
                  return (
                    <button key={i} onClick={() => setSelected({ ...s, i })}
                      className={`relative rounded-xl border p-4 text-center transition-all ${active ? 'border-foreground bg-foreground/5' : 'border-border bg-background/40 hover:border-foreground/30'}`}>
                      {active && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-background" />
                        </span>
                      )}
                      <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${active ? 'bg-primary/15' : 'bg-secondary'}`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-xs font-semibold leading-tight">{s.label}</p>
                    </button>
                  );
                })}
              </div>
              {docSuggestions.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold">Ces articles pourraient vous aider avant de soumettre</span>
                  </div>
                  <div className="space-y-1.5">
                    {docSuggestions.map((d) => (
                      <Link key={d.slug} to={`/support/documentation/${d.slug}`} target="_blank" className="flex items-start gap-2 p-2 rounded-lg hover:bg-primary/[0.06] transition-colors group">
                        <span className="text-xs font-semibold text-primary mt-0.5 flex-shrink-0">{d.title}</span>
                        <span className="text-[11px] text-muted-foreground leading-relaxed flex-1">{d.reason}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Footer onBack={() => setStep(1)} onNext={selected ? () => pickCategory(selected) : null} nextDisabled={!selected} />
            </div>
          )}

          {/* STEP 4 — Élément concerné */}
          {step === 4 && selected && (
            <div className="space-y-4">
              <div>
                <h2 className="font-grotesk font-bold text-lg mb-1">Élément concerné</h2>
                <p className="text-xs text-muted-foreground">Précisez l'élément en question pour aider Nexus à contextualiser.</p>
              </div>
              {/* Chips de type */}
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
                <p className="text-xs text-muted-foreground text-center py-4">Aucun élément spécifique — passez à l'étape suivante.</p>
              )}
              {elementType === 'conversation' && (
                <input value={convLabel} onChange={(e) => setConvLabel(e.target.value)}
                  placeholder="Ex: Discussion avec @username…"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40" />
              )}
              {elementType && elementType !== 'none' && elementType !== 'conversation' && (
                <>
                  {itemsLoading ? (
                    <div className="text-center py-6"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
                  ) : items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Aucun élément trouvé pour « {TYPE_LABEL[elementType]} ».</p>
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {items.map((it) => {
                        const active = selectedItem?.id === it.id;
                        return (
                          <button key={it.id} onClick={() => setSelectedItem(active ? null : it)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 ${active ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}>
                            {it.img ? <img src={it.img} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" /> :
                              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">{(() => { const Ic = ELEMENT_TYPES.find((t) => t.id === elementType)?.icon || FileText; return <Ic className="w-4 h-4 text-muted-foreground" />; })()}</div>}
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
              <Footer onBack={() => setStep(3)} onNext={submit} nextDisabled={elementType !== 'none' && elementType !== 'conversation' && !selectedItem} nextLabel="Soumettre" loading={submitting} />
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