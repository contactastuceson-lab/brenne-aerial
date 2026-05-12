import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Lock, Unlock, Eye, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminForum() {
  const queryClient = useQueryClient();
  const [searchTopic, setSearchTopic] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Fetch topics
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['admin-forum-topics'],
    queryFn: async () => {
      const res = await base44.entities.ForumTopic.list('-created_date', 100);
      return res || [];
    },
  });

  // Fetch posts
  const { data: posts = [] } = useQuery({
    queryKey: ['admin-forum-posts'],
    queryFn: async () => {
      const res = await base44.entities.ForumPost.list('-created_date', 100);
      return res || [];
    },
  });

  // Fetch users
  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-forum-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAdminUsers', {});
      return res.data?.users || [];
    },
  });

  // Delete topic
  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId) => {
      await base44.entities.ForumTopic.delete(topicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-topics'] });
      toast.success('Discussion supprimée');
      setDeleteConfirm(null);
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async (postId) => {
      await base44.entities.ForumPost.delete(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
      toast.success('Message supprimé');
    },
  });

  // Lock/Unlock topic
  const toggleLockMutation = useMutation({
    mutationFn: async (topicId) => {
      const topic = topics.find(t => t.id === topicId);
      await base44.entities.ForumTopic.update(topicId, { is_locked: !topic.is_locked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-topics'] });
      toast.success('Statut mis à jour');
    },
  });

  // Pin/Unpin topic
  const togglePinMutation = useMutation({
    mutationFn: async (topicId) => {
      const topic = topics.find(t => t.id === topicId);
      await base44.entities.ForumTopic.update(topicId, { is_pinned: !topic.is_pinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-topics'] });
      toast.success('Statut mis à jour');
    },
  });

  // Fetch blocked users
  const { data: blockedUsersDb = [] } = useQuery({
    queryKey: ['admin-forum-blocked-users'],
    queryFn: async () => {
      try {
        const res = await base44.entities.Block.filter({ block_type: 'forum' });
        return res || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Block user
  const blockUserMutation = useMutation({
    mutationFn: async (userEmail) => {
      await base44.entities.Block.create({
        target_email: userEmail,
        block_type: 'forum',
        reason: 'Bloqué par modérateur forum',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-blocked-users'] });
      toast.success('Utilisateur bloqué');
    },
    onError: (error) => {
      toast.error('Erreur lors du blocage: ' + error.message);
    },
  });

  // Unblock user
  const unblockUserMutation = useMutation({
    mutationFn: async (userEmail) => {
      const block = blockedUsersDb.find(b => b.target_email === userEmail && b.block_type === 'forum');
      if (block) {
        await base44.entities.Block.delete(block.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-blocked-users'] });
      toast.success('Utilisateur débloqué');
    },
    onError: (error) => {
      toast.error('Erreur lors du déblocage: ' + error.message);
    },
  });

  const filteredTopics = topics.filter(t =>
    t.title?.toLowerCase().includes(searchTopic.toLowerCase()) ||
    t.author_name?.toLowerCase().includes(searchTopic.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    u.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Modération du Forum</h1>
        <p className="text-muted-foreground">Gérez les discussions, messages et utilisateurs du forum</p>
      </div>

      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">Discussions</TabsTrigger>
          <TabsTrigger value="posts">Messages</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Discussions Tab */}
        <TabsContent value="topics" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher une discussion..."
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {topicsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune discussion trouvée</div>
            ) : (
              filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:bg-card/80 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">{topic.title}</h3>
                          {topic.is_pinned && <Badge variant="secondary">Épinglée</Badge>}
                          {topic.is_locked && <Badge variant="destructive">Fermée</Badge>}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                          <span>Par: {topic.author_name}</span>
                          <span className="flex items-center gap-1"><Eye size={14} /> {topic.views_count || 0}</span>
                          <span className="flex items-center gap-1"><MessageSquare size={14} /> {topic.replies_count || 0}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{topic.content}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePinMutation.mutate(topic.id)}
                        >
                          {topic.is_pinned ? 'Désépingler' : 'Épingler'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleLockMutation.mutate(topic.id)}
                        >
                          {topic.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'topic', id: topic.id, title: topic.title })}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun message</div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:bg-card/80 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-2">{post.author_name}</p>
                        <p className="text-sm text-foreground line-clamp-3 mb-2">{post.content}</p>
                        {post.is_solution && <Badge className="bg-emerald-500/10 text-emerald-300">Solution</Badge>}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ type: 'post', id: post.id })}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé</div>
            ) : (
              filteredUsers.map((user) => {
                  const isBlocked = blockedUsersDb.some(b => b.target_email === user.email && b.block_type === 'forum');
                  const userPosts = posts.filter(p => p.author_email === user.email);
                  const userTopics = topics.filter(t => t.author_email === user.email);

                return (
                  <Card key={user.id} className={cn('transition-colors', isBlocked && 'opacity-60 bg-destructive/5')}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{user.full_name}</h3>
                            {isBlocked && <Badge variant="destructive">Bloqué</Badge>}
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                            <span>{user.email}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={14} /> {userPosts.length} messages</span>
                            <span className="flex items-center gap-1"><MessageSquare size={14} /> {userTopics.length} discussions</span>
                          </div>
                        </div>
                        <Button
                           variant={isBlocked ? 'secondary' : 'destructive'}
                           size="sm"
                           disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
                           onClick={() => {
                             if (isBlocked) {
                               unblockUserMutation.mutate(user.email);
                             } else {
                               blockUserMutation.mutate(user.email);
                             }
                           }}
                         >
                           {blockUserMutation.isPending || unblockUserMutation.isPending ? '...' : (isBlocked ? 'Débloquer' : 'Bloquer')}
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'topic'
                ? `Êtes-vous sûr de vouloir supprimer la discussion "${deleteConfirm?.title}" ? Cette action est irréversible.`
                : 'Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (deleteConfirm.type === 'topic') {
                deleteTopicMutation.mutate(deleteConfirm.id);
              } else {
                deletePostMutation.mutate(deleteConfirm.id);
              }
            }}
          >
            Supprimer
          </AlertDialogAction>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}