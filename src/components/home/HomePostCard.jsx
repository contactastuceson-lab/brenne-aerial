import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal,
  Share2, Eye, Flag, UserPlus, Link as LinkIcon,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PostAuthorHeader from '@/components/shared/PostAuthorHeader';

const CATEGORY_GRADIENT = {
  general:   'from-blue-500/20 to-blue-400/5',
  technique: 'from-purple-500/20 to-purple-400/5',
  aide:      'from-amber-500/20 to-amber-400/5',
  partages:  'from-emerald-500/20 to-emerald-400/5',
  autres:    'from-zinc-500/20 to-zinc-400/5',
};

function LikeButton({ liked, count, onLike }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onLike}
      className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200 text-sm font-inter font-medium ${
        liked
          ? 'bg-rose-400/15 text-rose-400 border border-rose-400/25'
          : 'text-muted-foreground/70 hover:text-rose-400 hover:bg-rose-400/10 border border-transparent hover:border-rose-400/15'
      }`}
    >
      <Heart className={`w-4 h-4 transition-all duration-200 ${liked ? 'fill-rose-400 scale-110' : 'group-hover:scale-110'}`} />
      <span className="tabular-nums">{count > 0 ? count : ''}</span>
    </motion.button>
  );
}

export default function HomePostCard({ post, currentUser, index = 0 }) {
  const [liked, setLiked]         = useState(false);
  const [likes, setLikes]         = useState(Math.floor(Math.random() * 12));
  const [saved, setSaved]         = useState(false);
  const [reposted, setReposted]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const gradient = CATEGORY_GRADIENT[post.category] || CATEGORY_GRADIENT.general;
  const profileLink = post.author_username ? `/@${post.author_username}` : null;

  const isLong = post.content?.length > 400;
  const displayContent = isLong && collapsed ? post.content.slice(0, 400) + '…' : post.content;

  const handleLike = () => {
    setLiked(v => !v);
    setLikes(v => liked ? Math.max(0, v - 1) : v + 1);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/forum/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard?.writeText(url);
      import('sonner').then(({ toast }) => toast.success('Lien copié !'));
    }
  };

  const handleRepost = () => {
    setReposted(v => !v);
    if (!reposted) import('sonner').then(({ toast }) => toast.success('Repartagé !'));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative rounded-3xl overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.025) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Category accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient.replace('/20', '/60').replace('/5', '/0')}`} />

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)' }}
      />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-0">
        <PostAuthorHeader
          authorId={post.author_id}
          authorName={post.author_name}
          authorDisplayName={post.author_display_name}
          authorUsername={post.author_username}
          authorAvatar={post.author_avatar}
          authorVerifications={post.author_verifications}
          authorIsSupreme={post.author_is_supreme}
          createdDate={post.created_date}
          category={post.category}
          visibility="public"
          onMenuClick={() => setMenuOpen(v => !v)}
        />
        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-5 top-12 z-20 w-44 rounded-2xl overflow-hidden py-1.5"
              style={{
                background: 'rgba(10, 16, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {profileLink && (
                <Link to={profileLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> Voir le profil
                </Link>
              )}
              <button onClick={() => { handleShare(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors text-left">
                <LinkIcon className="w-3.5 h-3.5" /> Copier le lien
              </button>
              <div className="my-1 mx-3 h-px bg-white/8" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-inter text-rose-400 hover:bg-rose-400/10 transition-colors text-left">
                <Flag className="w-3.5 h-3.5" /> Signaler
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-3">
        {/* Title */}
        {post.title && (
          <Link to={`/forum/${post.id}`}>
            <h3 className="font-grotesk font-bold text-base md:text-lg mb-2.5 hover:text-primary transition-colors leading-snug cursor-pointer">
              {post.title}
            </h3>
          </Link>
        )}

        {/* Body */}
        {displayContent && (
          <div className="font-inter text-sm text-foreground/80 leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                strong: ({ children }) => <strong className="font-semibold text-foreground/95">{children}</strong>,
                code: ({ children }) => <code className="px-1.5 py-0.5 rounded-md bg-white/8 font-mono text-xs text-primary/80">{children}</code>,
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        )}

        {isLong && (
          <button
            onClick={() => setCollapsed(v => !v)}
            className="flex items-center gap-1.5 mt-2 text-xs font-inter text-primary/80 hover:text-primary transition-colors"
          >
            {collapsed ? <><ChevronDown className="w-3.5 h-3.5" /> Voir la suite</> : <><ChevronUp className="w-3.5 h-3.5" /> Réduire</>}
          </button>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3.5">
            {post.tags.map(tag => (
              <span key={tag} className="font-mono text-xs text-primary/60 hover:text-primary cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      {(post.replies_count > 0 || post.views_count > 0) && (
        <div className="mx-5 py-3 border-t border-white/6 flex items-center gap-4">
          {post.replies_count > 0 && (
            <Link to={`/forum/${post.id}`} className="font-mono text-[11px] text-muted-foreground/50 hover:text-primary transition-colors">
              {post.replies_count} commentaire{post.replies_count > 1 ? 's' : ''}
            </Link>
          )}
          {post.views_count > 0 && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/40">
              <Eye className="w-3 h-3" /> {post.views_count}
            </span>
          )}
          {likes > 0 && (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/40">
              <Heart className="w-3 h-3" /> {likes}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <LikeButton liked={liked} count={likes} onLike={handleLike} />

          <Link to={`/forum/${post.id}`}>
            <motion.button whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-inter font-medium text-muted-foreground/70 hover:text-blue-400 hover:bg-blue-400/10 border border-transparent hover:border-blue-400/15 transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.replies_count || ''}</span>
            </motion.button>
          </Link>

          <motion.button whileTap={{ scale: 0.9 }}
            onClick={handleRepost}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-inter font-medium transition-all duration-200 ${
              reposted
                ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25'
                : 'text-muted-foreground/70 hover:text-emerald-400 hover:bg-emerald-400/10 border border-transparent hover:border-emerald-400/15'
            }`}
          >
            <Repeat2 className={`w-4 h-4 ${reposted ? 'text-emerald-400' : ''}`} />
          </motion.button>
        </div>

        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-muted-foreground/50 hover:text-foreground hover:bg-white/8 transition-all border border-transparent hover:border-white/10"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(v => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all duration-200 border ${
              saved
                ? 'bg-primary/15 text-primary border-primary/25'
                : 'text-muted-foreground/50 hover:text-primary hover:bg-primary/10 border-transparent hover:border-primary/15'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}