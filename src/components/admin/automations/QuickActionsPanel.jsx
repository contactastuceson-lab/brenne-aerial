import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { CATEGORY_META, QUICK_ACTIONS } from '@/lib/automationMeta';

// Grille d'actions rapides : déclenchement manuel de chaque automatisation planifiée.
export default function QuickActionsPanel({ onDone }) {
  const [running, setRunning] = useState(null);

  const run = async (action) => {
    setRunning(action.fn);
    try {
      const res = await base44.functions.invoke(action.fn, {});
      toast.success(`${action.label} lancé`, { description: action.metric(res) });
      onDone?.();
    } catch {
      toast.error(`Échec : ${action.label}`);
    }
    setRunning(null);
  };

  const runAll = async () => {
    setRunning('__all__');
    toast.info('Lancement de toutes les automatisations…');
    let ok = 0;
    for (const a of QUICK_ACTIONS) {
      try { await base44.functions.invoke(a.fn, {}); ok++; } catch {}
    }
    toast.success(`${ok}/${QUICK_ACTIONS.length} tâches exécutées`);
    setRunning(null);
    onDone?.();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-grotesk font-bold text-sm">Actions rapides — lancer maintenant</h3>
        </div>
        <button onClick={runAll} disabled={!!running}
          className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 disabled:opacity-50 transition-all">
          {running === '__all__' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          Tout lancer
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((a) => {
          const meta = CATEGORY_META[a.category] || CATEGORY_META.system;
          const Icon = meta.icon;
          const busy = running === a.fn || running === '__all__';
          return (
            <button key={a.fn} onClick={() => run(a)} disabled={!!running}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${meta.border} bg-card hover:bg-secondary/40 transition-all text-left disabled:opacity-50`}>
              <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                {busy ? <RefreshCw className="w-4 h-4 animate-spin text-primary" /> : <Icon className={`w-4 h-4 ${meta.color}`} />}
              </div>
              <div className="min-w-0">
                <p className="font-inter text-xs font-semibold truncate leading-tight">{a.label}</p>
                <p className={`font-mono text-[9px] ${meta.color}`}>{meta.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}