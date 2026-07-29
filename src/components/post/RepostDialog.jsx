import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat2, Quote, Loader2, X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RepostDialog({ open, onClose, post, currentUser }) {
  const [mode, setMode] = useState(null);
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!post) return null;

  const handleRepost = async () => {
    if (!currentUser) { toast.error('Connectez-vous'); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createRepost', { originalPostId: post.id, mode: 'repost' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Reposté !');
      setMode(null);
      onClose();
    } catch {
      toast.error('Erreur lors du repost');
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = async () => {
    if (!quote.trim()) { toast.error('Ajoutez un commentaire'); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createRepost', { originalPostId: post.id, mode: 'quote', quoteContent: quote.trim() });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Citation publiée !');
      setQuote('');
      setMode(null);
      onClose();
    } catch {
      toast.error('Erreur lors de la citation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
            {!mode ? (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-grotesk font-bold text-base">Republier</h3>
                  <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-3 space-y-1">
                  <button onClick={() => setMode('repost')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-400/10 transition-colors text-left">
                    <Repeat2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-grotesk font-semibold text-sm">Reposter</p>
                      <p className="font-inter text-xs text-muted-foreground">Partager à vos abonnés sans commentaire</p>
                    </div>
                  </button>
                  <button onClick={() => setMode('quote')}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 transition-colors text-left">
                    <Quote className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-grotesk font-semibold text-sm">Citer avec un commentaire</p>
                      <p className="font-inter text-xs text-muted-foreground">Ajouter votre point de vue</p>
                    </div>
                  </button>
                </div>
              </>
            ) : mode === 'repost' ? (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-grotesk font-bold text-base flex items-center gap-2"><Repeat2 className="w-4 h-4 text-emerald-400" /> Reposter</h3>
                  <button onClick={() => setMode(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5">
                  <div className="rounded-xl border border-border bg-secondary/30 p-3 mb-4 max-h-40 overflow-hidden">
                    <p className="font-inter text-xs text-muted-foreground mb-1">@{post.author_username}</p>
                    <p className="font-inter text-sm text-foreground/80 line-clamp-3">{post.content}</p>
                  </div>
                  <button onClick={handleRepost} disabled={loading}
                    className="w-full py-2.5 rounded-full bg-emerald-500 text-white font-grotesk font-bold text-sm hover:bg-emerald-500/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat2 className="w-4 h-4" />} Reposter
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-grotesk font-bold text-base flex items-center gap-2"><Quote className="w-4 h-4 text-primary" /> Citer ce post</h3>
                  <button onClick={() => setMode(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5">
                  <textarea
                    value={quote}
                    onChange={e => setQuote(e.target.value.slice(0, 280))}
                    autoFocus
                    placeholder="Ajoutez votre commentaire…"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 min-h-[80px] leading-relaxed mb-3"
                  />
                  <div className="rounded-xl border border-border bg-secondary/30 p-3 mb-4 max-h-32 overflow-hidden">
                    <p className="font-inter text-xs text-muted-foreground mb-1">@{post.author_username}</p>
                    <p className="font-inter text-sm text-foreground/80 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setMode(null)} className="flex-1 py-2.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:bg-white/6">Retour</button>
                    <button onClick={handleQuote} disabled={loading || !quote.trim()}
                      className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publier
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}