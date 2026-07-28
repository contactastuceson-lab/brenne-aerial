import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { notify } from '@/lib/notificationHelper';

// ─── Single video slide ──────────────────────────────────────────────────────
function VideoSlide({ post, videoUrl, isActive, muted, onToggleMute, currentUser, onLikeUpdate, onClose }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const controlTimer = useRef(null);

  // Like state
  const [liked, setLiked] = useState(currentUser ? (post.liked_by || []).includes(currentUser.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const likedByRef = useRef(post.liked_by || []);
  const likesCountRef = useRef(post.likes_count || 0);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [authorEmail, setAuthorEmail] = useState(null);
  const followRecordId = useRef(null);

  const isOwn = currentUser?.id === post.author_id;

  // Fetch author email + check follow status
  useEffect(() => {
    if (!currentUser || isOwn || !post.author_id) return;
    base44.entities.User.filter({ id: post.author_id })
      .then(users => {
        const email = users[0]?.email;
        if (!email) return;
        setAuthorEmail(email);
        return base44.entities.Follow.filter({ follower_email: currentUser.email, following_email: email });
      })
      .then(follows => {
        if (follows?.length > 0) {
          setIsFollowing(true);
          followRecordId.current = follows[0].id;
        }
      })
      .catch(() => {});
  }, [currentUser?.id, post.author_id]);

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

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    setShowControls(true);
    clearTimeout(controlTimer.current);
    controlTimer.current = setTimeout(() => setShowControls(false), 1800);
  };

  const handleLike = async () => {
    if (!currentUser) { toast.error('Connectez-vous pour aimer'); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = liked;
    const prevLikedBy = likedByRef.current;
    const prevCount = likesCountRef.current;

    const newLikedBy = wasLiked
      ? prevLikedBy.filter(id => id !== currentUser.id)
      : [...prevLikedBy, currentUser.id];
    const newCount = wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1;

    setLiked(!wasLiked);
    setLikesCount(newCount);
    likedByRef.current = newLikedBy;
    likesCountRef.current = newCount;

    try {
      await base44.functions.invoke('togglePostLike', { postId: post.id });
      if (!wasLiked && post.author_id && post.author_id !== currentUser.id) {
        const users = await base44.entities.User.filter({ id: post.author_id }).catch(() => []);
        if (users[0]?.email) {
          notify({ type: 'LIKE', sender: currentUser, receiverEmail: users[0].email, receiverId: post.author_id, postId: post.id, postExcerpt: post.content, link: `/post/${post.id}` });
        }
      }
      onLikeUpdate?.(post.id, !wasLiked);
    } catch {
      setLiked(wasLiked);
      setLikesCount(prevCount);
      likedByRef.current = prevLikedBy;
      likesCountRef.current = prevCount;
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) { toast.error('Connectez-vous pour vous abonner'); return; }
    if (followLoading || isOwn || !authorEmail) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        if (followRecordId.current) await base44.entities.Follow.delete(followRecordId.current);
        followRecordId.current = null;
        setIsFollowing(false);
        toast.success('Abonnement annulé');
      } else {
        const record = await base44.entities.Follow.create({
          follower_email: currentUser.email,
          follower_name: currentUser.full_name || currentUser.display_name,
          follower_avatar: currentUser.avatar_url,
          following_email: authorEmail,
          following_name: post.author_display_name || post.author_name || post.author_username,
        });
        followRecordId.current = record.id;
        setIsFollowing(true);
        toast.success('Abonnement effectué !');
        notify({ type: 'FOLLOW', sender: currentUser, receiverEmail: authorEmail, receiverId: post.author_id, link: `/@${currentUser.username || ''}` });
      }
    } catch {
      toast.error('Erreur lors de l\'abonnement');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Lien copié !'));
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
        onLoadedMetadata={() => {}}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        style={{ maxHeight: '100vh' }}
      />

      {/* Play/Pause flash */}
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
              {playing ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom info */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pt-16 pb-6"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      >
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
            {post.author_avatar
              ? <img src={post.author_avatar} alt={authorName} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">{(authorName[0] || 'U').toUpperCase()}</div>
            }
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-grotesk font-bold text-white text-sm">@{post.author_username || authorName}</span>
            {post.author_verifications?.length > 0 && (
              <VerificationIcons verifications={post.author_verifications} size="sm" user={{ id: post.author_id }} />
            )}
          </div>
          <span className="text-white/40 text-xs">· {timeAgo}</span>
        </div>

        {/* Caption */}
        {post.content && (
          <p className="text-white/90 text-sm leading-snug line-clamp-2 mb-3">{post.content}</p>
        )}

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        {/* Like */}
        <button onClick={handleLike} disabled={likeLoading} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${liked ? 'bg-red-500/30' : 'bg-white/10'}`}>
            <Heart className={`w-6 h-6 transition-all ${liked ? 'fill-red-400 text-red-400' : 'text-white'}`} />
          </div>
          <span className="text-xs text-white/80 font-mono">{likesCount > 0 ? likesCount : ''}</span>
        </button>

        {/* Comment */}
        <button onClick={() => { onClose?.(); navigate(`/post/${post.id}#reply`); }} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs text-white/80 font-mono">{post.replies_count > 0 ? post.replies_count : ''}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
        </button>

        {/* Follow — only if not own post */}
        {!isOwn && (
          <button onClick={handleFollow} disabled={followLoading} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isFollowing ? 'bg-primary/30 border border-primary/60' : 'bg-white/10'}`}>
              {followLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : isFollowing
                  ? <UserMinus className="w-5 h-5 text-primary" />
                  : <UserPlus className="w-5 h-5" />
              }
            </div>
            <span className="text-[10px] text-white/70">{isFollowing ? 'Abonné' : 'Suivre'}</span>
          </button>
        )}

        {/* Mute */}
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
export default function VideoPlayer({ initialPost, initialUrl, onClose, currentUser }) {
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

  // Load video queue
  useEffect(() => {
    const load = async () => {
      try {
        const posts = await base44.entities.Post.list('-created_date', 50);
        const videoPosts = posts
          .filter(p => p.media_urls?.some(u => u?.match(/\.(mp4|webm|ogg)$/i)))
          .filter(p => p.id !== initialPost.id);

        const items = videoPosts.map(p => ({
          post: p,
          url: p.media_urls.find(u => u?.match(/\.(mp4|webm|ogg)$/i)),
        })).filter(item => item.url);

        setQueue([{ post: initialPost, url: initialUrl }, ...items]);
      } catch {
        // keep initial only
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const goNext = useCallback(() => setIndex(i => Math.min(i + 1, queue.length - 1)), [queue.length]);
  const goPrev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, onClose]);

  // Touch swipe
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; isDragging.current = false; };
  const onTouchMove = () => { isDragging.current = true; };
  const onTouchEnd = (e) => {
    if (!isDragging.current || touchStartY.current == null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 60) goNext();
    else if (delta < -60) goPrev();
    touchStartY.current = null;
  };

  // Wheel
  const wheelCooldown = useRef(false);
  const onWheel = (e) => {
    if (wheelCooldown.current) return;
    wheelCooldown.current = true;
    setTimeout(() => { wheelCooldown.current = false; }, 700);
    if (e.deltaY > 0) goNext();
    else goPrev();
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
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {queue.length > 1 && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/50 text-white/70 text-xs font-mono">
          {index + 1} / {queue.length}
        </div>
      )}

      {/* Scroll dots */}
      {queue.length > 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5 pointer-events-none">
          {queue.slice(0, 10).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-200 ${i === index ? 'w-1.5 h-4 bg-white' : 'w-1 h-1 bg-white/30'}`} />
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
                currentUser={currentUser}
                onClose={onClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/30 text-sm animate-pulse">Chargement…</div>
        </div>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}