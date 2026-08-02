import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import NewTicketDialog from '@/components/support/NewTicketDialog';
import { applySeoMeta } from '@/lib/seo';
import {
  ArrowLeft, Plus, Ticket, Loader2, Clock, CheckCircle2, AlertCircle,
  BookOpen, Users, Headphones, ChevronRight, Paperclip, MessageCircle,
  LifeBuoy, MessageSquare,
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

  useEffect(() => { applySeoMeta({ title: 'Aide et soutien — eza', description: 'Support eza : documentation, communauté et tickets.' }); }, []);

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

  const RESOURCES = [
    {
      icon: BookOpen, color: '#F37321',
      title: 'Documentation',
      desc: 'Explorez des guides complets, des tutoriels, des FAQ et les meilleures pratiques pour utiliser eza.',
      action: 'Commencer',
      to: '/documentation',
    },
    {
      icon: Users, color: '#1DA890',
      title: 'Communauté',
      desc: 'Connectez-vous avec d\'autres membres et obtenez de l\'aide instantanée de notre communauté active.',
      action: 'Commencer',
      to: '/forum',
    },
    {
      icon: Headphones, color: '#212C3E',
      title: 'Ouvrir un ticket',
      desc: 'Soumettez un ticket de support détaillé et obtenez une assistance personnalisée de Nexus IA.',
      action: 'Commencer',
      onClick: () => setShowNew(true),
    },
  ];

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    resolved: tickets.filter((t) => ['ai_resolved', 'resolved'].includes(t.status)).length,
    escalated: tickets.filter((t) => t.status === 'awaiting_human').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
      <h1 className="text-2xl md:text-3xl font-grotesk font-bold tracking-tight">Aide et soutien</h1>
      <div className="h-1 w-24 rounded-full mt-3 mb-3"
        style={{ background: 'linear-gradient(90deg, #F37321 0%, #1DA890 100%)' }} />
      <p className="text-sm text-muted-foreground mb-8 max-w-xl">
        Obtenez l'aide dont vous avez besoin pour tirer le meilleur d'eza — documentation, communauté et support personnalisé.
      </p>

      {/* Resource cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {RESOURCES.map((r) => {
          const Icon = r.icon;
          const inner = (
            <div className="group rounded-2xl border border-border bg-card p-5 h-full flex flex-col hover:border-primary/40 hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${r.color}1a`, border: `1px solid ${r.color}33` }}>
                <Icon className="w-5 h-5" style={{ color: r.color }} />
              </div>
              <h3 className="font-grotesk font-bold text-[15px] mb-1.5">{r.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.desc}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold mt-4" style={{ color: r.color }}>
                {r.action} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          );
          return r.onClick ? (
            <button key={r.title} onClick={r.onClick} className="text-left">{inner}</button>
          ) : (
            <Link key={r.title} to={r.to}>{inner}</Link>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="mb-3">
        <h2 className="font-grotesk font-bold text-lg">Actions rapides</h2>
        <p className="text-xs text-muted-foreground">Gérez votre expérience de support</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <Link to="#tickets" onClick={(e) => { e.preventDefault(); document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="group rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/40 transition-all">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Mes tickets de support</p>
            <p className="text-xs text-muted-foreground">Afficher et gérer vos tickets existants</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </Link>
        <Link to="/forum"
          className="group rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/40 transition-all">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Forum communautaire</p>
            <p className="text-xs text-muted-foreground">Échangez avec la communauté eza</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </Link>
      </div>

      {/* Mes tickets */}
      <div id="tickets" className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-primary" />
            <h2 className="font-grotesk font-bold text-lg">Mes tickets de support</h2>
          </div>
          <button onClick={() => setShowNew(true)}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 font-semibold text-xs text-white"
            style={{ background: 'linear-gradient(135deg, #F37321, #1DA890)' }}>
            <Plus className="w-3.5 h-3.5" /> Nouveau
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
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
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Ticket className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium mb-1">Aucun ticket</p>
            <p className="text-xs text-muted-foreground mb-3">Un problème ? Ouvrez un ticket, Nexus IA répond en direct.</p>
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
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                    <SIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[t.category] || 'Autre'}</span>
                      {t.related_item_type === 'conversation' && <span className="text-[10px] text-primary flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> Discussion</span>}
                      {t.file_urls?.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Paperclip className="w-2.5 h-2.5" /> {t.file_urls.length}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <NewTicketDialog open={showNew} onClose={() => setShowNew(false)} onCreated={onCreated} />
    </div>
  );
}