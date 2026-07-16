// api/webhook.js — Stripe webhook → syncs subscription state to Supabase
//
// Vercel: add endpoint https://www.fixit-app.com/api/webhook
// Events to subscribe:
//   checkout.session.completed          — payment / subscription started
//   customer.subscription.updated       — renewal, plan change, trial end
//   customer.subscription.deleted       — cancellation (immediate or end of period)
//   invoice.payment_failed              — failed renewal (optional: downgrade or notify)
//
// Required Vercel env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'stripe';

const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC   = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Vercel: disable bodyParser so we receive raw bytes for signature verification
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

// ── Profile writes (all via service_role, bypasses RLS) ───────────────────────

async function grantPro(supabase, userId, plan, stripeCustomerId) {
  const { error } = await supabase.from('profiles').upsert({
    id:                 userId,
    is_pro:             true,
    plan,                                    // 'monthly' | 'lifetime'
    stripe_customer_id: stripeCustomerId,
    updated_at:         new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) console.error('[webhook] grantPro error:', error.message);
  else       console.log(`[webhook] ✅ is_pro=true plan=${plan} userId=${userId}`);
}

async function revokePro(supabase, stripeCustomerId) {
  const { error } = await supabase.from('profiles')
    .update({ is_pro: false, plan: null, updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', stripeCustomerId);
  if (error) console.error('[webhook] revokePro error:', error.message);
  else       console.log(`[webhook] ✅ is_pro=false customerId=${stripeCustomerId}`);
}

async function recordPayment(supabase, userId, stripeCustomerId, sessionId, plan) {
  const { error } = await supabase.from('payments').insert({
    user_id:           userId,
    stripe_customer_id: stripeCustomerId,
    stripe_session_id: sessionId,
    plan,
    status:            'completed',
    created_at:        new Date().toISOString(),
  });
  // Ignore duplicate session inserts (idempotent webhook retries)
  if (error && !error.message.includes('duplicate')) {
    console.error('[webhook] recordPayment error:', error.message);
  }
}

async function resolveUserIdFromCustomer(supabase, customerId) {
  const { data } = await supabase.from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id ?? null;
}

// ── Main handler ───────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  if (!STRIPE_KEY || !WEBHOOK_SECRET) {
    console.warn('[webhook] env vars missing');
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
    console.error('[webhook] Supabase admin client unavailable');
    return res.status(503).json({ error: 'supabase_not_configured' });
  }

  console.log(`[webhook] event=${event.type} id=${event.id}`);

  // ── checkout.session.completed ─────────────────────────────────────────────
  // Fired for both one-time (lifetime) and first subscription payment.
  if (event.type === 'checkout.session.completed') {
    const session       = event.data.object;
    const userId        = session.metadata?.userId || session.client_reference_id;
    const plan          = session.metadata?.plan || 'monthly';
    const customerId    = session.customer;

    if (!userId) {
      console.error('[webhook] checkout.session.completed: no userId in metadata');
      return res.status(200).json({ received: true }); // ack so Stripe doesn't retry
    }

    await grantPro(supabase, userId, plan, customerId);
    await recordPayment(supabase, userId, customerId, session.id, plan);
  }

  // ── customer.subscription.updated ─────────────────────────────────────────
  // Fired on renewals, plan changes, trial ends.
  // Re-grant Pro to handle edge cases (e.g. payment recovered after failure).
  if (event.type === 'customer.subscription.updated') {
    const sub        = event.data.object;
    const customerId = sub.customer;
    const status     = sub.status; // 'active' | 'past_due' | 'canceled' | 'trialing' etc.

    const userId = await resolveUserIdFromCustomer(supabase, customerId);
    if (userId) {
      if (['active', 'trialing'].includes(status)) {
        // Subscription is healthy — ensure Pro stays on
        await grantPro(supabase, userId, 'monthly', customerId);
      } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(status)) {
        // Subscription has definitively ended
        await revokePro(supabase, customerId);
      }
      // past_due: leave Pro active — give user time to update payment method
      console.log(`[webhook] subscription.updated status=${status} userId=${userId}`);
    } else {
      console.warn(`[webhook] subscription.updated: no profile for customerId=${customerId}`);
    }
  }

  // ── customer.subscription.deleted ─────────────────────────────────────────
  // Fired when a subscription is fully cancelled (not just paused/past_due).
  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    await revokePro(supabase, customerId);
  }

  // ── invoice.payment_failed ─────────────────────────────────────────────────
  // Stripe will retry; only log. Pro stays active during the retry window.
  // Stripe will fire subscription.deleted if all retries fail.
  if (event.type === 'invoice.payment_failed') {
    const customerId = event.data.object.customer;
    console.warn(`[webhook] invoice.payment_failed customerId=${customerId} — Pro stays active during retry window`);
  }

  res.status(200).json({ received: true });
}
