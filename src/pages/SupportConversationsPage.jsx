import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import NewTicketDialog from '@/components/support/NewTicketDialog';
import { applySeoMeta } from '@/lib/seo';
import {
  ArrowLeft, Plus, Ticket, Loader2, Clock, CheckCircle2, AlertCircle,
  Paperclip, MessageCircle, LifeBuoy,
} from 'lucide-react';

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: AlertCircle, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', icon: CheckCircle2, cls: 'text-muted-foreground bg-secondary border-border' },
};

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération',
  messaging: 'Messagerie', other: 'Autre',
};

export default function SupportConversationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { applySeoMeta({ title: 'Mes conversations — Support eza', description: 'Vos tickets de support eza.' }); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      setShowNew(true);
      window.history.replaceState({}, '', '/support/conversation');
    }
  }, []);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const list = await base44.entities.SupportTicket.filter({ user_email: user.email }, '-created_date', 50).catch(() => []);
      setTickets(list || []);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => { load(); }, [load]);

  const onCreated = (ticket) => {
    setShowNew(false);
    if (ticket?.id) navigate(`/support/${ticket.id}`);
  };

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    resolved: tickets.filter((t) => ['ai_resolved', 'resolved'].includes(t.status)).length,
    escalated: tickets.filter((t) => t.status === 'awaiting_human').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <Link to="/support"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Support
      </Link>

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-grotesk font-bold tracking-tight">Mes conversations</h1>
        </div>
        <button onClick={() => setShowNew(true)}
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 font-semibold text-xs text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F37321, #1DA890)' }}>
          <Plus className="w-3.5 h-3.5" /> Nouveau
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Retrouvez l'ensemble de vos tickets et vos échanges avec Nexus IA.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-grotesk font-bold text-amber-400">{stats.open}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ouverts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-grotesk font-bold text-green-400">{stats.resolved}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Résolus</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-grotesk font-bold text-orange-400">{stats.escalated}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Escaladés</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> Chargement…
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium mb-1">Aucune conversation</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
            Un problème ? Ouvrez un ticket, Nexus IA répond en direct et vous accompagne à chaque étape.
          </p>
          <button onClick={() => setShowNew(true)}
            className="h-9 px-4 rounded-lg font-semibold text-xs text-white inline-flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #F37321, #1DA890)' }}>
            <Plus className="w-3.5 h-3.5" /> Ouvrir un ticket
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const meta = STATUS_META[t.status] || STATUS_META.open;
            const SIcon = meta.icon;
            return (
              <Link key={t.id} to={`/support/${t.id}`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                  <SIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[t.category] || 'Autre'}</span>
                    {t.related_item_type === 'conversation' && <span className="text-[10px] text-primary flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> Discussion</span>}
                    {t.file_urls?.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Paperclip className="w-2.5 h-2.5" /> {t.file_urls.length}</span>}
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      <NewTicketDialog open={showNew} onClose={() => setShowNew(false)} onCreated={onCreated} />
    </div>
  );
}