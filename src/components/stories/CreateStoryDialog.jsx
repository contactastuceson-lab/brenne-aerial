import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon, Type, Upload, X, Camera, AlignLeft, AlignCenter, AlignRight, Smile, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  TEXT_GRADIENTS, STORY_EXPIRY_MS, STORY_FILTERS, STORY_FONTS, STORY_TEXT_COLORS, STORY_STICKERS, filterCss,
} from '@/lib/storyUtils';

const TABS = [
  { id: 'media', label: 'Photo', icon: ImageIcon },
  { id: 'text', label: 'Texte', icon: Type },
];

const TOOLS = [
  { id: 'filter', label: 'Filtres', icon: Sparkles },
  { id: 'text', label: 'Texte', icon: Type },
  { id: 'stickers', label: 'Stickers', icon: Smile },
];

function Sticker({ data, boundsRef, onChange, onRemove }) {
  const draggedRef = useRef(false);
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => { draggedRef.current = true; }}
      onDragEnd={(_, info) => {
        const b = boundsRef.current?.getBoundingClientRect();
        if (!b) return;
        const nx = Math.min(95, Math.max(5, data.x + (info.offset.x / b.width) * 100));
        const ny = Math.min(92, Math.max(8, data.y + (info.offset.y / b.height) * 100));
        onChange(data.id, nx, ny);
      }}
      onClick={() => { if (draggedRef.current) { draggedRef.current = false; return; } onRemove(data.id); }}
      className="absolute text-3xl cursor-grab active:cursor-grabbing select-none z-20"
      style={{ left: `${data.x}%`, top: `${data.y}%`, transform: 'translate(-50%,-50%)', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
    >
      {data.emoji}
    </motion.div>
  );
}

export default function CreateStoryDialog({ open, onClose, user, onCreated }) {
  const [tab, setTab] = useState('media');
  const [tool, setTool] = useState('filter');
  const [text, setText] = useState('');
  const [gradient, setGradient] = useState(TEXT_GRADIENTS[0].key);
  const [font, setFont] = useState('grotesk');
  const [color, setColor] = useState('#ffffff');
  const [align, setAlign] = useState('center');
  const [caption, setCaption] = useState('');
  const [filter, setFilter] = useState('none');
  const [stickers, setStickers] = useState([]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTab('media'); setTool('filter'); setText(''); setGradient(TEXT_GRADIENTS[0].key);
      setFont('grotesk'); setColor('#ffffff'); setAlign('center'); setCaption(''); setFilter('none');
      setStickers([]); setMediaPreview(null); setMediaType('image'); setMediaUrl(''); setBusy(false);
    }
  }, [open]);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 25 Mo)'); return; }
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(res?.file_url || res?.data?.file_url || '');
    } catch { toast.error('Upload échoué'); setMediaPreview(null); }
    setBusy(false);
  };

  const addSticker = (emoji) => {
    setStickers((s) => [...s, { id: Date.now() + Math.random(), emoji, x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }]);
  };

  const submit = async () => {
    if (busy) return;
    if (tab === 'media' && !mediaUrl) { toast.error('Importez une photo ou vidéo'); return; }
    if (tab === 'text' && !text.trim()) { toast.error('Saisissez un texte'); return; }
    setBusy(true);
    try {
      const expiresAt = new Date(Date.now() + STORY_EXPIRY_MS).toISOString();
      const payload = {
        author_id: user?.id, author_email: user?.email || '', author_name: user?.full_name || '',
        author_username: user?.username || '', author_avatar: user?.avatar_url || '',
        media_type: tab === 'text' ? 'text' : mediaType, expires_at: expiresAt, viewers: [],
        font, text_color: color, text_align: align,
      };
      if (tab === 'text') {
        payload.text = text.trim(); payload.background_color = gradient;
      } else {
        payload.media_url = mediaUrl; payload.filter = filter;
        payload.stickers = stickers.map(({ id, ...rest }) => rest);
        if (caption.trim()) payload.text = caption.trim();
      }
      await base44.entities.Story.create(payload);
      toast.success('Story publiée !');
      onCreated && onCreated();
      onClose();
    } catch { toast.error('Publication échouée'); }
    setBusy(false);
  };

  const activeFontCss = (STORY_FONTS.find((f) => f.key === font) || STORY_FONTS[0]).css;
  const activeGradient = (TEXT_GRADIENTS.find((g) => g.key === gradient) || TEXT_GRADIENTS[0]).css;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="font-grotesk">Créer une story</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 mx-4 mb-2 rounded-xl bg-secondary/60">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-grotesk font-bold transition-all ${tab === t.id ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Preview */}
        <div className="px-4">
          <div ref={previewRef} className="relative w-full aspect-[9/16] max-h-[52vh] mx-auto rounded-2xl overflow-hidden bg-black">
            {tab === 'text' ? (
              <div className="w-full h-full flex items-center justify-center p-6" style={{ background: activeGradient }}>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Votre texte…"
                  rows={4} autoFocus
                  className="bg-transparent border-none font-black text-2xl resize-none focus-visible:ring-0 placeholder:text-white/60 break-words whitespace-pre-wrap"
                  style={{ color, fontFamily: activeFontCss, textAlign: align, width: '100%' }} />
              </div>
            ) : mediaPreview ? (
              <>
                {mediaType === 'video'
                  ? <video src={mediaPreview} className="w-full h-full object-cover" style={{ filter: filterCss(filter) || undefined }} muted controls={false} autoPlay loop />
                  : <img src={mediaPreview} alt="" className="w-full h-full object-cover" style={{ filter: filterCss(filter) || undefined }} />}
                {caption.trim() && (
                  <div className="absolute inset-x-0 px-6 pointer-events-none" style={{ bottom: '18%', textAlign: align }}>
                    <p className="font-bold text-xl drop-shadow-lg whitespace-pre-wrap break-words" style={{ color, fontFamily: activeFontCss }}>{caption}</p>
                  </div>
                )}
                {stickers.map((s) => (
                  <Sticker key={s.id} data={s} boundsRef={previewRef}
                    onChange={(id, x, y) => setStickers((arr) => arr.map((st) => st.id === id ? { ...st, x, y } : st))}
                    onRemove={(id) => setStickers((arr) => arr.filter((st) => st.id !== id))} />
                ))}
                {busy && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
                <button onClick={() => { setMediaPreview(null); setMediaUrl(''); setStickers([]); }}
                  className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                <button onClick={() => camRef.current?.click()} className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/20 hover:bg-white/5 transition-colors">
                  <Camera className="w-7 h-7 text-foreground" />
                  <span className="font-grotesk font-bold text-sm">Prendre une photo</span>
                </button>
                <button onClick={() => fileRef.current?.click()} className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/20 hover:bg-white/5 transition-colors">
                  <Upload className="w-7 h-7 text-foreground" />
                  <span className="font-grotesk font-bold text-sm">Importer (galerie)</span>
                  <span className="font-inter text-[11px] text-muted-foreground">JPG, PNG, MP4 — 25 Mo</span>
                </button>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>

        {/* Controls */}
        <div className="px-4 py-3">
          {tab === 'media' && mediaPreview && (
            <>
              <div className="flex gap-1 mb-3">
                {TOOLS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setTool(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-grotesk font-bold transition-all ${tool === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'}`}>
                      <Icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {tool === 'filter' && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {STORY_FILTERS.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 flex items-end justify-center pb-1 ${filter === f.key ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundImage: `url(${mediaPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: f.css || 'none' }}>
                      <span className="text-[8px] font-bold px-1 rounded bg-black/60 text-white">{f.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tool === 'text' && (
                <div className="space-y-2">
                  <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ajouter un texte…"
                    className="w-full h-9 rounded-lg bg-secondary/60 border border-border px-3 text-sm focus:outline-none focus:border-primary/50"
                    style={{ color, fontFamily: activeFontCss }} />
                  <div className="flex gap-1 flex-wrap">
                    {STORY_FONTS.map((f) => (
                      <button key={f.key} onClick={() => setFont(f.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs border ${font === f.key ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
                        style={{ fontFamily: f.css }}>{f.label}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {STORY_TEXT_COLORS.map((c) => (
                        <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-foreground' : 'border-white/20'}`} style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      {[['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]].map(([a, Icon]) => (
                        <button key={a} onClick={() => setAlign(a)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${align === a ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground'}`}>
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground/60">Tapez votre texte, choisissez police, couleur et alignement.</p>
                </div>
              )}

              {tool === 'stickers' && (
                <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                  {STORY_STICKERS.map((e, i) => (
                    <button key={i} onClick={() => addSticker(e)} className="text-2xl hover:bg-white/10 rounded-lg py-1 transition-colors">{e}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'text' && (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {STORY_FONTS.map((f) => (
                  <button key={f.key} onClick={() => setFont(f.key)} className={`px-2.5 py-1 rounded-lg text-xs border ${font === f.key ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`} style={{ fontFamily: f.css }}>{f.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {STORY_TEXT_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-foreground' : 'border-white/20'}`} style={{ background: c }} />
                  ))}
                </div>
                <div className="flex gap-1 ml-auto">
                  {[['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]].map(([a, Icon]) => (
                    <button key={a} onClick={() => setAlign(a)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${align === a ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {TEXT_GRADIENTS.map((g) => (
                  <button key={g.key} onClick={() => setGradient(g.key)} className={`w-8 h-8 rounded-full transition-all ${gradient === g.key ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} style={{ background: g.css }} title={g.label} />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 pb-4 pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={busy}>Annuler</Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Publier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}