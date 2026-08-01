import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Calendar, MapPin, Clock, Coins, Loader2, RefreshCw, Ticket, CalendarX,
  AlertTriangle, Send, Hourglass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import EventTicketModal from '@/components/events/EventTicketModal';
import { QrCode as QrIcon } from 'lucide-react';

const STATUS = {
  registered: { label: 'Inscrit', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  cancelled:  { label: 'Annulé', color: 'text-muted-foreground bg-muted/40 border-border' },
  refunded:   { label: 'Remboursé', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
};

const CANCEL_REQ = {
  none: null,
  pending: { label: 'Demande en attente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  approved: { label: 'Annulation approuvée', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  rejected: { label: 'Demande refusée', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

export default function MyEventsTab({ user }) {
  const qc = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState(null);
  const [ticketTarget, setTicketTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: regs = [], isLoading } = useQuery({
    queryKey: ['my-event-registrations', user?.id],
    queryFn: () => base44.entities.EventRegistration.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const upcoming = useMemo(() => {
    const now = Date.now();
    return regs.filter(r => r.status === 'registered' && r.event_start_date && new Date(r.event_start_date).getTime() >= now);
  }, [regs]);

  const past = useMemo(() => regs.filter(r => !upcoming.includes(r)), [regs, upcoming]);

  const openCancel = (reg) => { setCancelTarget(reg); setReason(''); };
  const submitCancel = async () => {
    if (!reason.trim()) { toast.error('Veuillez indiquer le motif de votre demande'); return; }
    setSubmitting(true);
    try {
      await base44.functions.invoke('cancelMyEventRegistration', {
        registration_id: cancelTarget.id, reason: reason.trim(),
      });
      toast.success('Demande d\'annulation envoyée — un administrateur l\'examinera');
      qc.invalidateQueries({ queryKey: ['my-event-registrations', user?.id] });
      setCancelTarget(null);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Envoi échoué');
    }
    setSubmitting(false);
  };

  const renderCard = (reg) => {
    const s = STATUS[reg.status] || STATUS.registered;
    const creq = CANCEL_REQ[reg.cancel_request_status];
    return (
      <div key={reg.id} className="rounded-2xl border border-border bg-card p-4 flex gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
          {reg.event_image_url
            ? <img src={reg.event_image_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Calendar className="w-6 h-6 text-muted-foreground/40" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/events/${reg.event_id}`} className="font-grotesk font-bold text-sm hover:text-primary transition-colors truncate">
              {reg.event_title}
            </Link>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${s.color} flex-shrink-0`}>{s.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fmtDate(reg.event_start_date)}</span>
            {reg.event_city && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {reg.event_city}</span>}
            {reg.credits_paid > 0 ? (
              <span className="inline-flex items-center gap-1 font-grotesk font-bold text-amber-400">
                <Coins className="w-3.5 h-3.5" /> {reg.credits_paid} crédits
              </span>
            ) : (
              <span className="inline-flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Gratuit</span>
            )}
          </div>

          {reg.status === 'registered' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="default" onClick={() => setTicketTarget(reg)}
                className="font-grotesk font-bold">
                <QrIcon className="w-3.5 h-3.5" /> Voir mon billet
              </Button>
              {creq ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-grotesk font-bold border ${creq.color}`}>
                  <Hourglass className="w-3.5 h-3.5" /> {creq.label}
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => openCancel(reg)}
                  className="text-muted-foreground hover:text-red-400 hover:border-red-400/30">
                  <AlertTriangle className="w-3.5 h-3.5" /> Demander l'annulation
                </Button>
              )}
              {reg.cancel_request_status === 'rejected' && reg.cancel_decision_note && (
                <p className="text-xs text-muted-foreground">Motif refus : {reg.cancel_decision_note}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (regs.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-3 border border-border">
          <CalendarX className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="font-grotesk font-bold text-sm">Aucune inscription</p>
        <p className="font-inter text-xs text-muted-foreground mt-1 mb-4">Découvrez les événements EZA et réservez votre place.</p>
        <Link to="/events" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
          <Calendar className="w-4 h-4" /> Voir les événements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="font-grotesk font-bold text-sm">Mes inscriptions ({regs.length})</p>
        <Button variant="ghost" size="sm"
          onClick={() => qc.invalidateQueries({ queryKey: ['my-event-registrations', user?.id] })}>
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </Button>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> À venir ({upcoming.length})
          </p>
          {upcoming.map(renderCard)}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Historique ({past.length})
          </p>
          {past.map(renderCard)}
        </div>
      )}

      {/* Dialog demande d'annulation */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => { if (!o) setCancelTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400" /> Demande d'annulation</DialogTitle>
            <DialogDescription>
              Votre demande sera examinée par un administrateur. {cancelTarget?.credits_paid > 0
                ? `Si elle est approuvée, vos ${cancelTarget.credits_paid} crédits Eza vous seront rendus.`
                : 'Vous serez notifié de la décision par email.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label>Motif de l'annulation *</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
              placeholder="Expliquez pourquoi vous souhaitez annuler votre inscription…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={submitting}>Fermer</Button>
            <Button onClick={submitCancel} disabled={submitting || !reason.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ticketTarget && (
        <EventTicketModal
          open={!!ticketTarget}
          onClose={() => setTicketTarget(null)}
          registration={ticketTarget}
          event={{ id: ticketTarget.event_id, title: ticketTarget.event_title, start_date: ticketTarget.event_start_date, city: ticketTarget.event_city, image_url: ticketTarget.event_image_url }}
          user={user}
          variant="view"
        />
      )}
    </div>
  );
}