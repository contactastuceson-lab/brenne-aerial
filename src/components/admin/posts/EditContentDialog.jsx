import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, X, Loader2, Check, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { extractHashtags } from '@/lib/hashtags';

export default function EditContentDialog({ open, onClose, post }) {
  const qc = useQueryClient();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (open) setContent(post?.content || '');
  }, [open, post]);

  const updatePost = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
      toast.success('✓ Contenu modifié');
      onClose();
    },
    onError: () => toast.error('Erreur lors de la modification'),
  });

  const handleSave = () => {
    if (!content.trim()) return;
    const hashtags = extractHashtags(content);
    updatePost.mutate({ id: post.id, data: { content, hashtags } });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #38aadc, #0ea5e9, #818cf8)' }} />

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-grotesk font-bold text-base">Modifier le contenu</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">#{String(post?.id || '').slice(-6)}</p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                autoFocus
                rows={6}
                placeholder="Contenu du post…"
                className="w-full bg-secondary/40 border border-border rounded-xl px-3.5 py-3 text-sm text-foreground resize-none outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50 leading-relaxed"
              />

              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {extractHashtags(content).length} hashtag(s) détecté(s)
                </span>
                <span className={content.length > 280 ? 'text-amber-400' : ''}>{content.length} caractères</span>
              </div>

              <div className="flex gap-2.5 mt-4">
                <button onClick={onClose}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary/60 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={updatePost.isPending || !content.trim()}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {updatePost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}