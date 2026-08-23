// api/diagnose.js — v11 — server-side JWT auth + entitlement check
// DEPLOY_VERSION logged synchronously before ANY async code

const DEPLOY_VERSION = 'diagnose-v11-server-auth';

// ── In-memory rate limit (secondary abuse control — NOT primary entitlement) ──
const RL = new Map();
const RL_MAX = 10;   // 10 calls per hour per IP
const RL_WIN = 3600;

function checkRateLimit(ip) {
  const now   = Math.floor(Date.now() / 1000);
  const entry = RL.get(ip) || { count: 0, reset: now + RL_WIN };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + RL_WIN; }
  entry.count++;
  RL.set(ip, entry);
  return { ok: entry.count <= RL_MAX, remaining: Math.max(0, RL_MAX - entry.count) };
}

// ── Supabase config ─────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Server-side JWT verification + entitlement ──────────────────────────────
// Returns { userId, isPro, canDiagnose } or { error, status }
// Does NOT consume the free slot — that happens only after a successful AI call.
async function verifyAndCheckEntitlement(authHeader) {
  // 1. Extract token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'missing_auth', status: 401,
             message: 'Authorization: Bearer <token> is required.' };
  }
  const token = authHeader.slice(7);

  // 2. Supabase config check
  if (!SUPABASE_URL || !SUPABASE_SVC) {
    console.error('[diagnose] VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return { error: 'server_misconfigured', status: 503,
             message: 'Server auth is not configured.' };
  }

  // 3. Verify JWT — get the real user from Supabase
  let userId, userEmail;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const adminSb = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });
    const { data, error } = await adminSb.auth.getUser(token);
    if (error || !data?.user) {
      console.warn('[diagnose] JWT verification failed:', error?.message || 'no user');
      return { error: 'unauthorized', status: 401,
               message: 'Invalid or expired session. Please sign in again.' };
    }
    userId    = data.user.id;
    userEmail = data.user.email;
  } catch (err) {
    console.error('[diagnose] JWT verification threw:', err.message);
    return { error: 'auth_error', status: 500, message: 'Auth verification failed.' };
  }

  // 4. Load profile + usage with service role (bypasses RLS — safe because we
  //    already verified the JWT above and have the correct userId)
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const adminSb = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });

    const { data: profile, error: pErr } = await adminSb
      .from('profiles')
      .select('is_pro, plan')
      .eq('id', userId)
      .single();

    if (pErr && pErr.code !== 'PGRST116') {
      console.error('[diagnose] profile lookup error:', pErr.message);
      return { error: 'db_error', status: 500, message: 'Profile lookup failed.' };
    }

    const isPro = profile?.is_pro === true;
    console.log(`[diagnose] auth ok userId=${userId} isPro=${isPro} plan=${profile?.plan ?? 'null'}`);

    if (isPro) {
      return { userId, userEmail, isPro: true, canDiagnose: true };
    }

    // Free user — check usage
    const { data: usage, error: uErr } = await adminSb
      .from('usage')
      .select('diagnosis_count, free_limit')
      .eq('user_id', userId)
      .single();

    if (uErr && uErr.code !== 'PGRST116') {
      console.error('[diagnose] usage lookup error:', uErr.message);
      return { error: 'db_error', status: 500, message: 'Usage lookup failed.' };
    }

    const count = usage?.diagnosis_count ?? 0;
    const limit = usage?.free_limit      ?? 1;
    const canDiagnose = count < limit;
    console.log(`[diagnose] free user: count=${count} limit=${limit} canDiagnose=${canDiagnose}`);

    if (!canDiagnose) {
      return { error: 'free_limit_reached', status: 403,
               message: 'Free diagnosis limit reached. Upgrade to Pro for unlimited diagnoses.' };
    }

    return { userId, userEmail, isPro: false, canDiagnose: true, freeCount: count, freeLimit: limit };

  } catch (err) {
    console.error('[diagnose] entitlement check threw:', err.message);
    return { error: 'entitlement_error', status: 500, message: 'Entitlement check failed.' };
  }
}

// ── Consume the free slot AFTER successful AI response ───────────────────────
// Called only once per successful diagnosis for free users.
// Uses service role so it bypasses RLS — the userId was already verified above.
// This is the "commit" step of the reservation pattern:
//   1. verifyAndCheckEntitlement — read-only check (no DB write)
//   2. AI call runs
//   3. consumeFreeSlot — atomic increment only on success
// consumeFreeSlot — atomically increments the usage counter.
// Returns one of three outcomes so the caller can act correctly:
//   'consumed'      — slot taken, response should be delivered
//   'already_taken' — concurrent request already consumed the slot (race); block this response
//   'error'         — DB error; caller decides (currently: allow, log)
async function consumeFreeSlot(userId) {
  if (!SUPABASE_URL || !SUPABASE_SVC) {
    console.error('[diagnose] consumeFreeSlot: missing env — cannot verify slot');
    return 'error';
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const adminSb = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });

    const { data, error } = await adminSb.rpc('admin_consume_diagnosis', { p_user_id: userId });
    if (error) {
      console.error('[diagnose] consumeFreeSlot RPC error:', error.message);
      return 'error';
    }

    // data is the jsonb returned by the function:
    //   { consumed: true,  new_count: 1 }                    → slot taken by this request
    //   { consumed: false, already_at_limit: true, count: 1 } → another concurrent request won
    //   { consumed: false, is_pro: true }                     → user upgraded between check and commit
    if (data?.consumed === true) {
      console.log(`[diagnose] ✅ free slot consumed userId=${userId} new_count=${data.new_count}`);
      return 'consumed';
    }
    if (data?.already_at_limit) {
      console.warn(`[diagnose] RACE DETECTED: slot already taken for userId=${userId} count=${data.count} — blocking duplicate response`);
      return 'already_taken';
    }
    if (data?.is_pro) {
      // User upgraded between the entitlement check and the commit — treat as Pro, allow
      console.log(`[diagnose] user upgraded mid-request userId=${userId} — slot not consumed (Pro)`);
      return 'consumed'; // allow the response; they are now Pro
    }
    console.warn('[diagnose] consumeFreeSlot unexpected RPC result:', JSON.stringify(data));
    return 'error';
  } catch (err) {
    console.error('[diagnose] consumeFreeSlot threw:', err.message);
    return 'error';
  }
}

// ── MIME detection ────────────────────────────────────────────────────────────
function detectMime(b64) {
  if (!b64) return null;
  if (b64.startsWith('/9j/'))   return 'image/jpeg';
  if (b64.startsWith('iVBOR'))  return 'image/png';
  if (b64.startsWith('UklGR'))  return 'image/webp';
  if (b64.startsWith('R0lGO'))  return 'image/gif';
  return null;
}

function getGlobalDisclaimer(lang) {
  const l = (lang || '').toLowerCase();
  if (l.includes('german') || l.includes('deutsch')) {
    return 'FixIt bietet nur allgemeine Hinweise. Bei Gas-, Elektro- und tragenden Arbeiten immer einen Fachbetrieb kontaktieren.';
  }
  return 'FixIt provides guidance only. For gas, electrical, and structural work, always use a licensed professional.';
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data',  chunk => { d += chunk.toString('utf8'); });
    req.on('end',   () => resolve(d));
    req.on('error', reject);
  });
}

// ── Vehicle context extraction ────────────────────────────────────────────────
function extractVehicleFromText(text) {
  if (!text) return null;
  const t = text.toUpperCase();
  const MAKES = {
    VW:['VW','VOLKSWAGEN','VOLKS WAGEN'],BMW:['BMW'],MERCEDES:['MERCEDES','MERCEDES-BENZ','MERCEDES BENZ','MERC','MB'],
    AUDI:['AUDI'],FORD:['FORD'],OPEL:['OPEL','VAUXHALL'],RENAULT:['RENAULT','DACIA'],PEUGEOT:['PEUGEOT'],
    CITROEN:['CITROËN','CITROEN'],FIAT:['FIAT'],TOYOTA:['TOYOTA'],HONDA:['HONDA'],SKODA:['SKODA','ŠKODA'],
    SEAT:['SEAT'],HYUNDAI:['HYUNDAI'],KIA:['KIA'],MAZDA:['MAZDA'],NISSAN:['NISSAN'],VOLVO:['VOLVO'],
    SUBARU:['SUBARU'],SUZUKI:['SUZUKI'],MITSUBISHI:['MITSUBISHI'],
  };
  let make = null;
  for (const [key, aliases] of Object.entries(MAKES)) {
    if (aliases.some(a => t.includes(a))) { make = key; break; }
  }
  if (!make) return null;
  const MODEL_PATTERNS = {
    VW:[/GOLF\s*([1-9]|I{1,3}V?|PLUS|GTI|R|VARIANT|ALLTRACK)?/,/PASSAT\s*(B[3-9]|CC)?/,/POLO\s*([1-9])?/,/TIGUAN\s*([12])?/,/TOUAREG/,/T-ROC/,/CADDY/,/TRANSPORTER\s*(T[4-7])?/,/SHARAN/,/PHAETON/,/ARTEON/,/ID\.?[3-9]/],
    BMW:[/([1-9])ER\s*(?:SERIE)?/,/X([1-9])/,/([1-9][0-9]{2}[IDMS]?)\s*(?:E|F|G|I)\d{1,2}/,/M([2-9])/,/([3-9]20|[1-9][0-9]{2})[IDS]/],
    MERCEDES:[/\b([ABCEGLS])(?:-?(?:KLASSE|CLASS)|\d{2,3}(?:[A-Z](?:DI?|Si?)?)?)/,/GLC|GLE|GLA|GLB|CLA|CLK|SLK|AMG/,/SPRINTER/,/VITO/],
    AUDI:[/A([1-9])/,/Q([1-9])/,/TT/,/R8/,/E-TRON/,/RS\s*[1-9]/,/S[1-9]/,/([A-Z][1-9])\s*(?:B[4-9]|C[5-9])?/],
    FORD:[/FIESTA/,/FOCUS/,/MONDEO/,/PUMA/,/KUGA/,/MUSTANG/,/TRANSIT/,/RANGER/,/GALAXY/,/S-MAX/,/C-MAX/],
    OPEL:[/ASTRA\s*([A-J])?/,/CORSA\s*([A-F])?/,/INSIGNIA\s*([AB])?/,/MOKKA/,/ZAFIRA/,/VECTRA/,/MERIVA/],
    TOYOTA:[/COROLLA/,/YARIS/,/AURIS/,/RAV4/,/PRIUS/,/AYGO/,/C-HR/,/HILUX/,/LAND CRUISER/,/CAMRY/],
    HONDA:[/CIVIC/,/JAZZ/,/CR-V/,/HR-V/,/ACCORD/],
    SKODA:[/OCTAVIA\s*([123])?/,/FABIA/,/SUPERB/,/KAROQ/,/KODIAQ/,/SCALA/],
    SEAT:[/IBIZA/,/LEON/,/ARONA/,/ATECA/,/TARRACO/,/TOLEDO/],
    RENAULT:[/CLIO/,/MEGANE/,/LAGUNA/,/SCENIC/,/CAPTUR/,/KADJAR/,/KOLEOS/,/ZOE/,/KANGOO/],
    PEUGEOT:[/[0-9]{3}[0-9]?/,/PARTNER/,/EXPERT/,/BOXER/],
    CITROEN:[/C[1-9]/,/BERLINGO/,/JUMPY/,/DS[1-9]/],
    HYUNDAI:[/I[1-9]0/,/TUCSON/,/SANTA FE/,/IONIQ/,/KONA/,/I20|I30|I40/],
    KIA:[/RIO/,/CEE'?D/,/SPORTAGE/,/SORENTO/,/STINGER/,/PICANTO/,/NIRO/],
    FIAT:[/SEICENTO/,/PUNTO/,/BRAVO/,/BRAVA/,/STILO/,/TIPO/,/500(?!\d)/,/PANDA/,/DOBLO/,/DUCATO/,/CROMA/,/GRANDE PUNTO/,/FIORINO/,/QUBO/,/SPIDER/],
    SUZUKI:[/SWIFT/,/VITARA/,/JIMNY/,/BALENO/,/SX4/,/ALTO/],
    NISSAN:[/QASHQAI/,/JUKE/,/MICRA/,/NOTE/,/LEAF/,/X-TRAIL/,/NAVARA/,/PRIMERA/],
    MAZDA:[/CX-[0-9]/,/([2-9])(?=\s|$)/,/MX-[0-9]/,/[36](?=\s|$)/],
    VOLVO:[/V[0-9]{2}/,/S[0-9]{2}/,/XC[0-9]{2}/,/C[0-9]{2}/],
    SUBARU:[/IMPREZA/,/FORESTER/,/OUTBACK/,/LEGACY/,/XV/,/WRX/],
    MITSUBISHI:[/OUTLANDER/,/ASX/,/PAJERO/,/CARISMA/,/GALANT/,/LANCER/,/ECLIPSE/],
  };
  let model = null;
  if (MODEL_PATTERNS[make]) {
    for (const pat of MODEL_PATTERNS[make]) {
      const m = t.match(pat);
      if (m) { model = m[0].trim().replace(/\s+/g,' '); break; }
    }
  }
  const genMatch = text.match(/\b(Mk\.?\s*[1-9]|[ABCDEFG][0-9]{1,2}|[EFG]\d{2}|B[5-9]|W\d{3})\b/i);
  const generation = genMatch ? genMatch[1].toUpperCase() : null;
  const engMatch = text.match(/\b(\d\.\d\s*(?:TDI|TSI|TFSI|GTI|CDI|HDi|dCi|TDCi|CDTI|CRDi|EcoBoost|BlueHDi|Turbo)|[0-9]{2,3}\s*(?:TDI|TSI|TFSI|CDI|HDi|dCi|d)|[1-9][0-9]{2}d)\b/i);
  const engine = engMatch ? engMatch[1].replace(/\s+/g,' ').trim().toUpperCase() : null;
  const yearMatch = text.match(/\b(19[7-9]\d|20[0-2]\d)\b/);
  const year = yearMatch ? yearMatch[1] : null;
  if (!model && !engine && !generation) return null;
  return { make, model, generation, engine, year };
}

function detectPartType(probText) {
  const t = (probText || '').toLowerCase();
  if (/batter|batterie|akku|accumul|12v|springt nicht an|démarre pas|no arranca|doesn.?t start|won.?t start|dead battery|batteria/.test(t)) return 'battery';
  if (/bremse|brake|brems|frein|freio|freno|schleif|grind|squeal|quietsch|pad|scheib|disc|rotor/.test(t)) return 'brakes';
  if (/zündkerz|spark plug|bougie|bujía|candela|misfire|zündu|fehlzündung/.test(t)) return 'sparkplugs';
  if (/ölfilter|oil filter|filtre huile|filtro aceite|filtro olio|ölwechsel|oil change/.test(t)) return 'oilfilter';
  if (/scheibenwischer|wiper|essuie-glace|limpiaparabrisas|tergicristallo|wisch/.test(t)) return 'wipers';
  if (/kupplung|clutch|embrayage|embrague|frizione|slip|durchdreh|rutscht/.test(t)) return 'clutch';
  if (/luftfilter|air filter|filtre air|filtro aire|filtro aria/.test(t)) return 'airfilter';
  if (/glühkerz|glow plug|bougie prechauffage|calentador|candeletta/.test(t)) return 'glowplugs';
  if (/stoßdämpfer|shock absorber|amortisseur|amortiguador|ammortizzatore|feather|feder/.test(t)) return 'shocks';
  if (/riemen|belt|courroie|correa|cinghia|timing|zahnriemen/.test(t)) return 'belt';
  return null;
}

function isDiesel(engine) {
  if (!engine) return null;
  return /TDI|CDI|HDi|dCi|TDCi|CDTI|CRDi|BlueHDi|CDTI|diesel|dsel|\bd\b/i.test(engine);
}
function isLargeSUVorExecutive(make,model){if(!model)return false;const m=model.toUpperCase();return /X[3-7]|GLC|GLE|GLS|Q[5-8]|A[6-8]|TOUAREG|TIGUAN|PHAETON|PASSAT|MONDEO|INSIGNIA|SUPERB|OCTAVIA.*[23]|KODIAQ|KAROQ|TUCSON|SANTA|KUGA|GALAXY|S-MAX|TRANSIT|TRANSPORTER|T[5-7]|SPRINTER|VITO|RAV4|LAND CRUISER|DISCOVERY|RANGE ROVER/.test(m);}
function isCompact(make,model){if(!model)return false;const m=model.toUpperCase();return /POLO|FIESTA|CORSA|CLIO|YARIS|AYGO|MICRA|PICANTO|RIO|FABIA|IBIZA|UP|TWINGO|C1|107|108|208/.test(m);}
function isMidSize(make,model){if(!model)return false;const m=model.toUpperCase();return /GOLF|FOCUS|ASTRA|MEGANE|LEON|OCTAVIA|C-CLASS|A4|A3|3ER|3[0-9]{2}[DI]|C[12][0-9]{2}|CIVIC|COROLLA|AURIS/.test(m);}
function hasStartStop(engine,year){const y=parseInt(year||'0');if(y>=2012)return true;if(y>=2010&&/TDI|TSI|CDI|HDi/i.test(engine||''))return true;if(!year&&/TDI|TSI|TFSI|CDI|HDi|dCi|BlueHDi|EcoBoost/i.test(engine||''))return true;return false;}
function vehicleBatteryAh(make,model,engine,year){const large=isLargeSUVorExecutive(make,model);const small=isCompact(make,model);const mid=isMidSize(make,model);const diesel=isDiesel(engine);if(large&&diesel)return'95Ah';if(large)return'80Ah';if(small&&!diesel)return'60Ah';if(small)return'70Ah';if(mid&&diesel)return'70Ah';if(mid)return'60Ah';return diesel?'80Ah':'70Ah';}

function vehiclePartSuggestions(vehicleCtx, partType, rawProbText) {
  if (!vehicleCtx || !partType) return null;
  const { make, model, generation, engine, year } = vehicleCtx;
  const G = (generation || '').toUpperCase();
  const vShort = [model || make, G || ''].filter(Boolean).join(' ').trim().slice(0, 20);
  const vFull  = [make, model, G].filter(Boolean).join(' ').trim();
  if (partType === 'battery') {
    const rawUpper=( rawProbText||'').toUpperCase();const dieselInText=/CDI|TDI|HDi|DIESEL|DIESELMOTOR/i.test(rawUpper);
    const ah=vehicleBatteryAh(make,model,engine||(dieselInText?'CDI':null),year);const ss=hasStartStop(engine||(dieselInText?'CDI':null),year);
    if(ss){return[`${vShort} AGM Batterie ${ah}`,`Varta AGM ${ah} ${vShort}`,`Bosch AGM Start Stop ${ah} ${make}`,`Exide AGM ${ah} ${vShort}`];}
    else{return[`${vShort} Batterie ${ah}`,`Varta Silver Dynamic ${ah} ${make}`,`Bosch S4 ${ah} ${make}`,`Banner Running Bull ${ah} ${vShort}`];}
  }
  if (partType === 'brakes') return [`${vShort} Bremsbeläge vorne`,`Brembo ${vShort} Bremsscheiben vorne`,`TRW ${vShort} Bremsbeläge`,`${vShort} Bremsscheibe ${G||model||make}`];
  if (partType === 'sparkplugs') { const diesel=isDiesel(engine); if(diesel){return[`${vShort} Glühkerzen`,`Bosch Glühkerze ${vShort}`,`NGK Glühkerze ${vShort}`,`Beru Glühkerze ${make} ${model||''}`];} return[`${vShort} Zündkerzen`,`NGK Zündkerze ${vShort}`,`Bosch Zündkerze ${vShort}`,`Champion Zündkerze ${vShort}`];}
  if (partType === 'oilfilter') return [`${vShort} Ölfilter`,`Mann Filter ${vShort}`,`Bosch Ölfilter ${vShort}`,`Mahle Ölfilter ${make} ${model||''}`];
  if (partType === 'wipers')    return [`${vShort} Scheibenwischer`,`Bosch Aerotwin ${vShort}`,`Valeo Wischer ${vShort}`,`${vShort} Wischblatt vorne`];
  if (partType === 'clutch')    return [`${vShort} Kupplungssatz`,`Sachs Kupplung ${vShort}`,`LuK Kupplungskit ${vShort}`,`Valeo Kupplung ${make} ${model||''}`];
  if (partType === 'airfilter') return [`${vShort} Luftfilter`,`Mann Filter Luft ${vShort}`,`Bosch Luftfilter ${vShort}`,`Mahle LX Luftfilter ${vShort}`];
  if (partType === 'glowplugs') return [`${vShort} Glühkerzen`,`Bosch Glühkerze ${vShort}`,`NGK Glühkerze ${vShort}`,`Beru Glühkerze ${vShort}`];
  if (partType === 'shocks')    return [`${vShort} Stoßdämpfer vorne`,`Bilstein ${vShort} Stoßdämpfer`,`Sachs Stoßdämpfer ${vShort}`,`KYB Excel-G ${make} ${model||''}`];
  if (partType === 'belt')      return [`${vShort} Zahnriemen Satz`,`Contitech ${vShort} Zahnriemenkit`,`Gates ${vShort} Zahnriemen`,`INA Steuerkettenkit ${vShort}`];
  return null;
}

async function callAnthropic(apiKey, content, attemptNum) {
  const TIMEOUT_MS = 55000;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.warn('[FixIt] ABORT_TRIGGERED attempt=%d timeout=%dms', attemptNum, TIMEOUT_MS);
    controller.abort();
  }, TIMEOUT_MS);
  const t0 = Date.now();
  console.log('[FixIt] → Anthropic START attempt=%d timeout=%ds', attemptNum, TIMEOUT_MS / 1000);
  try {
    const aRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1800, temperature: 0, messages: [{ role: 'user', content }] }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    console.log('[FixIt] ← Anthropic attempt=%d HTTP=%d dur=%dms', attemptNum, aRes.status, Date.now() - t0);
    return { ok: true, aRes };
  } catch (e) {
    clearTimeout(timer);
    const isAbort = e.name === 'AbortError';
    console.error('[FixIt] ANTHROPIC_FETCH_ERROR attempt=%d type=%s msg=%s dur=%dms', attemptNum, e.name, e.message, Date.now() - t0);
    return { ok: false, isAbort, error: e };
  }
}

module.exports = async function handler(req, res) {
  console.log('[FixIt] DEPLOY_VERSION =', DEPLOY_VERSION);

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-FixIt-Version', DEPLOY_VERSION);

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    return res.status(405).json({ error: 'method_not_allowed', version: DEPLOY_VERSION });

  // ── IP rate limit (secondary abuse control — NOT the primary entitlement gate)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const rlPeek = (() => {
    const now = Math.floor(Date.now() / 1000);
    const entry = RL.get(clientIp) || { count: 0, reset: now + RL_WIN };
    if (now > entry.reset) return { ok: true, remaining: RL_MAX };
    return { ok: entry.count < RL_MAX, remaining: Math.max(0, RL_MAX - entry.count) };
  })();
  res.setHeader('X-RateLimit-Remaining', rlPeek.remaining);
  if (!rlPeek.ok) {
    console.warn('[FixIt] RATE_LIMITED ip=%s', clientIp);
    return res.status(429).json({ error: 'rate_limited', message: 'Too many requests. Please wait before trying again.', version: DEPLOY_VERSION });
  }

  // ── Server-side JWT verification + entitlement check ─────────────────────
  // This is the PRIMARY gate. userId, isPro, and usage count are derived
  // server-side from the verified JWT — never trusted from the request body.
  const entitlement = await verifyAndCheckEntitlement(req.headers.authorization);
  if (entitlement.error) {
    console.warn('[diagnose] entitlement denied:', entitlement.error, entitlement.message);
    return res.status(entitlement.status).json({
      error:   entitlement.error,
      message: entitlement.message,
      version: DEPLOY_VERSION,
    });
  }
  const { userId, isPro } = entitlement;

  // ── Read body ─────────────────────────────────────────────────────────────
  let rawBody;
  try   { rawBody = await readBody(req); }
  catch (e) { return res.status(400).json({ error: 'read_body_failed', version: DEPLOY_VERSION }); }

  let body;
  try   { body = JSON.parse(rawBody); }
  catch (e) { return res.status(400).json({ error: 'invalid_json_body', version: DEPLOY_VERSION }); }

  // Only safe fields from body — userId, isPro, usageCount are NEVER read from body
  const { problem, photoB64, category, langName, countryName, countryCode, userProfile } = body;
  const cat   = String(category || 'home');
  const lang2 = String(langName || 'English');
  // Market language: the commerce/search language of the USER'S COUNTRY.
  // Used only for partsNeeded search terms — NOT for the UI text.
  // This ensures store URLs get German terms for a German user with a Macedonian UI.
  const CC_MARKET_LANG = {
    DE:'German',AT:'German',CH:'German',LU:'German',LI:'German',
    GB:'English',US:'English',AU:'English',CA:'English',NZ:'English',IE:'English',
    FR:'French',BE:'French',MC:'French',
    IT:'Italian',SM:'Italian',VA:'Italian',
    ES:'Spanish',MX:'Spanish',AR:'Spanish',CL:'Spanish',CO:'Spanish',
    PL:'Polish',HR:'Croatian',RS:'Serbian',TR:'Turkish',
    MK:'Macedonian',  // North Macedonia — users search in Macedonian
    SE:'Swedish',NO:'Norwegian',DK:'Danish',FI:'Finnish',
    NL:'Dutch',PT:'Portuguese',GR:'Greek',CZ:'Czech',SK:'Czech',
    HU:'Hungarian',RO:'Romanian',BG:'Bulgarian',
  };
  const cc2 = String(countryCode || '').toUpperCase().trim();
  const marketLangName = (cc2 && CC_MARKET_LANG[cc2]) ? CC_MARKET_LANG[cc2] : null;
  const prob  = String(problem  || '').trim().slice(0, 500);
  const hasText  = prob.length > 0;
  const hasImage = typeof photoB64 === 'string' && photoB64.length > 100;

  const vehicleCtx      = cat === 'car' ? extractVehicleFromText(prob) : null;
  const partType        = cat === 'car' ? detectPartType(prob) : null;
  const intelligentParts = vehicleCtx && partType ? vehiclePartSuggestions(vehicleCtx, partType, prob) : null;

  console.log('[FixIt] REQUEST userId=%s isPro=%s cat=%s lang=%s hasText=%s hasImage=%s prob=%s',
    userId, isPro, cat, lang2, hasText, hasImage, prob.slice(0, 60));

  if (!hasText && !hasImage) {
    return res.status(400).json({ error: 'no_input', version: DEPLOY_VERSION });
  }

  // ── API key ───────────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('[FixIt] STAGE_FAILED: apiKey missing');
    return res.status(500).json({ error: 'missing_api_key', version: DEPLOY_VERSION });
  }

  // ── Safety hard-stop ──────────────────────────────────────────────────────
  const probLower = prob.toLowerCase();
  const HARD_STOP_PATTERNS = [
    /gas (line|pipe|leak|appliance|boiler|furnace|heater|oven|stove|cooker)/i,
    /naturalgas|natural gas|gasleitung|gasrohr|gasherd|gasheizung|erdgas|flüssiggas|propangas/i,
    /live (wire|mains|current|cable|electrical)/i,
    /mains (electric|power|voltage|wiring|cable)/i,
    /230v|240v|400v|high.?voltage|hochspannung|netzspannung/i,
    /fuse.?box|breaker.?box|electrical.?panel|sicherungskasten|verteilerkasten/i,
    /load.?bearing|tragende (wand|mauer)|structural (wall|beam|column|joist)/i,
    /asbestos|asbest|lead.?pipe|bleiröhr|lead water|lead (pipe|plumbing|tube)|bleirohr|blei.?rohr|bleileitun/i,
  ];
  const isHardStop = HARD_STOP_PATTERNS.some(p => p.test(probLower));
  console.log('[FixIt] SAFETY hardStop=%s', isHardStop);

  // ── Build prompt ──────────────────────────────────────────────────────────
  const content = [];
  if (hasImage) {
    const mime = detectMime(photoB64);
    if (mime) content.push({ type: 'image', source: { type: 'base64', media_type: mime, data: photoB64 } });
    else console.warn('[FixIt] Image MIME unknown — text-only');
  }
  content.push({
    type: 'text',
    text: [
      `You are FixIt AI. Respond with ONE valid JSON object only — no markdown, no text outside the braces. First char: { Last char: }.`,
      `SAFETY RULES — these override everything else:`,
      `1. If the problem involves: GAS lines, gas appliances, gas leaks → set callPro:true, warningLevel:"danger", safetyWarning in ${lang2}: explain gas work requires a licensed gas engineer, provide NO repair steps (steps:[]), tools:[], partsNeeded:[].`,
      `2. If the problem involves: LIVE MAINS ELECTRICITY (230V/240V/400V), consumer unit, fuse box, electrical panel, fixed wiring → set callPro:true, warningLevel:"danger", safetyWarning in ${lang2}: explain mains electrical work requires a licensed electrician, provide NO steps, tools:[], partsNeeded:[].`,
      `3. If the problem involves: STRUCTURAL elements (load-bearing walls, roof beams, foundations) → set callPro:true, warningLevel:"danger".`,
      `4. If the problem involves: ASBESTOS or LEAD pipes → set callPro:true, warningLevel:"danger". Never provide DIY guidance.`,
      `Low-voltage (12V, batteries, USB, EV home charging) is SAFE to guide. Mains wiring is NOT.`,
      `Write ALL visible text in ${lang2}. Exception: imageQuery must be English keywords only (for image search).`,
      `Be specific and expert, but concise. Name the exact component and real tool names. Diagnosis max 2 short sentences. Max 4 causes. Max 4 steps. Each step description max 2 short sentences. Each tip max 1 short sentence. Avoid advanced technician-only explanations unless absolutely necessary. Keep JSON compact and valid.`,
      ...(intelligentParts ? [
        `DETECTED VEHICLE: ${[vehicleCtx.year, vehicleCtx.make, vehicleCtx.model, vehicleCtx.generation, vehicleCtx.engine].filter(Boolean).join(' ')}.`,
        `partsNeeded REQUIRED: You MUST use EXACTLY this pre-computed list as your partsNeeded array. Do not change it, do not add generic alternatives, do not modify the order: ${JSON.stringify(intelligentParts)}. These are vehicle-specific search suggestions generated from a fitment knowledge base. Copy them exactly into the partsNeeded field.`,
      ] : vehicleCtx ? [
        `DETECTED VEHICLE: ${[vehicleCtx.year, vehicleCtx.make, vehicleCtx.model, vehicleCtx.generation, vehicleCtx.engine].filter(Boolean).join(' ')}. Use this for vehicle-specific part search queries.`,
        `partsNeeded: 2–4 vehicle-specific buyable search terms. Write in ${lang2} (the UI/display language). Use concise buyable part names with brand where helpful (e.g. Bosch, NGK). No sentences. 2–5 words max.`,
      ] : [
        `partsNeeded: 2–4 SHORT buyable search terms, 2–5 words each. Write in ${lang2} (the UI/display language). Include brand names where helpful. No sentences.`,
      ]),
      `estimatedCost: realistic DIY parts cost only, in the currency of ${countryName}. Format: "€5–15". timeEstimate: realistic hands-on time.`,
      `Category: ${cat}. Problem: ${prob || 'analyse the image and diagnose the issue'}. IMPORTANT: set the JSON \"category\" field to exactly one of: home|car|motorcycle|tech|appliances|garden|bike|pets — choose based on what is shown/described, not the input language. For any automotive/vehicle part or repair: \"car\". For motorbike/scooter/moped: \"motorcycle\". For home appliances: \"appliances\". For electronic devices/computers/phones: \"tech\". For garden/outdoor power tools: \"garden\". For bicycles/e-bikes: \"bike\". For pet health: \"pets\". Default: \"home\".`,
      ...(userProfile ? [
        userProfile.vehicles?.length ? `User vehicles: ${userProfile.vehicles.map(v => [v.year, v.make, v.model, v.engine].filter(Boolean).join(' ')).join(', ')}` : '',
        userProfile.home            ? `Home: ${[userProfile.home.type, userProfile.home.age, userProfile.home.country || countryName].filter(Boolean).join(', ')}` : '',
        userProfile.appliances?.length ? `Appliances: ${userProfile.appliances.map(a => [a.brand, a.type, a.model].filter(Boolean).join(' ')).join(', ')}` : '',
      ].filter(Boolean) : []),
      isHardStop ? `NOTE: This matches a HARD STOP safety category. Set callPro:true and warningLevel:"danger" regardless.` : '',
      `Output ONLY the JSON object below, nothing else:`,
      `{"confidence":85,"status":"","difficulty":"","timeEstimate":"","estimatedCost":"","warningLevel":"low","diagnosis":"","causes":[],"safetyWarning":"","callPro":false,"proReason":"","steps":[{"title":"","description":"","imageQuery":"","emoji":"🔧","tip":""}],"tools":[],"partsNeeded":[],"proTip":"","proSearchQuery":"","category":"home"}`,
    ].filter(Boolean).join('\n'),
  });

  // ── Call Anthropic — up to 2 attempts ─────────────────────────────────────
  const t0 = Date.now();
  let rawText = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await callAnthropic(apiKey, content, attempt);
    if (!result.ok) {
      if (result.isAbort && attempt < 2) { console.warn('[FixIt] ABORT_RETRY attempt=%d → retrying', attempt); continue; }
      const errCode = result.isAbort ? 'timeout' : 'fetch_failed';
      console.error('[FixIt] FINAL_FETCH_FAILURE code=%s attempts=%d', errCode, attempt);
      // AI call failed — do NOT consume the free slot
      return res.status(500).json({ error: errCode, stage: 'anthropicFetch', debug: result.error.message, version: DEPLOY_VERSION });
    }
    const aRes = result.aRes;
    if (!aRes.ok) {
      let errText = '';
      try { errText = await aRes.text(); } catch (_) {}
      console.error('[FixIt] STAGE_FAILED: anthropicHTTP %d — %s', aRes.status, errText.slice(0, 200));
      // AI call failed — do NOT consume the free slot
      return res.status(500).json({ error: 'anthropic_http_error', status: aRes.status, debug: errText.slice(0, 200), version: DEPLOY_VERSION });
    }
    let envelope;
    try { envelope = await aRes.json(); } catch (e) { return res.status(500).json({ error: 'envelope_parse_failed', debug: e.message, version: DEPLOY_VERSION }); }
    if (envelope.error) {
      console.error('[FixIt] STAGE_FAILED: anthropicApiError —', envelope.error.message);
      return res.status(500).json({ error: 'anthropic_api_error', debug: envelope.error.message, version: DEPLOY_VERSION });
    }
    rawText = envelope?.content?.[0]?.text;
    const stopReason = envelope?.stop_reason;
    if (stopReason === 'max_tokens') console.error('[FixIt] TRUNCATED_BY_MAX_TOKENS len=%d', rawText?.length ?? 0);
    else console.log('[FixIt] stop_reason=%s len=%d', stopReason, rawText?.length ?? 0);
    if (typeof rawText !== 'string' || rawText.length === 0) {
      return res.status(500).json({ error: 'no_text', debug: JSON.stringify(envelope).slice(0, 300), version: DEPLOY_VERSION });
    }
    console.log('[FixIt] RAW_FIRST_500 (len=%d):', rawText.length, rawText.slice(0, 500));

    // ── Charge IP rate limit token only on real Anthropic success ───────────
    const rlResult = checkRateLimit(clientIp);
    res.setHeader('X-RateLimit-Remaining', rlResult.remaining);
    break;
  }

  // ── Parse JSON ────────────────────────────────────────────────────────────
  let s = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = s.indexOf('{'), last = s.lastIndexOf('}');
  function makeFallback(reason) {
    console.error('[FixIt] FALLBACK_JSON reason=%s', reason);
    const isDE = lang2.includes('Deutsch') || lang2.includes('German');
    return {
      confidence:50, status:isDE?'Analyse konnte nicht vollständig verarbeitet werden':'Analysis could not be fully processed',
      difficulty:'Unknown', timeEstimate:'', estimatedCost:'', warningLevel:'low',
      diagnosis:isDE?'Die Analyse konnte nicht korrekt verarbeitet werden. Bitte erneut versuchen.':'The analysis could not be processed correctly. Please try again.',
      causes:[], safetyWarning:'', callPro:false, proReason:'', steps:[], tools:[], partsNeeded:[], proTip:'', proSearchQuery:'',
      _fallback:true, _fallbackReason:reason,
    };
  }
  if (first === -1 || last === -1 || last <= first) {
    console.error('[FixIt] NO_BRACES_FALLBACK raw:%s', s.slice(0, 300));
    const fb = makeFallback('no_braces');
    if (intelligentParts) fb.partsNeeded = intelligentParts;
    fb._version = DEPLOY_VERSION;
    if (vehicleCtx) fb._vehicleCtx = vehicleCtx;
    // Fallback is effectively a failed diagnosis — do NOT consume the free slot
    return res.status(200).json(fb);
  }
  s = s.slice(first, last + 1);
  s = s.replace(/[\u201c\u201d\u201e\u201f]/g, '"').replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/,\s*([\]}])/g, '$1');
  let out = '', inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (esc)       { out += c; esc = false; continue; }
    if (c === '\\') { out += c; esc = true;  continue; }
    if (c === '"')  { inStr = !inStr; out += c; continue; }
    if (inStr && c === '\n') { out += '\\n'; continue; }
    if (inStr && c === '\r') { out += '\\r'; continue; }
    if (inStr && c === '\t') { out += '\\t'; continue; }
    out += c;
  }
  s = out;
  console.log('[FixIt] CLEANED_FIRST_500:', s.slice(0, 500));

  let parsed;
  const parseStarted = Date.now();
  try {
    parsed = JSON.parse(s);
    console.log('[FixIt] JSON_PARSE_SUCCESS attempt=1 dur=%dms', Date.now()-parseStarted);
  } catch (e1) {
    const posMatch = e1.message.match(/position (\d+)/);
    const pos = posMatch ? parseInt(posMatch[1]) : -1;
    console.error('[FixIt] JSON_PARSE_FAIL attempt=1 msg=%s pos=%d', e1.message, pos);
    let recovered = false;
    if (pos > 50) {
      try {
        const truncated = s.slice(0, pos).replace(/,\s*$/, '') + '}}';
        parsed = JSON.parse(truncated);
        console.warn('[FixIt] JSON_PARSE_RECOVERED attempt=2 pos=%d', pos);
        recovered = true;
      } catch (_) { console.warn('[FixIt] JSON_TRUNCATION_FAILED pos=%d', pos); }
    }
    if (!recovered) {
      console.warn('[FixIt] JSON_REPAIR_PASS_TRIGGERED rawLen=%d', rawText.length);
      try {
        const repairPayload = { model:'claude-sonnet-4-6', max_tokens:1800, temperature:0,
          messages:[{ role:'user', content:`The following text was supposed to be valid JSON but has a parse error at position ${pos}. Fix it and return ONLY the corrected valid JSON object, nothing else:\n\n${rawText.slice(0,3000)}` }] };
        const repairController = new AbortController();
        const repairTimer = setTimeout(() => repairController.abort(), 20000);
        const repairRes = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST', headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
          body:JSON.stringify(repairPayload), signal:repairController.signal,
        });
        clearTimeout(repairTimer);
        if (repairRes.ok) {
          const repairEnv = await repairRes.json();
          const repairText = repairEnv?.content?.[0]?.text || '';
          const rf = repairText.indexOf('{'), rl = repairText.lastIndexOf('}');
          if (rf !== -1 && rl > rf) {
            let repairS = repairText.slice(rf, rl+1).replace(/[\u201c\u201d\u201e\u201f]/g,'"').replace(/[\u2018\u2019]/g,"'").replace(/,\s*([\]}])/g,'$1');
            parsed = JSON.parse(repairS);
            console.warn('[FixIt] JSON_REPAIR_SUCCESS attempt=3');
            recovered = true;
          }
        }
      } catch (repairErr) { console.error('[FixIt] JSON_REPAIR_FAILED:', repairErr.message); }
    }
    if (!recovered) {
      const fb = makeFallback('json_parse_failed');
      if (intelligentParts) fb.partsNeeded = intelligentParts;
      fb._version = DEPLOY_VERSION;
      if (vehicleCtx) fb._vehicleCtx = vehicleCtx;
      // Parse-failed fallback — do NOT consume the free slot
      return res.status(200).json(fb);
    }
  }

  // ── ✅ AI call succeeded and JSON is valid — NOW commit the free slot ──────
  // This is the only place consumeFreeSlot is called.
  // Pro users: isPro=true → skip (no-op check inside consumeFreeSlot would be wasteful,
  //            so we check here before calling).
  let freeTrialJustCompleted = false;
  if (!isPro) {
    const slotResult = await consumeFreeSlot(userId);
    if (slotResult === 'already_taken') {
      // A concurrent request from the same user (double-tap, two tabs, two devices)
      // already consumed the free slot. The FOR UPDATE lock in admin_consume_diagnosis
      // serialised the two SQL transactions and the second one lost.
      // We must NOT deliver this AI response — doing so would give two free repairs.
      console.warn(`[diagnose] BLOCKING duplicate response for userId=${userId} — free slot was already consumed by a concurrent request`);
      return res.status(403).json({
        error:   'free_limit_reached',
        message: 'Free diagnosis limit reached. Upgrade to Pro for unlimited diagnoses.',
        version: DEPLOY_VERSION,
      });
    }
    // 'consumed' → slot taken normally; 'error' → allow (conservative: don't punish DB errors)
    if (slotResult === 'consumed') {
      freeTrialJustCompleted = true;
    }
  }

  // ── Post-process + return ─────────────────────────────────────────────────
  if (intelligentParts) {
    parsed.partsNeeded = intelligentParts;
    console.log('[FixIt] PARTS_OVERRIDE partType=%s vehicle=%s', partType, vehicleCtx ? vehicleCtx.make + ' ' + (vehicleCtx.model||'') : 'none');
  }
  if (Array.isArray(parsed.causes)) parsed.causes = parsed.causes.slice(0, 4);
  if (Array.isArray(parsed.steps)) {
    parsed.steps = parsed.steps.slice(0, 4).map(step => ({
      ...step,
      title:       typeof step.title       === 'string' ? step.title.slice(0, 80)   : step.title,
      description: typeof step.description === 'string' ? step.description.slice(0, 500) : step.description,
      tip:         typeof step.tip         === 'string' ? step.tip.slice(0, 200)    : step.tip,
    }));
  }
  if (typeof parsed.diagnosis === 'string') parsed.diagnosis = parsed.diagnosis.slice(0, 500);
  if (typeof parsed.proTip    === 'string') parsed.proTip    = parsed.proTip.slice(0, 350);

  const electricalText = `${prob} ${parsed.diagnosis || ''}`.toLowerCase();
  const electricalTerms = ['steckdose','sicherungskasten','230v','240v','400v','netzspannung','offene leitung','stromschlag','kabelbrand','live wire','mains','electrical panel','fuse box'];
  if (cat !== 'car' && electricalTerms.some(term => electricalText.includes(term)) && !parsed.safetyWarning) {
    parsed.safetyWarning = lang2.includes('Deutsch') || lang2.includes('German')
      ? 'Bei Elektroarbeiten immer zuerst die Sicherung ausschalten. Bei offenen Leitungen, Sicherungskasten oder Unsicherheit einen Elektriker kontaktieren.'
      : 'For electrical work, always turn off power first. For exposed wiring, fuse boxes, or uncertainty, contact a licensed electrician.';
  }

  parsed._version = DEPLOY_VERSION;
  parsed.globalDisclaimer = getGlobalDisclaimer(lang2);
  // Client uses this to set freeRepairActive for the current session.
  // The durable record is in profiles.free_trial_completed_at (server writes it above).
  if (freeTrialJustCompleted) parsed._freeTrialJustCompleted = true;
  if (vehicleCtx) parsed._vehicleCtx = vehicleCtx;
  // Attach AI-determined internal category (language-neutral enum)
  // Valid values: home|car|motorcycle|tech|appliances|garden|bike|pets
  const VALID_CATS = new Set(['home','car','motorcycle','tech','appliances','garden','bike','pets']);
  if (parsed.category && VALID_CATS.has(parsed.category)) {
    parsed._detectedCategory = parsed.category;
  }
  delete parsed.category; // remove from public payload (internal routing only)

  console.log('[FixIt] RETURNING_RESPONSE dur=%dms conf=%s vehicle=%s userId=%s isPro=%s',
    Date.now()-t0, parsed.confidence, vehicleCtx ? vehicleCtx.make+' '+(vehicleCtx.model||'') : 'none', userId, isPro);

  return res.status(200).json(parsed);
};
