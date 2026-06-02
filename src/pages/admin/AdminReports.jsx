import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flag, Eye, Check, X, User, MessageCircle, ExternalLink, Search, Zap, AlertCircle, TrendingUp, Shield, Trash2, Mail, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  reviewing: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  resolved: 'bg-green-400/10 text-green-400 border-green-400/30',
  dismissed: 'bg-red-400/10 text-red-400 border-red-400/30',
};

const STATUS_ICONS = {
  pending: AlertCircle,
  reviewing: TrendingUp,
  resolved: Check,
  dismissed: X,
};

const REASON_LABELS = {
  spam: '🚫 Spam',
  harcelement: '⚠️ Harcèlement',
  contenu_inapproprie: '🔞 Contenu inapproprié',
  usurpation: "🎭 Usurpation d'identité",
  autre: '❓ Autre',
};

export default function AdminReports() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [adminNotes, setAdminNotes] = useState('');
  const [action, setAction] = useState(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 100),
  });

  const logAction = async (action, entityId, changes) => {
    try {
      await base44.functions.invoke('logAuditAction', { action, entity_type: 'Report', entity_id: entityId, changes });
    } catch (e) {
      console.error('Audit log error:', e);
    }
  };

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: (_, { id, data }) => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      logAction('update', id, data);
      setSelected(null);
      setAction(null);
      toast.success('✓ Signalement mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteReport = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      logAction('delete', id, {});
      setSelected(null);
      toast.success('✓ Signalement supprimé');
    },
  });

  const filtered = useMemo(() => {
    let result = reports;
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    if (filterType !== 'all') result = result.filter(r => r.target_type === filterType);
    if (filterReason !== 'all') result = result.filter(r => r.reason === filterReason);
    if (searchQuery) result = result.filter(r => 
      r.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === 'recent') result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (sortBy === 'pending') result.sort((a, b) => (a.status === 'pending' ? -1 : 1));
    return result;
  }, [reports, filterStatus, filterType, filterReason, searchQuery, sortBy]);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3 mb-4">
          <Flag className="w-6 h-6 text-destructive" /> Modération des signalements
        </h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="font-mono text-[10px] text-muted-foreground mb-1">TOTAL</p>
            <p className="font-grotesk font-bold text-xl">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-yellow-400/30 bg-yellow-400/5">
            <p className="font-mono text-[10px] text-yellow-400 mb-1">EN ATTENTE</p>
            <p className="font-grotesk font-bold text-xl text-yellow-400">{stats.pending}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-blue-400/30 bg-blue-400/5">
            <p className="font-mono text-[10px] text-blue-400 mb-1">EN COURS</p>
            <p className="font-grotesk font-bold text-xl text-blue-400">{stats.reviewing}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-green-400/30 bg-green-400/5">
            <p className="font-mono text-[10px] text-green-400 mb-1">RÉSOLUS</p>
            <p className="font-grotesk font-bold text-xl text-green-400">{stats.resolved}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-red-400/30 bg-red-400/5">
            <p className="font-mono text-[10px] text-red-400 mb-1">REJETÉS</p>
            <p className="font-grotesk font-bold text-xl text-red-400">{stats.dismissed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Chercher par nom, email ou signaleur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-card border-border pl-10"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="reviewing">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="dismissed">Rejetés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="user">👤 Utilisateur</SelectItem>
                <SelectItem value="content">💬 Contenu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterReason} onValueChange={setFilterReason}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Raison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les raisons</SelectItem>
                <SelectItem value="spam">🚫 Spam</SelectItem>
                <SelectItem value="harcelement">⚠️ Harcèlement</SelectItem>
                <SelectItem value="contenu_inapproprie">🔞 Contenu inapproprié</SelectItem>
                <SelectItem value="usurpation">🎭 Usurpation d'identité</SelectItem>
                <SelectItem value="autre">❓ Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Tri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="pending">En attente d'abord</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Flag className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="font-inter text-sm text-muted-foreground">Aucun signalement trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const StatusIcon = STATUS_ICONS[r.status] || AlertCircle;
            const daysSince = differenceInDays(new Date(), new Date(r.created_date));
            const isUrgent = daysSince > 7 && r.status === 'pending';
            
            return (
              <div 
                key={r.id} 
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  isUrgent ? 'bg-red-400/5 border-red-400/30 hover:border-red-400/50' : 'bg-card border-border hover:border-primary/20'
                }`}
                onClick={() => { setSelected(r); setAdminNotes(r.admin_notes || ''); }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${(STATUS_COLORS[r.status] || 'bg-muted').split(' ')[0]}`}>
                  <StatusIcon className={`w-4 h-4 ${(STATUS_COLORS[r.status] || 'text-muted-foreground').split(' ')[2]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-inter font-semibold text-sm">{r.target_name || r.target_email}</span>
                    {isUrgent && <span className="text-[10px] font-bold bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full">URGENT</span>}
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="font-inter text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {REASON_LABELS[r.reason] || r.reason}
                    </span>
                    {r.target_type === 'user' && <span className="text-[9px] text-primary font-mono">👤</span>}
                    {r.target_type !== 'user' && <span className="text-[9px] text-accent font-mono">💬</span>}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Signalé par {r.reporter_name} · {r.created_date ? format(new Date(r.created_date), 'd MMM yyyy à HH:mm', { locale: fr }) : ''} ({daysSince}j)
                  </p>
                  {r.message_content && (
                    <p className="font-inter text-xs text-muted-foreground mt-1 truncate italic">"{r.message_content}"</p>
                  )}
                  {r.admin_notes && (
                    <p className="font-inter text-xs text-primary/80 mt-1 truncate">💬 {r.admin_notes}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" className="border-border text-xs flex-shrink-0 gap-1.5">
                  <Eye className="w-3 h-3" /> Traiter
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setAction(null); }}>
        <DialogContent className="bg-card border-border max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold text-lg">Traiter le signalement</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Timeline */}
              <div className="flex gap-2 text-xs">
                <div className={`px-2 py-1 rounded-full border font-mono font-semibold ${STATUS_COLORS[selected.status]}`}>
                  {selected.status}
                </div>
                <div className="px-2 py-1 rounded-full border border-border bg-secondary text-muted-foreground font-mono text-[10px]">
                  {differenceInDays(new Date(), new Date(selected.created_date))} j
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/60 rounded-lg p-3.5">
                  <p className="font-mono text-[8px] text-muted-foreground mb-1.5 font-semibold">SIGNALÉ PAR</p>
                  <p className="font-inter text-sm font-semibold">{selected.reporter_name}</p>
                  <p className="font-mono text-[9px] text-muted-foreground mt-0.5">{selected.reporter_email}</p>
                </div>
                <div className="bg-secondary/60 rounded-lg p-3.5">
                  <p className="font-mono text-[8px] text-muted-foreground mb-1.5 font-semibold">CIBLE</p>
                  <p className="font-inter text-sm font-semibold">{selected.target_name || selected.target_email}</p>
                  <p className="font-mono text-[9px] text-muted-foreground mt-0.5 capitalize">{selected.target_type === 'user' ? '👤 Utilisateur' : '💬 Contenu'}</p>
                </div>
              </div>

              {/* Reason and details */}
              <div className="bg-secondary/40 rounded-lg p-3.5 space-y-2">
                <div>
                  <p className="font-mono text-[8px] text-muted-foreground mb-1 font-semibold">RAISON</p>
                  <p className="font-inter text-sm">{REASON_LABELS[selected.reason]}</p>
                </div>
                {selected.details && (
                  <div className="border-t border-border pt-2">
                    <p className="font-mono text-[8px] text-muted-foreground mb-1 font-semibold">DÉTAILS</p>
                    <p className="font-inter text-xs text-muted-foreground">{selected.details}</p>
                  </div>
                )}
              </div>

              {/* Message content */}
              {selected.message_content && (
                <div className="bg-secondary/40 rounded-lg p-3.5">
                  <p className="font-mono text-[8px] text-muted-foreground mb-2 font-semibold">MESSAGE SIGNALÉ</p>
                  <p className="font-inter text-xs italic bg-background/40 p-2.5 rounded border border-border">"{selected.message_content}"</p>
                </div>
              )}

              {/* Quick actions */}
              {selected.target_type === 'user' && (
                <Link to="/admin/users" className="w-full">
                  <Button variant="outline" size="sm" className="border-border text-xs gap-1.5 w-full">
                    <ExternalLink className="w-3 h-3" /> Voir le profil de l'utilisateur
                  </Button>
                </Link>
              )}

              {/* Notes */}
              <div>
                <label className="font-inter text-xs font-semibold text-foreground mb-2 block">Actions & Décisions</label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="bg-secondary border-border font-inter text-sm resize-none h-20"
                  placeholder="Ex: Compte banni pour 30 jours, message supprimé, utilisateur notifié..."
                />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="border border-green-400/30 bg-green-400/10 text-green-400 hover:bg-green-400/20 text-xs gap-1.5 font-medium"
                  onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'resolved', admin_notes: adminNotes } })}
                  disabled={updateReport.isPending}
                >
                  <Check className="w-3 h-3" /> Résoudre
                </Button>
                <Button
                  className="border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20 text-xs gap-1.5 font-medium"
                  onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'dismissed', admin_notes: adminNotes } })}
                  disabled={updateReport.isPending}
                >
                  <X className="w-3 h-3" /> Rejeter
                </Button>
              </div>

              {/* Secondary actions */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Button
                  className="w-full bg-blue-400/10 border border-blue-400/30 text-blue-400 hover:bg-blue-400/20 text-xs gap-1.5 font-medium"
                  onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'reviewing', admin_notes: adminNotes } })}
                  disabled={updateReport.isPending}
                >
                  <TrendingUp className="w-3 h-3" /> Passer en cours d'examen
                </Button>
                <Button
                  className="w-full bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 text-xs gap-1.5 font-medium"
                  onClick={() => deleteReport.mutate(selected.id)}
                  disabled={deleteReport.isPending}
                >
                  <Trash2 className="w-3 h-3" /> Supprimer ce signalement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}