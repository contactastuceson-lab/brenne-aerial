/**
 * usePublicUser — Résout le profil live d'un utilisateur par son ID.
 * Cache singleton partagé entre tous les composants, évite les requêtes dupliquées.
 * Les données "gravées" dans les posts (avatar, nom, badges) ne sont utilisées qu'en fallback.
 */

const cache = {};           // { [userId]: { data, ts } }
const listeners = {};       // { [userId]: Set<fn> }
const pending = {};         // { [userId]: Promise }
const TTL = 5 * 60 * 1000; // 5 min

function notify(userId) {
  listeners[userId]?.forEach(fn => fn(cache[userId]?.data ?? null));
}

async function fetchUser(userId) {
  if (pending[userId]) return pending[userId];
  const { base44 } = await import('@/api/base44Client');
  pending[userId] = base44.asServiceRole.entities.User.get(userId)
    .then(u => {
      cache[userId] = { data: u, ts: Date.now() };
      notify(userId);
      return u;
    })
    .catch(() => {
      cache[userId] = { data: null, ts: Date.now() };
      notify(userId);
      return null;
    })
    .finally(() => { delete pending[userId]; });
  return pending[userId];
}

export function getOrFetchUser(userId) {
  if (!userId) return;
  const entry = cache[userId];
  if (entry && Date.now() - entry.ts < TTL) return;
  fetchUser(userId);
}

import { useState, useEffect } from 'react';

export default function usePublicUser(userId) {
  const [user, setUser] = useState(() => cache[userId]?.data ?? null);

  useEffect(() => {
    if (!userId) return;

    // Sync from cache immediately
    setUser(cache[userId]?.data ?? null);

    // Subscribe to updates
    if (!listeners[userId]) listeners[userId] = new Set();
    listeners[userId].add(setUser);

    // Fetch if stale or missing
    const entry = cache[userId];
    if (!entry || Date.now() - entry.ts > TTL) {
      fetchUser(userId);
    }

    return () => {
      listeners[userId]?.delete(setUser);
      if (listeners[userId]?.size === 0) delete listeners[userId];
    };
  }, [userId]);

  return user;
}