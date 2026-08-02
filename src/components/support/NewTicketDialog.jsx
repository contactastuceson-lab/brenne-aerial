import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Loader2, Upload, X, FileText, ArrowRight, ArrowLeft, Check,
  Lock, Bug, HelpCircle, CreditCard, Wallet, Sparkles, Calendar,
  Shield, MessageSquare, Send,
} from 'lucide-react';

const MAX_FILES = 5;
const MAX_DESC = 500;

const CATEGORY_ICONS = {
  account: Lock, billing: CreditCard, credits: Wallet, bug: Bug,
  feature: Sparkles, events: Calendar, moderation: Shield,
  messaging: MessageSquare, other: HelpCircle,
};

const isImg = (u) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u);

// Étapes : 1 description, 2 analyse IA, 3 catégorie, 4 succès.
// Flow simplifié type Base44 : décrire → l'IA analyse et propose 3 catégories
// → l'utilisateur en choisit une → le ticket est créé et Nexus prend le relais.

export default function NewTicketDialog({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const reset = useCallback(() => {
    setStep(1); setDescription(''); setFileUrls([]); setSuggestions([]);
    setSelected(null); setCreatedTicket(null); setSubmitting(false);
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
        // fallback : on saute directement à la création avec catégorie "other"
        setSuggestions([{ label: 'Autre', category: 'other', element_type: 'none', description: '' }]);
      } else {
        setSuggestions(sugg.slice(0, 3));
      }
      setStep(3);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Analyse échouée');
      setStep(1);
    }
    setAnalyzing(false);
  };

  const submit = async (sugg) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const subject = description.trim().slice(0, 80) || sugg.label;
      const ticket = await base44.entities.SupportTicket.create({
        subject,
        description: description.trim(),
        file_urls: fileUrls,
        category: sugg.category,
        related_item_id: sugg.related_item_id || null,
        related_item_type: sugg.element_type || 'none',
        related_item_label: sugg.related_item_label || null,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        status: 'open',
        handled_by: 'ai',
        messages: [{ role: 'user', content: description.trim(), at: new Date().toISOString(), attachments: fileUrls }],
      });
      setCreatedTicket(ticket);
      setStep(4);
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
          <a href="/documentation" className="underline hover:text-foreground">documentation</a> ou rejoignez notre{' '}
          <a href="/forum" className="underline hover:text-foreground">communauté</a>.
        </p>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md bg-card border-border overflow-hidden p-0">
        {/* Orange top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #F37322, #F97316)' }} />
        <div className="p-5 md:p-6">
          <p className="text-[11px] text-muted-foreground mb-1">Soumettre un ticket de support</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                step >= s ? 'bg-primary' : 'bg-secondary'
              }`} />
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
                <p className="text-xs text-muted-foreground">Sélectionnez la catégorie qui correspond le mieux — cela aide Nexus à vous guider vers la bonne solution.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {suggestions.map((s, i) => {
                  const Icon = CATEGORY_ICONS[s.category] || HelpCircle;
                  const active = selected?.i === i;
                  return (
                    <button key={i} onClick={() => setSelected({ ...s, i })}
                      className={`relative rounded-xl border p-4 text-center transition-all ${
                        active ? 'border-foreground bg-foreground/5' : 'border-border bg-background/40 hover:border-foreground/30'
                      }`}>
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
              <Footer onBack={() => setStep(1)} onNext={() => selected && submit(selected)} nextDisabled={!selected} nextLabel="Soumettre" loading={submitting} />
            </div>
          )}

          {/* STEP 4 — Succès */}
          {step === 4 && createdTicket && (
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