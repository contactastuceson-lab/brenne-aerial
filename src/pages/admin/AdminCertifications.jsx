import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Clock, Eye, Mail, AlertCircle, Award, CreditCard, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminCertifications() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();
  const [certificationsEnabled, setCertificationsEnabled] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['certification-requests'],
    queryFn: () => base44.entities.CertificationRequest.list('-created_date', 100),
  });

  const { data: appSettings = [] } = useQuery({
    queryKey: ['app-settings-certifications'],
    queryFn: () => base44.entities.AppSettings.filter({ key: 'certifications_enabled' }),
    onSuccess: (settings) => {
      if (settings.length > 0) {
        setCertificationsEnabled(settings[0].value === 'true');
      }
    },
  });

  const toggleCertifications = async () => {
    setToggleLoading(true);
    try {
      const setting = appSettings.find(s => s.key === 'certifications_enabled');
      const newValue = !certificationsEnabled;
      
      if (setting) {
        await base44.entities.AppSettings.update(setting.id, { value: String(newValue) });
      } else {
        await base44.entities.AppSettings.create({ key: 'certifications_enabled', value: String(newValue) });
      }
      
      setCertificationsEnabled(newValue);
      queryClient.invalidateQueries({ queryKey: ['app-settings-certifications'] });
      toast.success(newValue ? 'Certifications activées' : 'Certifications désactivées');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setToggleLoading(false);
    }
  };

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

  const refundMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('refundCertification', { certificationRequestId: id }),
    onSuccess: (data) => {
      if (data?.data?.error) { toast.error(data.data.error); return; }
      queryClient.invalidateQueries({ queryKey: ['certification-requests'] });
      toast.success('Remboursement effectué et email envoyé');
      setSelectedRequest(null);
    },
    onError: () => toast.error('Erreur lors du remboursement'),
  });

  const sendEmailMutation = useMutation({
    mutationFn: (request) => base44.functions.invoke('sendCertificationEmail', {
      certificationRequestId: request.id,
      status: request.status,
      adminNotes: adminNotes,
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
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl lg:text-3xl mb-1">Certifications</h1>
          <p className="text-muted-foreground text-xs lg:text-sm">Demandes de certification utilisateur</p>
        </div>
        <Button
          onClick={toggleCertifications}
          disabled={toggleLoading}
          variant={certificationsEnabled ? 'default' : 'outline'}
          className={`h-9 lg:h-10 text-xs lg:text-sm gap-2 flex-shrink-0 ${certificationsEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-destructive text-destructive'}`}
        >
          {certificationsEnabled ? '✓ Actif' : '✕ Off'}
        </Button>
      </div>

      {!certificationsEnabled && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-destructive/10 border border-destructive/30 rounded-2xl p-3 lg:p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-xs lg:text-sm">Certifications désactivées</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">Les utilisateurs ne peuvent plus demander de certification.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {[
          { icon: Clock, color: 'from-yellow-500/10 to-yellow-500/5', iconColor: 'text-yellow-400', label: 'En attente', value: stats.pending },
          { icon: CheckCircle, color: 'from-green-500/10 to-green-500/5', iconColor: 'text-green-400', label: 'Approuvées', value: stats.approved },
          { icon: XCircle, color: 'from-red-500/10 to-red-500/5', iconColor: 'text-red-400', label: 'Refusées', value: stats.rejected }
        ].map(({ icon: Icon, color, iconColor, label, value }, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} 
            className={`bg-gradient-to-br ${color} border border-border rounded-xl p-3 lg:p-4 hover:border-primary/30 transition-colors`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <p className="text-[10px] lg:text-xs text-muted-foreground">{label}</p>
            </div>
            <p className={`text-xl lg:text-2xl font-bold ${iconColor}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Requests list */}
      <div className="space-y-2">
        <p className="text-[10px] lg:text-xs text-muted-foreground px-1 font-mono uppercase tracking-wide">Demandes ({requests.length})</p>
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <Award className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-xs lg:text-sm text-muted-foreground">Aucune demande</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {requests.map((r, idx) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                className="p-3 lg:p-4 bg-gradient-to-r from-card to-card border border-border rounded-xl hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => { setSelectedRequest(r); setAdminNotes(r.admin_notes || ''); }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                     <p className="font-grotesk font-bold text-xs lg:text-sm text-foreground">{r.display_name || r.user_name}</p>
                     <p className="font-mono text-[10px] text-muted-foreground truncate">{r.user_email}</p>
                   </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-semibold border ${
                      r.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' :
                      r.status === 'approved' ? 'bg-green-400/10 text-green-400 border-green-400/30' :
                      'bg-red-400/10 text-red-400 border-red-400/30'
                    }`}>
                      {r.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                      {r.status === 'approved' && <CheckCircle className="w-2.5 h-2.5" />}
                      {r.status === 'rejected' && <XCircle className="w-2.5 h-2.5" />}
                      <span className="hidden sm:inline">{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px] lg:text-xs">
                  <span className={`px-2 py-0.5 rounded-lg font-semibold border ${
                    r.payment_status === 'completed' ? 'bg-green-400/10 text-green-400 border-green-400/30' :
                    r.payment_status === 'failed' ? 'bg-red-400/10 text-red-400 border-red-400/30' :
                    'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                  }`}>
                    {r.payment_status === 'completed' ? '✓' : r.payment_status === 'failed' ? '✕' : '⏳'}
                  </span>
                  <span className="text-muted-foreground">{format(new Date(r.created_date), 'd MMM', { locale: fr })}</span>
                  <Eye className="w-3 h-3 text-primary opacity-60" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
               <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                 <Award className="w-4 h-4 text-primary" />
               </div>
               <div className="min-w-0">
                 <h2 className="font-grotesk font-bold text-xs lg:text-base">Certification</h2>
                 <p className="font-mono text-[10px] text-muted-foreground truncate">{selectedRequest.display_name || selectedRequest.user_name}</p>
               </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-semibold border ${
                  selectedRequest.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' :
                  selectedRequest.status === 'approved' ? 'bg-green-400/10 text-green-400 border-green-400/30' :
                  'bg-red-400/10 text-red-400 border-red-400/30'
                }`}>
                  {selectedRequest.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                  {selectedRequest.status === 'approved' && <CheckCircle className="w-2.5 h-2.5" />}
                  {selectedRequest.status === 'rejected' && <XCircle className="w-2.5 h-2.5" />}
                </span>
                <button onClick={() => setSelectedRequest(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1 lg:p-2">
                  <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 lg:space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">Utilisateur</p>
                    <p className="font-grotesk font-semibold text-xs lg:text-sm">{selectedRequest.display_name || selectedRequest.user_name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">{selectedRequest.user_email}</p>
                  </div>
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">Paiement</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] lg:text-xs font-semibold ${
                    selectedRequest.payment_status === 'completed' ? 'text-green-400' :
                    selectedRequest.payment_status === 'refunded' ? 'text-blue-400' :
                    selectedRequest.payment_status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {selectedRequest.payment_status === 'completed' ? '✓ Payé' :
                     selectedRequest.payment_status === 'refunded' ? '↩ Remboursé' :
                     selectedRequest.payment_status === 'failed' ? '✕ Échoué' : '⏳ En attente'}
                  </span>
                </div>
              </div>

              {/* Stripe info */}
              {selectedRequest.stripe_session_id && (
                <div className="bg-secondary/50 rounded-xl p-3 border border-border space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> Stripe</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[10px] text-foreground truncate flex-1">{selectedRequest.stripe_session_id}</p>
                    <button onClick={() => { navigator.clipboard.writeText(selectedRequest.stripe_session_id); toast.success('Copié'); }}
                      className="p-1 rounded hover:bg-primary/10 transition-colors flex-shrink-0">
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <a href={`https://dashboard.stripe.com/payments/${selectedRequest.stripe_session_id}`} target="_blank" rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-primary/10 transition-colors flex-shrink-0">
                      <ExternalLink className="w-3 h-3 text-primary" />
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                <p className="font-mono text-[10px] text-muted-foreground mb-1">Soumis</p>
                <p className="font-inter text-xs lg:text-sm">{format(new Date(selectedRequest.created_date), 'd MMMM yyyy à HH:mm', { locale: fr })}</p>
              </div>

              {/* Form responses */}
              {selectedRequest.responses && Object.keys(selectedRequest.responses).length > 0 && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5">Réponses</p>
                  <div className="space-y-2">
                    {Object.entries(selectedRequest.responses).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-border bg-secondary/50 p-3">
                        <p className="font-mono text-[10px] text-muted-foreground mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                        {String(value).startsWith('http') ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="font-inter text-xs lg:text-sm text-primary hover:underline break-all">{value}</a>
                        ) : (
                          <p className="font-inter text-xs lg:text-sm text-foreground whitespace-pre-wrap break-words">{value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin notes */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Notes admin</p>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Observations, motif..."
                  className="bg-secondary border-border min-h-20 lg:min-h-24 text-xs lg:text-sm resize-none font-inter rounded-xl"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 border-t border-border p-4 space-y-2 bg-card">
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => rejectMutation.mutate(selectedRequest.id)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 gap-2 text-xs lg:text-sm h-8 lg:h-9 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                    variant="outline"
                  >
                    <XCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(selectedRequest.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 gap-2 text-xs lg:text-sm h-8 lg:h-9 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                    Approuver
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => sendEmailMutation.mutate(selectedRequest)}
                className="w-full gap-2 border-border text-xs lg:text-sm h-8 lg:h-9"
                disabled={sendEmailMutation.isPending}
              >
                <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                Email notification
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}