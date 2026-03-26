import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'sonner';

export default function AdminAppointments() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [newSlot, setNewSlot] = useState({ date: '', time_slot: '', period: 'morning' });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => base44.entities.Appointment.list('-date'),
  });

  const createSlot = useMutation({
    mutationFn: () => base44.entities.Appointment.create({ ...newSlot, status: 'available' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      setNewSlot({ date: '', time_slot: '', period: 'morning' });
      toast.success(lang === 'fr' ? 'Créneau ajouté' : 'Slot added');
    },
  });

  const deleteSlot = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success(lang === 'fr' ? 'Créneau supprimé' : 'Slot deleted');
    },
  });

  const cancelSlot = useMutation({
    mutationFn: (id) => base44.entities.Appointment.update(id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
  });

  return (
    <div>
      <h1 className="font-syne font-extrabold text-2xl mb-8">{t('admin.appointments')}</h1>

      {/* Add slot */}
      <div className="p-5 rounded-xl bg-card border border-border mb-8">
        <h3 className="font-syne font-bold text-sm mb-4">{lang === 'fr' ? 'Ajouter un créneau' : 'Add a slot'}</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Date</label>
            <Input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot(p => ({ ...p, date: e.target.value }))}
              className="bg-secondary border-border w-44"
            />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">{lang === 'fr' ? 'Créneau' : 'Slot'}</label>
            <Input
              placeholder="09:00 - 10:00"
              value={newSlot.time_slot}
              onChange={(e) => setNewSlot(p => ({ ...p, time_slot: e.target.value }))}
              className="bg-secondary border-border w-44"
            />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">{lang === 'fr' ? 'Période' : 'Period'}</label>
            <Select value={newSlot.period} onValueChange={(v) => setNewSlot(p => ({ ...p, period: v }))}>
              <SelectTrigger className="bg-secondary border-border w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t('planning.morning')}</SelectItem>
                <SelectItem value="afternoon">{t('planning.afternoon')}</SelectItem>
                <SelectItem value="evening">{t('planning.evening')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => createSlot.mutate()}
            disabled={!newSlot.date || !newSlot.time_slot || createSlot.isPending}
            className="bg-primary text-primary-foreground"
          >
            {createSlot.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-mono text-sm font-medium">{a.date}</span>
                  <span className="font-mono text-xs text-muted-foreground ml-3">{a.time_slot}</span>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="flex items-center gap-3">
                {a.client_name && (
                  <span className="font-inter text-xs text-muted-foreground">{a.client_name}</span>
                )}
                {a.status === 'booked' && (
                  <Button size="sm" variant="ghost" onClick={() => cancelSlot.mutate(a.id)} className="text-destructive hover:bg-destructive/10 text-xs">
                    {lang === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteSlot.mutate(a.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}