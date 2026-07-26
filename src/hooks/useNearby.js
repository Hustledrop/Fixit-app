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

const CACHE_VERSION = 'v13-debug'; // bumped: placeId lookup, default-deny on miss, inferredCat/classifyReason on results

// All cache helper functions share the same signature: (cat, lat, lng, city, cc)
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

function setCache(cat, lat, lng, city, cc, results) {
  CACHE.set(cacheKey(cat, lat, lng, city, cc), { results, ts: Date.now() });
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

  // fetchBiz(cat, lat, lng, forceRefresh, city, cc)
  const fetchBiz = useCallback(async (cat, lat, lng, forceRefresh = false, city = '', cc = '') => {
    if (!lat || !lng) { setError('loc'); setFallback(false); setLoading(false); return; }

    const key = cacheKey(cat, lat, lng, city, cc);

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
    const _inCooldown = !forceRefresh && inCooldown(cat, lat, lng, city, cc);
    if (_inCooldown) {
      console.log(`[nearby] COOLDOWN cat=${cat} — still calling API for Google results`);
    }

    // ── 3. In-flight dedup — attach to existing request ─────────────────────
    if (INFLIGHT.has(key)) {
      console.log(`[nearby] IN-FLIGHT DEDUP cat=${cat}`);
      try {
        await INFLIGHT.get(key);
        const fresh = getCache(cat, lat, lng, city, cc);
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
        // fallbackUsed = results.length === 0 on the server
        // This can happen on cold start even when Google would succeed on a warm retry.
        // Only enter 60s cooldown + show Maps button when genuinely empty.
        markFailed(cat, lat, lng, city, cc);
        setFallback(true);
        const cached = getCache(cat, lat, lng, city, cc);
        if (cached && cached.length > 0) {
          // Show stale results while Maps fallback button is available
          setBizs(cached); setStale(true); setError(null);
        } else {
          setBizs([]); setError('empty');
        }
      } else {
        // Never cache empty results — empty may be a transient failure, not real data
        if (results.length > 0) {
          setCache(cat, lat, lng, city, cc, results);
        }
        setBizs(results);
        setStale(false);
        setFallback(false);
        setError(results.length === 0 ? 'empty' : null);
        const ms = data.totalMs ? ` server_ms=${data.totalMs}` : '';
        console.log(`[nearby] FETCHED cat=${cat} returned=${results.length}${ms}`);
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
