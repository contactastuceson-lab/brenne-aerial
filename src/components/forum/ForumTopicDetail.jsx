import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Lock, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserBadgeProfile from './UserBadgeProfile';
import ForumPostItem from './ForumPostItem';
import CreateForumPost from './CreateForumPost';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ForumTopicDetail = ({ topicId, onBack }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch topic details
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['forumTopic', topicId],
    queryFn: async () => {
      const response = await base44Client.records.get({
        table: 'ForumTopic',
        id: topicId,
      });
      return response;
    },
    enabled: !!topicId,
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forumPosts', topicId],
    queryFn: async () => {
      const response = await base44Client.records.filter({
        table: 'ForumPost',
        where: {
          topic_id: topicId,
        },
      });
      return response.records || [];
    },
    enabled: !!topicId,
  });

  // Increment view count
  useEffect(() => {
    if (topic && user) {
      base44Client.records.update({
        table: 'ForumTopic',
        id: topicId,
        data: {
          views_count: (topic.views_count || 0) + 1,
        },
      });
    }
  }, [topicId, user]);

  const markSolutionMutation = useMutation({
    mutationFn: async ({ postId, isSolution }) => {
      await base44Client.records.update({
        table: 'ForumPost',
        id: postId,
        data: {
          is_solution: !isSolution,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
    },
  });

  const handleMarkSolution = (postId, isSolution) => {
    markSolutionMutation.mutate({ postId, isSolution });
  };

  if (topicLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Sujet non trouvé</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          Retour au forum
        </Button>
      </div>
    );
  }

  const isAuthor = topic.author === user?.id;
  const canMarkSolution = isAuthor || user?.role === 'admin' || user?.role === 'owner';
  const hasSolution = posts.some((post) => post.is_solution);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          Retour au forum
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {topic.is_pinned && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-semibold">
                  <Pin size={14} />
                  Épinglé
                </span>
              )}
              {topic.is_locked && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-full text-sm font-semibold">
                  <Lock size={14} />
                  Fermé
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
            <p className="text-blue-100 text-sm">
              {topic.category.toUpperCase()} • {topic.replies_count} réponses • {topic.views_count} vues
            </p>
          </div>
        </div>
      </div>

      {/* Topic Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        <div className="mb-4">
          <UserBadgeProfile userId={topic.author} />
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(topic.created_at), { locale: fr, addSuffix: true })}
          </p>
        </div>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {topic.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
          {topic.content}
        </div>
      </div>

      {/* Status message */}
      {hasSolution && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-green-900 font-semibold">
          ✓ Ce sujet a une solution marquée ci-dessous
        </div>
      )}

      {/* Posts section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Réponses ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">Aucune réponse pour le moment</p>
            {!topic.is_locked && (
              <p className="text-gray-500 text-sm">Soyez le premier à répondre !</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <ForumPostItem
                key={post.id}
                post={post}
                isTopicAuthor={isAuthor}
                onMarkSolution={handleMarkSolution}
                canMarkSolution={canMarkSolution}
              />
            ))}
          </div>
        )}

        {/* Reply form */}
        {!topic.is_locked && user && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Votre réponse</h3>
            <CreateForumPost 
              topicId={topicId} 
              currentRepliesCount={topic.replies_count || 0}
            />
          </div>
        )}

        {topic.is_locked && (
          <div className="mt-6 p-4 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 text-center">
            <Lock size={20} className="mx-auto mb-2" />
            <p className="font-semibold">Ce sujet est fermé</p>
            <p className="text-sm text-gray-600">Les nouvelles réponses ne sont plus acceptées</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumTopicDetail;
