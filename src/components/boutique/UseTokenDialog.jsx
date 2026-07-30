import { useState, useEffect } from 'react';
import { Loader2, Zap, Eye, Sparkles, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TOKEN_META = {
  boost: { label: 'Boost', desc: 'Mettre en avant un post dans le feed', icon: Zap, color: 'text-orange-400' },
  pin_24h: { label: 'Épingler 24h', desc: 'Post épinglé en haut 24 heures', icon: Eye, color: 'text-sky-400' },
  pin_7d: { label: 'Épingler 7j', desc: 'Post épinglé en haut 7 jours', icon: Eye, color: 'text-indigo-400' },
};

export default function UseTokenDialog({ open, onClose, tokenType, count, onUsed }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const me = await base44.auth.me();
        const myPosts = await base44.entities.Post.filter(
          { author_id: me.id, is_draft: false },
          '-created_date',
          50
        );
        setPosts(myPosts || []);
      } catch { toast.error('Erreur lors du chargement des posts'); }
      setLoading(false);
    })();
  }, [open]);

  const apply = async () => {
    if (!selected) return;
    setApplying(true);
    try {
      const res = await base44.functions.invoke('useRewardToken', {
        tokenType,
        targetId: selected,
      });
      const data = res.data || res;
      if (data?.success) {
        toast.success(data.message || 'Token utilisé !');
        onUsed?.();
        onClose();
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(e?.message || 'Erreur lors de l\'utilisation');
    }
    setApplying(false);
  };

  const meta = TOKEN_META[tokenType];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-grotesk font-bold">
            <Icon className={`w-5 h-5 ${meta.color}`} />
            Utiliser un token — {meta.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="font-inter text-sm text-muted-foreground">
            {meta.desc}. Sélectionnez le post sur lequel appliquer cet avantage.
            <span className="ml-1 font-mono text-xs text-muted-foreground/60">({count} disponible{count > 1 ? 's' : ''})</span>
          </p>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground/50 text-sm">
              Aucun post publié. Publiez d'abord un post pour utiliser ce token.
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto space-y-2">
              {posts.map(p => {
                const isSel = selected === p.id;
                return (
                  <button key={p.id} onClick={() => setSelected(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSel ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30 bg-secondary/30'
                    }`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        isSel ? 'border-primary bg-primary' : 'border-border'
                      }`}>
                        {isSel && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm text-foreground line-clamp-2">
                          {p.content?.slice(0, 120) || 'Post sans texte'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-mono text-[10px] text-muted-foreground/50">
                            {p.likes_count || 0} likes · {p.replies_count || 0} réponses
                          </span>
                          {p.is_pinned && <span className="text-[10px] text-amber-400">📌 épinglé</span>}
                          {p.is_highlight && <span className="text-[10px] text-orange-400">⚡ boosté</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button onClick={apply} disabled={!selected || applying}
              className="flex-1 flex items-center gap-1.5">
              {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Appliquer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}