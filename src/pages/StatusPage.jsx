import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Zap, Clock, AlertCircle, MessageSquare, Images, BookOpen, Award, Gift, Calendar, FileText, Users } from 'lucide-react';

const DEFAULT_MODULES = [
  { name: 'messagerie', label: 'Messagerie', icon: MessageSquare, description: 'Messages privés et conversations' },
  { name: 'portfolio', label: 'Portfolio', icon: Images, description: 'Galerie de projets et portefeuille' },
  { name: 'blog', label: 'Blog', icon: BookOpen, description: 'Articles et actualités' },
  { name: 'certification', label: 'Certification', icon: Award, description: 'Système de certification' },
  { name: 'donation', label: 'Donations', icon: Gift, description: 'Plateforme de dons' },
  { name: 'planning', label: 'Planning', icon: Calendar, description: 'Calendrier et rendez-vous' },
  { name: 'quote', label: 'Devis', icon: FileText, description: 'Système de demande de devis' },
  { name: 'discover', label: 'Discover', icon: Users, description: 'Répertoire social et interactions' },
];

const STATUS_CONFIG = {
  operational: { 
    icon: CheckCircle2, 
    color: 'text-green-500', 
    bg: 'bg-green-500/10', 
    border: 'border-green-500/30',
    badgeBg: 'bg-green-500/20',
    badgeBorder: 'border-green-500/50',
    label: 'Opérationnel', 
    description: 'Service fonctionnant normalement',
    emoji: '✅'
  },
  degraded: { 
    icon: Zap, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/30',
    badgeBg: 'bg-yellow-500/20',
    badgeBorder: 'border-yellow-500/50',
    label: 'Performances dégradées', 
    description: 'Service avec problèmes de performance',
    emoji: '⚡'
  },
  maintenance: { 
    icon: Clock, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/50',
    label: 'Maintenance en cours', 
    description: 'Service en maintenance - réouverture prévue',
    emoji: '🔧'
  },
  offline: { 
    icon: AlertCircle, 
    color: 'text-red-500', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/30',
    badgeBg: 'bg-red-500/20',
    badgeBorder: 'border-red-500/50',
    label: 'Hors ligne', 
    description: 'Service temporairement indisponible',
    emoji: '🚫'
  },
};

export default function StatusPage() {
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['site-status'],
    queryFn: () => base44.entities.AppModuleStatus.list(),
    refetchInterval: 30000,
  });

  const operationalCount = modules.filter(m => m.is_active && m.status === 'operational').length;
  const totalActive = modules.filter(m => m.is_active).length;
  const allOperational = modules.every(m => !m.is_active || m.status === 'operational');

  const getModuleStatus = (moduleName) => {
    const mod = modules.find(m => m.module_name === moduleName);
    if (!mod) return { is_active: true, status: 'operational', message: '' };
    return mod;
  };

  const statusBreakdown = {
    operational: modules.filter(m => m.is_active && m.status === 'operational').length,
    degraded: modules.filter(m => m.is_active && m.status === 'degraded').length,
    maintenance: modules.filter(m => m.is_active && m.status === 'maintenance').length,
    offline: modules.filter(m => m.is_active && m.status === 'offline').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${allOperational ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              {allOperational ? '✅' : '⚠️'}
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-4xl">État des Services</h1>
              <p className="font-inter text-muted-foreground mt-1">
                {allOperational 
                  ? '🎉 Tous les services fonctionnent normalement'
                  : '⏳ Certains services connaissent des difficultés'
                }
              </p>
            </div>
          </div>

          {/* Overall Health Bar */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-inter text-sm font-semibold">Santé globale du système</span>
              <span className="font-grotesk font-bold text-2xl text-primary">
                {totalActive > 0 ? Math.round((statusBreakdown.operational / totalActive) * 100) : 100}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${totalActive > 0 ? (statusBreakdown.operational / totalActive) * 100 : 100}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6">
              <div className="text-center p-2">
                <p className="font-mono text-xs text-green-500 font-semibold">{statusBreakdown.operational}</p>
                <p className="font-inter text-xs text-muted-foreground">Opérationnel</p>
              </div>
              <div className="text-center p-2">
                <p className="font-mono text-xs text-yellow-500 font-semibold">{statusBreakdown.degraded}</p>
                <p className="font-inter text-xs text-muted-foreground">Dégradé</p>
              </div>
              <div className="text-center p-2">
                <p className="font-mono text-xs text-blue-500 font-semibold">{statusBreakdown.maintenance}</p>
                <p className="font-inter text-xs text-muted-foreground">Maintenance</p>
              </div>
              <div className="text-center p-2">
                <p className="font-mono text-xs text-red-500 font-semibold">{statusBreakdown.offline}</p>
                <p className="font-inter text-xs text-muted-foreground">Hors ligne</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <h2 className="font-grotesk font-bold text-2xl mb-6">Services Disponibles</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_MODULES.map(moduleInfo => {
                const status = getModuleStatus(moduleInfo.name);
                const cfg = STATUS_CONFIG[status.status];
                const Icon = moduleInfo.icon;
                const StatusIcon = cfg.icon;

                if (!status.is_active) {
                  return (
                    <div key={moduleInfo.name} className="bg-card/40 border border-border/40 rounded-2xl p-6 opacity-50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-muted" />
                        </div>
                        <div className="flex-1">
                          <p className="font-inter font-semibold line-through">{moduleInfo.label}</p>
                          <p className="font-inter text-xs text-muted-foreground mt-1">Service désactivé</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={moduleInfo.name} className={`bg-card border ${cfg.border} rounded-2xl p-6 hover:border-primary/50 transition-colors`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-semibold text-foreground">{moduleInfo.label}</p>
                          <p className="font-inter text-xs text-muted-foreground">{moduleInfo.description}</p>
                        </div>
                      </div>
                      <div className={`${cfg.badgeBg} border ${cfg.badgeBorder} rounded-full px-2.5 py-1 flex-shrink-0 flex items-center gap-1.5`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className={`font-mono text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>

                    {/* Status detail */}
                    <div className="bg-secondary/40 rounded-lg p-3 text-center">
                      <p className={`font-inter text-sm font-semibold ${cfg.color}`}>{cfg.emoji} {cfg.label}</p>
                    </div>

                    {/* Message if any */}
                    {status.message && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <p className="font-inter text-xs text-muted-foreground italic">
                          📌 {status.message}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-grotesk font-bold text-lg mb-4">Légende</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${cfg.color} mt-1 flex-shrink-0`} />
                  <div>
                    <p className="font-inter font-semibold text-sm">{cfg.label}</p>
                    <p className="font-inter text-xs text-muted-foreground">{cfg.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="font-inter text-xs text-muted-foreground">
            ⟳ Cette page se met à jour automatiquement toutes les 30 secondes
          </p>
          <p className="font-inter text-xs text-muted-foreground mt-2">
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}