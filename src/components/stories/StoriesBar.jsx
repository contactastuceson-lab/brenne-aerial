import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { groupStoriesByAuthor, hasUnseen } from '@/lib/storyUtils';
import StoryViewer from './StoryViewer';
import CreateStoryDialog from './CreateStoryDialog';

export default function StoriesBar({ user: userProp }) {
  const [user, setUser] = useState(userProp || null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerState, setViewerState] = useState(null); // { startAuthorIndex }
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      let me = user;
      if (!me) {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          try { me = await base44.auth.me(); setUser(me); } catch {}
        }
      }
      const [list, following] = await Promise.all([
        base44.entities.Story.list('-created_date', 200),
        me?.email ? base44.entities.Follow.filter({ follower_email: me.email }) : Promise.resolve([]),
      ]);
      const followingEmails = new Set((following || []).map((f) => f.following_email).filter(Boolean));
      // Ne montrer que les stories de l'utilisateur courant + celles des comptes qu'il suit
      const filtered = (list || []).filter(
        (s) => s.author_id === me?.id || (s.author_email && followingEmails.has(s.author_email))
      );
      setGroups(groupStoriesByAuthor(filtered));
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Recharger quand une story est créée (l'onglet redevient actif)
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  const myGroupIdx = user ? groups.findIndex((g) => g.author_id === user.id) : -1;
  const myGroup = myGroupIdx >= 0 ? groups[myGroupIdx] : null;

  const renderBubble = (g, idx, isMe = false) => {
    const unseen = isMe ? false : hasUnseen(g, user?.id);
    const avatar = g.author_avatar;
    const label = isMe ? (myGroup ? 'Votre story' : 'Ajouter') : (g.author_username || g.author_name || '');
    return (
      <button
        key={g.author_id || 'me'}
        onClick={() => (isMe && !myGroup) ? setCreateOpen(true) : setViewerState({ startAuthorIndex: idx })}
        className="flex flex-col items-center gap-1 flex-shrink-0 w-[72px] sm:w-20 group"
      >
        <div className="relative">
          <div
            className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-[2.5px] ${
              isMe && !myGroup
                ? 'bg-secondary border border-border'
                : unseen
                ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                : 'bg-border'
            }`}
          >
            <div className="w-full h-full rounded-full bg-background p-[2px] overflow-hidden">
              {isMe && !myGroup ? (
                <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                  <Plus className="w-6 h-6 text-foreground" />
                </div>
              ) : avatar ? (
                <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-grotesk font-bold text-sm text-primary">
                    {(g.author_name || g.author_username || '?')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
          {isMe && !myGroup && (
            <span className="absolute -bottom-0 -right-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
              <Plus className="w-3 h-3" />
            </span>
          )}
        </div>
        <span className="font-inter text-[10px] text-foreground/80 truncate w-full text-center">
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="w-full max-w-[680px] mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-1 py-3">
          {loading ? (
            <div className="flex gap-3 px-1 py-2 w-full">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-secondary/60 animate-pulse flex-shrink-0" />
              ))}
            </div>
          ) : (
            <>
              {renderBubble({ author_id: user?.id, author_name: user?.full_name, author_username: user?.username, author_avatar: user?.avatar_url, stories: [] }, myGroupIdx >= 0 ? myGroupIdx : -1, true)}
              {groups.map((g, i) => (i === myGroupIdx ? null : renderBubble(g, i, false)))}
            </>
          )}
        </div>
      </div>

      {viewerState && (
        <StoryViewer
          groups={groups}
          startAuthorIndex={viewerState.startAuthorIndex}
          currentUser={user}
          onClose={() => setViewerState(null)}
          onViewsChanged={load}
        />
      )}

      <CreateStoryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        user={user}
        onCreated={() => { load(); }}
      />
    </>
  );
}