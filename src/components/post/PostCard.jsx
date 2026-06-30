import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, Eye, Trash2, Pencil, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import ReactMarkdown from 'react-markdown';
import { extractHashtags, extractMentions } from '@/lib/hashtags';
import DiscordMarkdown from '@/components/forum/DiscordMarkdown';
import usePublicUser from '@/hooks/usePublicUser';

const TRUNCATE_LIMIT = 280;

export default function PostCard({ post, currentUser, onReply, compact = false, onDeleted, onEdited }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(currentUser ? (post.liked_by || []).includes(currentUser.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editLoading, setEditLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const menuRef = useRef(null);

  const isOwner = currentUser && currentUser.id === post.author_id;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!confirm('Supprimer ce post ?')) return;
    try {
      await base44.entities.Post.delete(post.id);
      setDeleted(true);
      toast.success('Post supprimé');
      onDeleted?.(post.id);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, [post.id, onDeleted]);

  const handleEdit = useCallback(async (e) => {
    e.stopPropagation();
    setEditLoading(true);
    try {
      const tags = extractHashtags(editContent);
      await base44.entities.Post.update(post.id, { content: editContent, hashtags: tags });
      toast.success('Post modifié');
      setEditing(false);
      onEdited?.(post.id, editContent);
      // Update local content display
      post.content = editContent;
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  }, [post, editContent, onEdited]);

  const currentContent = editing ? editContent : (post.content || '');
  const isLong = currentContent.length > TRUNCATE_LIMIT;
  const displayContent = isLong && !expanded ? currentContent.slice(0, TRUNCATE_LIMIT) + '…' : currentContent;

  const liveUser = usePublicUser(post.author_id);
  const authorName = liveUser?.display_name || liveUser?.full_name || post.author_display_name || post.author_name || post.author_username || 'Utilisateur';
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

  if (deleted) return null;

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
              {(liveUser?.avatar_url || post.author_avatar)
                ? <img src={liveUser?.avatar_url || post.author_avatar} alt={authorName} className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>
              }
            </div>
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center">
            {(liveUser?.avatar_url || post.author_avatar)
              ? <img src={liveUser?.avatar_url || post.author_avatar} alt={authorName} className="w-full h-full object-cover" />
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
          {post.author_id && (
            <span onClick={e => e.stopPropagation()}>
              <VerificationIcons
                verifications={liveUser?.verifications || post.author_verifications || []}
                size="sm"
                user={liveUser || { id: post.author_id }}
              />
            </span>
          )}
          {authorUsername && (
            <span className="font-mono text-xs text-muted-foreground/50 truncate">@{authorUsername}</span>
          )}
          <span className="text-muted-foreground/30 text-xs">·</span>
          <span className="text-xs text-muted-foreground/40 flex-shrink-0">{timeAgo}</span>

          {/* Owner menu */}
          {isOwner && (
            <div className="relative ml-auto" ref={menuRef} onClick={e => e.stopPropagation()}>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
                className="p-1 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-white/8 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-50 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setEditing(true); setEditContent(post.content || ''); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-white/6 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary" /> Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply context */}
        {post.reply_to_author_username && (
          <p className="text-xs text-muted-foreground/50 mb-1.5">
            En réponse à <span className="text-primary">@{post.reply_to_author_username}</span>
          </p>
        )}

        {/* Post text / edit */}
        {editing ? (
          <div onClick={e => e.stopPropagation()} className="mb-2">
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[80px]"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={e => { e.stopPropagation(); setEditing(false); setEditContent(post.content || ''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:bg-white/6 transition-colors"
              >
                <X className="w-3 h-3" /> Annuler
              </button>
              <button
                onClick={handleEdit}
                disabled={editLoading || !editContent.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Check className="w-3 h-3" /> {editLoading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-foreground/90 mb-1" onClick={e => e.stopPropagation()}>
              <DiscordMarkdown content={displayContent} />
            </div>
            {isLong && !expanded && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(true); }}
                className="text-sm text-primary hover:underline mb-2 block"
              >
                Voir plus
              </button>
            )}
          </>
        )}

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