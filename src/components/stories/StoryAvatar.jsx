import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { groupStoriesByAuthor } from '@/lib/storyUtils';
import StoryViewer from './StoryViewer';

/**
 * Avatar qui affiche un anneau story (façon Instagram) si l'auteur a une story active.
 * Clic sur l'anneau = ouverture du StoryViewer ; sinon comportement avatar normal.
 */
export default function StoryAvatar({ authorId, src, name, sizeClass = 'w-10 h-10', roundedClass = 'rounded-lg', onIdentityClick }) {
  const [open, setOpen] = useState(false);
  const { data: group } = useQuery({
    queryKey: ['author-stories', authorId],
    queryFn: async () => {
      if (!authorId) return null;
      const list = await base44.entities.Story.filter({ author_id: authorId }, '-created_date', 50);
      return groupStoriesByAuthor(list)[0] || null;
    },
    enabled: !!authorId,
    staleTime: 60000,
  });

  const initial = (name?.[0] || 'U').toUpperCase();
  const inner = src
    ? <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
    : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>;

  if (group) {
    return (
      <>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          aria-label="Voir la story"
          className="relative flex-shrink-0 active:scale-95 transition-transform"
        >
          <span className={`absolute -inset-[2px] ${roundedClass} bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 opacity-60 animate-pulse blur-[1px] pointer-events-none`} />
          <span className={`relative block ${sizeClass} ${roundedClass} p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600`}>
            <span className={`block w-full h-full ${roundedClass} overflow-hidden bg-secondary flex items-center justify-center`}>
              {inner}
            </span>
          </span>
        </button>
        {open && <StoryViewer groups={[group]} startAuthorIndex={0} onClose={() => setOpen(false)} />}
      </>
    );
  }

  if (onIdentityClick) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onIdentityClick(e); }}
        className={`${sizeClass} ${roundedClass} overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity`}
      >
        {inner}
      </button>
    );
  }
  return <div className={`${sizeClass} ${roundedClass} overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0`}>{inner}</div>;
}