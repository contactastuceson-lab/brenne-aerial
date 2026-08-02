import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Loader2, Upload, X, FileText, Image as ImageIcon, Sparkles, ArrowRight,
  ArrowLeft, CheckCircle2, MessageSquare, FileQuestion, Hash, Send, Wallet, Calendar, MapPin,
} from 'lucide-react';

const MAX_FILES = 5;

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
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [convLabel, setConvLabel] = useState('');
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const reset = useCallback(() => {
    setStep(1); setDescription(''); setFileUrls([]); setSuggestions([]);
    setSelected(null); setPosts([]); setSelectedPost(null); setConvLabel('');
    setWallets([]); setSelectedWallet(null);
    setEvents([]); setSelectedEvent(null);
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

  const pickSuggestion = async (s) => {
    setSelected(s);
    if (s.element_type === 'post') {
      setStep(3);
      setLoadingPosts(true);
      try {
        const list = await base44.entities.Post.filter({ author_id: user.id }, '-created_date', 30).catch(() => []);
        setPosts(list || []);
      } catch { setPosts([]); }
      setLoadingPosts(false);
    } else if (s.element_type === 'conversation') {
      setStep(3);
    } else if (s.element_type === 'wallet') {
      setStep(3);
      setLoadingWallets(true);
      try {
        const list = await base44.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        setWallets(list || []);
      } catch { setWallets([]); }
      setLoadingWallets(false);
    } else if (s.element_type === 'event') {
      setStep(3);
      setLoadingEvents(true);
      try {
        const list = await base44.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        const active = (list || []).filter((e) => e.status !== 'cancelled' && e.status !== 'ended' && (!e.end_date || new Date(e.end_date).getTime() >= Date.now()));
        setEvents(active || []);
      } catch { setEvents([]); }
      setLoadingEvents(false);
    } else {
      setStep(4);
    }
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const subject = description.trim().slice(0, 80) || selected.label;
      const ticket = await base44.entities.SupportTicket.create({
        subject,
        description: description.trim(),
        file_urls: fileUrls,
        category: selected.category,
        related_item_id: selectedPost?.id || selectedWallet?.id || selectedEvent?.id || null,
        related_item_type: selected.element_type === 'post' ? 'post' : selected.element_type === 'conversation' ? 'conversation' : selected.element_type === 'wallet' ? 'wallet' : selected.element_type === 'event' ? 'event' : 'none',
        related_item_label: selectedPost ? (selectedPost.content || '').slice(0, 120) : selectedWallet ? `${selectedWallet.name || 'Portefeuille'} (${selectedWallet.balance || 0} crédits)` : selectedEvent ? `${selectedEvent.title || 'Événement'} · ${selectedEvent.start_date ? selectedEvent.start_date.slice(0, 10) : '?'}${Number(selectedEvent.price_credits) > 0 ? ` · ${selectedEvent.price_credits} crédits` : ' · gratuit'}` : convLabel || null,
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
  const canSubmit3 = selected?.element_type !== 'post' || true; // post is optional (can skip)

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
              const icon = s.element_type === 'post' ? Hash : s.element_type === 'conversation' ? MessageSquare : s.element_type === 'wallet' ? Wallet : s.element_type === 'event' ? Calendar : FileQuestion;
              const Ic = icon;
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
                        {s.element_type !== 'none' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {s.element_type === 'post' ? 'Publication' : s.element_type === 'wallet' ? 'Portefeuille' : s.element_type === 'event' ? 'Événement' : 'Discussion'}
                          </span>
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

        {/* STEP 3 — Élément concerné (dynamique) */}
        {step === 3 && selected && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Élément concerné</div>
            {selected.element_type === 'post' && (
              <>
                <p className="text-xs text-muted-foreground">Sélectionnez la publication concernée (ou passez si non applicable) :</p>
                {loadingPosts ? (
                  <div className="text-center py-6"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
                ) : posts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucune publication trouvée.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {posts.map((p) => (
                      <button key={p.id} onClick={() => setSelectedPost(selectedPost?.id === p.id ? null : p)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                          selectedPost?.id === p.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                        }`}>
                        <p className="truncate">{p.content || '(sans texte)'}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(p.created_date).toLocaleDateString('fr-FR')} · {p.likes_count || 0} likes · {p.views_count || 0} vues
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {selected.element_type === 'conversation' && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Indiquez la conversation concernée :</p>
                <input value={convLabel} onChange={(e) => setConvLabel(e.target.value)}
                  placeholder="Ex: Discussion avec @username, conversation du 12/08…"
                  className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
            )}
            {selected.element_type === 'wallet' && (
              <>
                <p className="text-xs text-muted-foreground">Sélectionnez le compte ou portefeuille concerné (ou passez si non applicable) :</p>
                {loadingWallets ? (
                  <div className="text-center py-6"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    <button onClick={() => setSelectedWallet(selectedWallet?.id === 'main_account' ? null : { id: 'main_account', name: 'Compte principal', balance: Number(user?.referral_credits || 0), type: 'main', frozen: false })}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 ${
                        selectedWallet?.id === 'main_account' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                      }`}>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-bold text-white">eza</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Compte principal</p>
                        <p className="text-[10px] text-muted-foreground">{Number(user?.referral_credits || 0)} crédits · compte eza</p>
                      </div>
                    </button>
                    {wallets.length > 0 && (
                      <div className="pt-1.5 border-t border-border/60">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 px-1 mb-1">Portefeuilles</p>
                        {wallets.map((w) => (
                          <button key={w.id} onClick={() => setSelectedWallet(selectedWallet?.id === w.id ? null : w)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 mb-1 ${
                              selectedWallet?.id === w.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                            }`}>
                            <Wallet className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{w.name || 'Portefeuille'}</p>
                              <p className="text-[10px] text-muted-foreground">{w.balance || 0} crédits · {w.type || 'custom'}{w.frozen ? ' · gelé' : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {selected.element_type === 'event' && (
              <>
                <p className="text-xs text-muted-foreground">Sélectionnez l'événement concerné (ou passez si non applicable) :</p>
                {loadingEvents ? (
                  <div className="text-center py-6"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
                ) : events.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucun événement à venir trouvé.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {events.map((e) => {
                      const price = Number(e.price_credits || 0);
                      const balance = Number(user?.referral_credits || 0);
                      const insufficient = price > 0 && balance < price;
                      const full = e.capacity > 0 && (e.attendees_count || 0) >= e.capacity;
                      return (
                        <button key={e.id} onClick={() => !full && !insufficient && setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
                          disabled={full || insufficient}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedEvent?.id === e.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                          }`}>
                          {e.image_url ? (
                            <img src={e.image_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{e.title || 'Événement'}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
                              <span>{e.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR') : '?'}</span>
                              {e.city && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{e.city}</span>}
                              <span>· {price > 0 ? `${price} crédits` : 'gratuit'}</span>
                              {e.capacity > 0 && <span>· {e.attendees_count || 0}/{e.capacity}</span>}
                            </p>
                            {insufficient && <p className="text-[10px] text-red-400 mt-0.5">Solde insuffisant ({balance}/{price})</p>}
                            {full && <p className="text-[10px] text-amber-400 mt-0.5">Complet</p>}
                          </div>
                        </button>
                      );
                    })}
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
              {selectedPost && <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> Publication: {selectedPost.content?.slice(0, 50)}…</p>}
              {convLabel && <p className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {convLabel}</p>}
              {selectedWallet && <p className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="w-3 h-3" /> {selectedWallet.name || 'Portefeuille'} · {selectedWallet.balance || 0} crédits</p>}
              {selectedEvent && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedEvent.title} · {selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString('fr-FR') : '?'} · {Number(selectedEvent.price_credits) > 0 ? `${selectedEvent.price_credits} crédits` : 'gratuit'}</p>}
            </div>
            <p className="text-xs text-muted-foreground text-center">Nexus IA va analyser votre ticket et répondre immédiatement. Un email de confirmation vous sera envoyé.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(selected.element_type === 'none' ? 2 : 3)} className="flex-1">
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