import React from 'react';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function BannedPage({ status, reason }) {
  const title = status === 'banned' ? 'Compte banni' : status === 'suspended' ? 'Compte suspendu' : 'Accès restreint';
  const desc = status === 'banned'
    ? "Votre compte a été définitivement banni de la plateforme."
    : status === 'suspended'
    ? "Votre compte est temporairement suspendu."
    : "Votre accès est restreint sur cette plateforme.";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
        <Ban className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="font-grotesk font-bold text-2xl mb-2">{title}</h1>
      <p className="font-inter text-sm text-muted-foreground mb-2 max-w-md">{desc}</p>
      {reason && (
        <p className="font-mono text-xs text-muted-foreground/70 bg-secondary px-4 py-2 rounded-lg mb-6">
          Raison : {reason}
        </p>
      )}
      <Button variant="outline" className="border-border text-sm" onClick={() => base44.auth.logout('/')}>
        Se déconnecter
      </Button>
    </div>
  );
}