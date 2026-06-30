import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Video, FileText, MapPin, Hash, Send, Loader2,
  Globe, Lock, BarChart3, Link as LinkIcon, Smile, X, Plus
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'general',   label: '💬 Général' },
  { id: 'partages',  label: '📸 Partages' },
  { id: 'technique', label: '🔧 Technique' },
  { id: 'aide',      label: '🙏 Aide' },
  { id: 'autres',    label: '🗂 Autres' },
];

const QUICK_ACTIONS = [
  { icon: Image,    label: 'Photo',   color: 'hover:text-sky-400' },
  { icon: Video,    label: 'Vidéo',   color: 'hover:text-violet-400' },
  { icon: BarChart3,label: 'Sondage', color: 'hover:text-amber-400' },
  { icon: MapPin,   label: 'Lieu',    color: 'hover:text-rose-400' },
  { icon: LinkIcon, label: 'Lien',    color: 'hover:text-cyan-400' },
];

export default function HomeCreatePost({ user, onPost }) {
  const [text, setText]         = useState('');
  const [posting, setPosting]   = useState(false);
  const [category, setCategory] = useState('general');
  const [expanded, setExpanded] = useState(false);
  const [audience, setAudience] = useState('public');
  const textareaRef = useRef(null);
  const MAX = 2000;

  const avatarInitial = (user?.display_name || user?.full_name || 'U')[0]?.toUpperCase();

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
      setExpanded(false);
      toast.success('Publication partagée !');
      onPost?.();
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div layout className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Category tabs (when expanded) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 px-5 pt-4 pb-0 overflow-x-auto scrollbar-hide"
          >
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-inter font-medium transition-all ${
                  category === c.id
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10'
                }`}
                style={category === c.id ? {
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                  boxShadow: '0 0 12px hsl(var(--primary) / 0.35)',
                } : {}}
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="p-4 flex gap-3.5">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden border border-primary/20"
          style={{ background: 'hsl(var(--primary) / 0.12)', boxShadow: '0 0 16px hsl(var(--primary) / 0.15)' }}
        >
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
              </div>
          }
        </div>

        {/* Input */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { if (e.target.value.length <= MAX) setText(e.target.value); }}
            onFocus={() => setExpanded(true)}
            placeholder={expanded ? "Quoi de neuf ? Partagez quelque chose avec la communauté…" : "Quoi de neuf ?"}
            rows={expanded ? 4 : 2}
            className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 pt-3 border-t border-white/8">
          {/* Quick actions */}
          <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
            {QUICK_ACTIONS.map(({ icon: Icon, label, color }) => (
              <button key={label} title={label}
                className={`flex items-center gap-1.5 p-2 rounded-xl text-muted-foreground/70 transition-all text-xs ${color} hover:bg-white/8`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline font-inter text-[11px]">{label}</span>
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {text.length > 0 && (
              <span className={`font-mono text-xs tabular-nums ${MAX - text.length < 100 ? 'text-rose-400' : 'text-muted-foreground/50'}`}>
                {MAX - text.length}
              </span>
            )}

            <button
              onClick={() => setAudience(a => a === 'public' ? 'community' : 'public')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-inter text-muted-foreground hover:text-foreground border border-white/8 hover:bg-white/8 transition-all"
            >
              {audience === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{audience === 'public' ? 'Public' : 'Communauté'}</span>
            </button>

            <button
              onClick={handlePost}
              disabled={!text.trim() || posting}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-inter font-semibold text-primary-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{
                background: text.trim() ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)' : 'rgba(255,255,255,0.08)',
                boxShadow: text.trim() ? '0 0 20px hsl(var(--primary) / 0.4)' : 'none',
              }}
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Publier</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}