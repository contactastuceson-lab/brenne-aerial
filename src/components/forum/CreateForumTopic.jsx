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
      const username = user.username || user.email.split('@')[0];
      const response = await base44.entities.ForumTopic.create({
        title,
        content,
        category,
        author: user.id,
        author_name: user.full_name || user.name,
        author_username: username,
        author_email: user.email,
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
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white gap-2">
          <MessageSquare size={18} />
          Nouveau sujet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Créer un nouveau sujet</DialogTitle>
          <DialogDescription className="text-slate-400">
            Posez une question ou lancez une discussion avec la communauté
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Titre du sujet *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quel est votre sujet ?"
              className="text-base bg-slate-700/50 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
              required
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Détails *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre sujet en détail..."
              rows={6}
              className="text-base resize-none bg-slate-700/50 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Catégorie *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-white focus:border-cyan-400/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-cyan-500/30">
                <SelectItem value="general" className="text-white focus:bg-slate-700">Général</SelectItem>
                <SelectItem value="technique" className="text-white focus:bg-slate-700">Technique</SelectItem>
                <SelectItem value="aide" className="text-white focus:bg-slate-700">Aide</SelectItem>
                <SelectItem value="partages" className="text-white focus:bg-slate-700">Partages</SelectItem>
                <SelectItem value="autres" className="text-white focus:bg-slate-700">Autres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Saisissez un tag et appuyez sur Entrée..."
              className="text-base bg-slate-700/50 border-cyan-500/30 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
            />
            {tagList.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {tagList.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-sm font-semibold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-cyan-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submissionError && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/40 text-red-300 text-sm backdrop-blur-sm">
              {submissionError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
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