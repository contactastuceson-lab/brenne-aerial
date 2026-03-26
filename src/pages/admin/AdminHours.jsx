import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function AdminHours() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [newDay, setNewDay] = useState({ day_of_week: 'lundi', is_open: true, open_time: '09:00', close_time: '18:00', break_start: '', break_end: '' });

  const { data: hours = [], isLoading } = useQuery({
    queryKey: ['admin-hours'],
    queryFn: () => base44.entities.BusinessHours.list(),
  });

  const createHour = useMutation({
    mutationFn: () => base44.entities.BusinessHours.create(newDay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hours'] });
      toast.success(lang === 'fr' ? 'Horaire ajouté' : 'Hours added');
    },
  });

  const updateHour = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BusinessHours.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hours'] });
      toast.success(lang === 'fr' ? 'Mis à jour' : 'Updated');
    },
  });

  const deleteHour = useMutation({
    mutationFn: (id) => base44.entities.BusinessHours.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-hours'] }),
  });

  const existingDays = hours.map(h => h.day_of_week);
  const availableDays = days.filter(d => !existingDays.includes(d));

  return (
    <div>
      <h1 className="font-syne font-extrabold text-2xl mb-8">{t('admin.settings')} — {t('hours.title')}</h1>

      {/* Add */}
      {availableDays.length > 0 && (
        <div className="p-5 rounded-xl bg-card border border-border mb-8 space-y-4">
          <h3 className="font-syne font-bold text-sm">{lang === 'fr' ? 'Ajouter un jour' : 'Add a day'}</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <Select value={newDay.day_of_week} onValueChange={(v) => setNewDay(p => ({ ...p, day_of_week: v }))}>
              <SelectTrigger className="bg-secondary border-border w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={newDay.open_time} onChange={(e) => setNewDay(p => ({ ...p, open_time: e.target.value }))} placeholder="09:00" className="bg-secondary border-border w-28" />
            <Input value={newDay.close_time} onChange={(e) => setNewDay(p => ({ ...p, close_time: e.target.value }))} placeholder="18:00" className="bg-secondary border-border w-28" />
            <Button onClick={() => createHour.mutate()} disabled={createHour.isPending} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {hours.sort((a, b) => days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week)).map((h) => (
            <div key={h.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <span className="font-syne font-bold text-sm capitalize min-w-[90px]">{h.day_of_week}</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={h.is_open}
                  onCheckedChange={(v) => updateHour.mutate({ id: h.id, data: { is_open: v } })}
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {h.is_open ? t('hours.open') : t('hours.closed')}
                </span>
              </div>
              {h.is_open && (
                <>
                  <Input
                    defaultValue={h.open_time}
                    onBlur={(e) => updateHour.mutate({ id: h.id, data: { open_time: e.target.value } })}
                    className="bg-secondary border-border w-24 font-mono text-xs"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    defaultValue={h.close_time}
                    onBlur={(e) => updateHour.mutate({ id: h.id, data: { close_time: e.target.value } })}
                    className="bg-secondary border-border w-24 font-mono text-xs"
                  />
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => deleteHour.mutate(h.id)} className="text-destructive hover:bg-destructive/10 ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}