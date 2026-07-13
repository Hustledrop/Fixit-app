// api/nearby.js — FixIt Overpass proxy  FIXIT_NEARBY_RURAL_V6
// Progressive radius: 5km → 15km → 30km (stops when ≥3 results found)
// Scrapyard/recycling excluded from garage results
// Global category queries, MK-aware fallback

const OVERPASS_ENDPOINTS = [
  'overpass-api.de',
  'overpass.kumi.systems',
];

// ── Query builder ─────────────────────────────────────────────────────────────
function buildQuery(cat, south, west, north, east) {
  const b = `${south},${west},${north},${east}`;
  const parts = {
    garage: [
      // Include all common car-repair tags globally
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
      // Global tyre shop tags
      `node["shop"="tyres"](${b})`,
      `way["shop"="tyres"](${b})`,
      `node["shop"="tires"](${b})`,
      `way["shop"="tires"](${b})`,
      // Eastern Europe / Balkans: vulcanizer
      `node["shop"="vulcanizer"](${b})`,
      `way["shop"="vulcanizer"](${b})`,
      // UK tyre fitting
      `node["craft"="tyre_fitting"](${b})`,
      `way["craft"="tyre_fitting"](${b})`,
      // Service subtags on car_repair
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
      // Global: hardware, DIY, building materials
      `node["shop"="hardware"](${b})`,
      `way["shop"="hardware"](${b})`,
      `node["shop"="doityourself"](${b})`,
      `way["shop"="doityourself"](${b})`,
      `node["shop"="building_materials"](${b})`,
      `way["shop"="building_materials"](${b})`,
      // Tools
      `node["shop"="tools"](${b})`,
      `way["shop"="tools"](${b})`,
      // Garden / home improvement
      `node["shop"="garden_centre"](${b})`,
      `way["shop"="garden_centre"](${b})`,
      // Electrical supplies (common in MK/Balkans for this category)
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
      // Scooters (common in Balkans)
      `node["shop"="scooter"](${b})`,
      `way["shop"="scooter"](${b})`,
    ],
  };
  const lines = (parts[cat] || parts.garage).join(';\n  ');
  return `[out:json][timeout:25];\n(\n  ${lines};\n);\nout center tags;`;
}

// ── Scrapyard / junkyard filter — exclude from garage results ──────────────────
// OSM tags and name patterns that indicate dismantlers/recyclers, not repair shops
const SCRAP_TAGS = new Set(['scrap_yard','recycling','second_hand','salvage']);
const SCRAP_NAME_RE = /auto[\s-]?otpad|авто[\s-]?отпад|schrottplatz|autoverwertung|junkyard|salvage\s+yard|wrecking\s+yard|vehicle\s+dismantl|recycl/i;

function isScrapyard(tags) {
  if (SCRAP_TAGS.has(tags.shop))      return true;
  if (SCRAP_TAGS.has(tags.amenity))   return true;
  if (tags.recycling_type)             return true;
  if (tags['craft'] === 'salvage')     return true;
  const name = [tags.name, tags.operator, tags.description].filter(Boolean).join(' ');
  return SCRAP_NAME_RE.test(name);
}

// ── Haversine distance ─────────────────────────────────────────────────────────
function haversine(la1, lo1, la2, lo2) {
  const R = 6371;
  const dLa = (la2-la1)*Math.PI/180, dLo = (lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── Overpass HTTP request ─────────────────────────────────────────────────────
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
      timeout: 11000,   // 11s × (up to 3 passes × 2 hosts) — exits early when results found
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        if (res.statusCode === 429) { reject(new Error(`HTTP 429 rate-limited from ${host}`)); return; }
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} from ${host}`)); return; }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error from ${host}`)); }
      });
    });
    req.on('error',   e  => reject(new Error(`${host}: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`${host} timeout`)); });
    req.write(body); req.end();
  });
}

// ── Process raw elements into result objects ───────────────────────────────────
function processElements(elements, cat, latN, lngN, distLimitKm, seen) {
  const results = [];
  for (const el of elements) {
    const tags = el.tags || {};

    // Skip scrapyards when searching for car repair
    if (cat === 'garage' && isScrapyard(tags)) continue;

    const displayName = tags.name || tags.brand || tags.operator || tags.amenity || null;
    if (!displayName || seen.has(displayName)) continue;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
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

  const { cat = 'garage', lat, lng } = req.query;
  const latN = parseFloat(lat), lngN = parseFloat(lng);
  if (isNaN(latN) || isNaN(lngN)) { res.status(400).json({ error: 'Invalid lat/lng' }); return; }

  // ── Progressive radius: 5km → 15km → 30km ────────────────────────────────
  // Stops as soon as ≥3 useful results found.
  // Covers: city users (pass 1), suburban users (pass 2), rural/village users (pass 3)
  // Kumarino→Veles is ~16km → caught by pass 2 (15km half-width = 30km diameter)
  const PASSES = [
    { ns: 0.045, ew: 0.060 },  // ~5km radius
    { ns: 0.135, ew: 0.180 },  // ~15km radius
    { ns: 0.270, ew: 0.360 },  // ~30km radius
  ];
  const MIN_RESULTS = 3;        // stop expanding when we have this many

  const seen    = new Set();    // dedup across passes by display name
  let allResults = [];
  let failedDueToEndpoint = false;

  for (let pass = 0; pass < PASSES.length; pass++) {
    const { ns, ew } = PASSES[pass];
    const distLimitKm = Math.round(Math.sqrt(ns*ns + ew*ew) * 111); // approx km radius

    const south = (latN - ns).toFixed(6);
    const north = (latN + ns).toFixed(6);
    const west  = (lngN - ew).toFixed(6);
    const east  = (lngN + ew).toFixed(6);

    const query = buildQuery(cat, south, west, north, east);
    console.log(`[nearby] PASS${pass+1} cat=${cat} radius≈${distLimitKm}km`);

    let passData = null;
    for (const host of OVERPASS_ENDPOINTS) {
      try {
        passData = await fetchOverpass(host, query);
        console.log(`[nearby] ${host} OK — ${(passData.elements||[]).length} elements`);
        break;
      } catch (err) {
        console.warn(`[nearby] ${host} failed: ${err.message}`);
        if (err.message.includes('429') || err.message.includes('timeout')) {
          failedDueToEndpoint = true;
        }
      }
    }

    if (!passData) {
      // Both endpoints failed — stop expanding, show fallback
      console.error(`[nearby] PASS${pass+1}: all endpoints failed, stopping`);
      failedDueToEndpoint = true;
      break;
    }

    const newResults = processElements(passData.elements || [], cat, latN, lngN, distLimitKm + 5, seen);
    allResults = [...allResults, ...newResults];
    allResults.sort((a, b) => a.dist - b.dist);

    console.log(`[nearby] PASS${pass+1} returned=${newResults.length} total=${allResults.length}`);

    // Stop if we have enough results
    if (allResults.length >= MIN_RESULTS) {
      console.log(`[nearby] ≥${MIN_RESULTS} results found, stopping at pass ${pass+1}`);
      break;
    }

    // If endpoints are failing, don't try more passes
    if (failedDueToEndpoint) break;
  }

  const results = allResults.slice(0, 25);

  if (results.length === 0 || failedDueToEndpoint) {
    console.log(`[nearby] returning fallback: results=${results.length} endpointFailed=${failedDueToEndpoint}`);
    res.status(200).json({
      results,
      fallbackUsed: results.length === 0,
      fallbackReason: failedDueToEndpoint ? 'endpoint_failure' : 'no_results',
      cat,
    });
    return;
  }

  console.log(`[nearby] cat=${cat} final=${results.length} results`);
  res.status(200).json({ results, cat });
};
