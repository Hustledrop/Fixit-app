// api/places.js — Google Places Nearby Search (server-side, key never exposed to client)
//
// SETUP (owner must do):
//  1. console.cloud.google.com → New project
//  2. Enable "Places API (New)" (or classic Places API)
//  3. APIs & Services → Credentials → Create API Key
//  4. Restrict key: Application restrictions = None (server use)
//     API restrictions = restrict to "Places API" only
//  5. Billing → set budget alert at €5–10/month
//  6. Vercel → Environment Variables → GOOGLE_MAPS_API_KEY = AIza...
//  7. Redeploy → Places hybrid search activates automatically
//
// Pricing (2024): ~$17/1000 requests. With 30-min cache, real cost is very low.
// Budget estimate: 1000 users/day × 2 category taps = 2000 OSM requests, 
//   Places only called when OSM returns <3 results — maybe 20% = 400 Places calls/day = $6.80/day.
//   Set billing alert at $10/day to be safe.
//
// GOOGLE_MAPS_API_KEY must NOT be a VITE_ variable — Vite would embed it in the JS bundle.

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_URL  = 'https://places.googleapis.com/v1/places:searchNearby';

// Category → Google Places type mapping
// Uses official Google Places types: https://developers.google.com/maps/documentation/places/web-service/place-types
const CAT_TO_TYPES = {
  garage:   ['car_repair'],
  parts:    ['auto_parts_store'],
  tyres:    ['tire_shop'],             // Google Places has a dedicated tire_shop type
  petrol:   ['gas_station'],
  hardware: ['hardware_store', 'home_improvement_store'],
  vet:      ['veterinary_care'],
  it:       ['electronics_store', 'computer_store'],  // no specific IT repair type; filter later
  moto:     ['motorcycle_dealer', 'motorcycle_repair'],
};

// Category → text query for Places Text Search (fallback when type returns nothing)
// These are the localized MK terms + English fallback
const CAT_TO_QUERY = {
  garage:   'Автосервис OR Автомеханичар OR car repair OR auto mechanic',
  parts:    'Автоделови OR Резервни делови OR auto parts store',
  tyres:    'Вулканизер OR вулканизерски сервис OR tyre service OR tire shop',
  petrol:   'Бензинска пумпа OR gas station OR petrol station',
  hardware: 'Железарија OR Градежни материјали OR hardware store OR building materials',
  vet:      'Ветеринар OR Ветеринарна станица OR veterinary clinic',
  it:       'Компјутерски сервис OR Поправка на компјутери OR computer repair',
  moto:     'Мото сервис OR Сервис за мотори OR motorcycle repair OR motorcycle parts',
};

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, dLa=(la2-la1)*Math.PI/180, dLo=(lo2-lo1)*Math.PI/180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

async function nearbySearch(lat, lng, radiusM, cat) {
  const types = CAT_TO_TYPES[cat] || ['establishment'];
  const body  = JSON.stringify({
    includedTypes:      types,
    maxResultCount:     20,
    locationRestriction: {
      circle: { center: { latitude: lat, longitude: lng }, radiusMeters: radiusM }
    },
  });

  const https = require('https');
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'places.googleapis.com',
      path:     '/v1/places:searchNearby',
      method:   'POST',
      headers:  {
        'Content-Type':     'application/json',
        'X-Goog-Api-Key':   GOOGLE_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.currentOpeningHours,places.rating,places.id',
        'Content-Length':   Buffer.byteLength(body),
      },
      timeout: 8000,
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
        try { resolve(JSON.parse(d)); }
        catch (_) { reject(new Error('json_parse')); }
      });
    });
    req.on('error',   e  => reject(new Error(`net_${e.code}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body); req.end();
  });
}

function normalizePlacesResult(place, latN, lngN, cat) {
  const loc = place.location || {};
  const plat = loc.latitude  || 0;
  const plng = loc.longitude || 0;
  const name = place.displayName?.text || '';
  if (!name) return null;
  return {
    id:          `google_${place.id}`,
    source:      'google',
    name,
    lat:         plat,
    lng:         plng,
    dist:        Math.round(haversine(latN, lngN, plat, plng) * 1000) / 1000,
    addr:        place.formattedAddress || '',
    phone:       place.nationalPhoneNumber || '',
    website:     place.websiteUri || '',
    opening:     place.currentOpeningHours?.weekdayDescriptions?.join('; ') || '',
    rating:      place.rating || null,
    mapsUrl:     `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${place.id}`,
  };
}

// Handler: GET /api/places?cat=garage&lat=41.7&lng=21.8&radius=30000
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET')     { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!GOOGLE_KEY) {
    // No crash — return a clear not-configured response
    return res.status(200).json({
      configured: false,
      results: [],
      message: 'Google Places not configured. Add GOOGLE_MAPS_API_KEY in Vercel environment variables.',
    });
  }

  const { cat = 'garage', lat, lng, radius = '30000' } = req.query;
  const latN    = parseFloat(lat);
  const lngN    = parseFloat(lng);
  const radiusM = Math.min(parseInt(radius), 50000); // cap at 50km

  if (isNaN(latN) || isNaN(lngN)) {
    return res.status(400).json({ error: 'Invalid lat/lng' });
  }

  console.log(`[places] cat=${cat} lat=${latN} lng=${lngN} radius=${radiusM}m`);

  try {
    const data    = await nearbySearch(latN, lngN, radiusM, cat);
    const places  = data.places || [];

    const results = places
      .map(p => normalizePlacesResult(p, latN, lngN, cat))
      .filter(Boolean)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 20);

    console.log(`[places] returned=${results.length} cat=${cat}`);
    res.status(200).json({ configured: true, results });
  } catch (err) {
    console.error(`[places] error: ${err.message}`);
    res.status(200).json({ configured: true, results: [], error: err.message });
  }
};
