import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Image as ImageIcon, Type as TypeIcon, Camera, Upload, Smile, Sparkles,
  Pen, Trash2, Check, Loader2, ArrowLeft, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  STORY_EXPIRY_MS, STORY_FILTERS, STORY_FONTS, STORY_TEXT_COLORS, STORY_STICKERS,
  TEXT_GRADIENTS, filterCss, fontCss, gradientByKey,
} from '@/lib/storyUtils';
import DraggableLayer from './creator/DraggableLayer';
import GifPicker from './creator/GifPicker';
import DrawingLayer from './creator/DrawingLayer';
import CameraCapture from './creator/CameraCapture';

const genId = () => Math.random().toString(36).slice(2, 9);
const DRAW_COLORS = ['#ffffff', '#f87171', '#fbbf24', '#34d399', '#22d3ee', '#a78bfa', '#f472b6', '#000000'];

export default function StoryCreator({ open, onClose, user, onCreated }) {
  // phase: 'home' | 'camera' | 'edit'
  const [phase, setPhase] = useState('home');
  const [mode, setMode] = useState('media'); // 'media' | 'text'
  const [mediaType, setMediaType] = useState('image');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [filter, setFilter] = useState('none');
  const [gradient, setGradient] = useState(TEXT_GRADIENTS[0].key);
  const [text, setText] = useState('');
  const [font, setFont] = useState('grotesk');
  const [color, setColor] = useState('#ffffff');
  const [align, setAlign] = useState('center');

  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('filter'); // filter | text | stickers | gif | draw

  const [drawColor, setDrawColor] = useState('#ffffff');
  const [drawSize, setDrawSize] = useState(4);
  const [strokes, setStrokes] = useState([]);

  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setPhase('home'); setMode('media'); setMediaType('image'); setMediaPreview(null); setMediaUrl('');
      setFilter('none'); setGradient(TEXT_GRADIENTS[0].key); setText(''); setFont('grotesk');
      setColor('#ffffff'); setAlign('center'); setLayers([]); setSelectedId(null);
      setTool('filter'); setDrawColor('#ffffff'); setDrawSize(4); setStrokes([]); setBusy(false);
    }
  }, [open]);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 25 Mo)'); return; }
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
    setPhase('edit'); setMode('media');
    setBusy(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(res?.file_url || res?.data?.file_url || '');
    } catch { toast.error('Upload échoué'); setPhase('home'); setMediaPreview(null); }
    setBusy(false);
  };

  const startText = () => {
    setMode('text'); setPhase('edit'); setText(''); setGradient(TEXT_GRADIENTS[0].key);
    setFont('grotesk'); setColor('#ffffff'); setAlign('center'); setLayers([]); setStrokes([]);
  };

  const addText = () => {
    const id = genId();
    setLayers((l) => [...l, { id, type: 'text', content: 'Votre texte', x: 50, y: 50, scale: 1, rotation: 0, color: '#ffffff', font: 'grotesk', align: 'center' }]);
    setSelectedId(id);
    setTool('text');
  };
  const addEmoji = (emoji) => {
    const id = genId();
    setLayers((l) => [...l, { id, type: 'emoji', emoji, x: 50, y: 40, scale: 1, rotation: 0 }]);
    setSelectedId(id);
  };
  const addGif = ({ url }) => {
    const id = genId();
    setLayers((l) => [...l, { id, type: 'gif', url, x: 50, y: 50, scale: 1, rotation: 0 }]);
    setSelectedId(id);
  };

  const updateLayer = (id, patch) => setLayers((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeLayer = (id) => { setLayers((l) => l.filter((x) => x.id !== id)); setSelectedId((s) => (s === id ? null : s)); };
  const selected = layers.find((l) => l.id === selectedId) || null;

  const submit = async () => {
    if (busy) return;
    if (mode === 'media' && !mediaUrl) { toast.error('Importez un média'); return; }
    if (mode === 'text' && !text.trim()) { toast.error('Saisissez un texte'); return; }
    setBusy(true);
    try {
      const expiresAt = new Date(Date.now() + STORY_EXPIRY_MS).toISOString();
      const payload = {
        author_id: user?.id, author_email: user?.email || '', author_name: user?.full_name || '',
        author_username: user?.username || '', author_avatar: user?.avatar_url || '',
        expires_at: expiresAt, viewers: [],
      };
      if (mode === 'text') {
        payload.media_type = 'text';
        payload.text = text.trim();
        payload.background_color = gradient;
        payload.font = font; payload.text_color = color; payload.text_align = align;
      } else {
        payload.media_type = mediaType;
        payload.media_url = mediaUrl;
        payload.filter = filter;
        // Calques (texte/emoji/gif) + traits de dessin regroupés dans stickers
        payload.stickers = [
          ...layers.map(({ id, ...rest }) => ({ ...rest })),
          ...strokes.map((s) => ({ type: 'drawing', color: s.color, size: s.size, points: s.points })),
        ];
      }
      await base44.entities.Story.create(payload);
      toast.success('Story publiée !');
      onCreated?.();
      onClose();
    } catch { toast.error('Publication échouée'); }
    setBusy(false);
  };

  if (!open) return null;

  const activeFontCss = fontCss(font);
  const activeGradient = gradientByKey(gradient);

  const renderLayerContent = (l) => {
    if (l.type === 'text') {
      return (
        <div
          className="font-black text-center leading-snug break-words whitespace-pre-wrap"
          style={{
            color: l.color,
            fontFamily: fontCss(l.font),
            textAlign: l.align,
            fontSize: 26,
            textShadow: '0 2px 10px rgba(0,0,0,0.45)',
            maxWidth: '78vw',
          }}
        >
          {l.content || ' '}
        </div>
      );
    }
    if (l.type === 'gif') {
      return <img src={l.url} alt="" className="w-28 h-28 object-contain rounded-lg" />;
    }
    return <span className="text-5xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{l.emoji}</span>;
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Barre haute */}
      <div className="flex items-center justify-between px-4 py-3 z-50">
        <button
          onClick={() => (phase === 'edit' ? (setPhase('home'), setMediaPreview(null), setMediaUrl(''), setLayers([]), setStrokes([])) : onClose())}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        >
          {phase === 'edit' ? <ArrowLeft className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
        </button>
        <span className="font-grotesk font-bold text-sm text-white">Nouvelle story</span>
        {phase === 'edit' ? (
          <button onClick={submit} disabled={busy} className="px-4 h-9 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm disabled:opacity-50 flex items-center gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Publier</>}
          </button>
        ) : <div className="w-10" />}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center px-4 pb-2 min-h-0">
        <div
          ref={canvasRef}
          className="relative w-full aspect-[9/16] max-h-full max-w-[min(100%,calc(86vh*9/16))] rounded-2xl overflow-hidden bg-black mx-auto"
          onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
        >
          {phase === 'home' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
              <button onClick={() => setPhase('camera')} className="w-full flex flex-col items-center gap-2 py-7 rounded-2xl border-2 border-dashed border-white/25 hover:bg-white/5 transition">
                <Camera className="w-8 h-8 text-white" />
                <span className="font-grotesk font-bold text-sm text-white">Appareil photo</span>
              </button>
              <button onClick={() => fileRef.current?.click()} className="w-full flex flex-col items-center gap-2 py-7 rounded-2xl border-2 border-dashed border-white/25 hover:bg-white/5 transition">
                <Upload className="w-8 h-8 text-white" />
                <span className="font-grotesk font-bold text-sm text-white">Galerie</span>
                <span className="font-inter text-[11px] text-white/50">Photo ou vidéo · 25 Mo</span>
              </button>
              <button onClick={startText} className="w-full flex flex-col items-center gap-2 py-7 rounded-2xl border-2 border-dashed border-white/25 hover:bg-white/5 transition">
                <TypeIcon className="w-8 h-8 text-white" />
                <span className="font-grotesk font-bold text-sm text-white">Story texte</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          )}

          {phase === 'camera' && (
            <CameraCapture
              onCaptured={({ url, preview, type }) => { setMediaUrl(url); setMediaPreview(preview); setMediaType(type); setMode('media'); setPhase('edit'); }}
              onClose={() => setPhase('home')}
            />
          )}

          {phase === 'edit' && (
            <>
              {mode === 'text' ? (
                <div className="w-full h-full flex items-center justify-center p-6" style={{ background: activeGradient }}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Votre texte…"
                    autoFocus
                    rows={4}
                    className="bg-transparent border-none font-black text-2xl resize-none focus:outline-none placeholder:text-white/60 break-words whitespace-pre-wrap"
                    style={{ color, fontFamily: activeFontCss, textAlign: align, width: '100%' }}
                  />
                </div>
              ) : (
                <>
                  {mediaType === 'video'
                    ? <video src={mediaPreview} className="w-full h-full object-cover" style={{ filter: filterCss(filter) || undefined }} muted autoPlay loop playsInline />
                    : <img src={mediaPreview} alt="" className="w-full h-full object-cover" style={{ filter: filterCss(filter) || undefined }} />}
                  {busy && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
                  )}

                  {/* Calques texte / emoji / gif */}
                  {layers.map((l) => (
                    <DraggableLayer
                      key={l.id}
                      layer={l}
                      selected={selectedId === l.id}
                      canvasRef={canvasRef}
                      onSelect={setSelectedId}
                      onChange={updateLayer}
                      onDelete={removeLayer}
                    >
                      {renderLayerContent(l)}
                    </DraggableLayer>
                  ))}

                  {/* Dessin */}
                  <DrawingLayer
                    strokes={strokes}
                    color={drawColor}
                    size={drawSize}
                    active={tool === 'draw'}
                    canvasRef={canvasRef}
                    onChange={setStrokes}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Barre d'outils (édition) */}
      {phase === 'edit' && (
        <div className="bg-black/70 backdrop-blur border-t border-white/10 px-3 pt-2 pb-4 space-y-2">
          {selected ? (
            /* Panneau d'édition du calque sélectionné */
            <div className="space-y-2">
              {selected.type === 'text' && (
                <>
                  <input
                    value={selected.content}
                    onChange={(e) => updateLayer(selected.id, { content: e.target.value })}
                    placeholder="Texte…"
                    className="w-full h-9 rounded-lg bg-secondary/60 border border-border px-3 text-sm focus:outline-none focus:border-primary/50"
                    style={{ color: selected.color, fontFamily: fontCss(selected.font) }}
                  />
                  <div className="flex gap-1 flex-wrap">
                    {STORY_FONTS.map((f) => (
                      <button key={f.key} onClick={() => updateLayer(selected.id, { font: f.key })} className={`px-2.5 py-1 rounded-lg text-xs border ${selected.font === f.key ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`} style={{ fontFamily: f.css }}>{f.label}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {STORY_TEXT_COLORS.map((c) => (
                        <button key={c} onClick={() => updateLayer(selected.id, { color: c })} className={`w-6 h-6 rounded-full border-2 ${selected.color === c ? 'border-white' : 'border-white/20'}`} style={{ background: c }} />
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      {[['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]].map(([a, Icon]) => (
                        <button key={a} onClick={() => updateLayer(selected.id, { align: a })} className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected.align === a ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground'}`}>
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground w-10">Taille</span>
                <input type="range" min={0.4} max={3} step={0.05} value={selected.scale ?? 1} onChange={(e) => updateLayer(selected.id, { scale: parseFloat(e.target.value) })} className="flex-1 accent-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground w-10">Rot.</span>
                <input type="range" min={-180} max={180} step={1} value={selected.rotation ?? 0} onChange={(e) => updateLayer(selected.id, { rotation: parseInt(e.target.value, 10) })} className="flex-1 accent-primary" />
              </div>
              <div className="flex justify-between">
                <button onClick={() => setSelectedId(null)} className="px-3 py-1.5 rounded-lg bg-secondary/60 text-foreground font-grotesk font-bold text-xs flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Fini</button>
                <button onClick={() => removeLayer(selected.id)} className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 font-grotesk font-bold text-xs flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>
              </div>
            </div>
          ) : mode === 'text' ? (
            /* Panneau mode texte */
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {STORY_FONTS.map((f) => (
                  <button key={f.key} onClick={() => setFont(f.key)} className={`px-2.5 py-1 rounded-lg text-xs border ${font === f.key ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`} style={{ fontFamily: f.css }}>{f.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {STORY_TEXT_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-white/20'}`} style={{ background: c }} />
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
                  <button key={g.key} onClick={() => setGradient(g.key)} className={`w-8 h-8 rounded-full transition-all ${gradient === g.key ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`} style={{ background: g.css }} title={g.label} />
                ))}
              </div>
            </div>
          ) : (
            /* Onglets d'outils + panneau */
            <>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  ['filter', 'Filtres', Sparkles],
                  ['text', 'Texte', TypeIcon],
                  ['stickers', 'Stickers', Smile],
                  ['gif', 'GIF', ImageIcon],
                  ['draw', 'Dessin', Pen],
                ].map(([id, label, Icon]) => (
                  <button key={id} onClick={() => setTool(id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-grotesk font-bold whitespace-nowrap flex-shrink-0 transition ${tool === id ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/70 hover:text-white'}`}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              {tool === 'filter' && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {STORY_FILTERS.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 flex items-end justify-center pb-1 ${filter === f.key ? 'border-primary' : 'border-transparent'}`} style={{ backgroundImage: `url(${mediaPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: f.css || 'none' }}>
                      <span className="text-[8px] font-bold px-1 rounded bg-black/60 text-white">{f.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tool === 'text' && (
                <button onClick={addText} className="w-full py-2.5 rounded-xl bg-white/10 text-white font-grotesk font-bold text-sm flex items-center justify-center gap-2">
                  <TypeIcon className="w-4 h-4" /> Ajouter un texte
                </button>
              )}

              {tool === 'stickers' && (
                <div className="grid grid-cols-8 gap-1 max-h-24 overflow-y-auto no-scrollbar">
                  {STORY_STICKERS.map((e, i) => (
                    <button key={i} onClick={() => addEmoji(e)} className="text-2xl hover:bg-white/10 rounded-lg py-1 transition">{e}</button>
                  ))}
                </div>
              )}

              {tool === 'gif' && <GifPicker onPick={addGif} />}

              {tool === 'draw' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {DRAW_COLORS.map((c) => (
                        <button key={c} onClick={() => setDrawColor(c)} className={`w-6 h-6 rounded-full border-2 ${drawColor === c ? 'border-white' : 'border-white/20'}`} style={{ background: c }} />
                      ))}
                    </div>
                    <input type="range" min={1} max={14} step={1} value={drawSize} onChange={(e) => setDrawSize(parseInt(e.target.value, 10))} className="flex-1 accent-primary" />
                    <button onClick={() => setStrokes([])} className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white font-grotesk font-bold text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Effacer</button>
                  </div>
                  <p className="font-mono text-[10px] text-white/50">Dessinez sur la story, puis changez d'outil pour déplacer vos calques.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}