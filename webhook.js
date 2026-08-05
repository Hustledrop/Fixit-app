// api/webhook.js — Stripe webhook → syncs subscription state to Supabase
//
// ── Stripe Dashboard setup (one-time, per account) ───────────────────────────
// Stripe Dashboard → Developers → Webhooks → Add endpoint
//   Endpoint URL:  https://www.fixit-app.com/api/webhook
//   Listen to:     Events on your account
//   Select events:
//     checkout.session.completed
//     customer.subscription.updated
//     customer.subscription.deleted
//     invoice.payment_failed
//
// After adding the endpoint, copy the "Signing secret" (whsec_...) and add it to:
//   Vercel Dashboard → Settings → Environment Variables → STRIPE_WEBHOOK_SECRET
//
// ── Required Vercel environment variables ────────────────────────────────────
//   STRIPE_SECRET_KEY          sk_live_...   (FixIt Stripe account secret key)
//   STRIPE_WEBHOOK_SECRET      whsec_...     (from Stripe Webhooks endpoint above)
//   VITE_SUPABASE_URL          https://xxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  eyJ...        (Supabase → Settings → API → service_role)

import Stripe from 'stripe';

const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC   = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const config = { api: { bodyParser: false } };

let _adminClient = null;
async function admin() {
  if (_adminClient) return _adminClient;
  if (!SUPABASE_URL || !SUPABASE_SVC) return null;
  const { createClient } = await import('@supabase/supabase-js');
  _adminClient = createClient(SUPABASE_URL, SUPABASE_SVC, {
    auth: { persistSession: false },
  });
  return _adminClient;
}

async function rawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end',  ()    => resolve(data));
    req.on('error', reject);
  });
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function getProfile(supabase, userId) {
  const { data, error } = await supabase.from('profiles')
    .select('id, plan, stripe_customer_id')
    .eq('id', userId)
    .single();
  if (error) console.error('[webhook] getProfile error:', error.message);
  return data;
}

async function getProfileByCustomer(supabase, customerId) {
  const { data, error } = await supabase.from('profiles')
    .select('id, plan, stripe_customer_id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('[webhook] getProfileByCustomer error:', error.message);
  }
  return data ?? null;
}

async function grantPro(supabase, userId, plan, stripeCustomerId, cancelAt = null) {
  console.log(`[webhook] grantPro userId=${userId} plan=${plan} customerId=${stripeCustomerId} cancelAt=${cancelAt}`);
  const { error } = await supabase.from('profiles').upsert({
    id:                 userId,
    is_pro:             true,
    plan,
    stripe_customer_id: stripeCustomerId,
    cancel_at:          cancelAt,   // ISO string when scheduled to cancel, null when active
    updated_at:         new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) {
    console.error('[webhook] grantPro FAILED:', error.message, error.code);
  } else {
    console.log(`[webhook] ✅ grantPro SUCCESS is_pro=true plan=${plan} cancelAt=${cancelAt} userId=${userId}`);
  }
}

async function revokePro(supabase, stripeCustomerId) {
  const profile = await getProfileByCustomer(supabase, stripeCustomerId);

  if (!profile) {
    console.warn(`[webhook] revokePro: no profile found for customerId=${stripeCustomerId}`);
    return;
  }

  const { error } = await supabase.from('profiles')
    .update({ is_pro: false, plan: null, cancel_at: null, updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', stripeCustomerId);
  if (error) {
    console.error('[webhook] revokePro FAILED:', error.message);
  } else {
    console.log(`[webhook] ✅ revokePro SUCCESS is_pro=false userId=${profile.id}`);
  }
}

async function recordPayment(supabase, userId, stripeCustomerId, sessionId, plan) {
  const { error } = await supabase.from('payments').insert({
    user_id:            userId,
    stripe_customer_id: stripeCustomerId,
    stripe_session_id:  sessionId,
    plan,
    status:             'completed',
    created_at:         new Date().toISOString(),
  });
  if (error && !error.message?.includes('duplicate')) {
    console.error('[webhook] recordPayment error:', error.message);
  } else if (!error) {
    console.log(`[webhook] ✅ payment recorded plan=${plan} userId=${userId}`);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  if (!STRIPE_KEY || !WEBHOOK_SECRET) {
    console.warn('[webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return res.status(503).json({ error: 'not_configured' });
  }

  const body = await rawBody(req);
  let event;
  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
    event = stripe.webhooks.constructEvent(body, req.headers['stripe-signature'], WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: 'signature_invalid' });
  }

  const supabase = await admin();
  if (!supabase) {
    console.error('[webhook] Supabase admin client unavailable — check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return res.status(503).json({ error: 'supabase_not_configured' });
  }

  console.log(`[webhook] ▶ event=${event.type} id=${event.id}`);

  // ── checkout.session.completed ─────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object;
    const userId     = session.metadata?.userId || session.client_reference_id;
    const plan       = session.metadata?.plan   || 'monthly';
    const customerId = session.customer;

    console.log(`[webhook] checkout.session.completed session=${session.id} userId=${userId} plan=${plan} customerId=${customerId}`);

    if (!userId) {
      console.error('[webhook] ABORT: no userId in session.metadata or client_reference_id');
      return res.status(200).json({ received: true });
    }

    const existingProfile = await getProfile(supabase, userId);
    console.log(`[webhook] profile lookup: ${existingProfile ? `found plan=${existingProfile.plan}` : 'NOT FOUND — will upsert'}`);

    await grantPro(supabase, userId, plan, customerId);
    await recordPayment(supabase, userId, customerId, session.id, plan);
  }

  // ── customer.subscription.updated ─────────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub        = event.data.object;
    const customerId = sub.customer;
    const status     = sub.status;

    console.log(`[webhook] subscription.updated subId=${sub.id} status=${status} customerId=${customerId} cancel_at_period_end=${sub.cancel_at_period_end}`);

    const profile = await getProfileByCustomer(supabase, customerId);
    if (!profile) {
      console.warn(`[webhook] subscription.updated: no profile found for customerId=${customerId}`);
    } else if (['active', 'trialing'].includes(status)) {
      const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
      const plan     = interval === 'year' ? 'yearly' : 'monthly';
      // cancel_at_period_end: user cancelled but access continues until period end.
      // Store the cancellation timestamp so the UI can show "Cancels on [date]".
      // When false (or after Stripe fires subscription.deleted), cancel_at is null.
      const cancelAt = sub.cancel_at_period_end && sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toISOString()
        : null;
      await grantPro(supabase, profile.id, plan, customerId, cancelAt);
    } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(status)) {
      await revokePro(supabase, customerId);
    } else {
      console.log(`[webhook] subscription.updated status=${status} — no action`);
    }
  }

  // ── customer.subscription.deleted ─────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    console.log(`[webhook] subscription.deleted customerId=${customerId}`);
    await revokePro(supabase, customerId);
  }

  // ── invoice.payment_failed ─────────────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const customerId = event.data.object.customer;
    console.warn(`[webhook] invoice.payment_failed customerId=${customerId} — Pro stays active during retry window`);
  }

  res.status(200).json({ received: true });
}
