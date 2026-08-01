import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import NewTicketDialog from '@/components/support/NewTicketDialog';
import { applySeoMeta } from '@/lib/seo';
import {
  Plus, Ticket, Loader2, MessageSquare, Clock, CheckCircle2, AlertCircle,
  Sparkles, ChevronRight, Paperclip, Hash, MessageCircle,
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

export default function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { applySeoMeta({ title: 'Support — eza', description: 'Vos tickets de support Eza.' }); }, []);

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
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-grotesk font-bold">Support Nexus</h1>
          <p className="text-sm text-muted-foreground">IA en direct · tickets tracés · escalade humaine</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="h-10 px-4 rounded-xl flex items-center gap-2 font-semibold text-sm text-white transition-transform active:scale-95"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <Plus className="w-4 h-4" /> Nouveau ticket
        </button>
      </div>

      {/* Quick stats */}
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

      {/* Ticket list */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" /> Chargement de vos tickets…
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-grotesk font-semibold mb-1">Aucun ticket pour l'instant</p>
          <p className="text-sm text-muted-foreground mb-4">Un problème ? Une question ? Nexus IA répond en direct.</p>
          <button onClick={() => setShowNew(true)}
            className="h-10 px-5 rounded-xl font-semibold text-sm text-white inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
            <Plus className="w-4 h-4" /> Créer mon premier ticket
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const meta = STATUS_META[t.status] || STATUS_META.open;
            const SIcon = meta.icon;
            const lastMsg = t.messages?.[t.messages?.length - 1];
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
                    {t.related_item_type === 'post' && <span className="text-[10px] text-primary flex items-center gap-0.5"><Hash className="w-2.5 h-2.5" /> Publication</span>}
                    {t.related_item_type === 'conversation' && <span className="text-[10px] text-primary flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> Discussion</span>}
                    {t.file_urls?.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Paperclip className="w-2.5 h-2.5" /> {t.file_urls.length}</span>}
                    {lastMsg && <span className="text-[10px] text-muted-foreground truncate">{lastMsg.role === 'user' ? 'Vous' : lastMsg.role === 'admin' ? 'Admin' : 'Nexus'}: {lastMsg.content?.slice(0, 40)}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      <NewTicketDialog open={showNew} onClose={() => setShowNew(false)} onCreated={onCreated} />
    </div>
  );
}