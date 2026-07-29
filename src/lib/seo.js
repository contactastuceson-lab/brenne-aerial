const DEFAULT_TITLE = 'EZA — by EZA Group';
const DEFAULT_DESCRIPTION = 'EZA by EZA Group — Plateforme communautaire exclusive : posts, Spaces audio, forums, profils et communautés.';
const DEFAULT_IMAGE = '/og-image.jpg';
const DEFAULT_TYPE = 'website';
const SITE_NAME = 'EZA';

function normalizeText(value = '') {
  return String(value)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text = '', maxLength = 160) {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function toAbsoluteUrl(path = '') {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function applySeoMeta({ title, description, image, type = DEFAULT_TYPE, url, author } = {}) {
  if (typeof document === 'undefined') return;

  const resolvedTitle = title || DEFAULT_TITLE;
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const resolvedImage = image || DEFAULT_IMAGE;
  const resolvedUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const resolvedType = type || DEFAULT_TYPE;

  const setMeta = (selector, attr, value) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      document.head.appendChild(element);
    }
    element.setAttribute(attr, value);
  };

  document.title = resolvedTitle;

  setMeta('meta[name="description"]', 'content', resolvedDescription);
  setMeta('meta[property="og:title"]', 'content', resolvedTitle);
  setMeta('meta[property="og:description"]', 'content', resolvedDescription);
  setMeta('meta[property="og:type"]', 'content', resolvedType);
  setMeta('meta[property="og:url"]', 'content', resolvedUrl);
  setMeta('meta[property="og:image"]', 'content', toAbsoluteUrl(resolvedImage));
  setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
  if (author) setMeta('meta[property="article:author"]', 'content', author);
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', resolvedTitle);
  setMeta('meta[name="twitter:description"]', 'content', resolvedDescription);
  setMeta('meta[name="twitter:image"]', 'content', toAbsoluteUrl(resolvedImage));
}

export function getBlogSeoData(post) {
  const title = post?.title ? `${post.title} | EZA` : DEFAULT_TITLE;
  const description = truncate(post?.excerpt || post?.content || '', 160);
  const image = post?.cover_url || DEFAULT_IMAGE;
  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image,
    type: 'article',
    author: post?.author,
  };
}

export function getForumSeoData(discussion) {
  const title = discussion?.title ? `${discussion.title} | Forum EZA` : 'Forum EZA';
  const description = truncate(discussion?.content || '', 160);
  return {
    title,
    description: description || 'Découvrez les échanges de la communauté EZA.',
    image: DEFAULT_IMAGE,
    type: 'article',
    author: discussion?.author_display_name || discussion?.author_name,
  };
}

export function getPostSeoData(post) {
  const author = post?.author_display_name || post?.author_name || post?.author_username;
  const title = post?.content
    ? `${truncate(post.content, 90)} | EZA`
    : DEFAULT_TITLE;
  const description = truncate(
    post?.content
      ? `${author ? `@${post.author_username || author} — ` : ''}${post.content}`
      : '',
    160,
  );
  const image = (post?.media_urls && post.media_urls[0]) || DEFAULT_IMAGE;
  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image,
    type: 'article',
    author,
  };
}

export function getSpaceSeoData(space) {
  const title = space?.title ? `${space.title} | Space EZA` : 'Space audio EZA';
  const description = truncate(
    space?.description || `Space audio en direct par ${space?.host_name || 'un hôte EZA'}.`,
    160,
  );
  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    type: 'music.song',
    author: space?.host_name,
  };
}

export function getProfileSeoData(user) {
  const name = user?.display_name || user?.full_name || user?.username;
  const title = name ? `${name} (@${user?.username || ''}) | EZA` : 'Profil EZA';
  const description = truncate(user?.bio || `Profil de ${name || 'un membre'} sur EZA.`, 160);
  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image: user?.avatar_url || DEFAULT_IMAGE,
    type: 'profile',
  };
}

export function getSampleProfileSeoData(profile) {
  const name = profile?.display_name || profile?.full_name || profile?.username;
  const title = name ? `${name} (@${profile?.username}) | EZA` : 'Profil EZA';
  const description = truncate(profile?.bio || `Profil de ${name || 'un créateur'} sur EZA.`, 160);
  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image: profile?.avatar_url || profile?.cover_url || DEFAULT_IMAGE,
    type: 'profile',
  };
}

export function getCommunitySeoData(community) {
  const title = community?.name ? `${community.name} | Communauté EZA` : 'Communauté EZA';
  const description = truncate(
    community?.description || `Communauté ${community?.name || 'EZA'} — ${community?.members_count || 0} membres.`,
    160,
  );
  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image: community?.cover_url || DEFAULT_IMAGE,
    type: 'website',
    author: community?.owner_name,
  };
}

export const SEO_DEFAULTS = { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, SITE_NAME };