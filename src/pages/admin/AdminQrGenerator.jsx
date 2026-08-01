import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import {
  QrCode, Download, Copy, Trash2, Link2, Type, Image as ImageIcon,
  Loader2, Sparkles, RefreshCw, ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { applySeoMeta } from '@/lib/seo';

const PRESETS = [
  { label: 'URL / Lien', icon: Link2, placeholder: 'https://eza.group', prefix: '' },
  { label: 'Texte libre', icon: Type, placeholder: 'Votre texte…', prefix: '' },
  { label: 'Email', icon: Sparkles, placeholder: 'contact@eza.group', prefix: 'mailto:' },
  { label: 'Téléphone', icon: ScanLine, placeholder: '+33 6 12 34 56 78', prefix: 'tel:' },
  { label: 'SMS', icon: ScanLine, placeholder: '+33612345678&body=Bonjour', prefix: 'sms:' },
  { label: 'Wi-Fi', icon: ScanLine, placeholder: 'WIFI:T:WPA;S:MonWifi;P:MonMotDePasse;;', prefix: '' },
];

const ERROR_LEVELS = [
  { value: 'L', label: 'Bas (~7%)' },
  { value: 'M', label: 'Moyen (~15%)' },
  { value: 'Q', label: 'Élevé (~25%)' },
  { value: 'H', label: 'Max (~30%)' },
];

function fmtNow() {
  return new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminQrGenerator() {
  const [content, setContent] = useState('');
  const [preset, setPreset] = useState(0);
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [errorLevel, setErrorLevel] = useState('M');
  const [dark, setDark] = useState('#0a0f1e');
  const [light, setLight] = useState('#ffffff');
  const [rendering, setRendering] = useState(false);
  const [history, setHistory] = useState([]);

  const canvasRef = useRef(null);
  const lastContentRef = useRef('');

  useEffect(() => {
    applySeoMeta({ title: 'Générateur QR Code — Admin Eza', description: 'Créez des QR codes pour tout usage' });
  }, []);

  const buildPayload = useCallback(() => {
    const raw = content.trim();
    if (!raw) return '';
    const p = PRESETS[preset];
    if (p.prefix && !raw.toLowerCase().startsWith(p.prefix.toLowerCase())) {
      return p.prefix + raw;
    }
    return raw;
  }, [content, preset]);

  const render = useCallback(async () => {
    const payload = buildPayload();
    if (!payload) {
      const c = canvasRef.current;
      if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); }
      lastContentRef.current = '';
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
      lastContentRef.current = payload;
    } catch (e) {
      toast.error('QR code impossible à générer pour ce contenu');
    } finally {
      setRendering(false);
    }
  }, [buildPayload, size, margin, errorLevel, dark, light]);

  useEffect(() => { render(); }, [render]);

  const downloadPng = () => {
    const c = canvasRef.current;
    if (!c || !lastContentRef.current) { toast.error('Rien à télécharger'); return; }
    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-eza-${Date.now()}.png`;
    a.click();
    setHistory(h => [{ payload: lastContentRef.current, at: fmtNow(), size }, ...h].slice(0, 12));
    toast.success('QR code téléchargé');
  };

  const copyPayload = async () => {
    if (!lastContentRef.current) return;
    try { await navigator.clipboard.writeText(lastContentRef.current); toast.success('Contenu copié'); }
    catch { toast.error('Copie impossible'); }
  };

  const clearAll = () => {
    setContent('');
    lastContentRef.current = '';
    render();
  };

  const applyPreset = (idx) => {
    setPreset(idx);
    if (!content) setContent(PRESETS[idx].placeholder === 'https://eza.group' ? 'https://eza.group' : '');
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

          {/* Content input */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <Label className="text-xs font-grotesk font-bold text-muted-foreground">Contenu à encoder</Label>
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

            {/* Margin */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Marge (modules)</Label>
                <span className="text-xs font-mono text-muted-foreground">{margin}</span>
              </div>
              <input type="range" min={0} max={10} step={1} value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-violet-500" />
            </div>

            {/* Error level */}
            <div>
              <Label className="text-xs mb-1 block">Correction d'erreurs</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {ERROR_LEVELS.map(l => (
                  <button key={l.value} onClick={() => setErrorLevel(l.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-inter transition-all border ${
                      errorLevel === l.value ? 'bg-violet-500/15 border-violet-400/40 text-violet-300'
                                              : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/70'
                    }`}>
                    <span className="font-mono font-bold mr-0.5">{l.value}</span>
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

            <div className="flex flex-col items-center justify-center min-h-[320px] rounded-xl bg-secondary/30 border border-border/50 p-4">
              {rendering && (
                <div className="absolute flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Génération…</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className={`max-w-full rounded-lg ${!lastContentRef.current ? 'opacity-30' : ''}`}
                style={{ imageRendering: 'pixelated', display: content ? 'block' : 'none' }}
              />
              {!content && (
                <div className="text-center py-10">
                  <QrCode className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Saisissez un contenu à encoder</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Button onClick={downloadPng} disabled={!content || rendering} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                <Download className="w-4 h-4" /> Télécharger PNG
              </Button>
              <Button onClick={copyPayload} variant="outline" disabled={!content}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={clearAll} variant="outline">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {lastContentRef.current && (
              <p className="mt-2 text-[10px] font-mono text-muted-foreground break-all bg-secondary/40 rounded-lg px-2.5 py-1.5">
                {lastContentRef.current}
              </p>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="rounded-2xl border border-border bg-card">
              <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-muted-foreground" />
                <p className="font-grotesk font-bold text-sm">Récents ({history.length})</p>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-border">
                {history.map((h, i) => (
                  <div key={i} className="px-4 py-2 flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <p className="text-xs truncate flex-1 font-mono">{h.payload}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{h.at} · {h.size}px</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}