import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import HomePostCard from '@/components/home/HomePostCard';
import CreatePost from '@/components/post/CreatePost';

export default function ReplyItem({ reply, currentUser, depth = 0 }) {
  const [showComposer, setShowComposer] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [loadingNested, setLoadingNested] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const loadNested = useCallback(async () => {
    setLoadingNested(true);
    try {
      const items = await base44.entities.Post.filter({ reply_to_id: reply.id }, '-created_date', 50).catch(() => []);
      setNestedReplies(items);
    } finally {
      setLoadingNested(false);
    }
  }, [reply.id]);

  useEffect(() => {
    loadNested();
  }, [loadNested]);

  const handleNewReply = async () => {
    setShowComposer(false);
    setExpanded(true);
    await loadNested();
  };

  const maxDepth = 2;
  const hasNested = nestedReplies.length > 0;
  const canReply = depth < maxDepth;

  return (
    <div className={`relative ${depth > 0 ? 'ml-2 md:ml-4' : ''}`}>
      {/* Thread line for nested replies */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-700/40 rounded-full" style={{ marginLeft: '-2px' }} />
      )}

      {/* The reply itself */}
      <div className={depth > 0 ? 'pl-2 md:pl-4' : ''}>
        <HomePostCard post={reply} currentUser={currentUser} />
      </div>

      {/* Reply action bar */}
      {canReply && (
        <div className={`flex items-center gap-3 px-4 pb-2.5 -mt-1 ${depth > 0 ? 'pl-6 md:pl-8' : ''}`}>
          <button
            onClick={() => setShowComposer(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              showComposer ? 'text-blue-400' : 'text-muted-foreground/50 hover:text-blue-400'
            }`}
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            Répondre
          </button>

          {hasNested && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {nestedReplies.length} réponse{nestedReplies.length > 1 ? 's' : ''}
            </button>
          )}

          {loadingNested && !hasNested && (
            <span className="text-[10px] text-muted-foreground/40 font-mono">chargement…</span>
          )}
        </div>
      )}

      {/* Inline composer */}
      {showComposer && currentUser && (
        <div className={`border-b border-zinc-800/40 bg-blue-500/[0.03] ${depth > 0 ? 'ml-2 md:ml-4' : ''}`}>
          <CreatePost user={currentUser} onPost={handleNewReply} replyTo={reply} />
        </div>
      )}

      {/* Nested replies — collapsible */}
      {hasNested && canReply && expanded && (
        <div className={`border-l border-zinc-700/30 ${depth > 0 ? 'ml-2 md:ml-4' : 'ml-3 md:ml-6'}`}>
          {nestedReplies.map(nr => (
            <ReplyItem key={nr.id} reply={nr} currentUser={currentUser} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}