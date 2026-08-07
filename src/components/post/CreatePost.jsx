import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Image, X, Loader2, Globe, Users, BarChart3, BadgeCheck, ShieldCheck, CalendarClock, FileEdit, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { extractHashtags, extractMentions } from '@/lib/hashtags';
import { compressImage } from '@/lib/imageUtils';
import GifPicker from '@/components/post/GifPicker';
import PollCreator from '@/components/post/PollCreator';
import MentionAutocomplete, { useMentionAutocomplete } from '@/components/post/MentionAutocomplete';
import { notify } from '@/lib/notificationHelper';
import { isRestricted, isActionBlocked, RESTRICTED_TOAST } from '@/lib/accountStatus';
import { getScheduledPostsLimit, hasScheduledPostsUnlimited, getSponsoredPostsQuota } from '@/lib/subscriptionGating';
import { awardCredits } from '@/lib/rewardActions';

const MAX_CHARS = 280;
const FREE_SCHEDULED_LIMIT = 5;

const VIS_LABELS = { public: 'Tout le monde', followers: 'Abonnés', certified: 'Certifiés', eza_circle: 'Cercle EZA' };
const VIS_ORDER = ['public', 'followers', 'certified', 'eza_circle'];
function VisibilityIcon({ v }) {
  if (v === 'followers') return <Users className="w-3 h-3" />;
  if (v === 'certified') return <BadgeCheck className="w-3 h-3" />;
  if (v === 'eza_circle') return <ShieldCheck className="w-3 h-3" />;
  return <Globe className="w-3 h-3" />;
}

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

// GIF icon SVG
function GifIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M10 12h2v2h-2v-2z" />
      <path d="M14 10v4" />
      <path d="M7 10v4" />
      <path d="M7 12h2" />
    </svg>
  );
}

export default function CreatePost({ user, onPost, replyTo = null }) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null); // null = pas en cours, 0-100 = %
  const [posting, setPosting] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [focused, setFocused] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [poll, setPoll] = useState(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [scheduledThisMonth, setScheduledThisMonth] = useState(null); // null = unknown
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const { suggestions, mentionQuery, selectSuggestion } = useMentionAutocomplete(content, textareaRef, setContent);

  const perks = user?.perks || {};
  const sponsoredQuota = getSponsoredPostsQuota(perks);
  const unlimitedSchedule = hasScheduledPostsUnlimited(perks);
  const scheduleLimit = getScheduledPostsLimit(perks);
  const canSponsor = sponsoredQuota > 0;

  const uploading = uploadProgress !== null;
  const remaining = MAX_CHARS - content.length;
  const hasPoll = poll && poll.options.filter(o => o.text.trim()).length >= 2;

  // Compte les posts déjà programmés ce mois-ci (pour limiter sans Premium)
  useEffect(() => {
    if (!focused || unlimitedSchedule) return;
    (async () => {
      try {
        const start = new Date();
        start.setDate(1); start.setHours(0,0,0,0);
        const mine = await base44.entities.Post.filter({ author_id: user.id, is_draft: true }, '-created_date', 200);
        const count = (mine || []).filter(p => p.scheduled_at && new Date(p.scheduled_at) >= start && new Date(p.scheduled_at) > new Date()).length;
        setScheduledThisMonth(count);
      } catch { setScheduledThisMonth(0); }
    })();
  }, [focused, unlimitedSchedule, user?.id]);

  const scheduleRemaining = unlimitedSchedule ? Infinity : Math.max(0, (scheduleLimit || FREE_SCHEDULED_LIMIT) - (scheduledThisMonth || 0));
  const scheduleBlocked = !unlimitedSchedule && scheduleRemaining <= 0;

  const canPost = content.trim().length > 0 && !posting && remaining >= 0 && (!scheduleAt || !scheduleBlocked);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (isActionBlocked(user, 'media')) { toast.error(RESTRICTED_TOAST); return; }
    if (poll) { toast.error("Impossible d'ajouter des médias avec un sondage"); return; }
    setUploadProgress(0);
    try {
      const toUpload = files.slice(0, 4 - mediaUrls.length);
      const urls = [];
      for (let i = 0; i < toUpload.length; i++) {
        // Progression simulée : monte jusqu'à 90% pendant la compression + upload
        const baseProgress = Math.round((i / toUpload.length) * 100);
        setUploadProgress(baseProgress + 5);

        const compressed = await compressImage(toUpload[i]);

        // Simulation de progression — plus rapide pour les vidéos
        const isVideo = toUpload[i].type.startsWith('video/');
        const step = isVideo ? 1 : 4;
        const delay = isVideo ? 80 : 150;
        let sim = baseProgress + 5;
        const interval = setInterval(() => {
          sim = Math.min(sim + step, baseProgress + 88);
          setUploadProgress(sim);
        }, delay);

        const result = await base44.integrations.Core.UploadFile({ file: compressed });
        clearInterval(interval);

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

  const handleGifSelect = (url) => {
    if (isActionBlocked(user, 'media')) { toast.error(RESTRICTED_TOAST); return; }
    if (poll) { toast.error("Impossible d'ajouter des médias avec un sondage"); return; }
    setMediaUrls(prev => [...prev, url].slice(0, 4));
    setShowGif(false);
  };

  const togglePoll = () => {
    if (poll) { setPoll(null); return; }
    if (isActionBlocked(user, 'poll')) { toast.error(RESTRICTED_TOAST); return; }
    if (mediaUrls.length > 0) { toast.error('Supprimez les médias avant d\'ajouter un sondage'); return; }
    setPoll(makePoll());
    setFocused(true);
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && mediaUrls.length === 0 && !poll) { toast.error('Rédigez quelque chose'); return; }
    setPosting(true);
    try {
      const hashtags = extractHashtags(content);
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
        mentions: extractMentions(content),
        likes_count: 0, liked_by: [], replies_count: 0, views_count: 0,
        visibility,
        is_draft: true,
      };
      if (scheduleAt) postData.scheduled_at = new Date(scheduleAt).toISOString();
      await base44.entities.Post.create(postData);
      toast.success('Brouillon enregistré');
      setContent(''); setMediaUrls([]); setPoll(null); setFocused(false); setScheduleAt(''); setShowSchedule(false);
      onPost?.();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setPosting(false);
    }
  };

  const handlePost = async () => {
    if (!canPost) return;
    if (isActionBlocked(user, 'post')) { toast.error(RESTRICTED_TOAST); return; }
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
      if (sponsored) postData.is_sponsored = true;
      if (replyTo) {
        postData.reply_to_id = replyTo.id;
        postData.reply_to_author_username = replyTo.author_username;
      }
      if (hasPoll) {
        const endsAt = new Date(Date.now() + poll.duration_hours * 3600 * 1000).toISOString();
        postData.poll = { ...poll, ends_at: endsAt };
      }
      if (scheduleAt) {
        postData.scheduled_at = new Date(scheduleAt).toISOString();
        postData.is_draft = true;
      }
      const created = await base44.entities.Post.create(postData);
      toast.success(scheduleAt ? 'Publication programmée' : 'Post publié');

      // Notification REPLY pour l'auteur du post parent + MENTION pour chaque @username
      const allUsers = await base44.entities.User.list('-created_date', 200).catch(() => []);
      if (replyTo && replyTo.author_id && replyTo.author_id !== user.id) {
        const parentAuthor = allUsers.find(u => u.id === replyTo.author_id);
        if (parentAuthor?.email) {
          notify({
            type: 'REPLY',
            sender: user,
            receiverEmail: parentAuthor.email,
            receiverId: replyTo.author_id,
            postId: created?.id,
            postExcerpt: content,
            link: `/post/${created?.id}`,
          });
        }
      }
      if (mentions.length > 0) {
        for (const username of mentions) {
          const target = allUsers.find(u => u.username?.toLowerCase() === username.toLowerCase());
          if (target && target.id !== user.id && target.email) {
            notify({
              type: 'MENTION',
              sender: user,
              receiverEmail: target.email,
              receiverId: target.id,
              postId: created?.id,
              postExcerpt: content,
              link: `/post/${created?.id}`,
            });
          }
        }
      }

      setContent('');
      setMediaUrls([]);
      setPoll(null);
      setFocused(false);
      setScheduleAt('');
      setShowSchedule(false);
      setSponsored(false);
      onPost?.();
      // Récompense automatique — uniquement pour les publications immédiates
      if (!scheduleAt) {
        awardCredits(replyTo ? 'create_reply' : 'create_post', { post_id: created?.id });
      }
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Si autocomplétion ouverte, Escape la ferme
    if (suggestions.length > 0 && e.key === 'Escape') {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
  };

  const name = user?.display_name || user?.full_name || 'Vous';
  const initial = (name[0] || 'U').toUpperCase();

  if (isActionBlocked(user, 'post')) {
    return (
      <div className="px-4 py-3 flex items-center gap-3 text-sm text-orange-300 bg-orange-500/8 border-b border-orange-500/15">
        <span className="text-base">⚠️</span>
        <span className="font-inter">Votre compte est <strong>restreint</strong> — publication désactivée.</span>
      </div>
    );
  }

  // Progress ring
  const progress = Math.min(content.length / MAX_CHARS, 1);
  const r = 9;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ * (1 - progress);

  return (
    <div
      className="px-4 pt-3 pb-0 transition-colors"
      onClick={() => { if (!focused) { setFocused(true); textareaRef.current?.focus(); } }}
    >
      {replyTo && (
        <p className="text-xs text-muted-foreground/50 mb-2 pl-13">
          En réponse à <span className="text-primary">@{replyTo.author_username}</span>
        </p>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
            : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>
          }
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Textarea + mention autocomplete */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder={replyTo ? 'Votre réponse...' : 'Quoi de neuf ?'}
              maxLength={MAX_CHARS + 50}
              className="w-full bg-transparent text-foreground text-[17px] placeholder:text-muted-foreground/35 resize-none outline-none leading-relaxed py-2 min-h-[52px]"
              style={{ height: focused ? 'auto' : 52, minHeight: focused ? 80 : 52 }}
            />
            {mentionQuery !== null && (
              <MentionAutocomplete suggestions={suggestions} onSelect={selectSuggestion} />
            )}
          </div>

          {/* Visibility chip — shown when focused */}
          {focused && (
            <div className="self-start flex flex-wrap items-center gap-2 mb-2">
              <button
                onClick={() => setVisibility(v => VIS_ORDER[(VIS_ORDER.indexOf(v) + 1) % VIS_ORDER.length])}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-primary text-xs font-semibold border border-primary/30 hover:bg-primary/10 transition-colors"
              >
                <VisibilityIcon v={visibility} />
                {VIS_LABELS[visibility]}
              </button>
              <button
                onClick={() => { if (scheduleBlocked) { toast.error(`Limite de ${scheduleLimit} posts programmés/mois atteinte. Passez Premium pour illimité.`); return; } setShowSchedule(s => !s); }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${showSchedule ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'text-muted-foreground border-border hover:bg-white/6'}`}
              >
                <CalendarClock className="w-3 h-3" /> Programmer
                {!unlimitedSchedule && scheduledThisMonth !== null && (
                  <span className="font-mono text-[9px] opacity-60">{scheduleRemaining} restant</span>
                )}
                {unlimitedSchedule && <span className="font-mono text-[9px] text-emerald-400">∞</span>}
              </button>
              {showSchedule && (
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={e => setScheduleAt(e.target.value)}
                  className="bg-secondary/50 border border-border rounded-full px-2.5 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                />
              )}
              {canSponsor && !replyTo && (
                <button
                  onClick={() => setSponsored(s => !s)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${sponsored ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'text-amber-400/70 border-amber-400/20 hover:bg-amber-400/5'}`}
                  title={sponsoredQuota === Infinity ? 'Publication sponsorisée — illimitée (Enterprise)' : `Publication sponsorisée — ${sponsoredQuota} gratuites ce mois (Business)`}
                >
                  <Megaphone className="w-3 h-3" /> Sponsorisé
                </button>
              )}
            </div>
          )}

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
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Poll creator */}
          {poll && <PollCreator poll={poll} onChange={setPoll} onRemove={() => setPoll(null)} />}

          {/* Upload progress bar */}
          {uploadProgress !== null && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-primary font-medium">Upload en cours…</span>
                <span className="text-xs text-muted-foreground font-mono">{uploadProgress}%</span>
              </div>
              <div className="h-1 w-full bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-zinc-800/50 mt-1" />

          {/* Toolbar */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-0.5 relative">

              {/* Photo/Video */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || mediaUrls.length >= 4 || !!poll}
                title="Photo / Vidéo"
                className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 bg-white/5 border border-white/8 hover:bg-white/10 hover:text-foreground hover:border-white/15 transition-all disabled:opacity-30"
              >
                <Image className="w-[17px] h-[17px]" strokeWidth={1.75} />
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*,image/gif" multiple className="hidden" onChange={handleMediaUpload} />

              {/* GIF */}
              <div className="relative">
                <button
                  onClick={() => setShowGif(v => !v)}
                  disabled={mediaUrls.length >= 4 || !!poll}
                  title="GIF"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 ${
                    showGif
                      ? 'text-primary bg-primary/15 border border-primary/30'
                      : 'text-foreground/70 bg-white/5 border border-white/8 hover:bg-white/10 hover:text-foreground hover:border-white/15'
                  }`}
                >
                  <GifIcon className="w-[17px] h-[17px]" />
                </button>
                {showGif && <GifPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />}
              </div>

              {/* Poll */}
              <button
                onClick={togglePoll}
                title="Sondage"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  poll
                    ? 'text-primary bg-primary/15 border border-primary/30'
                    : 'text-foreground/70 bg-white/5 border border-white/8 hover:bg-white/10 hover:text-foreground hover:border-white/15'
                }`}
              >
                <BarChart3 className="w-[17px] h-[17px]" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Character count ring */}
              {content.length > 0 && (
                <div className="relative w-[22px] h-[22px] flex items-center justify-center">
                  <svg className="-rotate-90" width="22" height="22" viewBox="0 0 22 22">
                    <circle cx="11" cy="11" r={r} stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
                    <circle
                      cx="11" cy="11" r={r}
                      stroke={remaining < 0 ? '#ef4444' : remaining < 20 ? '#f59e0b' : 'hsl(var(--primary))'}
                      strokeWidth="2" fill="none"
                      strokeDasharray={`${circ - strokeDash} ${circ}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.15s ease' }}
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span className={`absolute text-[9px] font-mono leading-none ${remaining < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {remaining}
                    </span>
                  )}
                </div>
              )}

              {/* Separator */}
              {content.length > 0 && (
                <div className="w-px h-5 bg-zinc-700/60" />
              )}

              {/* Draft button */}
              {content.trim().length > 0 && !replyTo && (
                <button
                  onClick={handleSaveDraft}
                  disabled={posting}
                  title="Sauvegarder en brouillon"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full font-inter font-semibold text-xs border border-border text-muted-foreground hover:bg-white/6 transition-all disabled:opacity-40"
                >
                  <FileEdit className="w-3.5 h-3.5" /> Brouillon
                </button>
              )}

              {/* Post button */}
              <button
                onClick={handlePost}
                disabled={!canPost}
                className="px-5 py-1.5 rounded-full font-grotesk font-bold text-[15px] bg-foreground text-background hover:opacity-85 active:scale-95 disabled:opacity-35 transition-all"
              >
                {posting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : scheduleAt ? 'Programmer'
                  : replyTo ? 'Répondre' : 'Publier'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}