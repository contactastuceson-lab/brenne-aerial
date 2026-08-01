import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import jsQR from 'jsqr';
import { toast } from 'sonner';
import {
  QrCode, Camera, CameraOff, ScanLine, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Calendar, MapPin, User as UserIcon, Ticket, RefreshCw, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}
function shortId(id) { return (id || '').replace(/-/g, '').slice(0, 8).toUpperCase(); }

export default function AdminScanTickets() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, checked: 0 });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const activeRef = useRef(false);
  const cooldownRef = useRef(0);
  const selectedEventRef = useRef('');

  useEffect(() => { selectedEventRef.current = selectedEventId; }, [selectedEventId]);

  useEffect(() => {
    (async () => {
      try {
        const evs = await base44.entities.Event.list('-start_date', 100);
        setEvents(evs || []);
      } catch { toast.error('Erreur chargement événements'); }
      finally { setLoadingEvents(false); }
    })();
  }, []);

  const refreshStats = useCallback(async () => {
    if (!selectedEventId) { setStats({ total: 0, checked: 0 }); return; }
    try {
      const regs = await base44.entities.EventRegistration.filter(
        { event_id: selectedEventId, status: 'registered' }, '-created_date', 500
      );
      const arr = regs || [];
      setStats({ total: arr.length, checked: arr.filter(r => r.checked_in).length });
    } catch { setStats({ total: 0, checked: 0 }); }
  }, [selectedEventId]);

  useEffect(() => { refreshStats(); }, [refreshStats, history]);

  const validate = useCallback(async (payload) => {
    setValidating(true);
    try {
      const res = await base44.functions.invoke('validateEventTicket', {
        ...payload,
        event_id: selectedEventRef.current || undefined,
      });
      setLastResult(res);
      if (res?.ok) {
        toast.success(`Billet validé — ${res.registration?.user_name || 'Participant'}`);
        setHistory(h => [{ ok: true, reg: res.registration, at: new Date().toISOString() }, ...h].slice(0, 25));
      } else if (res?.already) {
        toast.warning(`Déjà validé — ${res.registration?.user_name || ''}`);
        setHistory(h => [{ ok: false, reg: res.registration, at: new Date().toISOString(), error: res.error }, ...h].slice(0, 25));
      } else {
        toast.error(res?.error || 'Billet invalide');
        if (res?.registration) {
          setHistory(h => [{ ok: false, reg: res.registration, at: new Date().toISOString(), error: res.error }, ...h].slice(0, 25));
        }
      }
      return res;
    } catch (e) {
      const msg = e?.message || 'Erreur validation';
      setLastResult({ ok: false, error: msg });
      toast.error(msg);
      return { ok: false, error: msg };
    } finally { setValidating(false); }
  }, []);

  const handleDecoded = useCallback((data) => {
    let payload = {};
    try { payload = JSON.parse(data); } catch { payload = null; }
    if (payload && payload.reg) {
      validate({ reg_id: payload.reg });
    } else if (typeof data === 'string' && /^EZA-/i.test(data.trim())) {
      validate({ ticket_code: data.trim() });
    } else if (data) {
      validate({ reg_id: data.trim() });
    }
  }, [validate]);

  const stopCamera = useCallback(() => {
    activeRef.current = false;
    setCameraOn(false);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
      activeRef.current = true;
      cooldownRef.current = 0;
      const tick = () => {
        if (!activeRef.current) return;
        const v = videoRef.current, c = canvasRef.current;
        if (v && c && v.readyState >= 2 && v.videoWidth) {
          const w = v.videoWidth, h = v.videoHeight;
          c.width = w; c.height = h;
          const ctx = c.getContext('2d');
          ctx.drawImage(v, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
          if (code && code.data) {
            const now = Date.now();
            if (now - cooldownRef.current > 2500) {
              cooldownRef.current = now;
              try { if (navigator.vibrate) navigator.vibrate(60); } catch {}
              handleDecoded(code.data);
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      toast.error('Caméra inaccessible sur cet appareil');
      setCameraOn(false);
    }
  }, [handleDecoded]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleManual = () => {
    const code = manualCode.trim();
    if (!code) return;
    if (/^EZA-/i.test(code) || code.length <= 12) validate({ ticket_code: code });
    else validate({ reg_id: code });
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-orange-400/15 border border-orange-400/30 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="font-grotesk text-2xl font-black">Scanner de billets</h1>
            <p className="text-sm text-muted-foreground">Validez les entrées des participants en scannant leur QR</p>
          </div>
        </div>
      </div>

      {/* Event selector */}
      <div className="mb-5 rounded-2xl border border-border bg-card p-4">
        <label className="flex items-center gap-2 text-xs font-grotesk font-bold mb-2 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" /> Événement scanné
        </label>
        {loadingEvents ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
        ) : (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-inter focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">— Tous les événements (non recommandé) —</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} — {fmtDate(ev.start_date)}</option>
            ))}
          </select>
        )}
        {selectedEvent && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-secondary/50 p-2.5 text-center">
              <p className="font-grotesk text-xl font-black text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">inscrits</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-center">
              <p className="font-grotesk text-xl font-black text-emerald-400">{stats.checked}</p>
              <p className="text-[10px] text-muted-foreground">validés</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-2.5 text-center">
              <p className="font-grotesk text-xl font-black text-amber-400">{Math.max(0, stats.total - stats.checked)}</p>
              <p className="text-[10px] text-muted-foreground">restants</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera */}
      <div className="mb-5 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center">
          <video ref={videoRef} playsInline muted className={`max-w-full max-h-full ${cameraOn ? 'block' : 'hidden'}`} />
          <canvas ref={canvasRef} className="hidden" />
          {!cameraOn && (
            <div className="text-center px-6">
              <QrCode className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Caméra éteinte</p>
            </div>
          )}
          {cameraOn && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-orange-400/80 rounded-2xl shadow-[0_0_40px_rgba(251,146,60,0.3)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-0.5 bg-orange-400/60 scan-line" />
              </div>
            </div>
          )}
        </div>
        <div className="p-3 flex gap-2">
          {!cameraOn ? (
            <Button onClick={startCamera} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              <Camera className="w-4 h-4" /> Démarrer la caméra
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive" className="flex-1">
              <CameraOff className="w-4 h-4" /> Arrêter
            </Button>
          )}
          <Button variant="outline" onClick={refreshStats} disabled={!selectedEventId}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Manual entry */}
      <div className="mb-5 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-grotesk font-bold mb-2 text-muted-foreground flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" /> Saisie manuelle
        </p>
        <div className="flex gap-2">
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManual()}
            placeholder="EZA-AB12CD34 ou n° d'inscription"
            className="font-mono uppercase"
          />
          <Button onClick={handleManual} disabled={validating || !manualCode.trim()}>
            {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Valider
          </Button>
        </div>
      </div>

      {/* Last result */}
      {lastResult && (
        <div className={`mb-5 rounded-2xl border p-4 ${lastResult.ok ? 'border-emerald-500/40 bg-emerald-500/10' : lastResult.already ? 'border-amber-500/40 bg-amber-500/10' : 'border-red-500/40 bg-red-500/10'}`}>
          <div className="flex items-start gap-3">
            {lastResult.ok
              ? <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
              : lastResult.already
              ? <AlertTriangle className="w-7 h-7 text-amber-400 flex-shrink-0" />
              : <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />}
            <div className="min-w-0 flex-1">
              {lastResult.registration ? (
                <>
                  <p className="font-grotesk font-bold">{lastResult.registration.user_name || 'Participant'}</p>
                  <p className="text-xs text-muted-foreground">@{lastResult.registration.user_username || '—'}</p>
                  <p className="text-sm mt-1">{lastResult.registration.event_title}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {lastResult.registration.event_city || '—'}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(lastResult.registration.event_start_date)}</span>
                    <span className="inline-flex items-center gap-1 font-mono"><Ticket className="w-3 h-3" /> EZA-{shortId(lastResult.registration.id)}</span>
                    {lastResult.registration.checked_in_at && (
                      <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Validé {fmtDate(lastResult.registration.checked_in_at)}</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm">{lastResult.error || 'Billet invalide'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-muted-foreground" />
            <p className="font-grotesk font-bold text-sm">Scans récents ({history.length})</p>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {history.map((h, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                {h.ok
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{h.reg?.user_name || h.error || 'Inconnu'}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">EZA-{shortId(h.reg?.id || '')}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtDate(h.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}