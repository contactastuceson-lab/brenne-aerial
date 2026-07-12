const CACHE_PREFIX = 'eza-feed-cache:';
const MAX_AGE = 24 * 60 * 60 * 1000;

export function readFeedCache(filter) {
  try {
    const entry = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${filter}`));
    if (!entry || Date.now() - entry.savedAt > MAX_AGE || !Array.isArray(entry.posts)) return undefined;
    return entry;
  } catch {
    return undefined;
  }
}

export function saveFeedCache(filter, posts) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${filter}`, JSON.stringify({ posts, savedAt: Date.now() }));
  } catch {
    // The app continues normally when device storage is unavailable.
  }
}