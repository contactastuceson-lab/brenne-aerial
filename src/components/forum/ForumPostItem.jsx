import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Heart, MessageSquare, Check, Edit2, Trash2 } from 'lucide-react';
import UserBadgeProfile from './UserBadgeProfile';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ForumPostItem = ({ post, isTopicAuthor, onMarkSolution, canMarkSolution }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.liked_by?.includes(user?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const { data: author } = useQuery({
    queryKey: ['user', post.author],
    queryFn: async () => {
      const response = await base44.entities.User.get(post.author);
      return response;
    },
    enabled: !!post.author,
  });

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
        'p-5 rounded-xl border transition-all duration-300 backdrop-blur-md',
        post.is_solution
          ? 'bg-green-900/20 border-green-500/40 shadow-md shadow-green-500/10'
          : 'bg-slate-800/60 border-cyan-500/20 hover:border-cyan-400/30'
      )}
    >
      {/* Header avec auteur et date */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="text-white">
            <UserBadgeProfile userId={post.author} small />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {post.created_date && formatDistanceToNow(new Date(post.created_date), { locale: fr, addSuffix: true })}
          </p>
          {post.edited && <p className="text-xs text-slate-500 italic">Édité</p>}
        </div>

        {/* Badge Solution */}
        {post.is_solution && (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-900/40 text-green-300 border border-green-500/40 rounded-full font-semibold text-sm">
            <Check size={16} />
            Solution
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="mb-4">
        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium',
              isLiked
                ? 'bg-red-900/40 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border hover:border-cyan-500/30'
            )}
          >
            <Heart
              size={16}
              className={isLiked ? 'fill-current' : ''}
            />
            <span className="text-xs">{likesCount}</span>
          </button>

          {canMarkSolution && post.author !== user?.id && (
            <button
              onClick={() => onMarkSolution(post.id, !post.is_solution)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium',
                post.is_solution
                  ? 'bg-green-900/40 text-green-300 border border-green-500/40'
                  : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border hover:border-cyan-500/30'
              )}
            >
              <Check size={16} />
              <span className="text-xs">
                {post.is_solution ? 'Solution' : 'Marquer'}
              </span>
            </button>
          )}
        </div>

        {/* Menu actions */}
        {user?.id === post.author && (
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