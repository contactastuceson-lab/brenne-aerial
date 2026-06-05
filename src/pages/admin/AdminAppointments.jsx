import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Plus, Trash2, Loader2, Check, X,
  Calendar, Clock, MapPin, User, Mail, Zap, Filter, List, LayoutGrid,
  CalendarDays, CheckCircle2, Ban, Pencil, MoreVertical, RefreshCw, Phone, Users
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CalendarViewSwitcher from '@/components/planning/CalendarViewSwitcher';

const SERVICE_OPTIONS = [
  { value: 'video_evenement', label: 'Vidéo événement' },
  { value: 'inspection_toiture', label: 'Inspection toiture' },
  { value: 'suivi_chantier', label: 'Suivi chantier' },
  { value: 'captation_particulier', label: 'Captation particulier' },
  { value: 'captation_entreprise', label: 'Captation entreprise' },
  { value: 'retour_temps_reel', label: 'Retour temps réel' },
  { value: 'autre', label: 'Autre prestation' },
];
const SERVICE_LABELS = Object.fromEntries(SERVICE_OPTIONS.map(s => [s.value, s.label]));

const STATUS_CONFIG = {
  confirmed: { label: 'Disponible', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', icon: CheckCircle2 },
  pending: { label: 'En attente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', icon: Clock },
  scheduled: { label: 'Accepté', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', icon: Calendar },
  completed: { label: 'Terminé', color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border', icon: Check },
  cancelled: { label: 'Refusé/Annulé', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: Ban },
};

const EMPTY_FORM = { date: '', time_start: '', time_end: '', service_type: '', location: '', notes: '' };

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="font-grotesk font-bold text-xl">{value}</p>
        <p className="font-inter text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminAppointments() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [view, setView] = useState('calendar');
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ['adm-appts-list'],
    queryFn: () => base44.entities.Appointment.list('-date', 200),
  });

  const { data: blockedDays = [] } = useQuery({
    queryKey: ['adm-blocked-days'],
    queryFn: () => base44.entities.BlockedDay.list('date', 365),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Appointment.create({ ...form, status: 'confirmed' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-appts-list'] }); setForm(EMPTY_FORM); setShowForm(false); toast.success('Créneau ajouté'); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-appts-list'] }); toast.success('Mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-appts-list'] }); toast.success('Supprimé'); },
  });

  const blockDayMutation = useMutation({
    mutationFn: ({ date, status }) => base44.entities.BlockedDay.create({ date, status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-blocked-days'] }); qc.invalidateQueries({ queryKey: ['blocked-days-public'] }); toast.success('Jour bloqué'); },
  });

  const unblockDayMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedDay.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-blocked-days'] }); qc.invalidateQueries({ queryKey: ['blocked-days-public'] }); toast.success('Jour débloqué'); },
  });

  const openEdit = (appt) => {
    setForm({ date: appt.date || '', time_start: appt.time_start || '', time_end: appt.time_end || '', service_type: appt.service_type || '', location: appt.location || '', notes: appt.notes || '' });
    setEditingAppt(appt);
    setShowForm(true);
  };

  const sorted = [...appts].sort((a, b) =>
    new Date(a.date + 'T' + (a.time_start || '00:00')) - new Date(b.date + 'T' + (b.time_start || '00:00'))
  );
  const filtered = filterStatus === 'all' ? sorted : sorted.filter(a => a.status === filterStatus);
  const getSlotsForDay = (day) => { const ds = format(day, 'yyyy-MM-dd'); return sorted.filter(a => a.date === ds); };
  const selectedDaySlots = selectedDay ? getSlotsForDay(selectedDay) : [];
  const getBlockForDay = (day) => { const ds = format(day, 'yyyy-MM-dd'); return blockedDays.find(b => b.date === ds) || null; };

  const pendingAppts = appts.filter(a => a.status === 'pending');

  const stats = {
    total: appts.length,
    available: appts.filter(a => a.status === 'confirmed' && !a.client_email).length,
    pending: pendingAppts.length,
    booked: appts.filter(a => a.status === 'scheduled').length,
    completed: appts.filter(a => a.status === 'completed').length,
  };

  const handleDaySelect = (day) => {
    setSelectedDay(prev => prev && format(prev, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ? null : day);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Gestion du Planning</h1>
          <p className="font-inter text-sm text-muted-foreground mt-0.5">Gérez les créneaux et réservations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')} className="gap-2">
            <LayoutGrid className="w-4 h-4" /> Calendrier
          </Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')} className="gap-2">
            <List className="w-4 h-4" /> Liste
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-primary text-primary-foreground" size="sm">
            <Plus className="w-4 h-4" /> Nouveau créneau
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} color="bg-secondary text-foreground" icon={CalendarDays} />
        <StatCard label="Disponibles" value={stats.available} color="bg-green-400/10 text-green-400" icon={CheckCircle2} />
        <StatCard label="En attente" value={stats.pending} color="bg-yellow-400/10 text-yellow-400" icon={Clock} />
        <StatCard label="Acceptés" value={stats.booked} color="bg-primary/10 text-primary" icon={Calendar} />
        <StatCard label="Terminés" value={stats.completed} color="bg-secondary text-muted-foreground" icon={Check} />
      </div>

      {/* Pending appointments alert */}
      {pendingAppts.length > 0 && (
        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h2 className="font-grotesk font-bold text-sm text-yellow-400">{pendingAppts.length} demande{pendingAppts.length > 1 ? 's' : ''} en attente de validation</h2>
          </div>
          <div className="space-y-3">
            {pendingAppts.map(appt => (
              <div key={appt.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-yellow-400/20">
                <div className="flex items-center gap-2 min-w-[160px]">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="font-grotesk font-semibold text-sm">{appt.date}</p>
                    <p className="font-mono text-xs text-yellow-400">{appt.time_start}{appt.time_end ? ` → ${appt.time_end}` : ''}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-inter text-sm font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" /> {appt.client_name}</p>
                  <p className="font-inter text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" /> {appt.client_email}</p>
                  {appt.contact_type && (
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">
                      Contact : <span className="text-foreground capitalize">{appt.contact_type}</span>
                      {appt.contact_type === 'presentiel' && appt.meeting_address && ` — ${appt.meeting_address}`}
                    </p>
                  )}
                  {appt.notes && <p className="font-inter text-xs text-muted-foreground mt-0.5 italic">"{appt.notes}"</p>}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: appt.id, data: { status: 'scheduled' } })}
                    className="bg-green-500 hover:bg-green-600 text-white gap-1.5 h-8 text-xs"
                    disabled={updateMutation.isPending}
                  >
                    <Check className="w-3 h-3" /> Accepter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: appt.id, data: { status: 'cancelled' } })}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5 h-8 text-xs"
                    disabled={updateMutation.isPending}
                  >
                    <X className="w-3 h-3" /> Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : view === 'calendar' ? (

        <div className="space-y-4">
          {/* Calendar view switcher */}
          <CalendarViewSwitcher
            appointments={sorted}
            blockedDays={blockedDays}
            isAdmin={true}
            onDaySelect={handleDaySelect}
            selectedDay={selectedDay}
          />

          {/* Block/Unblock selected day */}
          {selectedDay && (() => {
            const block = getBlockForDay(selectedDay);
            return (
              <div className="flex items-center gap-2">
                {block ? (
                  <Button size="sm" variant="outline" onClick={() => unblockDayMutation.mutate(block.id)} className="gap-1.5 text-xs border-green-500/40 text-green-400 hover:bg-green-500/10">
                    <Check className="w-3 h-3" /> Débloquer ce jour
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => blockDayMutation.mutate({ date: format(selectedDay, 'yyyy-MM-dd'), status: 'blocked' })} className="gap-1.5 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10">
                    <Ban className="w-3 h-3" /> Bloquer ce jour
                  </Button>
                )}
              </div>
            );
          })()}

          {/* Selected Day Panel */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div key="day-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-grotesk font-bold text-base capitalize">
                    {format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => { setForm({ ...EMPTY_FORM, date: format(selectedDay, 'yyyy-MM-dd') }); setShowForm(true); }} className="gap-1.5 bg-primary text-primary-foreground text-xs">
                      <Plus className="w-3 h-3" /> Ajouter
                    </Button>
                    <button onClick={() => setSelectedDay(null)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedDaySlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-inter text-sm">Aucun créneau ce jour</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedDaySlots.map(slot => {
                      const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG.confirmed;
                      const Icon = cfg.icon;
                      return (
                        <div key={slot.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${cfg.color}`} />
                              <span className={`font-mono font-bold text-sm ${cfg.color}`}>{slot.time_start}</span>
                              {slot.time_end && <span className="font-mono text-xs text-muted-foreground">→ {slot.time_end}</span>}
                            </div>
                            <span className={`flex items-center gap-1 text-[10px] font-inter ${cfg.color}`}>
                              <Icon className="w-3 h-3" /> {cfg.label}
                            </span>
                          </div>
                          {slot.service_type && <p className="font-inter text-xs text-muted-foreground mb-1">{SERVICE_LABELS[slot.service_type] || slot.service_type}</p>}
                          {slot.client_name && <p className="font-inter text-xs flex items-center gap-1 text-foreground"><User className="w-3 h-3" /> {slot.client_name}</p>}
                          {slot.client_email && <p className="font-inter text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {slot.client_email}</p>}
                          {slot.location && <p className="font-inter text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {slot.location}</p>}
                          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(slot)} className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground gap-1">
                              <Pencil className="w-3 h-3" /> Modifier
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-6 px-2 ml-auto"><MoreVertical className="w-3 h-3" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {slot.status === 'pending' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: slot.id, data: { status: 'scheduled' } })} className="text-green-400 gap-2"><Check className="w-3 h-3" /> Accepter la demande</DropdownMenuItem>}
                                {slot.status !== 'confirmed' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: slot.id, data: { status: 'confirmed', client_name: null, client_email: null, contact_type: null, meeting_address: null } })} className="text-green-400 gap-2"><RefreshCw className="w-3 h-3" /> Remettre dispo</DropdownMenuItem>}
                                {slot.status !== 'scheduled' && slot.status !== 'pending' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: slot.id, data: { status: 'scheduled' } })} className="text-primary gap-2"><Calendar className="w-3 h-3" /> Marquer accepté</DropdownMenuItem>}
                                {slot.status !== 'completed' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: slot.id, data: { status: 'completed' } })} className="text-accent gap-2"><CheckCircle2 className="w-3 h-3" /> Marquer terminé</DropdownMenuItem>}
                                {slot.status !== 'cancelled' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: slot.id, data: { status: 'cancelled' } })} className="text-destructive gap-2"><X className="w-3 h-3" /> Refuser/Annuler</DropdownMenuItem>}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => deleteMutation.mutate(slot.id)} className="text-destructive gap-2"><Trash2 className="w-3 h-3" /> Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      ) : (
        /* ── LIST VIEW ── */
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-card border-border">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-inter text-sm text-muted-foreground">{filtered.length} créneau{filtered.length > 1 ? 'x' : ''}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-inter text-sm">Aucun créneau</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((a, i) => {
                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.confirmed;
                const Icon = cfg.icon;
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className={`flex flex-wrap lg:flex-nowrap items-center gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border} transition-colors`}>
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="font-grotesk font-semibold text-sm">{a.date}</p>
                        <p className={`font-mono text-xs ${cfg.color}`}>{a.time_start}{a.time_end ? ` → ${a.time_end}` : ''}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-inter border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                    {a.service_type && <span className="font-inter text-xs px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">{SERVICE_LABELS[a.service_type] || a.service_type}</span>}
                    {a.client_name && <span className="flex items-center gap-1 font-inter text-xs text-foreground"><User className="w-3 h-3 text-muted-foreground" /> {a.client_name}</span>}
                    {a.client_email && <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Mail className="w-3 h-3" /> {a.client_email}</span>}
                    {a.location && <span className="flex items-center gap-1 font-inter text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {a.location}</span>}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(a)} className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1">
                        <Pencil className="w-3 h-3" /> Modifier
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 px-2"><MoreVertical className="w-3 h-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                         {a.status === 'pending' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, data: { status: 'scheduled' } })} className="text-green-400 gap-2"><Check className="w-3 h-3" /> Accepter la demande</DropdownMenuItem>}
                         {a.status !== 'confirmed' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, data: { status: 'confirmed', client_name: null, client_email: null, contact_type: null, meeting_address: null } })} className="text-green-400 gap-2"><RefreshCw className="w-3 h-3" /> Remettre dispo</DropdownMenuItem>}
                         {a.status !== 'scheduled' && a.status !== 'pending' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, data: { status: 'scheduled' } })} className="text-primary gap-2"><Calendar className="w-3 h-3" /> Marquer accepté</DropdownMenuItem>}
                         {a.status !== 'completed' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, data: { status: 'completed' } })} className="text-accent gap-2"><CheckCircle2 className="w-3 h-3" /> Marquer terminé</DropdownMenuItem>}
                         {a.status !== 'cancelled' && <DropdownMenuItem onClick={() => updateMutation.mutate({ id: a.id, data: { status: 'cancelled' } })} className="text-destructive gap-2"><X className="w-3 h-3" /> Refuser/Annuler</DropdownMenuItem>}
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => deleteMutation.mutate(a.id)} className="text-destructive gap-2"><Trash2 className="w-3 h-3" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Slot Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) { setForm(EMPTY_FORM); setEditingAppt(null); } }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold flex items-center gap-2">
              {editingAppt ? <><Pencil className="w-4 h-4 text-primary" /> Modifier le créneau</> : <><Zap className="w-4 h-4 text-primary" /> Nouveau créneau</>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Date *</label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Prestation</label>
                <Select value={form.service_type} onValueChange={v => setForm(p => ({ ...p, service_type: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                  <SelectContent>{SERVICE_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Début *</label>
                <Input type="time" value={form.time_start} onChange={e => setForm(p => ({ ...p, time_start: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Fin</label>
                <Input type="time" value={form.time_end} onChange={e => setForm(p => ({ ...p, time_end: e.target.value }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Lieu</label>
              <Input placeholder="ex: Paris 75001" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Notes internes</label>
              <Input placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <Button
              onClick={() => {
                if (editingAppt) {
                  updateMutation.mutate({ id: editingAppt.id, data: form }, { onSuccess: () => { setShowForm(false); setForm(EMPTY_FORM); setEditingAppt(null); } });
                } else {
                  createMutation.mutate();
                }
              }}
              disabled={!form.date || !form.time_start || createMutation.isPending || updateMutation.isPending}
              className="w-full bg-primary text-primary-foreground font-grotesk font-semibold h-10 gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAppt ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingAppt ? 'Enregistrer les modifications' : 'Créer le créneau'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}