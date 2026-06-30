import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Image, X, Loader2, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';
import { extractHashtags, extractMentions } from '@/lib/hashtags';

const MAX_CHARS = 280;

export default function CreatePost({ user, onPost, replyTo = null }) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const remaining = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && !posting && remaining >= 0;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.slice(0, 4 - mediaUrls.length).map(f => base44.integrations.Core.UploadFile({ file: f }))
      );
      setMediaUrls(prev => [...prev, ...uploads.map(u => u.file_url)].slice(0, 4));
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePost = async () => {
    if (!canPost) return;
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
      if (replyTo) {
        postData.reply_to_id = replyTo.id;
        postData.reply_to_author_username = replyTo.author_username;
      }
      await base44.entities.Post.create(postData);
      setContent('');
      setMediaUrls([]);
      setFocused(false);
      onPost?.();
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
  };

  const name = user?.display_name || user?.full_name || 'Vous';
  const initial = (name[0] || 'U').toUpperCase();

  return (
    <div className={`px-4 py-3 border-b border-zinc-800/60 transition-all ${focused ? 'bg-white/[0.01]' : ''}`}>
      {replyTo && (
        <p className="text-xs text-muted-foreground/50 mb-2 ml-13">
          En réponse à <span className="text-primary">@{replyTo.author_username}</span>
        </p>
      )}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
            : <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? 'Votre réponse...' : 'Quoi de neuf ?'}
            rows={focused ? 3 : 1}
            maxLength={MAX_CHARS + 50}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/40 text-base resize-none outline-none leading-relaxed py-2 border-b border-transparent focus:border-transparent"
            style={{ minHeight: focused ? 80 : 40 }}
          />

          {/* Media previews */}
          {mediaUrls.length > 0 && (
            <div className={`grid gap-1.5 mb-3 ${mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full max-h-48 object-cover" />
                  <button
                    onClick={() => setMediaUrls(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar + post button */}
          {(focused || content.length > 0) && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {/* Image upload */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || mediaUrls.length >= 4}
                  className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                  title="Ajouter une image"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageUpload} />

                {/* Visibility */}
                <button
                  onClick={() => setVisibility(v => v === 'public' ? 'followers' : 'public')}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
                >
                  {visibility === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  {visibility === 'public' ? 'Tout le monde' : 'Abonnés'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Character count */}
                <div className="relative w-6 h-6">
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
                    <circle
                      cx="12" cy="12" r="10"
                      stroke={remaining < 20 ? remaining < 0 ? '#ef4444' : '#f59e0b' : 'hsl(var(--primary))'}
                      strokeWidth="2" fill="none"
                      strokeDasharray={`${Math.max(0, Math.min(62.8, (1 - content.length / MAX_CHARS) * 62.8))} 62.8`}
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-mono ${remaining < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {remaining}
                    </span>
                  )}
                </div>

                {/* Post button */}
                <button
                  onClick={handlePost}
                  disabled={!canPost}
                  className="px-4 py-1.5 rounded-full font-grotesk font-bold text-sm bg-foreground text-background hover:opacity-80 disabled:opacity-40 transition-all"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : replyTo ? 'Répondre' : 'Publier'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}