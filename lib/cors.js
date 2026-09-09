// lib/cors.js — shared CORS helper for all FixIt Vercel API functions
//
// Location rationale: /lib sits alongside /api and /src at the project root.
// It is never compiled into the client bundle (not under /src) and is never
// treated as a Vercel serverless function (not under /api).
//
// Allowed origins:
//   https://www.fixit-app.com  — production web app (browser)
//   capacitor://localhost       — Capacitor WebView on iOS
//   http://localhost            — Capacitor WebView on older Android builds
//   https://localhost           — Capacitor WebView on Android
//
// Wildcard '*' is intentionally not used. Endpoints carry Authorization: Bearer
// <supabase-jwt> tokens and Stripe session URLs — browsers refuse to send
// credentials to a wildcard origin, and restricting origins limits abuse surface.
//
// Vercel webhook endpoints (/api/webhook, /api/revenuecat-webhook) are called
// server-to-server (Stripe/RC → Vercel), never from a browser, so they do not
// use this helper.

const ALLOWED_ORIGINS = new Set([
  'https://www.fixit-app.com',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
]);

/**
 * Set CORS headers on a Vercel response and handle OPTIONS preflight.
 *
 * Default allowed headers cover every header any FixIt client-facing endpoint uses:
 *   Content-Type   — all JSON POST bodies
 *   Authorization  — Supabase JWT (Bearer token) sent by authenticated requests
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse}  res
 * @param {string} [methods='POST, OPTIONS']
 * @param {string} [allowedHeaders='Content-Type, Authorization']
 * @returns {boolean} true when this is a preflight OPTIONS request; caller must return immediately
 */
export function setCors(
  req,
  res,
  methods = 'POST, OPTIONS',
  allowedHeaders = 'Content-Type, Authorization',
) {
  const origin = req.headers.origin ?? '';

  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}