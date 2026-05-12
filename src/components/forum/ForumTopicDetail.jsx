import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Lock, Pin, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserBadgeProfile from './UserBadgeProfile';
import ForumPostItem from './ForumPostItem';
import CreateForumPost from './CreateForumPost';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const ForumTopicDetail = ({ topicId, onBack }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch topic details
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['forumTopic', topicId],
    queryFn: async () => {
      const response = await base44.entities.ForumTopic.get(topicId);
      return response;
    },
    enabled: !!topicId,
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forumPosts', topicId],
    queryFn: async () => {
      const response = await base44.entities.ForumPost.filter({
        topic_id: topicId,
      });
      return response || [];
    },
    enabled: !!topicId,
  });

  // Fetch author data
  const { data: authorData } = useQuery({
    queryKey: ['user', topic?.author],
    queryFn: async () => {
      const response = await base44.entities.User.get(topic.author);
      return response;
    },
    enabled: !!topic?.author,
  });

  // Increment view count
  useEffect(() => {
    if (topic && user) {
      base44.entities.ForumTopic.update(topicId, {
        views_count: (topic.views_count || 0) + 1,
      });
    }
  }, [topicId, user]);

  const markSolutionMutation = useMutation({
    mutationFn: async ({ postId, isSolution }) => {
      await base44.entities.ForumPost.update(postId, {
        is_solution: !isSolution,
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
  const isSupreme = authorData?.role === 'owner' || authorData?.role === 'pdg_adjoint';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-grotesk font-semibold text-sm"
      >
        <ArrowLeft size={16} />
        Retour au forum
      </button>

      {/* Title & Meta */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {topic.is_pinned && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-grotesk font-bold">
              <Pin size={14} />
              Épinglé
            </span>
          )}
          {topic.is_locked && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600/40 text-slate-300 border border-slate-500/30 rounded-full text-xs font-grotesk font-bold">
              <Lock size={14} />
              Fermé
            </span>
          )}
          <span className="text-xs font-mono px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 uppercase tracking-wide">
            {topic.category}
          </span>
        </div>
        <h1 className="text-4xl font-grotesk font-bold text-white leading-tight">
          {topic.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={16} />
            {topic.replies_count} réponse{topic.replies_count !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1.5">
            <Eye size={16} />
            {topic.views_count} vue{topic.views_count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Topic Content */}
      <div className={cn(
        "backdrop-blur-md border rounded-2xl p-8 shadow-lg transition-colors",
        isSupreme
          ? 'bg-gradient-to-br from-purple-900/20 to-slate-900/40 border-purple-500/40 hover:border-purple-500/50 shadow-purple-500/10'
          : 'bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-cyan-500/15 hover:border-cyan-500/25'
      )}>
        <div className="mb-6 pb-6 border-b border-slate-700/50">
          <UserBadgeProfile userId={topic.author} small />
          <p className="text-xs text-slate-400 mt-3">
            {topic.created_date && formatDistanceToNow(new Date(topic.created_date), { locale: fr, addSuffix: true })}
          </p>
        </div>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {topic.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-grotesk font-semibold border border-cyan-500/25">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
            {topic.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Status message */}
      {hasSolution && (
        <div className="bg-green-900/20 border border-green-500/40 rounded-xl p-4 text-green-300 font-semibold backdrop-blur-md">
          ✓ Ce sujet a une solution marquée ci-dessous
        </div>
      )}

      {/* Posts section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Réponses ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div className="text-center p-8 bg-slate-800/60 backdrop-blur-md rounded-xl border border-cyan-500/20">
            <p className="text-cyan-200 mb-4">Aucune réponse pour le moment</p>
            {!topic.is_locked && (
              <p className="text-slate-400 text-sm">Soyez le premier à répondre !</p>
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
            <h3 className="text-lg font-bold text-white mb-4">Votre réponse</h3>
            <CreateForumPost 
              topicId={topicId} 
              currentRepliesCount={topic.replies_count || 0}
            />
          </div>
        )}

        {topic.is_locked && (
          <div className="mt-6 p-4 bg-slate-800/60 backdrop-blur-md text-slate-300 rounded-xl border border-slate-700/50 text-center">
            <Lock size={20} className="mx-auto mb-2" />
            <p className="font-semibold">Ce sujet est fermé</p>
            <p className="text-sm text-slate-400">Les nouvelles réponses ne sont plus acceptées</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumTopicDetail;