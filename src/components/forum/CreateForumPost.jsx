import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

const CreateForumPost = ({ topicId, currentRepliesCount = 0, onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const response = await base44.entities.ForumPost.create({
          topic_id: topicId,
          content,
          author: user.id,
          author_name: user.full_name || user.name,
          author_email: user.email,
          is_solution: false,
          likes_count: 0,
          liked_by: [],
        edited: false,
        created_at: now,
        updated_at: now,
      });

      // Update topic replies count
      await base44.entities.ForumTopic.update(topicId, {
        replies_count: (currentRepliesCount || 0) + 1,
        last_reply_at: now,
      });

      return response;
    },
    onSuccess: (data) => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      if (onSuccess) onSuccess(data);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md border border-cyan-500/15 rounded-2xl space-y-4">
      <div className="flex gap-3 items-start">
        <Avatar className="w-11 h-11 flex-shrink-0 border border-cyan-500/20">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold text-sm">
            {(user?.full_name || user?.name)?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-grotesk font-semibold text-white">{user?.full_name || user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrivez votre réponse..."
        rows={4}
        className="resize-none bg-slate-700/30 border-cyan-500/20 text-white placeholder:text-slate-500 focus:border-cyan-400/50 font-inter"
        disabled={createMutation.isPending}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setContent('')}
          disabled={createMutation.isPending || !content.trim()}
          className="text-slate-400 border-slate-600 hover:bg-slate-700/50 font-inter"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || !content.trim()}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2 font-grotesk"
        >
          <Send size={16} />
          {createMutation.isPending ? 'Publication...' : 'Publier'}
        </Button>
      </div>
    </form>
  );
};

export default CreateForumPost;