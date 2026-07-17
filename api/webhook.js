// api/webhook.js — Stripe webhook → syncs subscription state to Supabase
//
// Vercel: add endpoint https://www.fixit-app.com/api/webhook
// Events to subscribe:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
//   invoice.payment_failed
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

async function grantPro(supabase, userId, plan, stripeCustomerId) {
  console.log(`[webhook] grantPro userId=${userId} plan=${plan} customerId=${stripeCustomerId}`);
  const { error } = await supabase.from('profiles').upsert({
    id:                 userId,
    is_pro:             true,
    plan,
    stripe_customer_id: stripeCustomerId,
    updated_at:         new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) {
    console.error('[webhook] grantPro FAILED:', error.message, error.code);
  } else {
    console.log(`[webhook] ✅ grantPro SUCCESS is_pro=true plan=${plan} userId=${userId}`);
  }
}

async function revokePro(supabase, stripeCustomerId) {
  const profile = await getProfileByCustomer(supabase, stripeCustomerId);

  // LIFETIME IS PERMANENT — never revoke via subscription events
  if (profile?.plan === 'lifetime') {
    console.log(`[webhook] revokePro SKIPPED — plan=lifetime customerId=${stripeCustomerId}`);
    return;
  }

  if (!profile) {
    console.warn(`[webhook] revokePro: no profile found for customerId=${stripeCustomerId}`);
    return;
  }

  const { error } = await supabase.from('profiles')
    .update({ is_pro: false, plan: null, updated_at: new Date().toISOString() })
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

async function cancelActiveMonthlySubscription(stripe, stripeCustomerId, lifetimeSessionId) {
  try {
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status:   'active',
      limit:    10,
    });
    console.log(`[webhook] found ${subs.data.length} active sub(s) to cancel for customer=${stripeCustomerId}`);
    for (const sub of subs.data) {
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
        metadata: {
          cancelled_reason:  'upgraded_to_lifetime',
          lifetime_session:  lifetimeSessionId,
        },
      });
      console.log(`[webhook] ✅ sub ${sub.id} set to cancel_at_period_end=true`);
    }
  } catch (err) {
    console.error('[webhook] cancelActiveMonthlySubscription error:', err.message);
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

    console.log(`[webhook] checkout.session.completed session=${session.id} userId=${userId} plan=${plan} customerId=${customerId} mode=${session.mode}`);

    if (!userId) {
      console.error('[webhook] ABORT: no userId in session.metadata or client_reference_id');
      // Still return 200 so Stripe does not retry — we cannot fix a missing userId
      return res.status(200).json({ received: true });
    }

    // Verify the profile exists before writing to it
    const existingProfile = await getProfile(supabase, userId);
    console.log(`[webhook] profile lookup: ${existingProfile ? `found plan=${existingProfile.plan}` : 'NOT FOUND — will upsert'}`);

    await grantPro(supabase, userId, plan, customerId);
    await recordPayment(supabase, userId, customerId, session.id, plan);

    // Cancel the old monthly subscription when upgrading to lifetime.
    // NOTE: this triggers customer.subscription.updated with status='active'.
    // The subscription.updated handler below is lifetime-aware and will NOT
    // overwrite plan='lifetime' with 'monthly'.
    if (plan === 'lifetime' && customerId) {
      const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' });
      await cancelActiveMonthlySubscription(stripe, customerId, session.id);
    }
  }

  // ── customer.subscription.updated ─────────────────────────────────────────
  // IMPORTANT: this event fires when we set cancel_at_period_end=true above.
  // The subscription status is still 'active' at that point.
  // We must NOT overwrite plan='lifetime' with 'monthly' here.
  if (event.type === 'customer.subscription.updated') {
    const sub        = event.data.object;
    const customerId = sub.customer;
    const status     = sub.status;
    const cancelAtPeriodEnd = sub.cancel_at_period_end;

    console.log(`[webhook] subscription.updated subId=${sub.id} status=${status} cancel_at_period_end=${cancelAtPeriodEnd} customerId=${customerId}`);

    const profile = await getProfileByCustomer(supabase, customerId);
    if (!profile) {
      console.warn(`[webhook] subscription.updated: no profile found for customerId=${customerId}`);
    } else {
      console.log(`[webhook] subscription.updated: profile found userId=${profile.id} current_plan=${profile.plan}`);

      // CRITICAL: never overwrite a lifetime plan via subscription events
      if (profile.plan === 'lifetime') {
        console.log(`[webhook] subscription.updated SKIPPED — profile is already lifetime`);
      } else if (['active', 'trialing'].includes(status)) {
        // Normal active subscription — grant Pro as monthly
        // (This also fires on cancel_at_period_end=true while still active — safe to grant)
        await grantPro(supabase, profile.id, 'monthly', customerId);
      } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(status)) {
        await revokePro(supabase, customerId);
      } else {
        // past_due etc — leave Pro active during retry window
        console.log(`[webhook] subscription.updated status=${status} — no action`);
      }
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
