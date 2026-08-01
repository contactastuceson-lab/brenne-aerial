import { useEffect, useRef, useState } from 'react';
import { Loader2, Camera, X, SwitchCamera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Capture photo en direct via getUserMedia (façon Appareil photo Instagram).
export default function CameraCapture({ onCaptured, onClose }) {
  const vref = useRef(null);
  const sref = useRef(null);
  const [facing, setFacing] = useState('user');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let stream;
    let active = true;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        sref.current = stream;
        if (vref.current) vref.current.srcObject = stream;
        await vref.current?.play?.().catch(() => {});
      } catch { setErr('Caméra inaccessible. Autorisez l\'accès ou utilisez la galerie.'); }
    })();
    return () => { active = false; stream?.getTracks().forEach((t) => t.stop()); };
  }, [facing]);

  const snap = () => {
    const v = vref.current;
    if (!v || !v.videoWidth) return;
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, v.videoWidth);
    canvas.height = Math.max(2, v.videoHeight);
    const ctx = canvas.getContext('2d');
    if (facing === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) { setBusy(false); return; }
      try {
        const file = new File([blob], 'story.jpg', { type: 'image/jpeg' });
        const res = await base44.integrations.Core.UploadFile({ file });
        const url = res?.file_url || res?.data?.file_url;
        onCaptured({ url, preview: URL.createObjectURL(blob), type: 'image' });
      } catch { toast.error('Upload échoué'); }
      setBusy(false);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      {err ? (
        <div className="text-center px-6">
          <p className="text-sm text-white/80 mb-4">{err}</p>
          <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/10 text-white font-grotesk font-bold text-sm">Retour</button>
        </div>
      ) : (
        <>
          <video
            ref={vref}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
            style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          {/* Overlay guider */}
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
          <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          >
            <SwitchCamera className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={snap}
            disabled={busy}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-95 transition"
          >
            {busy ? <Loader2 className="w-7 h-7 animate-spin text-white" /> : <Camera className="w-8 h-8 text-white" />}
          </button>
        </>
      )}
    </div>
  );
}