// useNearby.js — Nearby fetch hook with module-level cache + in-flight dedup + cooldown
// Cache persists across re-renders; resets on page reload (intentional — fresh data on return)

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

// ── Module-level state — survives re-renders, resets on full page reload ─────

const CACHE     = new Map();  // key → { results, ts }
const INFLIGHT  = new Map();  // key → Promise  (in-flight dedup)
const FAILCACHE = new Map();  // key → ts        (60s cooldown after endpoint failure)

const CACHE_TTL   = 30 * 60 * 1000;  // 30 minutes
const FAIL_TTL    =      60 * 1000;  // 60 seconds

// Round to 2dp (~1km) for cache key — same location = same results
// Cache version — increment when result structure or provider changes.
// Changing this invalidates all cached results on next page load.
const CACHE_VERSION = 'v8-mk-google-first'; // bumped: city-aware queries + radius fix // bumped: hybrid Google Places now active

function cacheKey(cat, lat, lng, city, cc) {
  const c = (city || '').toLowerCase().trim().replace(/\s+/g,'_').slice(0, 20);
  return `${CACHE_VERSION}:${cat}:${lat.toFixed(2)}:${lng.toFixed(2)}:${c}:${(cc||'').toUpperCase()}`;
}

function getCache(cat, lat, lng, city, cc) {
  const k = cacheKey(cat, lat, lng, city, cc);
  const e = CACHE.get(k);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { CACHE.delete(k); return null; }
  return e.results;
}

function setCache(cat, lat, lng, city, cc, cc, results) {
  CACHE.set(cacheKey(cat, lat, lng, city), { results, ts: Date.now() });
}

function inCooldown(cat, lat, lng, city, cc) {
  const k = cacheKey(cat, lat, lng, city, cc);
  const t = FAILCACHE.get(k);
  if (!t) return false;
  if (Date.now() - t > FAIL_TTL) { FAILCACHE.delete(k); return false; }
  return true;
}

function markFailed(cat, lat, lng, city, cc) {
  FAILCACHE.set(cacheKey(cat, lat, lng, city, cc), Date.now());
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNearby() {
  const [bizs, setBizs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);   // null | 'loc' | 'empty' | 'error'
  const [stale,   setStale]     = useState(false);  // showing cached while refreshing
  const [fallback, setFallback] = useState(false);  // Overpass failed → show Maps link
  const reqId = useRef(0);

  const fetchBiz = useCallback(async (cat, lat, lng, forceRefresh = false, city = '', cc = '') => {
    if (!lat || !lng) { setError('loc'); setFallback(false); setLoading(false); return; }

    const key = cacheKey(cat, lat, lng, city);

    // ── 1. Cache hit — show instantly, no network request ───────────────────
    if (!forceRefresh) {
      const cached = getCache(cat, lat, lng, city, cc);
      if (cached !== null) {
        console.log(`[nearby] CACHE HIT cat=${cat} results=${cached.length}`);
        setBizs(cached);
        setLoading(false);
        setStale(false);
        setFallback(false);
        setError(cached.length === 0 ? 'empty' : null);
        return;
      }
    }

    // ── 2. Failure cooldown — do NOT block request; just note it ─────────────
    // We still call /api/nearby so Google Places can run even if OSM is in cooldown.
    // The server-side OSM calls are protected by their own timeout budget.
    // Only forceRefresh bypasses the cache; cooldown only affects OSM retry, not Google.
    const _inCooldown = !forceRefresh && inCooldown(cat, lat, lng, city, cc);
    if (_inCooldown) {
      console.log(`[nearby] COOLDOWN cat=${cat} — still calling API for Google results`);
    }

    // ── 3. In-flight dedup — attach to existing request ─────────────────────
    if (INFLIGHT.has(key)) {
      console.log(`[nearby] IN-FLIGHT DEDUP cat=${cat}`);
      try {
        await INFLIGHT.get(key);
        const fresh = getCache(cat, lat, lng);
        if (fresh !== null) {
          setBizs(fresh);
          setError(fresh.length === 0 ? 'empty' : null);
          setFallback(false);
        }
      } catch (_) {}
      setLoading(false);
      return;
    }

    // ── 4. Fresh fetch ───────────────────────────────────────────────────────
    const thisReq = ++reqId.current;
    setLoading(true);
    setStale(false);
    setFallback(false);
    setError(null);
    setBizs([]);

    const fetchPromise = fetch(
      `/api/nearby?cat=${encodeURIComponent(cat)}&lat=${lat}&lng=${lng}${city?'&city='+encodeURIComponent(city):''}${cc?'&cc='+encodeURIComponent(cc):''}`
    ).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

    INFLIGHT.set(key, fetchPromise);

    try {
      const data = await fetchPromise;
      INFLIGHT.delete(key);
      if (thisReq !== reqId.current) return;

      const results = data.results || [];

      if (data.fallbackUsed) {
        // Only enter 60s cooldown when truly empty — not when we have partial results
        if (!data.results || data.results.length === 0) {
          markFailed(cat, lat, lng, city, cc);
        }
        setFallback(true);
        // If we had cached results, show them as stale while fallback is shown
        const cached = getCache(cat, lat, lng, city, cc);
        if (cached && cached.length > 0) {
          setBizs(cached); setStale(true); setError(null);
        } else {
          setBizs([]); setError('empty');
        }
      } else {
        setCache(cat, lat, lng, city, cc, results);
        setBizs(results);
        setStale(false);
        setFallback(false);
        setError(results.length === 0 ? 'empty' : null);
        console.log(`[nearby] FETCHED cat=${cat} returned=${results.length}`);
      }
    } catch (err) {
      INFLIGHT.delete(key);
      if (thisReq !== reqId.current) return;
      console.error(`[nearby] fetch error: ${err.message}`);
      markFailed(cat, lat, lng, city, cc);
      setFallback(true);
      setError('error');
    } finally {
      if (thisReq === reqId.current) setLoading(false);
    }
  }, []);

  return { bizs, loading, error, stale, fallback, fetchBiz };
}
