import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

const ForumFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters,
}) => {
  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'general', label: 'General' },
    { value: 'techniques', label: 'Techniques' },
    { value: 'projets', label: 'Projets' },
    { value: 'services', label: 'Services' },
    { value: 'formation', label: 'Formation' },
    { value: 'actualites', label: 'Actualités' },
    { value: 'support', label: 'Support' },
  ];

  const sorts = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'popular', label: 'Plus populaires' },
    { value: 'most-replies', label: 'Plus de réponses' },
    { value: 'unanswered', label: 'Sans réponse' },
  ];

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'recent';

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={18} className="text-blue-400" />
        <h3 className="font-bold text-white">Filtrer et Rechercher</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Rechercher
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Chercher un sujet..."
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Catégorie
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-white focus:bg-slate-600">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tri */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Trier par
          </label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {sorts.map((sort) => (
                <SelectItem key={sort.value} value={sort.value} className="text-white focus:bg-slate-600">
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bouton Clear */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-blue-400 hover:text-blue-300 hover:bg-slate-700 gap-2"
          >
            <X size={16} />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default ForumFilters;
