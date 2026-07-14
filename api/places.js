// api/places.js — Google Places API (New) — server-side, key NEVER in client bundle
//
// Strategy: Use Nearby Search (New) for categories with clean Table A types.
//           Use Text Search (New) for categories that need local MK terms or lack exact types.
//
// GOOGLE_MAPS_API_KEY must NOT be a VITE_ variable.
//
// Verified Table A types (valid for includedTypes in searchNearby):
//   car_repair, auto_parts_store, tire_shop, gas_station,
//   hardware_store, veterinary_care, electronics_store, motorcycle_dealer
//
// Types NOT valid in searchNearby includedTypes (would cause 400):
//   home_improvement_store, motorcycle_repair, computer_store, computer_repair_service
//   → Use Text Search for these categories instead.

const GOOGLE_KEY  = process.env.GOOGLE_MAPS_API_KEY;
const NEARBY_URL  = 'https://places.googleapis.com/v1/places:searchNearby';
const TEXTSRCH_URL = 'https://places.googleapis.com/v1/places:searchText';

// Field masks — regularOpeningHours (NOT currentOpeningHours, which is a different field)
const NEARBY_FIELDS  = 'places.id,places.displayName,places.location,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.rating,places.googleMapsUri,places.types,places.primaryType';
const TEXT_FIELDS    = 'places.id,places.displayName,places.location,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.rating,places.googleMapsUri,places.types,places.primaryType';

// Categories that work well with Nearby Search type filters
// Maps FixIt category to confirmed Table A types for searchNearby.
// tire_shop was added Feb 2026 and may not be recognized by all API key configurations
//   → tyres uses Text Search only (вулканизер / tyre shop works perfectly)
// home_goods_store NOT confirmed Table A → hardware uses hardware_store only
// motorcycle_dealer is Table A but rare in Balkans → moto leans on Text Search
const NEARBY_CATS = {
  garage:   { types: ['car_repair'] },
  parts:    { types: ['auto_parts_store'] },
  // tyres: omitted — tire_shop too new; Text Search handles вулканизер perfectly
  petrol:   { types: ['gas_station'] },
  vet:      { types: ['veterinary_care'] },
  moto:     { types: ['motorcycle_dealer'] },
  hardware: { types: ['hardware_store'] },  // confirmed Table A
  it:       { types: ['electronics_store'] },
};

// Local MK text queries — used for Text Search to fill gaps from Nearby Search
// Text Search covers local language names that Google Maps knows about but aren't categorised cleanly
// Text Search queries — concise, focused local terms.
// Google interprets shorter queries better than large OR chains.
// We run MULTIPLE text searches per category (see tasks below) for better coverage.
const TEXT_QUERIES = {
  garage:   'автосервис автомеханичар auto mechanic car repair',
  garage2:  'авто сервис авто електричар авто механика',
  parts:    'автоделови резервни делови auto parts store',
  parts2:   'продавница автоделови car parts',
  tyres:    'вулканизер вулканизерски сервис гуми',
  tyres2:   'сервис за гуми tyre service tire shop',
  petrol:   'бензинска пумпа gas station',
  hardware: 'железарија градежни материјали',
  hardware2:'електроматеријали алати дом и градина',
  vet:      'ветеринар ветеринарна станица veterinary',
  it:       'компјутерски сервис поправка компјутери computer repair',
  moto:     'мото сервис сервис мотори мото делови',
  moto2:    'скутер сервис motorcycle repair motorcycle parts',
};

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, dLa=(la2-la1)*Math.PI/180, dLo=(lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function httpsPost(hostname, path, body, headers) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const buf   = Buffer.from(JSON.stringify(body), 'utf8');
    const req   = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': buf.length },
      timeout: 8000,
    }, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          // Log error body for debugging (safe — no key in d)
          let errInfo = {};
          try { errInfo = JSON.parse(d); } catch(_) {}
          console.error(`[places] HTTP ${res.statusCode} status=${errInfo?.error?.status} code=${errInfo?.error?.code} message=${errInfo?.error?.message}`);
          reject(new Error(`HTTP_${res.statusCode}`));
          return;
        }
        try { resolve(JSON.parse(d)); }
        catch (_) { reject(new Error('json_parse')); }
      });
    });
    req.on('error',   e  => reject(new Error(`net_${e.code||e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('socket_timeout')); });
    req.write(buf); req.end();
  });
}

// ── Nearby Search (New) ───────────────────────────────────────────────────────
async function nearbySearch(latN, lngN, radiusM, types) {
  const body = {
    includedTypes:       types,
    maxResultCount:      20,
    rankPreference:      'DISTANCE',
    locationRestriction: {
      circle: { center: { latitude: latN, longitude: lngN }, radiusMeters: radiusM }
    },
  };
  return httpsPost('places.googleapis.com', '/v1/places:searchNearby', body, {
    'X-Goog-Api-Key':   GOOGLE_KEY,
    'X-Goog-FieldMask': NEARBY_FIELDS,
  });
}

// ── Text Search (New) ─────────────────────────────────────────────────────────
async function textSearch(latN, lngN, radiusM, textQuery) {
  // Use locationBias (circle) — Text Search (New) does NOT support circle in locationRestriction
  // (only rectangle is supported there). locationBias + server-side dist filter = 30km hard cap.
  const body = {
    textQuery,
    maxResultCount:   20,
    rankPreference:   'DISTANCE',
    locationBias: {
      circle: {
        center:       { latitude: latN, longitude: lngN },
        radiusMeters: radiusM,
      }
    },
  };
  return httpsPost('places.googleapis.com', '/v1/places:searchText', body, {
    'X-Goog-Api-Key':   GOOGLE_KEY,
    'X-Goog-FieldMask': TEXT_FIELDS,
  });
}

// Scrapyard/junkyard exclusion — same logic as OSM filter, applied to Google results
const SCRAP_RE_G = /отпад|auto.?otpad|schrottplatz|autoverwertung|junkyard|salvage.yard|wrecking|dismantl|recycl/i;
function isScrapResult(place, cat) {
  if (cat !== 'garage') return false; // only filter garage category
  const name  = (place.displayName?.text || '').toLowerCase();
  const types = place.types || [];
  if (SCRAP_RE_G.test(name)) return true;
  if (types.some(t => ['recycling','junkyard','scrap_yard'].includes(t))) return true;
  return false;
}

function normalizePlaceResult(place, latN, lngN) {
  const loc  = place.location || {};
  const plat = loc.latitude  || 0;
  const plng = loc.longitude || 0;
  const name = place.displayName?.text || '';
  if (!name) return null;
  return {
    id:      `google_${place.id}`,
    source:  'google',
    name,
    lat:     plat,
    lng:     plng,
    dist:    Math.round(haversine(latN, lngN, plat, plng) * 1000) / 1000,
    addr:    place.formattedAddress || '',
    phone:   place.nationalPhoneNumber || '',
    website: place.websiteUri || '',
    opening: place.regularOpeningHours?.weekdayDescriptions?.slice(0,2).join('; ') || '',
    rating:  place.rating || null,
    mapsUrl: place.googleMapsUri || '',
  };
}

function dedup(arr) {
  const seen = new Set();
  return arr.filter(p => {
    const key = p.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET')     { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!GOOGLE_KEY) {
    return res.status(200).json({
      configured: false,
      results: [],
      message: 'Add GOOGLE_MAPS_API_KEY to Vercel environment variables to enable Places search.',
    });
  }

  const { cat = 'garage', lat, lng, radius = '30000' } = req.query;
  const latN    = parseFloat(lat);
  const lngN    = parseFloat(lng);
  const radiusM = Math.min(parseInt(radius) || 30000, 50000);

  if (isNaN(latN) || isNaN(lngN)) {
    return res.status(400).json({ error: 'Invalid lat/lng' });
  }

  console.log(`[places] cat=${cat} lat=${latN} lng=${lngN} radius=${radiusM}m`);

  const allPlaces = [];
  const errors    = [];

  // Strategy: run Nearby Search (type-based) AND Text Search (local query) in parallel
  // Text Search covers MK local names that may not be properly categorised in Google's type system
  const nearbyConf = NEARBY_CATS[cat];

  const tasks = [];
  const MAX_DIST_KM = 30; // hard cap — never show results beyond 30km

  // Nearby Search (type-based) — fast, category-specific
  if (nearbyConf) {
    tasks.push(
      nearbySearch(latN, lngN, radiusM, nearbyConf.types)
        .then(d => { allPlaces.push(...(d.places || [])); })
        .catch(e => { errors.push(`nearby:${e.message}`); console.warn(`[places] nearby failed: ${e.message}`); })
    );
  }

  // Text Search — primary query (local MK terms)
  const textQuery  = TEXT_QUERIES[cat];
  const textQuery2 = TEXT_QUERIES[cat + '2']; // second focused query if defined
  if (textQuery) {
    tasks.push(
      textSearch(latN, lngN, radiusM, textQuery)
        .then(d => { allPlaces.push(...(d.places || [])); })
        .catch(e => { errors.push(`text1:${e.message}`); console.warn(`[places] text1 failed: ${e.message}`); })
    );
  }
  if (textQuery2) {
    tasks.push(
      textSearch(latN, lngN, radiusM, textQuery2)
        .then(d => { allPlaces.push(...(d.places || [])); })
        .catch(e => { errors.push(`text2:${e.message}`); console.warn(`[places] text2 failed: ${e.message}`); })
    );
  }

  await Promise.all(tasks);

  // Normalize, filter scrapyards, enforce 30km hard cap, dedup, sort
  const normalized = allPlaces
    .filter(p => !isScrapResult(p, cat))          // exclude scrapyards from garage
    .map(p => normalizePlaceResult(p, latN, lngN))
    .filter(p => p && p.dist <= MAX_DIST_KM);     // hard 30km cap

  const results = dedup(normalized.sort((a, b) => a.dist - b.dist)).slice(0, 20);
  console.log(`[places] cat=${cat} nearby=${nearbyConf?'yes':'no'} raw=${allPlaces.length} after_filter=${normalized.length} returned=${results.length}`);

  console.log(`[places] cat=${cat} results=${results.length} errors=${errors.length}`);

  res.status(200).json({
    configured: true,
    results,
    ...(errors.length ? { partialErrors: errors } : {}),
  });
};
