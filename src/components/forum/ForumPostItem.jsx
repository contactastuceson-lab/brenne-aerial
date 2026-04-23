import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';
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
      const response = await base44Client.records.get({ table: 'User', id: post.author });
      return response;
    },
    enabled: !!post.author,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const newLikedBy = isLiked
        ? post.liked_by?.filter((id) => id !== user.id) || []
        : [...(post.liked_by || []), user.id];

      await base44Client.records.update({
        table: 'ForumPost',
        id: post.id,
        data: {
          liked_by: newLikedBy,
          likes_count: newLikedBy.length,
        },
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
          ? 'bg-green-50 border-green-300 shadow-md'
          : 'bg-white border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Header avec auteur et date */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <UserBadgeProfile userId={post.author} small />
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(post.created_at), { locale: fr, addSuffix: true })}
          </p>
          {post.edited && <p className="text-xs text-gray-400 italic">Édité</p>}
        </div>

        {/* Badge Solution */}
        {post.is_solution && (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-200 text-green-800 rounded-full font-semibold text-sm">
            <Check size={16} />
            Solution
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200',
              isLiked
                ? 'bg-red-100 text-red-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
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
                  ? 'bg-green-100 text-green-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
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
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600"
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
