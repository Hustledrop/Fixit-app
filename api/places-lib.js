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
// ── Country-localized Google Text Search queries ──────────────────────────────
// Source: GPS-detected countryCode (never UI language).
// Multiple synonyms per category → merged before dedup → better recall.
// No city appended here — cityHint is appended by buildQueries() caller.

const COUNTRY_QUERIES = {
  GR: {
    garage: [
      'Συνεργείο αυτοκινήτων', 'Μηχανουργείο', 'Φανοποιείο',
      'Ηλεκτρολόγος αυτοκινήτων', 'Αυτοκινητιστικό συνεργείο',
      'Επισκευή αυτοκινήτων', 'Κιβώτιο ταχυτήτων', 'Αυτοκίνητα επισκευή',
    ],
    parts: [
      'Ανταλλακτικά αυτοκινήτων', 'Αυτοανταλλακτικά',
      'Ανταλλακτικά μοτοσυκλετών', 'Εξαρτήματα αυτοκινήτων',
      'Αξεσουάρ αυτοκινήτου', 'Μπαταρίες αυτοκινήτων',
    ],
    tyres: [
      'Βουλκανιζατέρ', 'Ελαστικά αυτοκινήτων', 'Επισκευή ελαστικών',
      'Ζάντες', 'Ισορρόπηση τροχών', 'Ευθυγράμμιση αυτοκινήτου',
      'Κατάστημα ελαστικών',
    ],
  },
  DE: {
    garage: [
      'Autowerkstatt', 'KFZ-Werkstatt', 'Auto Reparatur',
      'Karosserie', 'KFZ-Mechaniker', 'Motorinstandsetzung',
      'Automatikgetriebe Reparatur', 'Auto Elektrik',
    ],
    parts: [
      'Autoteile', 'KFZ-Teile', 'Kfz Ersatzteile',
      'Autoteilehandel', 'Motorradteile', 'Autobatterie',
      'Kfz-Zubehör',
    ],
    tyres: [
      'Reifenservice', 'Reifenhandel', 'Reifenmontage',
      'Reifendienst', 'Reifenwechsel', 'Felgenreparatur',
      'Reifenpanne',
    ],
  },
  IT: {
    garage: [
      'Officina auto', 'Meccanico', 'Carrozzeria',
      'Riparazione auto', 'Elettrauto', 'Officina meccanica',
      'Gommista riparazioni',
    ],
    parts: [
      'Ricambi auto', 'Pezzi di ricambio', 'Accessori auto',
      'Ricambi moto', 'Batterie auto', 'Vendita ricambi',
    ],
    tyres: [
      'Gommista', 'Pneumatici', 'Vulcanizzatore',
      'Sostituzione pneumatici', 'Equilibratura ruote',
      'Convergenza auto', 'Riparazione gomme',
    ],
  },
  FR: {
    garage: [
      'Garage automobile', 'Mécanicien auto', 'Carrosserie',
      'Réparation auto', 'Électricien auto', 'Mécanique générale',
      'Atelier mécanique',
    ],
    parts: [
      'Pièces auto', 'Pièces détachées', 'Accessoires auto',
      'Pièces moto', 'Batterie voiture', 'Équipement auto',
    ],
    tyres: [
      'Pneus', 'Service pneus', 'Changement de pneus',
      'Vulcanisateur', 'Réparation pneus', 'Équilibreur de roues',
      'Géométrie auto',
    ],
  },
  ES: {
    garage: [
      'Taller mecánico', 'Taller de coches', 'Mecánico',
      'Carrocería', 'Electricista de autos', 'Reparación de vehículos',
      'Taller multimarca',
    ],
    parts: [
      'Recambios', 'Recambios auto', 'Piezas de repuesto',
      'Accesorios de coche', 'Recambios moto', 'Batería de coche',
    ],
    tyres: [
      'Neumáticos', 'Cambio de neumáticos', 'Taller de neumáticos',
      'Vulcanizador', 'Equilibrado de ruedas', 'Alineación de ruedas',
      'Reparación de pinchazos',
    ],
  },
  PT: {
    garage: [
      'Oficina mecânica', 'Mecânico', 'Carroçaria',
      'Reparação automóvel', 'Auto electricista', 'Oficina auto',
    ],
    parts: [
      'Peças auto', 'Peças de automóvel', 'Acessórios auto',
      'Peças moto', 'Bateria de carro',
    ],
    tyres: [
      'Pneus', 'Serviço de pneus', 'Vulcanizador',
      'Mudança de pneus', 'Alinhamento de rodas',
    ],
  },
  PL: {
    garage: [
      'Warsztat samochodowy', 'Mechanik samochodowy', 'Blacharnia',
      'Naprawa samochodów', 'Elektryk samochodowy', 'Serwis auto',
    ],
    parts: [
      'Części samochodowe', 'Sklep motoryzacyjny', 'Akcesoria samochodowe',
      'Części motocyklowe', 'Akumulator samochodowy',
    ],
    tyres: [
      'Serwis opon', 'Wulkanizacja', 'Wymiana opon',
      'Wyważanie kół', 'Naprawa opon', 'Sklep z oponami',
    ],
  },
  NL: {
    garage: [
      'Autogarage', 'Automonteur', 'Carrosseriebedrijf',
      'Auto reparatie', 'Auto elektricien', 'Autobedrijf',
    ],
    parts: [
      'Auto-onderdelen', 'Autoparts', 'Onderdelen auto',
      'Motor accessoires', 'Auto accu',
    ],
    tyres: [
      'Bandenshop', 'Bandenservice', 'Banden wisselen',
      'Wieluitlijning', 'Velgen reparatie',
    ],
  },
  BE: {
    garage: ['Garage auto','Mécanicien','Carrosserie','Automonteur','Autogarage'],
    parts:  ['Pièces auto','Pièces détachées','Auto-onderdelen'],
    tyres:  ['Pneus','Service pneus','Bandenshop','Banden wisselen'],
  },
  AT: {
    garage: ['KFZ-Werkstatt','Autowerkstatt','Auto Reparatur','Karosserie','KFZ-Mechaniker'],
    parts:  ['Autoteile','KFZ-Ersatzteile','Auto Zubehör'],
    tyres:  ['Reifenservice','Reifenmontage','Reifenhandel','Reifenwechsel'],
  },
  CH: {
    garage: ['KFZ-Werkstatt','Autowerkstatt','Garagist','Carrosserie','Réparation auto'],
    parts:  ['Autoteile','Pièces auto','Auto Ersatzteile'],
    tyres:  ['Reifenservice','Service pneus','Reifenmontage'],
  },
  RS: {
    garage: ['Auto servis','Mehaničar','Autoservis','Karoserija','Elektro-auto'],
    parts:  ['Auto delovi','Delovi za automobile','Auto Delovi','Akumulator'],
    tyres:  ['Vulkanizer','Servis guma','Gume','Montaža guma'],
  },
  HR: {
    garage: ['Auto servis','Mehaničar','Autoservis','Karoserija','Elektroauto'],
    parts:  ['Auto dijelovi','Autodijelovi','Dijelovi za auta','Akumulator za auto'],
    tyres:  ['Vulkanizer','Servis guma','Gume','Montaža guma'],
  },
  MK: {
    garage: ['Автосервис','Авто сервис','Avto servis','Механичар','Авто електричар'],
    parts:  ['Авто делови','Автоделови','Резервни делови','Делови за автомобили'],
    tyres:  ['Вулканизер','Сервис за гуми','Гуми','Монтажа гуми'],
  },
  TR: {
    garage: ['Oto tamiri','Oto servis','Kaportacı','Oto elektrikçi','Araba tamircisi'],
    parts:  ['Oto yedek parça','Araba parçaları','Aksesuar oto','Akü oto'],
    tyres:  ['Lastik servisi','Lastikçi','Lastik değişimi','Balans ayarı'],
  },
  BG: {
    garage: ['Автосервиз','Механик','Автомеханик','Кабриолет','Авторемонт'],
    parts:  ['Авточасти','Резервни части','Авточасти и аксесоари'],
    tyres:  ['Вулканизатор','Гуми','Монтаж на гуми','Баланс на гуми'],
  },
  RO: {
    garage: ['Service auto','Mecanic auto','Tinichigerie','Electro-auto'],
    parts:  ['Piese auto','Accesorii auto','Baterie auto'],
    tyres:  ['Anvelope','Vulcanizare','Schimb anvelope','Echilibrare roți'],
  },
  HU: {
    garage: ['Autószerelő','Autószerviz','Karosszéria','Autoelektromos'],
    parts:  ['Autóalkatrész','Alkatrész','Auto kiegészítők'],
    tyres:  ['Gumiszerelő','Autógumi','Gumijavítás','Kerékcsere'],
  },
  CZ: {
    garage: ['Autoservis','Automechanik','Karosárna','Autoelektrikář'],
    parts:  ['Autodíly','Náhradní díly','Auto příslušenství'],
    tyres:  ['Vulkanizace','Pneuservis','Výměna pneumatik'],
  },
  SK: {
    garage: ['Autoservis','Automechanik','Karosár','Elektrikár áut'],
    parts:  ['Autodiely','Náhradné diely'],
    tyres:  ['Pneuservis','Vulkanizácia','Výmena pneumatík'],
  },
  // Asia-Pacific
  JP: {
    garage: ['カーサービス','自動車修理','車の修理','板金塗装','自動車整備','バイク修理'],
    parts:  ['カーパーツ','自動車部品','車のパーツ','バイク部品','カー用品'],
    tyres:  ['タイヤショップ','タイヤ交換','タイヤ修理','ホイールバランス','タイヤ販売'],
  },
  KR: {
    garage: ['자동차 수리','카센터','자동차 정비','판금도색','오토바이 수리'],
    parts:  ['자동차 부품','카 파츠','오토바이 부품','자동차 용품'],
    tyres:  ['타이어 샵','타이어 교환','타이어 수리','휠 밸런스','타이어 판매'],
  },
  CN: {
    garage: ['汽车修理','汽车维修','汽车服务','修车','汽车修理厂','摩托车修理'],
    parts:  ['汽车配件','汽车零件','摩托车配件','汽车用品'],
    tyres:  ['轮胎店','换轮胎','轮胎修理','轮胎销售','补胎'],
  },
  IN: {
    garage: ['car repair','auto repair','garage','mechanic','motor workshop','bike repair'],
    parts:  ['car parts','auto parts','spare parts','vehicle parts','bike parts'],
    tyres:  ['tyre shop','puncture repair','wheel alignment','tyre fitting','टायर शॉप'],
  },
  // South America
  BR: {
    garage: ['Oficina mecânica','Mecânico','Funilaria','Eletricista automotivo','Serviço automotivo'],
    parts:  ['Peças auto','Autopeças','Peças veículos','Acessórios automotivos'],
    tyres:  ['Borracharia','Pneus','Troca de pneus','Alinhamento','Balanceamento'],
  },
  // Middle East
  SA: {
    garage: ['ورشة سيارات','ميكانيكي','تصليح سيارات','كهرباء سيارات','صيانة سيارات'],
    parts:  ['قطع غيار سيارات','قطع غيار','اكسسوارات سيارات'],
    tyres:  ['محل إطارات','تبديل إطارات','تصليح إطارات','إطارات سيارات'],
  },
  AE: {
    garage: ['car service','auto repair','ورشة سيارات','car workshop','mechanic'],
    parts:  ['car parts','auto parts','قطع غيار','spare parts'],
    tyres:  ['tyre shop','tyre fitting','إطارات','tyre service'],
  },
  // Southeast Asia
  ID: {
    garage: ['Bengkel mobil','Montir','Servis mobil','Bengkel motor','Perbaikan kendaraan'],
    parts:  ['Spare part mobil','Onderdil mobil','Spare part motor','Aksesoris mobil'],
    tyres:  ['Toko ban','Tambal ban','Ganti ban','Balancing ban','Ban mobil'],
  },
  PH: {
    garage: ['car repair','auto repair','mechanic','vulcanizing shop','car service','auto shop'],
    parts:  ['auto parts','car parts','spare parts','motor parts'],
    tyres:  ['vulcanizing','tyre shop','tire shop','tire repair','wheel alignment'],
  },
  // Africa
  NG: {
    garage: ['car repair','auto mechanic','panel beater','auto electrician','mechanic workshop'],
    parts:  ['auto parts','spare parts','car parts','motor parts'],
    tyres:  ['tyre shop','vulcanizer','tyre fitting','wheel balancing'],
  },
  ZA: {
    garage: ['car repair','auto repair','panel beater','motor mechanic','auto electrician'],
    parts:  ['auto parts','car parts','spare parts','vehicle accessories'],
    tyres:  ['tyre shop','fitment centre','wheel alignment','tyre fitting'],
  },
  // English-speaking and fallback
  GB: {
    garage: ['Car repair','Car mechanic','Auto electrician','Body shop','MOT garage'],
    parts:  ['Car parts','Auto parts','Vehicle parts','Motorcycle parts'],
    tyres:  ['Tyre shop','Tyre fitting','Puncture repair','Wheel alignment'],
  },
  IE: {
    garage: ['Car repair','Garage','Mechanic','Body repair','Auto electrician'],
    parts:  ['Car parts','Auto parts','Vehicle accessories'],
    tyres:  ['Tyre shop','Tyre fitting','Wheel balancing'],
  },
  US: {
    garage: ['Auto repair','Car repair','Mechanic','Auto service','Body shop'],
    parts:  ['Auto parts','Car parts','Automotive store'],
    tyres:  ['Tire shop','Tire service','Wheel alignment','Tire fitting'],
  },
  AU: {
    garage: ['Auto repair','Car repair','Mechanic','Panel beater','Auto electrician'],
    parts:  ['Auto parts','Car parts','Spare parts'],
    tyres:  ['Tyre shop','Tyre fitting','Wheel alignment'],
  },
};

// Build the final query list for a category + country + cityHint
// Returns deduplicated array of query strings with city appended where appropriate.
function buildCountryQueries(cat, cityHint, countryCode) {
  const city = cityHint || '';
  // Get country-specific queries, fall back to English
  const cq = COUNTRY_QUERIES[countryCode] || COUNTRY_QUERIES['GB'];
  const catQueries = (cq && cq[cat]) ? cq[cat] : [];
  // Always add English fallback queries for international recall
  const enFallback = {
    garage:   ['car repair','auto repair','mechanic','car service','auto workshop'],
    parts:    ['auto parts','car parts','spare parts','vehicle parts'],
    tyres:    ['tyre service','tyre shop','tire shop','vulcanizer','tyre fitting'],
    petrol:   ['gas station','petrol station','fuel station'],
    it:       ['computer repair','phone repair','laptop repair','IT service','computer store'],
    moto:     ['motorcycle repair','motorcycle dealer','motorcycle parts','scooter repair'],
    hardware: ['hardware store','DIY store','building materials'],
    vet:      ['veterinary clinic','vet','animal hospital'],
  };
  const en = enFallback[cat] || [];
  // Merge: country queries + English, deduplicate.
  // City is NOT appended: locationRestriction enforces the GPS circle as the
  // hard geographic boundary. Adding a city name to the query text previously
  // caused Google to override the circle and return results 200+ km away.
  const all = [...catQueries, ...en];
  const seen = new Set();
  return all.filter(q => { if (!q || seen.has(q)) return false; seen.add(q); return true; });
}



// ── Legacy query builder (kept for non-classified categories) ───────────────
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
      `Автосервис ${mk}`.trim(),      // best single MK term — returns most garages
      `Авто сервис ${mk}`.trim(),     // handles spaced variant
      `Avto servis ${en}`.trim(),     // Latin variant (catches GALEVSKI)
      `car repair ${en}`.trim(),      // English fallback
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
      timeout: 10000, // increased from 7s: allows cold-start TLS handshake to complete
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
  console.log(`[places] searchNearby types=${types.join(',')} lat=${latN} lng=${lngN} radiusM=${radiusM}`);
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
  // searchText locationRestriction only accepts `rectangle` (not `circle`).
  // Spec: https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places/searchText#LocationRestriction
  // Convert the GPS circle (lat, lng, radiusM) into a bounding rectangle.
  // 1 degree latitude ≈ 111 320 m; longitude degrees shrink with cos(lat).
  const dLat = (radiusM / 111320);
  const dLng = (radiusM / (111320 * Math.cos(latN * Math.PI / 180)));
  const low  = { latitude: latN - dLat, longitude: lngN - dLng };
  const high = { latitude: latN + dLat, longitude: lngN + dLng };
  console.log(`[places] searchText query="${textQuery}" lat=${latN} lng=${lngN} radiusM=${radiusM}`);
  const body = {
    textQuery,
    maxResultCount: 20,
    rankPreference: 'DISTANCE',
    locationRestriction: {
      rectangle: { low, high },   // only valid shape for searchText locationRestriction
    },
  };
  return httpsPost('/v1/places:searchText', body, { 'X-Goog-FieldMask': TEXT_FIELDS });
}

// Scrapyard/junkyard exclusion — applied to both OSM and Google results
const SCRAP_RE = /отпад|otpad|scrap.?yard|junk.?yard|dismantl|autoverwertung|schrottplatz|recycl/i;
// ── Google classifier (places-lib copy, used in filter block) ─────────────────
// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY CLASSIFIER
// Priority: OSM tags → Google primaryType → Google types[] → name (last resort)
// Default-deny: a result is rejected unless it passes an inclusion check.
// Explicit exclusions override any inclusion match.
// ══════════════════════════════════════════════════════════════════════════════

// ── Shared exclusion sets ─────────────────────────────────────────────────────

// Google Place types that are always unrelated to automotive services
const GOOGLE_NEVER_AUTO = new Set([
  // Retail — non-automotive
  'bicycle_store','clothing_store','shoe_store','jewelry_store','book_store',
  'beauty_salon','hair_care','spa','florist','gift_shop','toy_store',
  'home_goods_store','furniture_store','art_gallery','grocery_or_supermarket',
  'convenience_store','pharmacy','supermarket','department_store','shopping_mall',
  // Professional/office
  'real_estate_agency','insurance_agency','accounting','lawyer','doctor',
  'hospital','school','university','library','museum','church',
  // Food/entertainment
  'restaurant','cafe','bar','night_club','movie_theater','hotel','lodging',
  // Other
  'storage','parking','laundry','gym','stadium','embassy',
  // Transit / mobility — never automotive repair or fuel
  'transit_station','bus_station','train_station','subway_station','light_rail_station',
  'ferry_terminal','airport','taxi_stand',
  // EV charging is NOT a petrol station
  'electric_vehicle_charging_station',
  // Cycling
  'bicycle_repair_shop',
  // Sporting goods — helmets etc
  'sporting_goods_store',
  // Marine / boat
  'marina','boat_rental',
  // Architecture / construction
  'general_contractor',
]);

// OSM tags whose presence excludes a node from all automotive categories
const OSM_NEVER_AUTO = new Set([
  // shop= values
  'bicycle','boats','boat','marine','fashion','bag','bags','clothes','clothing',
  'helmet','motorcycle_parts','moped','scooter_parts',
  'art','art_gallery','antiques','books','toys','gift','jewelry','jewellery',
  'beauty','hairdresser','optician','shoes','sports','alcohol','bakery',
  'butcher','seafood','supermarket','greengrocer','kiosk','convenience',
  'mobile_phone','computer','electronics','music','video','department_store',
  'mall','florist','garden_centre','pet','farm','market','rental',
  'car_rental','car','vehicle','military','agricultural',
  // amenity= values (non-repair)
  'parking','parking_space','fuel','charging_station','car_wash','car_sharing',
  'bus_station','taxi','bicycle_rental','bicycle_parking',
  // office= values
  'architect','lawyer','accountant','insurance','estate_agent','company',
  // craft= values (non-automotive)
  'bicycle_repair','boatbuilder','shipwright','blacksmith','carpenter',
  'electrician','plumber','painter','roofer','photographer',
]);

// ── OSM classifier ────────────────────────────────────────────────────────────
// Returns { accept: bool, reason: string }
// Called once per OSM element, per category.

function classifyOSM(tags, cat) {
  const shop    = tags.shop    || '';
  const craft   = tags.craft   || '';
  const amenity = tags.amenity || '';
  const service = Object.keys(tags).filter(k => k.startsWith('service:vehicle:'));

  // Hard exclusions — check before anything else
  if (OSM_NEVER_AUTO.has(shop))    return { accept: false, reason: `osm:shop=${shop} excluded` };
  if (OSM_NEVER_AUTO.has(amenity)) return { accept: false, reason: `osm:amenity=${amenity} excluded` };
  if (craft && OSM_NEVER_AUTO.has(craft)) return { accept: false, reason: `osm:craft=${craft} excluded` };

  // Shared patterns
  const hasRepair = shop==='car_repair' || craft==='car_repair' || craft==='mechanic'
    || craft==='auto_electrician' || craft==='automotive' || amenity==='car_repair'
    || tags['service:vehicle:repair']==='yes' || tags['service:vehicle:motor_vehicle']==='yes'
    || shop==='vehicle' || shop==='workshop' || craft==='vehicle_repair';

  const hasMotoRepair = shop==='motorcycle_repair' || craft==='motorcycle_repair'
    || craft==='motorcycle_service' || tags['service:vehicle:motorcycle']==='yes';

  const hasTyreService = shop==='tyres' || shop==='tires' || shop==='vulcanizer'
    || craft==='tyre_fitting' || craft==='tire_fitting'
    || tags['service:vehicle:tyres']==='yes' || tags['service:vehicle:tires']==='yes'
    || tags['service:vehicle:tyre_repair']==='yes' || tags['service:vehicle:wheels']==='yes'
    || tags['service:tyres']==='yes';

  const hasParts = shop==='car_parts' || shop==='auto_parts' || shop==='automotive'
    || shop==='motorcycle_parts' || shop==='vehicle_parts'
    || tags['service:vehicle:parts']==='yes';

  if (cat === 'garage') {
    // Tyres-only shops are not garages
    if ((shop==='tyres'||shop==='tires'||shop==='vulcanizer') && !hasRepair && !hasMotoRepair)
      return { accept: false, reason: 'osm:tyres-only, no repair tag' };
    // Parts-only shops are not garages
    if (hasParts && !hasRepair && !hasMotoRepair)
      return { accept: false, reason: 'osm:parts-only, no repair tag' };
    if (hasRepair || hasMotoRepair)
      return { accept: true, reason: `osm:${shop||craft||amenity}` };
    return { accept: false, reason: 'osm:no repair tag for garage' };
  }

  if (cat === 'parts') {
    // Repair-only workshops are not parts stores
    if ((hasRepair || hasMotoRepair) && !hasParts)
      return { accept: false, reason: 'osm:repair-only, no parts tag' };
    if (hasParts)
      return { accept: true, reason: `osm:${shop}` };
    return { accept: false, reason: 'osm:no parts tag' };
  }

  if (cat === 'tyres') {
    // General repair workshop without confirmed tyre service is not a tyre shop
    if ((hasRepair || hasMotoRepair) && !hasTyreService)
      return { accept: false, reason: 'osm:repair-only, no tyre service tag' };
    if (hasTyreService)
      return { accept: true, reason: `osm:tyre service confirmed` };
    return { accept: false, reason: 'osm:no tyre tag' };
  }

  return { accept: true, reason: 'osm:non-classified category' };
}

// ── Google classifier ─────────────────────────────────────────────────────────
// place: raw Google Places result object (has .primaryType and .types[])
// Returns { accept: bool, reason: string }

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
    'car_dealer',
    'car_repair',
    'auto_parts_store',
    'store',
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
    'bicycle_store','bicycle_repair_shop',
    'transit_station','bus_station','electric_vehicle_charging_station',
    'beauty_salon','hair_care','restaurant','cafe','bar',
    'real_estate_agency','general_contractor',
    // car_repair and auto_parts_store are NOT denied:
    // Google uses these types for legitimate motorcycle repair/parts shops.
    // The MOTO_NAME_RE keyword check distinguishes moto from car businesses.
  ]),
};

// IT: electronics_store is in the allowlist but too broad —
// only accept when the name suggests repair/IT focus
const IT_REPAIR_RE = /repair|fix|service|it |computer|laptop|pc |phone|mobile|tablet|τεχνικ|επισκευ|servis|reparatur|informatik|riparaz|répar/i;

const TYRE_NAME_RE = /vulcan|βουλκαν|vullkan|tyre|tire|guma|gumi|ελαστ|reife|pneu|gomm|gumiabr|llantas|neumát|lastik|pneus|タイヤ|타이어|轮胎|إطار|إطارات|टायर/i;

// Motorcycle keyword RE — matches name signals indicating a moto business.
// Used because Google has no dedicated motorcycle_repair/parts primaryType;
// real moto shops appear as car_repair, auto_parts_store, store, or null.
// Word-boundary anchored to avoid matching 'automotive', 'tomato', etc.
const MOTO_NAME_RE = /(?<![a-zA-Z])moto|motorcycle|motorbike|motor\s*bike|\bscooter\b|\bmoped\b|\bmotocross\b|\benduro\b|\batv\b|\bquad\s*bike\b|\bmotorrad\b|\bmotorräder\b|\bzweirad\b|\bmotociclett|\bmotociclo\b|\bmotocyclett|\bmotocicleta\b|\bmotosiklet\b|\bmotorsiklet\bμοτο|μηχαν|μοτοσυκλ|σκούτερ|мото|мотор|мотоцикл|скутер|バイク|オートバイ|오토바이|摩托车|摩托|دراجة\s*نارية/i;

function classifyGoogle(place, cat) {
  const primary = place.primaryType || '';
  const types   = Array.isArray(place.types) ? place.types : [];
  const allT    = new Set([primary, ...types]);
  const name    = (place.displayName?.text || '').toLowerCase();

  const allow   = CAT_ALLOW[cat];
  const deny    = CAT_DENY[cat];

  // 0a. Moto early-exit: keyword + no denied type → accept before CAT_ALLOW
  if (cat === 'moto' && MOTO_NAME_RE.test(name)) {
    // Still run deny check
    if (deny) { for (const t of allT) { if (deny.has(t)) return { accept: false, reason: `deny:${t}` }; } }
    return { accept: true, reason: `moto:keyword_early(primary=${primary||'null'})` };
  }

  // 0b. Tyres early-exit: keyword + no denied type → accept before CAT_ALLOW
  if (cat === 'tyres' && TYRE_NAME_RE.test(name)) {
    if (deny) { for (const t of allT) { if (deny.has(t)) return { accept: false, reason: `deny:${t}` }; } }
    return { accept: true, reason: `tyre:keyword_early(primary=${primary||'null'})` };
  }

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
    // motorcycle_dealer is unambiguous — accept directly
    if (allT.has('motorcycle_dealer')) return { accept: true, reason: 'moto:motorcycle_dealer' };
    // For ambiguous types (car_repair, auto_parts_store, store, null),
    // require a motorcycle keyword in the name to distinguish from car/generic businesses.
    // This is necessary because Google uses the same types for car and moto businesses.
    if (MOTO_NAME_RE.test(name)) return { accept: true, reason: `moto:keyword(primary=${primary||'null'})` };
    return { accept: false, reason: `moto:no_moto_keyword(primary=${primary||'null'})` };
  }

  if (cat === 'hardware') {
    return { accept: true, reason: `hardware:${primary}` };
  }

  if (cat === 'vet') {
    return { accept: true, reason: 'vet:veterinary_care' };
  }

  return { accept: true, reason: 'other' };
}





// Alias for use within this module
const classifyGooglePlace = classifyGoogle;

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
    id:          `google_${place.id}`,
    placeId:     place.id || null,      // kept for place_id dedup
    source:      'google',
    name,
    lat:         plat,
    lng:         plng,
    dist:        Math.round(haversine(latN, lngN, plat, plng) * 1000) / 1000,
    addr:        place.formattedAddress || '',
    phone:       place.nationalPhoneNumber || '',
    website:     place.websiteUri || '',
    opening:     place.regularOpeningHours?.weekdayDescriptions?.slice(0, 2).join('; ') || '',
    rating:      place.rating || null,
    mapsUrl:     place.googleMapsUri || '',
    primaryType: place.primaryType || null,   // preserved for final gate
    types:       place.types || [],           // preserved for final gate
  };
}

// Main entry: fetch Places results for a category around lat/lng
// cityHint = nearest town name from reverse geocoding (optional, improves relevance)
async function fetchPlacesForCategory(cat, latN, lngN, radiusM = 30000, cityHint = '', countryCode = '', rid = '--------') {
  if (!GOOGLE_KEY) {
    return { configured: false, results: [] };
  }

  // Use buildCountryQueries for ALL categories that need text search
  // (garage/parts/tyres always; petrol/it/moto/hardware/vet also benefit from
  //  localized queries and proper English fallback terms)
  const queries = buildCountryQueries(cat, cityHint, countryCode);
  const nearConf = NEARBY_CATS[cat];
  const allPlaces = [];
  const errors    = [];

  // Run Nearby Search + all Text Searches in parallel
  const tasks = [];

  if (nearConf) {
    tasks.push(
      searchNearby(latN, lngN, radiusM, nearConf.types)
        .then(d => {
          (d.places||[]).forEach(p => { p._sourceQuery = `nearby:${nearConf.types.join(',')}`; });
          allPlaces.push(...(d.places||[]));
        })
        .catch(e => { errors.push(`nearby:${e.message}`); console.warn(`[places] rid=${rid} cat=${cat} nearby_error:${e.message}`); })
    );
  }

  // Run text queries sequentially to avoid hammering the API simultaneously
  // (we await them as a group but they're separate requests)
  for (const q of queries) {
    const qT0 = Date.now();
    tasks.push(
      searchText(latN, lngN, radiusM, q)
        .then(d => {
          const places = d.places || [];
          const names  = places.map(p => p.displayName?.text || '').join(', ');
          const ids    = places.map(p => p.id || '').join(', ');
          const qMs = Date.now() - qT0;
          console.log(`[places] rid=${rid} cat=${cat} query="${q}" returned=${places.length} ms=${qMs}${places.length>0?' names=['+names+']':''}`);
          // Tag each place with the query that produced it (for diagnostics)
          places.forEach(p => { p._sourceQuery = q; });
          allPlaces.push(...places);
        })
        .catch(e => { errors.push(`text:${e.message}`); console.warn(`[places] rid=${rid} cat=${cat} text_error query="${q}": ${e.message}`); })
    );
  }

  await Promise.all(tasks);

  // Normalize, filter scrap, enforce 30km hard cap, dedup by name, sort by dist
  // Dedup by Google place_id first (fastest, most reliable)
  const placeIdSeen = new Set();
  const deduped_by_id = allPlaces.filter(p => {
    const pid = p.id || p.placeId;
    if (!pid || placeIdSeen.has(pid)) return false;
    placeIdSeen.add(pid);
    return true;
  });
  if (deduped_by_id.length < allPlaces.length) {
    console.log(`[places] rid=${rid} cat=${cat} dedup_by_id: ${allPlaces.length} → ${deduped_by_id.length}`);
  }
  const allPlacesDeduped = deduped_by_id;

  const beforeFilter = allPlacesDeduped.length;
  const seen = new Set();

  // ── Diagnostic: log ALL candidates for parts/tyres/petrol ─────────────────
  const DIAG_CATS = new Set(['parts','tyres','petrol','garage']);
  if (DIAG_CATS.has(cat)) {
    console.log(`[places] rid=${rid} cat=${cat} raw_count=${allPlacesDeduped.length}`);
    allPlacesDeduped.forEach((raw, i) => {
      const nm  = raw.displayName?.text || '(no name)';
      const pt  = raw.primaryType || 'null';
      const tps = (raw.types||[]).join(',') || 'none';
      const sq  = raw._sourceQuery || '(unknown)';
      console.log(`[places] rid=${rid} cat=${cat} raw#${i} query="${sq}" name="${nm}" pt=${pt} types=[${tps}]`);
    });
  }
  // Unconditional TRACE: log every raw candidate's type metadata so we can
  // see exactly what Google returned and whether classification fires on it.
  const TRACE_NAMES = ['ποδηλατα','helmetsgr','helmet','bicycle','bike'];
  if (['garage','parts','tyres','petrol','it','moto'].includes(cat)) {
    allPlacesDeduped.forEach((raw, _ti) => {
      const nm  = raw.displayName?.text || '(no name)';
      const pt  = raw.primaryType || 'null';
      const tps = (raw.types||[]).join(',') || 'none';
      const sq  = raw._sourceQuery || '?';
      const isSuspect = TRACE_NAMES.some(t => nm.toLowerCase().includes(t));
      // Always log suspect names; log others at condensed level
      if (isSuspect) {
        console.log(`[TRACE] rid=${rid} cat=${cat} FOUND_IN_RAW name="${nm}" pt=${pt} types=[${tps}] query="${sq}"`);
      }
    });
    console.log(`[TRACE] rid=${rid} cat=${cat} raw_total=${allPlacesDeduped.length} names=[${allPlacesDeduped.slice(0,5).map(r=>r.displayName?.text||'?').join(',')}]`);
  }

  let diagAccepted = 0, diagRejected = 0;
  const results = allPlacesDeduped
    .map(p => normalizePlaceResult(p, latN, lngN))
    .filter(p => {
      if (!p) return false;
      if (isScrap(p.name, [], cat)) return false;
      // Structured Google classifier — applied at Places level for early rejection
      if (['garage','parts','tyres','petrol','it','moto','hardware','vet'].includes(cat)) {
        const raw = allPlacesDeduped.find(r => (r.displayName?.text||'')=== p.name);
        if (raw) {
          const cls = classifyGooglePlace(raw, cat);
          if (DIAG_CATS.has(cat)) {
            const q = raw._sourceQuery || '(unknown query)';
            const pt = raw.primaryType || 'null';
            const tps = (raw.types||[]).join(',') || 'none';
            const dist = p.dist != null ? p.dist+'km' : '?';
            console.log(`[places] rid=${rid} cat=${cat} classify name="${p.name}" pt=${pt} types=[${tps}] dist=${dist} → ${cls.accept?'ACCEPT':'REJECT'} reason=${cls.reason}`);
          }
          // Trace: log EVERY classify decision for classified categories (needed to diagnose moto/tyres/etc)
          if (['garage','parts','tyres','petrol','it','moto','hardware','vet'].includes(cat)) {
            console.log(`[TRACE] rid=${rid} cat=${cat} CLASSIFY name="${p.name}" pt=${raw.primaryType||'null'} types=[${(raw.types||[]).join(',')}] → ${cls.accept?'ACCEPT':'REJECT'} reason=${cls.reason}`);
          }
          if (!cls.accept) {
            diagRejected++;
            return false;
          } else diagAccepted++;
        } else if (DIAG_CATS.has(cat)) {
          if (TRACE_NAMES.some(t => p.name.toLowerCase().includes(t))) {
            console.log(`[TRACE] rid=${rid} cat=${cat} RAW_LOOKUP_MISS name="${p.name}" — classification SKIPPED, result passes`);
          }
        }
      }
      if (p.dist > MAX_DIST_KM) {
        console.log(`[places] rid=${rid} cat=${cat} dist_REJECT name="${p.name}" dist=${p.dist}km`);
        return false;
      }
      const key = p.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 20);


  // Targeted trace: did any suspected false positive survive the filter?
  if (['garage','parts','tyres','petrol','it','moto'].includes(cat)) {
    console.log(`[TRACE] rid=${rid} cat=${cat} filtered_count=${results.length} names=[${results.slice(0,5).map(r=>r.name).join(',')}]`);
    results.forEach(r => {
      if (TRACE_NAMES.some(t => r.name.toLowerCase().includes(t))) {
        console.log(`[TRACE] rid=${rid} cat=${cat} SURVIVED_FILTER name="${r.name}" pt=${r.primaryType||'null'} — UNEXPECTED IN RESULTS`);
      }
    });
  }

  const removedOver30 = allPlaces.filter(p => {
    const loc = p.location || {};
    return haversine(latN, lngN, loc.latitude || 0, loc.longitude || 0) > MAX_DIST_KM;
  }).length;

  const nearest5 = results.slice(0, 5).map(r => `${r.name}(${r.dist}km)`).join(', ');
  console.log(`[places] rid=${rid} cat=${cat} DONE raw_before_filter=${beforeFilter} filtered_count=${results.length} nearest=[${nearest5}]${errors.length ? ' errors='+errors.join(',') : ''}`);

  return { configured: true, results, partialErrors: errors.length ? errors : undefined };
}

module.exports = { fetchPlacesForCategory, isScrap, GOOGLE_KEY };
