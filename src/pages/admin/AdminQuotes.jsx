import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Eye, Check, X, Loader2, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPrice, SERVICE_PRICES } from '@/lib/droneUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminQuotes() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('quotes');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [prixFinal, setPrixFinal] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [newService, setNewService] = useState({ name: '', base_price: '', price_per_hour: '' });
  const [editingService, setEditingService] = useState(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['adm-quotes-list'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['adm-services-list'],
    queryFn: () => base44.entities.Service.list('order'),
  });

  const updateQ = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-quotes-list'] }); toast.success('Devis mis à jour'); },
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

  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);

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
          <div className="flex items-center justify-between mb-8">
          </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'pending', 'reviewing', 'accepted', 'refused', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
              filter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}>
            {s === 'all' ? 'Tous' : s} {s !== 'all' && `(${quotes.filter(q => q.status === s).length})`}
          </button>
        ))}
      </div>

          {isLoading ? <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="space-y-2">
              {filtered.map(q => (
            <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-border/60 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={q.status} />
                  <span className="font-mono text-[10px] text-muted-foreground">#{q.id?.slice(-6)}</span>
                </div>
                <p className="font-inter font-medium text-sm">{q.client_name}</p>
                <p className="font-mono text-xs text-muted-foreground">{q.client_email}</p>
                <p className="font-inter text-xs text-primary mt-1">
                  {SERVICE_PRICES[q.service_type]?.label || q.service_type} 
                  {q.date_souhaitee && ` • ${format(new Date(q.date_souhaitee), 'd MMM', { locale: fr })}`}
                  {q.prix_estime && ` • ~${formatPrice(q.prix_estime)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setSelected(q); setAdminNotes(q.admin_notes || ''); setPrixFinal(q.prix_final?.toString() || ''); }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={async () => {
                  const res = await base44.functions.invoke('generateQuotePDF', { quoteId: q.id });
                  if (res.data) {
                    const blob = new Blob([res.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `devis-${q.id.slice(0, 8)}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } else toast.error('Erreur lors de la génération');
                }} className="gap-1 text-primary">
                  <FileText className="w-4 h-4" /> PDF
                </Button>
                {(q.status === 'pending' || q.status === 'reviewing') && (
                  <>
                    <Button size="sm" onClick={() => { setSelected(q); setAdminNotes(''); setPrixFinal(''); }} className="bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction(q, 'refused')} className="text-destructive hover:bg-destructive/10">
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
              ))}
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">Détail devis #{selected?.id?.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm font-inter">
              <div className="grid grid-cols-2 gap-3">
                {[['Client', selected.client_name], ['Email', selected.client_email], ['Téléphone', selected.client_phone || '—'], ['Service', SERVICE_PRICES[selected.service_type]?.label || selected.service_type], ['Date', selected.date_souhaitee || '—'], ['Lieu', selected.location || '—'], ['Durée', selected.duree_estimee || '—'], ['Budget estimé', selected.prix_estime ? formatPrice(selected.prix_estime) : '—']].map(([k, v]) => (
                  <div key={k}><span className="text-muted-foreground text-xs">{k}</span><p className="font-mono text-xs mt-0.5 truncate">{v}</p></div>
                ))}
              </div>
              {selected.description && <div><span className="text-muted-foreground text-xs">Description</span><p className="mt-1 text-xs leading-relaxed">{selected.description}</p></div>}
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Prix final (€)</label>
                <Input type="number" value={prixFinal} onChange={e => setPrixFinal(e.target.value)} className="bg-secondary border-border" placeholder="Prix proposé" />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Notes admin</label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="bg-secondary border-border" placeholder="Notes internes..." />
              </div>
              {(selected.status === 'pending' || selected.status === 'reviewing') && (
                <div className="flex gap-3">
                  <Button onClick={() => handleAction(selected, 'accepted')} disabled={updateQ.isPending} className="flex-1 bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20">
                    {updateQ.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Accepter
                  </Button>
                  <Button onClick={() => handleAction(selected, 'refused')} disabled={updateQ.isPending} variant="ghost" className="flex-1 text-destructive border border-destructive/20 hover:bg-destructive/10">
                    <X className="w-4 h-4 mr-1" /> Refuser
                  </Button>
                </div>
              )}
              {(selected.status === 'accepted') && (
                <Button onClick={() => handleAction(selected, 'completed')} className="w-full bg-primary text-primary-foreground">
                  Marquer comme terminé
                </Button>
              )}
              <Button
                onClick={async () => {
                  const res = await base44.functions.invoke('generateQuotePDF', { quoteId: selected.id });
                  if (res.data) {
                    const blob = new Blob([res.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `devis-${selected.id.slice(0, 8)}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    toast.success('Devis téléchargé');
                  } else toast.error('Erreur lors de la génération');
                }}
                variant="outline"
                className="w-full gap-2 text-primary"
              >
                <FileText className="w-4 h-4" /> Télécharger le devis PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}