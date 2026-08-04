// api/resolve-store-url.js
// POST /api/resolve-store-url
// Uses Claude Haiku + web_search to find the direct product page URL on a specific domain.
// Only accepts URLs from the requested domain — never returns off-domain links.
//
// Body:    { query: string, domain: string }   e.g. { query: "NGK BR8ES Zündkerze", domain: "polo-motorrad.de" }
// Returns: { url: string } — a direct product URL, or { url: null } when not found (use fallback)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ALLOWED_DOMAINS = new Set(['polo-motorrad.de', 'louis.de']);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 4096) reject(new Error('body too large')); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// Extract the first URL matching the target domain from a text string
function extractDomainUrl(text, domain) {
  if (!text) return null;
  // Match any https URL on this exact domain
  const re = new RegExp(`https?://(?:www\\.)?${domain.replace('.', '\\.')}[^\\s"'<>)]+`, 'gi');
  const matches = text.match(re);
  if (!matches) return null;
  // Return the first match that looks like a product page (has a path beyond /)
  for (const url of matches) {
    const path = url.replace(/^https?:\/\/(?:www\.)?[^/]+/, '');
    if (path && path !== '/' && path.length > 10) {
      return url.replace(/[.,;)]+$/, ''); // strip trailing punctuation
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!ANTHROPIC_API_KEY) return res.status(200).json({ url: null }); // no key → client falls back

  let body;
  try { body = JSON.parse(await readBody(req)); }
  catch { return res.status(400).json({ error: 'invalid_json' }); }

  const { query, domain } = body || {};
  if (!query || typeof query !== 'string' || query.length > 200) {
    return res.status(400).json({ error: 'invalid_query' });
  }
  if (!domain || !ALLOWED_DOMAINS.has(domain)) {
    return res.status(400).json({ error: 'domain_not_allowed' });
  }

  const systemPrompt = `You are a product search assistant. Your only task is to find a direct product page URL on ${domain} for the given search query.

RULES:
1. Use the web_search tool to search for the product.
2. Return ONLY the direct product page URL — no explanation, no alternatives.
3. The URL MUST start with https://www.${domain}/ or https://${domain}/
4. If you find a matching product, return the URL on a single line.
5. If you cannot find a specific product page on ${domain}, return exactly: notfound`;

  const userPrompt = `Find the direct product page URL on ${domain} for: "${query}"`;

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
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[resolve-store-url] Anthropic error:', response.status, err?.error?.message);
      return res.status(200).json({ url: null }); // fall back to client
    }

    const data = await response.json();

    // Extract the text response from the content blocks
    let resultText = '';
    for (const block of data.content || []) {
      if (block.type === 'text') {
        resultText += block.text + '\n';
      }
    }

    // Log the full Claude response for debugging (appears in Vercel logs)
    console.log('[resolve-store-url] Claude response text:', JSON.stringify(resultText.slice(0, 300)));

    // Try to find a valid URL for the requested domain in the response
    const found = extractDomainUrl(resultText, domain);

    if (found && (found.startsWith(`https://www.${domain}/`) || found.startsWith(`https://${domain}/`))) {
      console.log(`[resolve-store-url] Found: ${found} (domain=${domain})`);
      return res.status(200).json({ url: found });
    }

    console.log(`[resolve-store-url] Not found for "${query}" on ${domain}. Response: ${resultText.slice(0, 100)}`);
    return res.status(200).json({ url: null });

  } catch (err) {
    console.error('[resolve-store-url] threw:', err.message);
    return res.status(200).json({ url: null }); // always fall back gracefully
  }
}
