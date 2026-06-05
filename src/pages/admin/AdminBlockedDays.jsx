import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, AlertCircle, HelpCircle, Calendar, Pencil } from 'lucide-react';

const STATUS_CONFIG = {
  blocked: {
    label: 'Bloqué',
    color: 'bg-red-500/10 border-red-500/30 text-red-400',
    dot: 'bg-red-500',
    icon: AlertCircle,
  },
  unknown: {
    label: 'Incertain',
    color: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
    dot: 'bg-gray-500',
    icon: HelpCircle,
  },
};

const EMPTY_FORM = { date: '', status: 'blocked', reason: '' };

export default function AdminBlockedDays() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null); // null | { mode: 'create' | 'edit', data }
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: blockedDays = [], isLoading } = useQuery({
    queryKey: ['blocked-days'],
    queryFn: () => base44.entities.BlockedDay.list('-date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (dialog.mode === 'edit') {
        await base44.entities.BlockedDay.update(dialog.data.id, {
          status: form.status,
          reason: form.reason,
        });
      } else {
        // Check for duplicate date
        const existing = blockedDays.find(d => d.date === form.date);
        if (existing) {
          throw new Error('Un blocage existe déjà pour cette date.');
        }
        await base44.entities.BlockedDay.create({
          date: form.date,
          status: form.status,
          reason: form.reason,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-days'] });
      setDialog(null);
      toast.success(dialog.mode === 'edit' ? 'Jour mis à jour.' : 'Jour bloqué ajouté.');
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedDay.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-days'] });
      toast.success('Blocage supprimé.');
    },
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setDialog({ mode: 'create' });
  };

  const openEdit = (day) => {
    setForm({ date: day.date, status: day.status, reason: day.reason || '' });
    setDialog({ mode: 'edit', data: day });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl text-foreground">Gestion du planning</h1>
          <p className="text-sm text-muted-foreground mt-1">Bloquez des jours ou marquez-les comme incertains.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Bloquer un jour
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${cfg.color}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          Disponible (créneaux ouverts)
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : blockedDays.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun jour bloqué pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blockedDays.map((day) => {
            const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.unknown;
            const Icon = cfg.icon;
            const dateLabel = (() => {
              try { return format(parseISO(day.date), 'EEEE d MMMM yyyy', { locale: fr }); }
              catch { return day.date; }
            })();

            return (
              <div
                key={day.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${cfg.color} bg-card`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div>
                    <p className="font-grotesk font-semibold capitalize text-sm text-foreground">{dateLabel}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-mono ${cfg.color.split(' ').find(c => c.startsWith('text-'))}`}>{cfg.label}</span>
                      {day.reason && <span className="text-xs text-muted-foreground">— {day.reason}</span>}
                      {day.blocked_by_quote_id && (
                        <span className="text-xs text-muted-foreground italic">· auto (devis)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(day)} className="h-8 w-8">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(day.id)}
                    className="h-8 w-8 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <div className="p-6 space-y-4">
            <h2 className="font-grotesk font-bold text-lg">
              {dialog?.mode === 'edit' ? 'Modifier le blocage' : 'Bloquer un jour'}
            </h2>

            {dialog?.mode === 'create' && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-inter">Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>
            )}

            {dialog?.mode === 'edit' && (
              <div className="px-3 py-2 rounded-lg bg-secondary text-sm font-grotesk capitalize text-foreground">
                {(() => {
                  try { return format(parseISO(form.date), 'EEEE d MMMM yyyy', { locale: fr }); }
                  catch { return form.date; }
                })()}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-inter">Statut *</label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked">🔴 Bloqué (indisponible)</SelectItem>
                  <SelectItem value="unknown">⚫ Incertain (à définir)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-inter">Raison (optionnel)</label>
              <Textarea
                placeholder="Ex: Prestation longue, maintenance…"
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                className="bg-secondary border-border resize-none h-20 font-inter"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setDialog(null)}>
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={() => saveMutation.mutate()}
                disabled={!form.date || saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Sauvegarde…' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}