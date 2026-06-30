import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, FileText, MapPin, Hash, Send, Loader2, Globe, Lock, ChevronDown, Smile, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const POST_TYPES = [
  { id: 'photo',    icon: Image,    label: 'Photo',     color: 'text-blue-400',   hover: 'hover:bg-blue-400/10 hover:text-blue-400' },
  { id: 'video',    icon: Video,    label: 'Vidéo',     color: 'text-purple-400', hover: 'hover:bg-purple-400/10 hover:text-purple-400' },
  { id: 'article',  icon: FileText, label: 'Article',   color: 'text-emerald-400',hover: 'hover:bg-emerald-400/10 hover:text-emerald-400' },
  { id: 'location', icon: MapPin,   label: 'Lieu',      color: 'text-rose-400',   hover: 'hover:bg-rose-400/10 hover:text-rose-400' },
  { id: 'link',     icon: LinkIcon, label: 'Lien',      color: 'text-cyan-400',   hover: 'hover:bg-cyan-400/10 hover:text-cyan-400' },
  { id: 'poll',     icon: BarChart3,label: 'Sondage',   color: 'text-amber-400',  hover: 'hover:bg-amber-400/10 hover:text-amber-400' },
];

const AUDIENCE = [
  { id: 'public',    icon: Globe, label: 'Public' },
  { id: 'community', icon: Lock,  label: 'Communauté' },
];

const CATEGORIES = [
  { id: 'general',   label: '💬 Général' },
  { id: 'partages',  label: '📸 Partages' },
  { id: 'technique', label: '🔧 Technique' },
  { id: 'aide',      label: '🙏 Aide' },
  { id: 'autres',    label: '🗂 Autres' },
];

export default function CreatePostCard({ user }) {
  const [text, setText]           = useState('');
  const [posting, setPosting]     = useState(false);
  const [audience, setAudience]   = useState('public');
  const [category, setCategory]   = useState('general');
  const [expanded, setExpanded]   = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const MAX_CHARS = 2000;
  const remaining = MAX_CHARS - charCount;

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setText(val);
    setCharCount(val.length);
  };

  const handleFocus = () => setExpanded(true);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Discussion.create({
        title: text.split('\n')[0].slice(0, 120) || text.slice(0, 120),
        content: text,
        category,
        author_id: user.id,
        author_name: user.full_name,
        author_display_name: user.display_name || user.full_name,
        author_username: user.username,
        author_avatar: user.avatar_url,
        author_is_supreme: user.verifications?.includes('supreme') || false,
        author_verifications: user.verifications || [],
      });
      setText('');
      setCharCount(0);
      setExpanded(false);
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
      className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md overflow-hidden"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.04) inset' }}
    >
      {/* Category tabs — visible when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-border/40 overflow-x-auto scrollbar-hide"
          >
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-inter font-medium transition-all ${
                  category === c.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input */}
      <div className="p-4 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Quoi de neuf ? Partagez avec la communauté…"
            rows={expanded ? 4 : 2}
            className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-2 border-t border-border/40 pt-3">
        {/* Media buttons */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
          {POST_TYPES.map(({ id, icon: Icon, label, hover }) => (
            <button
              key={id}
              title={label}
              className={`flex items-center gap-1 p-2 rounded-lg text-muted-foreground transition-all text-xs font-inter ${hover}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right side: char count + audience + post */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {charCount > 0 && (
            <span className={`font-mono text-xs tabular-nums ${remaining < 100 ? 'text-rose-400' : 'text-muted-foreground'}`}>
              {remaining}
            </span>
          )}

          <button
            onClick={() => setAudience(a => a === 'public' ? 'community' : 'public')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-inter text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors border border-border/50"
          >
            {audience === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{audience === 'public' ? 'Public' : 'Communauté'}</span>
          </button>

          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-inter font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: text.trim() ? '0 0 16px rgba(var(--primary),0.3)' : 'none' }}
          >
            {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Publier</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}