import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { RANGE_MS } from '@/lib/automationMeta';
import QuickActionsPanel from '@/components/admin/automations/QuickActionsPanel';
import AutomationFilters from '@/components/admin/automations/AutomationFilters';
import AutomationLogItem from '@/components/admin/automations/AutomationLogItem';

export default function AdminAutomations() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ q: '', status: 'all', range: '7d', category: 'all' });
  const [refreshing, setRefreshing] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['automation-logs'],
    queryFn: () => base44.entities.AutomationLog.list('-run_at', 200),
    refetchInterval: 60000,
  });

  const apply = (items) => {
    const q = filters.q.trim().toLowerCase();
    const rangeMs = RANGE_MS[filters.range];
    const now = Date.now();
    return items.filter((l) => {
      if (filters.category !== 'all' && l.category !== filters.category) return false;
      if (filters.status !== 'all' && l.status !== filters.status) return false;
      if (rangeMs && l.run_at && now - new Date(l.run_at).getTime() > rangeMs) return false;
      if (q) {
        const hay = `${l.label || ''} ${l.automation_name || ''} ${l.summary || ''} ${l.details || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  };

  const filtered = apply(logs);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayCount = logs.filter((l) => l.run_at && new Date(l.run_at) > today).length;
  const counts = {
    success: logs.filter((l) => l.status === 'success').length,
    warning: logs.filter((l) => l.status === 'warning').length,
    error: logs.filter((l) => l.status === 'error').length,
  };

  const delOne = async (log) => {
    try {
      await base44.entities.AutomationLog.delete(log.id);
      qc.invalidateQueries({ queryKey: ['automation-logs'] });
      toast.success('Entrée supprimée');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const clearAll = async () => {
    if (!window.confirm(`Vider tout le journal (${logs.length} entrées) ? Cette action est irréversible.`)) return;
    try {
      await base44.entities.AutomationLog.deleteMany({});
      qc.invalidateQueries({ queryKey: ['automation-logs'] });
      toast.success('Journal vidé');
    } catch {
      toast.error('Impossible de vider le journal');
    }
  };

  const exportCsv = () => {
    const rows = [['Date', 'Catégorie', 'Statut', 'Libellé', 'Résumé', 'Nombre', 'Détails']];
    for (const l of filtered) {
      rows.push([
        l.run_at ? new Date(l.run_at).toLocaleString('fr-FR') : '',
        l.category || '',
        l.status || '',
        (l.label || '').replace(/;/g, ','),
        (l.summary || '').replace(/;/g, ',').replace(/\n/g, ' '),
        String(l.count ?? ''),
        (l.details || '').replace(/;/g, ',').replace(/\n/g, ' ').slice(0, 300),
      ]);
    }
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automations-eza-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} entrées exportées`);
  };

  const refresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['automation-logs'] });
    setRefreshing(false);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> Automatisations
          </h1>
          <p className="font-inter text-sm text-muted-foreground">
            Centre de contrôle — pilotez et suivez tout ce que la plateforme fait automatiquement.
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-2 hover:bg-secondary/40 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-mono text-xs text-muted-foreground">Actions aujourd'hui</p>
          <p className="font-grotesk font-bold text-2xl mt-1">{todayCount}</p>
        </div>
        <div className="bg-card border border-green-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-green-400">Succès</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-green-400">{counts.success}</p>
        </div>
        <div className="bg-card border border-yellow-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-yellow-400">Alertes</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-yellow-400">{counts.warning}</p>
        </div>
        <div className="bg-card border border-red-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-red-400">Erreurs</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-red-400">{counts.error}</p>
        </div>
      </div>

      <QuickActionsPanel onDone={refresh} />

      <AutomationFilters
        filters={filters}
        setFilters={setFilters}
        onExport={exportCsv}
        onClearAll={clearAll}
        total={logs.length}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-inter text-sm text-muted-foreground">Aucune entrée ne correspond aux filtres.</p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
            {logs.length} entrée(s) au total · ajustez la recherche ou la période
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-muted-foreground/60 px-1">
            {filtered.length} / {logs.length} entrées affichées
          </p>
          {filtered.map((log) => (
            <AutomationLogItem key={log.id} log={log} onDelete={delOne} />
          ))}
        </div>
      )}
    </div>
  );
}