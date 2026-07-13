// api/checkout.js — Stripe Checkout session creation
// POST /api/checkout { plan, userId, userEmail }
// Returns { url } — frontend opens in new tab
//
// Env vars required (Vercel → Environment Variables):
//   STRIPE_SECRET_KEY          sk_live_... or sk_test_...
//   VITE_STRIPE_MONTHLY_PRICE_ID  price_xxx (€3.99/month recurring)
//   VITE_STRIPE_LIFETIME_PRICE_ID price_yyy (€17.99 one-time)
//   VITE_APP_URL               https://www.fixit-app.com

import Stripe from 'stripe';

const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY;
const MONTHLY_PRICE  = process.env.VITE_STRIPE_MONTHLY_PRICE_ID;
const LIFETIME_PRICE = process.env.VITE_STRIPE_LIFETIME_PRICE_ID;
const APP_URL        = process.env.VITE_APP_URL || 'https://www.fixit-app.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', APP_URL);
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!STRIPE_KEY) {
    return res.status(503).json({
      error: 'stripe_not_configured',
      message: 'Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel env vars.',
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (_) {
    const raw = await new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(d)); });
    try { body = JSON.parse(raw); } catch (_) { body = {}; }
  }

  const { plan, userId, userEmail } = body;
  if (!plan || !userId) return res.status(400).json({ error: 'Missing plan or userId' });

  const priceId = plan === 'lifetime' ? LIFETIME_PRICE : MONTHLY_PRICE;
  if (!priceId) {
    return res.status(503).json({
      error: 'price_not_configured',
      message: `Price ID for "${plan}" not set in Vercel env vars.`,
    });
  }

  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
    const session = await stripe.checkout.sessions.create({
      mode:               plan === 'lifetime' ? 'payment' : 'subscription',
      line_items:         [{ price: priceId, quantity: 1 }],
      success_url:        `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:         `${APP_URL}/?checkout=cancelled`,
      client_reference_id: userId,
      metadata:           { userId, plan },
      ...(userEmail ? { customer_email: userEmail } : {}),
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    res.status(500).json({ error: 'stripe_error', message: err.message });
  }
}
