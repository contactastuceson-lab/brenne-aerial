import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat2, Bookmark, Share2, Eye,
  Flag, UserPlus, Link as LinkIcon, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PostAuthorHeader from '@/components/shared/PostAuthorHeader';

export default function HomePostCard({ post, currentUser, index = 0 }) {
  const [liked, setLiked]       = useState(false);
  const [likes, setLikes]       = useState(Math.floor(Math.random() * 12));
  const [saved, setSaved]       = useState(false);
  const [reposted, setReposted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const profileLink = post.author_username ? `/@${post.author_username}` : null;
  const isLong = post.content?.length > 400;
  const displayContent = isLong && collapsed ? post.content.slice(0, 400) + '…' : post.content;

  const handleLike = () => {
    setLiked(v => !v);
    setLikes(v => liked ? Math.max(0, v - 1) : v + 1);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/forum/${post.id}`;
    if (navigator.share) navigator.share({ title: post.title, url });
    else { navigator.clipboard?.writeText(url); import('sonner').then(({ toast }) => toast.success('Lien copié !')); }
  };

  return (
    <article className="px-4 py-4 border-b border-border/40 hover:bg-white/[0.02] transition-colors duration-150 relative">

      {/* Header */}
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
        onMenuClick={() => setMenuOpen(v => !v)}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.12 }}
            className="absolute right-4 top-14 z-20 w-44 rounded-xl overflow-hidden py-1"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            {profileLink && (
              <Link to={profileLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> Voir le profil
              </Link>
            )}
            <button onClick={() => { handleShare(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left">
              <LinkIcon className="w-3.5 h-3.5" /> Copier le lien
            </button>
            <div className="my-1 mx-3 h-px bg-border/40" />
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-400/10 transition-colors text-left">
              <Flag className="w-3.5 h-3.5" /> Signaler
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      {post.title && (
        <Link to={`/forum/${post.id}`}>
          <h3 className="font-grotesk font-bold text-[15px] mb-1.5 mt-2 hover:text-primary transition-colors leading-snug">
            {post.title}
          </h3>
        </Link>
      )}

      {/* Content */}
      {displayContent && (
        <div className="text-sm text-foreground/80 leading-relaxed mt-1">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
              a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
              strong: ({ children }) => <strong className="font-semibold text-foreground/95">{children}</strong>,
              code: ({ children }) => <code className="px-1 py-0.5 rounded bg-white/6 font-mono text-xs text-primary/80">{children}</code>,
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
      )}

      {isLong && (
        <button onClick={() => setCollapsed(v => !v)} className="flex items-center gap-1 mt-1 text-xs text-primary/70 hover:text-primary transition-colors">
          {collapsed ? <><ChevronDown className="w-3.5 h-3.5" /> Voir la suite</> : <><ChevronUp className="w-3.5 h-3.5" /> Réduire</>}
        </button>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-primary/60 hover:text-primary cursor-pointer transition-colors font-mono">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 max-w-md -ml-2">
        {/* Comment */}
        <Link to={`/forum/${post.id}`}>
          <button className="flex items-center gap-1.5 p-2 rounded-full text-muted-foreground/60 hover:text-blue-400 hover:bg-blue-400/10 transition-all text-sm">
            <MessageCircle className="w-4 h-4" />
            {post.replies_count > 0 && <span className="text-xs tabular-nums">{post.replies_count}</span>}
          </button>
        </Link>

        {/* Repost */}
        <button onClick={() => setReposted(v => !v)}
          className={`flex items-center gap-1.5 p-2 rounded-full transition-all text-sm ${reposted ? 'text-emerald-400' : 'text-muted-foreground/60 hover:text-emerald-400 hover:bg-emerald-400/10'}`}
        >
          <Repeat2 className="w-4 h-4" />
        </button>

        {/* Like */}
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 p-2 rounded-full transition-all text-sm ${liked ? 'text-rose-400' : 'text-muted-foreground/60 hover:text-rose-400 hover:bg-rose-400/10'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-400' : ''}`} />
          {likes > 0 && <span className="text-xs tabular-nums">{likes}</span>}
        </button>

        {/* Views */}
        {post.views_count > 0 && (
          <div className="flex items-center gap-1.5 p-2 text-muted-foreground/40 text-sm">
            <Eye className="w-4 h-4" />
            <span className="text-xs tabular-nums">{post.views_count}</span>
          </div>
        )}

        {/* Bookmark + Share */}
        <div className="flex items-center gap-0">
          <button onClick={() => setSaved(v => !v)}
            className={`p-2 rounded-full transition-all ${saved ? 'text-primary' : 'text-muted-foreground/60 hover:text-primary hover:bg-primary/10'}`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary' : ''}`} />
          </button>
          <button onClick={handleShare} className="p-2 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}