import { Search, Trash2, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CATEGORIES, CATEGORY_META, STATUS_FILTERS, RANGE_FILTERS,
} from '@/lib/automationMeta';

// Barre de filtres : recherche, statut, plage de temps + export CSV + vider le journal.
export default function AutomationFilters({ filters, setFilters, onExport, onClearAll, total }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Rechercher (libellé, résumé, détails…)"
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex rounded-md border border-input overflow-hidden">
          {RANGE_FILTERS.map((r) => (
            <button
              key={r.value}
              onClick={() => setFilters((f) => ({ ...f, range: r.value }))}
              className={`px-2.5 py-1.5 text-xs font-mono transition-colors ${
                filters.range === r.value ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/40'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onClearAll}
          className="gap-1.5 text-red-400 border-red-400/30 hover:bg-red-400/10">
          <Trash2 className="w-3.5 h-3.5" /> Vider ({total})
        </Button>
      </div>

      {/* Filtres par catégorie (chips) */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilters((f) => ({ ...f, category: 'all' }))}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
            filters.category === 'all' ? 'bg-primary/10 border-primary/30 text-primary font-bold' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Toutes catégories
        </button>
        {CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c];
          return (
            <button
              key={c}
              onClick={() => setFilters((f) => ({ ...f, category: c }))}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
                filters.category === c ? `${meta.bg} ${meta.border} ${meta.color} font-bold` : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}