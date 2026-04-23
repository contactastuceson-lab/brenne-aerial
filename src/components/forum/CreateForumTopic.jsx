import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageSquare, X } from 'lucide-react';

const CreateForumTopic = ({ onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [tagList, setTagList] = useState([]);
  const [submissionError, setSubmissionError] = useState(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      setSubmissionError(null);
      const now = new Date().toISOString();
      const response = await base44.entities.ForumTopic.create({
        title,
        content,
        category,
        author: user.id,
        tags: tagList,
        views_count: 0,
        replies_count: 0,
        is_pinned: false,
        is_locked: false,
        created_at: now,
        updated_at: now,
      });
      return response;
    },
    onSuccess: (data) => {
      setTitle('');
      setContent('');
      setCategory('general');
      setTags('');
      setTagList([]);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      console.error('Unable to create forum topic:', error);
      setSubmissionError(error?.message || 'Impossible de créer ce sujet pour le moment.');
    },
  });

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tags.trim()) {
      e.preventDefault();
      const newTag = tags.trim().toLowerCase();
      if (!tagList.includes(newTag)) {
        setTagList([...tagList, newTag]);
      }
      setTags('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTagList(tagList.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2">
          <MessageSquare size={18} />
          Nouveau sujet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Créer un nouveau sujet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Posez une question ou lancez une discussion avec la communauté
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Titre du sujet *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quel est votre sujet ?"
              className="text-base bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Détails *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre sujet en détail..."
              rows={6}
              className="text-base resize-none bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Catégorie *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="general" className="text-white focus:bg-slate-600">General</SelectItem>
                <SelectItem value="techniques" className="text-white focus:bg-slate-600">Techniques</SelectItem>
                <SelectItem value="projets" className="text-white focus:bg-slate-600">Projets</SelectItem>
                <SelectItem value="services" className="text-white focus:bg-slate-600">Services</SelectItem>
                <SelectItem value="formation" className="text-white focus:bg-slate-600">Formation</SelectItem>
                <SelectItem value="actualites" className="text-white focus:bg-slate-600">Actualités</SelectItem>
                <SelectItem value="support" className="text-white focus:bg-slate-600">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Saisissez un tag et appuyez sur Entrée..."
              className="text-base bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
            />
            {tagList.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {tagList.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm font-semibold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submissionError && (
            <div className="p-3 rounded-lg bg-red-900 border border-red-700 text-red-200 text-sm">
              {submissionError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createMutation.isPending ? 'Création...' : 'Créer le sujet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateForumTopic;
