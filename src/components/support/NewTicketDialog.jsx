import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Loader2, Upload, X, FileText, Image as ImageIcon, Sparkles, ArrowRight,
  ArrowLeft, CheckCircle2, MessageSquare, FileQuestion, Hash, Send, Wallet, Calendar, MapPin,
  Ban, Users, Radio, CircleDot, Gift, Ticket, Award, ShoppingCart,
} from 'lucide-react';

const MAX_FILES = 5;

// Catalogue des types d'éléments sélectionnables à l'étape 3.
// L'utilisateur peut basculer entre tous ces types (l'IA pré-sélectionne un
// candidat, mais l'utilisateur reste libre d'en choisir un autre).
const ELEMENT_TYPES = [
  { id: 'none', label: 'Aucun', icon: Ban },
  { id: 'post', label: 'Publication', icon: Hash },
  { id: 'wallet', label: 'Portefeuille', icon: Wallet },
  { id: 'event', label: 'Événement', icon: Calendar },
  { id: 'conversation', label: 'Discussion', icon: MessageSquare },
  { id: 'community', label: 'Communauté', icon: Users },
  { id: 'space', label: 'Space audio', icon: Radio },
  { id: 'story', label: 'Story', icon: CircleDot },
  { id: 'referral', label: 'Parrainage', icon: Gift },
  { id: 'registration', label: 'Inscription', icon: Ticket },
  { id: 'reward', label: 'Récompense', icon: Award },
  { id: 'cart', label: 'Panier', icon: ShoppingCart },
];

const TYPE_LABEL = Object.fromEntries(ELEMENT_TYPES.map((t) => [t.id, t.label]));

export default function NewTicketDialog({ open, onClose, onCreated }) {
  // wizard steps: 1 description, 2 category, 3 element, 4 confirm, 5 done
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  // Étape 3 — sélecteur d'élément riche
  const [elementType, setElementType] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [convLabel, setConvLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const reset = useCallback(() => {
    setStep(1); setDescription(''); setFileUrls([]); setSuggestions([]);
    setSelected(null);
    setElementType(null); setItems([]); setItemsLoading(false);
    setSelectedItem(null); setConvLabel('');
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
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke('analyzeSupportCategory', { description });
      const data = res?.data || res;
      const sugg = data?.suggestions || [];
      if (!sugg.length) { toast.error('Analyse IA échouée'); setAnalyzing(false); return; }
      setSuggestions(sugg);
      setStep(2);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Analyse IA échouée');
    }
    setAnalyzing(false);
  };

  // Charge les items réels pour un type d'élément (publications, wallets,
  // événements, communautés, spaces, stories, parrainages, inscriptions,
  // récompenses, panier). Normalise en { id, label, sub, img?, disabled? }.
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
        list = (ps || []).map((p) => ({
          id: p.id,
          label: (p.content || '(sans texte)').slice(0, 80),
          sub: `${p.likes_count || 0} likes · ${p.views_count || 0} vues · ${p.created_date ? new Date(p.created_date).toLocaleDateString('fr-FR') : ''}`,
          obj: p,
        }));
      } else if (type === 'wallet') {
        const ws = await base44.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        list = [{
          id: 'main_account',
          label: 'Compte principal',
          sub: `${Number(user?.referral_credits || 0)} crédits · compte eza`,
          obj: { id: 'main_account', name: 'Compte principal', balance: Number(user?.referral_credits || 0), type: 'main', frozen: false },
        }];
        (ws || []).forEach((w) => list.push({
          id: w.id,
          label: w.name || 'Portefeuille',
          sub: `${w.balance || 0} crédits · ${w.type || 'custom'}${w.frozen ? ' · gelé' : ''}`,
          obj: w,
        }));
      } else if (type === 'event') {
        const es = await base44.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        const bal = Number(user?.referral_credits || 0);
        list = (es || [])
          .filter((e) => e.status !== 'cancelled' && e.status !== 'ended' && (!e.end_date || new Date(e.end_date).getTime() >= Date.now()))
          .map((e) => {
            const price = Number(e.price_credits || 0);
            const insufficient = price > 0 && bal < price;
            const full = e.capacity > 0 && (e.attendees_count || 0) >= e.capacity;
            return {
              id: e.id,
              label: e.title || 'Événement',
              sub: `${e.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR') : '?'}${e.city ? ' · ' + e.city : ''} · ${price > 0 ? price + ' crédits' : 'gratuit'}${e.capacity > 0 ? ' · ' + `${e.attendees_count || 0}/${e.capacity}` : ''}`,
              img: e.image_url,
              obj: e,
              disabled: insufficient || full,
              disabledReason: insufficient ? `Solde insuffisant (${bal}/${price})` : full ? 'Complet' : null,
            };
          });
      } else if (type === 'community') {
        const cs = await base44.entities.Community.filter({}, '-members_count', 60).catch(() => []);
        list = (cs || [])
          .filter((c) => c.type === 'open' || c.owner_id === user.id || (c.member_ids || []).includes(user.id))
          .map((c) => ({
            id: c.id,
            label: c.name,
            sub: `${c.members_count || 0} membres · ${c.category || ''}${c.type === 'closed' ? ' · fermée' : ''}`,
            img: c.cover_url,
            obj: c,
          }));
      } else if (type === 'space') {
        const ss = await base44.entities.Space.filter({ host_id: user.id }, '-created_date', 30).catch(() => []);
        list = (ss || []).map((s) => ({
          id: s.id,
          label: s.title,
          sub: `${s.status} · ${s.started_at ? new Date(s.started_at).toLocaleDateString('fr-FR') : ''}`,
          obj: s,
        }));
      } else if (type === 'story') {
        const st = await base44.entities.Story.filter({ author_id: user.id }, '-created_date', 30).catch(() => []);
        list = (st || [])
          .filter((s) => !s.expires_at || new Date(s.expires_at).getTime() > Date.now())
          .map((s) => ({
            id: s.id,
            label: s.text ? s.text.slice(0, 60) : (s.media_type === 'image' ? 'Story photo' : 'Story vidéo'),
            sub: `${s.media_type} · ${s.created_date ? new Date(s.created_date).toLocaleDateString('fr-FR') : ''}${(s.viewers || []).length ? ' · ' + s.viewers.length + ' vues' : ''}`,
            img: s.media_type === 'image' ? s.media_url : null,
            obj: s,
          }));
      } else if (type === 'referral') {
        let rs = await base44.entities.Referral.filter({ referrer_email: user.email }).catch(() => []);
        if (!rs || !rs.length) rs = await base44.entities.Referral.filter({ referred_email: user.email }).catch(() => []);
        list = (rs || []).map((r) => ({
          id: r.id,
          label: r.referred_email || r.referred_name || 'Filleul',
          sub: `${r.status} · ${r.credits_earned || 0} crédits${r.referral_code ? ' · ' + r.referral_code : ''}`,
          obj: r,
        }));
      } else if (type === 'registration') {
        const regs = await base44.entities.EventRegistration.filter({ user_id: user.id, status: 'registered' }, '-created_date', 50).catch(() => []);
        list = (regs || []).map((r) => ({
          id: r.id,
          label: r.event_title || 'Inscription',
          sub: `${r.event_start_date ? new Date(r.event_start_date).toLocaleDateString('fr-FR') : '?'} · ${r.credits_paid || 0} crédits${r.ticket_code ? ' · ' + r.ticket_code : ''}`,
          img: r.event_image_url,
          obj: r,
        }));
      } else if (type === 'reward') {
        const rws = await base44.entities.RewardRedemption.filter({ user_email: user.email }, '-created_date', 50).catch(() => []);
        list = (rws || []).map((r) => ({
          id: r.id,
          label: r.item_label,
          sub: `${r.cost || 0} crédits · ${r.status} · ${r.item_category || ''}`,
          obj: r,
        }));
      } else if (type === 'cart') {
        const carts = await base44.entities.Cart.filter({ owner_id: user.id, status: 'active' }).catch(() => []);
        const active = (carts || [])[0];
        if (active) list = [{
          id: active.id,
          label: `Panier (${(active.items || []).length} article(s))`,
          sub: `${active.total_credits || 0} crédits · ${active.status}`,
          obj: active,
        }];
      }
      setItems(list || []);
    } catch {}
    setItemsLoading(false);
  };

  const pickSuggestion = async (s) => {
    setSelected(s);
    setStep(3);
    // L'IA pré-sélectionne un type ; on charge ses données.
    const et = ELEMENT_TYPES.some((t) => t.id === s.element_type) ? s.element_type : 'none';
    await loadForType(et);
  };

  const buildRelatedItem = () => {
    const et = elementType || 'none';
    if (et === 'none') return { type: 'none', id: null, label: null };
    if (et === 'conversation') return { type: 'conversation', id: null, label: convLabel || null };
    if (!selectedItem) return { type: et, id: null, label: null };
    const obj = selectedItem.obj;
    let label = selectedItem.label;
    if (et === 'post') label = (obj.content || '').slice(0, 120);
    else if (et === 'wallet') label = `${obj.name || 'Portefeuille'} (${obj.balance || 0} crédits)`;
    else if (et === 'event') label = `${obj.title || 'Événement'} · ${obj.start_date ? obj.start_date.slice(0, 10) : '?'}${Number(obj.price_credits) > 0 ? ` · ${obj.price_credits} crédits` : ' · gratuit'}`;
    else if (et === 'community') label = obj.name;
    else if (et === 'space') label = obj.title;
    else if (et === 'story') label = `Story ${obj.media_type}`;
    else if (et === 'referral') label = `Parrainage ${obj.referred_email || obj.referred_name || ''}`.trim();
    else if (et === 'registration') label = `Inscription ${obj.event_title || ''}`.trim();
    else if (et === 'reward') label = obj.item_label;
    else if (et === 'cart') label = `Panier (${(obj.items || []).length} articles)`;
    return { type: et, id: selectedItem.id, label };
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const subject = description.trim().slice(0, 80) || selected.label;
      const ri = buildRelatedItem();
      const ticket = await base44.entities.SupportTicket.create({
        subject,
        description: description.trim(),
        file_urls: fileUrls,
        category: selected.category,
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

  const isImg = (u) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-grotesk">
            <Sparkles className="w-5 h-5 text-primary" /> Nouveau ticket support
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= s ? 'bg-primary' : 'bg-secondary'
            }`} />
          ))}
        </div>

        {/* STEP 1 — Description + fichiers */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Décrivez votre problème</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Expliquez en détail ce qui se passe, ce que vous attendiez, et le contexte…"
                rows={5}
                className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Pièces jointes <span className="text-xs text-muted-foreground">(optionnel, max {MAX_FILES})</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {fileUrls.map((u) => (
                  <div key={u} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary group">
                    {isImg(u) ? <img src={u} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground" /></div>}
                    <button onClick={() => removeFile(u)} className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {fileUrls.length < MAX_FILES && (
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                    <input type="file" multiple className="hidden" onChange={handleFiles} accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
                  </label>
                )}
              </div>
            </div>
            <Button onClick={goAnalyze} disabled={!description.trim() || analyzing} className="w-full font-grotesk">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Analyser avec l'IA</span>}
            </Button>
          </div>
        )}

        {/* STEP 2 — Choix du type (3 suggestions IA) */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-2.5 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span>L'IA a analysé votre description. Sélectionnez le type qui correspond le mieux :</span>
            </div>
            {suggestions.map((s, i) => {
              const etype = ELEMENT_TYPES.find((t) => t.id === s.element_type);
              const Ic = etype?.icon || FileQuestion;
              return (
                <button key={i} onClick={() => pickSuggestion(s)}
                  className="w-full text-left p-3.5 rounded-xl border border-border bg-secondary/40 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0">
                      <Ic className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">{s.category}</span>
                        {s.element_type !== 'none' && etype && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{etype.label}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
            <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2">
              <ArrowLeft className="w-3 h-3" /> Modifier la description
            </button>
          </div>
        )}

        {/* STEP 3 — Élément concerné (sélecteur riche) */}
        {step === 3 && selected && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Élément concerné</div>
            {/* Sélecteur de type (chips) */}
            <div className="flex flex-wrap gap-1.5">
              {ELEMENT_TYPES.map((t) => {
                const Ic = t.icon;
                const active = elementType === t.id;
                return (
                  <button key={t.id} onClick={() => loadForType(t.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border inline-flex items-center gap-1.5 transition-colors ${
                      active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}>
                    <Ic className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Contenu dynamique selon le type */}
            {elementType === 'none' && (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun élément spécifique — passez à l'étape suivante.</p>
            )}

            {elementType === 'conversation' && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Indiquez la conversation concernée :</p>
                <input value={convLabel} onChange={(e) => setConvLabel(e.target.value)}
                  placeholder="Ex: Discussion avec @username, conversation du 12/08…"
                  className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
            )}

            {elementType && elementType !== 'none' && elementType !== 'conversation' && (
              <>
                {itemsLoading ? (
                  <div className="text-center py-6"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
                ) : items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucun élément trouvé pour « {TYPE_LABEL[elementType]} ».</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {items.map((it) => (
                      <button key={it.id} onClick={() => !it.disabled && setSelectedItem(selectedItem?.id === it.id ? null : it)}
                        disabled={it.disabled}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedItem?.id === it.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                        }`}>
                        {it.img ? (
                          <img src={it.img} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            {(() => {
                              const Ic = ELEMENT_TYPES.find((t) => t.id === elementType)?.icon || FileText;
                              return <Ic className="w-4 h-4 text-muted-foreground" />;
                            })()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{it.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{it.sub}</p>
                          {it.disabled && it.disabledReason && <p className="text-[10px] text-red-400 mt-0.5">{it.disabledReason}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setSelected(null); setStep(2); }} className="flex-1">
                <ArrowLeft className="w-4 h-4" /> Retour
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1 font-grotesk">
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — Confirmation */}
        {step === 4 && selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">{selected.category}</span>
                <span className="text-sm font-grotesk font-bold">{selected.label}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{description}</p>
              {fileUrls.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> {fileUrls.length} pièce(s) jointe(s)</p>
              )}
              {(() => {
                const ri = buildRelatedItem();
                if (ri.type === 'none' || (!ri.id && !ri.label)) return null;
                const Ic = ELEMENT_TYPES.find((t) => t.id === ri.type)?.icon || FileText;
                return (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Ic className="w-3 h-3 text-primary" />
                    <span className="font-medium text-foreground/80">{TYPE_LABEL[ri.type]} :</span> {ri.label || '(non sélectionné)'}
                  </p>
                );
              })()}
            </div>
            <p className="text-xs text-muted-foreground text-center">Nexus IA va analyser votre ticket et répondre immédiatement. Un email de confirmation vous sera envoyé.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                <ArrowLeft className="w-4 h-4" /> Retour
              </Button>
              <Button onClick={submit} disabled={submitting} className="flex-1 font-grotesk">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="inline-flex items-center gap-2"><Send className="w-4 h-4" /> Créer le ticket</span>}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5 — Succès */}
        {step === 5 && createdTicket && (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="font-grotesk font-bold text-base">Ticket créé 🎉</h3>
              <p className="text-xs text-muted-foreground mt-1">#{String(createdTicket.id).slice(-6)} · Nexus IA répond en direct…</p>
            </div>
            <Button onClick={handleClose} className="w-full font-grotesk">
              Voir ma conversation <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}