import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Eye, Trash2, Pencil, X, Check, Repeat2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import DiscordMarkdown from '@/components/forum/DiscordMarkdown';
import usePublicUser from '@/hooks/usePublicUser';
import PollDisplay from '@/components/post/PollDisplay';
import LazyMedia from '@/components/post/LazyMedia';
import { notify } from '@/lib/notificationHelper';
import { extractHashtags } from '@/lib/hashtags';

const TRUNCATE_LIMIT = 560;

// Avatar compact
function Avatar({ src, name, size = 10, profileLink }) {
  const initial = (name?.[0] || 'U').toUpperCase();
  const cls = `w-${size} h-${size} rounded-full overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0`;
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

export default function PostCard({ post, currentUser, onReply, compact = false, onDeleted, onEdited, isThread = false }) {
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);
  const likedByRef = useRef(post.liked_by || []);
  const likesCountRef = useRef(post.likes_count || 0);

  const isOwner = currentUser && currentUser.id === post.author_id;
  const liveUser = usePublicUser(post.author_id);
  const authorName = liveUser?.display_name || liveUser?.full_name || post.author_display_name || post.author_name || post.author_username || 'Utilisateur';
  const authorUsername = post.author_username;
  const profileLink = authorUsername ? `/@${authorUsername}` : null;
  const avatarSrc = liveUser?.avatar_url || post.author_avatar;

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: false, locale: fr })
    : '';

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!currentUser) { navigate('/login'); return; }
    if (likeLoading) return;
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
      className="flex gap-3 px-4 pt-3 pb-0 border-b border-zinc-800/50 hover:bg-white/[0.015] transition-colors cursor-pointer group"
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

        {/* Header: name · @username · time · menu */}
        <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
          {profileLink ? (
            <Link to={profileLink} onClick={e => e.stopPropagation()}
              className="font-grotesk font-bold text-[15px] text-foreground hover:underline truncate leading-tight">
              {authorName}
            </Link>
          ) : (
            <span className="font-grotesk font-bold text-[15px] text-foreground truncate leading-tight">{authorName}</span>
          )}

          {post.author_id && (
            <span onClick={e => e.stopPropagation()} className="flex-shrink-0">
              <VerificationIcons
                verifications={liveUser?.verifications || post.author_verifications || []}
                size="sm"
                user={liveUser || { id: post.author_id }}
              />
            </span>
          )}

          <span className="font-inter text-[14px] text-muted-foreground/50 truncate flex-shrink-0">
            @{authorUsername || authorName}
          </span>
          <span className="text-muted-foreground/30 text-sm flex-shrink-0">·</span>
          <span className="text-[14px] text-muted-foreground/45 flex-shrink-0 whitespace-nowrap">{timeAgo}</span>

          {/* Menu */}
          {isOwner && (
            <div className="relative ml-auto flex-shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
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
        <div className="flex items-center mt-2 -ml-1.5" style={{ gap: 0 }} onClick={e => e.stopPropagation()}>

          {/* Reply */}
          <ActionBtn
            icon={<MessageCircle className="w-[18px] h-[18px]" />}
            count={post.replies_count}
            hoverColor="text-primary"
            hoverBg="bg-primary/10"
            onClick={(e) => { e.stopPropagation(); onReply ? onReply(post) : openPost(); }}
          />

          {/* Repost placeholder */}
          <ActionBtn
            icon={<Repeat2 className="w-[18px] h-[18px]" />}
            count={null}
            hoverColor="text-emerald-400"
            hoverBg="bg-emerald-400/10"
            onClick={(e) => { e.stopPropagation(); toast('Bientôt disponible'); }}
          />

          {/* Like */}
          <ActionBtn
            icon={<Heart className={`w-[18px] h-[18px] ${liked ? 'fill-current' : ''}`} />}
            count={likesCount}
            active={liked}
            activeColor="text-rose-500"
            hoverColor="text-rose-500"
            hoverBg="bg-rose-500/10"
            onClick={handleLike}
          />

          {/* Views */}
          {post.views_count > 0 && (
            <div className="flex items-center gap-1 px-2 py-2 text-muted-foreground/30">
              <Eye className="w-[17px] h-[17px]" />
              <span className="text-[13px] font-mono">{post.views_count}</span>
            </div>
          )}

          {/* Share */}
          <div className="ml-auto">
            <ActionBtn
              icon={<Upload className="w-[18px] h-[18px]" />}
              hoverColor="text-primary"
              hoverBg="bg-primary/10"
              onClick={handleShare}
            />
          </div>
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

// Action button X-style: icon + count, hover ring
function ActionBtn({ icon, count, onClick, active = false, activeColor = '', hoverColor, hoverBg }) {
  return (
    <button
      onClick={onClick}
      className={`group/a flex items-center gap-1 px-2 py-2 rounded-full transition-all ${active ? activeColor : 'text-muted-foreground/40'}`}
    >
      <span className={`p-1.5 rounded-full transition-colors group-hover/a:${hoverBg} group-hover/a:${hoverColor}`}>
        <span className={`block group-hover/a:${hoverColor} transition-colors`}>{icon}</span>
      </span>
      {count > 0 && (
        <span className={`text-[13px] font-inter transition-colors group-hover/a:${hoverColor} ${active ? activeColor : ''}`}>
          {count}
        </span>
      )}
    </button>
  );
}