// api/nearby.js — FixIt Nearby  FIXIT_NEARBY_CONCURRENT_V9
//
// ── ARCHITECTURE ──────────────────────────────────────────────────────────────
// Google Places + OSM start CONCURRENTLY at t=0.
//
// DELIVERY_WINDOW (7s): respond as soon as either provider returns
//   ≥ 1 usable classified result. The other provider is discarded.
//   A 200ms grace period lets a near-simultaneous second provider merge in.
//
// FULL-WAIT path: if neither provider returns usable results within the
//   delivery window, wait for both up to GLOBAL_DEADLINE (20s).
//   Only return empty when BOTH genuinely fail or return 0 classified results.
//
// Cache: one format, one entry per (cat+location+cc). Normal TTL.
//   Cached entry = whatever was returned (winner or merge). No special states.
//
// Vercel maxDuration = 25s. GLOBAL_DEADLINE = 20s leaves 5s for serialisation.
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINTS         = ['overpass-api.de', 'overpass.kumi.systems'];
const SOCKET_TIMEOUT_MS = 8000;    // per Overpass endpoint attempt
const DELIVERY_WINDOW   = 7000;    // respond with first usable result after this ms
const GRACE_MS          = 200;     // after winner, wait this long for other to merge
const GLOBAL_DEADLINE   = 20000;  // 20s hard cap — 5s margin under vercel.json maxDuration:25
const MIN_RESULTS       = 3;       // OSM pass2 threshold (expand radius if < this)

// ── Classifiers ───────────────────────────────────────────────────────────────

const GOOGLE_NEVER_AUTO = new Set([
  'bicycle_store','clothing_store','shoe_store','jewelry_store','book_store',
  'beauty_salon','hair_care','spa','florist','gift_shop','toy_store',
  'home_goods_store','furniture_store','art_gallery','grocery_or_supermarket',
  'convenience_store','pharmacy','supermarket','department_store','shopping_mall',
  'real_estate_agency','insurance_agency','accounting','lawyer','doctor',
  'hospital','school','university','library','museum','church',
  'restaurant','cafe','bar','night_club','movie_theater','hotel','lodging',
  'storage','parking','laundry','gym','stadium','embassy',
  // Transit / mobility — never automotive repair or fuel
  'transit_station','bus_station','train_station','subway_station','light_rail_station',
  'ferry_terminal','airport','taxi_stand',
  // EV charging is NOT a petrol station
  'electric_vehicle_charging_station',
  // Cycling — excluded from garage/parts/petrol
  'bicycle_repair_shop',
  // Sporting goods — helmets etc
  'sporting_goods_store',
  // Marine / boat — not car repair
  'marina','boat_rental',
  // Architecture / construction offices
  'general_contractor',
]);

const OSM_NEVER_AUTO = new Set([
  'bicycle','boats','boat','marine','fashion','bag','bags','clothes','clothing',
  'helmet','motorcycle_parts','moped','scooter_parts',
  'art','art_gallery','antiques','books','toys','gift','jewelry','jewellery',
  'beauty','hairdresser','optician','shoes','sports','alcohol','bakery',
  'butcher','seafood','supermarket','greengrocer','kiosk','convenience',
  'mobile_phone','computer','electronics','music','video','department_store',
  'mall','florist','garden_centre','pet','farm','market','rental',
  'car_rental','car','vehicle','military','agricultural',
  'parking','parking_space','fuel','charging_station','car_wash','car_sharing',
  'bus_station','taxi','bicycle_rental','bicycle_parking',
  'architect','lawyer','accountant','insurance','estate_agent','company',
  'bicycle_repair','boatbuilder','shipwright','blacksmith','carpenter',
  'electrician','plumber','painter','roofer','photographer',
]);

function classifyOSM(tags, cat) {
  const shop = tags.shop || '', craft = tags.craft || '', amenity = tags.amenity || '';
  if (OSM_NEVER_AUTO.has(shop))   return { accept: false, reason: `osm:shop=${shop}` };
  if (OSM_NEVER_AUTO.has(amenity))return { accept: false, reason: `osm:amenity=${amenity}` };
  if (craft && OSM_NEVER_AUTO.has(craft)) return { accept: false, reason: `osm:craft=${craft}` };

  const hasRepair     = shop==='car_repair'||craft==='car_repair'||craft==='mechanic'
    ||craft==='auto_electrician'||craft==='automotive'||amenity==='car_repair'
    ||tags['service:vehicle:repair']==='yes'||tags['service:vehicle:motor_vehicle']==='yes'
    ||shop==='vehicle'||shop==='workshop'||craft==='vehicle_repair';
  const hasMotoRepair = shop==='motorcycle_repair'||craft==='motorcycle_repair'
    ||craft==='motorcycle_service'||tags['service:vehicle:motorcycle']==='yes';
  const hasTyre       = shop==='tyres'||shop==='tires'||shop==='vulcanizer'
    ||craft==='tyre_fitting'||craft==='tire_fitting'
    ||tags['service:vehicle:tyres']==='yes'||tags['service:vehicle:tires']==='yes'
    ||tags['service:vehicle:tyre_repair']==='yes'||tags['service:vehicle:wheels']==='yes'
    ||tags['service:tyres']==='yes';
  const hasParts      = shop==='car_parts'||shop==='auto_parts'||shop==='automotive'
    ||shop==='motorcycle_parts'||shop==='vehicle_parts'
    ||tags['service:vehicle:parts']==='yes';

  if (cat === 'garage') {
    if ((shop==='tyres'||shop==='tires'||shop==='vulcanizer') && !hasRepair && !hasMotoRepair)
      return { accept: false, reason: 'osm:tyres-only' };
    if (hasParts && !hasRepair && !hasMotoRepair)
      return { accept: false, reason: 'osm:parts-only' };
    if (hasRepair || hasMotoRepair) return { accept: true, reason: `osm:${shop||craft||amenity}` };
    return { accept: false, reason: 'osm:no repair tag' };
  }
  if (cat === 'parts') {
    if ((hasRepair||hasMotoRepair) && !hasParts) return { accept: false, reason: 'osm:repair-only' };
    if (hasParts) return { accept: true, reason: `osm:${shop}` };
    return { accept: false, reason: 'osm:no parts tag' };
  }
  if (cat === 'tyres') {
    if ((hasRepair||hasMotoRepair) && !hasTyre) return { accept: false, reason: 'osm:repair-only,no tyre tag' };
    if (hasTyre) return { accept: true, reason: 'osm:tyre confirmed' };
    return { accept: false, reason: 'osm:no tyre tag' };
  }
  return { accept: true, reason: 'osm:other' };
}

const TYRE_NAME_RE = /vulcan|βουλκαν|vullkan|tyre|tire|guma|gumi|ελαστ|reife|pneu|gomm|gumiabr|llantas|neumát|lastik|pneus|タイヤ|타이어|轮胎|إطار|إطارات|टायर/i;

// ── Per-category explicit ALLOW / DENY ───────────────────────────────────────
// Every category has an explicit allowlist of Google Place primaryTypes.
// Anything not on the allowlist is rejected (default-deny).
// DENY entries that might slip through (e.g. car_repair appearing in petrol
// results) are caught first.

const CAT_ALLOW = {
  garage: new Set([
    'car_repair',          // primary type for repair workshops
    'car_dealer',          // only if also has car_repair in types[]
  ]),
  parts: new Set([
    'auto_parts_store',
  ]),
  tyres: new Set([
    // No dedicated Google type for tyre shops — car_repair is the proxy.
    // Accepted only when name also contains a tyre keyword (see classifyGoogle).
    'car_repair',
  ]),
  petrol: new Set([
    'gas_station',
  ]),
  hardware: new Set([
    'hardware_store',
    'home_improvement_store',
    'general_store',
  ]),
  vet: new Set([
    'veterinary_care',
  ]),
  it: new Set([
    'computer_store',
    'electronics_store',    // only when repair-focused (name check below)
    'cell_phone_store',     // phone repair shops often tagged this way
  ]),
  moto: new Set([
    'motorcycle_dealer',
    'car_dealer',           // some moto dealers are tagged car_dealer
  ]),
};

// Types that explicitly exclude a result for a given category even if they
// appear alongside an allowed type (e.g. car_repair + transit_station).
const CAT_DENY = {
  garage: new Set([
    'bicycle_store','bicycle_repair_shop','sporting_goods_store',
    'transit_station','bus_station','electric_vehicle_charging_station',
    'marina','boat_dealer','boat_rental',
    'general_contractor',       // architecture / construction
    'moving_company',
  ]),
  petrol: new Set([
    'transit_station','bus_station','train_station','subway_station',
    'light_rail_station','ferry_terminal','airport','taxi_stand',
    'electric_vehicle_charging_station',
    'cafe','restaurant','convenience_store','supermarket',
  ]),
  it: new Set([
    'cafe','restaurant','bar','night_club',
    'lighting_store','audio_video_electronics_store','camera_store',
    'home_goods_store','furniture_store','department_store',
    'bicycle_store','car_repair','auto_parts_store',
    'security_system_service',  // security companies
    'optician',                 // optics
    'tv_station',
  ]),
  moto: new Set([
    'bicycle_store','bicycle_repair_shop','car_repair',
    'auto_parts_store',         // generic parts — moto must be explicit
  ]),
};

// IT: electronics_store is in the allowlist but too broad —
// only accept when the name suggests repair/IT focus
const IT_REPAIR_RE = /repair|fix|service|it |computer|laptop|pc |phone|mobile|tablet|τεχνικ|επισκευ|servis|reparatur|informatik|riparaz|répar/i;


function classifyGoogle(place, cat) {
  const primary = place.primaryType || '';
  const types   = Array.isArray(place.types) ? place.types : [];
  const allT    = new Set([primary, ...types]);
  const name    = (place.displayName?.text || '').toLowerCase();

  const allow   = CAT_ALLOW[cat];
  const deny    = CAT_DENY[cat];

  // 1. Hard deny — trumps everything
  if (deny) {
    for (const t of allT) {
      if (deny.has(t)) {
        return { accept: false, reason: `deny:${t}` };
      }
    }
  }

  // 2. Must have at least one allowed type
  if (allow) {
    const hasAllowed = [...allT].some(t => allow.has(t));
    if (!hasAllowed) {
      return { accept: false, reason: `no_allowed_type(primary=${primary||'null'})` };
    }
  }

  // 3. Category-specific sub-rules

  if (cat === 'garage') {
    // car_dealer without car_repair = showroom only, not a workshop
    if (primary === 'car_dealer' && !allT.has('car_repair')) {
      return { accept: false, reason: 'dealer_without_repair' };
    }
    return { accept: true, reason: `garage:${primary}` };
  }

  if (cat === 'parts') {
    return { accept: true, reason: 'parts:auto_parts_store' };
  }

  if (cat === 'tyres') {
    // car_repair is the only allowed type, but we require a tyre name keyword
    // to distinguish from generic garages
    if (!TYRE_NAME_RE.test(name)) {
      return { accept: false, reason: 'tyre:car_repair_no_tyre_keyword' };
    }
    return { accept: true, reason: 'tyre:car_repair+keyword' };
  }

  if (cat === 'petrol') {
    return { accept: true, reason: 'petrol:gas_station' };
  }

  if (cat === 'it') {
    // electronics_store is broad — require repair/IT signal in name
    if (allT.has('electronics_store') && !allT.has('computer_store') && !allT.has('cell_phone_store')) {
      if (!IT_REPAIR_RE.test(name)) {
        return { accept: false, reason: 'it:electronics_store_not_repair_focused' };
      }
    }
    return { accept: true, reason: `it:${primary}` };
  }

  if (cat === 'moto') {
    return { accept: true, reason: `moto:${primary}` };
  }

  if (cat === 'hardware') {
    return { accept: true, reason: `hardware:${primary}` };
  }

  if (cat === 'vet') {
    return { accept: true, reason: 'vet:veterinary_care' };
  }

  return { accept: true, reason: 'other' };
}



// ── OSM query builder ─────────────────────────────────────────────────────────
function buildQuery(cat, south, west, north, east) {
  const b = `${south},${west},${north},${east}`;
  const parts = {
    garage:   [`node["shop"="car_repair"](${b})`,`way["shop"="car_repair"](${b})`,
               `relation["shop"="car_repair"](${b})`,`node["craft"="car_repair"](${b})`,
               `way["craft"="car_repair"](${b})`,`node["amenity"="car_repair"](${b})`,
               `way["amenity"="car_repair"](${b})`],
    parts:    [`node["shop"="car_parts"](${b})`,`way["shop"="car_parts"](${b})`,
               `node["shop"="auto_parts"](${b})`,`way["shop"="auto_parts"](${b})`],
    tyres:    [`node["shop"="tyres"](${b})`,`way["shop"="tyres"](${b})`,
               `node["shop"="tires"](${b})`,`way["shop"="tires"](${b})`,
               `node["shop"="vulcanizer"](${b})`,`way["shop"="vulcanizer"](${b})`,
               `node["craft"="tyre_fitting"](${b})`,`way["craft"="tyre_fitting"](${b})`,
               `node["service:vehicle:tyres"="yes"](${b})`,`way["service:vehicle:tyres"="yes"](${b})`,
               `node["service:vehicle:tires"="yes"](${b})`,`way["service:vehicle:tires"="yes"](${b})`,
               `node["shop"="car_repair"]["service:tyres"="yes"](${b})`],
    petrol:   [`node["amenity"="fuel"](${b})`,`way["amenity"="fuel"](${b})`],
    hardware: [`node["shop"="hardware"](${b})`,`way["shop"="hardware"](${b})`,
               `node["shop"="doityourself"](${b})`,`way["shop"="doityourself"](${b})`,
               `node["shop"="building_materials"](${b})`,`way["shop"="building_materials"](${b})`,
               `node["shop"="tools"](${b})`,`way["shop"="tools"](${b})`,
               `node["shop"="garden_centre"](${b})`,`way["shop"="garden_centre"](${b})`,
               `node["shop"="electrical"](${b})`,`way["shop"="electrical"](${b})`],
    vet:      [`node["amenity"="veterinary"](${b})`,`way["amenity"="veterinary"](${b})`],
    it:       [`node["shop"="computer"](${b})`,`way["shop"="computer"](${b})`,
               `node["craft"="electronics_repair"](${b})`,`way["craft"="electronics_repair"](${b})`,
               `node["shop"="mobile_phone"](${b})`,`way["shop"="mobile_phone"](${b})`],
    moto:     [`node["shop"="motorcycle"](${b})`,`way["shop"="motorcycle"](${b})`,
               `node["craft"="motorcycle_repair"](${b})`,`way["craft"="motorcycle_repair"](${b})`,
               `node["service:vehicle:motorcycle"="yes"](${b})`,
               `way["service:vehicle:motorcycle"="yes"](${b})`,
               `node["shop"="scooter"](${b})`,`way["shop"="scooter"](${b})`],
  };
  const lines = (parts[cat] || parts.garage).join(';\n  ');
  return `[out:json][timeout:7];\n(\n  ${lines};\n);\nout center tags;`;
}

// ── Scrapyard filter ──────────────────────────────────────────────────────────
const SCRAP_TAGS = new Set(['scrap_yard','recycling','second_hand','salvage']);
const SCRAP_RE   = /auto[\s-]?otpad|авто[\s-]?отпад|schrottplatz|autoverwertung|junkyard|salvage\s+yard|wrecking|vehicle\s+dismantl|recycl/i;
function isScrapyard(tags) {
  if (SCRAP_TAGS.has(tags.shop)||SCRAP_TAGS.has(tags.amenity)) return true;
  if (tags.recycling_type||tags.craft==='salvage') return true;
  return SCRAP_RE.test([tags.name,tags.operator,tags.description].filter(Boolean).join(' '));
}

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversine(la1,lo1,la2,lo2) {
  const R=6371,dLa=(la2-la1)*Math.PI/180,dLo=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dLa/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── Single Overpass request ───────────────────────────────────────────────────
function fetchOverpass(host, query) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const encoded = 'data='+encodeURIComponent(query);
    const body   = Buffer.from(encoded,'utf8');
    const req = https.request({
      hostname:host, path:'/api/interpreter', method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded',
               'Content-Length':body.length,'User-Agent':'FixItApp/1.0','Accept':'application/json'},
      timeout:SOCKET_TIMEOUT_MS,
    }, r => {
      let d=''; r.on('data',c=>{d+=c;});
      r.on('end',()=>{
        if (r.statusCode===429){reject(new Error('rate_limited'));return;}
        if (r.statusCode!==200){reject(new Error(`http_${r.statusCode}`));return;}
        try{resolve(JSON.parse(d));}catch(_){reject(new Error('json_parse'));}
      });
    });
    req.on('error', e=>reject(new Error(`net_${e.code||e.message}`)));
    req.on('timeout',()=>{req.destroy();reject(new Error('socket_timeout'));});
    req.write(body); req.end();
  });
}

// ── Overpass with endpoint failover ──────────────────────────────────────────
async function fetchWithFailover(query, startMs, radiusKm) {
  for (let ei=0; ei<ENDPOINTS.length; ei++) {
    const host   = ENDPOINTS[ei];
    const remain = GLOBAL_DEADLINE - (Date.now()-startMs);
    console.log(`[nearby] endpoint=${host} radius=${radiusKm}km remaining=${remain}ms`);
    if (remain < SOCKET_TIMEOUT_MS+500) {
      console.warn('[nearby] budget_exhausted — stopping Overpass');
      return { data:null, endpointFailed:true };
    }
    const t0 = Date.now();
    try {
      const d  = await fetchOverpass(host, query);
      const ms = Date.now()-t0;
      console.log(`[nearby] pass_success raw=${(d.elements||[]).length} ms=${ms}`);
      return { data:d, endpointFailed:false };
    } catch (err) {
      const ms = Date.now()-t0;
      console.warn(`[nearby] endpoint_fail endpoint=${host} reason=${err.message} ms=${ms}`);
      if (err.message==='socket_timeout'||err.message==='rate_limited') {
        return { data:null, endpointFailed:true };
      }
    }
  }
  return { data:null, endpointFailed:true };
}

// ── Process OSM elements → classified results ─────────────────────────────────
function processElements(elements, cat, latN, lngN, distLimitKm, seen) {
  const results = [];
  for (const el of elements) {
    const tags = el.tags||{};
    if (isScrapyard(tags)) continue;
    if (['garage','parts','tyres'].includes(cat)) {
      const cls = classifyOSM(tags, cat);
      if (!cls.accept) { console.log(`[nearby] OSM reject "${tags.name||'?'}" reason=${cls.reason}`); continue; }
    }
    const name = tags.name||tags.brand||tags.operator||tags.amenity||null;
    if (!name||seen.has(name)) continue;
    const elLat=el.lat??el.center?.lat, elLon=el.lon??el.center?.lon;
    if (!elLat||!elLon) continue;
    const dist = haversine(latN,lngN,parseFloat(elLat),parseFloat(elLon));
    if (dist>distLimitKm) continue;
    seen.add(name);
    const street = tags['addr:street']
      ? tags['addr:street']+(tags['addr:housenumber']?' '+tags['addr:housenumber']:'') : null;
    results.push({ name, lat:parseFloat(elLat), lng:parseFloat(elLon),
      dist:Math.round(dist*1000)/1000,
      addr:[street,tags['addr:city'],tags['addr:postcode']].filter(Boolean).join(', ')||'',
      phone:tags.phone||tags['contact:phone']||'', opening:tags.opening_hours||'',
      website:tags.website||tags['contact:website']||'' });
  }
  return results;
}

// ── OSM pipeline (pass1 + optional pass2) ────────────────────────────────────
// Resolves with { results: [] } — never rejects.
async function runOSM(cat, latN, lngN, startMs) {
  const PASSES = [
    { ns:0.045, ew:0.060, radiusKm:5  },
    { ns:0.270, ew:0.360, radiusKm:30 },
  ];
  const seen=[]; const seenSet=new Set(); let all=[];
  for (let pi=0; pi<PASSES.length; pi++) {
    const {ns,ew,radiusKm}=PASSES[pi];
    const remain=GLOBAL_DEADLINE-(Date.now()-startMs);
    console.log(`[nearby] PASS${pi+1} cat=${cat} radiusKm=${radiusKm} remaining=${remain}ms`);
    if (remain<SOCKET_TIMEOUT_MS+1000) { console.warn(`[nearby] PASS${pi+1} skipped — no budget`); break; }
    const s=(latN-ns).toFixed(6),n=(latN+ns).toFixed(6),w=(lngN-ew).toFixed(6),e=(lngN+ew).toFixed(6);
    const {data,endpointFailed}=await fetchWithFailover(buildQuery(cat,s,w,n,e),startMs,radiusKm);
    if (endpointFailed||!data) {
      const remain2 = GLOBAL_DEADLINE-(Date.now()-startMs);
      console.warn(`[nearby] PASS${pi+1} failed endpointFailed=${endpointFailed} hasData=${!!data} deadline_remaining=${remain2}ms`);
      break;
    }
    const newR=processElements(data.elements||[],cat,latN,lngN,radiusKm+5,seenSet);
    all=[...all,...newR].sort((a,b)=>a.dist-b.dist);
    console.log(`[nearby] PASS${pi+1} raw=${(data.elements||[]).length} new=${newR.length} total=${all.length}`);
    if (all.length>=MIN_RESULTS) { console.log(`[nearby] ≥${MIN_RESULTS} — stopping OSM at PASS${pi+1}`); break; }
  }
  return { results:all };
}

// ── Merge Google into OSM results ─────────────────────────────────────────────
const MERGE_SCRAP = /отпад|auto.?otpad|schrottplatz|autoverwertung|junkyard|salvage.?yard|wrecking|dismantl|recycl/i;
function mergeGoogle(placesData, existing, cat) {
  if (!placesData?.configured) return existing;
  const raw=placesData.results||[];
  if (!raw.length) return existing;
  console.log(`[nearby] google_count=${raw.length} names=[${raw.slice(0,5).map(r=>r.name).join(',')}]`);
  // Diagnostic: show what arrives from places-lib (already pre-filtered)
  if (['parts','tyres','petrol','garage'].includes(cat)) {
    console.log(`[nearby-diag] cat=${cat} google_after_places_filter=${raw.length}`);
    raw.slice(0,10).forEach((r,i) => console.log(`[nearby-diag] #${i} "${r.name}" dist=${r.dist}km lat=${r.lat} lng=${r.lng}`));
  }
  const osmNames=new Set(existing.map(r=>r.name.toLowerCase().trim()));
  let scrap=0, rejected=0;
  // Targeted trace: did any false-positive survive places-lib and arrive at merge?
  const TRACE = ['ποδηλατα','helmetsgr','helmet','bicycle','bike'];
  raw.forEach(r => {
    if (TRACE.some(t => (r.name||'').toLowerCase().includes(t))) {
      console.log(`[TRACE] ARRIVED_AT_MERGE cat=${cat} name="${r.name}" primaryType=${r.primaryType||'null'} types=[${(r.types||[]).join(',')}]`);
    }
  });
  const deduped=raw.filter(p=>{
    const pn=(p.name||'').toLowerCase().trim();
    // Scrapyard check on name
    if (MERGE_SCRAP.test(pn)){scrap++;return false;}
    // NOTE: classifyGoogle is NOT called here.
    // places-lib already ran classifyGoogle on raw Google objects (with primaryType/types)
    // BEFORE normalization. Results in placesData.results are pre-classified.
    // Re-running classifyGoogle on normalized results (which have no primaryType/types)
    // would reject everything — normalized places have only name/lat/lng/dist/addr.
    // Dedup: skip if OSM already has same name
    if (osmNames.has(pn)) return false;
    // Dedup: skip if within 50m of an existing result
    const survived = !existing.some(r=>Math.abs(r.lat-p.lat)<0.0005&&Math.abs(r.lng-p.lng)<0.0005);
    if (survived) console.log(`[nearby] merge ACCEPT "${p.name}" dist=${p.dist}km cat=${cat}`);
    return survived;
  });
  const merged=[...existing,...deduped].sort((a,b)=>a.dist-b.dist).slice(0,25);
  console.log(`[nearby] merged=${merged.length} scrap=${scrap} rejected=${rejected} dedup=${raw.length-deduped.length}`);
  return merged;
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method==='OPTIONS'){res.status(200).end();return;}
  if (req.method!=='GET')    {res.status(405).json({error:'Method not allowed'});return;}

  const {cat='garage',lat,lng,city='',cc=''}=req.query;
  const countryCode=(cc||'').toUpperCase();
  const latN=parseFloat(lat), lngN=parseFloat(lng);
  if (isNaN(latN)||isNaN(lngN)){res.status(400).json({error:'Invalid lat/lng'});return;}

  const startMs=Date.now();
  const {fetchPlacesForCategory}=require('./places-lib.js');
  const ALWAYS_GOOGLE=new Set(['tyres','garage','vet']);
  const HYBRID_THRESHOLD=5;
  const MK_GOOGLE_FIRST=countryCode==='MK'&&(cat==='tyres'||cat==='garage');

  console.log(`[nearby] START cat=${cat} cc=${countryCode} city=${city} lat=${latN} lng=${lngN}`);

  // ── Step 1: start BOTH providers concurrently at t=0 ─────────────────────
  const googleT0=Date.now();
  const googlePromise=fetchPlacesForCategory(cat,latN,lngN,30000,city,countryCode)
    .then(d=>{console.log(`[nearby] google_done ms=${Date.now()-googleT0} count=${d?.results?.length??0}`);return d;})
    .catch(err=>{console.warn(`[nearby] google_error: ${err.message}`);return{configured:false,results:[]};});

  const osmT0=Date.now();
  const osmPromise=runOSM(cat,latN,lngN,startMs)
    .then(d=>{console.log(`[nearby] osm_done ms=${Date.now()-osmT0} count=${d.results.length}`);return d;})
    .catch(err=>{console.warn(`[nearby] osm_error: ${err.message}`);return{results:[]};});

  // ── Step 2: race both against delivery window ─────────────────────────────
  // Whichever provider finishes first with ≥1 usable result wins.
  // If neither wins within DELIVERY_WINDOW, fall through to full-wait.
  const needsGoogle = MK_GOOGLE_FIRST||ALWAYS_GOOGLE.has(cat);

  // Wrap each promise to tag who won
  const gRace = googlePromise.then(d => ({ src:'google', data:d }));
  const oRace = osmPromise.then(d    => ({ src:'osm',    data:d }));
  const timer  = new Promise(r => setTimeout(() => r({ src:'timeout', data:null }), DELIVERY_WINDOW));

  const winner = await Promise.race([gRace, oRace, timer]);

  // ── Step 3: decision ──────────────────────────────────────────────────────
  let results = [];
  let responded = false;

  const CLASSIFIED = new Set(['garage','parts','tyres','petrol','it','moto','hardware','vet']);

  const respond = (finalResults, path) => {
    if (responded) return;
    responded = true;

    // ── Final gate: classify before sending ──────────────────────────────────
    // primaryType/types[] are preserved through normalizePlaceResult.
    // This is the last line of defence — runs regardless of which code path
    // produced the results (google_won, osm_won, full_wait).
    const TRACE = ['ποδηλατα','helmetsgr','helmet','bicycle','bike'];
    let gated = finalResults;
    if (CLASSIFIED.has(cat)) {
      const before = finalResults.length;
      gated = finalResults.filter(r => {
        if (r.source !== 'google') return true;          // OSM always passes
        if (!r.primaryType && !(r.types && r.types.length)) return true; // no metadata
        const cls = classifyGoogle(r, cat);
        // Targeted trace
        if (TRACE.some(t => (r.name||'').toLowerCase().includes(t))) {
          console.log(`[TRACE] FINAL_GATE cat=${cat} name="${r.name}" primaryType=${r.primaryType||'null'} types=[${(r.types||[]).join(',')}] displayName=${r.displayName?.text||'MISSING'} → ${cls.accept?'ACCEPT':'REJECT'} reason=${cls.reason}`);
        }
        if (!cls.accept) {
          console.log(`[nearby] final_gate REJECT "${r.name}" reason=${cls.reason}`);
          return false;
        }
        return true;
      });
      if (gated.length < before) {
        console.log(`[nearby] final_gate ${cat}: ${before}→${gated.length} removed ${before-gated.length}`);
      }
    }

    const totalMs = Date.now()-startMs;
    const names = gated.slice(0,5).map(r=>`${r.name}(${r.dist}km)`).join(',');
    console.log(`[nearby] RESPOND path=${path} count=${gated.length} total_ms=${totalMs} names=[${names}]`);
    // Targeted trace: flag if any false positive made it to the final response
    gated.forEach(r => {
      if (TRACE.some(t => (r.name||'').toLowerCase().includes(t))) {
        console.log(`[TRACE] IN_FINAL_RESPONSE cat=${cat} name="${r.name}" source=${r.source||'?'} primaryType=${r.primaryType||'null'} — UNEXPECTED`);
      }
    });
    res.status(200).json({
      results: gated,
      fallbackUsed: gated.length===0,
      fallbackReason: gated.length===0 ? 'both_providers_failed' : undefined,
      totalMs, cat,
    });
  };

  const extractGoogle = (data) => {
    // Apply classifier + merge with empty OSM base
    return mergeGoogle(data, [], cat);
  };

  const extractOSM = (data) => data?.results || [];

  if (winner.src === 'google') {
    // Google finished first
    const gResults = extractGoogle(winner.data);
    if (gResults.length > 0) {
      // Google has usable results — wait a short grace period for OSM to merge
      const grace = await Promise.race([
        osmPromise.then(d => ({ src:'osm', data:d })),
        new Promise(r => setTimeout(() => r({ src:'grace_timeout' }), GRACE_MS)),
      ]);
      if (grace.src === 'osm') {
        // OSM also finished within grace — merge both
        const osmR = extractOSM(grace.data);
        results = needsGoogle ? mergeGoogle(winner.data, osmR, cat) : osmR;
        console.log(`[nearby] path=both_in_grace google=${gResults.length} osm=${osmR.length}`);
      } else {
        // OSM still running — respond with Google results only
        results = gResults;
        console.log(`[nearby] path=google_won osm_still_running`);
      }
      respond(results, winner.src === 'osm' ? 'osm_grace' : 'google_early');
    }
    // else: Google returned 0 usable results — fall through to full-wait
  }

  if (!responded && winner.src === 'osm') {
    // OSM finished first — respond as soon as we have ≥1 usable classified result.
    // ALWAYS_GOOGLE means Google improves recall, but must NOT block the response
    // when OSM already has valid classified results. Google runs concurrently; the
    // grace period gives it a chance to merge before we send the response.
    const osmR = extractOSM(winner.data);
    if (osmR.length >= 1) {
      results = osmR;
      // Grace period: let Google merge if it finishes within 200ms
      const grace = await Promise.race([
        googlePromise.then(d => ({ src:'google', data:d })),
        new Promise(r => setTimeout(() => r({ src:'grace_timeout' }), GRACE_MS)),
      ]);
      if (grace.src === 'google') {
        results = mergeGoogle(grace.data, osmR, cat);
        console.log(`[nearby] path=osm_won_google_grace merged=${results.length}`);
      } else {
        console.log(`[nearby] path=osm_won count=${osmR.length}`);
      }
      respond(results, 'osm_early');
    }
    // OSM returned 0 usable results → fall through to full_wait for Google
  }

  if (!responded) {
    // Neither provider returned enough in the delivery window, OR:
    // - Google returned 0 usable results, OR
    // - OSM was thin and we need Google (ALWAYS_GOOGLE / needsGoogle)
    // Wait for BOTH, up to GLOBAL_DEADLINE (20s). Never return empty if a provider is still running.
    console.log(`[nearby] path=full_wait winner=${winner.src}`);
    const [osmSettled, googleSettled] = await Promise.allSettled([osmPromise, googlePromise]);
    const osmR  = osmSettled.status==='fulfilled'   ? extractOSM(osmSettled.value)     : [];
    const gData = googleSettled.status==='fulfilled' ? googleSettled.value               : null;

    if (needsGoogle || osmR.length < HYBRID_THRESHOLD) {
      results = mergeGoogle(gData, osmR, cat);
    } else {
      results = osmR.slice(0,25);
    }
    respond(results, 'full_wait');
  }
};
