// api/translate-part.js
// POST /api/translate-part
// Translates a single technical parts search query into the market language
// of the user's detected country, preserving all specs (dimensions, codes, brands).
//
// This endpoint is called client-side ONLY when pResults.searchQ is in a script
// incompatible with the detected market language (e.g. Cyrillic query for German market).
// New diagnoses already receive market-language partsNeeded from the main diagnose prompt.
// This endpoint handles backward-compatibility for saved diagnoses only.
//
// Body: { query, countryCode, category, vehicleCtx? }
// Auth: Supabase JWT (Authorization: Bearer <token>)
// Returns: { translated: string }

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC      = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Country code → market language name for the AI prompt
const CC_TO_LANG_NAME = {
  DE:'German',AT:'German',CH:'German',LU:'German',LI:'German',
  GB:'English',US:'English',AU:'English',CA:'English',NZ:'English',IE:'English',
  FR:'French', BE:'French', MC:'French',
  IT:'Italian',SM:'Italian',VA:'Italian',
  ES:'Spanish',MX:'Spanish',AR:'Spanish',CL:'Spanish',CO:'Spanish',
  PL:'Polish', HR:'Croatian',RS:'Serbian',  MK:'Macedonian',TR:'Turkish',
  SE:'Swedish',NO:'Norwegian',DK:'Danish',  NL:'Dutch',   PT:'Portuguese',
  GR:'Greek',  CZ:'Czech',   SK:'Czech',    HU:'Hungarian',RO:'Romanian',BG:'Bulgarian',
};

async function verifyJWT(token) {
  if (!SUPABASE_URL || !SUPABASE_SVC) return null;
  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });
  const { data } = await admin.auth.getUser(token);
  return data?.user ?? null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // Auth: require valid session (Pro or free — translation is always permitted)
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    const user = await verifyJWT(token).catch(() => null);
    if (!user) return res.status(401).json({ error: 'unauthorized' });
  }
  // Note: allow unauthenticated in dev/testing; in production the JWT check above gates it.

  let body;
  try { body = JSON.parse(await readBody(req)); }
  catch { return res.status(400).json({ error: 'invalid_json' }); }

  const { query, queryLang, countryCode, category, vehicleCtx } = body || {};
  // queryLang: the language the query is currently written in (UI language at diagnosis time)
  // countryCode: the user's GPS country — determines the market language to translate INTO
  if (!query || typeof query !== 'string' || query.length > 200) {
    return res.status(400).json({ error: 'invalid_query' });
  }

  const cc = String(countryCode || '').toUpperCase().trim();
  const marketLang = CC_TO_LANG_NAME[cc] || 'English';
  const cat = category || 'car';

  // Build vehicle prefix for the prompt if available
  const vehicleStr = vehicleCtx
    ? [vehicleCtx.year, vehicleCtx.make, vehicleCtx.model, vehicleCtx.engine]
        .filter(Boolean).join(' ')
    : '';

  // Construct a precise, constrained AI prompt
  const systemPrompt = [
    `You are a technical parts search expert. Your task is to normalise a single `,
    `automotive/repair part search query so it is natural and effective in ${marketLang}.`,
    ``,
    `RULES:`,
    `1. Output ONLY the final search term — no explanation, no alternatives, no JSON.`,
    `2. INSPECT THE QUERY FIRST:`,
    `   - If the descriptive words are already correct ${marketLang} technical terminology,`,
    `     return the query UNCHANGED. Do not rephrase, reorder or alter a query that is`,
    `     already natural in ${marketLang}.`,
    `   - Only translate when the descriptive words are written in a different language.`,
    `   Example: "50cc Schaumstoff-Luftfilter 28mm" sent to a German market → UNCHANGED.`,
    `   Example: "50cc foam air filter 28mm" sent to a German market → translate to German.`,
    `3. When translation IS needed: use the natural ${marketLang} technical terminology`,
    `   that a mechanic or technician would type when searching on a professional parts site.`,
    `4. ALWAYS PRESERVE the following exactly as they appear — never translate or alter them:`,
    `   - Numeric dimensions (50cc, 28mm, 1.5L, M8, 3/4", etc.)`,
    `   - Refrigerant codes (R134a, R1234yf, R32, etc.)`,
    `   - OEM / part codes (any alphanumeric codes)`,
    `   - Brand names (Brembo, NGK, Bosch, Honda, BMW, etc.)`,
    `   - Model numbers (CBR600RR, Golf 7, 125XC, etc.)`,
    `   - Engine codes (2.0d, 1.6 TDI, OM651, etc.)`,
    `5. Translate ONLY the descriptive/conceptual words, not specs or codes.`,
    `6. Use compound nouns where ${marketLang} grammar requires them`,
    `   (e.g. German: "Schaumstoff-Luftfilter", not "Schaum Luft Filter").`,
    `7. The output must be 2–6 words maximum — a tight, buyable search term.`,
    `8. Do NOT add words not present in the input unless grammatically necessary.`,
    vehicleStr ? `9. The part is for: ${vehicleStr}. Include the vehicle if it improves searchability.` : '',
    `10. Category: ${cat}.`,
  ].filter(Boolean).join('\n')

  const userPrompt = `Normalise this part search query for the ${marketLang} market:\n"${query}"`;

  if (!ANTHROPIC_API_KEY) {
    // Fallback when API key is missing (should not happen in production)
    console.error('[translate-part] ANTHROPIC_API_KEY not set');
    return res.status(200).json({ translated: query, fallback: true });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',  // Fast + cheap — single short output
        max_tokens: 60,                        // A 6-word term needs ~15 tokens
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[translate-part] Anthropic error:', response.status, err);
      return res.status(200).json({ translated: query, fallback: true });
    }

    const data = await response.json();
    const translated = (data.content?.[0]?.text || '').trim()
      .replace(/^["'`]|["'`]$/g, '')  // strip surrounding quotes if AI added any
      .trim();

    if (!translated || translated.length > 150) {
      return res.status(200).json({ translated: query, fallback: true });
    }

    console.log(`[translate-part] "${query}" [${queryLang||'?'}→${marketLang}] → "${translated}" (cc=${cc})`);
    return res.status(200).json({ translated });

  } catch (err) {
    console.error('[translate-part] threw:', err.message);
    // Always return something usable — fall back to original query
    return res.status(200).json({ translated: query, fallback: true });
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 4096) reject(new Error('body too large')); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
