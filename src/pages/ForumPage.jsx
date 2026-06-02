import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import DiscussionCard from '@/components/forum/DiscussionCard';
import NewDiscussionDialog from '@/components/forum/NewDiscussionDialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Megaphone, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'general', label: 'Général' },
  { value: 'technique', label: 'Technique' },
  { value: 'aide', label: 'Aide' },
  { value: 'partages', label: 'Partages' },
  { value: 'autres', label: 'Autres' },
];

const SORTS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'popular', label: 'Plus vus' },
  { value: 'replies', label: 'Plus de réponses' },
];

export default function ForumPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recent');

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions'],
    queryFn: async () => {
      try {
        const res = await base44.entities.Discussion.list('-created_date', 100);
        return res || [];
      } catch {
        return [];
      }
    },
  });

  const announcement = useMemo(() => discussions.find(d => d.is_announcement), [discussions]);

  const filtered = useMemo(() => {
    let result = [...discussions];

    if (category !== 'all') {
      result = result.filter((d) => d.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'popular':
        result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'replies':
        result.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    // Pinned always first
    result.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

    return result;
  }, [discussions, category, search, sort]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Forum de la Communauté
          </h1>
          <p className="text-cyan-50 text-lg">
            Posez vos questions, partagez vos connaissances et connectez-vous avec la communauté
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {user && <NewDiscussionDialog />}
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-slate-400" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Announcement Banner */}
        {announcement && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
            <Megaphone className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-100 flex-1">{announcement.announcement_text || announcement.title}</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Aucun sujet trouvé</p>
            </div>
          ) : (
            filtered.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}