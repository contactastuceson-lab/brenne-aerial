/**
 * PostAuthorHeader — En-tête d'une publication avec badges de vérification et affiliations.
 * Utilisable sur toutes les publications (HomeFeed, ForumPage, DiscussionDetail, etc.)
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Globe, Users, Lock, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import VerificationIcons from '@/components/ui/VerificationIcon';
import AffiliationBadges from '@/components/shared/AffiliationBadges';
import usePublicUser from '@/hooks/usePublicUser';
import { parseEntityDate } from '@/lib/entityDate';

const CATEGORY_CONFIG = {
  general:   { dot: 'bg-blue-400',    label: 'Général' },
  technique: { dot: 'bg-purple-400',  label: 'Technique' },
  aide:      { dot: 'bg-amber-400',   label: 'Aide' },
  partages:  { dot: 'bg-emerald-400', label: 'Partages' },
  autres:    { dot: 'bg-zinc-400',    label: 'Autres' },
};

/**
 * @param {{
 *   authorId?: string,
 *   authorName?: string,
 *   authorDisplayName?: string,
 *   authorUsername?: string,
 *   authorAvatar?: string,
 *   authorVerifications?: string[],
 *   authorIsSupreme?: boolean,
 *   createdDate?: string,
 *   category?: string,
 *   visibility?: string,
 *   onMenuClick?: () => void,
 *   showMenu?: boolean,
 *   size?: 'sm' | 'md',
 * }} props
 */
export default function PostAuthorHeader({
  authorId,
  authorName,
  authorDisplayName,
  authorUsername,
  authorAvatar,
  authorVerifications = [],
  authorIsSupreme = false,
  createdDate,
  category,
  visibility,
  onMenuClick,
  showMenu = true,
  size = 'md',
  hideAvatar = false,
}) {
  // Résolution live du profil — écrase les données gravées dès que disponible
  const liveUser = usePublicUser(authorId);

  const displayName = liveUser?.display_name || liveUser?.full_name || authorDisplayName || authorName || 'Utilisateur';
  const resolvedAvatar = liveUser?.avatar_url || authorAvatar;
  const resolvedUsername = liveUser?.username || authorUsername;
  const resolvedVerifications = liveUser?.verifications ?? authorVerifications;
  const resolvedIsSupreme = liveUser?.is_supreme ?? authorIsSupreme;

  const avatarInitial = (displayName?.[0] || 'U').toUpperCase();
  const profileLink = resolvedUsername ? `/@${resolvedUsername}` : null;
  const cat = category ? CATEGORY_CONFIG[category] : null;

  const timeAgo = useMemo(() => {
    if (!createdDate) return '';
    try {
      const date = parseEntityDate(createdDate);
      return date ? formatDistanceToNow(date, { addSuffix: true, locale: fr }) : '';
    } catch {
      return '';
    }
  }, [createdDate]);

  const avatarSize = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  const avatarRounded = size === 'sm' ? 'rounded-xl' : 'rounded-2xl';
  const crownSize = size === 'sm' ? 'w-4 h-4 -bottom-0.5 -right-0.5' : 'w-5 h-5 -bottom-1 -right-1';
  const crownIconSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="flex items-start justify-between gap-3 w-full">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Avatar — masqué si hideAvatar=true (géré par le parent) */}
        {!hideAvatar && (
          <div className="relative flex-shrink-0">
            <div
              className={`${avatarSize} ${avatarRounded} overflow-hidden border border-white/10`}
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            >
              {resolvedAvatar ? (
                <img src={resolvedAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.3) 0%, hsl(var(--accent)/0.2) 100%)' }}
                >
                  <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          {/* Ligne 1 : Nom + badges + @pseudo */}
          <div className="flex items-center gap-1.5 min-w-0">
            {profileLink ? (
              <Link
                to={profileLink}
                className="font-grotesk font-bold text-sm text-foreground hover:text-primary transition-colors leading-tight"
              >
                {displayName}
              </Link>
            ) : (
              <span className="font-grotesk font-bold text-sm text-foreground leading-tight">{displayName}</span>
            )}

            {/* Badges de vérification — toujours live */}
            {(resolvedVerifications?.length > 0 || resolvedIsSupreme) && (
              <VerificationIcons
                verifications={resolvedIsSupreme ? ['supreme', ...(resolvedVerifications || [])] : resolvedVerifications}
                size="sm"
                user={authorId ? { id: authorId } : null}
              />
            )}
{resolvedUsername && (
  <span className="min-w-0 max-w-[11rem] sm:max-w-[16rem] truncate font-mono text-xs text-muted-foreground/55">@{resolvedUsername}</span>
)}
</div>

{/* Ligne 2 : temps · catégorie · visibilité */}
<div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {timeAgo && (
              <span className="font-mono text-xs text-muted-foreground/55">{timeAgo}</span>
            )}
            {cat && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                  <span className="font-mono text-[10px] text-muted-foreground/50">{cat.label}</span>
                </div>
              </>
            )}
            {visibility && visibility !== 'public' && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <div className="flex items-center gap-0.5 text-muted-foreground/40">
                  {visibility === 'community' ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  <span className="font-mono text-[10px]">
                    {visibility === 'community' ? 'Communauté' : 'Privé'}
                  </span>
                </div>
              </>
            )}
            {visibility === 'public' && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <Globe className="w-3 h-3 text-muted-foreground/30" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      {showMenu && onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/8 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}