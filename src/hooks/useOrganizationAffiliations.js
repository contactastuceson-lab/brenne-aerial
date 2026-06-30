import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// ─── Affiliation cache (by userId) ───────────────────────────────────────────
// Key formats:
//   "uid:<id>"   — filter by userId == id
//   "uemail:<email>" — filter by userId == email
//   "org:<id>"   — filter by organizationId == id

const affiliationCache = new Map();

function getCacheKey(descriptor) {
  if (!descriptor) return null;
  if (descriptor.userId) return `uid:${descriptor.userId}`;
  if (descriptor.userEmail) return `uemail:${normalizeEmail(descriptor.userEmail)}`;
  if (descriptor.organizationId) return `org:${descriptor.organizationId}`;
  return null;
}

function createEntry() {
  return {
    affiliations: [],
    loading: false,
    loaded: false, // once loaded, never fetch again unless explicitly refreshed
    error: null,
    promise: null,
    subscribers: new Set(),
  };
}

function getOrCreateEntry(cacheKey) {
  if (!affiliationCache.has(cacheKey)) {
    affiliationCache.set(cacheKey, createEntry());
  }
  return affiliationCache.get(cacheKey);
}

function notifyEntry(entry) {
  entry.subscribers.forEach((sub) => {
    try {
      sub({ affiliations: entry.affiliations, loading: entry.loading, error: entry.error });
    } catch (e) {
      console.error('Affiliation subscriber error', e);
    }
  });
}

async function fetchAffiliations(descriptor) {
  if (!descriptor) return [];
  let filter = {};
  if (descriptor.userId) filter = { userId: descriptor.userId };
  else if (descriptor.userEmail) filter = { userId: normalizeEmail(descriptor.userEmail) };
  else if (descriptor.organizationId) filter = { organizationId: descriptor.organizationId };
  else return [];

  const rows = await base44.entities.OrganizationAffiliation.filter(filter, '-createdAt', 100);
  return Array.isArray(rows) ? rows : [];
}

async function loadEntry(cacheKey, descriptor, forceReload = false) {
  const entry = getOrCreateEntry(cacheKey);

  // If already loading, return same promise
  if (entry.loading && entry.promise) return entry.promise;

  // If already loaded and not forcing, return cached data
  if (entry.loaded && !forceReload) return entry.affiliations;

  entry.loading = true;
  entry.error = null;
  notifyEntry(entry);

  const promise = (async () => {
    try {
      const rows = await fetchAffiliations(descriptor);
      // Only update if we got results OR it's the first successful load
      entry.affiliations = rows;
      entry.loaded = true;
      entry.error = null;
    } catch (error) {
      entry.error = error;
      // Keep existing affiliations — do NOT clear them on error
      // Mark loaded=true on 429 so we don't retry in an infinite loop
      if (!entry.loaded) entry.loaded = true;
    } finally {
      entry.loading = false;
      entry.promise = null;
      notifyEntry(entry);
    }
    return entry.affiliations;
  })();

  entry.promise = promise;
  return promise;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * descriptor: { userId } | { userEmail } | { organizationId }
 */
export function useOrganizationAffiliations(descriptor) {
  const cacheKey = getCacheKey(descriptor);

  const [state, setState] = useState(() => {
    if (!cacheKey) return { affiliations: [], loading: false, error: null };
    const entry = getOrCreateEntry(cacheKey);
    return { affiliations: entry.affiliations, loading: entry.loading, error: entry.error };
  });

  useEffect(() => {
    if (!cacheKey) {
      setState({ affiliations: [], loading: false, error: null });
      return;
    }

    const entry = getOrCreateEntry(cacheKey);
    const sub = (payload) => setState(payload);
    entry.subscribers.add(sub);

    // Sync state immediately from cache
    setState({ affiliations: entry.affiliations, loading: entry.loading, error: entry.error });

    // Only fetch if not yet loaded and not currently loading
    if (!entry.loaded && !entry.loading) {
      loadEntry(cacheKey, descriptor).catch(() => {});
    }

    return () => {
      entry.subscribers.delete(sub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return state;
}

/**
 * Force-refresh affiliations for a descriptor.
 * descriptor: { userId } | { userEmail } | { organizationId }
 *   OR a plain string (email or id for backward compat)
 */
export async function refreshAffiliations(descriptorOrString) {
  let descriptor = descriptorOrString;

  // Backward compat: if a plain string was passed
  if (typeof descriptorOrString === 'string') {
    const s = descriptorOrString;
    descriptor = s.includes('@') ? { userEmail: s } : { userId: s };
  }
  // Backward compat: { organizationId } passed directly — already fine

  const cacheKey = getCacheKey(descriptor);
  if (!cacheKey) return;
  return loadEntry(cacheKey, descriptor, true);
}

export const refreshAffiliationsForIdentifier = refreshAffiliations;

// ─── User cache (for organization profile lookups) ────────────────────────────

const userCache = new Map();

function getUserEntry(id) {
  if (!userCache.has(id)) {
    userCache.set(id, { user: null, loading: false, loaded: false, error: null, promise: null, subscribers: new Set() });
  }
  return userCache.get(id);
}

function notifyUserEntry(entry) {
  entry.subscribers.forEach((sub) => {
    try { sub({ user: entry.user, loading: entry.loading, error: entry.error }); } catch {}
  });
}

async function loadUserEntry(id) {
  const entry = getUserEntry(id);
  if (entry.loading && entry.promise) return entry.promise;
  if (entry.loaded) return entry.user;

  entry.loading = true;
  entry.error = null;
  notifyUserEntry(entry);

  const promise = (async () => {
    try {
      const response = await base44.entities.User.get(id);
      entry.user = response;
      entry.loaded = true;
      entry.error = null;
    } catch (error) {
      entry.error = error;
      if (!entry.loaded) entry.loaded = true;
      // Keep existing user on error
    } finally {
      entry.loading = false;
      entry.promise = null;
      notifyUserEntry(entry);
    }
    return entry.user;
  })();

  entry.promise = promise;
  return promise;
}

export function useCachedUser(id) {
  const [state, setState] = useState(() => {
    if (!id) return { user: null, loading: false, error: null };
    const entry = getUserEntry(id);
    return { user: entry.user, loading: entry.loading, error: entry.error };
  });

  useEffect(() => {
    if (!id) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    const entry = getUserEntry(id);
    const sub = (payload) => setState(payload);
    entry.subscribers.add(sub);
    setState({ user: entry.user, loading: entry.loading, error: entry.error });

    if (!entry.loaded && !entry.loading) {
      loadUserEntry(id).catch(() => {});
    }

    return () => { entry.subscribers.delete(sub); };
  }, [id]);

  return state;
}

/**
 * Prefill the user cache from an already-fetched list (e.g. getPublicUsers result).
 * Call this once at the top level to avoid individual User.get() calls per affiliation row.
 */
export function prefillUserCache(users = []) {
  users.forEach((u) => {
    if (!u?.id) return;
    const entry = getUserEntry(u.id);
    if (!entry.loaded) {
      entry.user = u;
      entry.loaded = true;
      notifyUserEntry(entry);
    }
  });
}

/**
 * Resolve affiliated profiles from a list of affiliation rows using already-cached users.
 * Falls back to prefilled cache; does NOT make new User.get() calls.
 */
export function resolveAffiliatedProfiles(affiliationRows = [], allUsers = []) {
  return affiliationRows
    .map((row) => {
      // First try allUsers list (already fetched)
      let profile = allUsers.find((u) => u.id === row.userId || u.email === row.userId);
      // Then try user cache
      if (!profile) {
        const cached = userCache.get(row.userId);
        if (cached?.user) profile = cached.user;
      }
      return profile ? { affiliation: row, profile } : null;
    })
    .filter(Boolean);
}