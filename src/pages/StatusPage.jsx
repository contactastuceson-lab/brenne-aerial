import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Zap, Clock, AlertCircle } from 'lucide-react';

const DEFAULT_MODULES = [
  { name: 'messagerie', label: 'Messagerie' },
  { name: 'portfolio', label: 'Portfolio' },
  { name: 'blog', label: 'Blog' },
  { name: 'certification', label: 'Certification' },
  { name: 'donation', label: 'Donations' },
  { name: 'planning', label: 'Planning & Appointments' },
  { name: 'quote', label: 'Devis' },
  { name: 'discover', label: 'Discover (Social)' },
];

const STATUS_CONFIG = {
  operational: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Opérationnel', description: 'Service fonctionnant normalement' },
  degraded: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Performances dégradées', description: 'Service avec problèmes de performance' },
  maintenance: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Maintenance', description: 'Service en maintenance' },
  offline: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Hors ligne', description: 'Service temporairement indisponible' },
};

export default function StatusPage() {
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['site-status'],
    queryFn: () => base44.entities.AppModuleStatus.list(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const operationalCount = modules.filter(m => m.is_active && m.status === 'operational').length;
  const totalActive = modules.filter(m => m.is_active).length;
  const allOperational = modules.every(m => !m.is_active || m.status === 'operational');

  const getModuleStatus = (moduleName) => {
    const mod = modules.find(m => m.module_name === moduleName);
    if (!mod) return { is_active: true, status: 'operational', message: '' };
    return mod;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <div className={`w-2 h-2 rounded-full ${allOperational ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="font-inter text-xs font-semibold text-primary">
              {allOperational ? 'Tous les services opérationnels' : 'Certains services affectés'}
            </span>
          </div>
          <h1 className="font-grotesk font-bold text-4xl mb-3">Statut du Site</h1>
          <p className="font-inter text-muted-foreground">État des services de Brenne Aerial</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="font-mono text-xs text-muted-foreground mb-2">Services actifs</p>
            <p className="font-grotesk font-bold text-3xl text-primary">{operationalCount}/{totalActive}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="font-mono text-xs text-muted-foreground mb-2">Santé globale</p>
            <p className="font-grotesk font-bold text-3xl text-primary">
              {totalActive > 0 ? Math.round((operationalCount / totalActive) * 100) : 100}%
            </p>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h2 className="font-grotesk font-bold text-xl mb-4">Services</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              DEFAULT_MODULES.map(moduleInfo => {
                const status = getModuleStatus(moduleInfo.name);
                const cfg = STATUS_CONFIG[status.status];
                const Icon = cfg.icon;

                if (!status.is_active) {
                  return (
                    <div key={moduleInfo.name} className="bg-card/50 border border-border rounded-xl p-4 opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                        <span className="font-inter text-muted-foreground line-through">{moduleInfo.label}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={moduleInfo.name} className={`bg-card border ${cfg.border} rounded-xl p-4`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter font-semibold text-foreground">{moduleInfo.label}</p>
                        <p className={`font-mono text-xs mt-1 ${cfg.color}`}>{cfg.label}</p>
                        {status.message && (
                          <p className="font-inter text-sm text-muted-foreground mt-2">{status.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="font-inter text-xs text-muted-foreground">
            Cette page se met à jour automatiquement toutes les 30 secondes
          </p>
        </div>
      </div>
    </div>
  );
}