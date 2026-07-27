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
  // ── Diagnostic: log every sub-condition so 404 cause is visible in Vercel logs
  if (!SUPABASE_URL || !SUPABASE_SVC) {
    console.error('[portal] getCustomerId: ABORT — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(SUPABASE_URL, SUPABASE_SVC, { auth: { persistSession: false } });

  const { data, error } = await sb
    .from('profiles')
    .select('stripe_customer_id, is_pro, plan')   // select extra fields for diagnostics
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`[portal] getCustomerId: Supabase error code=${error.code} msg="${error.message}" userId=${userId}`);
    return null;
  }

  if (!data) {
    console.error(`[portal] getCustomerId: no profile row found for userId=${userId}`);
    return null;
  }

  // Log the full profile state so we know what Supabase actually contains
  console.log(`[portal] profile found userId=${userId} is_pro=${data.is_pro} plan=${data.plan} stripe_customer_id=${data.stripe_customer_id ?? 'NULL'}`);

  if (!data.stripe_customer_id) {
    console.error(`[portal] getCustomerId: stripe_customer_id is NULL for userId=${userId} — webhook may not have run or failed to write customer ID`);
    return null;
  }

  return data.stripe_customer_id;
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
    console.error('[portal] STRIPE_SECRET_KEY not set');
    return res.status(503).json({ error: 'stripe_not_configured' });
  }

  const { userId } = await readBody(req);
  if (!userId) {
    console.error('[portal] 400: no userId in request body');
    return res.status(400).json({ error: 'missing_userId' });
  }

  console.log(`[portal] POST userId=${userId}`);

  const customerId = await getCustomerId(userId);

  if (!customerId) {
    // getCustomerId already logged the specific reason above
    console.error(`[portal] 404: returning no_stripe_customer for userId=${userId}`);
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
    console.log(`[portal] ✅ session created customerId=${customerId} userId=${userId}`);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(`[portal] Stripe error for customerId=${customerId}: ${err.message}`);
    res.status(500).json({ error: 'stripe_error', message: err.message });
  }
}
