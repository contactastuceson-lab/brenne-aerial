import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ForumTopicList from './ForumTopicList';
import ForumTopicDetail from './ForumTopicDetail';
import { AlertCircle } from 'lucide-react';

const Forum = () => {
  const { user } = useAuth();
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Vérifier si l'utilisateur est bloqué du forum
  const { data: isBlocked = false } = useQuery({
    queryKey: ['userForumBlockStatus', user?.id],
    queryFn: async () => {
      if (!user?.email) return false;
      try {
        const blocks = await base44.entities.Block.filter({ target_email: user.email });
        return blocks && blocks.length > 0;
      } catch (err) {
        return false;
      }
    },
    enabled: !!user?.email,
  });

  if (isBlocked) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-destructive/20 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-destructive mb-2">Accès refusé</h2>
              <p className="text-destructive/80 text-sm">
                Vous avez été bloqué de l'accès au forum par les administrateurs. Si vous pensez qu'il y a une erreur, veuillez nous contacter.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTopicId) {
    return (
      <ForumTopicDetail
        topicId={selectedTopicId}
        onBack={() => setSelectedTopicId(null)}
      />
    );
  }

  return <ForumTopicList onSelectTopic={setSelectedTopicId} />;
};

export default Forum;