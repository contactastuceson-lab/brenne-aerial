import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Zap, Clock, Copy, Check, ExternalLink, Radio, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_MODULES = [
  { name: 'homepage',      label: 'Page d\'accueil' },
  { name: 'messagerie',    label: 'Messagerie' },
  { name: 'portfolio',     label: 'Portfolio' },
  { name: 'blog',          label: 'Blog' },
  { name: 'certification', label: 'Certification' },
  { name: 'donation',      label: 'Donations' },
  { name: 'planning',      label: 'Planning & Appointments' },
  { name: 'quote',         label: 'Devis' },
  { name: 'discover',      label: 'Discover (Social)' },
  { name: 'espace_client', label: 'Espace Client' },
  { name: 'partenaires',   label: 'Partenaires' },
  { name: 'parrainage',    label: 'Parrainage' },
  { name: 'avant_apres',   label: 'Avant/Après' },
  { name: 'services',      label: 'Services' },
  { name: 'contact',       label: 'Contact' },
];

const STATUS_CONFIG = {
  operational: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Opérationnel' },
  degraded:    { icon: Zap,          color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Dégradé' },
  maintenance: { icon: Clock,        color: 'text-blue-500',  bg: 'bg-blue-500/10',  border: 'border-blue-500/30',  label: 'Maintenance' },
  offline:     { icon: AlertCircle,  color: 'text-red-500',   bg: 'bg-red-500/10',   border: 'border-red-500/30',   label: 'Hors ligne' },
};

// Build the BetterStack monitoring URL for a given module
function getMonitorUrl(moduleName) {
  const base = `https://brenneaerial.base44.app/api/functions/statusCheck?module=${moduleName}`;
  return base;
}

function CopyRow({ label, url }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
      <span className="font-inter text-xs text-muted-foreground w-36 flex-shrink-0 truncate">{label}</span>
      <span className="font-mono text-[10px] text-primary/70 flex-1 truncate">{url}</span>
      <button onClick={copy} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors">
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors">
        <ExternalLink className="w-3 h-3 text-muted-foreground" />
      </a>
    </div>
  );
}

export default function AdminStatus() {
  const qc = useQueryClient();
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [showUrls, setShowUrls] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const { data: modules = [] } = useQuery({
    queryKey: ['admin-module-status'],
    queryFn: async () => {
      const res = await base44.entities.AppModuleStatus.list();
      const existing = res.reduce((acc, m) => ({ ...acc, [m.module_name]: m }), {});
      return DEFAULT_MODULES.map(dm => existing[dm.name] || {
        module_name: dm.name,
        is_active: true,
        status: 'operational',
        message: '',
      });
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

  const toggleModule  = (module) => updateModule.mutate({ ...module, is_active: !module.is_active });
  const setStatus     = (module, newStatus) => updateModule.mutate({ ...module, status: newStatus });
  const setMessage    = (module, msg) => updateModule.mutate({ ...module, message: msg });

  const toggleAllMaintenance = async (on) => {
    await Promise.all(
      modules.map(m => base44.entities.AppModuleStatus.create({
        module_name: m.module_name,
        status: on ? 'maintenance' : 'operational',
        is_active: !on,
        message: on ? maintenanceMessage || 'Site en maintenance' : '',
      }))
    );
    qc.invalidateQueries({ queryKey: ['admin-module-status'] });
    toast.success(on ? 'Site en maintenance' : 'Site réactivé');
  };

  const copyAllUrls = () => {
    const text = DEFAULT_MODULES.map(m => `${m.label}: ${getMonitorUrl(m.name)}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success('Tous les liens copiés !');
  };

  const allMaintenance = modules.every(m => m.status === 'maintenance');
  const overallHealth  = modules.filter(m => m.is_active && m.status === 'operational').length / modules.length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-grotesk font-bold text-2xl">Statut du Site</h1>
        <p className="font-inter text-sm text-muted-foreground">Monitorer et gérer l'état de chaque module</p>
      </div>

      {/* ── BetterStack URLs Panel ── */}
      <div className="bg-card border border-primary/20 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowUrls(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radio className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-grotesk font-semibold text-sm">Liens de monitoring BetterStack</p>
              <p className="font-inter text-xs text-muted-foreground">
                Collez ces URLs dans BetterStack → Monitors → HTTP. Retourne 503 si le module est en maintenance/hors-ligne.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={e => { e.stopPropagation(); copyAllUrls(); }}>
              {copiedAll ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              Tout copier
            </Button>
            {showUrls ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {showUrls && (
          <div className="border-t border-border px-5 py-4">
            <div className="bg-secondary/50 rounded-xl p-4 mb-3">
              <p className="font-mono text-[10px] text-primary mb-1 uppercase tracking-widest">Comment configurer BetterStack</p>
              <ol className="font-inter text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Ouvrez <strong className="text-foreground">BetterStack → Monitors → New Monitor</strong></li>
                <li>Choisissez <strong className="text-foreground">HTTP</strong></li>
                <li>Collez l'URL du module ci-dessous dans le champ URL</li>
                <li>Mettez le statut du module en <strong className="text-blue-400">Maintenance</strong> ou <strong className="text-red-400">Hors ligne</strong> ici → BetterStack détectera automatiquement une panne (code 503)</li>
              </ol>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              {DEFAULT_MODULES.map(m => (
                <CopyRow key={m.name} label={m.label} url={getMonitorUrl(m.name)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-grotesk font-semibold text-base mb-4">Actions Rapides</h2>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      <div className="space-y-2">
        <h2 className="font-grotesk font-semibold text-base">Modules</h2>
        {modules.map(module => {
          const moduleInfo = DEFAULT_MODULES.find(m => m.name === module.module_name);
          const cfg = STATUS_CONFIG[module.status] || STATUS_CONFIG.operational;
          const Icon = cfg.icon;

          return (
            <div key={module.module_name} className={`bg-card border ${cfg.border} rounded-xl p-4`}>
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm">{moduleInfo?.label || module.module_name}</p>
                  <div className="flex gap-1 items-center mt-2 flex-wrap">
                    {Object.entries(STATUS_CONFIG).map(([status]) => (
                      <button
                        key={status}
                        onClick={() => setStatus(module, status)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                          module.status === status
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {STATUS_CONFIG[status].label}
                      </button>
                    ))}
                  </div>

                  {module.status !== 'operational' && (
                    <input
                      type="text"
                      placeholder="Message affiché aux visiteurs..."
                      value={module.message || ''}
                      onChange={e => setMessage(module, e.target.value)}
                      className="w-full mt-2 px-2 py-1.5 text-xs rounded border border-border bg-background text-foreground"
                    />
                  )}

                  {/* BetterStack URL inline */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-muted-foreground/50 truncate flex-1">{getMonitorUrl(module.module_name)}</span>
                    <button onClick={() => { navigator.clipboard.writeText(getMonitorUrl(module.module_name)); toast.success('URL copiée'); }}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-secondary">
                      <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Switch checked={module.is_active} onCheckedChange={() => toggleModule(module)} />
                  <span className="text-[10px] text-muted-foreground">{module.is_active ? 'Actif' : 'Inactif'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}