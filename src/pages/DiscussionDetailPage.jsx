import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Eye, Heart, Check, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import VerificationIcons from '@/components/ui/VerificationIcon';
import AffiliationBadges from '@/components/shared/AffiliationBadges';
import DiscordMarkdown from '@/components/forum/DiscordMarkdown';
import usePublicUser from '@/hooks/usePublicUser';
import ExternalLinkModal from '@/components/forum/ExternalLinkModal.jsx';
import { applySeoMeta, getForumSeoData } from '@/lib/seo';
import { handleIdentityClick } from '@/lib/identityClick';
import ReportButton from '@/components/shared/ReportButton';
import AdSlot from '@/components/feed/AdSlot';

// Composant isolé pour chaque réponse — hook usePublicUser au niveau du composant
function ReplyCard({ reply, discussion, id }) {
  const liveAuthor = usePublicUser(reply.author_id);
  const navigate = useNavigate();
  const location = useLocation();
  const avatar = liveAuthor?.avatar_url || reply.author_avatar;
  const name = liveAuthor?.display_name || liveAuthor?.full_name || reply.author_display_name || reply.author_name;
  const verifications = liveAuthor?.verifications ?? reply.author_verifications ?? [];
  const isSupreme = liveAuthor?.is_supreme ?? reply.author_is_supreme;
  const identityUser = liveAuthor || { id: reply.author_id, username: reply.author_username, verifications };
  const handleIdentity = (event) => handleIdentityClick({ event, navigate, pathname: location.pathname, user: identityUser });

  return (
    <div className={cn('p-4 rounded-lg border', reply.is_solution ? 'bg-green-900/20 border-green-500/40' : 'bg-slate-800/30 border-slate-700/50')}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {avatar ? (
              <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                {name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <button type="button" onClick={handleIdentity} className={`font-semibold hover:underline ${isSupreme ? 'bg-gradient-to-r from-amber-300 via-white to-amber-300 bg-clip-text bg-[200%] animate-shimmer' : 'text-white'}`}>
              {name}
            </button>
            <VerificationIcons
              verifications={isSupreme ? ['supreme', ...(verifications || [])] : (verifications || [])}
              size="sm"
              user={identityUser}
            />

          </div>
          <p className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(reply.created_date.endsWith('Z') ? reply.created_date : reply.created_date + 'Z'), { locale: fr, addSuffix: true })}
          </p>
        </div>
        {reply.is_solution && (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs flex items-center gap-1">
            <Check size={12} /> Solution
          </span>
        )}
      </div>
      <div className="mb-3"><DiscordMarkdown content={reply.content} allowMarkdown={true} /></div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
          <Heart size={14} className="mr-1" />{reply.likes_count || 0}
        </Button>
        <ReportButton
          targetType="discussion_reply"
          targetId={reply.id}
          targetName={name}
          targetContent={reply.content || ''}
          targetUrl={`/forum/${discussion?.id || id}#reply-${reply.id}`}
          variant="button"
          icon={Flag}
          label="Signaler"
        />
      </div>
    </div>
  );
}

// Composant pour l'en-tête de la discussion principale
function DiscussionAuthorHeader({ discussion }) {
  const liveAuthor = usePublicUser(discussion.author_id);
  const navigate = useNavigate();
  const location = useLocation();
  const avatar = liveAuthor?.avatar_url || discussion.author_avatar;
  const name = liveAuthor?.display_name || liveAuthor?.full_name || discussion.author_display_name || discussion.author_name;
  const verifications = liveAuthor?.verifications ?? discussion.author_verifications ?? [];
  const isSupreme = liveAuthor?.is_supreme ?? discussion.author_is_supreme;
  const identityUser = liveAuthor || { id: discussion.author_id, username: discussion.author_username, verifications };
  const handleIdentity = (event) => handleIdentityClick({ event, navigate, pathname: location.pathname, user: identityUser });

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <button type="button" onClick={handleIdentity} className={`truncate max-w-[140px] hover:underline ${isSupreme ? 'bg-gradient-to-r from-amber-300 via-white to-amber-300 bg-clip-text bg-[200%] animate-shimmer' : 'text-white'}`}>
        {name}
      </button>
      <VerificationIcons
        verifications={isSupreme ? ['supreme', ...(verifications || [])] : verifications}
        size="sm"
        user={identityUser}
      />

    </div>
  );
}

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

  useEffect(() => {
    if (!discussion) return;
    const seoData = getForumSeoData(discussion);
    applySeoMeta({
      title: seoData.title,
      description: seoData.description,
      image: seoData.image,
      type: seoData.type,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [discussion]);

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
            <DiscussionAuthorHeader discussion={discussion} />
            <span className="text-xs">{formatDistanceToNow(new Date(discussion.created_date.endsWith('Z') ? discussion.created_date : discussion.created_date + 'Z'), { locale: fr, addSuffix: true })}</span>
            <div className="flex items-center gap-1 text-xs">
              <Eye size={12} />
              {discussion.views_count || 0} vues
            </div>
            <ReportButton
              targetType="discussion"
              targetId={discussion.id}
              targetName={discussion.author_display_name || discussion.author_name || ''}
              targetContent={discussion.title || ''}
              targetUrl={`/forum/${discussion.id}`}
              variant="button"
              icon={Flag}
              label="Signaler"
            />
          </div>
        </div>

        {/* Discussion Content */}
        <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <DiscordMarkdown content={discussion.content} allowMarkdown={true} />
        </div>

        {/* Pub */}
        <div className="mb-6"><AdSlot placement="between_posts" /></div>

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
                <ReplyCard key={reply.id} reply={reply} discussion={discussion} id={id} />
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