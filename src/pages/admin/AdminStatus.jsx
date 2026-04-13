import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
  operational: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Opérationnel' },
  degraded: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Dégradé' },
  maintenance: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Maintenance' },
  offline: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Hors ligne' },
};

export default function AdminStatus() {
  const qc = useQueryClient();
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const { data: modules = [] } = useQuery({
    queryKey: ['admin-module-status'],
    queryFn: async () => {
      const res = await base44.entities.AppModuleStatus.list();
      // Ensure all default modules exist
      const existing = res.reduce((acc, m) => ({ ...acc, [m.module_name]: m }), {});
      const all = DEFAULT_MODULES.map(dm => existing[dm.name] || {
        module_name: dm.name,
        is_active: true,
        status: 'operational',
        message: '',
      });
      return all;
    },
  });

  const updateModule = useMutation({
    mutationFn: async (module) => {
      const existing = modules.find(m => m.module_name === module.module_name);
      if (existing?.id) {
        return base44.entities.AppModuleStatus.update(existing.id, module);
      } else {
        return base44.entities.AppModuleStatus.create(module);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-module-status'] });
      toast.success('Module mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const toggleModule = (module) => {
    updateModule.mutate({ ...module, is_active: !module.is_active });
  };

  const setStatus = (module, newStatus) => {
    updateModule.mutate({ ...module, status: newStatus });
  };

  const setMessage = (module, msg) => {
    updateModule.mutate({ ...module, message: msg });
  };

  const toggleAllMaintenance = async (on) => {
    try {
      await Promise.all(
        modules.map(m => {
          const existing = modules.find(x => x.module_name === m.module_name);
          return base44.entities.AppModuleStatus.create({
            module_name: m.module_name,
            status: on ? 'maintenance' : 'operational',
            is_active: !on,
            message: on ? maintenanceMessage || 'Site en maintenance' : '',
          });
        })
      );
      qc.invalidateQueries({ queryKey: ['admin-module-status'] });
      toast.success(on ? 'Site en maintenance' : 'Site réactivé');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const allMaintenance = modules.every(m => m.status === 'maintenance');
  const overallHealth = modules.filter(m => m.is_active && m.status === 'operational').length / modules.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl">Statut du Site</h1>
        <p className="font-inter text-sm text-muted-foreground">Monitorer et gérer l'état de chaque module</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="font-grotesk font-bold text-lg mb-4">Actions Rapides</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-inter text-sm">Mettre le site en maintenance :</span>
            <Switch checked={allMaintenance} onCheckedChange={toggleAllMaintenance} />
          </div>
          {allMaintenance && (
            <div className="flex gap-2">
              <Input
                placeholder="Message de maintenance..."
                value={maintenanceMessage}
                onChange={e => setMaintenanceMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => toggleAllMaintenance(true)} size="sm">Mettre à jour</Button>
            </div>
          )}
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-3">
          <p className="font-mono text-xs text-muted-foreground">Santé globale</p>
          <p className="font-grotesk font-bold text-xl">{Math.round(overallHealth * 100)}%</p>
        </div>
        <div className="bg-card border border-green-500/20 rounded-xl p-3">
          <p className="font-mono text-xs text-green-500">Opérationnel</p>
          <p className="font-grotesk font-bold text-xl text-green-500">{modules.filter(m => m.status === 'operational').length}</p>
        </div>
        <div className="bg-card border border-yellow-500/20 rounded-xl p-3">
          <p className="font-mono text-xs text-yellow-500">Dégradé</p>
          <p className="font-grotesk font-bold text-xl text-yellow-500">{modules.filter(m => m.status === 'degraded').length}</p>
        </div>
        <div className="bg-card border border-red-500/20 rounded-xl p-3">
          <p className="font-mono text-xs text-red-500">Hors ligne</p>
          <p className="font-grotesk font-bold text-xl text-red-500">{modules.filter(m => m.status === 'offline').length}</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-3">
        <h2 className="font-grotesk font-bold text-lg">Modules</h2>
        {modules.map(module => {
          const moduleInfo = DEFAULT_MODULES.find(m => m.name === module.module_name);
          const cfg = STATUS_CONFIG[module.status];
          const Icon = cfg.icon;

          return (
            <div key={module.module_name} className={`bg-card border ${cfg.border} rounded-xl p-4`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold">{moduleInfo?.label || module.module_name}</p>
                  <div className="flex gap-2 items-center mt-2 flex-wrap">
                    {/* Status buttons */}
                    <div className="flex gap-1">
                      {Object.entries(STATUS_CONFIG).map(([status, _]) => (
                        <button
                          key={status}
                          onClick={() => setStatus(module, status)}
                          className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
                            module.status === status
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/30'
                          }`}
                        >
                          {STATUS_CONFIG[status].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message input */}
                  {module.status !== 'operational' && (
                    <input
                      type="text"
                      placeholder="Message..."
                      value={module.message || ''}
                      onChange={e => setMessage(module, e.target.value)}
                      className="w-full mt-2 px-2 py-1.5 text-xs rounded border border-border bg-background text-foreground"
                    />
                  )}
                </div>

                {/* Toggle active */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Switch checked={module.is_active} onCheckedChange={() => toggleModule(module)} />
                  <span className="text-xs text-muted-foreground">{module.is_active ? 'Actif' : 'Inactif'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}