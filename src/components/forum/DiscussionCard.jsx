import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, Eye, Pin, Lock, Star, Flag } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import AffiliationBadges from '@/components/shared/AffiliationBadges';
import usePublicUser from '@/hooks/usePublicUser';
import { parseEntityDate } from '@/lib/entityDate';
import { handleIdentityClick } from '@/lib/identityClick';
import ReportButton from '@/components/shared/ReportButton';

// Strip markdown to plain text for preview
function stripMarkdown(text = '') {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[.*?\]\(.*?\)/g, '')   // remove links
    .replace(/#{1,6}\s/g, '')         // remove headings
    .replace(/[*_`~]/g, '')           // remove formatting chars
    .replace(/\n+/g, ' ')             // collapse newlines
    .trim();
}

export default function DiscussionCard({ discussion }) {
  const liveAuthor = usePublicUser(discussion.author_id);
  const navigate = useNavigate();
  const location = useLocation();

  const isOfficial = discussion.is_official;
  const isPinned = discussion.is_pinned;
  const isLocked = discussion.is_locked;
  const plainContent = stripMarkdown(discussion.content);

  const authorAvatar = liveAuthor?.avatar_url || discussion.author_avatar;
  const authorName = liveAuthor?.display_name || liveAuthor?.full_name || discussion.author_display_name || discussion.author_name;
  const authorUsername = liveAuthor?.username || discussion.author_username;
  const authorVerifications = liveAuthor?.verifications ?? discussion.author_verifications;
  const authorIsSupreme = liveAuthor?.is_supreme ?? discussion.author_is_supreme;
  const identityUser = liveAuthor || { id: discussion.author_id, username: authorUsername, verifications: authorVerifications };
  const handleIdentity = (event) => handleIdentityClick({ event, navigate, pathname: location.pathname, user: identityUser });

  return (
    <Link to={`/forum/${discussion.id}`}>
      <div className={`group p-4 rounded-lg border transition-all ${
        isOfficial
          ? 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10'
          : isPinned
          ? 'border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10'
          : 'border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/60'
      }`}>
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {isPinned && <span className="inline-flex items-center gap-0.5 text-[10px] text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded"><Pin size={9} /> Épinglé</span>}
              {isOfficial && <span className="inline-flex items-center gap-0.5 text-[10px] text-yellow-300 bg-yellow-500/15 px-1.5 py-0.5 rounded"><Star size={9} /> Officiel</span>}
              {isLocked && <span className="inline-flex items-center gap-0.5 text-[10px] text-red-300 bg-red-500/15 px-1.5 py-0.5 rounded"><Lock size={9} /> Verrouillé</span>}
            </div>
            <h3 className={`font-grotesk font-bold group-hover:text-cyan-300 transition-colors ${
              isOfficial ? 'text-yellow-400' : 'text-white'
            }`}>
              {discussion.title}
            </h3>
          </div>
          <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded-full whitespace-nowrap flex-shrink-0">
            {discussion.category}
          </span>
        </div>
        
        <p className="text-sm text-slate-400 mb-3 line-clamp-2 overflow-hidden">
          {plainContent}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {authorAvatar ? (
              <img src={authorAvatar} alt="" className="w-5 h-5 rounded-md object-cover flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-md bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                {authorName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span onClick={handleIdentity} className="truncate max-w-[100px] cursor-pointer hover:text-primary">{authorName}</span>
            <VerificationIcons
              verifications={authorIsSupreme ? ['supreme', ...(authorVerifications || [])] : authorVerifications}
              size="sm"
              user={identityUser}
            />
            {authorUsername && <span className="min-w-0 max-w-[100px] truncate text-slate-500">@{authorUsername}</span>}

            <span className="hidden sm:inline text-slate-600 truncate">{formatDistanceToNow(parseEntityDate(discussion.created_date), { locale: fr, addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1"><MessageCircle size={13} />{discussion.replies_count || 0}</div>
            <div className="flex items-center gap-1"><Eye size={13} />{discussion.views_count || 0}</div>
            <div onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
              <ReportButton
                targetType="discussion"
                targetId={discussion.id}
                targetName={authorName}
                targetContent={discussion.title || plainContent}
                targetUrl={`/forum/${discussion.id}`}
                variant="icon"
                icon={Flag}
                label="Signaler la discussion"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}