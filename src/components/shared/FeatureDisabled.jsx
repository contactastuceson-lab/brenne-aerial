import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function FeatureDisabled({ title = 'Service temporairement indisponible', message = 'Cette page a été temporairement désactivée par notre équipe.' }) {
  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🔧</div>
        <h2 className="font-grotesk font-bold text-2xl mb-3">{title}</h2>
        <p className="font-inter text-sm text-muted-foreground mb-4 leading-relaxed">{message}</p>
        <p className="font-inter text-sm text-muted-foreground mb-8">
          Consultez notre page de statut pour suivre l'avancement en temps réel.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://statut.brenneaerial.org" target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 w-full sm:w-auto">
              <ExternalLink className="w-4 h-4" />
              Voir le statut des services
            </Button>
          </a>
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}