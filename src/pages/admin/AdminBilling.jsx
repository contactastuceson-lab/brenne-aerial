import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  CreditCard, RefreshCw, TrendingUp, Users, AlertCircle, CheckCircle,
  XCircle, ExternalLink, Search, Filter, Download, Ban, RotateCcw,
  FileText, Euro, Clock, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  past_due: { label: 'Impayé', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  canceled: { label: 'Annulé', color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border' },
  trialing: { label: 'Essai', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  unpaid: { label: 'Non payé', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  incomplete: { label: 'Incomplet', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
};

const INVOICE_STATUS = {
  paid: { label: 'Payée', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  open: { label: 'Ouverte', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  void: { label: 'Annulée', color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border' },
  uncollectible: { label: 'Irrécouvrable', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

function formatAmount(amount, currency = 'eur') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
        <p className={`font-grotesk font-bold text-lg ${color}`}>{value}</p>
        {sub && <p className="font-mono text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function SubscriptionRow({ sub, onManage }) {
  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
  const totalAmount = sub.items.reduce((s, i) => s + (i.amount || 0), 0);
  const currency = sub.items[0]?.currency || 'eur';
  const productName = sub.items.map(i => i.product_name).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 lg:p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-grotesk font-semibold text-sm">{sub.customer_email || '—'}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
              {cfg.label}
              {sub.cancel_at_period_end && sub.status === 'active' && (
                <span className="text-orange-400 ml-1">· Fin prévue</span>
              )}
            </span>
          </div>
          <p className="font-inter text-xs text-muted-foreground">{productName}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatAmount(totalAmount, currency)}/{sub.items[0]?.interval || 'mois'}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Renouvellement : {format(new Date(sub.current_period_end * 1000), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a href={`https://dashboard.stripe.com/subscriptions/${sub.id}`} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
          </a>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-border"
            onClick={() => onManage(sub)}>
            <Eye className="w-3 h-3" />
            Gérer
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function InvoiceRow({ inv }) {
  const cfg = INVOICE_STATUS[inv.status] || INVOICE_STATUS.open;
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-mono text-xs font-semibold text-foreground">{inv.number || inv.id.slice(0, 12)}</p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <p className="font-inter text-[10px] text-muted-foreground mt-0.5">{inv.customer_email} · {format(new Date(inv.created * 1000), 'd MMM yyyy', { locale: fr })}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-grotesk font-bold text-sm text-foreground">{formatAmount(inv.amount_paid, inv.currency)}</span>
        {inv.hosted_invoice_url && (
          <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
          </a>
        )}
        {inv.invoice_pdf && (
          <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
            <Download className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function AdminBilling() {
  const [tab, setTab] = useState('subscriptions');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-billing'],
    queryFn: () => base44.functions.invoke('adminGetAllSubscriptions', {}),
    select: (res) => res.data,
  });

  const manageMutation = useMutation({
    mutationFn: (params) => base44.functions.invoke('adminManageSubscription', params),
    onSuccess: (res) => {
      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success('Action effectuée');
      queryClient.invalidateQueries({ queryKey: ['admin-billing'] });
      setSelectedSub(null);
    },
    onError: () => toast.error('Erreur'),
  });

  const subscriptions = data?.subscriptions || [];
  const invoices = data?.invoices || [];
  const stats = data?.stats || {};

  const filteredSubs = subscriptions.filter(s => {
    const matchSearch = !search || s.customer_email?.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredInvoices = invoices.filter(i =>
    !search || i.customer_email?.toLowerCase().includes(search.toLowerCase()) || i.number?.includes(search)
  );

  const tabs = [
    { key: 'subscriptions', label: 'Abonnements', count: stats.total },
    { key: 'invoices', label: 'Factures', count: stats.total_invoices },
  ];

  const statusFilters = ['all', 'active', 'past_due', 'canceled', 'trialing'];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl lg:text-3xl mb-1">Facturation</h1>
          <p className="text-muted-foreground text-xs lg:text-sm">Gestion des abonnements et paiements Stripe</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border gap-2 h-8 text-xs" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </Button>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2 h-8 text-xs bg-primary text-primary-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
              Stripe
            </Button>
          </a>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Euro} label="MRR" value={formatAmount(stats.mrr || 0)} sub="Revenus mensuels récurrents" color="text-green-400" bg="bg-green-400/10" />
          <StatCard icon={Users} label="Actifs" value={stats.active || 0} sub={`sur ${stats.total || 0} abonnements`} color="text-primary" bg="bg-primary/10" />
          <StatCard icon={AlertCircle} label="Impayés" value={stats.past_due || 0} color="text-red-400" bg="bg-red-400/10" />
          <StatCard icon={TrendingUp} label="Total collecté" value={formatAmount(stats.total_collected || 0)} sub={`${stats.total_invoices || 0} factures`} color="text-accent" bg="bg-accent/10" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par email, ID..."
            className="pl-9 h-8 text-xs bg-secondary border-border" />
        </div>
        {tab === 'subscriptions' && (
          <div className="flex gap-1 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${statusFilter === s
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-secondary text-muted-foreground border-border hover:border-primary/20'}`}>
                {s === 'all' ? 'Tous' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tab === 'subscriptions' && (
            <>
              <p className="font-mono text-[10px] text-muted-foreground px-1 uppercase tracking-wide">
                {filteredSubs.length} abonnement{filteredSubs.length !== 1 ? 's' : ''}
              </p>
              {filteredSubs.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-xs text-muted-foreground">Aucun abonnement trouvé</p>
                </div>
              ) : (
                filteredSubs.map(sub => (
                  <SubscriptionRow key={sub.id} sub={sub} onManage={setSelectedSub} />
                ))
              )}
            </>
          )}

          {tab === 'invoices' && (
            <>
              <p className="font-mono text-[10px] text-muted-foreground px-1 uppercase tracking-wide">
                {filteredInvoices.length} facture{filteredInvoices.length !== 1 ? 's' : ''}
              </p>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-xs text-muted-foreground">Aucune facture trouvée</p>
                </div>
              ) : (
                filteredInvoices.map(inv => <InvoiceRow key={inv.id} inv={inv} />)
              )}
            </>
          )}
        </div>
      )}

      {/* Manage Subscription Modal */}
      {selectedSub && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSub(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-grotesk font-bold text-base">Gérer l'abonnement</h2>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{selectedSub.id}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-muted-foreground hover:text-foreground p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">Client</p>
                  <p className="font-inter text-xs font-semibold">{selectedSub.customer_email}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">Statut</p>
                  <span className={`text-xs font-semibold ${STATUS_CONFIG[selectedSub.status]?.color}`}>
                    {STATUS_CONFIG[selectedSub.status]?.label || selectedSub.status}
                  </span>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">Produit</p>
                  <p className="font-inter text-xs">{selectedSub.items.map(i => i.product_name).join(', ')}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">Montant</p>
                  <p className="font-grotesk font-bold text-sm text-primary">
                    {formatAmount(selectedSub.items.reduce((s, i) => s + (i.amount || 0), 0), selectedSub.items[0]?.currency)}
                    /{selectedSub.items[0]?.interval || 'mois'}
                  </p>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-3 border border-border space-y-1">
                <p className="font-mono text-[10px] text-muted-foreground">Période en cours</p>
                <p className="font-inter text-xs">
                  {format(new Date(selectedSub.current_period_start * 1000), 'd MMM yyyy', { locale: fr })} →{' '}
                  {format(new Date(selectedSub.current_period_end * 1000), 'd MMM yyyy', { locale: fr })}
                </p>
                {selectedSub.cancel_at_period_end && (
                  <p className="font-inter text-xs text-orange-400 font-semibold">⚠ Annulation prévue en fin de période</p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {selectedSub.status === 'active' && !selectedSub.cancel_at_period_end && (
                  <Button
                    onClick={() => { if (confirm('Planifier l\'annulation en fin de période ?')) manageMutation.mutate({ action: 'cancel', subscriptionId: selectedSub.id, immediately: false }); }}
                    disabled={manageMutation.isPending}
                    variant="outline"
                    className="w-full gap-2 text-xs border-orange-400/30 text-orange-400 hover:bg-orange-400/10 h-9">
                    <Clock className="w-3.5 h-3.5" />
                    Annuler en fin de période
                  </Button>
                )}
                {selectedSub.status === 'active' && selectedSub.cancel_at_period_end && (
                  <Button
                    onClick={() => manageMutation.mutate({ action: 'reactivate', subscriptionId: selectedSub.id })}
                    disabled={manageMutation.isPending}
                    className="w-full gap-2 text-xs bg-green-600 hover:bg-green-700 text-white h-9">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réactiver l'abonnement
                  </Button>
                )}
                {selectedSub.status !== 'canceled' && (
                  <Button
                    onClick={() => { if (confirm('ATTENTION : annuler IMMÉDIATEMENT cet abonnement ? Action irréversible.')) manageMutation.mutate({ action: 'cancel', subscriptionId: selectedSub.id, immediately: true }); }}
                    disabled={manageMutation.isPending}
                    variant="outline"
                    className="w-full gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 h-9">
                    <Ban className="w-3.5 h-3.5" />
                    Annuler immédiatement
                  </Button>
                )}
                <a href={`https://dashboard.stripe.com/subscriptions/${selectedSub.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 text-xs border-border h-9">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Voir sur Stripe
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}