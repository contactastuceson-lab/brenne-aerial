import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewTicketDialog from '@/components/support/NewTicketDialog';
import { applySeoMeta } from '@/lib/seo';
import {
  ArrowLeft, BookOpen, Users, Headphones, ChevronRight,
  LifeBuoy, MessageSquare,
} from 'lucide-react';

export default function SupportPage() {
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { applySeoMeta({ title: 'Aide et soutien — eza', description: 'Support eza : documentation, communauté et tickets.' }); }, []);

  const RESOURCES = [
    {
      icon: BookOpen, color: '#F37321',
      title: 'Documentation',
      desc: 'Explorez des guides complets, des tutoriels, des FAQ et les meilleures pratiques pour utiliser eza.',
      action: 'Commencer',
      href: 'https://docs.ezagroup.org/',
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
      to: '/support/conversation?new=1',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <Link to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
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
          ) : r.href ? (
            <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer">{inner}</a>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link to="/support/conversation"
          className="group rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/40 transition-all">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <LifeBuoy className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Mes conversations</p>
            <p className="text-xs text-muted-foreground">Afficher et gérer vos tickets de support</p>
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

      <NewTicketDialog open={showNew} onClose={() => setShowNew(false)} onCreated={(ticket) => ticket?.id && (window.location.href = `/support/${ticket.id}`)} />
    </div>
  );
}