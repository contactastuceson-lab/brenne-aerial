import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FeatureDisabled({ title = 'Fonctionnalité désactivée', message = 'Cette section est temporairement indisponible.', showBack = true }) {
  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-destructive/60" />
        </div>
        <h2 className="font-grotesk font-bold text-xl mb-2">{title}</h2>
        <p className="font-inter text-sm text-muted-foreground mb-6">{message}</p>
        {showBack && (
          <Link to="/">
            <Button variant="outline" className="border-border font-inter text-sm">
              Retour à l'accueil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}