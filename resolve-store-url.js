// api/resolve-store-url.js
// POST /api/resolve-store-url
// Returns a direct product URL for a given query on polo-motorrad.de or louis.de.
//
// Flow:
//   1. Normalise domain + query → cache key
//   2. Return immediately if cache hit (in-memory, seeded with known good URLs)
//   3. On miss: call Claude Haiku + web_search to find the URL
//   4. Validate: URL must be on the correct domain with a real product path (> 10 chars)
//   5. Save validated URL to cache for future requests
//
// Returns: { url: string, cached: bool } or { url: null }

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ALLOWED_DOMAINS   = new Set(['polo-motorrad.de', 'louis.de']);

// ── Cache key normalisation ───────────────────────────────────────────────────
// Lowercase, keep only alphanumeric + spaces, collapse whitespace.
// Makes lookup robust across capitalisation, punctuation, and encoding variants.
// "NGK BR8ES Zündkerze" → "ngk br8es z ndkerze" (same as "ngk br8es zundkerze" after ü drop)
function normKey(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function cacheKey(domain, query) {
  return normKey(domain) + ':' + normKey(query);
}

// ── Persistent in-memory cache (lives for the lifetime of the Vercel function instance) ──
// Seeded with confirmed direct product URLs from manual verification.
// New URLs are added by the resolver and persist until the next cold start.
const URL_CACHE = new Map([
  // ── Polo Motorrad — NGK BR8ES / BR8HS spark plug ─────────────────────────
  ['polo motorrad de:ngk br8es z ndkerze',
   'https://www.polo-motorrad.de/de/zundkerze-ngk-br-8-es-5422.html'],
  ['polo motorrad de:aprilia sr50 ngk br8es z ndkerze',
   'https://www.polo-motorrad.de/de/zundkerze-ngk-br-8-es-5422.html'],
  ['polo motorrad de:ngk br8hs z ndkerze',
   'https://www.polo-motorrad.de/de/zundkerze-ngk-br-8-es-5422.html'],
  ['polo motorrad de:sr50 ngk br8es z ndkerze',
   'https://www.polo-motorrad.de/de/zundkerze-ngk-br-8-es-5422.html'],
  ['polo motorrad de:ngk br8es',
   'https://www.polo-motorrad.de/de/zundkerze-ngk-br-8-es-5422.html'],
  ['polo motorrad de:ngk br8hs',
   'https://www.polo-motorrad.de/de/zundkerze-ngk-br-8-es-5422.html'],
  // ── Louis Motorrad — NGK BR8ES / BR8HS spark plug ────────────────────────
  ['louis de:ngk br8es z ndkerze',
   'https://www.louis.de/artikel/variante/zuendkerze-ngk-5422-br8es/10035049'],
  ['louis de:aprilia sr50 ngk br8es z ndkerze',
   'https://www.louis.de/artikel/variante/zuendkerze-ngk-5422-br8es/10035049'],
  ['louis de:ngk br8hs z ndkerze',
   'https://www.louis.de/artikel/variante/zuendkerze-ngk-5422-br8es/10035049'],
  ['louis de:sr50 ngk br8es z ndkerze',
   'https://www.louis.de/artikel/variante/zuendkerze-ngk-5422-br8es/10035049'],
  ['louis de:ngk br8es',
   'https://www.louis.de/artikel/variante/zuendkerze-ngk-5422-br8es/10035049'],
  ['louis de:ngk br8hs',
   'https://www.louis.de/artikel/variante/zuendkerze-ngk-5422-br8es/10035049'],
]);

// ── URL validator ─────────────────────────────────────────────────────────────
// Accepts only URLs on the exact requested domain with a product-length path.
// Rejects: homepages, language-root paths (/de/, /en/), category pages.
function extractDomainUrl(text, domain) {
  if (!text) return null;
  const re = new RegExp(
    `https?://(?:www\\.)?${domain.replace('.', '\\.')}[^\\s"'<>)]+`, 'gi'
  );
  const matches = text.match(re);
  if (!matches) return null;
  for (const url of matches) {
    const path = url.replace(/^https?:\/\/(?:www\.)?[^/]+/, '');
    // Require a real product path (> 10 chars eliminates /, /de/, /en/, etc.)
    if (path && path !== '/' && path.length > 10) {
      return url.replace(/[.,;)]+$/, ''); // strip trailing punctuation
    }
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 4096) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  let body;
  try { body = JSON.parse(await readBody(req)); }
  catch { return res.status(400).json({ error: 'invalid_json' }); }

  const { query, domain } = body || {};
  if (!query || typeof query !== 'string' || query.length > 200)
    return res.status(400).json({ error: 'invalid_query' });
  if (!domain || !ALLOWED_DOMAINS.has(domain))
    return res.status(400).json({ error: 'domain_not_allowed' });

  // ── 1. Cache lookup ───────────────────────────────────────────────────────
  const key = cacheKey(domain, query);
  if (URL_CACHE.has(key)) {
    const cachedUrl = URL_CACHE.get(key);
    console.log('[resolve-store-url] CACHE HIT key=%s url=%s', key, cachedUrl);
    return res.status(200).json({ url: cachedUrl, cached: true });
  }

  // ── 2. Claude resolver (cache miss) ───────────────────────────────────────
  if (!ANTHROPIC_API_KEY) {
    console.warn('[resolve-store-url] No ANTHROPIC_API_KEY — returning null');
    return res.status(200).json({ url: null });
  }

  console.log('[resolve-store-url] CACHE MISS key=%s — calling Claude', key);

  const systemPrompt =
    `You are a product search assistant. Find the direct product page URL on ${domain}.\n` +
    `RULES:\n` +
    `1. Use the web_search tool to search.\n` +
    `2. Return ONLY the direct product page URL on one line — no explanation.\n` +
    `3. URL MUST start with https://www.${domain}/ or https://${domain}/\n` +
    `4. If you cannot find a specific product page, return exactly: notfound`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: `Find product page on ${domain} for: "${query}"` }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[resolve-store-url] Anthropic error %d: %s', response.status, err?.error?.message);
      return res.status(200).json({ url: null });
    }

    const data = await response.json();
    let resultText = '';
    for (const block of data.content || []) {
      if (block.type === 'text') resultText += block.text + '\n';
    }

    console.log('[resolve-store-url] Claude response: %s', resultText.slice(0, 200));

    const found = extractDomainUrl(resultText, domain);
    if (found && (found.startsWith(`https://www.${domain}/`) || found.startsWith(`https://${domain}/`))) {
      // Save to cache so the next request for the same product is instant
      URL_CACHE.set(key, found);
      console.log('[resolve-store-url] Found+cached: %s', found);
      return res.status(200).json({ url: found, cached: false });
    }

    console.log('[resolve-store-url] Not found for key=%s', key);
    return res.status(200).json({ url: null });

  } catch (err) {
    console.error('[resolve-store-url] threw: %s', err.message);
    return res.status(200).json({ url: null });
  }
}
