import React from 'react';
import { CheckCircle, Clock, Flag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StatusStep = ({ title, status, date, isCurrent }) => {
  let icon, color;
  
  if (status === 'completed') {
    icon = CheckCircle;
    color = 'text-green-400 bg-green-400/10 border-green-400/30';
  } else if (status === 'current') {
    icon = Clock;
    color = 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  } else {
    icon = Clock;
    color = 'text-muted-foreground/30 bg-muted/10 border-muted/30';
  }
  
  const Icon = icon;
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {isCurrent === false && <div className="w-0.5 h-8 bg-muted/20 mt-2" />}
      </div>
      <div className="py-1">
        <p className={`font-semibold text-sm ${status === 'completed' ? 'text-green-400' : status === 'current' ? 'text-blue-400' : 'text-muted-foreground'}`}>
          {title}
        </p>
        {date && <p className="font-mono text-xs text-muted-foreground mt-1">{format(new Date(date), 'd MMMM yyyy', { locale: fr })}</p>}
      </div>
    </div>
  );
};

export default function ReportTracking({ report }) {
  if (!report) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Flag className="w-8 h-8 text-primary" />
        </div>
        <p className="font-inter text-sm text-muted-foreground">Aucun signalement</p>
      </div>
    );
  }

  const steps = [
    { title: 'Signalement reçu', status: 'completed', date: report.created_date },
    { title: 'Pris en charge', status: report.status !== 'pending' ? 'completed' : 'current', date: report.status !== 'pending' ? report.updated_date : null },
    { title: 'Verdict final', status: ['resolved', 'dismissed'].includes(report.status) ? 'completed' : 'pending', date: ['resolved', 'dismissed'].includes(report.status) ? report.updated_date : null },
  ];

  const statusLabel = {
    pending: { text: 'En attente', color: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
    reviewing: { text: 'En examen', color: 'bg-blue-400/10 text-blue-400 border-blue-400/30' },
    resolved: { text: 'Résolu ✓', color: 'bg-green-400/10 text-green-400 border-green-400/30' },
    dismissed: { text: 'Rejeté', color: 'bg-red-400/10 text-red-400 border-red-400/30' },
  };

  const currentStatus = statusLabel[report.status] || statusLabel.pending;

  const reasonLabel = report.reason
    ?.replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div className="flex gap-3 flex-wrap items-center">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${currentStatus.color}`}>
          {currentStatus.text}
        </span>
        {report.target_type === 'user' ? (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-primary/10 text-primary border-primary/30">
            👤 Utilisateur
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-accent/10 text-accent border-accent/30">
            💬 Contenu
          </span>
        )}
        {reasonLabel && (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-secondary text-foreground border-border">
            {reasonLabel}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-grotesk font-semibold text-base mb-6">Suivi de votre signalement</h3>
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <StatusStep
              key={idx}
              title={step.title}
              status={step.status}
              date={step.date}
              isCurrent={idx === steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Target info */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4">
        <p className="font-inter text-xs text-muted-foreground mb-2">Cible du signalement</p>
        <p className="font-inter text-sm font-medium">{report.target_name || report.target_email}</p>
      </div>

      {/* Notes admin */}
      {report.admin_notes && (
        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <p className="font-inter text-xs text-muted-foreground mb-2">Notes de modération</p>
          <p className="font-inter text-sm">{report.admin_notes}</p>
        </div>
      )}

      {/* Message based on status */}
      {report.status === 'pending' && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-4">
          <p className="font-inter text-sm text-amber-300">
            Votre signalement est en attente. Notre équipe de modération l'examinera sous peu.
          </p>
        </div>
      )}

      {report.status === 'reviewing' && (
        <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
          <p className="font-inter text-sm text-blue-300">
            Votre signalement est actuellement examiné par nos modérateurs. Vous serez informé du résultat très bientôt.
          </p>
        </div>
      )}

      {report.status === 'resolved' && (
        <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 space-y-2">
          <p className="font-inter text-sm text-green-300 font-semibold">Signalement résolu ✓</p>
          <p className="font-inter text-sm text-green-300/80">
            Les mesures appropriées ont été prises suite à votre signalement. Merci d'avoir contribué à améliorer notre communauté.
          </p>
        </div>
      )}

      {report.status === 'dismissed' && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 space-y-2">
          <p className="font-inter text-sm text-red-300 font-semibold">Signalement rejeté</p>
          <p className="font-inter text-sm text-red-300/80">
            Après examen, ce signalement n'a pas entraîné d'action. Si vous avez d'autres préoccupations, vous pouvez signaler à nouveau.
          </p>
        </div>
      )}
    </div>
  );
}