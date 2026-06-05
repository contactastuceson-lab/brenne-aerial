import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Eye, Heart, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import VerificationIcons from '@/components/ui/VerificationIcon';
import DiscordMarkdown from '@/components/forum/DiscordMarkdown';
import ExternalLinkModal from '@/components/forum/ExternalLinkModal.jsx';

export default function DiscussionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: discussion } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => base44.entities.Discussion.get(id),
    enabled: !!id,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['discussionReplies', id],
    queryFn: async () => {
      const res = await base44.entities.DiscussionReply.filter({
        discussion_id: id,
      });
      return res || [];
    },
    enabled: !!id,
  });

  // Increment views
  useEffect(() => {
    if (discussion && user) {
      base44.entities.Discussion.update(id, {
        views_count: (discussion.views_count || 0) + 1,
      });
    }
  }, [id]);

  const [replyContent, setReplyContent] = useState('');

  const replyMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.DiscussionReply.create({
        discussion_id: id,
        content: replyContent,
        author_id: user.id,
        author_name: user.full_name,
        author_display_name: user.display_name || user.full_name,
        author_username: user.username,
        author_avatar: user.avatar_url,
        author_is_supreme: user.verifications?.includes('supreme') || false,
        author_verifications: Array.isArray(user.verifications) ? user.verifications.filter(v => v !== 'supreme') : [],
      });
    },
    onSuccess: () => {
      base44.entities.Discussion.update(id, {
        replies_count: (discussion.replies_count || 0) + 1,
        last_reply_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['discussionReplies', id] });
      setReplyContent('');
      toast.success('Réponse postée !');
    },
  });

  if (!discussion) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <ExternalLinkModal />
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/forum')}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Retour au forum
        </Button>

        {/* Discussion Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-xs">
              {discussion.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{discussion.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              {discussion.author_avatar ? (
                <img src={discussion.author_avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {discussion.author_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className={`truncate max-w-[140px] ${discussion.author_is_supreme ? 'bg-gradient-to-r from-amber-300 via-white to-amber-300 bg-clip-text bg-[200%] animate-shimmer' : 'text-white'}`}>
                {discussion.author_display_name || discussion.author_name}
              </span>
              <VerificationIcons 
                verifications={discussion.author_is_supreme ? ['supreme', ...(discussion.author_verifications || [])] : discussion.author_verifications} 
                size="sm" 
              />
            </div>
            <span className="text-xs">{formatDistanceToNow(new Date(discussion.created_date.endsWith('Z') ? discussion.created_date : discussion.created_date + 'Z'), { locale: fr, addSuffix: true })}</span>
            <div className="flex items-center gap-1 text-xs">
              <Eye size={12} />
              {discussion.views_count || 0} vues
            </div>
          </div>
        </div>

        {/* Discussion Content */}
        <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <DiscordMarkdown content={discussion.content} />
        </div>

        {/* Replies Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Réponses ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Aucune réponse pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    reply.is_solution
                      ? 'bg-green-900/20 border-green-500/40'
                      : 'bg-slate-800/30 border-slate-700/50'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {reply.author_avatar ? (
                          <img src={reply.author_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                            {reply.author_name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <p className={`font-semibold ${reply.author_is_supreme ? 'bg-gradient-to-r from-amber-300 via-white to-amber-300 bg-clip-text bg-[200%] animate-shimmer' : 'text-white'}`}>
                          {reply.author_display_name || reply.author_name}
                        </p>
                        <VerificationIcons 
                          verifications={reply.author_is_supreme ? ['supreme', ...(reply.author_verifications || [])] : (reply.author_verifications || [])} 
                          size="sm" 
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(reply.created_date.endsWith('Z') ? reply.created_date : reply.created_date + 'Z'), { locale: fr, addSuffix: true })}
                      </p>
                    </div>
                    {reply.is_solution && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs flex items-center gap-1">
                        <Check size={12} />
                        Solution
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <DiscordMarkdown content={reply.content} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                      <Heart size={14} className="mr-1" />
                      {reply.likes_count || 0}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {user && (
          discussion.is_locked ? (
            <div className="flex items-center gap-2 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              🔒 Cette discussion est verrouillée — les nouvelles réponses sont désactivées.
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Votre réponse</h3>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="min-h-32"
              />
              <Button
                onClick={() => replyMutation.mutate()}
                disabled={!replyContent.trim() || replyMutation.isPending}
              >
                {replyMutation.isPending ? 'Envoi...' : 'Répondre'}
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}