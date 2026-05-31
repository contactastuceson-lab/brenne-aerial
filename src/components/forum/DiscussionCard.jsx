import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DiscussionCard({ discussion }) {
  return (
    <Link to={`/forum/${discussion.id}`}>
      <div className="group p-4 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/60 transition-all">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-grotesk font-bold text-white group-hover:text-cyan-300 transition-colors flex-1">
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
            <span>{discussion.author_name}</span>
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