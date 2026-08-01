import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { CATEGORY_META, STATUS_COLOR } from '@/lib/automationMeta';

// Une entrée du journal d'automatisation, avec suppression individuelle.
export default function AutomationLogItem({ log, onDelete }) {
  const meta = CATEGORY_META[log.category] || CATEGORY_META.system;
  const Icon = meta.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${meta.border} bg-card`}>
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
        {log.summary && <p className="font-inter text-xs text-muted-foreground mt-1">{log.summary}</p>}
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
      <button
        onClick={() => onDelete(log)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 transition-colors"
        aria-label="Supprimer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}