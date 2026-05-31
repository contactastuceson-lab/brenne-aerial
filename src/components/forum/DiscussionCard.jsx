import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, Eye, Star, UserCheck, Award, Shield, Zap, CheckCircle, Heart, Check } from 'lucide-react';

const BADGE_ICONS = {
  'Fondateur': '⭐',
  'Collaborateur': '👤',
  'VIP': '🔱',
  'Admin': '🛡️',
  'Pilote': '⚡',
  'Officiel': '✓',
  'Vérfifié': '✓',
  'Donateur': '❤️',
};

export default function DiscussionCard({ discussion }) {
  const isOfficial = discussion.author_name === 'Contact Astuceson';

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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Avatar */}
            {discussion.author_avatar ? (
              <img src={discussion.author_avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white">
                {discussion.author_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            
            {/* Nom + Badges */}
            <div className="flex items-center gap-1">
              <span>{discussion.author_name}</span>
              {discussion.author_certification_badge && (
                <img 
                  src={discussion.author_certification_badge} 
                  alt="certification" 
                  className="w-4 h-4 object-contain"
                  title="Certifié"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              {discussion.author_badges?.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {discussion.author_badges.map(badge => (
                    <span key={badge} title={badge} className="text-sm">
                      {BADGE_ICONS[badge] || badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

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