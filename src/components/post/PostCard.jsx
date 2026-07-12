import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Eye, Trash2, Pencil, X, Check, Repeat2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import DiscordMarkdown from '@/components/forum/DiscordMarkdown';
import usePublicUser from '@/hooks/usePublicUser';
import PollDisplay from '@/components/post/PollDisplay';
import LazyMedia from '@/components/post/LazyMedia';
import { notify } from '@/lib/notificationHelper';
import { isActionBlocked, RESTRICTED_TOAST } from '@/lib/accountStatus';
import { extractHashtags } from '@/lib/hashtags';
import { parseEntityDate } from '@/lib/entityDate';
import { formatPostTime } from '@/lib/postTime';

const TRUNCATE_LIMIT = 560;

// Avatar compact
function Avatar({ src, name, size = 10, profileLink }) {
  const initial = (name?.[0] || 'U').toUpperCase();
  const cls = `w-${size} h-${size} rounded-lg overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0`;
  const inner = src
    ? <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
    : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>;

  if (profileLink)
    return (
      <Link to={profileLink} onClick={e => e.stopPropagation()} className={`${cls} hover:opacity-80 transition-opacity`}>
        {inner}
      </Link>
    );
  return <div className={cls}>{inner}</div>;
}

function PostCard({ post, currentUser, onReply, compact = false, onDeleted, onEdited, isThread = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(currentUser ? (post.liked_by || []).includes(currentUser.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editLoading, setEditLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);
  // Refs pour éviter les race conditions — source de vérité locale
  const likedByRef = useRef(post.liked_by || []);
  const likesCountRef = useRef(post.likes_count || 0);

  const isOwner = currentUser && currentUser.id === post.author_id;
  const liveUser = usePublicUser(post.author_id);
  const authorName = liveUser?.display_name || liveUser?.full_name || post.author_display_name || post.author_name || post.author_username || 'Utilisateur';
  const authorUsername = post.author_username;
  const profileLink = authorUsername ? `/@${authorUsername}` : null;
  const avatarSrc = liveUser?.avatar_url || post.author_avatar;

  const timeAgo = post.created_date ? formatPostTime(parseEntityDate(post.created_date)) : '';

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/login'); return; }
    if (isActionBlocked(currentUser, 'like')) { toast.error(RESTRICTED_TOAST); return; }
    if (likeLoading) return;
    // Haptic feedback natif (iOS/Android)
    if (navigator.vibrate) navigator.vibrate(8);
    setLikeLoading(true);
    const wasLiked = liked;
    const prevLikedBy = likedByRef.current;
    const prevCount = likesCountRef.current;
    const newLikedBy = wasLiked ? prevLikedBy.filter(id => id !== currentUser.id) : [...prevLikedBy, currentUser.id];
    const newCount = wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
    setLiked(!wasLiked);
    setLikesCount(newCount);
    likedByRef.current = newLikedBy;
    likesCountRef.current = newCount;
    try {
      await base44.entities.Post.update(post.id, { liked_by: newLikedBy, likes_count: newCount });
      // Met à jour le cache TanStack Query pour éviter que le refetch écrase l'état local
      queryClient.setQueriesData({ queryKey: ['home-feed-posts'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(p => p.id === post.id ? { ...p, liked_by: newLikedBy, likes_count: newCount } : p);
      });
      if (!wasLiked && post.author_id && post.author_id !== currentUser.id) {
        const users = await base44.entities.User.filter({ id: post.author_id }).catch(() => []);
        if (users[0]?.email) notify({ type: 'LIKE', sender: currentUser, receiverEmail: users[0].email, receiverId: post.author_id, postId: post.id, postExcerpt: post.content, link: `/post/${post.id}` });
      }
    } catch {
      setLiked(wasLiked); setLikesCount(prevCount);
      likedByRef.current = prevLikedBy; likesCountRef.current = prevCount;
    } finally { setLikeLoading(false); }
  }, [liked, likeLoading, currentUser, post, navigate]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      navigator.share({ url }).catch(() => navigator.clipboard.writeText(url).then(() => toast.success('Lien copié !')));
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success('Lien copié !'));
    }
  }, [post.id]);

  const handleDeleteConfirm = useCallback(async () => {
    setConfirmDelete(false);
    try {
      await base44.entities.Post.delete(post.id);
      setDeleted(true);
      toast.success('Post supprimé');
      onDeleted?.(post.id);
    } catch { toast.error('Erreur lors de la suppression'); }
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
      post.content = editContent;
    } catch { toast.error('Erreur lors de la modification'); }
    finally { setEditLoading(false); }
  }, [post, editContent, onEdited]);

  const currentContent = editing ? editContent : (post.content || '');
  const isLong = currentContent.length > TRUNCATE_LIMIT;
  const displayContent = isLong && !expanded ? currentContent.slice(0, TRUNCATE_LIMIT) + '…' : currentContent;

  const openPost = () => navigate(`/post/${post.id}`);

  if (deleted) return null;

  return (
    <article
      className="flex gap-3 px-4 pt-3 pb-0 border-b border-zinc-800/50 hover:bg-white/[0.015] active:bg-white/[0.025] cursor-pointer group"
      style={{ transition: 'background-color 0.1s ease' }}
      onClick={openPost}
    >
      {/* Left column: avatar + thread line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
        <Avatar src={avatarSrc} name={authorName} size={10} profileLink={profileLink} />
        {/* Thread line — shown when part of a thread (isThread) */}
        {isThread && (
          <div className="flex-1 w-0.5 bg-zinc-700/50 my-1 rounded-full" style={{ minHeight: 16 }} />
        )}
      </div>

      {/* Right column: content */}
      <div className="flex-1 min-w-0 pb-3">

        {/* Header: style X — nom bold + badge inline · @username · temps */}
        <div className="flex items-start justify-between gap-1 mb-0.5 w-full">
          <div className="min-w-0 flex-1">
            {/* Ligne unique : nom + badge + @username · temps */}
            <div className="flex items-center gap-0 min-w-0 leading-snug">
              {profileLink ? (
                <Link to={profileLink} onClick={e => e.stopPropagation()}
                  className="flex-shrink-0 font-inter font-bold text-[15px] text-foreground hover:underline mr-0.5">
                  {authorName}
                </Link>
              ) : (
                <span className="flex-shrink-0 font-inter font-bold text-[15px] text-foreground mr-0.5">{authorName}</span>
              )}
              {post.author_id && (
                <span onClick={e => e.stopPropagation()} className="flex-shrink-0 mr-1.5 text-[15px] leading-none" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <VerificationIcons
                    verifications={liveUser?.verifications || post.author_verifications || []}
                    size="sm"
                    user={liveUser || { id: post.author_id }}
                  />
                </span>
              )}
              <span className="min-w-0 max-w-[11rem] sm:max-w-[16rem] font-inter text-[14px] text-muted-foreground/55 truncate">@{authorUsername || authorName}</span>
              <span className="text-muted-foreground/35 text-[13px] mx-1 flex-shrink-0">·</span>
              <span className="font-inter text-[14px] text-muted-foreground/55 whitespace-nowrap flex-shrink-0">{timeAgo}</span>
            </div>
          </div>

          {/* Menu */}
          {isOwner && (
            <div className="relative flex-shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
                className="p-1.5 rounded-full text-muted-foreground/0 group-hover:text-muted-foreground/40 hover:!text-foreground hover:bg-white/8 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-50 w-44 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setEditing(true); setEditContent(post.content || ''); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-3 text-sm text-foreground hover:bg-white/6 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary" /> Modifier
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(true); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
          <p className="text-[13px] text-muted-foreground/45 mb-1">
            En réponse à <span className="text-primary hover:underline cursor-pointer">@{post.reply_to_author_username}</span>
          </p>
        )}

        {/* Text content */}
        {editing ? (
          <div onClick={e => e.stopPropagation()} className="mb-2">
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-[15px] text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[80px] leading-relaxed"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={e => { e.stopPropagation(); setEditing(false); setEditContent(post.content || ''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:bg-white/6 transition-colors">
                <X className="w-3 h-3" /> Annuler
              </button>
              <button onClick={handleEdit} disabled={editLoading || !editContent.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                <Check className="w-3 h-3" /> {editLoading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-[15px] leading-[1.5] text-foreground/90 mb-1">
              <DiscordMarkdown content={displayContent} allowMarkdown={false} />
            </div>
            {isLong && !expanded && (
              <button onClick={e => { e.stopPropagation(); setExpanded(true); }}
                className="text-[14px] text-primary hover:underline mb-1 block font-medium">
                Voir plus
              </button>
            )}
          </>
        )}

        {/* Poll */}
        {post.poll && (
          <div onClick={e => e.stopPropagation()}>
            <PollDisplay post={post} currentUser={currentUser} />
          </div>
        )}

        {/* Media */}
        {post.media_urls?.length > 0 && (
          <div onClick={e => e.stopPropagation()} className="mt-2">
            <LazyMedia urls={post.media_urls} post={post} currentUser={currentUser} />
          </div>
        )}

        {/* Action bar — X style */}
        <div className="flex items-center justify-between mt-1 -mx-2" onClick={e => e.stopPropagation()}>
          <ActionBtn
            icon={<MessageCircle className="w-[17px] h-[17px]" />}
            count={post.replies_count}
            color="blue"
            onClick={(e) => {
            e.stopPropagation();
            if (isActionBlocked(currentUser, 'reply')) { toast.error(RESTRICTED_TOAST); return; }
            onReply ? onReply(post) : openPost();
            }}
          />
          <ActionBtn
            icon={<Repeat2 className="w-[17px] h-[17px]" />}
            color="green"
            onClick={(e) => { e.stopPropagation(); }}
          />
          <ActionBtn
            icon={<Heart className={`w-[17px] h-[17px] ${liked ? 'fill-current' : ''}`} />}
            count={likesCount}
            active={liked}
            color="rose"
            onClick={handleLike}
          />
          <div className="flex items-center gap-1 text-muted-foreground/30 px-2">
            <Eye className="w-[16px] h-[16px]" />
            {post.views_count > 0 && <span className="text-[13px] font-mono">{post.views_count}</span>}
          </div>
          <ActionBtn
            icon={<Upload className="w-[17px] h-[17px]" />}
            color="blue"
            onClick={handleShare}
          />
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={e => { e.stopPropagation(); setConfirmDelete(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}>
              <div className="h-1 w-full bg-gradient-to-r from-destructive via-red-400 to-destructive/60" />
              <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-grotesk font-bold text-[17px] mb-1">Supprimer ce post ?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Cette action est irréversible.</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-white/6 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleDeleteConfirm}
                    className="flex-1 py-2.5 rounded-full bg-destructive text-white text-sm font-bold hover:bg-destructive/85 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default memo(PostCard);

// Action button X-style
const ActionBtn = memo(function ActionBtn({ icon, count, onClick, active = false, color = 'blue' }) {
  const colorMap = {
    blue:  { text: 'text-primary',    bg: 'hover:bg-primary/10',    hover: 'group-hover/a:text-primary' },
    green: { text: 'text-emerald-400', bg: 'hover:bg-emerald-400/10', hover: 'group-hover/a:text-emerald-400' },
    rose:  { text: 'text-rose-500',   bg: 'hover:bg-rose-500/10',   hover: 'group-hover/a:text-rose-500' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <button
      onClick={onClick}
      className={`group/a flex items-center gap-1 active:scale-90 ${active ? c.text : 'text-muted-foreground/40'}`}
      style={{ transition: 'transform 0.1s ease' }}
    >
      <span className={`p-2 rounded-full transition-colors duration-150 ${c.bg} ${c.hover}`}>
        {icon}
      </span>
      {count > 0 && (
        <span className={`text-[13px] font-inter -ml-1 ${c.hover} ${active ? c.text : ''}`}>
          {count}
        </span>
      )}
    </button>
  );
});