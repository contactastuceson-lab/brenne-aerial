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
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Forum de la Communauté
        </h1>
        <p className="text-gray-400 text-lg">
          Posez des questions, partagez vos connaissances et connectez-vous avec la communauté
        </p>
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
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">Erreur lors du chargement des sujets</p>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg">
          <p className="text-gray-600 text-lg font-semibold mb-2">
            Aucun sujet trouvé
          </p>
          <p className="text-gray-500 mb-4">
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredTopics.length}</span> sujet
              {filteredTopics.length > 1 ? 's' : ''} trouvé
              {filteredTopics.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-4">
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
