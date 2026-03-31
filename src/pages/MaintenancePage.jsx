import React from 'react';
import { Wrench } from 'lucide-react';

export default function MaintenancePage({ message }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <Wrench className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-grotesk font-bold text-3xl mb-3">
        Brenne <span className="text-primary">Aerial</span>
      </h1>
      <p className="font-inter text-lg text-muted-foreground mb-2">Maintenance en cours</p>
      <p className="font-inter text-sm text-muted-foreground/70 max-w-md">
        {message || "Le site est temporairement en maintenance. Nous serons de retour très bientôt."}
      </p>
    </div>
  );
}