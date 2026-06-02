import React from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_ICONS = {
  pending: Clock,
  reviewing: TrendingUp,
  accepted: CheckCircle,
  completed: CheckCircle,
  refused: XCircle,
};

const STATUS_COLORS = {
  pending: { bg: 'bg-amber-400/10', border: 'border-amber-400/30', text: 'text-amber-400' },
  reviewing: { bg: 'bg-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-400' },
  accepted: { bg: 'bg-green-400/10', border: 'border-green-400/30', text: 'text-green-400' },
  completed: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' },
  refused: { bg: 'bg-red-400/10', border: 'border-red-400/30', text: 'text-red-400' },
};

const STATUS_LABELS = {
  pending: 'En attente',
  reviewing: 'En examen',
  accepted: 'Accepté',
  completed: 'Terminé',
  refused: 'Refusé',
};

function StatusStep({ status, isActive, isCompleted, index }) {
  const Icon = STATUS_ICONS[status] || Clock;
  const colors = STATUS_COLORS[status];
  
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
        isActive ? `${colors.bg} ${colors.border}` : isCompleted ? 'bg-green-400/10 border-green-400/30' : 'bg-muted border-border'
      }`}>
        <Icon className={`w-5 h-5 ${isActive || isCompleted ? colors.text : 'text-muted-foreground'}`} />
      </div>
      <p className="font-mono text-[10px] text-muted-foreground mt-1.5 font-semibold text-center">
        {STATUS_LABELS[status]}
      </p>
    </div>
  );
}

export default function QuoteTracking({ quote }) {
  if (!quote) return null;

  const timeline = [
    { status: 'pending', label: 'Demande créée' },
    { status: 'reviewing', label: 'En examen' },
    { status: 'accepted', label: 'Accepté' },
    { status: 'completed', label: 'Réalisé' },
  ];

  const statusOrder = { pending: 0, reviewing: 1, accepted: 2, completed: 3, refused: -1 };
  const currentStep = statusOrder[quote.status] ?? -1;
  const daysSince = differenceInDays(new Date(), new Date(quote.created_date));

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <div className={`px-3 py-1.5 rounded-full border font-mono text-xs font-semibold ${
          STATUS_COLORS[quote.status].bg + ' ' + STATUS_COLORS[quote.status].border + ' ' + STATUS_COLORS[quote.status].text
        }`}>
          {STATUS_LABELS[quote.status]}
        </div>
        {quote.prix_final && (
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-semibold">
            {quote.prix_final}€
          </div>
        )}
        <div className="px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground font-mono text-xs">
          {daysSince}j
        </div>
      </div>

      {/* Timeline */}
      {quote.status !== 'refused' ? (
        <div className="flex items-start gap-2">
          {timeline.map((item, idx) => (
            <div key={item.status} className="flex-1 flex flex-col items-center">
              <StatusStep 
                status={item.status}
                isActive={currentStep === idx}
                isCompleted={currentStep > idx}
                index={idx}
              />
              {idx < timeline.length - 1 && (
                <div className={`h-12 w-0.5 mt-1 ${currentStep > idx ? 'bg-green-400' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/30 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-inter font-semibold text-sm text-red-400">Devis refusé</p>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">
              {quote.admin_notes || 'Aucune information supplémentaire disponible'}
            </p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/40 rounded-lg p-3">
          <p className="font-mono text-[8px] text-muted-foreground mb-1 font-semibold">SERVICE</p>
          <p className="font-inter text-sm font-semibold truncate">{quote.service_type?.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-secondary/40 rounded-lg p-3">
          <p className="font-mono text-[8px] text-muted-foreground mb-1 font-semibold">TARIF</p>
          <p className="font-inter text-sm font-semibold text-primary">
            {quote.prix_final ? `${quote.prix_final}€` : (quote.prix_estime ? `~${quote.prix_estime}€` : 'En attente')}
          </p>
        </div>
      </div>

      {/* Admin notes */}
      {quote.admin_notes && quote.status !== 'refused' && (
        <div className="bg-secondary/40 rounded-lg p-3.5">
          <p className="font-mono text-[8px] text-muted-foreground mb-2 font-semibold">NOTES</p>
          <p className="font-inter text-xs text-muted-foreground">{quote.admin_notes}</p>
        </div>
      )}

      {/* Info */}
      <p className="font-inter text-xs text-muted-foreground">
        Devis créé le {format(new Date(quote.created_date), 'd MMMM yyyy', { locale: fr })}
        {quote.date_souhaitee && ` • Date souhaitée : ${quote.date_souhaitee}`}
      </p>
    </div>
  );
}