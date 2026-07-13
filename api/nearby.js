// api/nearby.js — FixIt Overpass proxy  FIXIT_NEARBY_STABLE_V5
// Restored from stable uploaded ZIP + bbox fix + moto + timeout fix

const OVERPASS_ENDPOINTS = [
  'overpass-api.de',
  'overpass.kumi.systems',
];

function buildQuery(cat, south, west, north, east) {
  const b = `${south},${west},${north},${east}`;
  const parts = {
    garage: [
      `node["shop"="car_repair"](${b})`,
      `way["shop"="car_repair"](${b})`,
      `relation["shop"="car_repair"](${b})`,
      `node["craft"="car_repair"](${b})`,
      `way["craft"="car_repair"](${b})`,
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
      `node["shop"="car_repair"]["service:tyres"="yes"](${b})`,
      `node["shop"="car_repair"]["service:vehicle:tyres"="yes"](${b})`,
      `way["shop"="car_repair"]["service:vehicle:tyres"="yes"](${b})`,
      `node["shop"="vulcanizer"](${b})`,
      `way["shop"="vulcanizer"](${b})`,
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
  return `[out:json][timeout:25];\n(\n  ${lines};\n);\nout center tags;`;
}

function haversine(la1, lo1, la2, lo2) {
  const R = 6371;
  const dLa = (la2-la1)*Math.PI/180, dLo = (lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function fetchOverpass(host, query) {
  return new Promise((resolve, reject) => {
    const https   = require('https');
    const encoded = 'data=' + encodeURIComponent(query);
    const body    = Buffer.from(encoded, 'utf8');
    const req = https.request({
      hostname: host, path: '/api/interpreter', method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length,
        'User-Agent': 'FixItApp/1.0 Vercel-Proxy', 'Accept': 'application/json',
      },
      // 11s × 2 hosts = 22s max, safely under Vercel 25s limit
      timeout: 11000,
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        if (res.statusCode === 429) {
          reject(new Error(`HTTP 429 rate-limited from ${host}`)); return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${host}`)); return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error from ${host}`)); }
      });
    });
    req.on('error',   e  => reject(new Error(`${host} network: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`${host} timeout`)); });
    req.write(body); req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { cat = 'garage', lat, lng } = req.query;
  const latN = parseFloat(lat), lngN = parseFloat(lng);
  if (isNaN(latN) || isNaN(lngN)) { res.status(400).json({ error: 'Invalid lat/lng' }); return; }

  // ── Progressive bbox: small first, expand only if 0 results ──────────────
  // Pass 1: ~3.5km radius — enough for most urban/suburban users
  // Pass 2: ~7km radius — for village users with no services in immediate vicinity
  // This ensures village users near Veles/Macedonia still find nearest services
  const PASS1 = { ns: 0.03,  ew: 0.055 };
  const PASS2 = { ns: 0.06,  ew: 0.10  };

  async function tryFetch(ns, ew) {
    const south = (latN - ns).toFixed(6);
    const north = (latN + ns).toFixed(6);
    const west  = (lngN - ew).toFixed(6);
    const east  = (lngN + ew).toFixed(6);
    const query = buildQuery(cat, south, west, north, east);
    console.log(`[nearby] cat=${cat} bbox NS=${ns} EW=${ew}`);
    for (const host of OVERPASS_ENDPOINTS) {
      try {
        const d = await fetchOverpass(host, query);
        console.log(`[nearby] ${host} OK — ${(d.elements||[]).length} elements`);
        return d;
      } catch (err) {
        console.warn(`[nearby] ${host} failed: ${err.message}`);
      }
    }
    return null;
  }

  let data = await tryFetch(PASS1.ns, PASS1.ew);
  let usedPass2 = false;

  // Expand radius for village users: if 0 elements returned, try wider bbox
  if (data && (data.elements||[]).length === 0) {
    console.log(`[nearby] 0 elements in pass 1 — expanding to ${PASS2.ns}°NS x ${PASS2.ew}°EW for village coverage`);
    const data2 = await tryFetch(PASS2.ns, PASS2.ew);
    if (data2) { data = data2; usedPass2 = true; }
  }

  if (!data) {
    console.error(`[nearby] all endpoints failed`);
    res.status(200).json({ results: [], fallbackUsed: true,
      fallbackReason: 'endpoint_failure', cat });
    return;
  }

  const elements = data.elements || [];
  const seen = {}, out = [];

  elements.forEach(el => {
    const tags = el.tags || {};
    // name → brand → operator → amenity as display name (petrol stations often have brand, not name)
    const displayName = tags.name || tags.brand || tags.operator || tags.amenity || null;
    if (!displayName || seen[displayName]) return;
    seen[displayName] = true;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon  ?? el.center?.lon;
    if (!elLat || !elLon) return;

    const dist = haversine(latN, lngN, parseFloat(elLat), parseFloat(elLon));
    if (dist > 15) return;

    const street = tags['addr:street']
      ? tags['addr:street'] + (tags['addr:housenumber'] ? ' '+tags['addr:housenumber'] : '')
      : null;
    out.push({
      name:    displayName,
      lat:     parseFloat(elLat), lng: parseFloat(elLon),
      dist:    Math.round(dist*1000)/1000,
      addr:    [street, tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ') || '',
      phone:   tags.phone    || tags['contact:phone']   || '',
      opening: tags.opening_hours || '',
      website: tags.website  || tags['contact:website'] || '',
    });
  });

  out.sort((a,b) => a.dist - b.dist);
  const results = out.slice(0, 25);
  console.log(`[nearby] cat=${cat} raw=${elements.length} returned=${results.length}`);
  res.status(200).json({ results, cat });
};
