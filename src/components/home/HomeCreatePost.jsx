import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Video, BarChart3, MapPin, Link as LinkIcon,
  Send, Loader2, Globe, Lock, X, Plus, Trash2,
  MessageSquare, Wrench, HelpCircle, Grid3x3
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { extractHashtags } from '@/lib/hashtags';
import { isActionBlocked, RESTRICTED_TOAST } from '@/lib/accountStatus';

const CATEGORIES = [
  { id: 'general',   label: 'Général',   icon: MessageSquare },
  { id: 'partages',  label: 'Partages',  icon: Image },
  { id: 'technique', label: 'Technique', icon: Wrench },
  { id: 'aide',      label: 'Aide',      icon: HelpCircle },
  { id: 'autres',    label: 'Autres',    icon: Grid3x3 },
];

// ── Sub-panels ──────────────────────────────────────────────────────────────

function PhotoPanel({ photos, setPhotos }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).slice(0, 4 - photos.length).map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return file_url;
        })
      );
      setPhotos(prev => [...prev, ...urls]);
    } catch {
      toast.error('Erreur lors du chargement des photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-5 pb-3">
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {photos.length < 4 && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span className="text-[10px] font-inter">Ajouter</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

function VideoPanel({ videoUrl, setVideoUrl }) {
  return (
    <div className="px-5 pb-3">
      <input
        type="url"
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
        placeholder="URL YouTube, Vimeo, ou lien direct…"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
      />
      {videoUrl && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Video className="w-3.5 h-3.5 text-violet-400" />
          <span className="truncate">{videoUrl}</span>
          <button onClick={() => setVideoUrl('')}><X className="w-3 h-3 hover:text-foreground" /></button>
        </div>
      )}
    </div>
  );
}

function PollPanel({ pollOptions, setPollOptions }) {
  const addOption = () => {
    if (pollOptions.length < 5) setPollOptions(p => [...p, '']);
  };
  const updateOption = (i, val) => setPollOptions(p => p.map((o, j) => j === i ? val : o));
  const removeOption = (i) => setPollOptions(p => p.filter((_, j) => j !== i));

  return (
    <div className="px-5 pb-3 space-y-2">
      <p className="text-xs font-inter text-muted-foreground mb-2">Options du sondage</p>
      {pollOptions.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-muted-foreground font-mono">{i + 1}</span>
          </div>
          <input
            type="text"
            value={opt}
            onChange={e => updateOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            maxLength={80}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          />
          {pollOptions.length > 2 && (
            <button onClick={() => removeOption(i)} className="text-muted-foreground hover:text-rose-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      {pollOptions.length < 5 && (
        <button onClick={addOption} className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors mt-1">
          <Plus className="w-3.5 h-3.5" /> Ajouter une option
        </button>
      )}
    </div>
  );
}

function LocationPanel({ location, setLocation }) {
  return (
    <div className="px-5 pb-3">
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="Ville, adresse ou lieu…"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
      />
      {location && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
          <MapPin className="w-3 h-3" /> {location}
        </div>
      )}
    </div>
  );
}

function LinkPanel({ linkUrl, setLinkUrl }) {
  return (
    <div className="px-5 pb-3">
      <input
        type="url"
        value={linkUrl}
        onChange={e => setLinkUrl(e.target.value)}
        placeholder="https://…"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
      />
      {linkUrl && (
        <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
          <LinkIcon className="w-3 h-3" />
          <span className="truncate">{linkUrl}</span>
          <button onClick={() => setLinkUrl('')}><X className="w-3 h-3 hover:text-foreground" /></button>
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: 'photo',   icon: Image,     label: 'Photo',   color: 'text-sky-400',    hoverBg: 'hover:bg-sky-400/10'    },
  { id: 'video',   icon: Video,     label: 'Vidéo',   color: 'text-violet-400', hoverBg: 'hover:bg-violet-400/10' },
  { id: 'poll',    icon: BarChart3, label: 'Sondage', color: 'text-amber-400',  hoverBg: 'hover:bg-amber-400/10'  },
  { id: 'location',icon: MapPin,    label: 'Lieu',    color: 'text-rose-400',   hoverBg: 'hover:bg-rose-400/10'   },
  { id: 'link',    icon: LinkIcon,  label: 'Lien',    color: 'text-cyan-400',   hoverBg: 'hover:bg-cyan-400/10'   },
];

export default function HomeCreatePost({ user, onPost }) {
  const [text, setText]             = useState('');
  const [posting, setPosting]       = useState(false);
  const [category, setCategory]     = useState('general');
  const [expanded, setExpanded]     = useState(false);
  const [audience, setAudience]     = useState('public');
  const [activePanel, setActivePanel] = useState(null);

  // Panel states
  const [photos, setPhotos]         = useState([]);
  const [videoUrl, setVideoUrl]     = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [location, setLocation]     = useState('');
  const [linkUrl, setLinkUrl]       = useState('');

  const MAX = 2000;
  const avatarInitial = (user?.display_name || user?.full_name || 'U')[0]?.toUpperCase();

  const togglePanel = (id) => setActivePanel(p => p === id ? null : id);

  const buildContent = () => {
    let content = text;
    if (linkUrl) content += `\n\n🔗 ${linkUrl}`;
    if (location) content += `\n\n📍 ${location}`;
    if (videoUrl) content += `\n\n🎬 ${videoUrl}`;
    if (photos.length) content += `\n\n${photos.map(u => `![photo](${u})`).join('\n')}`;
    if (activePanel === 'poll') {
      const opts = pollOptions.filter(Boolean);
      if (opts.length >= 2) content += `\n\n📊 **Sondage :**\n${opts.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
    }
    return content;
  };

  const handlePost = async () => {
    const content = buildContent();
    if (!content.trim()) return;
    if (isActionBlocked(user, 'post')) { toast.error(RESTRICTED_TOAST); return; }
    setPosting(true);
    try {
      const tags = extractHashtags(content);
      await base44.entities.Discussion.create({
        title: text.split('\n')[0].slice(0, 120) || text.slice(0, 120),
        content,
        category,
        tags,
        author_id: user.id,
        author_name: user.full_name,
        author_display_name: user.display_name || user.full_name,
        author_username: user.username,
        author_avatar: user.avatar_url,
        author_is_supreme: user.verifications?.includes('supreme') || false,
        author_verifications: user.verifications || [],
      });
      setText(''); setPhotos([]); setVideoUrl(''); setPollOptions(['', '']); setLocation(''); setLinkUrl('');
      setExpanded(false); setActivePanel(null);
      toast.success('Publication partagée !');
      onPost?.();
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setPosting(false);
    }
  };

  const hasContent = text.trim() || photos.length || videoUrl || location || linkUrl ||
    (activePanel === 'poll' && pollOptions.some(Boolean));

  if (isActionBlocked(user, 'post')) {
    return (
      <div className="px-5 py-4 flex items-center gap-3 text-sm text-orange-300">
        <span className="text-base">⚠️</span>
        <span className="font-inter">Votre compte est <strong>restreint</strong> — publication désactivée.</span>
      </div>
    );
  }

  return (
    <motion.div layout className="w-full">
      {/* Category tabs */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 px-5 pt-4 pb-0 overflow-x-auto scrollbar-hide"
          >
            {CATEGORIES.map(c => {
              const CatIcon = c.icon;
              return (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter font-medium transition-all ${
                    category === c.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10'
                  }`}
                  style={category === c.id ? {
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                    boxShadow: '0 0 12px hsl(var(--primary) / 0.35)',
                  } : {}}
                >
                  <CatIcon className="w-3 h-3" />
                  {c.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div className="px-4 pt-4 pb-2 flex gap-3.5">
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
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={e => { if (e.target.value.length <= MAX) setText(e.target.value); }}
            onFocus={() => setExpanded(true)}
            placeholder={expanded ? "Quoi de neuf ? Partagez quelque chose avec la communauté…" : "Quoi de neuf ?"}
            rows={expanded ? 4 : 2}
            className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Active sub-panel */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/6"
          >
            <div className="pt-3">
              {activePanel === 'photo'    && <PhotoPanel photos={photos} setPhotos={setPhotos} />}
              {activePanel === 'video'    && <VideoPanel videoUrl={videoUrl} setVideoUrl={setVideoUrl} />}
              {activePanel === 'poll'     && <PollPanel pollOptions={pollOptions} setPollOptions={setPollOptions} />}
              {activePanel === 'location' && <LocationPanel location={location} setLocation={setLocation} />}
              {activePanel === 'link'     && <LinkPanel linkUrl={linkUrl} setLinkUrl={setLinkUrl} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          {/* Quick actions */}
          <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
            {QUICK_ACTIONS.map(({ id, icon: Icon, label, color, hoverBg }) => (
              <button key={id} onClick={() => { setExpanded(true); togglePanel(id); }}
                title={label}
                className={`flex items-center gap-1.5 px-2 py-2 rounded-xl transition-all text-xs ${hoverBg} ${
                  activePanel === id ? `${color} bg-white/8` : 'text-muted-foreground/70 hover:bg-white/8'
                }`}
              >
                <Icon className={`w-4 h-4 ${activePanel === id ? color : ''}`} />
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
              disabled={!hasContent || posting}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-inter font-semibold text-primary-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{
                background: hasContent ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)' : 'rgba(255,255,255,0.08)',
                boxShadow: hasContent ? '0 0 20px hsl(var(--primary) / 0.4)' : 'none',
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