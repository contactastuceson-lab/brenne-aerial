const DEFAULT_TITLE = 'Brenne Aerial — Vidéo & Inspection par Drone | Premium';
const DEFAULT_DESCRIPTION = 'Brenne Aerial propose des services drone premium pour les événements, inspections, chantiers et captations aériennes.';
const DEFAULT_IMAGE = '/og-image.svg';
const DEFAULT_TYPE = 'website';

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

export function applySeoMeta({ title, description, image, type = DEFAULT_TYPE, url } = {}) {
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
  setMeta('meta[property="og:site_name"]', 'content', 'Brenne Aerial');
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', resolvedTitle);
  setMeta('meta[name="twitter:description"]', 'content', resolvedDescription);
  setMeta('meta[name="twitter:image"]', 'content', toAbsoluteUrl(resolvedImage));
}

export function getBlogSeoData(post) {
  const title = post?.title ? `${post.title} | Brenne Aerial` : DEFAULT_TITLE;
  const description = truncate(post?.excerpt || post?.content || '', 160);
  const image = post?.cover_url || DEFAULT_IMAGE;

  return {
    title,
    description: description || DEFAULT_DESCRIPTION,
    image,
    type: 'article',
  };
}

export function getForumSeoData(discussion) {
  const title = discussion?.title ? `${discussion.title} | Forum Brenne Aerial` : 'Forum Brenne Aerial';
  const description = truncate(discussion?.content || '', 160);

  return {
    title,
    description: description || 'Découvrez les échanges de la communauté Brenne Aerial.',
    image: DEFAULT_IMAGE,
    type: 'article',
  };
}
