import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ExternalLink, CreditCard, FileText, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const STATUS_LABELS = {
  active: { label: 'Actif', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', icon: CheckCircle },
  past_due: { label: 'Impayé', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', icon: AlertCircle },
  canceled: { label: 'Annulé', color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border', icon: XCircle },
  trialing: { label: 'Essai', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', icon: Clock },
  unpaid: { label: 'Impayé', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', icon: AlertCircle },
};

const INVOICE_STATUS = {
  paid: { label: 'Payée', color: 'text-green-400' },
  open: { label: 'En attente', color: 'text-amber-400' },
  void: { label: 'Annulée', color: 'text-muted-foreground' },
  uncollectible: { label: 'Irrécupérable', color: 'text-red-400' },
};

function formatAmount(amount, currency = 'eur') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
}

export default function BillingTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('getMySubscriptions', {});
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    const res = await base44.functions.invoke('getStripePortalUrl', {});
    setPortalLoading(false);
    if (res.data?.url) {
      window.open(res.data.url, '_blank');
    } else {
      toast.error('Impossible d\'ouvrir le portail de facturation');
    }
  };

  const handleCancel = async (subscriptionId, immediately) => {
    if (!confirm(immediately ? 'Annuler immédiatement cet abonnement ? Vous serez remboursé au prorata.' : 'Annuler cet abonnement à la fin de la période en cours ?')) return;
    setCancelling(subscriptionId);
    const res = await base44.functions.invoke('cancelSubscription', { subscriptionId, immediately });
    setCancelling(null);
    if (res.data?.success) {
      toast.success(immediately ? 'Abonnement annulé immédiatement' : 'Abonnement programmé pour annulation');
      fetchData();
    } else {
      toast.error(res.data?.error || 'Erreur lors de l\'annulation');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-primary animate-spin" />
    </div>
  );

  if (error) return (
    <div className="py-16 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto">
        <CreditCard className="w-7 h-7 text-muted-foreground/40" />
      </div>
      <div>
        <p className="font-grotesk font-bold text-base">Aucun abonnement trouvé</p>
        <p className="font-inter text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Vous n'avez pas encore d'abonnement actif sur cette plateforme.</p>
      </div>
    </div>
  );

  const { subscriptions = [], invoices = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-grotesk font-bold text-lg">Facturation & abonnements</h2>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm" className="border-border gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </Button>
          <Button onClick={handleOpenPortal} disabled={portalLoading} size="sm" className="bg-primary text-primary-foreground gap-1.5 text-xs">
            {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
            Portail Stripe
          </Button>
        </div>
      </div>

      {/* Abonnements */}
      <div>
        <p className="font-inter text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Mes abonnements ({subscriptions.length})
        </p>
        {subscriptions.length === 0 ? (
          <div className="p-6 bg-card border border-dashed border-border rounded-2xl text-center">
            <p className="font-inter text-sm text-muted-foreground">Aucun abonnement actif</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map(sub => {
              const s = STATUS_LABELS[sub.status] || STATUS_LABELS.canceled;
              const StatusIcon = s.icon;
              const isCancellingThis = cancelling === sub.id;
              return (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl bg-card border ${s.border} space-y-4`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      {sub.items.map(item => (
                        <div key={item.id}>
                          <p className="font-grotesk font-bold text-base">{item.product_name}</p>
                          <p className="font-mono text-sm text-primary">
                            {formatAmount(item.amount, item.currency)} / {item.interval === 'month' ? 'mois' : 'an'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.color} border ${s.border}`}>
                      <StatusIcon className="w-3 h-3" />
                      {s.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                      <p className="text-muted-foreground mb-0.5 font-mono">Période en cours</p>
                      <p className="font-inter font-medium">
                        {format(new Date(sub.current_period_start * 1000), 'd MMM', { locale: fr })} → {format(new Date(sub.current_period_end * 1000), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                      <p className="text-muted-foreground mb-0.5 font-mono">Prochain renouvellement</p>
                      <p className="font-inter font-medium">
                        {sub.cancel_at_period_end
                          ? <span className="text-amber-400">Annulation le {format(new Date(sub.current_period_end * 1000), 'd MMM yyyy', { locale: fr })}</span>
                          : sub.status === 'canceled'
                          ? <span className="text-muted-foreground">Annulé</span>
                          : format(new Date(sub.current_period_end * 1000), 'd MMM yyyy', { locale: fr })
                        }
                      </p>
                    </div>
                  </div>

                  {sub.status === 'active' && !sub.cancel_at_period_end && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleCancel(sub.id, false)}
                        disabled={isCancellingThis}
                        variant="outline"
                        size="sm"
                        className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 text-xs gap-1.5"
                      >
                        {isCancellingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                        Annuler en fin de période
                      </Button>
                      <Button
                        onClick={() => handleCancel(sub.id, true)}
                        disabled={isCancellingThis}
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs gap-1.5"
                      >
                        {isCancellingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        Annuler immédiatement
                      </Button>
                    </div>
                  )}

                  {sub.cancel_at_period_end && (
                    <p className="text-xs text-amber-400 font-inter flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Cet abonnement sera annulé automatiquement le {format(new Date(sub.current_period_end * 1000), 'd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historique factures */}
      <div>
        <p className="font-inter text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Historique des factures ({invoices.length})
        </p>
        {invoices.length === 0 ? (
          <div className="p-6 bg-card border border-dashed border-border rounded-2xl text-center">
            <p className="font-inter text-sm text-muted-foreground">Aucune facture</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground font-normal">Facture</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground font-normal hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground font-normal">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground font-normal hidden sm:table-cell">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map(inv => {
                  const invStatus = INVOICE_STATUS[inv.status] || { label: inv.status, color: 'text-muted-foreground' };
                  return (
                    <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{inv.number || inv.id.slice(-8)}</td>
                      <td className="px-4 py-3 font-inter text-xs text-muted-foreground hidden sm:table-cell">
                        {format(new Date(inv.created * 1000), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        {formatAmount(inv.amount_paid, inv.currency)}
                      </td>
                      <td className={`px-4 py-3 text-xs font-inter font-medium ${invStatus.color} hidden sm:table-cell`}>
                        {invStatus.label}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.invoice_pdf && (
                          <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-primary/10">
                              <Download className="w-3.5 h-3.5 text-primary" />
                            </Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="font-inter text-xs text-muted-foreground text-center">
        Pour toute question, utilisez le <button onClick={handleOpenPortal} className="text-primary hover:underline">portail de facturation Stripe</button> ou contactez notre support.
      </p>
    </div>
  );
}