import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Eye, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminForum() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Discussions
  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['admin-discussions'],
    queryFn: () => base44.entities.Discussion.list('-created_date', 100),
  });

  // Replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['admin-replies'],
    queryFn: () => base44.entities.DiscussionReply.list('-created_date', 100),
  });

  // Delete discussion
  const deleteDiscussionMutation = useMutation({
    mutationFn: (id) => base44.entities.Discussion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discussions'] });
      toast.success('Discussion supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  // Delete reply
  const deleteReplyMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscussionReply.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-replies'] });
      toast.success('Réponse supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const filteredDiscussions = discussions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CATEGORIES = [
    { value: 'general', label: 'Général' },
    { value: 'technique', label: 'Technique' },
    { value: 'aide', label: 'Aide' },
    { value: 'partages', label: 'Partages' },
    { value: 'autres', label: 'Autres' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion du Forum</h1>
        <p className="text-muted-foreground mt-1">Modérez les discussions et les réponses</p>
      </div>

      <Tabs defaultValue="discussions" className="w-full">
        <TabsList>
          <TabsTrigger value="discussions">
            Discussions ({discussions.length})
          </TabsTrigger>
          <TabsTrigger value="replies">
            Réponses ({replies.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Statistiques</TabsTrigger>
        </TabsList>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Rechercher</label>
              <Input
                placeholder="Par titre ou auteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Toutes les catégories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {discussionsLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : filteredDiscussions.length === 0 ? (
              <p className="text-muted-foreground">Aucune discussion</p>
            ) : (
              filteredDiscussions.map((discussion) => (
                <Card key={discussion.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {discussion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Par {discussion.author_name} • {discussion.category}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={14} />
                            {discussion.replies_count || 0} réponse(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {discussion.views_count || 0} vue(s)
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(discussion.created_date), {
                              locale: fr,
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                              <AlertTriangle size={20} />
                              Supprimer la discussion
                            </DialogTitle>
                          </DialogHeader>
                          <p className="text-foreground">
                            Êtes-vous sûr de vouloir supprimer "<strong>{discussion.title}</strong>" ?
                            Cette action est irréversible.
                          </p>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline">Annuler</Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                deleteDiscussionMutation.mutate(discussion.id);
                              }}
                              disabled={deleteDiscussionMutation.isPending}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Replies Tab */}
        <TabsContent value="replies" className="space-y-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">Rechercher</label>
            <Input
              placeholder="Par contenu ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            {repliesLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : replies.length === 0 ? (
              <p className="text-muted-foreground">Aucune réponse</p>
            ) : (
              replies
                .filter(
                  (r) =>
                    r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.author_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((reply) => (
                  <Card key={reply.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{reply.author_name}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {reply.content}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span>{reply.likes_count || 0} j'aime</span>
                            {reply.is_solution && (
                              <span className="text-green-500">✓ Solution marquée</span>
                            )}
                            <span>
                              {formatDistanceToNow(new Date(reply.created_date), {
                                locale: fr,
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle size={20} />
                                Supprimer la réponse
                              </DialogTitle>
                            </DialogHeader>
                            <p className="text-foreground">
                              Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est
                              irréversible.
                            </p>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline">Annuler</Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  deleteReplyMutation.mutate(reply.id);
                                }}
                                disabled={deleteReplyMutation.isPending}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{discussions.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total réponses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{replies.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {discussions.reduce((sum, d) => sum + (d.views_count || 0), 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">J'aime totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {replies.reduce((sum, r) => sum + (r.likes_count || 0), 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Discussions par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex justify-between items-center">
                    <span className="text-foreground">{cat.label}</span>
                    <span className="font-semibold">
                      {discussions.filter((d) => d.category === cat.value).length}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}