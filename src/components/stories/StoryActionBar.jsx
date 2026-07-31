import { useState, useEffect, useCallback } from 'react';
import { Heart, Send, Trash2, Eye, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { QUICK_REACTION_EMOJIS } from '@/lib/storyUtils';

export default function StoryActionBar({ story, group, currentUser, isOwn, onClose, onDeleted }) {
  const [reactions, setReactions] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(false);

  const load = useCallback(async () => {
    if (!story) return;
    try {
      const r = await base44.entities.StoryReaction.filter({ story_id: story.id });
      setReactions(r || []);
    } catch {}
  }, [story?.id]);

  useEffect(() => { load(); }, [load]);
  if (!story) return null;

  const likes = reactions.filter((r) => r.kind === 'like');
  const replies = reactions.filter((r) => r.kind === 'reply');
  const liked = likes.some((r) => r.author_id === currentUser?.id);
  const viewers = Array.isArray(story.viewers) ? story.viewers : [];

  const notifyOwner = (type, title, content) => {
    if (isOwn || !story.author_email) return;
    base44.entities.Notification.create({
      user_email: story.author_email, type, title, content,
      sender_id: currentUser?.id, sender_name: currentUser?.full_name,
      sender_avatar: currentUser?.avatar_url, sender_username: currentUser?.username,
      post_id: story.id,
    }).catch(() => {});
  };

  const react = async (emoji) => {
    if (!currentUser) { toast.error('Connectez-vous pour réagir'); return; }
    setSending(true);
    try {
      await base44.entities.StoryReaction.create({
        story_id: story.id, story_author_id: group?.author_id || '',
        author_id: currentUser.id, author_email: currentUser.email || '',
        author_name: currentUser.full_name || '', author_username: currentUser.username || '',
        author_avatar: currentUser.avatar_url || '', kind: 'reply', emoji, text: '',
      });
      notifyOwner('MENTION', 'Réaction à votre story', emoji);
      load();
    } catch { toast.error('Erreur'); }
    setSending(false);
  };

  const toggleLike = async () => {
    if (!currentUser) return;
    const mine = likes.find((r) => r.author_id === currentUser.id);
    try {
      if (mine) {
        await base44.entities.StoryReaction.delete(mine.id);
      } else {
        await base44.entities.StoryReaction.create({
          story_id: story.id, story_author_id: group?.author_id || '',
          author_id: currentUser.id, author_email: currentUser.email || '',
          author_name: currentUser.full_name || '', author_username: currentUser.username || '',
          author_avatar: currentUser.avatar_url || '', kind: 'like', emoji: '❤️', text: '',
        });
        notifyOwner('LIKE', "J'aime votre story", 'a aimé votre story');
      }
      load();
    } catch { toast.error('Erreur'); }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await base44.entities.StoryReaction.create({
        story_id: story.id, story_author_id: group?.author_id || '',
        author_id: currentUser.id, author_email: currentUser.email || '',
        author_name: currentUser.full_name || '', author_username: currentUser.username || '',
        author_avatar: currentUser.avatar_url || '', kind: 'reply', emoji: '', text: reply.trim(),
      });
      notifyOwner('MENTION', 'Réponse à votre story', reply.trim());
      setReply('');
      toast.success('Réponse envoyée');
      load();
    } catch { toast.error('Erreur'); }
    setSending(false);
  };

  const deleteStory = async () => {
    if (!confirm('Supprimer cette story ?')) return;
    try {
      await base44.entities.Story.delete(story.id);
      toast.success('Story supprimée');
      onDeleted?.();
    } catch { toast.error('Suppression échouée'); }
  };

  if (isOwn) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <div className="bg-gradient-to-t from-black/80 to-transparent pt-10 pb-4 px-4">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => setShowList((v) => !v)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Eye className="w-4 h-4 text-white" />
              <span className="font-grotesk font-bold text-sm text-white">{viewers.length}</span>
              <span className="font-inter text-xs text-white/70">vues</span>
            </button>
            <button onClick={() => setShowList((v) => !v)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="font-grotesk font-bold text-sm text-white">{replies.length}</span>
              <span className="font-inter text-xs text-white/70">réponses</span>
            </button>
            <div className="flex-1" />
            <button onClick={deleteStory} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors">
              <Trash2 className="w-4 h-4" /> <span className="font-grotesk font-bold text-xs">Supprimer</span>
            </button>
          </div>
          {showList && (
            <div className="mt-3 max-h-56 overflow-y-auto rounded-xl bg-black/60 border border-white/10 divide-y divide-white/10">
              {viewers.length === 0 && replies.length === 0 ? (
                <p className="px-3 py-3 font-inter text-xs text-white/50 text-center">Aucune interaction pour l'instant</p>
              ) : (
                <>
                  {viewers.map((v) => (
                    <div key={`v${v.id}`} className="flex items-center gap-2.5 px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                        {v.avatar ? <img src={v.avatar} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-grotesk font-bold text-[10px] text-white">{(v.name || v.username || '?')[0]}</span>}
                      </div>
                      <span className="font-inter text-xs text-white/90 truncate flex-1">{v.username || v.name || 'Utilisateur'}</span>
                      <span className="font-mono text-[9px] text-white/40">vu</span>
                    </div>
                  ))}
                  {replies.map((r) => (
                    <div key={`r${r.id}`} className="flex items-center gap-2.5 px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                        {r.author_avatar ? <img src={r.author_avatar} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-grotesk font-bold text-[10px] text-white">{(r.author_name || r.author_username || '?')[0]}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-inter text-xs text-white/90 truncate block">{r.author_username || r.author_name || 'Utilisateur'}</span>
                        {r.text && <span className="font-inter text-[11px] text-white/60 truncate block">{r.text}</span>}
                      </div>
                      {r.emoji && <span className="text-base">{r.emoji}</span>}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
      <div className="bg-gradient-to-t from-black/70 to-transparent pt-10 pb-3 px-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex gap-1 flex-1 overflow-x-auto no-scrollbar">
            {QUICK_REACTION_EMOJIS.map((e) => (
              <button key={e} onClick={() => react(e)} disabled={sending} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-all active:scale-90 flex-shrink-0">{e}</button>
            ))}
          </div>
          <button onClick={toggleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${liked ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {likes.length > 0 && <span className="font-grotesk font-bold text-sm">{likes.length}</span>}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
            placeholder={`Répondre à ${group?.author_username || group?.author_name || ''}…`}
            className="flex-1 h-10 rounded-full bg-white/10 border border-white/15 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
          />
          <button onClick={sendReply} disabled={sending || !reply.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-all active:scale-90">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}