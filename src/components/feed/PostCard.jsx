import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const CATEGORY_COLORS = {
  general:   { bg: 'bg-blue-400/10',   text: 'text-blue-400',   label: 'Général' },
  technique: { bg: 'bg-purple-400/10', text: 'text-purple-400', label: 'Technique' },
  aide:      { bg: 'bg-amber-400/10',  text: 'text-amber-400',  label: 'Aide' },
  partages:  { bg: 'bg-green-400/10',  text: 'text-green-400',  label: 'Partages' },
  autres:    { bg: 'bg-zinc-400/10',   text: 'text-zinc-400',   label: 'Autres' },
};

export default function PostCard({ post, currentUser }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.replies_count || 0);
  const [saved, setSaved] = useState(false);

  const cat = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general;
  const authorName = post.author_display_name || post.author_name || 'Utilisateur';
  const authorUsername = post.author_username;
  const authorAvatar = post.author_avatar;
  const avatarInitial = (authorName?.[0] || 'U').toUpperCase();
  const profileLink = authorUsername ? `/@${authorUsername}` : null;

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: fr })
    : '';

  const handleLike = () => {
    setLiked(v => !v);
    setLikes(v => liked ? v - 1 : v + 1);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden hover:border-border/80 transition-all duration-200"
      style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {authorAvatar
              ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              : <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
            }
          </div>

          {/* Name + time */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {profileLink ? (
                <Link to={profileLink} className="font-inter font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">
                  {authorName}
                </Link>
              ) : (
                <span className="font-inter font-semibold text-sm text-foreground truncate">{authorName}</span>
              )}
              {authorUsername && (
                <span className="font-mono text-xs text-muted-foreground truncate">@{authorUsername}</span>
              )}
              {post.author_is_supreme && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono">👑</span>
              )}
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} border-current/20`}>
            {cat.label}
          </span>
          <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.title && (
          <Link to={`/forum/${post.id}`}>
            <h3 className="font-grotesk font-semibold text-base mb-2 hover:text-primary transition-colors leading-snug cursor-pointer">
              {post.title}
            </h3>
          </Link>
        )}
        {post.content && (
          <div className="font-inter text-sm text-muted-foreground leading-relaxed line-clamp-4 prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-[11px] font-mono text-primary hover:text-primary/80 cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter transition-all ${
              liked ? 'bg-rose-400/15 text-rose-400' : 'text-muted-foreground hover:bg-rose-400/10 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${liked ? 'scale-110 fill-current' : ''}`} />
            <span>{likes > 0 ? likes : ''}</span>
          </button>

          {/* Comment */}
          <Link to={`/forum/${post.id}`}>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter text-muted-foreground hover:bg-blue-400/10 hover:text-blue-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.replies_count > 0 ? post.replies_count : ''}</span>
            </button>
          </Link>

          {/* Repost */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter text-muted-foreground hover:bg-green-400/10 hover:text-green-400 transition-colors">
            <Repeat2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Views */}
          {post.views_count > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono mr-2">
              <Eye className="w-3.5 h-3.5" /> {post.views_count}
            </span>
          )}
          {/* Save */}
          <button
            onClick={() => setSaved(v => !v)}
            className={`p-1.5 rounded-xl transition-colors ${saved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          {/* Share */}
          <button className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}