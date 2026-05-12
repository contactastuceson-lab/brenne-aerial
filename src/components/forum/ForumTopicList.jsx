import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ForumTopicCard from './ForumTopicCard';
import ForumFilters from './ForumFilters';
import CreateForumTopic from './CreateForumTopic';
import { useAuth } from '@/lib/AuthContext';

const ForumTopicList = ({ onSelectTopic }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch all topics
  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: ['forumTopics'],
    queryFn: async () => {
      try {
        const response = await base44.entities.ForumTopic.filter({});
        return (response || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      } catch (err) {
        if (err?.status === 404 || err?.response?.status === 404) {
          return [];
        }

        if (typeof base44.entities.ForumTopic.list === 'function') {
          const fallback = await base44.entities.ForumTopic.list('-created_at', 100);
          return (fallback || []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        }

        throw err;
      }
    },
    retry: false,
  });

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    let filtered = [...topics];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((topic) => topic.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query) ||
          topic.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'most-replies':
        filtered.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
        break;
      case 'unanswered':
        filtered = filtered.filter((topic) => (topic.replies_count || 0) === 0);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Pinned topics first
    filtered.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

    return filtered;
  }, [topics, searchQuery, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('recent');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Forum de la Communauté
          </h1>
          <p className="text-cyan-50 text-lg md:text-xl">
            Posez des questions, partagez vos connaissances et connectez-vous avec la communauté Brenne Aerial
          </p>
        </div>
      </div>

      {/* Create Topic Button */}
      {user && (
        <div className="flex justify-end">
          <CreateForumTopic />
        </div>
      )}

      {/* Filters */}
      <ForumFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Topics List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
          <p className="text-red-300 font-semibold">Erreur lors du chargement des sujets</p>
          <p className="text-red-400/80 text-sm mt-2">{error.message}</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="p-12 text-center bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-xl backdrop-blur-sm">
          <div className="inline-block p-3 rounded-full bg-cyan-500/10 mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <p className="text-cyan-100 text-lg font-semibold mb-2">
            Aucun sujet trouvé
          </p>
          <p className="text-slate-400 mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Essayez de modifier vos filtres'
              : 'Soyez le premier à créer un sujet !'}
          </p>
          {user && (
            <div className="flex justify-center pt-4">
              <CreateForumTopic />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-cyan-400">{filteredTopics.length}</span> sujet
              {filteredTopics.length > 1 ? 's' : ''} trouvé
              {filteredTopics.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-3">
            {filteredTopics.map((topic) => (
              <ForumTopicCard
                key={topic.id}
                topic={topic}
                onSelect={onSelectTopic}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumTopicList;