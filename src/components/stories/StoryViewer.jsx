import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { storyDuration, timeAgo, gradientByKey, filterCss, fontCss } from '@/lib/storyUtils';

// Rend un calque riche (texte/emoji/gif/dessin) — compatible anciens stickers {emoji,x,y}
function renderStoryLayer(l, i) {
  if (l.type === 'text') {
    return (
      <div key={i} className="absolute z-20 select-none pointer-events-none" style={{ left: `${l.x}%`, top: `${l.y}%`, transform: `translate(-50%,-50%) scale(${l.scale ?? 1}) rotate(${l.rotation ?? 0}deg)` }}>
        <p className="font-black text-center leading-snug break-words whitespace-pre-wrap" style={{ color: l.color || '#fff', fontFamily: fontCss(l.font), textAlign: l.align || 'center', fontSize: 26, textShadow: '0 2px 10px rgba(0,0,0,0.45)', maxWidth: '78vw' }}>
          {l.content}
        </p>
      </div>
    );
  }
  if (l.type === 'gif') {
    return (
      <div key={i} className="absolute z-20 select-none pointer-events-none" style={{ left: `${l.x}%`, top: `${l.y}%`, transform: `translate(-50%,-50%) scale(${l.scale ?? 1}) rotate(${l.rotation ?? 0}deg)` }}>
        <img src={l.url} alt="" className="w-28 h-28 object-contain rounded-lg" />
      </div>
    );
  }
  if (l.type === 'drawing') {
    return (
      <svg key={i} className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={l.points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')} fill="none" stroke={l.color} strokeWidth={l.size} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  // emoji (nouveau ou legacy)
  return (
    <span key={i} className="absolute text-3xl sm:text-4xl select-none z-20 pointer-events-none" style={{ left: `${l.x}%`, top: `${l.y}%`, transform: `translate(-50%,-50%) scale(${l.scale ?? 1}) rotate(${l.rotation ?? 0}deg)` }}>
      {l.emoji}
    </span>
  );
}
import StoryActionBar from './StoryActionBar';

export default function StoryViewer({ groups, startAuthorIndex = 0, currentUser, onClose, onViewsChanged }) {
  const [authorIdx, setAuthorIdx] = useState(() => Math.min(startAuthorIndex, groups.length - 1));
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const pausedRef = useRef(false);
  const elapsedMsRef = useRef(0);
  const pressStartRef = useRef(0);
  const videoRef = useRef(null);

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

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (videoRef.current) videoRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    if (videoRef.current) videoRef.current.play?.().catch(() => {});
    startRef.current = Date.now() - elapsedMsRef.current;
  }, []);

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
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      const elapsed = Date.now() - startRef.current;
      elapsedMsRef.current = elapsed;
      const p = Math.min(1, elapsed / dur);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else advance();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  // Applique le mute sur la vidéo
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted, story?.id]);

  // Navigation clavier (flèches + Échap)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') advance();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, prev, onClose]);

  if (!group || !story) return null;

  const viewers = Array.isArray(story.viewers) ? story.viewers : [];

  const renderContent = () => {
    const stickers = Array.isArray(story.stickers) ? story.stickers : [];
    if (story.media_type === 'text') {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-8"
          style={{ background: gradientByKey(story.background_color) }}
        >
          <p
            className="font-black text-2xl sm:text-4xl leading-snug break-words whitespace-pre-wrap drop-shadow-lg"
            style={{ fontFamily: fontCss(story.font), color: story.text_color || '#fff', textAlign: story.text_align || 'center', width: '100%' }}
          >
            {story.text}
          </p>
        </div>
      );
    }
    if (story.media_type === 'video') {
      return (
        <video
          key={story.id}
          ref={videoRef}
          src={story.media_url}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
          style={{ filter: filterCss(story.filter) || undefined }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            elapsedMsRef.current = (v.currentTime || 0) * 1000;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
          onEnded={advance}
        />
      );
    }
    const hasLayers = stickers.some((s) => s.type);
    return (
      <div className="w-full h-full bg-black flex items-center justify-center relative">
        <img src={story.media_url} alt="" className="w-full h-full object-cover" style={{ filter: filterCss(story.filter) || undefined }} />
        {/* Légende legacy (ancien format) si aucun calque typé */}
        {story.text && !hasLayers && (
          <div className="absolute inset-x-0 px-6 pointer-events-none" style={{ bottom: '18%', textAlign: story.text_align || 'center' }}>
            <p
              className="font-bold text-lg sm:text-xl drop-shadow-lg whitespace-pre-wrap break-words"
              style={{ fontFamily: fontCss(story.font), color: story.text_color || '#fff' }}
            >
              {story.text}
            </p>
          </div>
        )}
        {stickers.map((s, i) => renderStoryLayer(s, i))}
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center select-none"
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => { if (e.ctrlKey) e.preventDefault(); }}
    >
      {/* Tap zones */}
      <button
        className="absolute left-0 top-0 bottom-0 w-1/3 z-20 touch-none select-none"
        onPointerDown={() => { pressStartRef.current = Date.now(); pause(); }}
        onPointerUp={resume}
        onPointerLeave={resume}
        onPointerCancel={resume}
        onClick={() => { if (Date.now() - pressStartRef.current > 250) return; prev(); }}
        aria-label="Précédent"
      />
      <button
        className="absolute right-0 top-0 bottom-0 w-2/3 z-20 touch-none select-none"
        onPointerDown={() => { pressStartRef.current = Date.now(); pause(); }}
        onPointerUp={resume}
        onPointerLeave={resume}
        onPointerCancel={resume}
        onClick={() => { if (Date.now() - pressStartRef.current > 250) return; advance(); }}
        aria-label="Suivant"
      />

      {/* Story container */}
      <div className="relative w-full h-full sm:w-[420px] sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Top overlay: progress bars + close */}
        <div className="absolute top-0 left-0 right-0 p-3 z-30 pointer-events-none">
          <div className="flex gap-1 mb-2">
            {group.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-[width] duration-100 ease-linear"
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
            <div className="flex items-center gap-1">
              {story.media_type === 'video' && (
                <button onClick={() => setMuted((m) => !m)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>
              )}
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions : j'aime, réactions emoji, réponses (ou vues/réponses + suppression si propre story) */}
        <StoryActionBar story={story} group={group} currentUser={currentUser} isOwn={isOwn} onClose={onClose} onDeleted={onClose} />
      </div>
    </div>,
    document.body
  );
}