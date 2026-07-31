import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Eye, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { storyDuration, timeAgo, gradientByKey } from '@/lib/storyUtils';

export default function StoryViewer({ groups, startAuthorIndex = 0, currentUser, onClose, onViewsChanged }) {
  const [authorIdx, setAuthorIdx] = useState(() => Math.min(startAuthorIndex, groups.length - 1));
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewersOpen, setViewersOpen] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const group = groups[authorIdx];
  const story = group?.stories[storyIdx];
  const isOwn = group?.author_id === currentUser?.id;

  const advance = useCallback(() => {
    setStoryIdx((prev) => {
      const g = groups[authorIdx];
      if (!g) return prev;
      if (prev < g.stories.length - 1) return prev + 1;
      if (authorIdx < groups.length - 1) {
        setAuthorIdx(authorIdx + 1);
        return 0;
      }
      onClose();
      return prev;
    });
  }, [authorIdx, groups, onClose]);

  const prev = useCallback(() => {
    if (storyIdx > 0) setStoryIdx(storyIdx - 1);
    else if (authorIdx > 0) { setAuthorIdx(authorIdx - 1); setStoryIdx(0); }
  }, [storyIdx, authorIdx]);

  // Reset index when author changes
  useEffect(() => { setStoryIdx(0); setViewersOpen(false); }, [authorIdx]);

  // Track view + run progress timer per story
  useEffect(() => {
    if (!story) return;
    setProgress(0);
    if (!isOwn) {
      base44.functions.invoke('trackStoryView', { storyId: story.id }).catch(() => {});
      if (onViewsChanged) onViewsChanged();
    }
    if (story.media_type === 'video') return; // video advances via onEnded
    const dur = storyDuration(story);
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(1, elapsed / dur);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else advance();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  if (!group || !story) return null;

  const viewers = Array.isArray(story.viewers) ? story.viewers : [];

  const renderContent = () => {
    if (story.media_type === 'text') {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-8"
          style={{ background: gradientByKey(story.background_color) }}
        >
          <p className="font-grotesk font-black text-2xl sm:text-4xl text-white text-center leading-snug break-words whitespace-pre-wrap drop-shadow-lg">
            {story.text}
          </p>
        </div>
      );
    }
    if (story.media_type === 'video') {
      return (
        <video
          key={story.id}
          src={story.media_url}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover"
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
          onEnded={advance}
        />
      );
    }
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <img src={story.media_url} alt="" className="w-full h-full object-cover" />
        {story.text && (
          <div className="absolute bottom-20 left-0 right-0 px-6">
            <p className="font-grotesk font-bold text-lg text-white text-center drop-shadow-lg whitespace-pre-wrap break-words">
              {story.text}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center">
      {/* Tap zones */}
      <button className="absolute left-0 top-0 bottom-0 w-1/3 z-20" onClick={prev} aria-label="Précédent" />
      <button className="absolute right-0 top-0 bottom-0 w-2/3 z-20" onClick={advance} aria-label="Suivant" />

      {/* Story container */}
      <div className="relative w-full h-full sm:w-[420px] sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-black">
        {renderContent()}

        {/* Top overlay: progress bars + close */}
        <div className="absolute top-0 left-0 right-0 p-3 z-30 pointer-events-none">
          <div className="flex gap-1 mb-2">
            {group.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: i < storyIdx ? '100%' : i === storyIdx ? `${progress * 100}%` : '0%' }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                {group.author_avatar ? (
                  <img src={group.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-grotesk font-bold text-xs text-white">
                      {(group.author_name || group.author_username || '?')[0]}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-grotesk font-bold text-xs text-white leading-tight">
                  {group.author_username || group.author_name}
                </p>
                <p className="font-mono text-[9px] text-white/60">{timeAgo(story)}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Own story: viewers count + list */}
        {isOwn && (
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
            <div className="bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4">
              <button
                onClick={() => setViewersOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Eye className="w-4 h-4 text-white" />
                <span className="font-grotesk font-bold text-sm text-white">{viewers.length}</span>
                <span className="font-inter text-xs text-white/70">vues</span>
                <ChevronUp className={`w-4 h-4 text-white/70 transition-transform ${viewersOpen ? '' : 'rotate-180'}`} />
              </button>

              {viewersOpen && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-black/60 border border-white/10 divide-y divide-white/10">
                  {viewers.length === 0 ? (
                    <p className="px-3 py-3 font-inter text-xs text-white/50 text-center">Aucune vue pour l'instant</p>
                  ) : (
                    viewers.map((v) => (
                      <div key={v.id} className="flex items-center gap-2.5 px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                          {v.avatar ? (
                            <img src={v.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center font-grotesk font-bold text-[10px] text-white">
                              {(v.name || v.username || '?')[0]}
                            </span>
                          )}
                        </div>
                        <span className="font-inter text-xs text-white/90 truncate">
                          {v.username || v.name || 'Utilisateur'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}