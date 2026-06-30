import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import ReactMarkdown from 'react-markdown';
import { extractHashtags, extractMentions } from '@/lib/hashtags';
import { useNavigate as useNav } from 'react-router-dom';

function renderContent(content, navigate) {
  if (!content) return null;
  // Replace hashtags and mentions with links
  const parts = content.split(/(\s|^)(#\w+|@\w+)/g);
  const tokens = content.split(/(\s)(#[\wÀ-ÿ]+|@[\w.-]+)|^(#[\wÀ-ÿ]+|@[\w.-]+)/);

  // Simple render: highlight #tag and @mention inline
  const elements = [];
  let remaining = content;
  const regex = /(#[\wÀ-ÿ]+|@[\w.-]+)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith('#')) {
      elements.push(
        <span
          key={match.index}
          className="text-primary cursor-pointer hover:underline"
          onClick={(e) => { e.stopPropagation(); navigate(`/?tag=${token.slice(1).toLowerCase()}`); }}
        >
          {token}
        </span>
      );
    } else {
      const username = token.slice(1);
      elements.push(
        <Link
          key={match.index}
          to={`/@${username}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {token}
        </Link>
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < content.length) {
    elements.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>);
  }
  return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{elements}</p>;
}

export default function PostCard({ post, currentUser, onReply, compact = false }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(currentUser ? (post.liked_by || []).includes(currentUser.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const authorName = post.author_display_name || post.author_name || post.author_username || 'Utilisateur';
  const authorUsername = post.author_username;
  const profileLink = authorUsername ? `/@${authorUsername}` : null;
  const initial = (authorName[0] || 'U').toUpperCase();
  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: fr })
    : '';

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/login'); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(c => wasLiked ? c - 1 : c + 1);
    try {
      const likedBy = post.liked_by || [];
      if (wasLiked) {
        await base44.entities.Post.update(post.id, {
          liked_by: likedBy.filter(id => id !== currentUser.id),
          likes_count: Math.max(0, (post.likes_count || 0) - 1),
        });
      } else {
        await base44.entities.Post.update(post.id, {
          liked_by: [...likedBy, currentUser.id],
          likes_count: (post.likes_count || 0) + 1,
        });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount(c => wasLiked ? c + 1 : c - 1);
    } finally {
      setLikeLoading(false);
    }
  }, [liked, likeLoading, currentUser, post, navigate]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Lien copié !'));
  }, [post.id]);

  const openPost = () => navigate(`/post/${post.id}`);

  return (
    <article
      className="flex gap-3 px-4 py-4 border-b border-zinc-800/60 hover:bg-white/[0.02] transition-colors cursor-pointer group"
      onClick={openPost}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {profileLink ? (
          <Link to={profileLink} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center hover:opacity-80 transition-opacity">
              {post.author_avatar
                ? <img src={post.author_avatar} alt={authorName} className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>
              }
            </div>
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center">
            {post.author_avatar
              ? <img src={post.author_avatar} alt={authorName} className="w-full h-full object-cover" />
              : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>
            }
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {profileLink ? (
            <Link to={profileLink} onClick={e => e.stopPropagation()}
              className="font-grotesk font-bold text-sm text-foreground hover:underline truncate">
              {authorName}
            </Link>
          ) : (
            <span className="font-grotesk font-bold text-sm text-foreground truncate">{authorName}</span>
          )}
          {post.author_verifications?.length > 0 && (
            <span onClick={e => e.stopPropagation()}>
              <VerificationIcons verifications={post.author_verifications} size="sm" user={{ id: post.author_id, verifications: post.author_verifications }} />
            </span>
          )}
          {authorUsername && (
            <span className="font-mono text-xs text-muted-foreground/50 truncate">@{authorUsername}</span>
          )}
          <span className="text-muted-foreground/30 text-xs">·</span>
          <span className="text-xs text-muted-foreground/40 flex-shrink-0">{timeAgo}</span>
        </div>

        {/* Reply context */}
        {post.reply_to_author_username && (
          <p className="text-xs text-muted-foreground/50 mb-1.5">
            En réponse à <span className="text-primary">@{post.reply_to_author_username}</span>
          </p>
        )}

        {/* Post text */}
        <div className="text-foreground/90 mb-2">
          {renderContent(post.content, navigate)}
        </div>

        {/* Media */}
        {post.media_urls?.length > 0 && (
          <div className={`grid gap-1 mb-3 rounded-2xl overflow-hidden ${post.media_urls.length === 1 ? 'grid-cols-1' : post.media_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {post.media_urls.slice(0, 4).map((url, i) => (
              <div key={i} className={`relative overflow-hidden ${post.media_urls.length === 1 ? 'max-h-80' : 'max-h-48'}`}
                onClick={e => e.stopPropagation()}>
                {url.match(/\.(mp4|webm|ogg)$/i)
                  ? <video src={url} controls className="w-full h-full object-cover rounded-lg" />
                  : <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                }
                {i === 3 && post.media_urls.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <span className="text-white font-bold text-lg">+{post.media_urls.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-5 mt-2" onClick={e => e.stopPropagation()}>
          {/* Reply */}
          <button
            onClick={(e) => { e.stopPropagation(); onReply ? onReply(post) : openPost(); }}
            className="flex items-center gap-1.5 text-muted-foreground/40 hover:text-primary transition-colors group/btn"
          >
            <div className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </div>
            {post.replies_count > 0 && <span className="text-xs font-mono">{post.replies_count}</span>}
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors group/btn ${liked ? 'text-red-500' : 'text-muted-foreground/40 hover:text-red-500'}`}
          >
            <div className="p-1.5 rounded-full group-hover/btn:bg-red-500/10 transition-colors">
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </div>
            {likesCount > 0 && <span className="text-xs font-mono">{likesCount}</span>}
          </button>

          {/* Views */}
          {post.views_count > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs font-mono">{post.views_count}</span>
            </div>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-muted-foreground/40 hover:text-primary transition-colors group/btn ml-auto"
          >
            <div className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors">
              <Share2 className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </article>
  );
}