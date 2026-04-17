import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, addDays, startOfToday, startOfWeek, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import SchedulerChat from '@/components/planning/SchedulerChat';

export default function PlanningPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_planning_enabled');
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [booking, setBooking] = useState(null);
  const [bookForm, setBookForm] = useState({ client_name: '', client_email: '', notes: '' });

  const weekStart = startOfWeek(addWeeks(startOfToday(), weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['public-appointments'],
    queryFn: () => base44.entities.Appointment.list('-date', 100),
  });

  const bookMutation = useMutation({
    mutationFn: async (appt) => {
      await base44.entities.Appointment.update(appt.id, {
        status: 'scheduled',
        client_name: bookForm.client_name,
        client_email: bookForm.client_email,
        notes: bookForm.notes,
      });
      await base44.integrations.Core.SendEmail({
        to: bookForm.client_email,
        subject: 'Réservation confirmée — Brenne Aerial',
        body: `Bonjour ${bookForm.client_name},\n\nVotre réservation du ${appt.date} à ${appt.time_start} a bien été enregistrée.\nNous vous contacterons pour confirmer les détails.\n\nBrenn Aerial`,
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

  const available = appointments.filter(a => a.status === 'confirmed' && !a.client_email);
  const getForDay = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    return available.filter(a => a.date === ds);
  };

  return (
    <div className="pt-16">
      <section className="py-24 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <p className="font-mono text-xs text-primary mb-3 tracking-widest uppercase">— Disponibilités</p>
            <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-3">
              Planning & <span className="gradient-text">Réservation</span>
            </h1>
            <p className="font-inter text-muted-foreground max-w-lg">
              Consultez nos disponibilités et réservez votre créneau directement en ligne.
            </p>
          </motion.div>

          {/* Week navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)} className="border-border" disabled={weekOffset <= 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-inter text-sm text-muted-foreground">
              Semaine du {format(weekStart, 'd MMM', { locale: fr })} au {format(days[6], 'd MMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)} className="border-border">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {days.map(day => {
                const slots = getForDay(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isPast = day < new Date();
                return (
                  <div key={day.toISOString()}
                    className={`rounded-xl border p-4 ${isToday ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'} ${isPast ? 'opacity-40' : ''}`}>
                    <div className="text-center mb-3">
                      <p className="font-grotesk text-xs text-muted-foreground capitalize">{format(day, 'EEE', { locale: fr })}</p>
                      <p className={`font-grotesk font-bold text-xl ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</p>
                    </div>
                    <div className="space-y-1.5">
                      {slots.length > 0 ? slots.map(slot => (
                        <button key={slot.id} onClick={() => !isPast && setBooking(slot)}
                          className="w-full text-left px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-primary" />
                            <span className="font-mono text-[10px] text-primary">{slot.time_start}</span>
                          </div>
                          {slot.service_type && <p className="font-inter text-[9px] text-muted-foreground mt-0.5 truncate">{slot.service_type}</p>}
                        </button>
                      )) : (
                        <p className="font-mono text-[10px] text-muted-foreground text-center py-2">—</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-4 mt-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
              <span className="font-inter text-xs text-muted-foreground">Créneau disponible</span>
            </div>
          </div>
        </div>
      </section>

      <SchedulerChat />

      {/* Booking dialog */}
      <Dialog open={!!booking} onOpenChange={() => setBooking(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">Réserver ce créneau</DialogTitle>
          </DialogHeader>
          {booking && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 font-mono text-sm">
                <Calendar className="w-4 h-4 text-primary inline mr-2" />
                {booking.date} à {booking.time_start}
                {booking.time_end && ` — ${booking.time_end}`}
              </div>
              <Input placeholder="Votre nom *" value={bookForm.client_name}
                onChange={e => setBookForm(p => ({ ...p, client_name: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Votre email *" type="email" value={bookForm.client_email}
                onChange={e => setBookForm(p => ({ ...p, client_email: e.target.value }))} className="bg-secondary border-border" />
              <Input placeholder="Notes (optionnel)" value={bookForm.notes}
                onChange={e => setBookForm(p => ({ ...p, notes: e.target.value }))} className="bg-secondary border-border" />
              <Button
                onClick={() => bookMutation.mutate(booking)}
                disabled={!bookForm.client_name || !bookForm.client_email || bookMutation.isPending}
                className="w-full bg-primary text-primary-foreground font-grotesk font-semibold sky-glow"
              >
                {bookMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Confirmer la réservation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}