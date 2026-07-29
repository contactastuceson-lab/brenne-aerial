import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DiscordMarkdown from '@/components/forum/DiscordMarkdown';

export default function RepostEmbed({ postId }) {
  const navigate = useNavigate();
  const [original, setOriginal] = useState(undefined);

  useEffect(() => {
    let active = true;
    base44.entities.Post.get(postId)
      .then(p => { if (active) setOriginal(p); })
      .catch(() => { if (active) setOriginal(null); });
    return () => { active = false; };
  }, [postId]);

  if (original === undefined) return null;

  if (!original) {
    return (
      <div className="mb-2 rounded-xl border border-border bg-secondary/20 px-3 py-2">
        <p className="font-inter text-xs text-muted-foreground/50 italic">Post original indisponible</p>
      </div>
    );
  }

  const open = (e) => { e.stopPropagation(); navigate(`/post/${original.id}`); };

  return (
    <div onClick={open} className="mb-2 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer overflow-hidden">
      <div className="px-3 pt-2.5 pb-1">
        <p className="font-inter text-[13px] font-bold text-foreground/90 truncate">
          {original.author_display_name || original.author_name || 'Utilisateur'}
          <span className="font-normal text-muted-foreground/50"> @{original.author_username}</span>
        </p>
      </div>
      {original.content && (
        <div className="px-3 pb-2 text-[14px] text-foreground/80 leading-relaxed">
          <DiscordMarkdown content={original.content} allowMarkdown={false} />
        </div>
      )}
      {original.media_urls?.length > 0 && (
        <div className="px-3 pb-2">
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {original.media_urls.length} média{original.media_urls.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}