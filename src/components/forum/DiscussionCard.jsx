import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, Eye, Pin, Lock, Star } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import AffiliationBadges from '@/components/shared/AffiliationBadges';

// Strip markdown to plain text for preview
function stripMarkdown(text = '') {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[.*?\]\(.*?\)/g, '')   // remove links
    .replace(/#{1,6}\s/g, '')         // remove headings
    .replace(/[*_`~]/g, '')           // remove formatting chars
    .replace(/\n+/g, ' ')             // collapse newlines
    .trim();
}

export default function DiscussionCard({ discussion }) {
  const isOfficial = discussion.is_official;
  const isPinned = discussion.is_pinned;
  const isLocked = discussion.is_locked;
  const plainContent = stripMarkdown(discussion.content);

  return (
    <Link to={`/forum/${discussion.id}`}>
      <div className={`group p-4 rounded-lg border transition-all ${
        isOfficial
          ? 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10'
          : isPinned
          ? 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10'
          : 'border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/60'
      }`}>
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {isPinned && <span className="inline-flex items-center gap-0.5 text-[10px] text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded"><Pin size={9} /> Épinglé</span>}
              {isOfficial && <span className="inline-flex items-center gap-0.5 text-[10px] text-yellow-300 bg-yellow-500/15 px-1.5 py-0.5 rounded"><Star size={9} /> Officiel</span>}
              {isLocked && <span className="inline-flex items-center gap-0.5 text-[10px] text-red-300 bg-red-500/15 px-1.5 py-0.5 rounded"><Lock size={9} /> Verrouillé</span>}
            </div>
            <h3 className={`font-grotesk font-bold group-hover:text-cyan-300 transition-colors ${
              isOfficial ? 'text-yellow-400' : 'text-white'
            }`}>
              {discussion.title}
            </h3>
          </div>
          <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded-full whitespace-nowrap flex-shrink-0">
            {discussion.category}
          </span>
        </div>
        
        <p className="text-sm text-slate-400 mb-3 line-clamp-2 overflow-hidden">
          {plainContent}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {discussion.author_avatar ? (
              <img src={discussion.author_avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {discussion.author_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span className="truncate max-w-[100px]">{discussion.author_display_name || discussion.author_name}</span>
            <VerificationIcons
              verifications={discussion.author_is_supreme ? ['supreme', ...(discussion.author_verifications || [])] : discussion.author_verifications}
              size="sm"
              user={{ id: discussion.author_id }}
            />
            {discussion.author_id && <AffiliationBadges userId={discussion.author_id} size="sm" max={1} />}
            <span className="hidden sm:inline text-slate-600 truncate">{formatDistanceToNow(new Date(discussion.created_date), { locale: fr, addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1"><MessageCircle size={13} />{discussion.replies_count || 0}</div>
            <div className="flex items-center gap-1"><Eye size={13} />{discussion.views_count || 0}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}