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

// Cancel the active monthly subscription when a user upgrades to lifetime.
// Uses cancel_at_period_end: true so the user keeps access until the period ends,
// then the sub naturally expires — no pro-rata refund, no immediate loss of access.
async function cancelActiveMonthlySubscription(stripe, stripeCustomerId, lifetimeSessionId) {
  try {
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status:   'active',
      limit:    10,
    });

    for (const sub of subs.data) {
      // Only cancel subscriptions that are NOT the one we just purchased
      // (the lifetime purchase is a one-time payment, not a subscription, so
      //  subs.data will only contain the old monthly ones)
      console.log(`[webhook] cancelling monthly sub id=${sub.id} for customer=${stripeCustomerId}`);
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
        metadata: { cancelled_reason: 'upgraded_to_lifetime', lifetime_session: lifetimeSessionId },
      });
      console.log(`[webhook] ✅ monthly sub ${sub.id} set to cancel at period end`);
    }
  } catch (err) {
    // Non-fatal: log and continue. The Supabase lifetime grant already succeeded.
    // The revokePro guard will protect the user even if subscription.deleted fires.
    console.error('[webhook] cancelActiveMonthlySubscription error:', err.message);
  }
}

async function revokePro(supabase, stripeCustomerId) {
  // Lifetime users must NEVER lose Pro due to a subscription cancellation event.
  // This protects the case where a user upgrades from Monthly → Lifetime:
  // the old Monthly sub will eventually fire subscription.deleted, but we must
  // not downgrade them since they already have a Lifetime plan.
  const { data: profile } = await supabase.from('profiles')
    .select('plan')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (profile?.plan === 'lifetime') {
    console.log(`[webhook] revokePro SKIPPED — user has lifetime plan, customerId=${stripeCustomerId}`);
    return;
  }

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

    // If the user just purchased Lifetime, immediately cancel any active monthly
    // subscription so they are never billed monthly again.
    if (plan === 'lifetime' && customerId) {
      const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
      await cancelActiveMonthlySubscription(stripe, customerId, session.id);
    }
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
