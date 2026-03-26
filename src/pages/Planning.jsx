import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format, addDays, startOfToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Sun, Sunset, Moon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const periodIcons = { morning: Sun, afternoon: Sunset, evening: Moon };

export default function Planning() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(startOfToday());
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ client_name: '', client_email: '', notes: '' });

  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list(),
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Appointment.update(bookingSlot.id, {
        status: 'booked',
        client_name: bookingForm.client_name,
        client_email: bookingForm.client_email,
        notes: bookingForm.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBookingSlot(null);
      setBookingForm({ client_name: '', client_email: '', notes: '' });
      toast.success(lang === 'fr' ? 'Créneau réservé avec succès !' : 'Slot booked successfully!');
    },
  });

  const getSlots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => a.date === dateStr && a.status === 'available');
  };

  const locale = lang === 'fr' ? fr : enUS;

  return (
    <div className="min-h-screen py-32 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">{t('planning.title')}</p>
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mb-8">
            {t('planning.title')}<span className="text-primary">.</span>
          </h1>
        </motion.div>

        {/* Date navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="sm" onClick={() => setStartDate(d => addDays(d, -7))} className="border-border">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-inter text-sm text-muted-foreground">
            {format(days[0], 'd MMM', { locale })} — {format(days[6], 'd MMM yyyy', { locale })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setStartDate(d => addDays(d, 7))} className="border-border">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {days.map((day) => {
              const slots = getSlots(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={day.toISOString()}
                  className={`rounded-xl border p-4 ${
                    isToday ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="text-center mb-3">
                    <p className="font-syne font-bold text-sm capitalize">
                      {format(day, 'EEE', { locale })}
                    </p>
                    <p className={`font-mono text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {slots.length > 0 ? slots.map((slot) => {
                      const PeriodIcon = periodIcons[slot.period] || Clock;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setBookingSlot(slot)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-left"
                        >
                          <PeriodIcon className="w-3 h-3 text-accent flex-shrink-0" />
                          <span className="font-mono text-xs text-accent">{slot.time_slot}</span>
                        </button>
                      );
                    }) : (
                      <p className="font-mono text-xs text-muted-foreground text-center">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-8 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent/20 border border-accent/30" />
            <span className="font-inter text-xs text-muted-foreground">{t('planning.available')}</span>
          </div>
        </div>

        {/* Booking dialog */}
        <Dialog open={!!bookingSlot} onOpenChange={() => setBookingSlot(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-syne font-bold">{t('planning.book')}</DialogTitle>
            </DialogHeader>
            {bookingSlot && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-secondary border border-border font-mono text-sm">
                  {bookingSlot.date} • {bookingSlot.time_slot}
                </div>
                <Input
                  placeholder={t('quote.name')}
                  value={bookingForm.client_name}
                  onChange={(e) => setBookingForm(p => ({ ...p, client_name: e.target.value }))}
                  className="bg-secondary border-border"
                />
                <Input
                  placeholder={t('quote.email')}
                  type="email"
                  value={bookingForm.client_email}
                  onChange={(e) => setBookingForm(p => ({ ...p, client_email: e.target.value }))}
                  className="bg-secondary border-border"
                />
                <Input
                  placeholder="Notes"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(p => ({ ...p, notes: e.target.value }))}
                  className="bg-secondary border-border"
                />
                <Button
                  onClick={() => bookMutation.mutate()}
                  disabled={!bookingForm.client_name || !bookingForm.client_email || bookMutation.isPending}
                  className="w-full bg-primary text-primary-foreground font-syne font-bold"
                >
                  {bookMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('planning.book')}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}