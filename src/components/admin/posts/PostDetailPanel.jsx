import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  X, Pin, Star, Megaphone, Eye, EyeOff, Check, ExternalLink, Trash2,
  Heart, MessageCircle, Repeat2, Copy, Pencil, Link2, Loader2, AlertTriangle,
  Calendar, Hash, AtSign, ImageIcon, Zap, Shield, Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EditContentDialog from './EditContentDialog';

const VISIBILITY_META = {
  public: { label: 'Public', cls: 'text-green-400 bg-green-400/10 border-green-400/20', dot: 'bg-green-400' },
  followers: { label: 'Abonnés', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  certified: { label: 'Certifiés', cls: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  eza_circle: { label: 'Cercle EZA', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `il y a ${days}j`;
  return format(new Date(iso), 'd MMM yyyy', { locale: fr });
}

export default function PostDetailPanel({ post, onClose }) {
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const updatePost = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: (_, { id, data }) => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
      toast.success('✓ Post mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deletePost = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
      toast.success('✓ Post supprimé');
      onClose();
    },
  });

  const toggleFlag = (field) => {
    updatePost.mutate({ id: post.id, data: { [field]: !post[field] } });
  };

  const changeVisibility = (vis) => {
    updatePost.mutate({ id: post.id, data: { visibility: vis } });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Lien copié'));
  };

  const vMeta = VISIBILITY_META[post.visibility] || VISIBILITY_META.public;

  const stats = [
    { icon: Heart, label: 'Likes', value: post.likes_count || 0, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { icon: MessageCircle, label: 'Réponses', value: post.replies_count || 0, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Repeat2, label: 'Reposts', value: (post.reposts_count || 0) + (post.quotes_count || 0), color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: Eye, label: 'Vues', value: post.views_count || 0, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="fixed md:relative inset-0 z-50 md:z-auto flex flex-col w-full md:w-1/2 min-w-0 bg-background border-l border-border">
      <div className="md:hidden absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex flex-col h-full min-w-0 bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card flex-shrink-0">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #38aadc, #0ea5e9, #818cf8)' }} />
          <div className="p-3 md:p-4">
            <div className="flex items-center gap-2.5">
              <button onClick={onClose}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border flex-shrink-0 hover:bg-secondary/80">
                <X className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {(post.author_name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-grotesk font-bold truncate">{post.author_name || 'Anonyme'}</h1>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[10px] text-muted-foreground">
                  {post.author_username && <span>@{post.author_username}</span>}
                  <span>· {timeAgo(post.created_date)}</span>
                  <span className="font-mono px-1.5 py-0.5 rounded border border-border bg-secondary">#{String(post.id).slice(-6)}</span>
                </div>
              </div>
              <button onClick={onClose}
                className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-3 md:p-4 space-y-3">
          {/* Content */}
          {post.content ? (
            <div className="rounded-xl bg-secondary/30 border border-border p-3.5 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">Contenu</p>
                <button onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">{post.content}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-secondary/30 border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground italic">Aucun contenu textuel</p>
            </div>
          )}

          {/* Media */}
          {post.media_urls?.length > 0 && (
            <div className="rounded-xl bg-secondary/30 border border-border p-3.5 min-w-0">
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" /> Médias ({post.media_urls.length})
              </p>
              <div className="grid grid-cols-2 gap-2">
                {post.media_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="block rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors group relative">
                    <img src={url} alt="" className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {(post.hashtags?.length > 0 || post.mentions?.length > 0) && (
            <div className="rounded-xl bg-secondary/30 border border-border p-3.5 min-w-0 space-y-2">
              {post.hashtags?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Hash className="w-3 h-3 text-muted-foreground/60" />
                  {post.hashtags.map((h, i) => (
                    <span key={i} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">#{h}</span>
                  ))}
                </div>
              )}
              {post.mentions?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <AtSign className="w-3 h-3 text-muted-foreground/60" />
                  {post.mentions.map((m, i) => (
                    <span key={i} className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded font-medium">@{m}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {stats.map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="rounded-xl bg-secondary/30 border border-border p-2.5 text-center">
                  <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
                    <SIcon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                  <p className="text-sm font-bold font-mono">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="rounded-xl bg-secondary/30 border border-border p-3.5 min-w-0">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2.5">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => toggleFlag('is_pinned')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${post.is_pinned ? 'bg-amber-400/15 border-amber-400/30 text-amber-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80'}`}>
                <Pin className="w-3.5 h-3.5" /> {post.is_pinned ? 'Épinglé' : 'Épingler'}
              </button>
              <button onClick={() => toggleFlag('is_highlight')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${post.is_highlight ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80'}`}>
                <Star className="w-3.5 h-3.5" /> {post.is_highlight ? 'À la une' : 'Mettre à la une'}
              </button>
              <button onClick={() => toggleFlag('is_sponsored')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${post.is_sponsored ? 'bg-orange-400/15 border-orange-400/30 text-orange-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80'}`}>
                <Megaphone className="w-3.5 h-3.5" /> {post.is_sponsored ? 'Sponsorisé' : 'Sponsoriser'}
              </button>
              <button onClick={() => toggleFlag('is_draft')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${post.is_draft ? 'bg-muted/30 border-border text-muted-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80'}`}>
                {post.is_draft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {post.is_draft ? 'Brouillon' : 'Masquer (draft)'}
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div className="rounded-xl bg-secondary/30 border border-border p-3.5 min-w-0">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Visibilité
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(VISIBILITY_META).map(([k, m]) => (
                <button key={k} onClick={() => changeVisibility(k)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${post.visibility === k ? `${m.cls} border` : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                  {m.label}
                  {post.visibility === k && <Check className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="rounded-xl bg-secondary/30 border border-border p-3.5 min-w-0 space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">Métadonnées</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Créé le {post.created_date ? format(new Date(post.created_date), 'd MMM yyyy à HH:mm', { locale: fr }) : '—'}</span>
            </div>
            {post.reply_to_id && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <MessageCircle className="w-3 h-3" />
                <span>Réponse au post <span className="font-mono">#{String(post.reply_to_id).slice(-6)}</span></span>
              </div>
            )}
            {post.community_id && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span>Post communautaire</span>
              </div>
            )}
            {post.scheduled_at && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Programmé pour {format(new Date(post.scheduled_at), 'd MMM yyyy à HH:mm', { locale: fr })}</span>
              </div>
            )}
          </div>

          {/* External links */}
          <div className="grid grid-cols-2 gap-2">
            <a href={`/post/${post.id}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold">
              <ExternalLink className="w-3.5 h-3.5" /> Voir en ligne
            </a>
            <button onClick={copyLink}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-xs font-semibold">
              <Link2 className="w-3.5 h-3.5" /> Copier le lien
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="border-t border-border bg-card p-2.5 flex-shrink-0">
          <button onClick={() => setShowDelete(true)}
            disabled={deletePost.isPending}
            className="w-full h-9 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 border border-destructive/20 hover:border-destructive/40">
            {deletePost.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Supprimer le post
          </button>
        </div>
      </div>

      <DeleteConfirmDialog open={showDelete} onClose={() => setShowDelete(false)}
        post={post} onConfirm={() => deletePost.mutate(post.id)} loading={deletePost.isPending} />
      <EditContentDialog open={showEdit} onClose={() => setShowEdit(false)} post={post} />
    </div>
  );
}