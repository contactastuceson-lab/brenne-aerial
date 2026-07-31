import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ImagePlus, Hash, ListChecks, Globe, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { COMMUNITY_CATEGORIES, slugify } from '@/lib/communityCategories';
import { awardCredits } from '@/lib/rewardActions';

export default function CommunityDialog({ open, onClose, user, onSaved, editing }) {
  const [name, setName] = useState(editing?.name || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [type, setType] = useState(editing?.type || 'open');
  const [category, setCategory] = useState(editing?.category || 'other');
  const [coverUrl, setCoverUrl] = useState(editing?.cover_url || '');
  const [rules, setRules] = useState(editing?.rules || ['']);
  const [tags, setTags] = useState(editing?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCoverUrl(file_url);
      toast.success('Couverture ajoutée');
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const cleanRules = rules.map(r => r.trim()).filter(Boolean);
      const slug = editing?.slug || (slugify(name) + '-' + Math.random().toString(36).slice(2, 6));
      const payload = {
        name: name.trim(),
        slug,
        description: description.trim(),
        cover_url: coverUrl,
        category,
        tags,
        rules: cleanRules,
        type,
        owner_id: user.id,
        owner_name: user.full_name,
        owner_username: user.username,
        owner_avatar: user.avatar_url,
      };
      if (editing) {
        await base44.entities.Community.update(editing.id, payload);
        toast.success('Communauté mise à jour');
      } else {
        payload.member_ids = [user.id];
        payload.members_count = 1;
        payload.posts_count = 0;
        await base44.entities.Community.create(payload);
        toast.success('Communauté créée');
      }
      if (!editing) awardCredits('create_community', {});
      onSaved?.();
      onClose();
    } catch {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <h3 className="font-grotesk font-bold text-base">{editing ? 'Modifier la communauté' : 'Nouvelle communauté'}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Cover */}
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Couverture</label>
              <div className="relative h-24 rounded-xl overflow-hidden border border-border bg-secondary/30 flex items-center justify-center">
                {coverUrl ? (
                  <img src={coverUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="text-center">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /> : <ImagePlus className="w-5 h-5 text-muted-foreground/50 mx-auto" />}
                  </div>
                )}
                <label className="absolute bottom-1.5 right-1.5 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files?.[0])} disabled={uploading} />
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-[11px] font-semibold text-foreground border border-border/60">
                    <ImagePlus className="w-3 h-3" /> {coverUrl ? 'Changer' : 'Ajouter'}
                  </span>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="font-inter text-xs text-muted-foreground">Nom</label>
              <input value={name} onChange={e => setName(e.target.value.slice(0, 60))} placeholder="ex: Pilotes IA, Créateurs Vidéo"
                className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>

            {/* Description */}
            <div>
              <label className="font-inter text-xs text-muted-foreground">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 200))} placeholder="Objet de la communauté"
                className="mt-1 w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[56px]" />
            </div>

            {/* Category */}
            <div>
              <label className="font-inter text-xs text-muted-foreground">Catégorie</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {COMMUNITY_CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setCategory(c.key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${category === c.key ? `${c.bg} ${c.border} ${c.color}` : 'border-border text-muted-foreground hover:bg-white/5'}`}>
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="font-inter text-xs text-muted-foreground">Visibilité</label>
              <div className="mt-1 flex gap-2">
                <button onClick={() => setType('open')} className={`flex-1 py-2 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${type === 'open' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400' : 'border-border text-muted-foreground hover:bg-white/5'}`}>
                  <Globe className="w-3.5 h-3.5" /> Publique
                </button>
                <button onClick={() => setType('closed')} className={`flex-1 py-2 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${type === 'closed' ? 'border-amber-400/40 bg-amber-400/10 text-amber-400' : 'border-border text-muted-foreground hover:bg-white/5'}`}>
                  <Lock className="w-3.5 h-3.5" /> Fermée
                </button>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">{type === 'open' ? 'Visible et rejoignable par tous.' : 'Posts visibles par les membres uniquement.'}</p>
            </div>

            {/* Tags */}
            <div>
              <label className="font-inter text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> Tags (max 5)</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                    #{t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <span className="flex items-center gap-1">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="ajouter" className="w-16 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none border-b border-border/40" />
                    {tagInput.trim() && <button onClick={addTag} className="text-primary text-xs font-bold">+</button>}
                  </span>
                )}
              </div>
            </div>

            {/* Rules */}
            <div>
              <label className="font-inter text-xs text-muted-foreground flex items-center gap-1"><ListChecks className="w-3 h-3" /> Règles (optionnel)</label>
              <div className="mt-1 space-y-1.5">
                {rules.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground/50 w-4">{i + 1}.</span>
                    <input value={r} onChange={e => { const v = [...rules]; v[i] = e.target.value.slice(0, 120); setRules(v); }}
                      placeholder="Soyez respectueux…"
                      className="flex-1 bg-secondary/50 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50" />
                    {rules.length > 1 && <button onClick={() => setRules(rules.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>}
                  </div>
                ))}
                {rules.length < 8 && (
                  <button onClick={() => setRules([...rules, ''])} className="text-primary text-xs font-semibold hover:underline">+ Ajouter une règle</button>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border flex-shrink-0">
            <button onClick={handleSave} disabled={saving || uploading}
              className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editing ? 'Enregistrer' : 'Créer la communauté'}
            </button>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}