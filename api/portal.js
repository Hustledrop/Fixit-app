// api/portal.js — Stripe Customer Portal session
// POST /api/portal  body: { userId }
// Returns { url } — redirects to Stripe's hosted billing portal
//
// Required Vercel env vars (already set):
//   STRIPE_SECRET_KEY
//   VITE_APP_URL
//
// Stripe Dashboard setup required:
//   Stripe → Settings → Billing → Customer Portal
//   Enable: Cancel subscriptions, Update payment methods, View invoices
//   Set return URL: https://www.fixit-app.com/?portal=return

import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL    = process.env.VITE_APP_URL || 'https://www.fixit-app.com';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getCustomerId(userId) {
  if (!SUPABASE_URL || !SUPABASE_SVC) return null;
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });
  const { data } = await sb.from('profiles').select('stripe_customer_id').eq('id', userId).single();
  return data?.stripe_customer_id ?? null;
}

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
    return res.status(503).json({ error: 'stripe_not_configured' });
  }

  const { userId } = await readBody(req);
  if (!userId) return res.status(400).json({ error: 'missing_userId' });

  const customerId = await getCustomerId(userId);
  if (!customerId) {
    return res.status(404).json({
      error: 'no_stripe_customer',
      message: 'No Stripe customer found for this account.',
    });
  }

  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${APP_URL}/?portal=return`,
    });
    console.log(`[portal] session created for userId=${userId}`);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[portal] Stripe error:', err.message);
    res.status(500).json({ error: 'stripe_error', message: err.message });
  }
}
