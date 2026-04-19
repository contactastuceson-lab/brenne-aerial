import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flag, Eye, Check, X, User, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  reviewed: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  resolved: 'bg-green-400/10 text-green-400 border-green-400/30',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

const REASON_LABELS = {
  spam: 'Spam',
  harcelement: 'Harcèlement',
  contenu_inapproprie: 'Contenu inapproprié',
  usurpation: "Usurpation d'identité",
  autre: 'Autre',
};

export default function AdminReports() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
  });

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelected(null);
      toast.success('Signalement mis à jour');
    },
  });

  const filtered = reports.filter(r => filterStatus === 'all' || r.status === filterStatus);
  const pending = reports.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
            <Flag className="w-6 h-6 text-destructive" /> Signalements
          </h1>
          <p className="font-inter text-sm text-muted-foreground">
            {pending > 0 ? <span className="text-yellow-400">{pending} en attente</span> : 'Aucun signalement en attente'}
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-card border-border w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="reviewed">En cours</SelectItem>
            <SelectItem value="resolved">Résolus</SelectItem>
            <SelectItem value="dismissed">Ignorés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.target_type === 'user' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                {r.target_type === 'user' ? <User className="w-4 h-4 text-primary" /> : <MessageCircle className="w-4 h-4 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-inter font-medium text-sm">{r.target_name || r.target_email}</span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {REASON_LABELS[r.reason] || r.reason}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Signalé par {r.reporter_name} · {r.created_date ? format(new Date(r.created_date), 'd MMM yyyy', { locale: fr }) : ''}
                </p>
                {r.message_content && (
                  <p className="font-inter text-xs text-muted-foreground mt-1 truncate italic">"{r.message_content}"</p>
                )}
              </div>
              <Button size="sm" variant="outline" className="border-border text-xs flex-shrink-0 gap-1.5" onClick={() => { setSelected(r); setAdminNotes(r.admin_notes || ''); }}>
                <Eye className="w-3 h-3" /> Traiter
              </Button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun signalement</div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">Traiter le signalement</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="font-mono text-[9px] text-muted-foreground mb-1">SIGNALÉ PAR</p>
                  <p className="font-inter text-sm">{selected.reporter_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{selected.reporter_email}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <p className="font-mono text-[9px] text-muted-foreground mb-1">CIBLE</p>
                  <p className="font-inter text-sm">{selected.target_name || selected.target_email}</p>
                  <p className="font-mono text-[10px] text-muted-foreground capitalize">{selected.target_type}</p>
                </div>
              </div>
              <div className="bg-secondary/60 rounded-lg p-3">
                <p className="font-mono text-[9px] text-muted-foreground mb-1">RAISON</p>
                <p className="font-inter text-sm">{REASON_LABELS[selected.reason]}</p>
                {selected.details && <p className="font-inter text-xs text-muted-foreground mt-1">{selected.details}</p>}
              </div>
              {selected.message_content && (
                <div className="bg-secondary/60 rounded-lg p-3">
                  <p className="font-mono text-[9px] text-muted-foreground mb-1">MESSAGE SIGNALÉ</p>
                  <p className="font-inter text-xs italic">"{selected.message_content}"</p>
                </div>
              )}
              {selected.target_type === 'user' && (
                <Link to="/admin/users">
                  <Button variant="outline" size="sm" className="border-border text-xs gap-1.5 w-full">
                    <ExternalLink className="w-3 h-3" /> Voir le profil de l'utilisateur dans Gestion des comptes
                  </Button>
                </Link>
              )}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Notes admin</label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="bg-secondary border-border font-inter text-sm resize-none h-20"
                  placeholder="Décision, contexte..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs gap-1.5"
                  onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'resolved', admin_notes: adminNotes } })}
                  disabled={updateReport.isPending}
                >
                  <Check className="w-3 h-3" /> Résoudre
                </Button>
                <Button
                  variant="outline"
                  className="border-muted text-muted-foreground hover:bg-secondary text-xs gap-1.5"
                  onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'dismissed', admin_notes: adminNotes } })}
                  disabled={updateReport.isPending}
                >
                  <X className="w-3 h-3" /> Ignorer
                </Button>
              </div>
              <Button
                className="w-full bg-blue-500/20 text-blue-400 border border-blue-400/30 hover:bg-blue-500/30 text-xs gap-1.5"
                onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'reviewed', admin_notes: adminNotes } })}
                disabled={updateReport.isPending}
              >
                Marquer "En cours de révision"
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}