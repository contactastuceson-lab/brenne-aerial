import { CheckCircle, Clock, XCircle, Lock } from 'lucide-react';

export default function ConvStatusBadge({ status, locked }) {
  const cfg = {
    open:     { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'Ouverte' },
    pending:  { icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'En attente' },
    declined: { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Refusée' },
  }[status] || {};
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
        <Icon className="w-2.5 h-2.5" /> {cfg.label}
      </span>
      {locked && (
        <span className="flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border text-orange-400 bg-orange-400/10 border-orange-400/20">
          <Lock className="w-2.5 h-2.5" /> Verrouillée
        </span>
      )}
    </div>
  );
}