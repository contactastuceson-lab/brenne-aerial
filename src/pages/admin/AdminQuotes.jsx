import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Eye, Check, X, Loader2 } from 'lucide-react';
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
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [prixFinal, setPrixFinal] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['adm-quotes-list'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
  });

  const updateQ = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-quotes-list'] }); toast.success('Devis mis à jour'); },
  });

  const handleAction = async (quote, status) => {
    await updateQ.mutateAsync({ id: quote.id, data: { status, admin_notes: adminNotes, prix_final: prixFinal ? parseFloat(prixFinal) : undefined } });
    await base44.entities.Notification.create({
      user_email: quote.client_email,
      title: status === 'accepted' ? '✅ Votre devis a été accepté !' : '❌ Votre devis a été refusé',
      content: `Prestation : ${SERVICE_PRICES[quote.service_type]?.label || quote.service_type}${prixFinal ? ` — Prix final : ${formatPrice(parseFloat(prixFinal))}` : ''}`,
      type: status === 'accepted' ? 'quote_accepted' : 'quote_refused',
      link: '/dashboard',
    });
    await base44.integrations.Core.SendEmail({
      to: quote.client_email,
      subject: status === 'accepted' ? '✅ Devis accepté — Brenne Aerial' : 'Mise à jour de votre devis — Brenne Aerial',
      body: `Bonjour ${quote.client_name},\n\n${status === 'accepted' ? `Votre demande de devis pour "${SERVICE_PRICES[quote.service_type]?.label}" a été acceptée.${prixFinal ? `\nPrix final : ${formatPrice(parseFloat(prixFinal))}` : ''}\n\nNous vous contacterons rapidement pour organiser la prestation.` : `Votre demande de devis pour "${SERVICE_PRICES[quote.service_type]?.label}" n'a pas pu être acceptée.${adminNotes ? `\nRaison : ${adminNotes}` : ''}`}\n\nCordialement,\nEnor Lefoulon Meyer — Brenne Aerial`,
    });
    setSelected(null);
  };

  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Gestion des devis</h1>
          <p className="font-inter text-sm text-muted-foreground">{quotes.length} devis au total</p>
        </div>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}