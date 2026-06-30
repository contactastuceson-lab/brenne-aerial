/**
 * Affiliation Store — source de vérité unique pour tout le système d'affiliation.
 *
 * Architecture :
 *  - Un Map de cache côté module (singleton par session navigateur)
 *  - Clés : "org:<organizationId>" ou "uid:<userId>"
 *  - Chaque entrée est chargée UNE seule fois, puis figée (loaded=true)
 *  - En cas d'erreur (429, réseau) : on conserve les données existantes, on ne vide pas
 *  - Les composants s'abonnent via useOrganizationAffiliations(descriptor)
 *  - refreshAffiliations(descriptor) force un rechargement (après mutation)
 *  - prefillUserCache(users) + resolveAffiliatedProfiles(rows, users) évitent les User.get() N+1
 */

import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

// ─── Normalisation ────────────────────────────────────────────────────────────

const normalizeEmail = (v) => String(v || '').trim().toLowerCase();

// ─── Cache d'affiliations ─────────────────────────────────────────────────────
// Clé : "org:<id>" | "uid:<id>" | "uemail:<email>"

const affiliationStore = new Map(); // cacheKey → AffiliationEntry

function buildCacheKey(descriptor) {
  if (!descriptor) return null;
  if (descriptor.organizationId) return `org:${descriptor.organizationId}`;
  if (descriptor.userId)         return `uid:${descriptor.userId}`;
  if (descriptor.userEmail)      return `uemail:${normalizeEmail(descriptor.userEmail)}`;
  return null;
}

function buildFilter(descriptor) {
  if (descriptor.organizationId) return { organizationId: descriptor.organizationId };
  if (descriptor.userId)         return { userId: descriptor.userId };
  if (descriptor.userEmail)      return { userId: normalizeEmail(descriptor.userEmail) };
  return null;
}

function makeEntry() {
  return {
    affiliations: [],
    loading: false,
    loaded: false,   // true dès le premier fetch terminé (succès OU erreur)
    error: null,
    promise: null,
    subscribers: new Set(),
  };
}

function getEntry(cacheKey) {
  if (!affiliationStore.has(cacheKey)) {
    affiliationStore.set(cacheKey, makeEntry());
  }
  return affiliationStore.get(cacheKey);
}

function notify(entry) {
  const snapshot = { affiliations: entry.affiliations, loading: entry.loading, error: entry.error };
  entry.subscribers.forEach((sub) => {
    try { sub(snapshot); } catch {}
  });
}

async function fetchEntry(cacheKey, descriptor, forceReload = false) {
  const entry = getEntry(cacheKey);

  // Déjà en cours → même promesse
  if (entry.loading && entry.promise) return entry.promise;

  // Déjà chargé et pas de forçage → données en cache
  if (entry.loaded && !forceReload) return entry.affiliations;

  const filter = buildFilter(descriptor);
  if (!filter) return entry.affiliations;

  entry.loading = true;
  entry.error = null;
  notify(entry);

  const promise = (async () => {
    try {
      const rows = await base44.entities.OrganizationAffiliation.filter(filter, '-createdAt', 100);
      entry.affiliations = Array.isArray(rows) ? rows : [];
      entry.error = null;
    } catch (err) {
      entry.error = err;
      // NE PAS vider entry.affiliations — on conserve les données existantes en cas de 429/erreur réseau
    } finally {
      entry.loading = false;
      entry.loaded = true;
      entry.promise = null;
      notify(entry);
    }
    return entry.affiliations;
  })();

  entry.promise = promise;
  return promise;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * descriptor: { organizationId } | { userId } | { userEmail }
 *
 * - "organizationId" : liste les affiliations DONT l'organisation est l'owner (pour le tab de gestion)
 * - "userId" / "userEmail" : liste les affiliations DE cet utilisateur (pour les badges / profil)
 */
export function useOrganizationAffiliations(descriptor) {
  const cacheKey = useMemo(() => buildCacheKey(descriptor), [
    descriptor?.organizationId,
    descriptor?.userId,
    descriptor?.userEmail,
  ]);

  const [state, setState] = useState(() => {
    if (!cacheKey) return { affiliations: [], loading: false, error: null };
    const e = getEntry(cacheKey);
    return { affiliations: e.affiliations, loading: e.loading, error: e.error };
  });

  useEffect(() => {
    if (!cacheKey) {
      setState({ affiliations: [], loading: false, error: null });
      return;
    }

    const entry = getEntry(cacheKey);
    const sub = (s) => setState(s);
    entry.subscribers.add(sub);

    // Synchronisation immédiate depuis le cache
    setState({ affiliations: entry.affiliations, loading: entry.loading, error: entry.error });

    // Chargement initial uniquement si pas encore fait
    if (!entry.loaded && !entry.loading) {
      fetchEntry(cacheKey, descriptor).catch(() => {});
    }

    return () => { entry.subscribers.delete(sub); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return state;
}

// ─── Refresh (après mutation) ─────────────────────────────────────────────────

/**
 * Forcer le rechargement d'une entrée après une création / mise à jour / suppression.
 * descriptor: { organizationId } | { userId } | { userEmail }
 *   OU une chaîne (email ou id, rétrocompat)
 */
export async function refreshAffiliations(descriptorOrString) {
  let descriptor = descriptorOrString;

  if (typeof descriptorOrString === 'string') {
    const s = descriptorOrString;
    descriptor = s.includes('@') ? { userEmail: s } : { userId: s };
  }

  const cacheKey = buildCacheKey(descriptor);
  if (!cacheKey) return;
  return fetchEntry(cacheKey, descriptor, true);
}

// Alias rétrocompat
export const refreshAffiliationsForIdentifier = refreshAffiliations;

// ─── Cache utilisateur ────────────────────────────────────────────────────────

const userStore = new Map(); // userId → UserEntry

function makeUserEntry(id) {
  return { id, user: null, loading: false, loaded: false, error: null, promise: null, subscribers: new Set() };
}

function getUserEntry(id) {
  if (!userStore.has(id)) userStore.set(id, makeUserEntry(id));
  return userStore.get(id);
}

function notifyUser(entry) {
  const snapshot = { user: entry.user, loading: entry.loading, error: entry.error };
  entry.subscribers.forEach((sub) => { try { sub(snapshot); } catch {} });
}

async function fetchUser(id) {
  const entry = getUserEntry(id);
  if (entry.loading && entry.promise) return entry.promise;
  if (entry.loaded) return entry.user;

  entry.loading = true;
  entry.error = null;
  notifyUser(entry);

  const promise = (async () => {
    try {
      entry.user = await base44.entities.User.get(id);
      entry.error = null;
    } catch (err) {
      entry.error = err;
      // Conserver entry.user existant
    } finally {
      entry.loading = false;
      entry.loaded = true;
      entry.promise = null;
      notifyUser(entry);
    }
    return entry.user;
  })();

  entry.promise = promise;
  return promise;
}

export function useCachedUser(id) {
  const [state, setState] = useState(() => {
    if (!id) return { user: null, loading: false, error: null };
    const e = getUserEntry(id);
    return { user: e.user, loading: e.loading, error: e.error };
  });

  useEffect(() => {
    if (!id) { setState({ user: null, loading: false, error: null }); return; }
    const entry = getUserEntry(id);
    const sub = (s) => setState(s);
    entry.subscribers.add(sub);
    setState({ user: entry.user, loading: entry.loading, error: entry.error });
    if (!entry.loaded && !entry.loading) fetchUser(id).catch(() => {});
    return () => { entry.subscribers.delete(sub); };
  }, [id]);

  return state;
}

/**
 * Pré-remplir le cache utilisateur à partir d'une liste déjà chargée (ex: getPublicUsers).
 * Évite les User.get() individuels par ligne d'affiliation.
 */
export function prefillUserCache(users = []) {
  users.forEach((u) => {
    if (!u?.id) return;
    const entry = getUserEntry(u.id);
    if (!entry.loaded) {
      entry.user = u;
      entry.loaded = true;
      notifyUser(entry);
    }
  });
}

/**
 * Résoudre les profils des affiliés depuis la liste déjà chargée + cache userStore.
 * Ne fait AUCUNE requête réseau.
 */
export function resolveAffiliatedProfiles(affiliationRows = [], allUsers = []) {
  return affiliationRows
    .map((row) => {
      // 1. Dans la liste fournie (id ou email)
      let profile = allUsers.find((u) => u.id === row.userId || u.email === row.userId);
      // 2. Dans le cache userStore
      if (!profile) {
        const cached = userStore.get(row.userId);
        if (cached?.user) profile = cached.user;
      }
      return profile ? { affiliation: row, profile } : null;
    })
    .filter(Boolean);
}