import React, { useState } from 'react';
import ReportModal from '@/components/shared/ReportModal';
import { useAuth } from '@/lib/AuthContext';

/**
 * Bouton de signalement réutilisable.
 * Ouvre le ReportModal avec les bonnes métadonnées.
 *
 * Props:
 * - targetType: 'post' | 'discussion' | 'discussion_reply' | 'forum_topic' | 'forum_post' | 'user' | 'message' | 'community' | 'space' | 'story' | 'event' | 'review'
 * - targetId: string
 * - targetName: string (nom de l'auteur)
 * - targetEmail: string (email de l'auteur, si connu)
 * - targetContent: string (aperçu du contenu signalé)
 * - targetUrl: string (lien vers le contenu)
 * - className: string (classes additionnelles)
 * - label: string (texte du bouton, défaut "Signaler")
 * - icon: composant icône (défaut Flag)
 * - variant: 'menu' | 'button' | 'icon'
 */
export default function ReportButton({
  targetType,
  targetId,
  targetName = '',
  targetEmail = '',
  targetContent = '',
  targetUrl = '',
  className = '',
  label = 'Signaler',
  icon: Icon = null,
  variant = 'menu',
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleClick = (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setOpen(true);
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors ${className}`}
          title={label}
        >
          {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
        </button>
        <ReportModal
          open={open}
          onClose={() => setOpen(false)}
          targetType={targetType}
          targetId={targetId}
          targetName={targetName}
          targetEmail={targetEmail}
          targetContent={targetContent}
          targetUrl={targetUrl}
        />
      </>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors ${className}`}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </button>
        <ReportModal
          open={open}
          onClose={() => setOpen(false)}
          targetType={targetType}
          targetId={targetId}
          targetName={targetName}
          targetEmail={targetEmail}
          targetContent={targetContent}
          targetUrl={targetUrl}
        />
      </>
    );
  }

  // variant === 'menu' (défaut)
  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-inter text-rose-400 hover:bg-rose-400/10 transition-colors text-left ${className}`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
        targetEmail={targetEmail}
        targetContent={targetContent}
        targetUrl={targetUrl}
      />
    </>
  );
}