import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminAppointments() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: '', time_start: '', time_end: '', service_type: '', location: '' });

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ['adm-appts-list'],
    queryFn: () => base44.entities.Appointment.list('-date', 100),
  });

  const create = useMutation({
    mutationFn: () => base44.entities.Appointment.create({ ...form, status: 'confirmed' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-appts-list'] }); setForm({ date: '', time_start: '', time_end: '', service_type: '', location: '' }); toast.success('Créneau ajouté'); },
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-appts-list'] }),
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-appts-list'] }); toast.success('Supprimé'); },
  });

  return (
    <div>
      <h1 className="font-grotesk font-bold text-2xl mb-8">Gestion du planning</h1>

      <div className="p-5 rounded-xl bg-card border border-border mb-8">
        <h3 className="font-grotesk font-semibold text-sm mb-4">Ajouter un créneau disponible</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Date</label>
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="bg-secondary border-border w-40" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Début</label>
            <Input placeholder="09:00" value={form.time_start} onChange={e => setForm(p => ({ ...p, time_start: e.target.value }))} className="bg-secondary border-border w-28" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Fin</label>
            <Input placeholder="11:00" value={form.time_end} onChange={e => setForm(p => ({ ...p, time_end: e.target.value }))} className="bg-secondary border-border w-28" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Service</label>
            <Input placeholder="Type de prestation" value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value }))} className="bg-secondary border-border w-48" />
          </div>
          <Button onClick={() => create.mutate()} disabled={!form.date || !form.time_start || create.isPending} className="bg-primary text-primary-foreground">
            {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-2">
          {appts.sort((a, b) => new Date(a.date) - new Date(b.date)).map(a => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="font-mono text-sm font-medium min-w-[100px]">{a.date}</div>
              <div className="font-mono text-xs text-muted-foreground">{a.time_start}{a.time_end ? ` – ${a.time_end}` : ''}</div>
              <StatusBadge status={a.status} />
              {a.client_name && <span className="font-inter text-xs text-muted-foreground">{a.client_name}</span>}
              {a.service_type && <span className="font-mono text-[10px] text-primary">{a.service_type}</span>}
              <div className="flex items-center gap-2 ml-auto">
                {a.status === 'scheduled' && (
                  <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: a.id, data: { status: 'confirmed' } })} className="text-green-400 hover:bg-green-400/10">
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                {(a.status === 'scheduled' || a.status === 'confirmed') && (
                  <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: a.id, data: { status: 'cancelled' } })} className="text-destructive hover:bg-destructive/10">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => del.mutate(a.id)} className="text-destructive hover:bg-destructive/10">
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