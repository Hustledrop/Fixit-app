// api/checkout.js — Stripe Checkout session creation
// POST /api/checkout  body: { plan, userId, userEmail }
// Returns { url } — frontend opens Stripe Checkout in new tab
//
// Required Vercel env vars:
//   STRIPE_SECRET_KEY              sk_live_... or sk_test_...
//   VITE_STRIPE_MONTHLY_PRICE_ID   price_xxx  (€3.99/month recurring)
//   VITE_STRIPE_LIFETIME_PRICE_ID  price_yyy  (€17.99 one-time)
//   VITE_APP_URL                   https://www.fixit-app.com

import Stripe from 'stripe';

const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY;
const MONTHLY_PRICE  = process.env.VITE_STRIPE_MONTHLY_PRICE_ID;
const LIFETIME_PRICE = process.env.VITE_STRIPE_LIFETIME_PRICE_ID;
const APP_URL        = process.env.VITE_APP_URL || 'https://www.fixit-app.com';

// Read raw body for Vercel (bodyParser may already have parsed it)
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(d)); });
  try { return JSON.parse(raw); } catch (_) { return {}; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'method_not_allowed' }); return; }

  if (!STRIPE_KEY) {
    return res.status(503).json({
      error: 'stripe_not_configured',
      message: 'Add STRIPE_SECRET_KEY in Vercel environment variables.',
    });
  }

  const { plan, userId, userEmail } = await readBody(req);

  if (!plan || !userId) {
    return res.status(400).json({ error: 'missing_fields', message: 'plan and userId are required' });
  }
  if (!['monthly', 'lifetime'].includes(plan)) {
    return res.status(400).json({ error: 'invalid_plan', message: 'plan must be monthly or lifetime' });
  }

  const priceId = plan === 'lifetime' ? LIFETIME_PRICE : MONTHLY_PRICE;
  if (!priceId) {
    return res.status(503).json({
      error: 'price_not_configured',
      message: `Set VITE_STRIPE_${plan.toUpperCase()}_PRICE_ID in Vercel environment variables.`,
    });
  }

  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });

    // Re-use existing Stripe customer if we have one stored
    let customerId;
    if (userEmail) {
      const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (existing.data.length > 0) customerId = existing.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      // Attach user identity for webhook reconciliation
      client_reference_id: userId,
      metadata:            { userId, plan },

      ...(customerId
        ? { customer: customerId }
        : userEmail
          ? { customer_email: userEmail }
          : {}),

      // Allow promotion codes
      allow_promotion_codes: true,

      success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/?checkout=cancelled`,
    });

    console.log(`[checkout] session created id=${session.id} plan=${plan} userId=${userId}`);
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    res.status(500).json({ error: 'stripe_error', message: err.message });
  }
}
