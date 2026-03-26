import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Check, X, Eye, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'sonner';

export default function AdminQuotes() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date'),
  });

  const updateQuote = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast.success(lang === 'fr' ? 'Devis mis à jour' : 'Quote updated');
    },
  });

  const handleStatusChange = async (quote, status) => {
    await updateQuote.mutateAsync({ id: quote.id, data: { status } });
    // Notify client
    await base44.entities.Notification.create({
      user_email: quote.client_email,
      title: status === 'accepted'
        ? (lang === 'fr' ? 'Votre devis a été accepté !' : 'Your quote was accepted!')
        : (lang === 'fr' ? 'Votre devis a été refusé' : 'Your quote was refused'),
      type: status === 'accepted' ? 'quote_accepted' : 'quote_refused',
      content: `Devis #${quote.id} — ${t(`services.${quote.service_type}`)}`,
    });
    // Send email
    await base44.integrations.Core.SendEmail({
      to: quote.client_email,
      subject: status === 'accepted' ? 'Votre devis a été accepté — ENOR.' : 'Mise à jour de votre devis — ENOR.',
      body: `Bonjour ${quote.client_name},\n\nVotre devis pour "${t(`services.${quote.service_type}`)}" a été ${status === 'accepted' ? 'accepté' : 'refusé'}.\n\nCordialement,\nEnor Lefoulon Meyer`,
    });
  };

  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-extrabold text-2xl">{t('admin.quotes')}</h1>
          <p className="font-inter text-sm text-muted-foreground">{quotes.length} {lang === 'fr' ? 'devis au total' : 'total quotes'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'reviewing', 'accepted', 'refused'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
              filter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
            }`}
          >
            {s === 'all' ? (lang === 'fr' ? 'Tous' : 'All') : t(`common.${s}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-border/80 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">#{q.id}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="font-inter font-medium text-sm">{q.client_name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{q.client_email}</p>
                  <p className="font-inter text-xs text-primary mt-1">{t(`services.${q.service_type}`)} • {q.budget_range || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(q)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {q.status === 'pending' || q.status === 'reviewing' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(q, 'accepted')}
                        className="bg-accent/20 text-accent hover:bg-accent/30"
                        disabled={updateQuote.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(q, 'refused')}
                        className="text-destructive hover:bg-destructive/10"
                        disabled={updateQuote.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne font-bold">
              {lang === 'fr' ? 'Détail du devis' : 'Quote detail'} #{selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 font-inter text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground block text-xs">Client</span>{selected.client_name}</div>
                <div><span className="text-muted-foreground block text-xs">Email</span><span className="font-mono text-xs">{selected.client_email}</span></div>
                <div><span className="text-muted-foreground block text-xs">Service</span>{t(`services.${selected.service_type}`)}</div>
                <div><span className="text-muted-foreground block text-xs">Budget</span>{selected.budget_range || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Description</span>
                <p className="text-foreground">{selected.description}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Notes admin</span>
                <Textarea
                  defaultValue={selected.admin_notes || ''}
                  onBlur={(e) => updateQuote.mutate({ id: selected.id, data: { admin_notes: e.target.value } })}
                  className="bg-secondary border-border"
                  placeholder={lang === 'fr' ? 'Ajouter des notes...' : 'Add notes...'}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}