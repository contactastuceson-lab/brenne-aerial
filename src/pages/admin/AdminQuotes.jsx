import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Check, X, Loader2, FileText, Settings, MapPin, Calendar, Clock, Phone, Mail, Building2, Search, TrendingUp, AlertCircle, Trash2, Send, Copy } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPrice, SERVICE_PRICES } from '@/lib/droneUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import QuoteTracking from '@/components/dashboard/QuoteTracking';

export default function AdminQuotes() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('quotes');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [prixFinal, setPrixFinal] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [newService, setNewService] = useState({ name: '', base_price: '', price_per_hour: '' });
  const [editingService, setEditingService] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['adm-quotes-list'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['adm-services-list'],
    queryFn: () => base44.entities.Service.list('order'),
  });

  const logAction = async (action, entityId, changes) => {
    try {
      await base44.functions.invoke('logAuditAction', { action, entity_type: 'Quote', entity_id: entityId, changes });
    } catch (e) {
      console.error('Audit log error:', e);
    }
  };

  const updateQ = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: (_, { id, data }) => { 
      qc.invalidateQueries({ queryKey: ['adm-quotes-list'] });
      logAction('update', id, data);
      setSelected(null);
      toast.success('✓ Devis mis à jour'); 
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteQ = useMutation({
    mutationFn: (id) => base44.entities.Quote.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['adm-quotes-list'] });
      logAction('delete', id, {});
      setSelected(null);
      toast.success('✓ Devis supprimé');
    },
  });

  const createService = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-services-list'] }); toast.success('Service créé'); setNewService({ name: '', base_price: '', price_per_hour: '' }); },
  });

  const updateService = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-services-list'] }); toast.success('Service mis à jour'); setEditingService(null); },
  });

  const deleteService = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-services-list'] }); toast.success('Service supprimé'); },
  });

  const geocodeLocation = async (address) => {
    if (!address) return null;
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`);
      const data = await res.json();
      const feature = data.features?.[0];
      return feature ? { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] } : null;
    } catch { return null; }
  };

  const handleAction = async (quote, status) => {
    const prix = prixFinal ? parseFloat(prixFinal) : undefined;
    await updateQ.mutateAsync({ id: quote.id, data: { status, admin_notes: adminNotes, prix_final: prix } });

    // Notification in-app
    await base44.entities.Notification.create({
      user_email: quote.client_email,
      title: status === 'accepted' ? '✅ Votre devis a été accepté !' : '❌ Votre devis a été refusé',
      content: `Prestation : ${SERVICE_PRICES[quote.service_type]?.label || quote.service_type}${prix ? ` — Prix final : ${formatPrice(prix)}` : ''}`,
      type: status === 'accepted' ? 'quote_accepted' : 'quote_refused',
      link: '/dashboard',
    });

    // Email HTML via sendQuoteEmail
    await base44.functions.invoke('sendQuoteEmail', {
      type: status === 'accepted' ? 'quote_accepted' : 'quote_refused',
      clientName: quote.client_name,
      clientEmail: quote.client_email,
      serviceType: quote.service_type,
      quoteId: quote.id,
      prix_final: prix ? String(prix) : null,
      adminNotes: adminNotes || null,
    });

    setSelected(null);
  };

  const [pdfLoading, setPdfLoading] = useState(null);

  const downloadQuotePDF = async (quoteId) => {
    setPdfLoading(quoteId);
    try {
      const res = await base44.functions.invoke('generateQuotePDF', { quoteId });
      if (!res.data?.html) { toast.error('Erreur lors de la génération'); return; }

      const { html, ref } = res.data;

      // Render HTML in a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 794,
        windowWidth: 794,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = pdfW * ratio;

      let position = 0;
      let remaining = imgH;
      let page = 0;

      while (remaining > 0) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -position, pdfW, imgH);
        position += pdfH;
        remaining -= pdfH;
        page++;
      }

      pdf.save(`devis-DEV-${ref}.pdf`);
      toast.success('Devis PDF téléchargé !');
    } catch (e) {
      console.error(e);
      toast.error('Erreur génération PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const filtered = useMemo(() => {
    let result = quotes;
    if (filterStatus !== 'all') result = result.filter(q => q.status === filterStatus);
    if (filterService !== 'all') result = result.filter(q => q.service_type === filterService);
    if (searchQuery) result = result.filter(q => 
      q.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === 'recent') result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (sortBy === 'pending') result.sort((a, b) => (a.status === 'pending' ? -1 : 1));
    return result;
  }, [quotes, filterStatus, filterService, searchQuery, sortBy]);

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    reviewing: quotes.filter(q => q.status === 'reviewing').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    refused: quotes.filter(q => q.status === 'refused').length,
    completed: quotes.filter(q => q.status === 'completed').length,
  };

  const serviceTypes = [...new Set(quotes.map(q => q.service_type))].sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Devis & Tarification</h1>
          <p className="font-inter text-sm text-muted-foreground">Gérez vos devis et vos tarifs de services</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('quotes')} className={`px-4 py-2 rounded-lg font-inter text-sm border transition-colors ${
          tab === 'quotes' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
        }`}>Devis ({quotes.length})</button>
        <button onClick={() => setTab('pricing')} className={`px-4 py-2 rounded-lg font-inter text-sm border transition-colors flex items-center gap-2 ${
          tab === 'pricing' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
        }`}><Settings className="w-4 h-4" /> Tarification</button>
      </div>

      {tab === 'quotes' && (
        <>
          {/* Header & Stats */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-grotesk font-bold text-lg">Gestion des devis</h2>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-semibold">{filtered.length}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-mono text-[10px] text-muted-foreground mb-1">TOTAL</p>
                <p className="font-grotesk font-bold text-xl">{stats.total}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-amber-400/30 bg-amber-400/5">
                <p className="font-mono text-[10px] text-amber-400 mb-1">EN ATTENTE</p>
                <p className="font-grotesk font-bold text-xl text-amber-400">{stats.pending}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-blue-400/30 bg-blue-400/5">
                <p className="font-mono text-[10px] text-blue-400 mb-1">EN COURS</p>
                <p className="font-grotesk font-bold text-xl text-blue-400">{stats.reviewing}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-green-400/30 bg-green-400/5">
                <p className="font-mono text-[10px] text-green-400 mb-1">ACCEPTÉS</p>
                <p className="font-grotesk font-bold text-xl text-green-400">{stats.accepted}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-red-400/30 bg-red-400/5">
                <p className="font-mono text-[10px] text-red-400 mb-1">REFUSÉS</p>
                <p className="font-grotesk font-bold text-xl text-red-400">{stats.refused}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-primary/30 bg-primary/5">
                <p className="font-mono text-[10px] text-primary mb-1">TERMINÉS</p>
                <p className="font-grotesk font-bold text-xl text-primary">{stats.completed}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Chercher par client, email ou lieu..."
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
                    <SelectItem value="accepted">Acceptés</SelectItem>
                    <SelectItem value="refused">Refusés</SelectItem>
                    <SelectItem value="completed">Terminés</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les services</SelectItem>
                    {serviceTypes.map(st => (
                      <SelectItem key={st} value={st}>{SERVICE_PRICES[st]?.label || st}</SelectItem>
                    ))}
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

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="font-inter text-sm text-muted-foreground">Aucun devis trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(q => {
                const daysSince = differenceInDays(new Date(), new Date(q.created_date));
                const isUrgent = daysSince > 7 && q.status === 'pending';
                const s = { pending: 'bg-amber-400/5 border-amber-400/30', reviewing: 'bg-blue-400/5 border-blue-400/30', accepted: 'bg-green-400/5 border-green-400/30', refused: 'bg-red-400/5 border-red-400/30', completed: 'bg-primary/5 border-primary/30' }[q.status];

                return (
                  <motion.button key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setSelected(q); setAdminNotes(q.admin_notes || ''); setPrixFinal(q.prix_final?.toString() || ''); }}
                    className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${isUrgent ? 'bg-red-400/5 border-red-400/30 hover:border-red-400/50' : `${s} hover:border-primary/20`}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <StatusBadge status={q.status} />
                        {isUrgent && <span className="text-[10px] font-bold bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full">URGENT</span>}
                        <span className="font-mono text-[10px] text-muted-foreground">#{q.id?.slice(-6)}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">({daysSince}j)</span>
                      </div>
                      <p className="font-inter font-semibold text-sm">{q.client_name}</p>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        {q.client_email} • {SERVICE_PRICES[q.service_type]?.label || q.service_type}
                      </p>
                      {q.prix_final && <p className="font-mono text-xs text-primary mt-1 font-semibold">{q.prix_final}€</p>}
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'pricing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-grotesk font-semibold text-lg mb-4">Ajouter un nouveau service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input placeholder="Nom du service" value={newService.name} onChange={e => setNewService(p => ({ ...p, name: e.target.value }))} className="bg-secondary border-border" />
              <Input type="number" placeholder="Prix de base (€)" value={newService.base_price} onChange={e => setNewService(p => ({ ...p, base_price: e.target.value }))} className="bg-secondary border-border" />
              <Input type="number" placeholder="Prix/heure (€)" value={newService.price_per_hour} onChange={e => setNewService(p => ({ ...p, price_per_hour: e.target.value }))} className="bg-secondary border-border" />
              <Button onClick={() => createService.mutate({ name: newService.name, base_price: parseFloat(newService.base_price), price_per_hour: parseFloat(newService.price_per_hour) })} disabled={createService.isPending || !newService.name} className="col-span-1 sm:col-span-3 bg-primary">
                {createService.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter le service'}
              </Button>
            </div>
          </div>

          {servicesLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="space-y-2">
              {services.map(s => (
                <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-card border border-border">
                  {editingService?.id === s.id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input value={editingService.name} onChange={e => setEditingService(p => ({ ...p, name: e.target.value }))} className="bg-secondary border-border" />
                      <Input type="number" value={editingService.base_price} onChange={e => setEditingService(p => ({ ...p, base_price: parseFloat(e.target.value) }))} className="bg-secondary border-border" />
                      <Input type="number" value={editingService.price_per_hour} onChange={e => setEditingService(p => ({ ...p, price_per_hour: parseFloat(e.target.value) }))} className="bg-secondary border-border" />
                      <Button onClick={() => updateService.mutate({ id: s.id, data: editingService })} disabled={updateService.isPending} className="col-span-1 sm:col-span-3 bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20">
                        {updateService.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-inter font-medium text-sm">{s.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{s.base_price ? `${s.base_price}€` : '—'} base {s.price_per_hour ? `/ ${s.price_per_hour}€/h` : ''}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingService(s)} className="text-primary border-primary/20">Éditer</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteService.mutate(s.id)} className="text-destructive hover:bg-destructive/10" disabled={deleteService.isPending}>
                          {deleteService.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setSelectedCoords(null); }}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-border pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <StatusBadge status={selected.status} />
                    <h2 className="font-grotesk font-bold text-2xl mt-2">Devis #{selected?.id?.slice(-6)}</h2>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary">
                    {format(new Date(selected.created_date), 'd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-secondary/40 rounded-xl p-5">
                <QuoteTracking quote={selected} />
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-semibold text-sm">{selected.client_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-mono text-sm text-primary truncate">{selected.client_email}</p>
                  </div>
                </div>
                {selected.client_phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="font-mono text-sm">{selected.client_phone}</p>
                    </div>
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Société</p>
                      <p className="font-semibold text-sm">{selected.company}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Service</p>
                    <p className="font-semibold text-sm">{SERVICE_PRICES[selected.service_type]?.label || selected.service_type}</p>
                  </div>
                  {selected.date_souhaitee && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                      <p className="font-semibold text-sm">{format(new Date(selected.date_souhaitee), 'd MMM yyyy', { locale: fr })}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Durée</p>
                    <p className="font-semibold text-sm">{selected.duree_estimee || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Budget estimé</p>
                    <p className="font-grotesk font-bold text-sm text-primary">{selected.prix_estime ? formatPrice(selected.prix_estime) : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Location with Map */}
              {selected.location && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-sm">Lieu de la prestation</p>
                  </div>
                  <p className="text-sm font-mono bg-secondary/50 rounded-lg p-3">{selected.location}</p>
                  {selectedCoords && (
                    <div className="h-48 rounded-xl overflow-hidden border border-border">
                      <MapContainer center={[selectedCoords.lat, selectedCoords.lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={L.icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZWE1ZTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOSAtNi05IC0xM2E5IDkgMCAwIDEgMTggMHoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+', iconSize: [32, 32], iconAnchor: [16, 32] })} >
                          <Popup>{selected.location}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                  {!selectedCoords && (
                    <Button onClick={async () => { const coords = await geocodeLocation(selected.location); setSelectedCoords(coords); }} variant="outline" className="w-full text-sm gap-2">
                      <MapPin className="w-4 h-4" /> Afficher sur la carte
                    </Button>
                  )}
                </div>
              )}

              {/* Description */}
              {selected.description && (
                <div className="bg-secondary/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2">Description du projet</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}

              {/* Admin Section */}
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Prix final proposé (€)</label>
                  <Input type="number" value={prixFinal} onChange={e => setPrixFinal(e.target.value)} className="bg-secondary border-border text-sm" placeholder="Montant proposé" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Notes administrateur</label>
                  <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="bg-secondary border-border text-sm resize-none h-20" placeholder="Notes internes..." />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {(selected.status === 'pending' || selected.status === 'reviewing') && (
                    <>
                      <Button onClick={() => handleAction(selected, 'accepted')} disabled={updateQ.isPending} className="bg-green-400/10 text-green-400 border border-green-400/30 hover:bg-green-400/20 text-xs gap-1.5 font-medium">
                        <Check className="w-3 h-3" /> Accepter
                      </Button>
                      <Button onClick={() => handleAction(selected, 'refused')} disabled={updateQ.isPending} className="bg-red-400/10 text-red-400 border border-red-400/30 hover:bg-red-400/20 text-xs gap-1.5 font-medium">
                        <X className="w-3 h-3" /> Refuser
                      </Button>
                    </>
                  )}
                </div>
                {selected.status === 'accepted' && (
                  <Button onClick={() => handleAction(selected, 'completed')} className="w-full bg-primary text-primary-foreground text-xs gap-1.5 font-medium">
                    <Check className="w-3 h-3" /> Marquer comme terminé
                  </Button>
                )}
                <Button onClick={() => downloadQuotePDF(selected.id)} disabled={pdfLoading === selected.id} variant="outline" className="w-full gap-2 text-primary text-xs font-medium">
                  {pdfLoading === selected.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} Télécharger PDF
                </Button>
                <Button onClick={() => deleteQ.mutate(selected.id)} disabled={deleteQ.isPending} className="w-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs gap-1.5 font-medium">
                  <Trash2 className="w-3 h-3" /> Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}