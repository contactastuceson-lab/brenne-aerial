import { MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ConvStatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Ouvertes', value: stats.open, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Refusées', value: stats.declined, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
      ].map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.icon className={`w-4 h-4 ${s.color}`} />
          </div>
          <div>
            <p className={`font-grotesk font-bold text-xl ${s.color}`}>{s.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}