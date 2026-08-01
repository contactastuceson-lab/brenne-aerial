import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Calendar, MapPin, Clock, Coins, Download, Ticket, User, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

function shortId(id) {
  if (!id) return '—';
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default function EventTicketModal({ open, onClose, registration, event, user, variant = 'confirmation' }) {
  const [qrUrl, setQrUrl] = useState(null);

  const evTitle = registration?.event_title || event?.title || '';
  const evDate = registration?.event_start_date || event?.start_date || '';
  const evCity = registration?.event_city || event?.city || '';
  const evImage = registration?.event_image_url || event?.image_url || '';
  const credits = registration?.credits_paid ?? event?.price_credits ?? 0;
  const regId = registration?.id || '';
  const ticketCode = shortId(regId);

  useEffect(() => {
    if (!open || !regId) return;
    const payload = JSON.stringify({
      eza: 'event_ticket',
      reg: regId,
      event: registration?.event_id || event?.id || '',
      user: user?.email || user?.id || '',
    });
    QRCode.toDataURL(payload, { margin: 1, width: 320, color: { dark: '#0a0f1a', light: '#ffffff' } })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [open, regId, registration, event, user]);

  const downloadTicket = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `billet-eza-${ticketCode}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Billet d'événement</DialogTitle>
          <DialogDescription>Confirmation d'inscription</DialogDescription>
        </DialogHeader>

        {/* Confirmation banner */}
        {variant === 'confirmation' && (
          <div className="flex flex-col items-center text-center pt-2 pb-1">
            <div className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="font-grotesk text-xl font-black">Inscription confirmée !</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {credits > 0 ? `${credits} crédits Eza débités` : 'Événement gratuit'}
            </p>
          </div>
        )}

        {/* Ticket card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex gap-3 p-4 border-b border-dashed border-border">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
              {evImage
                ? <img src={evImage} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Calendar className="w-7 h-7 text-muted-foreground/40" /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-grotesk font-black text-sm leading-tight truncate">{evTitle}</p>
              <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <p className="inline-flex items-center gap-1 w-full"><Calendar className="w-3 h-3 flex-shrink-0" /> {fmtDate(evDate)}</p>
                {evCity && <p className="inline-flex items-center gap-1 w-full"><MapPin className="w-3 h-3 flex-shrink-0" /> {evCity}</p>}
              </div>
            </div>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center py-4 px-4 bg-background">
            <div className="w-44 h-44 rounded-xl bg-white p-2 flex items-center justify-center">
              {qrUrl
                ? <img src={qrUrl} alt="QR billet" className="w-full h-full" />
                : <div className="w-full h-full rounded bg-muted animate-pulse" />}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-sm font-bold tracking-wider">EZA-{ticketCode}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1 px-4">
              Présentez ce QR à l'entrée pour faire valider votre billet
            </p>
          </div>

          {/* Holder */}
          <div className="px-4 py-2.5 border-t border-dashed border-border flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground"><User className="w-3 h-3" /> {user?.full_name || user?.username || '—'}</span>
            <span className="inline-flex items-center gap-1 font-grotesk font-bold text-amber-400"><Coins className="w-3 h-3" /> {credits > 0 ? `${credits} crédits` : 'Gratuit'}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-xl bg-secondary/40 border border-border p-3 text-xs text-muted-foreground">
          <p className="font-grotesk font-bold text-foreground flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-primary" /> Retrouvez votre billet
          </p>
          <p>
            Rendez-vous dans votre <Link to="/espace" className="text-primary font-bold underline">Espace Utilisateur</Link>{' '}
            → onglet <span className="font-bold text-foreground">« Mes événements »</span> pour revoir votre billet,
            le télécharger ou demander une annulation.
          </p>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" size="sm" onClick={downloadTicket} disabled={!qrUrl}>
            <Download className="w-4 h-4" /> Télécharger le QR
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
            <Button asChild size="sm">
              <Link to="/espace"><ArrowRight className="w-4 h-4" /> Mon espace</Link>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}