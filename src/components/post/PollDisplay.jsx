import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isActionBlocked, RESTRICTED_TOAST } from '@/lib/accountStatus';
import { toast } from 'sonner';

export default function PollDisplay({ post, currentUser }) {
  const poll = post.poll;
  const [localPoll, setLocalPoll] = useState(poll);
  const [voting, setVoting] = useState(false);

  if (!poll || !poll.options?.length) return null;

  const userId = currentUser?.id;
  const hasVoted = localPoll.options.some(o => (o.voted_by || []).includes(userId));
  const isExpired = localPoll.ends_at && new Date(localPoll.ends_at) < new Date();
  const showResults = hasVoted || isExpired;

  const handleVote = async (optionId) => {
    if (!currentUser || voting || hasVoted || isExpired) return;
    if (isActionBlocked(currentUser, 'poll')) { toast.error(RESTRICTED_TOAST); return; }
    setVoting(true);
    try {
      const updatedOptions = localPoll.options.map(o => {
        if (o.id === optionId) {
          return { ...o, votes: (o.votes || 0) + 1, voted_by: [...(o.voted_by || []), userId] };
        }
        return o;
      });
      const newTotal = updatedOptions.reduce((s, o) => s + (o.votes || 0), 0);
      const updatedPoll = { ...localPoll, options: updatedOptions, total_votes: newTotal };
      setLocalPoll(updatedPoll);
      const res = await base44.functions.invoke('votePoll', { postId: post.id, optionId });
      if (res?.data?.poll) setLocalPoll(res.data.poll);
    } catch {
      setLocalPoll(poll);
    } finally {
      setVoting(false);
    }
  };

  const getPercent = (opt) => {
    const total = localPoll.options.reduce((s, o) => s + (o.votes || 0), 0);
    if (!total) return 0;
    return Math.round(((opt.votes || 0) / total) * 100);
  };

  const myVote = localPoll.options.find(o => (o.voted_by || []).includes(userId))?.id;
  const maxVotes = Math.max(...localPoll.options.map(o => o.votes || 0));

  return (
    <div className="mt-2 mb-1 rounded-2xl border border-white/8 overflow-hidden" onClick={e => e.stopPropagation()}>
      {/* Options */}
      <div className="p-3 space-y-2">
        {localPoll.options.map(opt => {
          const pct = getPercent(opt);
          const isWinner = showResults && (opt.votes || 0) === maxVotes && maxVotes > 0;
          const isMyVote = myVote === opt.id;

          if (!showResults) {
            // Clickable — not yet voted
            return (
              <button key={opt.id} onClick={() => handleVote(opt.id)}
                disabled={voting || !currentUser}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  voting ? 'opacity-50' : 'hover:border-primary/50 hover:bg-primary/5'
                } border-white/10 bg-white/3 text-foreground`}>
                {opt.text}
              </button>
            );
          }

          // Results view
          return (
            <div key={opt.id} className="relative overflow-hidden rounded-xl">
              {/* Background bar */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-700 rounded-xl ${
                  isWinner ? 'bg-primary/20' : 'bg-white/5'
                }`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center gap-2 px-4 py-2.5">
                <span className={`flex-1 text-sm font-medium ${isWinner ? 'text-foreground' : 'text-foreground/70'}`}>
                  {opt.text}
                </span>
                {isMyVote && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                <span className={`text-sm font-mono font-bold flex-shrink-0 ${isWinner ? 'text-primary' : 'text-muted-foreground/50'}`}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center gap-3">
        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/40 font-mono">
          {localPoll.options.reduce((s, o) => s + (o.votes || 0), 0)} vote{localPoll.options.reduce((s, o) => s + (o.votes || 0), 0) !== 1 ? 's' : ''}
        </span>
        {localPoll.ends_at && (
          <>
            <span className="text-muted-foreground/20">·</span>
            <Clock className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/40">
              {isExpired ? 'Sondage terminé' : `Se termine ${formatDistanceToNow(new Date(localPoll.ends_at), { addSuffix: true, locale: fr })}`}
            </span>
          </>
        )}
        {!showResults && !currentUser && (
          <span className="text-xs text-muted-foreground/30 ml-auto">Connectez-vous pour voter</span>
        )}
      </div>
    </div>
  );
}