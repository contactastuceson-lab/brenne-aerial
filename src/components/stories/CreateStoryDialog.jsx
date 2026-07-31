import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon, Type, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { TEXT_GRADIENTS, STORY_EXPIRY_MS } from '@/lib/storyUtils';

const TABS = [
  { id: 'media', label: 'Photo / Vidéo', icon: ImageIcon },
  { id: 'text', label: 'Texte', icon: Type },
];

export default function CreateStoryDialog({ open, onClose, user, onCreated }) {
  const [tab, setTab] = useState('media');
  const [text, setText] = useState('');
  const [gradient, setGradient] = useState(TEXT_GRADIENTS[0].key);
  const [caption, setCaption] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTab('media');
      setText('');
      setGradient(TEXT_GRADIENTS[0].key);
      setCaption('');
      setMediaPreview(null);
      setMediaType('image');
      setMediaUrl('');
      setBusy(false);
    }
  }, [open]);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 25 Mo)');
      return;
    }
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const url = res?.file_url || res?.data?.file_url;
      setMediaUrl(url);
    } catch (e) {
      toast.error('Upload échoué');
      setMediaPreview(null);
    }
    setBusy(false);
  };

  const submit = async () => {
    if (busy) return;
    if (tab === 'media' && !mediaUrl) {
      toast.error('Importez une photo ou vidéo');
      return;
    }
    if (tab === 'text' && !text.trim()) {
      toast.error('Saisissez un texte');
      return;
    }
    setBusy(true);
    try {
      const expiresAt = new Date(Date.now() + STORY_EXPIRY_MS).toISOString();
      const payload = {
        author_id: user?.id,
        author_name: user?.full_name || '',
        author_username: user?.username || '',
        author_avatar: user?.avatar_url || '',
        media_type: tab === 'text' ? 'text' : mediaType,
        expires_at: expiresAt,
        viewers: [],
      };
      if (tab === 'text') {
        payload.text = text.trim();
        payload.background_color = gradient;
      } else {
        payload.media_url = mediaUrl;
        if (caption.trim()) payload.text = caption.trim();
      }
      await base44.entities.Story.create(payload);
      toast.success('Story publiée !');
      onCreated && onCreated();
      onClose();
    } catch (e) {
      toast.error('Publication échouée');
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-grotesk">Créer une story</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/60">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-grotesk font-bold transition-all ${
                  tab === t.id ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="py-2">
          {tab === 'media' ? (
            <div className="space-y-3">
              {!mediaPreview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[9/16] max-h-[50vh] mx-auto rounded-xl border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="font-grotesk font-bold text-sm text-foreground">Importer une photo ou vidéo</p>
                  <p className="font-inter text-xs text-muted-foreground">JPG, PNG, MP4 — 25 Mo max</p>
                </button>
              ) : (
                <div className="relative w-full aspect-[9/16] max-h-[50vh] mx-auto rounded-xl overflow-hidden bg-black">
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={mediaPreview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => { setMediaPreview(null); setMediaUrl(''); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {busy && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {mediaPreview && (
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Légende (optionnel)</label>
                  <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ajouter une légende…" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="w-full aspect-[9/16] max-h-[45vh] mx-auto rounded-xl flex items-center justify-center p-6"
                style={{ background: (TEXT_GRADIENTS.find((g) => g.key === gradient) || TEXT_GRADIENTS[0]).css }}
              >
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Votre texte…"
                  rows={4}
                  className="bg-transparent border-none text-white font-grotesk font-black text-2xl text-center placeholder:text-white/60 resize-none focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {TEXT_GRADIENTS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGradient(g.key)}
                    className={`w-9 h-9 rounded-full transition-all ${gradient === g.key ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                    style={{ background: g.css }}
                    title={g.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Publier la story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}