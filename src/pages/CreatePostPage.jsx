import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, Image, Globe, Users, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractHashtags, extractMentions } from '@/lib/hashtags';
import { compressImage } from '@/lib/imageUtils';
import GifPicker from '@/components/post/GifPicker';
import PollCreator from '@/components/post/PollCreator';

const MAX_CHARS = 280;

function makePoll() {
  return {
    question: '',
    options: [
      { id: crypto.randomUUID(), text: '', votes: 0, voted_by: [] },
      { id: crypto.randomUUID(), text: '', votes: 0, voted_by: [] },
    ],
    duration_hours: 24,
    total_votes: 0,
  };
}

function GifIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M10 12h2v2h-2v-2z" /><path d="M14 10v4" /><path d="M7 10v4" /><path d="M7 12h2" />
    </svg>
  );
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });

  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [posting, setPosting] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [showGif, setShowGif] = useState(false);
  const [poll, setPoll] = useState(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const uploading = uploadProgress !== null;
  const remaining = MAX_CHARS - content.length;
  const hasPoll = poll && poll.options.filter(o => o.text.trim()).length >= 2;
  const canPost = content.trim().length > 0 && !posting && remaining >= 0;

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (poll) { toast.error("Impossible d'ajouter des médias avec un sondage"); return; }
    setUploadProgress(0);
    try {
      const toUpload = files.slice(0, 4 - mediaUrls.length);
      const urls = [];
      for (let i = 0; i < toUpload.length; i++) {
        setUploadProgress(Math.round((i / toUpload.length) * 90));
        const compressed = await compressImage(toUpload[i]);
        const result = await base44.integrations.Core.UploadFile({ file: compressed });
        setUploadProgress(Math.round(((i + 1) / toUpload.length) * 100));
        if (result?.file_url) urls.push(result.file_url);
      }
      setMediaUrls(prev => [...prev, ...urls].slice(0, 4));
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handlePost = async () => {
    if (!canPost || !user) return;
    setPosting(true);
    try {
      const hashtags = extractHashtags(content);
      const mentions = extractMentions(content);
      const postData = {
        content: content.trim(),
        author_id: user.id,
        author_name: user.full_name,
        author_display_name: user.display_name || user.full_name,
        author_username: user.username,
        author_avatar: user.avatar_url,
        author_verifications: user.verifications || [],
        media_urls: mediaUrls,
        hashtags,
        mentions,
        likes_count: 0,
        liked_by: [],
        replies_count: 0,
        views_count: 0,
        visibility,
      };
      if (hasPoll) {
        const endsAt = new Date(Date.now() + poll.duration_hours * 3600 * 1000).toISOString();
        postData.poll = { ...poll, ends_at: endsAt };
      }
      await base44.entities.Post.create(postData);
      navigate('/');
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  const name = user?.display_name || user?.full_name || 'Vous';
  const initial = (name[0] || 'U').toUpperCase();

  const progress = Math.min(content.length / MAX_CHARS, 1);
  const r = 10;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handlePost}
          disabled={!canPost}
          className="px-5 py-1.5 rounded-full font-grotesk font-bold text-[15px] bg-primary text-primary-foreground hover:opacity-85 active:scale-95 disabled:opacity-35 transition-all"
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Poster'}
        </button>
      </div>

      {/* Compose area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user.avatar_url
              ? <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
              : <span className="font-grotesk font-bold text-primary">{initial}</span>
            }
          </div>

          <div className="flex-1 min-w-0">
            {/* Visibility chip */}
            <button
              onClick={() => setVisibility(v => v === 'public' ? 'followers' : 'public')}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-primary text-xs font-semibold border border-primary/30 hover:bg-primary/10 transition-colors mb-3"
            >
              {visibility === 'public' ? <Globe className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              {visibility === 'public' ? 'Tout le monde peut répondre' : 'Abonnés uniquement'}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              maxLength={MAX_CHARS + 50}
              autoFocus
              className="w-full bg-transparent text-foreground text-[18px] placeholder:text-muted-foreground/35 resize-none outline-none leading-relaxed min-h-[140px]"
            />

            {/* Media previews */}
            {mediaUrls.length > 0 && (
              <div className={`grid gap-1.5 mb-3 ${mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {mediaUrls.map((url, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden group">
                    {url.match(/\.(mp4|webm|ogg)$/i)
                      ? <video src={url} className="w-full max-h-52 object-cover" muted />
                      : <img src={url} alt="" className="w-full max-h-52 object-cover" />
                    }
                    <button
                      onClick={() => setMediaUrls(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/75 flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Poll creator */}
            {poll && <PollCreator poll={poll} onChange={setPoll} onRemove={() => setPoll(null)} />}

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="mb-3">
                <div className="h-1 w-full bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-t border-border/60 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {/* Char counter */}
        {content.length > 0 && (
          <div className="flex justify-end pt-2 pb-1">
            <div className="relative w-[26px] h-[26px] flex items-center justify-center">
              <svg className="-rotate-90" width="26" height="26" viewBox="0 0 26 26">
                <circle cx="13" cy="13" r={r} stroke="hsl(var(--border))" strokeWidth="2.5" fill="none" />
                <circle cx="13" cy="13" r={r}
                  stroke={remaining < 0 ? '#ef4444' : remaining < 20 ? '#f59e0b' : 'hsl(var(--primary))'}
                  strokeWidth="2.5" fill="none"
                  strokeDasharray={`${circ - strokeDash} ${circ}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.15s ease' }}
                />
              </svg>
              {remaining <= 20 && (
                <span className={`absolute text-[9px] font-mono leading-none ${remaining < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>{remaining}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 pt-1">
          {/* Photo/Video */}
          <button onClick={() => fileRef.current?.click()} disabled={uploading || mediaUrls.length >= 4 || !!poll}
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-all disabled:opacity-30">
            <Image className="w-5 h-5" strokeWidth={1.75} />
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*,image/gif" multiple className="hidden" onChange={handleMediaUpload} />

          {/* GIF */}
          <div className="relative">
            <button onClick={() => setShowGif(v => !v)} disabled={mediaUrls.length >= 4 || !!poll}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 ${showGif ? 'text-primary bg-primary/20' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}>
              <GifIcon className="w-5 h-5" />
            </button>
            {showGif && <GifPicker onSelect={(url) => { setMediaUrls(prev => [...prev, url].slice(0, 4)); setShowGif(false); }} onClose={() => setShowGif(false)} />}
          </div>

          {/* Poll */}
          <button onClick={() => { if (poll) { setPoll(null); } else { if (mediaUrls.length > 0) { toast.error('Supprimez les médias avant d\'ajouter un sondage'); return; } setPoll(makePoll()); } }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${poll ? 'text-primary bg-primary/20' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}>
            <BarChart3 className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}