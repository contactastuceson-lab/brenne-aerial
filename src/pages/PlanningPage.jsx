import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar, Clock, Check,
  Loader2, MapPin, Zap, Info, X, ArrowRight, Wifi
} from 'lucide-react';
import CalendarViewSwitcher from '@/components/planning/CalendarViewSwitcher';
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookForm, setBookForm] = useState({ client_name: '', client_email: '', notes: '' });

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
  const totalAvailable = available.length;

  const getSlotsForDay = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    return available.filter(a => a.date === ds);
  };

  const selectedSlots = selectedDay ? getSlotsForDay(selectedDay) : [];

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
              {totalAvailable > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 font-mono text-xs">
                  {totalAvailable} créneau{totalAvailable > 1 ? 'x' : ''} disponible{totalAvailable > 1 ? 's' : ''}
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

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : (
            <CalendarViewSwitcher
              appointments={appointments}
              blockedDays={blockedDays}
              isAdmin={false}
              onDaySelect={(day) => setSelectedDay(prev => prev && format(prev,'yyyy-MM-dd') === format(day,'yyyy-MM-dd') ? null : day)}
              selectedDay={selectedDay}
            />
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