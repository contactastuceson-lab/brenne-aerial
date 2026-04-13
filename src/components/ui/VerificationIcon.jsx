import React from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';

/**
 * Affiche les icônes de vérification à côté du nom.
 * Passe le tableau `verifications` de l'utilisateur.
 */
export default function VerificationIcons({ verifications = [], size = 'sm' }) {
  if (!verifications?.length) return null;
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <>
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        return (
          <span key={key} title={cfg.label}>
            <Icon className={`${dim} ${cfg.color} flex-shrink-0`} />
          </span>
        );
      })}
    </>
  );
}