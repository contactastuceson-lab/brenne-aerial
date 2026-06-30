import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, FileText, MapPin, Smile, X, Send, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const POST_TYPES = [
  { id: 'photo',    icon: Image,    label: 'Photo',     color: 'text-blue-400',   bg: 'hover:bg-blue-400/10' },
  { id: 'video',    icon: Video,    label: 'Vidéo',     color: 'text-purple-400', bg: 'hover:bg-purple-400/10' },
  { id: 'article',  icon: FileText, label: 'Article',   color: 'text-green-400',  bg: 'hover:bg-green-400/10' },
  { id: 'location', icon: MapPin,   label: 'Lieu',      color: 'text-rose-400',   bg: 'hover:bg-rose-400/10' },
];

export default function CreatePostCard({ user }) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Discussion.create({
        title: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
        content: text,
        category: 'general',
        author_id: user.id,
        author_name: user.full_name,
        author_display_name: user.display_name || user.full_name,
        author_username: user.username,
        author_avatar: user.avatar_url,
      });
      setText('');
      setFocused(false);
      toast.success('Publication partagée !');
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setPosting(false);
    }
  };

  const avatarInitial = (user?.display_name || user?.full_name || 'U')[0]?.toUpperCase();

  return (
    <motion.div
      layout
      className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
      style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.15)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
            }
          </div>

          {/* Input area */}
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Quoi de neuf ? Partagez avec la communauté…"
              rows={focused ? 4 : 1}
              className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="px-4 pb-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <div className="flex items-center gap-1">
          {POST_TYPES.map(({ id, icon: Icon, label, color, bg }) => (
            <button
              key={id}
              title={label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-inter transition-colors ${color} ${bg} text-muted-foreground`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`hidden sm:inline ${color}`}>{label}</span>
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-inter transition-colors text-muted-foreground hover:bg-amber-400/10 hover:text-amber-400">
            <Hash className="w-4 h-4" />
            <span className="hidden sm:inline">Tag</span>
          </button>
        </div>

        <Button
          onClick={handlePost}
          disabled={!text.trim() || posting}
          size="sm"
          className="bg-primary text-primary-foreground gap-2 rounded-xl font-inter font-medium"
        >
          {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publier
        </Button>
      </div>
    </motion.div>
  );
}