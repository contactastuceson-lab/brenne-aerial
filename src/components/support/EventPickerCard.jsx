import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Loader2, Zap, Lock, Users, Ticket as TicketIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// Sélecteur d'événement affiché dans le ticket support quand l'utilisateur
// veut s'inscrire : liste les événements à venir, vérifie le solde pour les
// événements payants (refus si solde insuffisant), et crée une action
// pending register_event que l'utilisateur confirme ensuite.

export default function EventPickerCard({ ticket, onDone }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const now = Date.now();
        const list = await base44.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        const active = (list || []).filter((e) => e.status !== 'cancelled' && e.status !== 'ended' && (!e.end_date || new Date(e.end_date).getTime() >= now) && (!e.capacity || (e.attendees_count || 0) < e.capacity));
        if (alive) setEvents(active || []);
      } catch {}
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  // Masquer si une action est déjà en attente (PendingActionCard s'en occupe)
  if (ticket?.pending_action?.status === 'pending') return null;

  const balance = Number(user?.referral_credits || 0);

  const pick = async (e) => {
    setBusy(true);
    try {
      const price = Number(e.price_credits || 0);
      await base44.entities.SupportTicket.update(ticket.id, {
        pending_action: {
          type: 'register_event',
          label: `Inscrire à « ${e.title} »`,
          needs_confirmation: true,
          params: { event_id: e.id, event_title: e.title, credits: price },
          status: 'pending',
          proposed_at: new Date().toISOString(),
        },
      });
      onDone?.();
    } catch {}
    setBusy(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Inscription événement</span>
          <p className="text-sm font-medium">Choisissez un événement</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-amber-300" /> {balance} crédits
        </span>
      </div>

      {loading ? (
        <div className="py-5 text-center"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">Aucun événement à venir disponible.</p>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto -mr-1 pr-1">
          {events.slice(0, 12).map((e) => {
            const price = Number(e.price_credits || 0);
            const insufficient = price > 0 && balance < price;
            const full = e.capacity > 0 && (e.attendees_count || 0) >= e.capacity;
            const disabled = insufficient || full || busy;
            return (
              <div key={e.id}
                className={`rounded-xl border p-2.5 flex items-center gap-2.5 transition-colors ${
                  disabled ? 'border-border opacity-60' : 'border-border hover:border-primary/40 bg-secondary/30 cursor-pointer'
                }`}>
                {e.image_url ? (
                  <img src={e.image_url} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span>{e.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '?'}</span>
                    {e.city && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{e.city}</span>}
                    <span className={price > 0 ? 'text-amber-300 font-medium' : 'text-green-400'}>
                      {price > 0 ? `${price} crédits` : 'Gratuit'}
                    </span>
                    {e.capacity > 0 && <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{e.attendees_count || 0}/{e.capacity}</span>}
                  </p>
                  {insufficient && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                      <Lock className="w-3 h-3" /> Solde insuffisant ({balance}/{price})
                    </p>
                  )}
                  {full && <p className="text-[11px] text-amber-400 mt-1">Complet</p>}
                </div>
                <button onClick={() => pick(e)} disabled={disabled}
                  className="h-8 px-3 rounded-lg text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(205 90% 50%), hsl(195 80% 45%))' }}>
                  <TicketIcon className="w-3.5 h-3.5" /> S'inscrire
                </button>
              </div>
            );
          })}
        </div>
      )}
      {events.length > 0 && !loading && (
        <p className="text-[10px] text-muted-foreground/70 mt-2 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" /> Les événements payants débitent vos crédits Eza à la confirmation.
        </p>
      )}
    </motion.div>
  );
}