import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';
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
      const response = await base44Client.records.create({
        table: 'ForumPost',
        data: {
          topic_id: topicId,
          content,
          author: user.id,
          is_solution: false,
          likes_count: 0,
          liked_by: [],
          edited: false,
          created_at: now,
          updated_at: now,
        },
      });

      // Update topic replies count
      await base44Client.records.update({
        table: 'ForumTopic',
        id: topicId,
        data: {
          replies_count: (currentRepliesCount || 0) + 1,
          last_reply_at: now,
        },
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
    <form onSubmit={handleSubmit} className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrivez votre réponse...(markdown supporté)"
        rows={4}
        className="resize-none"
        disabled={createMutation.isPending}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createMutation.isPending || !content.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
        >
          <Send size={16} />
          {createMutation.isPending ? 'Publication...' : 'Publier la réponse'}
        </Button>
      </div>
    </form>
  );
};

export default CreateForumPost;
