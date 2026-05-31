import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DiscussionCard({ discussion }) {
  const isOfficial = discussion.author_name === 'Astuceson Officiel';

  return (
    <Link to={`/forum/${discussion.id}`}>
      <div className={`group p-4 rounded-lg border transition-all ${
        isOfficial
          ? 'border-yellow-500/50 hover:border-yellow-400 bg-slate-800/50 hover:bg-slate-800/70'
          : 'border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/60'
      }`}>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className={`font-grotesk font-bold group-hover:text-cyan-300 transition-colors flex-1 ${
            isOfficial ? 'text-yellow-400' : 'text-white'
          }`}>
            {discussion.title}
          </h3>
          <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded-full whitespace-nowrap flex-shrink-0">
            {discussion.category}
          </span>
        </div>
        
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
          {discussion.content}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {isOfficial && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                  <img src={discussion.author_avatar} alt="" className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-yellow-300 font-grotesk font-semibold">{discussion.author_name}</span>
                <span className="text-lg">👑</span>
              </div>
            )}
            {!isOfficial && <span>{discussion.author_name}</span>}
            <span>{formatDistanceToNow(new Date(discussion.created_date), { locale: fr, addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              {discussion.replies_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              {discussion.views_count || 0}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}