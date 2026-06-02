import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Eye, MessageSquare, AlertTriangle, Pin, Lock, Unlock, Star, StarOff, Megaphone, MegaphoneOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { value: 'general', label: 'Général' },
  { value: 'technique', label: 'Technique' },
  { value: 'aide', label: 'Aide' },
  { value: 'partages', label: 'Partages' },
  { value: 'autres', label: 'Autres' },
];

export default function AdminForum() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [selectedDiscussionForAnnouncement, setSelectedDiscussionForAnnouncement] = useState(null);

  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['admin-discussions'],
    queryFn: () => base44.entities.Discussion.list('-created_date', 200),
  });

  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['admin-replies'],
    queryFn: () => base44.entities.DiscussionReply.list('-created_date', 100),
  });

  const updateDiscussionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Discussion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discussions'] });
      toast.success('Discussion mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: (id) => base44.entities.Discussion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discussions'] });
      toast.success('Discussion supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscussionReply.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-replies'] });
      toast.success('Réponse supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const toggle = (discussion, field) => {
    updateDiscussionMutation.mutate({ id: discussion.id, data: { [field]: !discussion[field] } });
  };

  const handleSetAnnouncement = (discussion) => {
    setSelectedDiscussionForAnnouncement(discussion);
    setAnnouncementText(discussion.announcement_text || discussion.title);
    setAnnouncementDialogOpen(true);
  };

  const saveAnnouncement = () => {
    // Remove announcement from all others first
    discussions.filter(d => d.is_announcement && d.id !== selectedDiscussionForAnnouncement.id).forEach(d => {
      base44.entities.Discussion.update(d.id, { is_announcement: false, announcement_text: '' });
    });
    updateDiscussionMutation.mutate({
      id: selectedDiscussionForAnnouncement.id,
      data: { is_announcement: true, announcement_text: announcementText },
    });
    setAnnouncementDialogOpen(false);
  };

  const removeAnnouncement = (discussion) => {
    updateDiscussionMutation.mutate({ id: discussion.id, data: { is_announcement: false, announcement_text: '' } });
  };

  const filteredDiscussions = discussions.filter((d) => {
    const matchesSearch =
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort: pinned first, then official, then by date
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    if (a.is_official && !b.is_official) return -1;
    if (!a.is_official && b.is_official) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const activeAnnouncement = discussions.find(d => d.is_announcement);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion du Forum</h1>
        <p className="text-muted-foreground mt-1">Modérez les discussions et les réponses</p>
      </div>

      {/* Active announcement preview */}
      {activeAnnouncement && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Megaphone className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-400 font-medium mb-1">Annonce active</p>
                <p className="text-sm text-foreground">{activeAnnouncement.announcement_text || activeAnnouncement.title}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-destructive text-xs" onClick={() => removeAnnouncement(activeAnnouncement)}>
              Retirer
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="discussions" className="w-full">
        <TabsList>
          <TabsTrigger value="discussions">Discussions ({discussions.length})</TabsTrigger>
          <TabsTrigger value="replies">Réponses ({replies.length})</TabsTrigger>
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
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1"
              >
                <option value="all">Toutes les catégories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {discussionsLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : sortedDiscussions.length === 0 ? (
              <p className="text-muted-foreground">Aucune discussion</p>
            ) : (
              sortedDiscussions.map((discussion) => (
                <Card key={discussion.id} className={`${discussion.is_pinned ? 'border-cyan-500/30 bg-cyan-500/5' : discussion.is_official ? 'border-yellow-500/30 bg-yellow-500/5' : 'bg-card/50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {discussion.is_pinned && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded flex items-center gap-1"><Pin size={10} /> Épinglé</span>}
                          {discussion.is_official && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded flex items-center gap-1"><Star size={10} /> Officiel</span>}
                          {discussion.is_locked && <span className="text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded flex items-center gap-1"><Lock size={10} /> Verrouillé</span>}
                          {discussion.is_announcement && <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1"><Megaphone size={10} /> Annonce</span>}
                        </div>
                        <h3 className="font-semibold text-foreground">{discussion.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Par {discussion.author_display_name || discussion.author_name} • {discussion.category}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1"><MessageSquare size={12} />{discussion.replies_count || 0} réponse(s)</span>
                          <span className="flex items-center gap-1"><Eye size={12} />{discussion.views_count || 0} vue(s)</span>
                          <span>{formatDistanceToNow(new Date(discussion.created_date), { locale: fr, addSuffix: true })}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                        {/* Voir */}
                        <Link to={`/forum/${discussion.id}`} target="_blank">
                          <Button variant="ghost" size="sm" title="Voir la discussion">
                            <ExternalLink size={14} />
                          </Button>
                        </Link>

                        {/* Épingler */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title={discussion.is_pinned ? 'Désépingler' : 'Épingler'}
                          className={discussion.is_pinned ? 'text-cyan-400' : 'text-muted-foreground'}
                          onClick={() => toggle(discussion, 'is_pinned')}
                        >
                          <Pin size={14} />
                        </Button>

                        {/* Officiel */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title={discussion.is_official ? 'Retirer officiel' : 'Marquer officiel'}
                          className={discussion.is_official ? 'text-yellow-400' : 'text-muted-foreground'}
                          onClick={() => toggle(discussion, 'is_official')}
                        >
                          <Star size={14} />
                        </Button>

                        {/* Verrouiller */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title={discussion.is_locked ? 'Déverrouiller' : 'Verrouiller'}
                          className={discussion.is_locked ? 'text-red-400' : 'text-muted-foreground'}
                          onClick={() => toggle(discussion, 'is_locked')}
                        >
                          {discussion.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                        </Button>

                        {/* Annonce */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title={discussion.is_announcement ? "Retirer l'annonce" : 'Définir comme annonce'}
                          className={discussion.is_announcement ? 'text-amber-400' : 'text-muted-foreground'}
                          onClick={() => discussion.is_announcement ? removeAnnouncement(discussion) : handleSetAnnouncement(discussion)}
                        >
                          <Megaphone size={14} />
                        </Button>

                        {/* Supprimer */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                              <Trash2 size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle size={20} /> Supprimer la discussion
                              </DialogTitle>
                            </DialogHeader>
                            <p className="text-foreground">
                              Êtes-vous sûr de vouloir supprimer "<strong>{discussion.title}</strong>" ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline">Annuler</Button>
                              <Button variant="destructive" onClick={() => deleteDiscussionMutation.mutate(discussion.id)} disabled={deleteDiscussionMutation.isPending}>
                                Supprimer
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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
                .filter(r =>
                  r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  r.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((reply) => (
                  <Card key={reply.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{reply.author_display_name || reply.author_name}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{reply.content}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span>{reply.likes_count || 0} j'aime</span>
                            {reply.is_solution && <span className="text-green-500">✓ Solution marquée</span>}
                            <span>{formatDistanceToNow(new Date(reply.created_date), { locale: fr, addSuffix: true })}</span>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle size={20} /> Supprimer la réponse
                              </DialogTitle>
                            </DialogHeader>
                            <p className="text-foreground">Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.</p>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline">Annuler</Button>
                              <Button variant="destructive" onClick={() => deleteReplyMutation.mutate(reply.id)} disabled={deleteReplyMutation.isPending}>
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
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total discussions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{discussions.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total réponses</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{replies.length}</p></CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Vues totales</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{discussions.reduce((sum, d) => sum + (d.views_count || 0), 0)}</p></CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">J'aime totaux</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{replies.reduce((sum, r) => sum + (r.likes_count || 0), 0)}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Discussions par catégorie</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex justify-between items-center">
                    <span className="text-foreground">{cat.label}</span>
                    <span className="font-semibold">{discussions.filter(d => d.category === cat.value).length}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Announcement Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone size={18} className="text-amber-400" /> Définir une annonce
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Ce texte s'affichera en bannière sur la page du forum.</p>
          <Textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Texte de l'annonce..."
            className="min-h-20"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveAnnouncement} disabled={!announcementText.trim()}>
              Publier l'annonce
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}