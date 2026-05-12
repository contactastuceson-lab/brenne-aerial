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
        'p-4 rounded-lg border transition-all duration-300',
        post.is_solution
          ? 'bg-slate-800 border-green-600 shadow-md shadow-green-500/20'
          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
      )}
    >
      {/* Header avec auteur et date */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <UserBadgeProfile userId={post.author} small />
          <p className="text-xs text-gray-500 mt-1">
            {post.created_date && formatDistanceToNow(new Date(post.created_date), { locale: fr, addSuffix: true })}
          </p>
          {post.edited && <p className="text-xs text-gray-400 italic">Édité</p>}
        </div>

        {/* Badge Solution */}
        {post.is_solution && (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-900 text-green-200 rounded-full font-semibold text-sm">
            <Check size={16} />
            Solution
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200',
              isLiked
                ? 'bg-red-900 text-red-200 font-semibold'
                : 'text-gray-400 hover:bg-slate-700'
            )}
          >
            <Heart
              size={18}
              className={isLiked ? 'fill-current' : ''}
            />
            <span className="text-sm">{likesCount}</span>
          </button>

          {canMarkSolution && post.author !== user?.id && (
            <button
              onClick={() => onMarkSolution(post.id, !post.is_solution)}
              className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200',
                post.is_solution
                  ? 'bg-green-900 text-green-200 font-semibold'
                  : 'text-gray-400 hover:bg-slate-700'
              )}
            >
              <Check size={18} />
              <span className="text-sm">
                {post.is_solution ? 'Solution' : 'Marquer comme solution'}
              </span>
            </button>
          )}
        </div>

        {/* Menu actions */}
        {user?.id === post.author && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-300"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-400"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostItem;