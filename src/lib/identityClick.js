const RESERVED_ROOT_PATHS = new Set([
  '', 'about', 'services', 'portfolio', 'quote', 'planning', 'blog', 'contact', 'dashboard',
  'discover', 'messages', 'profile', 'forum', 'admin', 'login', 'register', 'forgot-password',
  'reset-password', 'search', 'notifications', 'premium', 'donation', 'legal', 'status', 'uptime',
]);

export function getPublicProfilePath(user = {}) {
  if (user.is_sample && user.username) return `/s/${user.username}`;
  if (user.username) return `/@${user.username}`;
  if (user.id) return `/${user.id}`;
  return null;
}

export function isPublicProfileRoute(pathname = window.location.pathname) {
  if (pathname.startsWith('/s/')) return true;
  const segment = pathname.replace(/^\//, '').split('/')[0];
  return pathname.startsWith('/@') || (!pathname.includes('/', 1) && !RESERVED_ROOT_PATHS.has(segment));
}

export function handleIdentityClick({ event, navigate, user, pathname, onProfileClick }) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  if (isPublicProfileRoute(pathname)) {
    onProfileClick?.();
    return true;
  }

  const profilePath = getPublicProfilePath(user);
  if (!profilePath) return false;
  navigate(profilePath);
  return true;
}