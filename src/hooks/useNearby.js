import { useState, useCallback, useRef } from 'react';

export const MAP_CATS = {
  garage:   { icon:'🔧' },
  parts:    { icon:'🔩' },
  tyres:    { icon:'🛞' },
  petrol:   { icon:'⛽' },
  hardware: { icon:'🏗️' },
  vet:      { icon:'🐾' },
  it:       { icon:'💻' },
  moto:     { icon:'🏍️' },
};

// ── Module-level state — persists across re-renders, resets on full page reload ──

// Results cache: key → { results, ts }
const CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// In-flight deduplication: prevent concurrent requests for the same cache key
// Key → Promise (the ongoing fetch)
const INFLIGHT = new Map();

// Failure cooldown: after an endpoint failure, block retries for 60s
// Key → timestamp of last failure
const FAIL_CACHE = new Map();
const FAIL_TTL_MS = 60 * 1000; // 60 seconds

function cacheKey(cat, lat, lng) {
  return `${cat}:${lat.toFixed(2)}:${lng.toFixed(2)}`;
}

function getCached(cat, lat, lng) {
  const k = cacheKey(cat, lat, lng);
  const entry = CACHE.get(k);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { CACHE.delete(k); return null; }
  return entry.results;
}

function setCache(cat, lat, lng, results) {
  CACHE.set(cacheKey(cat, lat, lng), { results, ts: Date.now() });
}

function isInCooldown(cat, lat, lng) {
  const k = cacheKey(cat, lat, lng);
  const t = FAIL_CACHE.get(k);
  if (!t) return false;
  if (Date.now() - t > FAIL_TTL_MS) { FAIL_CACHE.delete(k); return false; }
  return true;
}

function markFailed(cat, lat, lng) {
  FAIL_CACHE.set(cacheKey(cat, lat, lng), Date.now());
}

export function useNearby() {
  const [bizs, setBizs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null); // null | 'loc' | 'empty' | 'error'
  const [stale, setStale]       = useState(false);
  const [fallback, setFallback] = useState(false);
  const reqId = useRef(0);

  const fetchBiz = useCallback(async (cat, lat, lng) => {
    if (!lat || !lng) { setError('loc'); setFallback(false); return; }

    const key = cacheKey(cat, lat, lng);

    // ── Show cached results immediately ─────────────────────────────────────
    const cached = getCached(cat, lat, lng);
    if (cached) {
      setBizs(cached);
      setStale(false);   // fresh from cache — not stale
      setFallback(false);
      setError(cached.length === 0 ? 'empty' : null);
      setLoading(false);
      // Don't re-fetch if cache is fresh — return immediately
      console.log(`[useNearby] cache hit: ${key} (${cached.length} results)`);
      return;
    }

    // ── In-flight deduplication ──────────────────────────────────────────────
    if (INFLIGHT.has(key)) {
      console.log(`[useNearby] in-flight dedup: ${key} already loading`);
      // Wait for the existing request to complete
      try {
        await INFLIGHT.get(key);
        // After it completes, show whatever is now in cache
        const fresh = getCached(cat, lat, lng);
        if (fresh) {
          setBizs(fresh);
          setError(fresh.length === 0 ? 'empty' : null);
          setFallback(false);
        }
      } catch (_) { /* already handled by the original request */ }
      setLoading(false);
      return;
    }

    // ── Failure cooldown ─────────────────────────────────────────────────────
    if (isInCooldown(cat, lat, lng)) {
      console.log(`[useNearby] failure cooldown: ${key} — showing Maps fallback`);
      setFallback(true);
      setError('empty');
      setLoading(false);
      return;
    }

    // ── New fetch ────────────────────────────────────────────────────────────
    const thisReq = ++reqId.current;
    setLoading(true);
    setStale(false);
    setFallback(false);
    setError(null);
    setBizs([]);

    const fetchPromise = (async () => {
      const url = `/api/nearby?cat=${encodeURIComponent(cat)}&lat=${lat}&lng=${lng}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API HTTP ${res.status}`);
      return await res.json();
    })();

    INFLIGHT.set(key, fetchPromise);

    try {
      const data = await fetchPromise;
      INFLIGHT.delete(key);

      if (thisReq !== reqId.current) return; // stale response guard

      const results = data.results || [];

      if (data.fallbackUsed) {
        markFailed(cat, lat, lng); // enter cooldown so rapid retries are blocked
        setFallback(true);
        setBizs([]);
        setError('empty');
      } else {
        setCache(cat, lat, lng, results);
        setBizs(results);
        setStale(false);
        setFallback(false);
        setError(results.length === 0 ? 'empty' : null);
      }

    } catch (err) {
      INFLIGHT.delete(key);
      if (thisReq !== reqId.current) return;
      console.error('[useNearby] fetch failed:', err.message);
      markFailed(cat, lat, lng); // enter cooldown
      setFallback(true);
      setError('error');
    } finally {
      if (thisReq === reqId.current) setLoading(false);
    }
  }, []);

  return { bizs, loading, error, stale, fallback, fetchBiz };
}
