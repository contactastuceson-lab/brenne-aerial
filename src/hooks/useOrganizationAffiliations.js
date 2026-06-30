import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const createAffiliationKeys = (user) => {
  if (!user) return [];
  const keys = new Set();
  if (user.id) keys.add(`id:${user.id}`);
  if (user.email) keys.add(`email:${normalizeEmail(user.email)}`);
  return [...keys];
};

const affiliationCache = new Map();

const registerAffiliationEntryKeys = (entry, keys) => {
  keys.forEach((key) => {
    entry.keys.add(key);
    affiliationCache.set(key, entry);
  });
};

const createAffiliationEntry = (keys) => {
  const entry = {
    keys: new Set(keys),
    affiliations: [],
    loading: false,
    error: null,
    promise: null,
    subscribers: new Set(),
  };
  keys.forEach((key) => affiliationCache.set(key, entry));
  return entry;
};

const getAffiliationEntry = (user) => {
  const keys = createAffiliationKeys(user);
  if (!keys.length) return null;

  for (const key of keys) {
    if (affiliationCache.has(key)) {
      const existingEntry = affiliationCache.get(key);
      registerAffiliationEntryKeys(existingEntry, keys);
      return existingEntry;
    }
  }

  return createAffiliationEntry(keys);
};

const dedupeAffiliations = (rows = []) => {
  return Array.from(new Map((rows || []).map((row) => [row.id, row])).values());
};

const fetchAffiliationRows = async (user) => {
  if (!user) return [];
  const requests = [];
  if (user.id) requests.push(base44.entities.OrganizationAffiliation.filter({ userId: user.id }, '-createdAt', 100));
  if (user.email) requests.push(base44.entities.OrganizationAffiliation.filter({ userId: normalizeEmail(user.email) }, '-createdAt', 100));

  const results = await Promise.allSettled(requests);
  const rows = [];
  let anySuccess = false;

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      anySuccess = true;
      rows.push(...(result.value || []));
    }
  });

  if (!anySuccess && results.length > 0) {
    throw results[0].reason;
  }

  return dedupeAffiliations(rows);
};

const notifyAffiliationEntry = (entry) => {
  entry.subscribers.forEach((subscriber) => {
    try {
      subscriber({ affiliations: entry.affiliations, loading: entry.loading, error: entry.error });
    } catch (error) {
      console.error('Affiliation cache subscriber failed', error);
    }
  });
};

const loadAffiliationsForEntry = async (entry, user) => {
  if (!entry || !user) return;
  if (entry.loading && entry.promise) return entry.promise;

  entry.loading = true;
  entry.error = null;
  notifyAffiliationEntry(entry);

  const promise = (async () => {
    try {
      const rows = await fetchAffiliationRows(user);
      entry.affiliations = rows;
      entry.error = null;
      return entry.affiliations;
    } catch (error) {
      entry.error = error;
      return entry.affiliations;
    } finally {
      entry.loading = false;
      entry.promise = null;
      notifyAffiliationEntry(entry);
    }
  })();

  entry.promise = promise;
  return promise;
};

const createUserKey = (identifier) => {
  if (!identifier) return null;
  const normalized = normalizeEmail(identifier);
  return identifier.includes('@') ? `email:${normalized}` : `id:${identifier}`;
};

export const refreshAffiliationsForIdentifier = async (identifier) => {
  if (!identifier) return null;
  const key = createUserKey(identifier);
  if (!key) return null;

  const entry = affiliationCache.get(key);
  if (!entry) {
    const user = identifier.includes('@') ? { email: identifier } : { id: identifier };
    return loadAffiliationsForEntry(getAffiliationEntry(user), user);
  }

  const user = identifier.includes('@') ? { email: identifier } : { id: identifier };
  return loadAffiliationsForEntry(entry, user);
};

export function useOrganizationAffiliations(user) {
  const [state, setState] = useState(() => {
    const entry = getAffiliationEntry(user);
    return entry
      ? { affiliations: entry.affiliations, loading: entry.loading, error: entry.error }
      : { affiliations: [], loading: false, error: null };
  });

  useEffect(() => {
    const entry = getAffiliationEntry(user);
    if (!entry) {
      setState({ affiliations: [], loading: false, error: null });
      return undefined;
    }

    const subscriber = (payload) => setState(payload);
    entry.subscribers.add(subscriber);
    setState({ affiliations: entry.affiliations, loading: entry.loading, error: entry.error });

    if (!entry.loading && entry.affiliations.length === 0) {
      loadAffiliationsForEntry(entry, user).catch(() => {});
    }

    return () => {
      entry.subscribers.delete(subscriber);
    };
  }, [user?.id, normalizeEmail(user?.email)]);

  return state;
}

const userCache = new Map();

const createUserEntry = (id) => {
  const entry = {
    id,
    user: null,
    loading: false,
    error: null,
    promise: null,
    subscribers: new Set(),
  };
  userCache.set(id, entry);
  return entry;
};

const getUserEntry = (id) => {
  if (!id) return null;
  return userCache.get(id) || createUserEntry(id);
};

const notifyUserEntry = (entry) => {
  entry.subscribers.forEach((subscriber) => {
    try {
      subscriber({ user: entry.user, loading: entry.loading, error: entry.error });
    } catch (error) {
      console.error('User cache subscriber failed', error);
    }
  });
};

const loadUserForEntry = async (entry) => {
  if (!entry || !entry.id) return;
  if (entry.loading && entry.promise) return entry.promise;

  entry.loading = true;
  entry.error = null;
  notifyUserEntry(entry);

  const promise = (async () => {
    try {
      const response = await base44.entities.User.get(entry.id);
      entry.user = response;
      entry.error = null;
      return response;
    } catch (error) {
      entry.error = error;
      return entry.user;
    } finally {
      entry.loading = false;
      entry.promise = null;
      notifyUserEntry(entry);
    }
  })();

  entry.promise = promise;
  return promise;
};

export function useCachedUser(id) {
  const [state, setState] = useState(() => {
    const entry = getUserEntry(id);
    return entry
      ? { user: entry.user, loading: entry.loading, error: entry.error }
      : { user: null, loading: false, error: null };
  });

  useEffect(() => {
    if (!id) {
      setState({ user: null, loading: false, error: null });
      return undefined;
    }

    const entry = getUserEntry(id);
    const subscriber = (payload) => setState(payload);
    entry.subscribers.add(subscriber);
    setState({ user: entry.user, loading: entry.loading, error: entry.error });

    if (!entry.loading && entry.user === null) {
      loadUserForEntry(entry).catch(() => {});
    }

    return () => {
      entry.subscribers.delete(subscriber);
    };
  }, [id]);

  return state;
}
