// api/nearby.js — Overpass proxy for FixIt nearby search
// FIXIT_NEARBY_STABLE_REVERT_V4
// Two proven endpoints only. maps.mail.ru removed.

const OVERPASS_ENDPOINTS = [
  'overpass-api.de',
  'overpass.kumi.systems',
];

// Standard bbox for all categories (≈7km × 7km at 50°N)
const BBOX_NS = 0.03;
const BBOX_EW = 0.05;

// Tyres uses a larger search area (fuel/tyre shops are sparser)
const TYRES_BBOX_NS = 0.05;
const TYRES_BBOX_EW = 0.07;

// Keyword regexes for Overpass name~ queries (ASCII-only for Overpass ERE)
const TYRE_NAME_REGEX  = 'Reifen|Tyre|Tire|Vulkan|Felgen|Rader|Wheels|Wheel';
const PARTS_NAME_REGEX = 'Autoteile|KFZ.Teile|Kfz.Teile|Ersatzteil|Autozubeh|Zubeh|Teile';
const MOTO_NAME_REGEX  = 'Motorrad|Motorbike|Motorcycle|Scooter|Roller|Zweirad|Moped';

function buildQuery(cat, latN, lngN) {
  const ns = cat === 'tyres' ? TYRES_BBOX_NS : BBOX_NS;
  const ew = cat === 'tyres' ? TYRES_BBOX_EW : BBOX_EW;

  const south = (latN - ns).toFixed(6);
  const north = (latN + ns).toFixed(6);
  const west  = (lngN - ew).toFixed(6);
  const east  = (lngN + ew).toFixed(6);
  const b     = `${south},${west},${north},${east}`;

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
      `node["service:vehicle:parts"="yes"](${b})`,
      `way["service:vehicle:parts"="yes"](${b})`,
      `node["shop"="car_repair"]["name"~"${PARTS_NAME_REGEX}",i](${b})`,
      `way["shop"="car_repair"]["name"~"${PARTS_NAME_REGEX}",i](${b})`,
    ],
    tyres: [
      `node["shop"="tyres"](${b})`,
      `way["shop"="tyres"](${b})`,
      `relation["shop"="tyres"](${b})`,
      `node["shop"="vulcanizer"](${b})`,
      `way["shop"="vulcanizer"](${b})`,
      `node["craft"="tyre_fitting"](${b})`,
      `way["craft"="tyre_fitting"](${b})`,
      `node["service:vehicle:tyres"="yes"](${b})`,
      `way["service:vehicle:tyres"="yes"](${b})`,
      `node["service:vehicle:tires"="yes"](${b})`,
      `way["service:vehicle:tires"="yes"](${b})`,
      `node["service:vehicle:wheels"="yes"](${b})`,
      `way["service:vehicle:wheels"="yes"](${b})`,
      `node["service:tyres"="yes"](${b})`,
      `way["service:tyres"="yes"](${b})`,
      `node["shop"="car_repair"]["name"~"${TYRE_NAME_REGEX}",i](${b})`,
      `way["shop"="car_repair"]["name"~"${TYRE_NAME_REGEX}",i](${b})`,
      `node["shop"="auto_parts"]["name"~"${TYRE_NAME_REGEX}",i](${b})`,
      `way["shop"="auto_parts"]["name"~"${TYRE_NAME_REGEX}",i](${b})`,
      `node["amenity"="car_repair"]["name"~"${TYRE_NAME_REGEX}",i](${b})`,
      `way["amenity"="car_repair"]["name"~"${TYRE_NAME_REGEX}",i](${b})`,
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
      `relation["shop"="motorcycle"](${b})`,
      `node["craft"="motorcycle_repair"](${b})`,
      `way["craft"="motorcycle_repair"](${b})`,
      `node["service:vehicle:motorcycle"="yes"](${b})`,
      `way["service:vehicle:motorcycle"="yes"](${b})`,
      `node["shop"="scooter"](${b})`,
      `way["shop"="scooter"](${b})`,
      `node["shop"="car_repair"]["name"~"${MOTO_NAME_REGEX}",i](${b})`,
      `way["shop"="car_repair"]["name"~"${MOTO_NAME_REGEX}",i](${b})`,
      `node["shop"="vehicle"]["name"~"${MOTO_NAME_REGEX}",i](${b})`,
      `way["shop"="vehicle"]["name"~"${MOTO_NAME_REGEX}",i](${b})`,
    ],
  };

  const lines = (parts[cat] || parts.garage).join(';\n  ');
  return { query: `[out:json][timeout:8];\n(\n  ${lines};\n);\nout center tags;`, south, west, north, east };
}

// Server-side keyword filters
const TYRE_KEYWORDS  = /reifen|tyre|tire|vulkan|felgen|räder|rader|wheel/i;
const PARTS_KEYWORDS = /autoteile|kfz.?teile|ersatzteil|autozubeh|zubehör|zubeh/i;
const MOTO_KEYWORDS  = /motorrad|motorbike|motorcycle|scooter|roller|zweirad|moto|moped/i;

function isTyreRelevant(el) {
  const tags = el.tags || {};
  if (['tyres','vulcanizer'].includes(tags.shop)) return true;
  if (tags.craft === 'tyre_fitting') return true;
  if (tags['service:vehicle:tyres'] === 'yes') return true;
  if (tags['service:vehicle:tires'] === 'yes') return true;
  if (tags['service:vehicle:wheels'] === 'yes') return true;
  if (tags['service:tyres'] === 'yes') return true;
  const s = [tags.name, tags.brand, tags.operator].filter(Boolean).join(' ');
  return TYRE_KEYWORDS.test(s);
}

function isPartsRelevant(el) {
  const tags = el.tags || {};
  if (['car_parts','auto_parts'].includes(tags.shop)) return true;
  if (tags['service:vehicle:parts'] === 'yes') return true;
  const s = [tags.name, tags.brand, tags.operator].filter(Boolean).join(' ');
  return PARTS_KEYWORDS.test(s);
}

function isMotoRelevant(el) {
  const tags = el.tags || {};
  if (['motorcycle','scooter'].includes(tags.shop)) return true;
  if (tags.craft === 'motorcycle_repair') return true;
  if (tags['service:vehicle:motorcycle'] === 'yes') return true;
  const s = [tags.name, tags.brand, tags.operator, tags.description].filter(Boolean).join(' ');
  return MOTO_KEYWORDS.test(s);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function fetchOverpass(host, query, south, west, north, east) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const body  = `data=${encodeURIComponent(query)}`;
    const opts  = {
      hostname: host,
      path:     '/api/interpreter',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent':     'FixIt/1.0 Vercel-Proxy',
        'Accept':         'application/json',
      },
      timeout: 9000,  // 9s per host × 2 hosts = 18s max, safely under Vercel 25s limit
    };

    const req = https.request(opts, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 429) {
          // Rate-limited — skip immediately
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
          reject(new Error(`JSON parse error from ${host}: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error(`${host} timeout`)); });
    req.on('error',   err => reject(err));
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

  const { query, south, west, north, east } = buildQuery(cat, latN, lngN);
  const radiusKm = cat === 'tyres'
    ? `${(TYRES_BBOX_NS * 111).toFixed(0)}km`
    : `${(BBOX_NS * 111).toFixed(0)}km`;

  console.log(`[nearby] REQUEST cat=${cat} lat=${latN} lng=${lngN} radius=${radiusKm}`);

  let data = null;
  let lastErr = null;

  for (const host of OVERPASS_ENDPOINTS) {
    try {
      console.log(`[nearby] trying ${host}...`);
      data = await fetchOverpass(host, query, south, west, north, east);
      console.log(`[nearby] ${host} OK — ${(data.elements||[]).length} raw elements`);
      break;
    } catch (err) {
      lastErr = err;
      console.warn(`[nearby] ${host} failed: ${err.message}`);
    }
  }

  if (!data) {
    console.error(`[nearby] all endpoints failed: ${lastErr?.message}`);
    console.warn(`[nearby] ${cat.toUpperCase()}_FALLBACK reason=endpoint_failure`);
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
  const rawCount = elements.length;
  const seen     = {};
  const out      = [];
  let filteredOut = 0;

  const distLimit = cat === 'tyres' ? 12 : 15;

  elements.forEach(el => {
    const tags = el.tags || {};
    // Use name → brand → operator → amenity as display name
    // Many petrol/fuel stations have brand but no name tag
    const displayName = tags.name || tags.brand || tags.operator || tags.amenity || null;
    if (!displayName) return;

    // Server-side relevance filters
    if (cat === 'tyres' && !isTyreRelevant(el)) { filteredOut++; return; }
    if (cat === 'parts' && !isPartsRelevant(el)) { filteredOut++; return; }
    if (cat === 'moto'  && !isMotoRelevant(el))  { filteredOut++; return; }

    if (seen[displayName]) return;
    seen[displayName] = true;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) return;

    const dist = haversine(latN, lngN, elLat, elLon);
    if (dist > distLimit) return;

    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null;
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

  // Safe debug log — no undefined variable references
  console.log(
    `[nearby] cat=${cat} raw=${rawCount} filtered_out=${filteredOut} returned=${results.length} fallback=false`
  );

  res.status(200).json({ results, cat });
}
