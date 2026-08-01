import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  Calendar, Users, Loader2, Plus, Pencil, Trash2, Ban, RotateCcw, Search,
  Coins, MapPin, Clock, Filter, ExternalLink, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import EventEditDialog from '@/components/admin/events/EventEditDialog';

const CAT_LABELS = {
  conference: 'Conférence', workshop: 'Atelier', meetup: 'Meetup', concert: 'Concert',
  hackathon: 'Hackathon', webinar: 'Webinaire', expo: 'Expo', sport: 'Sport',
  party: 'Soirée', other: 'Autre',
};

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function StatusPill({ status }) {
  const map = {
    upcoming: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    live: 'bg-red-500/15 text-red-400 border-red-500/30',
    ended: 'bg-muted/40 text-muted-foreground border-border',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    draft: 'bg-muted/40 text-muted-foreground border-border',
  };
  const labels = { upcoming: 'À venir', live: 'En direct', ended: 'Terminé', cancelled: 'Annulé', draft: 'Brouillon' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-grotesk font-bold border ${map[status] || map.draft}`}>
      {labels[status] || status}
    </span>
  );
}

function RegStatusPill({ status }) {
  const map = {
    registered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-muted/40 text-muted-foreground border-border',
    refunded: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };
  const labels = { registered: 'Inscrit', cancelled: 'Annulé', refunded: 'Remboursé' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-grotesk font-bold border ${map[status] || map.cancelled}`}>
      {labels[status] || status}
    </span>
  );
}

export default function AdminEvents() {
  const { user } = useAuth();
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regEventFilter, setRegEventFilter] = useState('all');
  const [regStatusFilter, setRegStatusFilter] = useState('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundNote, setRefundNote] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [evs, regs] = await Promise.all([
        base44.entities.Event.list('-start_date', 200),
        base44.entities.EventRegistration.list('-created_date', 500),
      ]);
      setEvents(evs || []);
      setRegistrations(regs || []);
    } catch {
      setEvents([]); setRegistrations([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const filteredEvents = useMemo(() => {
    if (!search) return events;
    const q = search.toLowerCase();
    return events.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q));
  }, [events, search]);

  const filteredRegs = useMemo(() => {
    return registrations.filter((r) => {
      if (regEventFilter !== 'all' && r.event_id !== regEventFilter) return false;
      if (regStatusFilter !== 'all' && r.status !== regStatusFilter) return false;
      return true;
    });
  }, [registrations, regEventFilter, regStatusFilter]);

  const openCreate = () => { setEditingEvent(null); setEditOpen(true); };
  const openEdit = (ev) => { setEditingEvent(ev); setEditOpen(true); };

  const handleDelete = async (ev) => {
    if (!confirm(`Supprimer définitivement « ${ev.title} » ?`)) return;
    setBusy(true);
    try {
      await base44.entities.Event.delete(ev.id);
      toast.success('Événement supprimé');
      loadAll();
    } catch { toast.error('Suppression échouée'); }
    setBusy(false);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminManageEvent', {
        action: 'cancel_event', event_id: cancelTarget.id, reason: cancelReason,
      });
      toast.success(`Événement annulé — ${res?.data?.refunded || 0} inscription(s) remboursée(s)`);
      setCancelTarget(null); setCancelReason('');
      loadAll();
    } catch { toast.error('Annulation échouée'); }
    setBusy(false);
  };

  const confirmRefund = async () => {
    if (!refundTarget) return;
    setBusy(true);
    try {
      await base44.functions.invoke('adminManageEvent', {
        action: 'refund_registration', registration_id: refundTarget.id, note: refundNote,
      });
      toast.success('Inscription remboursée — crédits rendus');
      setRefundTarget(null); setRefundNote('');
      loadAll();
    } catch { toast.error('Remboursement échoué'); }
    setBusy(false);
  };

  const TABS = [
    { key: 'events', label: 'Événements', icon: Calendar },
    { key: 'registrations', label: 'Inscriptions', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-grotesk text-2xl font-black flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Événements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les événements EZA, les inscriptions et les remboursements en crédits.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Créer un événement</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/60 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-grotesk font-bold transition-all ${tab === t.key ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tab === 'events' ? (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="pl-9" />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Aucun événement.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3 font-bold">Événement</th>
                    <th className="text-left p-3 font-bold">Cat.</th>
                    <th className="text-left p-3 font-bold">Date</th>
                    <th className="text-left p-3 font-bold">Lieu</th>
                    <th className="text-left p-3 font-bold">Inscrits</th>
                    <th className="text-left p-3 font-bold">Crédits</th>
                    <th className="text-left p-3 font-bold">Statut</th>
                    <th className="text-right p-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-secondary/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {ev.image_url
                              ? <img src={ev.image_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground/40" /></div>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-grotesk font-bold truncate max-w-[200px]">{ev.title}</p>
                            {ev.is_featured && <span className="text-[10px] text-yellow-400 font-bold">À la une</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{CAT_LABELS[ev.category] || ev.category}</td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{fmtDate(ev.start_date)}</td>
                      <td className="p-3 text-muted-foreground">{ev.city || (ev.format === 'online' ? 'En ligne' : '—')}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" /> {ev.attendees_count || 0}
                          {ev.capacity > 0 && <span className="text-xs">/{ev.capacity}</span>}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-grotesk font-bold text-amber-400">
                          <Coins className="w-3.5 h-3.5" /> {ev.price_credits || 0}
                        </span>
                      </td>
                      <td className="p-3"><StatusPill status={ev.status} /></td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(ev)} title="Modifier"
                            className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {ev.status !== 'cancelled' && (
                            <button onClick={() => setCancelTarget(ev)} title="Annuler & rembourser"
                              className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(ev)} title="Supprimer"
                            className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select value={regEventFilter} onChange={(e) => setRegEventFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="all">Tous les événements</option>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <select value={regStatusFilter} onChange={(e) => setRegStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="all">Tous les statuts</option>
              <option value="registered">Inscrits</option>
              <option value="refunded">Remboursés</option>
              <option value="cancelled">Annulés</option>
            </select>
            <span className="text-sm text-muted-foreground font-bold ml-auto">
              {filteredRegs.length} inscription{filteredRegs.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredRegs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Aucune inscription.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3 font-bold">Utilisateur</th>
                    <th className="text-left p-3 font-bold">Événement</th>
                    <th className="text-left p-3 font-bold">Date év.</th>
                    <th className="text-left p-3 font-bold">Inscrit le</th>
                    <th className="text-left p-3 font-bold">Crédits</th>
                    <th className="text-left p-3 font-bold">Statut</th>
                    <th className="text-right p-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-secondary/20">
                      <td className="p-3">
                        <p className="font-grotesk font-bold">{reg.user_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{reg.user_email}</p>
                        {reg.user_username && <p className="text-xs text-muted-foreground">@{reg.user_username}</p>}
                      </td>
                      <td className="p-3">
                        <p className="font-grotesk font-bold truncate max-w-[200px]">{reg.event_title}</p>
                        {reg.event_city && <p className="text-xs text-muted-foreground">{reg.event_city}</p>}
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{fmtDate(reg.event_start_date)}</td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{fmtDate(reg.registered_at)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-grotesk font-bold text-amber-400">
                          <Coins className="w-3.5 h-3.5" /> {reg.credits_paid || 0}
                        </span>
                      </td>
                      <td className="p-3"><RegStatusPill status={reg.status} /></td>
                      <td className="p-3 text-right">
                        {reg.status === 'registered' && (
                          <button onClick={() => { setRefundTarget(reg); setRefundNote(''); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-grotesk font-bold">
                            <RotateCcw className="w-3.5 h-3.5" /> Rembourser
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Edit dialog */}
      <EventEditDialog open={editOpen} onClose={() => setEditOpen(false)} event={editingEvent} onSaved={loadAll} />

      {/* Cancel event dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => { if (!o) setCancelTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Annuler l'événement</DialogTitle>
            <DialogDescription>
              « {cancelTarget?.title} » sera annulé et <strong>toutes les inscriptions actives</strong> seront
              remboursées en crédits Eza automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Motif (optionnel)</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2}
              placeholder="Raison communiquée…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={busy}>Fermer</Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Annuler & rembourser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(o) => { if (!o) setRefundTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rembourser l'inscription</DialogTitle>
            <DialogDescription>
              {refundTarget?.user_name} ({refundTarget?.user_email}) sera désinscrit de
              « {refundTarget?.event_title} » et <strong>{refundTarget?.credits_paid} crédits Eza</strong> lui seront rendus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Note (optionnel)</Label>
            <Textarea value={refundNote} onChange={(e) => setRefundNote(e.target.value)} rows={2}
              placeholder="Note interne…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundTarget(null)} disabled={busy}>Fermer</Button>
            <Button onClick={confirmRefund} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Confirmer le remboursement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}