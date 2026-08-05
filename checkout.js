// api/checkout.js — Stripe Checkout session creation
// POST /api/checkout
//   Headers: Authorization: Bearer <supabase_access_token>
//   Body:    { plan }
//   Returns: { url }
//
// SECURITY: user identity is derived server-side from the Supabase JWT in the
// Authorization header. The request body no longer carries userId — the server
// calls supabase.auth.getUser(token) to get the verified user.id from the
// same Supabase project that signed the token. This prevents stale/wrong UUID
// bugs caused by the frontend and webhook connecting to different Supabase
// projects, and prevents any client from forging a different userId.
//
// Required Vercel environment variables:
//   STRIPE_SECRET_KEY              sk_live_...   (FixIt Stripe account)
//   STRIPE_WEBHOOK_SECRET          whsec_...     (Stripe → Webhooks → signing secret)
//   VITE_STRIPE_MONTHLY_PRICE_ID   price_1TxtkM7EAy1MbtmfXtVvpb49   (€4.99/month)
//   VITE_STRIPE_YEARLY_PRICE_ID    price_1Txtl47EAy1MbtmfJPBeEIWE    (€39.99/year)
//   VITE_APP_URL                   https://www.fixit-app.com
//   VITE_SUPABASE_URL              https://xxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY      eyJ...   (Supabase → Settings → API → service_role)

import Stripe from 'stripe';

const STRIPE_KEY    = process.env.STRIPE_SECRET_KEY;
const MONTHLY_PRICE = process.env.VITE_STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE  = process.env.VITE_STRIPE_YEARLY_PRICE_ID;
const APP_URL       = process.env.VITE_APP_URL       || 'https://www.fixit-app.com';
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Verify the Supabase JWT and return the authenticated user ─────────────────
// Uses the service-role client so we can call auth.getUser() server-side.
// This is the only source of truth for user.id — the request body is not trusted.
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[checkout] missing or malformed Authorization header');
    return null;
  }
  const token = authHeader.slice(7);   // strip "Bearer "

  if (!SUPABASE_URL || !SUPABASE_SVC) {
    console.error('[checkout] VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — cannot verify token');
    return null;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    // Admin client so we can call auth.getUser() with the user's token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SVC, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error(`[checkout] supabase.auth.getUser failed: ${error.message}`);
      return null;
    }
    return data.user;   // { id, email, ... } — verified by Supabase JWT signature
  } catch (err) {
    console.error(`[checkout] token verification threw: ${err.message}`);
    return null;
  }
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(d)); });
  try { return JSON.parse(raw); } catch (_) { return {}; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'method_not_allowed' }); return; }

  if (!STRIPE_KEY) {
    return res.status(503).json({
      error: 'stripe_not_configured',
      message: 'Add STRIPE_SECRET_KEY in Vercel environment variables.',
    });
  }

  // ── Verify identity from JWT — do not trust the body ──────────────────────
  const authUser = await getUserFromToken(req.headers.authorization);
  if (!authUser) {
    return res.status(401).json({
      error:   'unauthorized',
      message: 'Valid Supabase session required. Please sign in and try again.',
    });
  }

  // authUser.id and authUser.email are now guaranteed to be from the correct
  // Supabase project (the one that signed the JWT)
  const userId    = authUser.id;
  const userEmail = authUser.email;
  console.log(`[checkout] verified userId=${userId} email=${userEmail}`);

  const { plan } = await readBody(req);

  if (!plan) {
    return res.status(400).json({ error: 'missing_fields', message: 'plan is required' });
  }
  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'invalid_plan', message: 'plan must be monthly or yearly' });
  }

  const priceId = plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE;
  if (!priceId) {
    return res.status(503).json({
      error:   'price_not_configured',
      message: `Set VITE_STRIPE_${plan.toUpperCase()}_PRICE_ID in Vercel environment variables.`,
    });
  }

  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });

    // Re-use existing Stripe customer for this email if one already exists
    let customerId;
    const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      console.log(`[checkout] re-using Stripe customer ${customerId} for ${userEmail}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode:       'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      // userId and userEmail both come from the verified JWT — never from the body
      client_reference_id: userId,
      metadata:            { userId, plan },

      ...(customerId
        ? { customer:       customerId }
        : { customer_email: userEmail }),

      allow_promotion_codes: true,

      success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/?checkout=cancelled`,
    });

    console.log(`[checkout] ✅ session created id=${session.id} plan=${plan} userId=${userId}`);
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    res.status(500).json({ error: 'stripe_error', message: err.message });
  }
}
