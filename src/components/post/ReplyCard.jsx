import { useState, useRef, useCallback } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import PostAuthorHeader from '@/components/shared/PostAuthorHeader';
import LazyMedia from '@/components/post/LazyMedia';
import { isActionBlocked, RESTRICTED_TOAST } from '@/lib/accountStatus';
import { notify } from '@/lib/notificationHelper';
import { awardCredits } from '@/lib/rewardActions';

export default function ReplyCard({ post, currentUser }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(currentUser ? (post.liked_by || []).includes(currentUser.id) : false);
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const likedByRef = useRef(post.liked_by || []);
  const likesCountRef = useRef(post.likes_count || 0);

  const profileLink = post.author_username ? `/@${post.author_username}` : null;

  const handleLike = useCallback(async (e) => {
    e?.stopPropagation();
    if (!currentUser) { navigate('/login'); return; }
    if (isActionBlocked(currentUser, 'like')) { toast.error(RESTRICTED_TOAST); return; }
    if (likeLoading) return;
    if (navigator.vibrate) navigator.vibrate(8);
    setLikeLoading(true);
    const wasLiked = liked;
    const prevLikedBy = likedByRef.current;
    const prevCount = likesCountRef.current;
    const newLikedBy = wasLiked ? prevLikedBy.filter(id => id !== currentUser.id) : [...prevLikedBy, currentUser.id];
    const newCount = wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
    setLiked(!wasLiked);
    setLikes(newCount);
    likedByRef.current = newLikedBy;
    likesCountRef.current = newCount;
    try {
      await base44.functions.invoke('togglePostLike', { postId: post.id });
      if (!wasLiked) awardCredits('like_post', { post_id: post.id });
      if (!wasLiked && post.author_id && post.author_id !== currentUser.id) {
        const users = await base44.entities.User.filter({ id: post.author_id }).catch(() => []);
        if (users[0]?.email) notify({ type: 'LIKE', sender: currentUser, receiverEmail: users[0].email, receiverId: post.author_id, postId: post.id, postExcerpt: post.content, link: `/post/${post.id}` });
      }
    } catch {
      setLiked(wasLiked); setLikes(prevCount);
      likedByRef.current = prevLikedBy; likesCountRef.current = prevCount;
    } finally { setLikeLoading(false); }
  }, [liked, likeLoading, currentUser, post, navigate]);

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-border/30 hover:bg-white/[0.015] transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          {post.author_avatar
            ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.3) 0%, hsl(var(--accent)/0.2) 100%)' }}>
                <span className="font-grotesk font-bold text-primary text-sm">
                  {((post.author_display_name || post.author_name || 'U')[0] || 'U').toUpperCase()}
                </span>
              </div>
          }
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <PostAuthorHeader
          authorId={post.author_id}
          authorName={post.author_name}
          authorDisplayName={post.author_display_name}
          authorUsername={post.author_username}
          authorAvatar={post.author_avatar}
          authorVerifications={post.author_verifications}
          createdDate={post.created_date}
          hideAvatar
        />

        {/* Reply context */}
        {post.reply_to_author_username && (
          <p className="text-[13px] text-muted-foreground/50 mb-0.5">
            En réponse à <span className="text-primary hover:underline cursor-pointer">@{post.reply_to_author_username}</span>
          </p>
        )}

        {/* Text */}
        {post.content && (
          <div className="text-[15px] text-foreground/90 leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
            {post.content}
          </div>
        )}

        {/* Media */}
        {post.media_urls?.length > 0 && (
          <div className="mt-2">
            <LazyMedia urls={post.media_urls} post={post} currentUser={currentUser} />
          </div>
        )}

        {/* Simplified footer: like button (right only) */}
        <div className="flex items-center justify-end mt-2.5 -mx-1">
          <button onClick={handleLike} disabled={likeLoading}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all text-sm ${liked ? 'text-rose-500' : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/10'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
            {likes > 0 && <span className="text-xs tabular-nums">{likes}</span>}
          </button>
        </div>
      </div>
    </article>
  );
}