// api/nearby.js — FixIt Overpass proxy  FIXIT_NEARBY_BUDGET_V7
//
// ── EXECUTION BUDGET ─────────────────────────────────────────────────────────
// Vercel maxDuration = 25s. We target ≤ 18s worst case.
//
// Per-attempt timeout: 8s
// Endpoint strategy: TRY ONE at a time. If primary fails → try secondary ONCE.
//   But only ONE attempt per radius pass (not 2+2+2 = 6 sequential waits).
//
// WORST CASE timeline:
//   Pass 1 primary (8s fail) + Pass 1 secondary (8s fail) = 16s → return fallback
//
// BEST CASE (radius expansion needed):
//   Pass 1 primary succeeds (2s) but 0 results → Pass 2 primary succeeds (4s) = 6s
//
// The key fix: on endpoint failure we do NOT try 3 passes × 2 endpoints = 6 waits.
// We try 1 pass × 2 endpoints = 2 waits max, then return fallback.
//
// Radius passes only expand when OSM DATA is missing (0 results),
// NOT when endpoints are failing. Endpoint failure = stop and fallback immediately.
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS = ['overpass-api.de', 'overpass.kumi.systems'];
const SOCKET_TIMEOUT_MS = 8000;    // 8s per endpoint attempt
const GLOBAL_DEADLINE_MS = 18000;  // 18s total — stop everything after this
const MIN_RESULTS = 3;             // expand radius only if fewer than this many results

// ── Query builder ─────────────────────────────────────────────────────────────
function buildQuery(cat, south, west, north, east) {
  const b = `${south},${west},${north},${east}`;
  const parts = {
    garage: [
      `node["shop"="car_repair"](${b})`,
      `way["shop"="car_repair"](${b})`,
      `relation["shop"="car_repair"](${b})`,
      `node["craft"="car_repair"](${b})`,
      `way["craft"="car_repair"](${b})`,
      `node["amenity"="car_repair"](${b})`,
      `way["amenity"="car_repair"](${b})`,
    ],
    parts: [
      `node["shop"="car_parts"](${b})`,
      `way["shop"="car_parts"](${b})`,
      `node["shop"="auto_parts"](${b})`,
      `way["shop"="auto_parts"](${b})`,
    ],
    tyres: [
      `node["shop"="tyres"](${b})`,
      `way["shop"="tyres"](${b})`,
      `node["shop"="tires"](${b})`,
      `way["shop"="tires"](${b})`,
      `node["shop"="vulcanizer"](${b})`,
      `way["shop"="vulcanizer"](${b})`,
      `node["craft"="tyre_fitting"](${b})`,
      `way["craft"="tyre_fitting"](${b})`,
      `node["service:vehicle:tyres"="yes"](${b})`,
      `way["service:vehicle:tyres"="yes"](${b})`,
      `node["service:vehicle:tires"="yes"](${b})`,
      `way["service:vehicle:tires"="yes"](${b})`,
      `node["shop"="car_repair"]["service:tyres"="yes"](${b})`,
    ],
    petrol: [
      `node["amenity"="fuel"](${b})`,
      `way["amenity"="fuel"](${b})`,
    ],
    hardware: [
      `node["shop"="hardware"](${b})`,
      `way["shop"="hardware"](${b})`,
      `node["shop"="doityourself"](${b})`,
      `way["shop"="doityourself"](${b})`,
      `node["shop"="building_materials"](${b})`,
      `way["shop"="building_materials"](${b})`,
      `node["shop"="tools"](${b})`,
      `way["shop"="tools"](${b})`,
      `node["shop"="garden_centre"](${b})`,
      `way["shop"="garden_centre"](${b})`,
      `node["shop"="electrical"](${b})`,
      `way["shop"="electrical"](${b})`,
    ],
    vet: [
      `node["amenity"="veterinary"](${b})`,
      `way["amenity"="veterinary"](${b})`,
    ],
    it: [
      `node["shop"="computer"](${b})`,
      `way["shop"="computer"](${b})`,
      `node["craft"="electronics_repair"](${b})`,
      `way["craft"="electronics_repair"](${b})`,
      `node["shop"="mobile_phone"](${b})`,
      `way["shop"="mobile_phone"](${b})`,
    ],
    moto: [
      `node["shop"="motorcycle"](${b})`,
      `way["shop"="motorcycle"](${b})`,
      `node["craft"="motorcycle_repair"](${b})`,
      `way["craft"="motorcycle_repair"](${b})`,
      `node["service:vehicle:motorcycle"="yes"](${b})`,
      `way["service:vehicle:motorcycle"="yes"](${b})`,
      `node["shop"="scooter"](${b})`,
      `way["shop"="scooter"](${b})`,
    ],
  };
  const lines = (parts[cat] || parts.garage).join(';\n  ');
  // Overpass internal timeout set to 7s — aligns with our 8s socket timeout
  return `[out:json][timeout:7];\n(\n  ${lines};\n);\nout center tags;`;
}

// ── Scrapyard filter ──────────────────────────────────────────────────────────
const SCRAP_TAGS = new Set(['scrap_yard','recycling','second_hand','salvage']);
const SCRAP_RE   = /auto[\s-]?otpad|авто[\s-]?отпад|schrottplatz|autoverwertung|junkyard|salvage\s+yard|wrecking|vehicle\s+dismantl|recycl/i;

function isScrapyard(tags) {
  if (SCRAP_TAGS.has(tags.shop) || SCRAP_TAGS.has(tags.amenity)) return true;
  if (tags.recycling_type || tags.craft === 'salvage') return true;
  return SCRAP_RE.test([tags.name, tags.operator, tags.description].filter(Boolean).join(' '));
}

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversine(la1, lo1, la2, lo2) {
  const R = 6371, dLa = (la2-la1)*Math.PI/180, dLo = (lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── Single Overpass request ───────────────────────────────────────────────────
function fetchOverpass(host, query) {
  return new Promise((resolve, reject) => {
    const https   = require('https');
    const encoded = 'data=' + encodeURIComponent(query);
    const body    = Buffer.from(encoded, 'utf8');
    const req = https.request({
      hostname: host, path: '/api/interpreter', method: 'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': body.length,
        'User-Agent':     'FixItApp/1.0 Vercel-Proxy',
        'Accept':         'application/json',
      },
      timeout: SOCKET_TIMEOUT_MS,
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        if (res.statusCode === 429) { reject(new Error('rate_limited')); return; }
        if (res.statusCode !== 200) { reject(new Error(`http_${res.statusCode}`)); return; }
        try { resolve(JSON.parse(data)); }
        catch (_) { reject(new Error('json_parse')); }
      });
    });
    req.on('error',   e  => reject(new Error(`net_${e.code||e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('socket_timeout')); });
    req.write(body); req.end();
  });
}

// ── Attempt one radius with endpoint failover ─────────────────────────────────
// Returns { data, endpointFailed }
// endpointFailed=true means ALL endpoints failed (don't try wider radius)
// endpointFailed=false means Overpass responded (possibly with 0 elements)
async function fetchWithFailover(query, startMs, radiusKm) {
  for (let ei = 0; ei < ENDPOINTS.length; ei++) {
    const host    = ENDPOINTS[ei];
    const elapsed = Date.now() - startMs;
    const remain  = GLOBAL_DEADLINE_MS - elapsed;

    console.log(`[nearby] endpoint=${host} radius=${radiusKm}km deadline_remaining=${remain}ms`);

    if (remain < SOCKET_TIMEOUT_MS + 500) {
      // Not enough budget for another full attempt
      console.warn(`[nearby] deadline_remaining=${remain}ms < ${SOCKET_TIMEOUT_MS+500}ms — aborting`);
      return { data: null, endpointFailed: true };
    }

    const t0 = Date.now();
    try {
      const d = await fetchOverpass(host, query);
      const ms = Date.now() - t0;
      console.log(`[nearby] pass_success endpoint=${host} raw=${(d.elements||[]).length} durationMs=${ms}`);
      return { data: d, endpointFailed: false };
    } catch (err) {
      const ms = Date.now() - t0;
      console.warn(`[nearby] endpoint_failure endpoint=${host} reason=${err.message} durationMs=${ms}`);
      // Only try secondary endpoint if error is NOT timeout/rate-limit
      // (timeout means network is struggling — secondary unlikely to help)
      if (err.message === 'socket_timeout' || err.message === 'rate_limited') {
        console.warn(`[nearby] skipping secondary endpoint after ${err.message}`);
        return { data: null, endpointFailed: true };
      }
      // For other errors (http_503, net_ECONNRESET etc) → try next endpoint
      // but only if we have budget
    }
  }
  return { data: null, endpointFailed: true };
}

// ── Process elements ──────────────────────────────────────────────────────────
function processElements(elements, cat, latN, lngN, distLimitKm, seen) {
  const results = [];
  for (const el of elements) {
    const tags = el.tags || {};
    if (cat === 'garage' && isScrapyard(tags)) continue;
    const displayName = tags.name || tags.brand || tags.operator || tags.amenity || null;
    if (!displayName || seen.has(displayName)) continue;
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon  ?? el.center?.lon;
    if (!elLat || !elLon) continue;
    const dist = haversine(latN, lngN, parseFloat(elLat), parseFloat(elLon));
    if (dist > distLimitKm) continue;
    seen.add(displayName);
    const street = tags['addr:street']
      ? tags['addr:street'] + (tags['addr:housenumber'] ? ' '+tags['addr:housenumber'] : '')
      : null;
    results.push({
      name:    displayName,
      lat:     parseFloat(elLat),
      lng:     parseFloat(elLon),
      dist:    Math.round(dist * 1000) / 1000,
      addr:    [street, tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ') || '',
      phone:   tags.phone    || tags['contact:phone']   || '',
      opening: tags.opening_hours || '',
      website: tags.website  || tags['contact:website'] || '',
    });
  }
  return results;
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET')     { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { cat = 'garage', lat, lng, city = '', cc = '' } = req.query;
  const countryCode = (cc || '').toUpperCase();
  const latN = parseFloat(lat), lngN = parseFloat(lng);
  if (isNaN(latN) || isNaN(lngN)) { res.status(400).json({ error: 'Invalid lat/lng' }); return; }

  const startMs = Date.now();

  // ── Radius passes ─────────────────────────────────────────────────────────
  // Pass 1: ~5km  — city users, fast single query
  // Pass 2: ~30km — rural users (Kumarino→Veles=16km fits here)
  //
  // Pass 2 only runs when:
  //   a) Pass 1 returned 0 or <3 results (data gap, not endpoint failure)
  //   b) Sufficient time budget remains (≥ 9s left)
  //
  // Each pass tries primary endpoint; on timeout/rate-limit → no secondary.
  // On non-timeout HTTP error → try secondary endpoint once.
  //
  // Budget proof (worst case):
  //   Pass 1 primary: 8s timeout → no secondary (timeout) → 8s
  //   Deadline check: 18-8=10s remaining ≥ 9s → try pass 2
  //   Pass 2 primary: 8s timeout → no secondary → 8s
  //   Total: 16s << 25s ✓
  //
  //   Pass 1 primary: http_503 → try secondary: 8s fail → 16s
  //   Deadline check: 18-16=2s < 9s → STOP → return fallback
  //   Total: 16s << 25s ✓

  // ── Google-first policy for countries with thin OSM coverage ────────────────
  // For MK garage and tyres: skip OSM entirely; Google Places is the primary source.
  // OSM is still used for other categories and other countries as normal.
  const MK_GOOGLE_FIRST = countryCode === 'MK' && (cat === 'tyres' || cat === 'garage');

  if (MK_GOOGLE_FIRST) {
    console.log(`[nearby] cat=${cat} country=${countryCode} provider_policy=google_first`);
  }

  const PASSES = [
    { ns: 0.045, ew: 0.060, radiusKm: 5  },
    { ns: 0.270, ew: 0.360, radiusKm: 30 },
  ];

  const seen       = new Set();
  let   allResults = [];

  for (let pi = 0; pi < PASSES.length; pi++) {  // OSM always runs; MK_GOOGLE_FIRST only controls Google threshold
    const { ns, ew, radiusKm } = PASSES[pi];
    const elapsed = Date.now() - startMs;
    const remain  = GLOBAL_DEADLINE_MS - elapsed;

    console.log(`[nearby] PASS${pi+1} cat=${cat} radiusKm=${radiusKm} deadline_remaining=${remain}ms`);

    // Abort if not enough budget for a meaningful attempt (8s + 1s overhead)
    if (remain < SOCKET_TIMEOUT_MS + 1000) {
      console.warn(`[nearby] deadline_remaining=${remain}ms — skipping PASS${pi+1}, returning fallback`);
      break;
    }

    const south = (latN - ns).toFixed(6);
    const north = (latN + ns).toFixed(6);
    const west  = (lngN - ew).toFixed(6);
    const east  = (lngN + ew).toFixed(6);
    const query = buildQuery(cat, south, west, north, east);

    const { data, endpointFailed } = await fetchWithFailover(query, startMs, radiusKm);

    if (endpointFailed || !data) {
      // Endpoint failure — do NOT try wider radius (Overpass is unavailable, not data-empty)
      console.warn(`[nearby] endpoint_failure on PASS${pi+1} — stopping, will return fallback`);
      break;
    }

    const newResults = processElements(data.elements || [], cat, latN, lngN, radiusKm + 5, seen);
    allResults = [...allResults, ...newResults].sort((a,b) => a.dist - b.dist);
    console.log(`[nearby] PASS${pi+1} raw=${(data.elements||[]).length} new=${newResults.length} total=${allResults.length}`);

    if (allResults.length >= MIN_RESULTS) {
      console.log(`[nearby] ≥${MIN_RESULTS} results — stopping at PASS${pi+1}`);
      break;
    }
    // < MIN_RESULTS but endpoint worked → expand radius on next iteration
  }

  const totalMs = Date.now() - startMs;
  let results = allResults.slice(0, 25);

  // ── Hybrid: call Google Places ──────────────────────────────────────────────
  // Categories with poor OSM coverage in MK (tyres/garage/vet) always get Google
  // regardless of OSM count — OSM may return sparse/irrelevant results that look
  // sufficient (≥5) but miss real local businesses like vulcanizers or workshops.
  // Other categories use threshold: call Google only when OSM returns <5 results.
  const ALWAYS_GOOGLE = new Set(['tyres', 'garage', 'vet']); // poor OSM coverage in MK
  const HYBRID_THRESHOLD = 5;
  const timeLeft = GLOBAL_DEADLINE_MS - (Date.now() - startMs);
  const needsPlaces = timeLeft > 2500 && (
    MK_GOOGLE_FIRST ||                      // Google-first for MK tyres/garage
    ALWAYS_GOOGLE.has(cat) ||               // always augment with Google
    results.length < HYBRID_THRESHOLD       // or OSM was thin
  );
  const osmFailed = results.length === 0;

  console.log(`[nearby] cat=${cat} country=${countryCode} osm_count=${results.length} osm_failed=${osmFailed} google_called=${needsPlaces} deadline_left=${timeLeft}ms`);

  if (needsPlaces) {
    const googleT0 = Date.now();
    console.log(`[nearby] google_start cat=${cat} osm_count=${results.length} deadline_left=${timeLeft}ms`);
    try {
      // Direct require — no HTTP hop, no domain dependency, no deployment mismatch
      const { fetchPlacesForCategory } = require('./places-lib.js');
      const placesData = await fetchPlacesForCategory(cat, latN, lngN, 30000, city, countryCode);

      if (!placesData?.configured) {
        console.log('[nearby] google_called=true configured=false — OSM only');
      } else if (placesData?.results?.length >= 0) {
        const googleRaw = placesData.results || [];
        const gNames = googleRaw.slice(0,8).map(r=>`${r.name}(${r.dist}km)`).join(', ');
        console.log(`[nearby] google_called=true google_count=${googleRaw.length} google_names=[${gNames}]`);
        // Merge: dedup by normalized name & close proximity (~50m)
        const osmNames = new Set(results.map(r => r.name.toLowerCase().trim()));
        const SCRAP_RE = /отпад|auto.?otpad|schrottplatz|autoverwertung|junkyard|salvage.?yard|wrecking|dismantl|recycl/i;
        let filteredScrap = 0;
        const deduped = googleRaw.filter(p => {
          const pname = (p.name || '').toLowerCase().trim();
          // Exclude scrapyards from garage even in Google results
          if (cat === 'garage' && SCRAP_RE.test(pname)) { filteredScrap++; return false; }
          // Skip if OSM already has same name
          if (osmNames.has(pname)) return false;
          // Skip if within 50m of existing OSM result (same business)
          return !results.some(r => Math.abs(r.lat - p.lat) < 0.0005 && Math.abs(r.lng - p.lng) < 0.0005);
        });
        results = [...results, ...deduped].sort((a, b) => a.dist - b.dist).slice(0, 25);
        if (results.length > 0) {
          const finalNames = results.slice(0,8).map(r=>`${r.name}(${r.dist}km)`).join(', ');
          console.log(`[nearby] merged_count=${results.length} filtered_scrap=${filteredScrap} dedup_removed=${googleRaw.length-deduped.length} final_names=[${finalNames}]`);
        }
      }
    } catch (err) {
      console.warn(`[nearby] google_failed reason=${err.message} elapsed=${Date.now()-googleT0}ms`);
    }
  }

  console.log(`[nearby] total_duration_ms=${Date.now()-startMs} cat=${cat} returned=${results.length}`);

  console.log(`[nearby] COMPLETE cat=${cat} country=${countryCode} final_count=${results.length} total_ms=${totalMs}`);

  res.status(200).json({
    results,
    fallbackUsed: results.length === 0,
    fallbackReason: results.length === 0 ? 'no_results_or_endpoint_failure' : undefined,
    totalMs,
    cat,
  });
};
