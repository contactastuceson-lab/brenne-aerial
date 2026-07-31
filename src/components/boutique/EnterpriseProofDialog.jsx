import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trophy, Upload, Loader2, Building2, FileText, Globe,
  CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const ENTERPRISE_COST = 600;

const RESULT_VIEW = {
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    title: 'Demande valid\u00e9e !',
    desc: 'Le badge Gouvernement + les avantages Enterprise ont \u00e9t\u00e9 attribu\u00e9s \u00e0 votre compte.',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    title: 'Demande rejet\u00e9e',
    desc: 'Vos cr\u00e9dits ont \u00e9t\u00e9 rembours\u00e9s. Vous pouvez retenter avec des justificatifs plus complets.',
  },
  needs_review: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    title: 'En cours de validation',
    desc: 'L\u2019IA aiguill\u00e9 votre dossier vers un humain. Vous recevrez une notification d\u00e8s qu\u2019il sera trait\u00e9.',
  },
};

export default function EnterpriseProofDialog({ open, cost, credits, onClose, onUsed }) {
  const [form, setForm] = useState({
    company_name: '',
    legal_form: '',
    registration_number: '',
    website: '',
    description: '',
    employees: '',
    country: '',
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!open) return null;

  const canSubmit = form.company_name.trim().length > 0 && !submitting && !uploading;
  const notEnough = (credits ?? 0) < ENTERPRISE_COST;

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const f of selected.slice(0, 5)) {
        const res = await base44.integrations.Core.UploadFile({ file: f });
        if (res?.file_url) uploaded.push({ name: f.name, url: res.file_url });
      }
      setFiles(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} fichier(s) t\u00e9l\u00e9vers\u00e9(s)`);
    } catch (err) {
      toast.error('Erreur lors de l\u2019envoi des fichiers');
    }
    setUploading(false);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.company_name.trim()) {
      toast.error('Le nom de l\u2019entreprise est obligatoire');
      return;
    }
    if (notEnough) {
      toast.error(`Il vous faut ${ENTERPRISE_COST} cr\u00e9dits (vous en avez ${credits ?? 0})`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('submitEnterpriseProofs', {
        questionnaire: form,
        file_urls: files.map(f => f.url),
      });
      const data = res?.data || res;
      if (data?.success) {
        setResult(data.decision || 'needs_review');
        if (data.decision === 'approved') toast.success(data.message || 'Enterprise valid\u00e9 !');
        else if (data.decision === 'needs_review') toast.info(data.message || 'En revue admin');
        onUsed?.();
      } else if (data?.error) {
        toast.error(data.error);
      } else if (data?.decision === 'rejected') {
        setResult('rejected');
        onUsed?.();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la soumission';
      toast.error(msg);
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="font-grotesk font-bold text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> Gouvernement \u2014 Justificatifs requis
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {result ? (
            <div className="p-8 text-center">
              {(() => {
                const rv = RESULT_VIEW[result];
                const Icon = rv.icon;
                return (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className={`w-16 h-16 rounded-2xl ${rv.bg} border ${rv.border} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${rv.color}`} />
                    </div>
                    <h3 className={`font-grotesk font-black text-xl ${rv.color} mb-2`}>{rv.title}</h3>
                    <p className="font-inter text-sm text-muted-foreground max-w-sm mx-auto">{rv.desc}</p>
                    <Button className="mt-6 w-full" onClick={onClose}>Fermer</Button>
                  </motion.div>
                );
              })()}
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Intro / coût */}
              <div className="rounded-xl bg-yellow-400/5 border border-yellow-400/20 p-3 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-inter text-xs text-foreground leading-relaxed">
                    Le badge <span className="font-bold text-yellow-400">Gouvernement</span> requiert une validation de votre institution ou entit\u00e9 officielle.
                    Soumettez vos justificatifs \u2014 un agent <span className="font-medium">IA</span> les \u00e9value, puis un <span className="font-medium">administrateur</span> valide si n\u00e9cessaire.
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    Co\u00fbt&nbsp;: {ENTERPRISE_COST} cr\u00e9dits \u2014 rembours\u00e9s si refus\u00e9
                  </p>
                </div>
              </div>

              {notEnough && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-400/10 border border-red-400/30">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="font-inter text-xs text-red-400">
                    Cr\u00e9dits insuffisants&nbsp;: il vous faut {ENTERPRISE_COST} (vous en avez {credits ?? 0}).
                  </p>
                </div>
              )}

              {/* Questionnaire */}
              <div className="space-y-3">
                <p className="font-grotesk font-bold text-xs text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Informations de l\u2019institution
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Nom de l\u2019institution / entit\u00e9 *</Label>
                    <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Ex : Mairie de\u2026, Minist\u00e8re de\u2026" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Forme juridique</Label>
                    <Input value={form.legal_form} onChange={e => setForm({ ...form, legal_form: e.target.value })}
                      placeholder="SARL, SAS, EI\u2026" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">N\u00b0 d\u2019immatriculation</Label>
                    <Input value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })}
                      placeholder="SIRET / RCS" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Site web</Label>
                    <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                      placeholder="https://" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Pays</Label>
                    <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                      placeholder="France" className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Description de l\u2019activit\u00e9</Label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="D\u00e9crivez votre activit\u00e9 en quelques lignes\u2026"
                      rows={3} className="mt-1 resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Nombre d\u2019employ\u00e9s</Label>
                    <Input value={form.employees} onChange={e => setForm({ ...form, employees: e.target.value })}
                      placeholder="Ex : 10\u201350" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Upload justificatifs */}
              <div className="space-y-2">
                <p className="font-grotesk font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" /> Justificatifs (KBIS, pi\u00e8ce d\u2019identit\u00e9\u2026)
                </p>
                <div className="rounded-xl border-2 border-dashed border-border p-4 text-center hover:border-primary/40 transition-colors">
                  <input type="file" multiple accept="image/*,application/pdf"
                    onChange={handleFiles} disabled={uploading}
                    className="hidden" id="enterprise-files" />
                  <label htmlFor="enterprise-files" className="cursor-pointer flex flex-col items-center gap-2">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-inter text-xs text-muted-foreground">
                      {uploading ? 'Envoi\u2026' : 'Cliquez pour t\u00e9l\u00e9verser (max 5)'}
                    </span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-inter text-xs text-foreground truncate flex-1">{f.name}</span>
                        <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 text-xs" onClick={onClose} disabled={submitting}>
                  Annuler
                </Button>
                <Button className="flex-1 text-xs bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/25"
                  onClick={handleSubmit} disabled={!canSubmit}>
                  {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Validation IA\u2026</> : <>
                    <Building2 className="w-3.5 h-3.5" /> Soumettre ({ENTERPRISE_COST} cr)
                  </>}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}