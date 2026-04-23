import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { MessageSquare, Heart, Lock, Pin, TrendingUp } from 'lucide-react';
import UserBadgeProfile from './UserBadgeProfile';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ForumTopicCard = ({ topic, onSelect }) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onSelect) {
      onSelect(topic.id);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-50 text-blue-700 border-blue-200',
      techniques: 'bg-purple-50 text-purple-700 border-purple-200',
      projets: 'bg-green-50 text-green-700 border-green-200',
      services: 'bg-orange-50 text-orange-700 border-orange-200',
      formation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actualites: 'bg-red-50 text-red-700 border-red-200',
      support: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return colors[category] || colors.general;
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group p-4 bg-slate-800 border border-slate-700 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer',
        isHovered && 'border-blue-500 shadow-lg shadow-blue-500/20'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header avec badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {topic.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900 text-red-200 rounded-full text-xs font-semibold">
                <Pin size={12} />
                Épinglé
              </span>
            )}
            {topic.is_locked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-gray-300 rounded-full text-xs font-semibold">
                <Lock size={12} />
                Fermé
              </span>
            )}
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold border',
                getCategoryColor(topic.category)
              )}
            >
              {topic.category}
            </span>
          </div>

          {/* Titre */}
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {topic.title}
          </h3>

          {/* Aperçu du contenu */}
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {topic.content.substring(0, 120)}...
          </p>

          {/* Tags */}
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {topic.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-md">
                  #{tag}
                </span>
              ))}
              {topic.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{topic.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 text-right">
          <div className="flex items-center justify-end gap-2 text-gray-400 hover:text-blue-400 transition-colors">
            <MessageSquare size={18} />
            <span className="text-sm font-semibold">{topic.replies_count || 0}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold">{topic.views_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer avec auteur et date */}
      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
        <div className="min-w-0">
          <UserBadgeProfile userId={topic.author} small />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {formatDistanceToNow(new Date(topic.created_at), { locale: fr, addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default ForumTopicCard;
