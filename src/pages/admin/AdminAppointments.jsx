import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function AdminAppointments() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: '', time_start: '', time_end: '', service_type: '', location: '', notes: '' });

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ['adm-appts-list'],
    queryFn: () => base44.entities.Appointment.list('-date', 100),
  });

  const create = useMutation({
    mutationFn: () => base44.entities.Appointment.create({ ...form, status: 'confirmed' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adm-appts-list'] });
      setForm({ date: '', time_start: '', time_end: '', service_type: '', location: '', notes: '' });
      toast.success('Créneau ajouté');
    },
    onError: (err) => toast.error('Erreur : ' + (err?.message || 'Vérifiez les champs obligatoires')),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-appts-list'] }),
    onError: (err) => toast.error('Erreur : ' + (err?.message || 'inconnue')),
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-appts-list'] }); toast.success('Supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  return (
    <div>
      <h1 className="font-grotesk font-bold text-2xl mb-8">Gestion du planning</h1>

      {/* Add slot form */}
      <div className="p-5 rounded-xl bg-card border border-border mb-8">
        <h3 className="font-grotesk font-semibold text-sm mb-4">Ajouter un créneau disponible</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Date *</label>
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="bg-secondary border-border w-40" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Début *</label>
            <Input type="time" value={form.time_start} onChange={e => setForm(p => ({ ...p, time_start: e.target.value }))} className="bg-secondary border-border w-32" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Fin</label>
            <Input type="time" value={form.time_end} onChange={e => setForm(p => ({ ...p, time_end: e.target.value }))} className="bg-secondary border-border w-32" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Prestation</label>
            <Input placeholder="ex: Inspection toiture" value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value }))} className="bg-secondary border-border w-48" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Lieu</label>
            <Input placeholder="ex: Paris" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-secondary border-border w-36" />
          </div>
          <Button
            onClick={() => create.mutate()}
            disabled={!form.date || !form.time_start || create.isPending}
            className="bg-primary text-primary-foreground gap-2"
          >
            {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Ajouter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {appts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">
              Aucun créneau. Ajoutez-en un ci-dessus.
            </div>
          )}
          {appts.sort((a, b) => new Date(a.date + 'T' + (a.time_start || '00:00')) - new Date(b.date + 'T' + (b.time_start || '00:00'))).map(a => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="font-mono text-sm font-medium min-w-[100px]">{a.date}</div>
              <div className="font-mono text-xs text-primary">{a.time_start}{a.time_end ? ` – ${a.time_end}` : ''}</div>
              <StatusBadge status={a.status} />
              {a.client_name && <span className="font-inter text-xs text-foreground bg-secondary px-2 py-0.5 rounded-lg">{a.client_name}</span>}
              {a.client_email && <span className="font-mono text-[10px] text-muted-foreground">{a.client_email}</span>}
              {a.service_type && <span className="font-mono text-[10px] text-accent">{a.service_type}</span>}
              {a.location && <span className="font-mono text-[10px] text-muted-foreground">{a.location}</span>}
              <div className="flex items-center gap-2 ml-auto">
                {a.status === 'scheduled' && (
                  <Button size="sm" variant="ghost" title="Confirmer" onClick={() => update.mutate({ id: a.id, data: { status: 'confirmed' } })} className="text-green-400 hover:bg-green-400/10">
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                {a.status === 'confirmed' && (
                  <Button size="sm" variant="ghost" title="Marquer complété" onClick={() => update.mutate({ id: a.id, data: { status: 'completed' } })} className="text-accent hover:bg-accent/10">
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                {(a.status === 'scheduled' || a.status === 'confirmed') && (
                  <Button size="sm" variant="ghost" title="Annuler" onClick={() => update.mutate({ id: a.id, data: { status: 'cancelled' } })} className="text-destructive hover:bg-destructive/10">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" title="Supprimer" onClick={() => del.mutate(a.id)} className="text-destructive hover:bg-destructive/10">
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