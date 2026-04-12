import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Clock, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminCertifications() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['certification-requests'],
    queryFn: () => base44.entities.CertificationRequest.list('-created_date', 100),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.CertificationRequest.update(id, {
      status: 'approved',
      admin_notes: adminNotes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification-requests'] });
      toast.success('Demande approuvée');
      setSelectedRequest(null);
      setAdminNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => base44.entities.CertificationRequest.update(id, {
      status: 'rejected',
      admin_notes: adminNotes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification-requests'] });
      toast.success('Demande refusée');
      setSelectedRequest(null);
      setAdminNotes('');
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (request) => base44.integrations.Core.SendEmail({
      to: request.user_email,
      subject: `Demande de certification — ${request.status === 'approved' ? 'Approuvée' : 'Refusée'}`,
      body: `Bonjour ${request.user_name},\n\nVotre demande de certification a été ${request.status === 'approved' ? 'approuvée' : 'refusée'}.\n\nNotes : ${adminNotes || 'Aucune'}\n\nCordialement,\nL'équipe Brenne Aerial`,
    }),
    onSuccess: () => toast.success('Email envoyé'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-grotesk font-bold text-3xl mb-2">Certifications</h1>
        <p className="text-muted-foreground">Gérez les demandes de certification des utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-xs text-muted-foreground">Approuvées</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-muted-foreground">Refusées</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Requests list */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-xs">Utilisateur</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Statut</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Paiement</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Date</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{r.user_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.user_email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' :
                      r.status === 'approved' ? 'bg-green-400/10 text-green-400 border border-green-400/30' :
                      'bg-red-400/10 text-red-400 border border-red-400/30'
                    }`}>
                      {r.status === 'pending' && <Clock className="w-3 h-3" />}
                      {r.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {r.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                      r.payment_status === 'completed' ? 'bg-green-400/10 text-green-400' :
                      r.payment_status === 'failed' ? 'bg-red-400/10 text-red-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(r);
                        setAdminNotes(r.admin_notes || '');
                      }}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details modal */}
      {selectedRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-grotesk font-bold text-xl mb-6">Détails de la demande</h2>

            {/* User info */}
            <div className="mb-6 p-4 rounded-lg bg-secondary space-y-2">
              <p className="text-xs text-muted-foreground">Utilisateur</p>
              <p className="font-semibold">{selectedRequest.user_name}</p>
              <p className="font-mono text-sm text-muted-foreground">{selectedRequest.user_email}</p>
            </div>

            {/* Responses */}
            {selectedRequest.responses && Object.keys(selectedRequest.responses).length > 0 && (
              <div className="mb-6 space-y-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Réponses</p>
                {Object.entries(selectedRequest.responses).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Admin notes */}
            <div className="mb-6 space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">Notes admin</p>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Ajoutez vos notes..."
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate(selectedRequest.id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(selectedRequest.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => sendEmailMutation.mutate(selectedRequest)}
              className="w-full mt-3 gap-2"
            >
              <Mail className="w-4 h-4" />
              Envoyer un email
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}