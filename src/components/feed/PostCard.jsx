import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal,
  Share2, Eye, Globe, Languages, Flag, UserPlus, Link as LinkIcon,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import VerificationIcons from '@/components/ui/VerificationIcon';

const CATEGORY_CONFIG = {
  general:   { bg: 'bg-blue-400/10',    text: 'text-blue-400',    label: '💬 Général' },
  technique: { bg: 'bg-purple-400/10',  text: 'text-purple-400',  label: '🔧 Technique' },
  aide:      { bg: 'bg-amber-400/10',   text: 'text-amber-400',   label: '🙏 Aide' },
  partages:  { bg: 'bg-emerald-400/10', text: 'text-emerald-400', label: '📸 Partages' },
  autres:    { bg: 'bg-zinc-400/10',    text: 'text-zinc-400',    label: '🗂 Autres' },
};

function ActionButton({ icon: Icon, label, count, active, activeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-inter transition-all group ${
        active
          ? `${activeColor} bg-current/10`
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-active:scale-90 ${active ? 'fill-current' : ''}`} />
      {count > 0 && <span className="tabular-nums">{count}</span>}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

export default function PostCard({ post, currentUser, index = 0 }) {
  const [liked, setLiked]   = useState(false);
  const [likes, setLikes]   = useState(0);
  const [saved, setSaved]   = useState(false);
  const [reposted, setReposted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const cat = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.general;
  const authorName = post.author_display_name || post.author_name || 'Utilisateur';
  const authorUsername = post.author_username;
  const authorAvatar = post.author_avatar;
  const avatarInitial = (authorName?.[0] || 'U').toUpperCase();
  const profileLink = authorUsername ? `/@${authorUsername}` : null;

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: fr })
    : '';

  const isLong = post.content?.length > 300;
  const displayContent = isLong && collapsed
    ? post.content.slice(0, 300) + '…'
    : post.content;

  const handleLike = () => {
    setLiked(v => !v);
    setLikes(v => liked ? Math.max(0, v - 1) : v + 1);
  };

  const handleRepost = () => {
    setReposted(v => !v);
    if (!reposted) {
      import('sonner').then(({ toast }) => toast.success('Publication repartagée !'));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: `${window.location.origin}/forum/${post.id}` });
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/forum/${post.id}`);
      import('sonner').then(({ toast }) => toast.success('Lien copié !'));
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md hover:border-border transition-all duration-300 overflow-hidden"
      style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.12)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center overflow-hidden">
              {authorAvatar
                ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-primary">{avatarInitial}</span>
              }
            </div>
            {post.author_is_supreme && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 border border-card flex items-center justify-center text-[9px]">👑</div>
            )}
          </div>

          {/* Meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {profileLink ? (
                <Link to={profileLink} className="font-inter font-semibold text-sm text-foreground hover:text-primary transition-colors">
                  {authorName}
                </Link>
              ) : (
                <span className="font-inter font-semibold text-sm text-foreground">{authorName}</span>
              )}
              {post.author_verifications?.length > 0 && (
                <VerificationIcons verifications={post.author_verifications} size="sm" />
              )}
              {authorUsername && (
                <span className="font-mono text-xs text-muted-foreground hidden sm:inline">@{authorUsername}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[11px] text-muted-foreground">{timeAgo}</span>
              <span className="text-muted-foreground/40">·</span>
              <Globe className="w-3 h-3 text-muted-foreground/50" />
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                {cat.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-card shadow-xl py-1 overflow-hidden">
              {profileLink && (
                <Link to={profileLink} className="flex items-center gap-2 px-4 py-2.5 text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> Voir le profil
                </Link>
              )}
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors w-full text-left">
                <Languages className="w-3.5 h-3.5" /> Traduire
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors w-full text-left">
                <LinkIcon className="w-3.5 h-3.5" /> Copier le lien
              </button>
              <div className="h-px bg-border/50 my-1" />
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-inter text-rose-400 hover:bg-rose-400/10 transition-colors w-full text-left">
                <Flag className="w-3.5 h-3.5" /> Signaler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {post.title && post.title !== post.content?.slice(0, post.title.length) && (
          <Link to={`/forum/${post.id}`}>
            <h3 className="font-grotesk font-bold text-base mb-2 hover:text-primary transition-colors leading-snug cursor-pointer">
              {post.title}
            </h3>
          </Link>
        )}

        {displayContent && (
          <div className="font-inter text-sm text-foreground/85 leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        )}

        {isLong && (
          <button
            onClick={() => setCollapsed(v => !v)}
            className="flex items-center gap-1 mt-2 text-xs font-inter text-primary hover:text-primary/80 transition-colors"
          >
            {collapsed ? <><ChevronDown className="w-3.5 h-3.5" /> Voir plus</> : <><ChevronUp className="w-3.5 h-3.5" /> Réduire</>}
          </button>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-[11px] font-mono text-primary/70 hover:text-primary cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      {(post.replies_count > 0 || post.views_count > 0) && (
        <div className="px-5 py-2 border-t border-border/30 flex items-center gap-4">
          {post.replies_count > 0 && (
            <Link to={`/forum/${post.id}`} className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors">
              {post.replies_count} commentaire{post.replies_count > 1 ? 's' : ''}
            </Link>
          )}
          {post.views_count > 0 && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <Eye className="w-3 h-3" /> {post.views_count} vues
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between gap-1">
        <div className="flex items-center gap-0.5">
          <ActionButton
            icon={Heart}
            count={likes}
            active={liked}
            activeColor="text-rose-400"
            onClick={handleLike}
          />
          <Link to={`/forum/${post.id}`}>
            <ActionButton
              icon={MessageCircle}
              count={post.replies_count || 0}
              active={false}
              activeColor="text-blue-400"
            />
          </Link>
          <ActionButton
            icon={Repeat2}
            active={reposted}
            activeColor="text-emerald-400"
            onClick={handleRepost}
          />
        </div>

        <div className="flex items-center gap-0.5">
          <ActionButton
            icon={Share2}
            onClick={handleShare}
          />
          <ActionButton
            icon={Bookmark}
            active={saved}
            activeColor="text-primary"
            onClick={() => setSaved(v => !v)}
          />
        </div>
      </div>
    </motion.article>
  );
}