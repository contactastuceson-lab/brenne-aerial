import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Single video slide ──────────────────────────────────────────────────────
function VideoSlide({ post, videoUrl, isActive, muted, onToggleMute, onLike, onShare, onComment }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const controlTimer = useRef(null);

  // Play/pause selon isActive
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [isActive]);

  // Sync mute
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    // Show controls briefly
    setShowControls(true);
    clearTimeout(controlTimer.current);
    controlTimer.current = setTimeout(() => setShowControls(false), 1800);
  };

  const authorName = post.author_display_name || post.author_name || post.author_username || 'Utilisateur';
  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: fr })
    : '';

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        playsInline
        muted={muted}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        style={{ maxHeight: '100vh' }}
      />

      {/* Play/Pause overlay flash */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
              {playing
                ? <Pause className="w-8 h-8 text-white fill-white" />
                : <Play className="w-8 h-8 text-white fill-white" />
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient + info */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pt-16 pb-6"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      >
        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
            {post.author_avatar
              ? <img src={post.author_avatar} alt={authorName} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">{(authorName[0] || 'U').toUpperCase()}</div>
            }
          </div>
          <span className="font-grotesk font-bold text-white text-sm">@{post.author_username || authorName}</span>
          <span className="text-white/40 text-xs">· {timeAgo}</span>
        </div>

        {/* Caption */}
        {post.content && (
          <p className="text-white/90 text-sm leading-snug line-clamp-2 mb-3">{post.content}</p>
        )}

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
        <button onClick={onLike} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <span className="text-xs text-white/80 font-mono">{post.likes_count || 0}</span>
        </button>
        <button onClick={onComment} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs text-white/80 font-mono">{post.replies_count || 0}</span>
        </button>
        <button onClick={onShare} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
        </button>
        <button onClick={onToggleMute} className="text-white active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Main immersive player ────────────────────────────────────────────────────
export default function VideoPlayer({ initialPost, initialUrl, onClose }) {
  const [queue, setQueue] = useState([{ post: initialPost, url: initialUrl }]);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Load video queue from posts with media
  useEffect(() => {
    const load = async () => {
      try {
        const posts = await base44.entities.Post.list('-created_date', 50);
        const videoPosts = posts
          .filter(p => p.media_urls?.some(u => u.match(/\.(mp4|webm|ogg)$/i)))
          .filter(p => p.id !== initialPost.id);

        const items = videoPosts.map(p => ({
          post: p,
          url: p.media_urls.find(u => u.match(/\.(mp4|webm|ogg)$/i)),
        }));

        setQueue([{ post: initialPost, url: initialUrl }, ...items]);
      } catch {
        // keep initial only
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, queue]);

  const goNext = useCallback(() => setIndex(i => Math.min(i + 1, queue.length - 1)), [queue]);
  const goPrev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);

  // Touch swipe
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; isDragging.current = false; };
  const onTouchMove = (e) => { isDragging.current = true; };
  const onTouchEnd = (e) => {
    if (!isDragging.current || touchStartY.current == null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 60) goNext();
    else if (delta < -60) goPrev();
    touchStartY.current = null;
  };

  // Wheel scroll
  const wheelCooldown = useRef(false);
  const onWheel = (e) => {
    if (wheelCooldown.current) return;
    wheelCooldown.current = true;
    setTimeout(() => { wheelCooldown.current = false; }, 700);
    if (e.deltaY > 0) goNext();
    else goPrev();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${queue[index]?.post?.id}`;
    navigator.clipboard.writeText(url).then(() => import('sonner').then(({ toast }) => toast.success('Lien copié !')));
  };

  const modal = (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Index indicator */}
      {queue.length > 1 && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/50 text-white/70 text-xs font-mono">
          {index + 1} / {queue.length}
        </div>
      )}

      {/* Scroll dots */}
      {queue.length > 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5">
          {queue.slice(0, 10).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${i === index ? 'w-1.5 h-4 bg-white' : 'w-1 h-1 bg-white/30'}`}
            />
          ))}
        </div>
      )}

      {/* Slides */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {queue[index] && (
            <motion.div
              key={index}
              initial={{ y: index > 0 ? '100%' : 0, opacity: index > 0 ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="absolute inset-0"
            >
              <VideoSlide
                post={queue[index].post}
                videoUrl={queue[index].url}
                isActive={true}
                muted={muted}
                onToggleMute={() => setMuted(m => !m)}
                onLike={() => {}}
                onShare={handleShare}
                onComment={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe hint (first load) */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/30 text-sm animate-pulse">Chargement…</div>
        </div>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}