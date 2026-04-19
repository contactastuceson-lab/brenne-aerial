import React from 'react';
import { CheckCircle, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StatusStep = ({ title, status, date, isCompleted, isCurrent }) => {
  let icon, color;
  
  if (status === 'completed') {
    icon = CheckCircle;
    color = 'text-green-400 bg-green-400/10 border-green-400/30';
  } else if (status === 'current') {
    icon = Clock;
    color = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
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
        <p className={`font-semibold text-sm ${status === 'completed' ? 'text-green-400' : status === 'current' ? 'text-yellow-400' : 'text-muted-foreground'}`}>
          {title}
        </p>
        {date && <p className="font-mono text-xs text-muted-foreground mt-1">{format(new Date(date), 'd MMMM yyyy', { locale: fr })}</p>}
      </div>
    </div>
  );
};

export default function CertificationTracking({ request }) {
  if (!request) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-primary" />
        </div>
        <p className="font-inter text-sm text-muted-foreground">Aucune demande de certification</p>
      </div>
    );
  }

  const steps = [
    { title: 'Formulaire soumis', status: 'completed', date: request.created_date },
    { title: 'Paiement effectué', status: request.payment_status === 'completed' ? 'completed' : 'pending', date: request.payment_status === 'completed' ? request.updated_date : null },
    { title: 'Examen en cours', status: request.status === 'pending' ? 'current' : request.status !== 'pending' ? 'completed' : 'pending', date: null },
    { title: 'Réponse finale', status: request.status !== 'pending' ? 'completed' : 'pending', date: request.status !== 'pending' ? request.updated_date : null },
  ];

  const statusLabel = {
    pending: { text: 'En attente', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' },
    approved: { text: 'Approuvée ✓', color: 'bg-green-400/10 text-green-400 border-green-400/30' },
    rejected: { text: 'Refusée', color: 'bg-red-400/10 text-red-400 border-red-400/30' },
  };

  const paymentLabel = {
    completed: { text: 'Payé ✓', color: 'bg-green-400/10 text-green-400 border-green-400/30' },
    pending: { text: 'En attente', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' },
    failed: { text: 'Échoué', color: 'bg-red-400/10 text-red-400 border-red-400/30' },
  };

  const currentStatus = statusLabel[request.status];
  const currentPayment = paymentLabel[request.payment_status];

  return (
    <div className="space-y-6">
      {/* Status badges */}
      <div className="flex gap-3 flex-wrap">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${currentStatus.color}`}>
          {currentStatus.text}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${currentPayment.color}`}>
          {currentPayment.text}
        </span>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-grotesk font-semibold text-base mb-6">Suivi de votre demande</h3>
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <StatusStep
              key={idx}
              title={step.title}
              status={step.status}
              date={step.date}
              isCompleted={step.status === 'completed'}
              isCurrent={idx === steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Notes admin */}
      {request.admin_notes && (
        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <p className="font-inter text-xs text-muted-foreground mb-2">Notes de l'équipe</p>
          <p className="font-inter text-sm">{request.admin_notes}</p>
        </div>
      )}

      {/* Message based on status */}
      {request.status === 'pending' && request.payment_status === 'completed' && (
        <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
          <p className="font-inter text-sm text-blue-300">
            Votre paiement a été reçu ✓ Notre équipe examine votre dossier. Vous recevrez une réponse sous 5 jours ouvrables.
          </p>
        </div>
      )}

      {request.status === 'approved' && (
        <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
          <p className="font-inter text-sm text-green-300">
            Félicitations ! Votre certification a été approuvée. Le badge "Officiel" a été ajouté à votre profil.
          </p>
        </div>
      )}

      {request.status === 'rejected' && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 space-y-2">
          <p className="font-inter text-sm text-red-300 font-semibold">Votre demande a été examinée</p>
          {request.admin_notes && (
            <p className="font-inter text-sm text-red-300/80">
              <span className="font-semibold">Raison :</span> {request.admin_notes}
            </p>
          )}
          <p className="font-inter text-xs text-red-300/70 mt-2">
            Vous pouvez soumettre une nouvelle demande après amélioration de votre dossier.
          </p>
        </div>
      )}
    </div>
  );
}