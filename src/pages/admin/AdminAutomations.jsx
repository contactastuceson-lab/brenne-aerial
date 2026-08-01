import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Brain, Shield, AlertCircle, Award, ShoppingCart, UserPlus, Coins,
  Megaphone, Clock, Bot, RefreshCw, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

const CATEGORY_META = {
  digest: { icon: Brain, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', label: 'Digest Nexus' },
  moderation: { icon: Shield, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Modération' },
  fraud: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Anti-fraude' },
  badges: { icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'Badges' },
  cart: { icon: ShoppingCart, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20', label: 'Panier' },
  onboarding: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Onboarding' },
  economy: { icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Économie' },
  ads: { icon: Megaphone, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20', label: 'Publicité' },
  retention: { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', label: 'Rétention' },
  system: { icon: Bot, color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-border', label: 'Système' },
};

const STATUS_COLOR = {
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

const FILTERS = ['all', 'digest', 'fraud', 'badges', 'cart', 'onboarding', 'moderation', 'ads', 'retention', 'economy'];

export default function AdminAutomations() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [running, setRunning] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['automation-logs'],
    queryFn: () => base44.entities.AutomationLog.list('-run_at', 100),
    refetchInterval: 60000,
  });

  const runDigest = async () => {
    setRunning(true);
    try {
      await base44.functions.invoke('nexusDailyDigest', {});
      toast.success('Digest Nexus lancé — résultat tracé ici sous peu');
      setTimeout(() => qc.invalidateQueries({ queryKey: ['automation-logs'] }), 3000);
    } catch {
      toast.error('Erreur lors du lancement');
    }
    setRunning(false);
  };

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.category === filter);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayCount = logs.filter((l) => l.run_at && new Date(l.run_at) > today).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> Automatisations
          </h1>
          <p className="font-inter text-sm text-muted-foreground">
            Journal de tout ce que la plateforme fait automatiquement (Nexus, fraude, badges, paniers…)
          </p>
        </div>
        <Button onClick={runDigest} disabled={running} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Lancement…' : 'Lancer le digest Nexus'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-mono text-xs text-muted-foreground">Actions aujourd'hui</p>
          <p className="font-grotesk font-bold text-2xl mt-1">{todayCount}</p>
        </div>
        <div className="bg-card border border-green-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-green-400">Succès (total)</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-green-400">{logs.filter((l) => l.status === 'success').length}</p>
        </div>
        <div className="bg-card border border-yellow-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-yellow-400">Alertes</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-yellow-400">{logs.filter((l) => l.status === 'warning').length}</p>
        </div>
        <div className="bg-card border border-red-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-red-400">Erreurs</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-red-400">{logs.filter((l) => l.status === 'error').length}</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
              filter === f ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border text-muted-foreground hover:text-foreground'
            }`}>
            {f === 'all' ? 'Tout' : (CATEGORY_META[f]?.label || f)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-inter text-sm text-muted-foreground">Aucune action automatisée enregistrée pour le moment.</p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Les tâches planifiées alimentent ce journal automatiquement.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const meta = CATEGORY_META[log.category] || CATEGORY_META.system;
            const Icon = meta.icon;
            return (
              <div key={log.id} className={`flex items-start gap-3 p-4 rounded-xl border ${meta.border} bg-card`}>
                <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-grotesk font-bold text-sm">{log.label || log.automation_name}</span>
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>{meta.label}</span>
                    <span className={`font-mono text-[10px] font-bold ${STATUS_COLOR[log.status] || 'text-muted-foreground'}`}>
                      {log.status === 'success' ? '✓' : log.status === 'warning' ? '⚠' : '✗'} {log.status}
                    </span>
                    {typeof log.count === 'number' && log.count > 0 && (
                      <span className="font-mono text-[10px] text-muted-foreground">×{log.count}</span>
                    )}
                  </div>
                  {log.summary && (
                    <p className="font-inter text-xs text-muted-foreground mt-1">{log.summary}</p>
                  )}
                  {log.details && (
                    <details className="mt-1.5">
                      <summary className="font-mono text-[10px] text-muted-foreground/60 cursor-pointer hover:text-foreground">détails</summary>
                      <pre className="font-mono text-[10px] text-muted-foreground/70 whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">{log.details}</pre>
                    </details>
                  )}
                  <p className="font-mono text-[10px] text-muted-foreground/40 mt-1">
                    {log.run_at ? formatDistanceToNow(new Date(log.run_at), { addSuffix: true, locale: fr }) : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}