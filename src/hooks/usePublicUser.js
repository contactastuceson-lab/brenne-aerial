/**
 * usePublicUser — Résout le profil live d'un utilisateur par son ID.
 * Cache singleton partagé entre tous les composants, évite les requêtes dupliquées.
 * Utilise la fonction backend getPublicUsers (service role) pour lire n'importe quel profil.
 */

import { useState, useEffect } from 'react';

const PROFILE_CACHE_KEY = 'eza-public-user-cache';
const cache = (() => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY)) || {};
  } catch {
    return {};
  }
})();
const listeners = {};       // { [userId]: Set<fn> }
const pending = {};         // { [userId]: Promise }
const TTL = 5 * 60 * 1000; // 5 min
const LIVE_REFRESH_MS = 30 * 1000;

// Shared batch of user IDs to resolve
let batchQueue = new Set();
let batchTimer = null;
let refreshTimer = null;

function notify(userId) {
  listeners[userId]?.forEach(fn => fn(cache[userId]?.data ?? null));
}

function persistCache() {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // The in-memory cache remains available when device storage is unavailable.
  }
}

async function fetchBatch(userIds) {
  const { base44 } = await import('@/api/base44Client');
  try {
    const res = await base44.functions.invoke('getPublicUsers', {});
    const allUsers = res?.data || [];
    const byId = {};
    allUsers.forEach(u => { byId[u.id] = u; });

    userIds.forEach(userId => {
      const u = byId[userId] || null;
      cache[userId] = { data: u, ts: Date.now() };
      notify(userId);
      delete pending[userId];
    });
    persistCache();
  } catch {
    userIds.forEach(userId => {
      cache[userId] = { data: null, ts: Date.now() };
      notify(userId);
      delete pending[userId];
    });
  }
}

function scheduleBatch(userId) {
  batchQueue.add(userId);
  if (batchTimer) return;
  batchTimer = setTimeout(() => {
    const ids = [...batchQueue];
    batchQueue = new Set();
    batchTimer = null;
    fetchBatch(ids);
  }, 20); // 20ms debounce to batch concurrent calls
}

function fetchUser(userId) {
  if (pending[userId]) return;
  // Mark as pending immediately to avoid duplicate scheduling
  pending[userId] = true;
  scheduleBatch(userId);
}

function ensureLiveRefresh() {
  if (refreshTimer) return;
  refreshTimer = setInterval(() => {
    const userIds = Object.keys(listeners).filter(userId => listeners[userId]?.size && !pending[userId]);
    if (!userIds.length) return;
    userIds.forEach(userId => { pending[userId] = true; });
    fetchBatch(userIds);
  }, LIVE_REFRESH_MS);
}

function stopLiveRefreshIfUnused() {
  if (Object.keys(listeners).length || !refreshTimer) return;
  clearInterval(refreshTimer);
  refreshTimer = null;
}

export function getOrFetchUser(userId) {
  if (!userId) return;
  const entry = cache[userId];
  if (entry && Date.now() - entry.ts < TTL) return;
  if (!pending[userId]) fetchUser(userId);
}

export default function usePublicUser(userId) {
  const [user, setUser] = useState(() => cache[userId] ? cache[userId].data : undefined);

  useEffect(() => {
    if (!userId) return;

    // Sync from cache immediately
    setUser(cache[userId] ? cache[userId].data : undefined);

    // Subscribe to updates
    if (!listeners[userId]) listeners[userId] = new Set();
    listeners[userId].add(setUser);

    // Refresh immediately on display, then keep active profiles in sync.
    fetchUser(userId);
    ensureLiveRefresh();

    return () => {
      listeners[userId]?.delete(setUser);
      if (listeners[userId]?.size === 0) delete listeners[userId];
      stopLiveRefreshIfUnused();
    };
  }, [userId]);

  return user;
}