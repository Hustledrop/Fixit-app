// api/checkout.js — Stripe Checkout session creation
// POST /api/checkout  body: { plan, userId, userEmail }
// Returns { url } — frontend opens Stripe Checkout in new tab
//
// Required Vercel environment variables (set in Vercel Dashboard → Settings → Environment Variables):
//   STRIPE_SECRET_KEY              sk_live_...   (FixIt Stripe account — add in Vercel, never commit)
//   STRIPE_WEBHOOK_SECRET          whsec_...     (from Stripe Dashboard → Webhooks → FixIt endpoint)
//   VITE_STRIPE_MONTHLY_PRICE_ID   price_1TxtkM7EAy1MbtmfXtVvpb49   (€4.99/month)
//   VITE_STRIPE_YEARLY_PRICE_ID    price_1Txtl47EAy1MbtmfJPBeEIWE    (€39.99/year)
//   VITE_APP_URL                   https://www.fixit-app.com

import Stripe from 'stripe';

const STRIPE_KEY    = process.env.STRIPE_SECRET_KEY;
const MONTHLY_PRICE = process.env.VITE_STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE  = process.env.VITE_STRIPE_YEARLY_PRICE_ID;
const APP_URL       = process.env.VITE_APP_URL || 'https://www.fixit-app.com';

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
  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'invalid_plan', message: 'plan must be monthly or yearly' });
  }

  const priceId = plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE;
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
      mode: 'subscription',   // both monthly and yearly are recurring subscriptions
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
