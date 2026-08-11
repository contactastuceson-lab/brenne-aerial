import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Loader2 } from 'lucide-react';
import HomePostCard from '@/components/home/HomePostCard';
import CreatePost from '@/components/post/CreatePost';

export default function ReplyItem({ reply, currentUser, depth = 0 }) {
  const [showComposer, setShowComposer] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [loadingNested, setLoadingNested] = useState(false);

  // Load nested replies (replies to this reply)
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
    await loadNested();
  };

  const maxDepth = 2;
  const indent = depth < maxDepth ? 'ml-3 md:ml-6 border-l border-zinc-800/40 pl-1 md:pl-2' : '';

  return (
    <div className={indent}>
      {/* The reply itself */}
      <HomePostCard post={reply} currentUser={currentUser} />

      {/* Reply action bar */}
      {depth < maxDepth && (
        <div className="flex items-center gap-2 px-4 pb-2 -mt-1">
          <button
            onClick={() => setShowComposer(v => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-blue-400 transition-colors font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Répondre
          </button>
          {(nestedReplies.length > 0 || loadingNested) && (
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              {loadingNested ? '…' : `${nestedReplies.length} réponse(s)`}
            </span>
          )}
        </div>
      )}

      {/* Inline composer */}
      {showComposer && currentUser && (
        <div className="border-b border-zinc-800/40 bg-secondary/10">
          <CreatePost user={currentUser} onPost={handleNewReply} replyTo={reply} />
        </div>
      )}

      {/* Nested replies */}
      {nestedReplies.length > 0 && depth < maxDepth && (
        <div>
          {nestedReplies.map(nr => (
            <ReplyItem key={nr.id} reply={nr} currentUser={currentUser} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}