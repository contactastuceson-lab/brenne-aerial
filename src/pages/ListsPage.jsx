import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/post/PostCard';
import ListDialog from '@/components/lists/ListDialog';
import { Plus, List as ListIcon, Lock, Globe, Trash2, Pencil, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ListsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });

  const { data: myLists = [], isLoading } = useQuery({
    queryKey: ['my-lists', user?.id],
    queryFn: () => base44.entities.UserList.filter({ owner_id: user.id }, '-created_date', 50),
    enabled: !!user?.id,
  });

  const activeList = myLists.find(l => l.id === activeId) || null;

  const { data: feedPosts = [], isLoading: feedLoading } = useQuery({
    queryKey: ['list-feed', activeList?.id],
    queryFn: async () => {
      if (!activeList?.member_ids?.length) return [];
      const all = await base44.entities.Post.list('-created_date', 200);
      return all.filter(p => !p.is_draft && !p.reply_to_id && !p.community_id && activeList.member_ids.includes(p.author_id));
    },
    enabled: !!activeList?.id,
  });

  const handleDelete = async (list) => {
    if (!confirm(`Supprimer la liste « ${list.name} » ?`)) return;
    try {
      await base44.entities.UserList.delete(list.id);
      if (activeId === list.id) setActiveId(null);
      qc.invalidateQueries({ queryKey: ['my-lists', user.id] });
      toast.success('Liste supprimée');
    } catch {
      toast.error('Erreur');
    }
  };

  if (!user) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-3 flex items-center gap-2">
        <ListIcon className="w-5 h-5 text-primary" />
        <h1 className="font-grotesk font-bold text-lg flex-1">Listes</h1>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
          <Plus className="w-3.5 h-3.5" /> Nouvelle
        </button>
      </div>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : myLists.length === 0 ? (
          <p className="font-inter text-sm text-muted-foreground">Aucune liste — créez votre premier flux thématique.</p>
        ) : (
          myLists.map(l => (
            <button key={l.id} onClick={() => setActiveId(l.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${activeId === l.id ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-white/5'}`}>
              {l.is_private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {l.name} <span className="font-mono opacity-60">{l.member_ids?.length || 0}</span>
            </button>
          ))
        )}
      </div>

      {activeList ? (
        <div>
          <div className="px-4 py-2 border-b border-border/40 flex items-center gap-2">
            <div className="flex-1">
              <p className="font-grotesk font-bold text-base">{activeList.name}</p>
              {activeList.description && <p className="font-inter text-xs text-muted-foreground">{activeList.description}</p>}
            </div>
            <button onClick={() => { setEditing(activeList); setDialogOpen(true); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => handleDelete(activeList)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
          {feedLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : feedPosts.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-grotesk font-bold text-base mb-1">Aucune publication</p>
              <p className="font-inter text-sm text-muted-foreground">Les posts des membres de cette liste apparaîtront ici.</p>
            </div>
          ) : (
            feedPosts.map(p => <PostCard key={p.id} post={p} currentUser={user} />)
          )}
        </div>
      ) : (
        <div className="py-16 text-center px-4">
          <ListIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-grotesk font-bold text-base mb-1">Sélectionnez une liste</p>
          <p className="font-inter text-sm text-muted-foreground">Créez des flux personnalisés d'utilisateurs sans avoir à les suivre officiellement.</p>
        </div>
      )}

      <ListDialog open={dialogOpen} onClose={() => setDialogOpen(false)} user={user} list={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ['my-lists', user.id] })} />
    </div>
  );
}