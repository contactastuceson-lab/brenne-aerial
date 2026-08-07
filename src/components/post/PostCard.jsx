import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Eye, Trash2, Pencil, X, Check, Repeat2, Upload, Bookmark, Pin, Star } from 'lucide-react';
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
import { awardCredits } from '@/lib/rewardActions';
import { extractHashtags } from '@/lib/hashtags';
import { parseEntityDate } from '@/lib/entityDate';
import { formatPostTime } from '@/lib/postTime';
import { handleIdentityClick } from '@/lib/identityClick';
import AffiliationModal from '@/components/ui/AffiliationModal';
import RepostDialog from '@/components/post/RepostDialog';
import RepostEmbed from '@/components/post/RepostEmbed';
import StoryAvatar from '@/components/stories/StoryAvatar';
import ReportButton from '@/components/shared/ReportButton';

const TRUNCATE_LIMIT = 560;

function PostCardSkeleton() {
  return (
    <article className="flex gap-3 border-b border-zinc-800/50 px-4 py-3" aria-busy="true" aria-label="Chargement de la publication">
      <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-zinc-800" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-3.5 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-3.5 w-full animate-pulse rounded bg-zinc-800" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-zinc-800" />
        <div className="h-7 w-44 animate-pulse rounded bg-zinc-800" />
      </div>
    </article>
  );
}

function PostCard({ post, currentUser, onReply, compact = false, onDeleted, onEdited, isThread = false }) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [pinned, setPinned] = useState(!!post.is_pinned);
  const [highlighted, setHighlighted] = useState(!!post.is_highlight);
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
  const identityUser = liveUser || { id: post.author_id, username: authorUsername, verifications: post.author_verifications || [] };
  const handleIdentity = (event) => handleIdentityClick({
    event,
    navigate,
    pathname: location.pathname,
    user: identityUser,
    onProfileClick: () => setIdentityModalOpen(true),
  });

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
      await base44.functions.invoke('togglePostLike', { postId: post.id });
      if (!wasLiked) awardCredits('like_post', { post_id: post.id });
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
    awardCredits('share_post', { post_id: post.id });
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

  useEffect(() => {
    if (!currentUser?.id) return;
    let active = true;
    base44.entities.Bookmark.filter({ user_id: currentUser.id, post_id: post.id })
      .then(b => { if (active) setBookmarked(b.length > 0); })
      .catch(() => {});
    return () => { active = false; };
  }, [currentUser?.id, post.id]);

  const handleBookmark = useCallback(async (e) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/login'); return; }
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    const was = bookmarked;
    setBookmarked(!was);
    try {
      if (was) {
        const existing = await base44.entities.Bookmark.filter({ user_id: currentUser.id, post_id: post.id });
        if (existing[0]) await base44.entities.Bookmark.delete(existing[0].id);
      } else {
        await base44.entities.Bookmark.create({
          user_id: currentUser.id,
          post_id: post.id,
          post_excerpt: (post.content || '').slice(0, 120),
          author_username: post.author_username,
        });
      }
    } catch {
      setBookmarked(was);
    } finally {
      setBookmarkLoading(false);
    }
  }, [bookmarked, bookmarkLoading, currentUser, post, navigate]);

  const handleTogglePin = useCallback(async (e) => {
    e?.stopPropagation();
    if (!isOwner) return;
    const next = !pinned;
    setPinned(next);
    try {
      if (next) {
        const own = await base44.entities.Post.filter({ author_id: currentUser.id, is_pinned: true });
        for (const p of own) { if (p.id !== post.id) await base44.entities.Post.update(p.id, { is_pinned: false }); }
      }
      await base44.entities.Post.update(post.id, { is_pinned: next });
      toast.success(next ? 'Épinglé sur votre profil' : 'Désépinglé');
      queryClient.invalidateQueries({ queryKey: ['home-feed-posts'] });
    } catch {
      setPinned(!next);
      toast.error('Erreur lors de l\'épinglage');
    }
  }, [isOwner, pinned, post, currentUser, queryClient]);

  const handleToggleHighlight = useCallback(async (e) => {
    e?.stopPropagation();
    if (!isOwner) return;
    const next = !highlighted;
    setHighlighted(next);
    try {
      await base44.entities.Post.update(post.id, { is_highlight: next });
      toast.success(next ? 'Mis à la une' : 'Retiré de la une');
      queryClient.invalidateQueries({ queryKey: ['home-feed-posts'] });
    } catch {
      setHighlighted(!next);
      toast.error('Erreur');
    }
  }, [isOwner, highlighted, post, queryClient]);

  const currentContent = editing ? editContent : (post.content || '');
  const isLong = currentContent.length > TRUNCATE_LIMIT;
  const displayContent = isLong && !expanded ? currentContent.slice(0, TRUNCATE_LIMIT) + '…' : currentContent;

  const openPost = () => navigate(`/post/${post.id}`);

  if (deleted) return null;
  if (liveUser === undefined) return <PostCardSkeleton />;

  return (
    <motion.article
      className={`flex gap-3 px-4 pt-3 pb-0 border-b border-zinc-800/50 hover:bg-white/[0.015] active:bg-white/[0.025] cursor-pointer group relative ${menuOpen || confirmDelete || repostOpen ? 'z-50' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ transition: 'background-color 0.1s ease', willChange: 'transform, opacity', zIndex: (menuOpen || confirmDelete || repostOpen) ? 50 : undefined }}
      onClick={openPost}
    >
      {/* Left column: avatar + thread line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
        <StoryAvatar authorId={post.author_id} src={avatarSrc} name={authorName} sizeClass="w-10 h-10" roundedClass="rounded-lg" onIdentityClick={handleIdentity} />
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
              <button type="button" onClick={handleIdentity}
                className="flex-shrink-0 font-inter font-bold text-[19px] text-foreground hover:underline mr-0.5">
                {authorName}
              </button>
              {post.author_id && (
                <span onClick={e => e.stopPropagation()} className="flex-shrink-0 mr-1.5 text-[15px] leading-none scale-[0.82] origin-left" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <VerificationIcons
                    verifications={liveUser?.verifications || post.author_verifications || []}
                    size="sm"
                    user={identityUser}
                  />
                </span>
              )}
              <span className="min-w-0 max-w-[11rem] sm:max-w-[16rem] font-inter text-[15px] text-muted-foreground/70 truncate">@{authorUsername || authorName}</span>
              <span className="text-muted-foreground/50 text-[15px] mx-1 flex-shrink-0">·</span>
              <span className="font-inter text-[15px] text-muted-foreground/70 whitespace-nowrap flex-shrink-0">{timeAgo}</span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="p-1.5 rounded-full text-muted-foreground/0 group-hover:text-muted-foreground/40 hover:!text-foreground hover:bg-white/8 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-50 w-44 bg-card border border-border rounded-xl shadow-2xl overflow-visible [&>button:first-child]:rounded-t-xl [&>button:last-child]:rounded-b-xl">
                {isOwner ? (
                  <>
                    {!post.reply_to_id && (
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(false); handleTogglePin(e); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-sm text-foreground hover:bg-white/6 transition-colors"
                      >
                        <Pin className="w-3.5 h-3.5 text-amber-400" /> {pinned ? 'Désépingler' : 'Épingler sur le profil'}
                      </button>
                    )}
                    {!post.reply_to_id && (
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(false); handleToggleHighlight(e); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-sm text-foreground hover:bg-white/6 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-cyan-400" /> {highlighted ? 'Retirer de la une' : 'Mettre à la une'}
                      </button>
                    )}
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
                  </>
                ) : (
                  <ReportButton
                    targetType="post"
                    targetId={post.id}
                    targetName={authorName}
                    targetEmail={liveUser?.email || ''}
                    targetContent={post.content || ''}
                    targetUrl={`/post/${post.id}`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reply context */}
        {post.reply_to_author_username && (
          <p className="text-[15px] text-muted-foreground/60 mb-1">
            En réponse à <span className="text-primary hover:underline cursor-pointer">@{post.reply_to_author_username}</span>
          </p>
        )}

        {/* Pinned label */}
        {pinned && (
          <div className="flex items-center gap-1 text-[12px] text-amber-400/80 mb-1">
            <Pin className="w-3 h-3" /> Épinglé
          </div>
        )}

        {/* Highlight label (boost boutique) */}
        {highlighted && (
          <div className="flex items-center gap-1 text-[12px] text-cyan-400 mb-1">
            <Star className="w-3 h-3 fill-cyan-400" /> À la une
          </div>
        )}

        {/* Repost / quote embed */}
        {post.repost_of_id && <RepostEmbed postId={post.repost_of_id} />}

        {/* Text content */}
        {editing ? (
          <div onClick={e => e.stopPropagation()} className="mb-2">
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-[16px] text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[80px] leading-[1.4]"
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
            <div className="text-[19px] leading-[1.4] text-foreground/90 mb-1">
              <DiscordMarkdown content={displayContent} allowMarkdown={false} />
            </div>
            {isLong && !expanded && (
              <button onClick={e => { e.stopPropagation(); setExpanded(true); }}
                className="text-[15px] text-primary hover:underline mb-1 block font-medium">
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
            count={(post.reposts_count || 0) + (post.quotes_count || 0)}
            color="green"
            onClick={(e) => { e.stopPropagation(); setRepostOpen(true); }}
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
          <ActionBtn
            icon={<Bookmark className={`w-[17px] h-[17px] ${bookmarked ? 'fill-current' : ''}`} />}
            active={bookmarked}
            color="amber"
            onClick={handleBookmark}
          />
        </div>
      </div>

      <RepostDialog open={repostOpen} onClose={() => setRepostOpen(false)} post={post} currentUser={currentUser} />
      <AffiliationModal user={identityUser} open={identityModalOpen} onOpenChange={setIdentityModalOpen} />

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
    </motion.article>
  );
}

export default memo(PostCard);

// Action button X-style
const ActionBtn = memo(function ActionBtn({ icon, count, onClick, active = false, color = 'blue' }) {
  const colorMap = {
    blue:  { text: 'text-primary',    bg: 'hover:bg-primary/10',    hover: 'group-hover/a:text-primary' },
    green: { text: 'text-emerald-400', bg: 'hover:bg-emerald-400/10', hover: 'group-hover/a:text-emerald-400' },
    rose:  { text: 'text-rose-500',   bg: 'hover:bg-rose-500/10',   hover: 'group-hover/a:text-rose-500' },
    amber: { text: 'text-amber-400', bg: 'hover:bg-amber-400/10',  hover: 'group-hover/a:text-amber-400' },
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