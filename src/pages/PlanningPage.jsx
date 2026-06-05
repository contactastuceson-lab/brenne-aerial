import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, addDays, startOfToday, startOfWeek, addWeeks, isSameDay, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Check,
  Loader2, MapPin, Zap, Info, X, ArrowRight, Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SchedulerChat from '@/components/planning/SchedulerChat';

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement',
  inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier',
  captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise',
  retour_temps_reel: 'Retour temps réel',
  autre: 'Autre prestation',
};

export default function PlanningPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_planning_enabled');
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookForm, setBookForm] = useState({ client_name: '', client_email: '', notes: '' });

  const weekStart = startOfWeek(addWeeks(startOfToday(), weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['public-appointments'],
    queryFn: () => base44.entities.Appointment.list('date', 200),
    staleTime: 0,
  });

  const { data: blockedDays = [] } = useQuery({
    queryKey: ['blocked-days-public'],
    queryFn: () => base44.entities.BlockedDay.list('date', 365),
    staleTime: 0,
  });

  const getBlockedStatus = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    const found = blockedDays.find(b => b.date === ds);
    return found ? found.status : null; // 'blocked' | 'unknown' | null
  };

  const bookMutation = useMutation({
    mutationFn: async (appt) => {
      await base44.entities.Appointment.update(appt.id, {
        status: 'scheduled',
        client_name: bookForm.client_name,
        client_email: bookForm.client_email,
        notes: bookForm.notes,
      });
      await base44.functions.invoke('sendQuoteEmail', {
        type: 'appointment_confirmed',
        clientName: bookForm.client_name,
        clientEmail: bookForm.client_email,
        date: format(new Date(appt.date), 'EEEE d MMMM yyyy', { locale: fr }),
        timeStart: appt.time_start,
        timeEnd: appt.time_end || null,
        serviceType: appt.service_type || null,
        location: appt.location || null,
        notes: bookForm.notes || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-appointments'] });
      setBooking(null);
      setBookForm({ client_name: '', client_email: '', notes: '' });
      toast.success('Créneau réservé ! Confirmation envoyée par email.');
    },
  });

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Planning indisponible" message="Le planning et la réservation en ligne sont temporairement désactivés." />;

  const available = appointments.filter(a => a.status === 'confirmed' && !a.client_email && !a.client_name);

  const getSlotsForDay = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    return available.filter(a => a.date === ds);
  };

  const selectedSlots = selectedDay ? getSlotsForDay(selectedDay) : [];

  const totalSlotsThisWeek = days.reduce((acc, d) => acc + getSlotsForDay(d).length, 0);

  return (
    <div className="pt-16 min-h-screen bg-background">

      {/* Hero */}
      <section className="relative py-20 px-5 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs tracking-widest uppercase">
                <Wifi className="w-3 h-3" /> Disponibilités en direct
              </span>
              {totalSlotsThisWeek > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 font-mono text-xs">
                  {totalSlotsThisWeek} créneau{totalSlotsThisWeek > 1 ? 'x' : ''} cette semaine
                </span>
              )}
            </div>
            <h1 className="font-grotesk font-bold text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight">
              Planning &{' '}
              <span className="gradient-text">Réservation</span>
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-xl">
              Consultez nos disponibilités en temps réel et réservez votre créneau de vol directement en ligne.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="px-5 lg:px-10 pb-12">
        <div className="max-w-7xl mx-auto">

          {/* Week Nav */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-6 bg-card border border-border rounded-2xl px-5 py-3"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setWeekOffset(w => w - 1); setSelectedDay(null); }}
              disabled={weekOffset <= 0}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Préc.
            </Button>

            <div className="text-center">
              <p className="font-grotesk font-semibold text-sm">
                {format(weekStart, 'd MMM', { locale: fr })} — {format(days[6], 'd MMM yyyy', { locale: fr })}
              </p>
              {weekOffset === 0 && (
                <p className="font-mono text-xs text-primary mt-0.5">Cette semaine</p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setWeekOffset(w => w + 1); setSelectedDay(null); }}
              className="gap-1.5"
            >
              Suiv. <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 lg:gap-3">
              {days.map((day, idx) => {
                const slots = getSlotsForDay(day);
                const today = isToday(day);
                const past = isPast(day) && !today;
                const selected = selectedDay && isSameDay(day, selectedDay);
                const blockStatus = !past ? getBlockedStatus(day) : null; // 'blocked' | 'unknown' | null
                const isBlocked = blockStatus === 'blocked';
                const isUnknown = blockStatus === 'unknown';
                const hasSlots = slots.length > 0 && !past && !isBlocked && !isUnknown;
                const isClickable = !past && !isBlocked && !isUnknown;

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => isClickable && setSelectedDay(selected ? null : day)}
                    disabled={!isClickable}
                    className={[
                      'relative flex flex-col items-center rounded-2xl border transition-all duration-200 py-4 px-1 lg:px-3 text-center',
                      !isClickable ? 'cursor-not-allowed' : 'cursor-pointer',
                      past ? 'opacity-30 border-border bg-card' :
                      isBlocked ? 'border-red-500/40 bg-red-500/10 opacity-80' :
                      isUnknown ? 'border-gray-500/30 bg-gray-500/5 opacity-70' :
                      selected ? 'border-primary bg-primary/10 sky-glow scale-105' :
                      today ? 'border-primary/40 bg-primary/5 hover:bg-primary/10' :
                      hasSlots ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/50' :
                      'border-border bg-card hover:bg-secondary/40',
                    ].join(' ')}
                  >
                    {today && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-bold uppercase">
                        Auj.
                      </span>
                    )}

                    <p className={`font-grotesk text-[10px] lg:text-xs uppercase tracking-wide mb-1 ${selected || today ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'EEE', { locale: fr })}
                    </p>
                    <p className={`font-grotesk font-bold text-xl lg:text-2xl ${selected || today ? 'text-primary' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </p>

                    <div className="mt-3">
                      {isBlocked ? (
                        <span className="font-mono text-[10px] text-red-400 font-bold">Indispo</span>
                      ) : isUnknown ? (
                        <span className="font-mono text-[10px] text-gray-400">?</span>
                      ) : hasSlots ? (
                        <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-mono text-[10px] text-green-500 font-bold">{slots.length}</span>
                        </span>
                      ) : !past ? (
                        <span className="font-mono text-[10px] text-muted-foreground">—</span>
                      ) : null}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Selected Day Slots Panel */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                key="slots-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-grotesk font-bold text-lg capitalize">
                      {format(selectedDay, 'EEEE d MMMM', { locale: fr })}
                    </h2>
                    <p className="font-inter text-sm text-muted-foreground mt-0.5">
                      {selectedSlots.length > 0
                        ? `${selectedSlots.length} créneau${selectedSlots.length > 1 ? 'x' : ''} disponible${selectedSlots.length > 1 ? 's' : ''}`
                        : 'Aucun créneau disponible ce jour'}
                    </p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedSlots.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-inter text-sm text-muted-foreground">Aucun créneau n'est disponible pour cette date.</p>
                    <p className="font-inter text-xs text-muted-foreground mt-1">Essayez une autre date ou contactez-nous directement.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSlots.map((slot) => (
                      <motion.div
                        key={slot.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setBooking(slot)}
                        className="group relative cursor-pointer rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-sm text-primary">{slot.time_start}</p>
                              {slot.time_end && (
                                <p className="font-mono text-xs text-muted-foreground">→ {slot.time_end}</p>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        {slot.service_type && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-xs font-inter text-muted-foreground">
                            {SERVICE_LABELS[slot.service_type] || slot.service_type}
                          </span>
                        )}

                        {slot.location && (
                          <p className="font-inter text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {slot.location}
                          </p>
                        )}

                        <p className="font-inter text-xs text-primary mt-3 group-hover:underline font-semibold">
                          Réserver ce créneau →
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-5 mt-6 justify-center"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="font-inter text-xs text-muted-foreground">Créneaux disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="font-inter text-xs text-muted-foreground">Indisponible (bloqué)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500/70" />
              <span className="font-inter text-xs text-muted-foreground">Incertain</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-border" />
              <span className="font-inter text-xs text-muted-foreground">Pas de créneau</span>
            </div>
          </motion.div>

          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
          >
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="font-inter text-xs text-muted-foreground leading-relaxed">
              Les créneaux affichés sont confirmés par notre équipe. Après réservation, vous recevrez un email de confirmation.
              Pour toute demande spécifique hors créneaux, utilisez l'assistant IA ci-dessous ou{' '}
              <a href="/contact" className="text-primary hover:underline">contactez-nous directement</a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SchedulerChat */}
      <div className="px-5 lg:px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <SchedulerChat />
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!booking} onOpenChange={() => setBooking(null)}>
        <DialogContent className="bg-card border-border p-0 overflow-hidden max-w-md">
          {booking && (
            <>
              {/* Dialog header */}
              <div className="px-6 pt-6 pb-4 border-b border-border bg-secondary/20">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-grotesk font-bold text-base">Réserver ce créneau</h2>
                    <p className="font-inter text-xs text-muted-foreground">Confirmation immédiate par email</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Slot summary */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-grotesk font-semibold text-sm capitalize">
                      {format(new Date(booking.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="font-mono text-xs text-primary">
                      {booking.time_start}{booking.time_end ? ` → ${booking.time_end}` : ''}
                    </p>
                  </div>
                </div>

                {booking.service_type && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-inter">
                    <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">
                      {SERVICE_LABELS[booking.service_type] || booking.service_type}
                    </span>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-3 pt-1">
                  <Input
                    placeholder="Votre nom complet *"
                    value={bookForm.client_name}
                    onChange={e => setBookForm(p => ({ ...p, client_name: e.target.value }))}
                    className="bg-secondary border-border font-inter"
                  />
                  <Input
                    placeholder="Votre email *"
                    type="email"
                    value={bookForm.client_email}
                    onChange={e => setBookForm(p => ({ ...p, client_email: e.target.value }))}
                    className="bg-secondary border-border font-inter"
                  />
                  <Textarea
                    placeholder="Notes ou précisions (optionnel)"
                    value={bookForm.notes}
                    onChange={e => setBookForm(p => ({ ...p, notes: e.target.value }))}
                    className="bg-secondary border-border font-inter resize-none h-20"
                  />
                </div>

                <Button
                  onClick={() => bookMutation.mutate(booking)}
                  disabled={!bookForm.client_name || !bookForm.client_email || bookMutation.isPending}
                  className="w-full bg-primary text-primary-foreground font-grotesk font-semibold sky-glow h-11"
                >
                  {bookMutation.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Réservation en cours…</>
                    : <><Check className="w-4 h-4 mr-2" /> Confirmer la réservation</>
                  }
                </Button>

                <p className="font-inter text-xs text-center text-muted-foreground">
                  Un email de confirmation sera envoyé à l'adresse renseignée.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}