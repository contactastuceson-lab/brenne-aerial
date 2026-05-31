import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Heart, Check, Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UserBadgeProfile from './UserBadgeProfile';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const ForumPostItem = ({ post, isTopicAuthor, onMarkSolution, canMarkSolution }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.liked_by?.includes(user?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const isCurrentUserAuthor = post.author === user?.id;

  const { data: allPublicUsers = [] } = useQuery({
    queryKey: ['public-users-forum'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return res.data.users || [];
    },
  });

  const author = allPublicUsers.find(u => u.id === post.author);

  const isSupreme = author && (author?.role === 'owner' || author?.role === 'pdg_adjoint');

  const likeMutation = useMutation({
    mutationFn: async () => {
      const newLikedBy = isLiked
        ? post.liked_by?.filter((id) => id !== user.id) || []
        : [...(post.liked_by || []), user.id];

      await base44.entities.ForumPost.update(post.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length,
      });

      return newLikedBy;
    },
    onSuccess: (newLikedBy) => {
      setIsLiked(!isLiked);
      setLikesCount(newLikedBy.length);
      queryClient.invalidateQueries({ queryKey: ['forumPost', post.id] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <div
      className={cn(
        'group rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm',
        post.is_solution
          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/40 shadow-xl shadow-green-500/20'
          : isSupreme
          ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/60 shadow-2xl shadow-purple-500/30'
          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-cyan-500/20 hover:border-cyan-400/30 hover:shadow-md hover:shadow-cyan-500/10'
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/30 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-white mb-2">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 border border-cyan-500/20 flex-shrink-0">
                <AvatarImage src={author?.avatar_url} alt={post.author_name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-bold">
                  {(post.author_name || post.author_email)?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="font-grotesk font-bold text-sm text-white leading-tight">
                  {post.author_name || author?.full_name || post.author_email || 'Utilisateur supprimé'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {post.created_date && formatDistanceToNow(new Date(post.created_date), { locale: fr, addSuffix: true })}
            {post.edited && <span className="ml-2 italic">· édité</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSupreme && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white border border-purple-400/50 rounded-full font-grotesk text-xs font-bold whitespace-nowrap flex-shrink-0 shadow-lg shadow-purple-500/40">
              👑 SUPRÊME
            </div>
          )}
          {post.is_solution && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full font-grotesk text-xs font-semibold whitespace-nowrap flex-shrink-0">
              <Check size={14} />
              Solution
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="px-6 py-4">
        <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-3 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              em: ({ children }) => <em className="text-slate-400 italic">{children}</em>,
              code: ({ children }) => <code className="bg-slate-900/60 text-cyan-300 px-2 py-1 rounded text-xs font-mono">{children}</code>,
              ul: ({ children }) => <ul className="space-y-2 ml-4 list-disc mb-3 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-2 ml-4 list-decimal mb-3 last:mb-0">{children}</ol>,
              li: ({ children }) => <li className="text-slate-300">{children}</li>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-cyan-500/40 pl-3 italic text-slate-400 my-3">{children}</blockquote>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">{children}</a>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-slate-700/30 flex items-center justify-between gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
              isLiked
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:bg-cyan-500/15 hover:text-cyan-300 hover:border hover:border-cyan-500/25'
            )}
          >
            <Heart
              size={15}
              className={cn('transition-all', isLiked && 'fill-current')}
            />
            <span className="text-xs font-semibold">{likesCount}</span>
          </button>

          {canMarkSolution && !isCurrentUserAuthor && (
            <button
              onClick={() => onMarkSolution(post.id, !post.is_solution)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                post.is_solution
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-cyan-500/15 hover:text-cyan-300 hover:border hover:border-cyan-500/25'
              )}
            >
              <Check size={15} />
              <span className="text-xs font-semibold">
                {post.is_solution ? 'Solution' : 'Marquer'}
              </span>
            </button>
          )}
        </div>

        {isCurrentUserAuthor && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-300 h-8 w-8 p-0"
            >
              <Edit2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-400 h-8 w-8 p-0"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostItem;