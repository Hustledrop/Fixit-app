// api/places-lib.js — Google Places API (New) core logic
// Called directly by nearby.js (no HTTP hop, no domain dependency)
// Also exposed via api/places.js for direct testing

const GOOGLE_KEY   = process.env.GOOGLE_MAPS_API_KEY;
const NEARBY_FIELDS = 'places.id,places.displayName,places.location,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.rating,places.googleMapsUri,places.types,places.primaryType';
const TEXT_FIELDS   = NEARBY_FIELDS;
const MAX_DIST_KM   = 30;

// Confirmed Table A types for searchNearby.
// Excluded: tire_shop (added Feb 2026 — causes 400 on pre-2026 keys)
//           motorcycle_dealer (causes HTTP 400 INVALID_ARGUMENT on current key)
// moto and tyres use Text Search only.
const NEARBY_CATS = {
  garage:   { types: ['car_repair'] },
  parts:    { types: ['auto_parts_store'] },
  petrol:   { types: ['gas_station'] },
  vet:      { types: ['veterinary_care'] },
  hardware: { types: ['hardware_store'] },
  it:       { types: ['electronics_store'] },
  // moto: removed motorcycle_dealer — causes HTTP 400; Text Search only
  // tyres: no confirmed type → Text Search only
};

// Build city-aware text queries.
// cityHint = reverse-geocoded nearest town (e.g. "Велес" or "Veles") — may be empty.
// Using the city name in the query dramatically improves local relevance for Google Places.
function buildQueries(cat, cityHint, countryCode = '') {
  // Append city hint to queries for local relevance.
  // For MK tyres/garage: use city-free queries so village users (city="Куманово")
  // don't search the wrong city. GPS locationBias (30km circle) handles location.
  // For other categories/countries: append city name for local relevance.
  const isMKspecial = (countryCode === 'MK') && (cat === 'tyres' || cat === 'garage');
  const mk = isMKspecial ? '' : (cityHint || '');
  const en = isMKspecial ? '' : (cityHint || '');
  const q = {
    garage: [
      `Автосервис ${mk}`.trim(),
      `Автомеханичар ${mk}`.trim(),
      `Авто електричар ${mk}`.trim(),
      `Авто механика ${mk}`.trim(),
      `Авто сервис ${mk}`.trim(),
      `car repair ${en}`.trim(),
      `Avto servis ${en}`.trim(),
      `auto mechanic ${en}`.trim(),
      // Galevski-specific query — Google has this business but it needs exact search
      `Avto servis GALEVSKI Veles`,
      `Galevski Veles`,
    ],
    parts: [
      `Автоделови ${mk}`.trim(),
      `Продавница за автоделови ${mk}`.trim(),
      `Резервни делови ${mk}`.trim(),
      `auto parts store ${en}`.trim(),
    ],
    tyres: [
      `Вулканизер ${mk}`.trim(),
      `Вулканизерски сервис ${mk}`.trim(),
      `Сервис за гуми ${mk}`.trim(),
      `Гуми ${mk}`.trim(),
      `tyre service ${en}`.trim(),
      `tire shop ${en}`.trim(),
      `vulcanizer ${en}`.trim(),
      `Авто центар Жири ${mk}`.trim(),   // specific Veles tyre centre
      `вулканизер Жири ${mk}`.trim(),
      `вулканизер Јоце ${mk}`.trim(),
    ],
    petrol: [
      `Бензинска пумпа ${mk}`.trim(),
      `Бензинска ${mk}`.trim(),
      `petrol station ${en}`.trim(),
      `gas station ${en}`.trim(),
    ],
    hardware: [
      `Железарија ${mk}`.trim(),
      `Градежни материјали ${mk}`.trim(),
      `Електроматеријали ${mk}`.trim(),
      `Алати ${mk}`.trim(),
      `Дом и градина ${mk}`.trim(),
    ],
    vet: [
      `Ветеринар ${mk}`.trim(),
      `Ветеринарна станица ${mk}`.trim(),
      `Ветеринарна амбуланта ${mk}`.trim(),
      `veterinary clinic ${en}`.trim(),
    ],
    it: [
      `Компјутерски сервис ${mk}`.trim(),
      `Поправка на компјутери ${mk}`.trim(),
      `computer repair ${en}`.trim(),
    ],
    moto: [
      `Мото сервис ${mk}`.trim(),
      `Сервис за мотори ${mk}`.trim(),
      `Мото делови ${mk}`.trim(),
      `Мото продавница ${mk}`.trim(),
      `Скутер сервис ${mk}`.trim(),
      `motorcycle repair ${en}`.trim(),
      `motorcycle parts ${en}`.trim(),
    ],
  };
  return (q[cat] || q.garage).filter((v, i, a) => v && a.indexOf(v) === i);
}

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, dLa = (la2-la1)*Math.PI/180, dLo = (lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function httpsPost(path, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const buf   = Buffer.from(JSON.stringify(body), 'utf8');
    const req   = https.request({
      hostname: 'places.googleapis.com',
      path, method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': buf.length,
        'X-Goog-Api-Key': GOOGLE_KEY,
        ...extraHeaders,
      },
      timeout: 7000,
    }, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          let errInfo = {};
          try { errInfo = JSON.parse(d); } catch(_) {}
          // Log error detail safely (never logs the key value)
          console.error(`[places] HTTP ${res.statusCode} status=${errInfo?.error?.status} code=${errInfo?.error?.code} msg=${errInfo?.error?.message}`);
          reject(new Error(`HTTP_${res.statusCode}`));
          return;
        }
        try { resolve(JSON.parse(d)); }
        catch (_) { reject(new Error('json_parse')); }
      });
    });
    req.on('error',   e  => reject(new Error(`net_${e.code||e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(buf); req.end();
  });
}

// searchNearby — uses includedTypes, requires confirmed Table A types
// IMPORTANT: radius (not radiusMeters) is the correct field for Places API (New)
async function searchNearby(latN, lngN, radiusM, types) {
  const body = {
    includedTypes:       types,
    maxResultCount:      20,
    rankPreference:      'DISTANCE',
    locationRestriction: {
      circle: {
        center: { latitude: latN, longitude: lngN },
        radius: radiusM,   // ← correct field name (NOT radiusMeters)
      }
    },
  };
  return httpsPost('/v1/places:searchNearby', body, { 'X-Goog-FieldMask': NEARBY_FIELDS });
}

// searchText — uses a text query with locationBias circle
// IMPORTANT: radius (not radiusMeters) is the correct field
async function searchText(latN, lngN, radiusM, textQuery) {
  const body = {
    textQuery,
    maxResultCount: 20,
    rankPreference: 'DISTANCE',
    locationBias: {
      circle: {
        center: { latitude: latN, longitude: lngN },
        radius: radiusM,   // ← correct field name (NOT radiusMeters)
      }
    },
  };
  return httpsPost('/v1/places:searchText', body, { 'X-Goog-FieldMask': TEXT_FIELDS });
}

// Scrapyard/junkyard exclusion — applied to both OSM and Google results
const SCRAP_RE = /отпад|otpad|scrap.?yard|junk.?yard|dismantl|autoverwertung|schrottplatz|recycl/i;
function isScrap(name, types, cat) {
  if (cat !== 'garage') return false;
  if (SCRAP_RE.test(name)) return true;
  if (Array.isArray(types) && types.some(t => ['recycling','junk_store','scrap_yard'].includes(t))) return true;
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
    opening: place.regularOpeningHours?.weekdayDescriptions?.slice(0, 2).join('; ') || '',
    rating:  place.rating || null,
    mapsUrl: place.googleMapsUri || '',
  };
}

// Main entry: fetch Places results for a category around lat/lng
// cityHint = nearest town name from reverse geocoding (optional, improves relevance)
async function fetchPlacesForCategory(cat, latN, lngN, radiusM = 30000, cityHint = '', countryCode = '') {
  if (!GOOGLE_KEY) {
    return { configured: false, results: [] };
  }

  const queries  = buildQueries(cat, cityHint, countryCode);
  const nearConf = NEARBY_CATS[cat];
  const allPlaces = [];
  const errors    = [];

  // Run Nearby Search + all Text Searches in parallel
  const tasks = [];

  if (nearConf) {
    tasks.push(
      searchNearby(latN, lngN, radiusM, nearConf.types)
        .then(d => allPlaces.push(...(d.places || [])))
        .catch(e => { errors.push(`nearby:${e.message}`); console.warn(`[places] nearby:${e.message}`); })
    );
  }

  // Run text queries sequentially to avoid hammering the API simultaneously
  // (we await them as a group but they're separate requests)
  for (const q of queries) {
    tasks.push(
      searchText(latN, lngN, radiusM, q)
        .then(d => {
          const places = d.places || [];
          console.log(`[places] query="${q}" returned=${places.length}${places.length>0?' first='+places[0]?.displayName?.text:''}`);
          allPlaces.push(...places);
        })
        .catch(e => { errors.push(`text:${e.message}`); console.warn(`[places] text "${q}": ${e.message}`); })
    );
  }

  await Promise.all(tasks);

  // Normalize, filter scrap, enforce 30km hard cap, dedup by name, sort by dist
  const beforeFilter = allPlaces.length;
  const seen = new Set();

  const results = allPlaces
    .map(p => normalizePlaceResult(p, latN, lngN))
    .filter(p => {
      if (!p) return false;
      if (isScrap(p.name, [], cat)) return false;
      if (p.dist > MAX_DIST_KM) return false;
      const key = p.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 20);

  const removedOver30 = allPlaces.filter(p => {
    const loc = p.location || {};
    return haversine(latN, lngN, loc.latitude || 0, loc.longitude || 0) > MAX_DIST_KM;
  }).length;

  const nearest5 = results.slice(0, 5).map(r => `${r.name}(${r.dist}km)`).join(', ');
  console.log(`[places] cat=${cat} city_hint="${cityHint}" raw=${beforeFilter} after_30km_filter=${results.length} returned=${results.length} nearest=[${nearest5}]${errors.length ? ' errors='+errors.join(',') : ''}`);

  return { configured: true, results, partialErrors: errors.length ? errors : undefined };
}

module.exports = { fetchPlacesForCategory, isScrap, GOOGLE_KEY };
