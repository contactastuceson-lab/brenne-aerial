import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import {
  QrCode, Download, Copy, Trash2, Link2, Type, Image as ImageIcon,
  Loader2, Sparkles, RefreshCw, ScanLine, Mail, Phone, MessageSquare,
  Wifi, AlertTriangle, FileCode, Calendar, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { applySeoMeta } from '@/lib/seo';
import { base44 } from '@/api/base44Client';

const PRESETS = [
  { label: 'URL / Lien', icon: Link2, placeholder: 'https://eza.group', prefix: '', validate: null },
  { label: 'Texte libre', icon: Type, placeholder: 'Votre texte…', prefix: '', validate: null },
  { label: 'Email', icon: Mail, placeholder: 'contact@eza.group', prefix: 'mailto:', validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { label: 'Téléphone', icon: Phone, placeholder: '+33 6 12 34 56 78', prefix: 'tel:', validate: (v) => /^[+]?[\d\s().-]{6,}$/.test(v) },
  { label: 'SMS', icon: MessageSquare, placeholder: '+33612345678', prefix: 'sms:', validate: (v) => /^[+]?[\d\s().-]{6,}$/.test(v) },
  { label: 'Wi-Fi', icon: Wifi, placeholder: 'WIFI:T:WPA;S:MonWifi;P:MonMotDePasse;;', prefix: '', validate: null },
];

const ERROR_LEVELS = [
  { value: 'L', label: '~7%' },
  { value: 'M', label: '~15%' },
  { value: 'Q', label: '~25%' },
  { value: 'H', label: '~30%' },
];

const MARGIN_PRESETS = [
  { label: 'Minimal', value: 1 },
  { label: 'Standard', value: 4 },
  { label: 'Large', value: 8 },
];

const HISTORY_KEY = 'eza_qr_history';
const HISTORY_MAX = 12;

function fmtNow() {
  return new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function luminance(hex) {
  try {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  } catch { return 0; }
}

function smartFilename(payload, preset) {
  const base = 'qr-eza';
  let tag = 'texte';
  if (preset === 0) tag = 'lien';
  else if (preset === 2) tag = 'email';
  else if (preset === 3) tag = 'tel';
  else if (preset === 4) tag = 'sms';
  else if (preset === 5) tag = 'wifi';
  let slug = '';
  try {
    if (preset === 0) {
      const u = new URL(payload);
      slug = (u.hostname + u.pathname).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 24);
    }
  } catch {}
  return slug ? `${base}-${tag}-${slug}` : `${base}-${tag}`;
}

export default function AdminQrGenerator() {
  const [content, setContent] = useState('');
  const [debouncedContent, setDebouncedContent] = useState('');
  const [preset, setPreset] = useState(0);
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(4);
  const [errorLevel, setErrorLevel] = useState('M');
  const [dark, setDark] = useState('#0a0f1e');
  const [light, setLight] = useState('#ffffff');
  const [rendering, setRendering] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [logoUrl, setLogoUrl] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const canvasRef = useRef(null);
  const logoImgRef = useRef(null);
  const lastPayloadRef = useRef('');

  useEffect(() => {
    applySeoMeta({ title: 'Générateur QR Code — Admin Eza', description: 'Créez des QR codes pour tout usage' });
  }, []);

  // Debounce live preview
  useEffect(() => {
    const t = setTimeout(() => setDebouncedContent(content), 220);
    return () => clearTimeout(t);
  }, [content]);

  // Persist history
  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
  }, [history]);

  // Preload logo image
  useEffect(() => {
    if (!logoUrl) { logoImgRef.current = null; return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { logoImgRef.current = img; };
    img.onerror = () => { logoImgRef.current = null; };
    img.src = logoUrl;
  }, [logoUrl]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingEvents(true);
        const evs = await base44.entities.Event.list('-start_date', 50);
        setEvents(evs || []);
      } catch { setEvents([]); }
      finally { setLoadingEvents(false); }
    })();
  }, []);

  const buildPayload = useCallback(() => {
    const raw = debouncedContent.trim();
    if (!raw) return '';
    const p = PRESETS[preset];
    if (p.prefix && !raw.toLowerCase().startsWith(p.prefix.toLowerCase())) {
      return p.prefix + raw;
    }
    if (preset === 0 && !/^(https?:|mailto:|tel:|sms:)/i.test(raw)) {
      return 'https://' + raw;
    }
    return raw;
  }, [debouncedContent, preset]);

  const render = useCallback(async () => {
    const payload = buildPayload();
    if (!payload) {
      const c = canvasRef.current;
      if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); }
      lastPayloadRef.current = '';
      return;
    }
    setRendering(true);
    try {
      await QRCode.toCanvas(canvasRef.current, payload, {
        width: size,
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark, light },
      });
      // Logo overlay
      const img = logoImgRef.current;
      const c = canvasRef.current;
      if (img && c) {
        const ctx = c.getContext('2d');
        const logoSize = Math.round(c.width * 0.22);
        const x = (c.width - logoSize) / 2;
        const y = (c.height - logoSize) / 2;
        const pad = Math.round(logoSize * 0.08);
        ctx.fillStyle = light;
        ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
        ctx.drawImage(img, x, y, logoSize, logoSize);
      }
      lastPayloadRef.current = payload;
    } catch (e) {
      toast.error('QR code impossible à générer pour ce contenu');
    } finally {
      setRendering(false);
    }
  }, [buildPayload, size, margin, errorLevel, dark, light, logoUrl]);

  useEffect(() => { render(); }, [render]);

  // Format validation
  const validation = useMemo(() => {
    const raw = debouncedContent.trim();
    const p = PRESETS[preset];
    if (!raw || !p.validate) return null;
    // strip prefix for validation
    const val = p.prefix ? raw.replace(new RegExp('^' + p.prefix, 'i'), '') : raw;
    return p.validate(val);
  }, [debouncedContent, preset]);

  // Contrast warning
  const lowContrast = useMemo(() => {
    const diff = Math.abs(luminance(dark) - luminance(light));
    return diff < 0.35;
  }, [dark, light]);

  const downloadPng = () => {
    const c = canvasRef.current;
    if (!c || !lastPayloadRef.current) { toast.error('Rien à télécharger'); return; }
    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${smartFilename(lastPayloadRef.current, preset)}.png`;
    a.click();
    setHistory((h) => [{ payload: lastPayloadRef.current, preset, at: fmtNow(), size }, ...h].slice(0, HISTORY_MAX));
    toast.success('QR code téléchargé (PNG)');
  };

  const downloadSvg = async () => {
    if (!lastPayloadRef.current) { toast.error('Rien à télécharger'); return; }
    try {
      const svg = await QRCode.toString(lastPayloadRef.current, {
        type: 'svg',
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark, light },
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${smartFilename(lastPayloadRef.current, preset)}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setHistory((h) => [{ payload: lastPayloadRef.current, preset, at: fmtNow(), size }, ...h].slice(0, HISTORY_MAX));
      toast.success('QR code téléchargé (SVG)');
    } catch {
      toast.error('Génération SVG impossible');
    }
  };

  const copyPayload = async () => {
    if (!lastPayloadRef.current) return;
    try { await navigator.clipboard.writeText(lastPayloadRef.current); toast.success('Contenu copié'); }
    catch { toast.error('Copie impossible'); }
  };

  const clearAll = () => {
    setContent('');
    setLogoUrl(null);
    lastPayloadRef.current = '';
    render();
  };

  const applyPreset = (idx) => {
    setPreset(idx);
    if (!content) setContent(PRESETS[idx].placeholder === 'https://eza.group' ? 'https://eza.group' : '');
  };

  const onLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(URL.createObjectURL(file));
    toast.success('Logo ajouté au centre');
  };

  const reloadFromHistory = (h) => {
    setPreset(h.preset ?? 0);
    setContent(h.payload);
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    toast.success('Historique effacé');
  };

  const linkEvent = (evId) => {
    const ev = events.find((e) => e.id === evId);
    if (!ev) return;
    const url = `${window.location.origin}/events/${ev.id}`;
    setPreset(0);
    setContent(url);
    toast.success(`Lien de l'événement chargé : ${ev.title}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-violet-400/15 border border-violet-400/30 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="font-grotesk text-2xl font-black">Générateur QR Code</h1>
            <p className="text-sm text-muted-foreground">Créez et téléchargez des QR codes pour tout et n'importe quoi</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* LEFT — Inputs */}
        <div className="space-y-4">
          {/* Preset chips */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-grotesk font-bold mb-2 text-muted-foreground">Type de contenu</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => {
                const Icon = p.icon;
                const active = i === preset;
                return (
                  <button key={p.label} onClick={() => applyPreset(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter transition-all border ${
                      active ? 'bg-violet-500/15 border-violet-400/40 text-violet-300'
                             : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/70'
                    }`}>
                    <Icon className="w-3.5 h-3.5" /> {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event linker */}
          {events.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-grotesk font-bold mb-2 text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Lier à un événement Eza
              </p>
              <select
                onChange={(e) => linkEvent(e.target.value)}
                value=""
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-inter focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">— Choisir un événement… —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Content input */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-grotesk font-bold text-muted-foreground">Contenu à encoder</Label>
              {validation !== null && debouncedContent.trim() && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${validation ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                  {validation ? 'Format OK' : 'Format invalide'}
                </span>
              )}
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={PRESETS[preset].placeholder}
              className="min-h-[88px] font-mono text-sm resize-none"
            />
            <p className="text-[10px] text-muted-foreground font-mono">
              {PRESETS[preset].prefix ? `Préfixe auto: ${PRESETS[preset].prefix}` : 'Aucun préfixe'} · {content.length} caractères
            </p>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <p className="text-xs font-grotesk font-bold text-muted-foreground">Options</p>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Taille</Label>
                <span className="text-xs font-mono text-muted-foreground">{size}px</span>
              </div>
              <input type="range" min={128} max={1024} step={32} value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-violet-500" />
            </div>

            {/* Margin presets */}
            <div>
              <Label className="text-xs mb-1 block">Marge (modules)</Label>
              <div className="flex gap-1.5 mb-2">
                {MARGIN_PRESETS.map((m) => (
                  <button key={m.label} onClick={() => setMargin(m.value)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-inter border transition-all ${
                      margin === m.value ? 'bg-violet-500/15 border-violet-400/40 text-violet-300'
                                          : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/70'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
              <input type="range" min={0} max={10} step={1} value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-violet-500" />
            </div>

            {/* Error level */}
            <div>
              <Label className="text-xs mb-1 block">Correction d'erreurs</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {ERROR_LEVELS.map((l) => (
                  <button key={l.value} onClick={() => setErrorLevel(l.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-inter transition-all border ${
                      errorLevel === l.value ? 'bg-violet-500/15 border-violet-400/40 text-violet-300'
                                              : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/70'
                    }`}>
                    <span className="font-mono font-bold">{l.value}</span>
                    <span className="text-[9px] block leading-none mt-0.5">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Couleur modules</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={dark} onChange={(e) => setDark(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border border-border cursor-pointer" />
                  <Input value={dark} onChange={(e) => setDark(e.target.value)} className="font-mono text-xs h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Couleur fond</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={light} onChange={(e) => setLight(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border border-border cursor-pointer" />
                  <Input value={light} onChange={(e) => setLight(e.target.value)} className="font-mono text-xs h-9" />
                </div>
              </div>
            </div>

            {lowContrast && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Contraste faible — le QR peut être illisible par les scanners.
              </div>
            )}

            {/* Logo overlay */}
            <div>
              <Label className="text-xs mb-1 block">Logo au centre (optionnel)</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
                  <span className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground hover:bg-secondary/70 cursor-pointer transition-all">
                    <ImageIcon className="w-3.5 h-3.5" /> {logoUrl ? 'Changer le logo' : 'Importer une image'}
                  </span>
                </label>
                {logoUrl && (
                  <Button variant="outline" size="sm" onClick={() => { URL.revokeObjectURL(logoUrl); setLogoUrl(null); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              {logoUrl && (
                <p className="text-[10px] text-muted-foreground mt-1">Astuce : utilisez un logo carré transparent pour un meilleur rendu.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-grotesk font-bold text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Aperçu
              </p>
              <button onClick={render} className="text-muted-foreground hover:text-foreground transition-colors" title="Rafraîchir">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative flex flex-col items-center justify-center min-h-[320px] rounded-xl bg-secondary/30 border border-border/50 p-4">
              {rendering && (
                <div className="absolute flex flex-col items-center gap-2 text-muted-foreground z-10">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Génération…</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className={`max-w-full rounded-lg ${!lastPayloadRef.current ? 'opacity-30' : ''}`}
                style={{ imageRendering: 'pixelated', display: debouncedContent ? 'block' : 'none' }}
              />
              {!debouncedContent && (
                <div className="text-center py-10">
                  <QrCode className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Saisissez un contenu à encoder</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              <Button onClick={downloadPng} disabled={!debouncedContent || rendering} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                <Download className="w-4 h-4" /> PNG
              </Button>
              <Button onClick={downloadSvg} disabled={!debouncedContent || rendering} variant="outline">
                <FileCode className="w-4 h-4" /> SVG
              </Button>
              <Button onClick={copyPayload} variant="outline" disabled={!debouncedContent}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={clearAll} variant="outline">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {lastPayloadRef.current && (
              <p className="mt-2 text-[10px] font-mono text-muted-foreground break-all bg-secondary/40 rounded-lg px-2.5 py-1.5">
                {lastPayloadRef.current}
              </p>
            )}
          </div>

          {/* History */}
          <div className="rounded-2xl border border-border bg-card">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-muted-foreground" />
                <p className="font-grotesk font-bold text-sm">Récents ({history.length})</p>
              </div>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Vider
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">Aucun QR récent — persistant entre les sessions.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-border">
                {history.map((h, i) => (
                  <div key={i} className="px-4 py-2 flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <p className="text-xs truncate flex-1 font-mono">{h.payload}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{h.at} · {h.size}px</span>
                    <button onClick={() => reloadFromHistory(h)} className="text-muted-foreground hover:text-violet-400 transition-colors flex-shrink-0" title="Recharger dans l'éditeur">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}