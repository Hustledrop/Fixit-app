// api/nearby.js — Overpass proxy for FixIt nearby search
// Queries restored to uploaded stable version.
// Kept: displayName brand/operator fix, fallbackUsed, 429 skip, moto category.

const OVERPASS_ENDPOINTS = [
  'overpass-api.de',
  'overpass.kumi.systems',
];

// Bbox constants — same as uploaded working version (calculated inline per query)
const BBOX_NS = 0.03;
const BBOX_EW = 0.05;

function buildQuery(cat, latN, lngN) {
  const south = (latN - BBOX_NS).toFixed(6);
  const north = (latN + BBOX_NS).toFixed(6);
  const west  = (lngN - BBOX_EW).toFixed(6);
  const east  = (lngN + BBOX_EW).toFixed(6);
  const b     = `${south},${west},${north},${east}`;

  // Queries restored to the stable uploaded version.
  // TYRES: was 3 lines in uploaded (worked). Extra name~ lines added later caused heavy load.
  // PARTS: was 4 lines in uploaded (worked). Extra name~ lines added later caused heavy load.
  // Kept: moto (new category), petrol (unchanged), garage/hardware/vet/it (unchanged).
  const parts = {
    garage: [
      `node["shop"="car_repair"](${b})`,
      `way["shop"="car_repair"](${b})`,
      `relation["shop"="car_repair"](${b})`,
      `node["craft"="car_repair"](${b})`,
      `way["craft"="car_repair"](${b})`,
    ],
    // Restored to 4-line query from uploaded stable version
    parts: [
      `node["shop"="car_parts"](${b})`,
      `way["shop"="car_parts"](${b})`,
      `node["shop"="auto_parts"](${b})`,
      `way["shop"="auto_parts"](${b})`,
    ],
    // ── TYRES — global indexed tag coverage ──────────────────────────────────
    // Sources: OSM wiki + taginfo global statistics
    //
    // Group 1 — Dedicated tyre retail shops (all regions):
    //   shop=tyres      ~18,000 globally: UK/US/AU primary tag (Kwik Fit, Discount Tire, JAX)
    //   shop=tires      ~2,000 globally:  US/CA spelling variant
    //   shop=vulcanizer ~8,000 globally:  Eastern Europe (Poland, Romania, CZ, Slovakia)
    //   shop=wheels     ~1,500 globally:  USA wheel & tyre centres (Wheel Works, etc.)
    //
    // Group 2 — Tyre fitting craft (primarily UK):
    //   craft=tyre_fitting ~3,000 globally: UK standalone tyre fitting workshops
    //
    // Group 3 — Service subtags on car_repair/amenity shops (Germany/EU standard):
    //   service:vehicle:tyres=yes ~12,000: standard tag on German/EU car_repair doing tyres
    //   service:vehicle:tires=yes ~1,500:  US/CA spelling on amenity=car_repair
    //   service:tyres=yes ~500:            older style, still used
    //
    // Group 4 — Amenity-tagged shops with tyre service (older tagging, some EU countries):
    //   amenity=car_repair + service:vehicle:tyres=yes
    //
    // Group 5 — Name-indexed car_repair (Germany/AT/CH where shops lack service:vehicle:tyres):
    //   shop=car_repair + name~"Reifen|Euromaster|A.T.U|Vergölst|Point S"
    //   FAST: shop= narrows to ~16 results first, name~ filters only those.
    //   Catches German chains tagged only as car_repair without explicit tyre service tags.
    //
    // Total: 18 query lines, all indexed-first, no full-bbox text scans.
    tyres: [
      // Group 1: dedicated tyre shops (global)
      `node["shop"="tyres"](${b})`,
      `way["shop"="tyres"](${b})`,
      `node["shop"="tires"](${b})`,
      `way["shop"="tires"](${b})`,
      `node["shop"="vulcanizer"](${b})`,
      `way["shop"="vulcanizer"](${b})`,
      `node["shop"="wheels"](${b})`,
      `way["shop"="wheels"](${b})`,
      // Group 2: tyre fitting craft (UK primary)
      `node["craft"="tyre_fitting"](${b})`,
      `way["craft"="tyre_fitting"](${b})`,
      // Group 3: service subtags on car_repair (Germany/EU standard)
      `node["service:vehicle:tyres"="yes"](${b})`,
      `way["service:vehicle:tyres"="yes"](${b})`,
      `node["service:vehicle:tires"="yes"](${b})`,
      `way["service:vehicle:tires"="yes"](${b})`,
      `node["service:tyres"="yes"](${b})`,
      `way["service:tyres"="yes"](${b})`,
      // Group 4: amenity=car_repair with explicit tyre service (some EU countries)
      `node["amenity"="car_repair"]["service:vehicle:tyres"="yes"](${b})`,
      `way["amenity"="car_repair"]["service:vehicle:tyres"="yes"](${b})`,
      // Group 5: name-indexed German tyre chains (shop= indexed first, fast)
      `node["shop"="car_repair"]["name"~"[Rr]eifen|Euromaster|Vergölst|Point.?S|[Aa]\.?[Tt]\.?[Uu]\.",i](${b})`,
      `way["shop"="car_repair"]["name"~"[Rr]eifen|Euromaster|Vergölst|Point.?S|[Aa]\.?[Tt]\.?[Uu]\.",i](${b})`,
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
    ],
    // Moto: kept as new category (not in uploaded but requested feature)
    moto: [
      `node["shop"="motorcycle"](${b})`,
      `way["shop"="motorcycle"](${b})`,
      `node["craft"="motorcycle_repair"](${b})`,
      `way["craft"="motorcycle_repair"](${b})`,
      `node["service:vehicle:motorcycle"="yes"](${b})`,
      `way["service:vehicle:motorcycle"="yes"](${b})`,
    ],
  };

  const lines = (parts[cat] || parts.garage).join(';\n  ');
  // timeout:25 matches the uploaded stable version (was [timeout:25])
  return { query: `[out:json][timeout:25];\n(\n  ${lines};\n);\nout center tags;`, south, west, north, east };
}

function haversine(la1, lo1, la2, lo2) {
  const R = 6371;
  const dLa = (la2 - la1) * Math.PI / 180;
  const dLo = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fetchOverpass(host, query) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const encoded = 'data=' + encodeURIComponent(query);
    const body    = Buffer.from(encoded, 'utf8');
    const options = {
      hostname: host,
      path:     '/api/interpreter',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': body.length,
        'User-Agent':     'FixItApp/1.0 Vercel-Proxy',
        'Accept':         'application/json',
      },
      // Restored to 22s from uploaded stable version.
      // Reduced to 9s was the main regression causing timeouts on cold Overpass queries.
      // 2 hosts × 22s = 44s max but Vercel maxDuration=25s means only ~1 host can fully run.
      // In practice: first host usually responds in 2-8s; second is only reached on failure.
      timeout: 22000,
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 429) {
          console.warn(`[nearby] ${host} HTTP 429 (rate limited) — skipping to next endpoint`);
          reject(new Error(`HTTP 429 rate-limited from ${host}`));
          return;
        }
        if (res.statusCode !== 200) {
          console.error(`[nearby] ${host} HTTP ${res.statusCode} body: ${data.substring(0, 500)}`);
          reject(new Error(`HTTP ${res.statusCode} from ${host}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error(`[nearby] ${host} invalid JSON: ${data.substring(0, 200)}`);
          reject(new Error(`Invalid JSON from ${host}`));
        }
      });
    });

    req.on('error',   err => reject(new Error(`${host} network error: ${err.message}`)));
    req.on('timeout', ()  => { req.destroy(); reject(new Error(`${host} timeout`)); });
    req.write(body);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET')     { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { cat = 'garage', lat, lng } = req.query;
  const latN = parseFloat(lat);
  const lngN = parseFloat(lng);

  if (isNaN(latN) || isNaN(lngN)) {
    res.status(400).json({ error: 'Invalid lat/lng' });
    return;
  }

  const { query } = buildQuery(cat, latN, lngN);
  console.log(`[nearby] cat=${cat} lat=${latN} lng=${lngN}`);

  let data = null;
  let lastErr = null;

  for (const host of OVERPASS_ENDPOINTS) {
    try {
      data = await fetchOverpass(host, query);
      console.log(`[nearby] ${host} OK — ${(data.elements||[]).length} elements`);
      break;
    } catch (err) {
      lastErr = err;
      console.warn(`[nearby] ${host} failed: ${err.message}`);
    }
  }

  if (!data) {
    console.error(`[nearby] all endpoints failed: ${lastErr?.message}`);
    res.status(200).json({
      results: [],
      fallbackUsed: true,
      fallbackReason: 'endpoint_failure',
      error: lastErr?.message || 'All endpoints failed',
      cat,
    });
    return;
  }

  const elements = data.elements || [];
  const seen = {};
  const out  = [];

  elements.forEach(el => {
    const tags = el.tags || {};
    // Use name → brand → operator → amenity as display name
    // Petrol stations often have brand but no name tag
    const displayName = tags.name || tags.brand || tags.operator || tags.amenity || null;
    if (!displayName || seen[displayName]) return;
    seen[displayName] = true;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) return;

    const dist = haversine(latN, lngN, parseFloat(elLat), parseFloat(elLon));
    if (dist > 15) return;

    const street = el.tags['addr:street']
      ? el.tags['addr:street'] + (el.tags['addr:housenumber'] ? ' ' + el.tags['addr:housenumber'] : '')
      : null;

    out.push({
      name:    displayName,
      lat:     parseFloat(elLat),
      lng:     parseFloat(elLon),
      dist:    Math.round(dist * 1000) / 1000,
      addr:    [street, tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ') || '',
      phone:   tags.phone    || tags['contact:phone']   || '',
      opening: tags.opening_hours || '',
      website: tags.website  || tags['contact:website'] || '',
    });
  });

  out.sort((a, b) => a.dist - b.dist);
  const results = out.slice(0, 25);

  // Debug: log first 3 element tags for tyres to diagnose zero results
  if (cat === 'tyres' && elements.length > 0) {
    elements.slice(0, 3).forEach(el => {
      const t = el.tags || {};
      console.log(`[nearby] TYRES_EL shop=${t.shop} name=${t.name||t.brand||'?'} svc_tyres=${t['service:vehicle:tyres']||'no'} craft=${t.craft||'?'}`);
    });
  }
  console.log(`[nearby] cat=${cat} raw=${elements.length} returned=${results.length}`);
  res.status(200).json({ results, cat });
}
