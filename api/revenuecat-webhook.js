// api/revenuecat-webhook.js — RevenueCat webhook → syncs subscription state to Supabase
//
// ── RevenueCat Dashboard setup (one-time) ────────────────────────────────────
// RC Dashboard → Project → Integrations → Webhooks → + New webhook
//   URL:           https://www.fixit-app.com/api/revenuecat-webhook
//   Authorization: Set any secret string → add as REVENUECAT_WEBHOOK_SECRET in Vercel
//   Events to send: select all (or at minimum the ones in GRANT/REVOKE/SOFT below)
//
// ── Required Vercel environment variables ────────────────────────────────────
//   REVENUECAT_WEBHOOK_SECRET   — token you set in the RC webhook (any string)
//   VITE_SUPABASE_URL           — https://xxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   — eyJ...
//
// ── RC webhook event_type reference (authoritative as of RC API v1) ───────────
//
//   INITIAL_PURCHASE            New subscription started
//   RENEWAL                     Subscription auto-renewed
//   PRODUCT_CHANGE              User changed plan (fires twice: old + new product)
//   UNCANCELLATION              User re-enabled a subscription before expiry
//   TRANSFER                    Subscription transferred between RC user IDs
//   NON_SUBSCRIPTION_PURCHASE   One-time purchase (not a subscription)
//   TEMPORARY_ENTITLEMENT_GRANT RC granted a temporary entitlement (e.g. testing)
//
//   CANCELLATION                User cancelled — subscription still active until
//                               expiration_at_ms. Check cancellation_reason:
//                                 VOLUNTARY          — user-initiated cancellation
//                                 CUSTOMER_SUPPORT   — cancelled by support (refund)
//                                 UNKNOWN
//   BILLING_ISSUE               Payment failed; RC will retry during a grace period.
//                               Entitlement stays active during grace period.
//                               The grace_period_expires_at_ms field indicates when.
//   SUBSCRIPTION_PAUSED         Google Play subscription is SCHEDULED to pause at the end
//                               of the current billing period. The entitlement remains
//                               ACTIVE until that period ends. Do NOT revoke on this event.
//                               RC fires EXPIRATION (expiration_reason=SUBSCRIPTION_PAUSED)
//                               when the period actually ends and access is truly lost.
//   EXPIRATION                  Subscription period ended; entitlement is now inactive.
//                               Covers: natural end-of-period, post-refund expiry, and
//                               post-pause expiry (expiration_reason=SUBSCRIPTION_PAUSED).
//
// ── There is NO separate "REFUND" webhook event type in RevenueCat ────────────
// Subscription refunds in RevenueCat are represented as:
//   1. CANCELLATION with cancellation_reason = 'CUSTOMER_SUPPORT'
//      (fires immediately when refund is issued; subscription still active until expiry)
//   2. EXPIRATION (fires when the subscription period ends after the refund)
// This matches the platform behaviour: Apple/Google refunds cancel the subscription
// and let it run to the end of the current period, then expire.
// We do NOT revoke on CANCELLATION (regardless of reason) — we wait for EXPIRATION.
// This ensures the user retains access for the period they paid for, matching
// Apple/Google store policy.
//
// ── Entitlement precedence ────────────────────────────────────────────────────
// The RC SDK's CustomerInfo.entitlements.active is the device-side authority.
// This webhook keeps Supabase in sync as the server-side persistent mirror.
// The client NEVER reads Supabase immediately after a purchase/restore —
// it trusts RC CustomerInfo directly. Supabase is used for cross-device/session sync.

const WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL;
const SUPABASE_SVC   = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Event classification ───────────────────────────────────────────────────────

// Events that confirm an active entitlement — grant Pro (upsert, idempotent)
const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',           // Fires on both old and new product; grantPro is idempotent
  'UNCANCELLATION',           // User re-enabled before expiry
  'TRANSFER',                 // Subscription moved to this user
  'NON_SUBSCRIPTION_PURCHASE',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

// Events that confirm the entitlement is definitively inactive — revoke Pro
const REVOKE_EVENTS = new Set([
  'EXPIRATION',  // Subscription period ended — covers natural expiry, post-refund,
                 // and post-pause expiry (expiration_reason=SUBSCRIPTION_PAUSED)
]);

// CANCELLATION, BILLING_ISSUE, SUBSCRIPTION_PAUSED: entitlement still active — handle below
// CANCELLATION:        user cancelled but entitled until expiration_at_ms
// BILLING_ISSUE:       payment failed but entitled during grace period
// SUBSCRIPTION_PAUSED: pause SCHEDULED; entitlement active until current period ends

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

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
  try { return JSON.parse(raw); } catch (_) { return {}; }
}

// ── Supabase helpers (all idempotent) ─────────────────────────────────────────

async function grantPro(supabase, userId, plan) {
  console.log(`[rc-webhook] grantPro userId=${userId} plan=${plan}`);
  const { error } = await supabase.from('profiles').upsert({
    id:         userId,
    is_pro:     true,
    plan:       plan,
    cancel_at:  null,       // clear any pending cancellation marker
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) console.error('[rc-webhook] grantPro FAILED:', error.message);
  else       console.log(`[rc-webhook] ✅ grantPro userId=${userId} plan=${plan}`);
}

async function revokePro(supabase, userId) {
  console.log(`[rc-webhook] revokePro userId=${userId}`);
  const { error } = await supabase.from('profiles')
    .update({ is_pro: false, plan: null, cancel_at: null, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) console.error('[rc-webhook] revokePro FAILED:', error.message);
  else       console.log(`[rc-webhook] ✅ revokePro userId=${userId}`);
}

async function markCancelScheduled(supabase, userId, expiresAt) {
  // Subscription is cancelled but still active. Keep is_pro=true; set cancel_at
  // so the UI can show "Cancels on <date>". Revocation happens via EXPIRATION.
  console.log(`[rc-webhook] markCancelScheduled userId=${userId} expiresAt=${expiresAt}`);
  const { error } = await supabase.from('profiles')
    .update({ cancel_at: expiresAt, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) console.error('[rc-webhook] markCancelScheduled FAILED:', error.message);
  else       console.log(`[rc-webhook] ✅ markCancelScheduled userId=${userId}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function planFromProductId(productId) {
  if (!productId) return 'monthly';
  const id = productId.toLowerCase();
  if (id.includes('yearly') || id.includes('annual') || id.includes('year')) return 'yearly';
  return 'monthly';
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // ── Require webhook secret — reject when not configured ──────────────────────
  // RC retries on 5xx, so events are not lost once the secret is set.
  if (!WEBHOOK_SECRET) {
    console.error('[rc-webhook] REVENUECAT_WEBHOOK_SECRET not configured — set it in Vercel env vars.');
    return res.status(503).json({ error: 'webhook_not_configured' });
  }

  // RC sends the secret as a Bearer token in the Authorization header
  const authHeader = req.headers.authorization ?? '';
  const rcSecret   = req.headers['x-revenuecat-secret'] ?? '';
  const provided   = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : rcSecret.trim();

  if (provided !== WEBHOOK_SECRET) {
    console.warn('[rc-webhook] Invalid webhook secret — rejecting request');
    return res.status(401).json({ error: 'unauthorized' });
  }

  const body = await readBody(req);

  // RC v1 wraps the event: { event: { type, app_user_id, ... } }
  const event              = body.event ?? {};
  const eventType          = event.type               ?? body.type          ?? 'UNKNOWN';
  const appUserId          = event.app_user_id         ?? body.app_user_id  ?? null;
  const productId          = event.product_id          ?? body.product_id   ?? null;
  const expiresAtMs        = event.expiration_at_ms    ?? null;
  const cancellationReason = event.cancellation_reason ?? null;

  const expiresAt = expiresAtMs ? new Date(expiresAtMs).toISOString() : null;

  console.log(`[rc-webhook] event=${eventType} appUserId=${appUserId} product=${productId} reason=${cancellationReason}`);

  // appUserId must be the Supabase UUID (set via Purchases.logIn(userId) in the app)
  if (!appUserId) {
    console.warn('[rc-webhook] No app_user_id — cannot map to Supabase user; ignoring');
    return res.status(200).json({ status: 'ignored', reason: 'no_app_user_id' });
  }

  // Reject anonymous RC user IDs (start with $RCAnonymousID:) — these cannot map
  // to a Supabase profile. Should never happen since purchases are gated behind auth.
  if (appUserId.startsWith('$')) {
    console.warn(`[rc-webhook] Anonymous RC user ${appUserId} — ignoring`);
    return res.status(200).json({ status: 'ignored', reason: 'anonymous_user' });
  }

  const sb = await admin();
  if (!sb) {
    console.error('[rc-webhook] Supabase admin client unavailable');
    return res.status(503).json({ error: 'database_unavailable' });
  }

  const plan = planFromProductId(productId);

  if (GRANT_EVENTS.has(eventType)) {
    // Active entitlement confirmed — grant Pro
    await grantPro(sb, appUserId, plan);

  } else if (REVOKE_EVENTS.has(eventType)) {
    // Entitlement definitively ended — revoke Pro.
    // Only EXPIRATION lands here. It covers: natural end-of-period, post-refund expiry,
    // and post-pause expiry (when expiration_reason=SUBSCRIPTION_PAUSED).
    await revokePro(sb, appUserId);

  } else if (eventType === 'CANCELLATION') {
    // Subscription cancelled but STILL ACTIVE until expiration_at_ms.
    // This covers both voluntary cancellations AND refunds (cancellation_reason=CUSTOMER_SUPPORT).
    // In both cases, the user retains access until expiry, then EXPIRATION fires and revokes.
    // We mark cancel_at for UI display but do NOT revoke is_pro.
    await markCancelScheduled(sb, appUserId, expiresAt);

  } else if (eventType === 'SUBSCRIPTION_PAUSED') {
    // Google Play subscription pause is SCHEDULED for end of current billing period.
    // The entitlement is still ACTIVE — do not revoke.
    // RC will fire EXPIRATION (expiration_reason=SUBSCRIPTION_PAUSED) when the period
    // actually ends; that is when we revoke. Treat like CANCELLATION: mark cancel_at
    // so the UI can show "Pauses on <date>", but keep is_pro=true.
    await markCancelScheduled(sb, appUserId, expiresAt);

  } else if (eventType === 'BILLING_ISSUE') {
    // Payment failed. RC will retry during the platform grace period.
    // The entitlement remains active during this grace period.
    // RC fires EXPIRATION if the grace period runs out without payment.
    // No Supabase action — keep is_pro=true until EXPIRATION.
    console.log(`[rc-webhook] BILLING_ISSUE userId=${appUserId} — grace period active, no action`);

  } else {
    console.log(`[rc-webhook] Unhandled event type: ${eventType} — ignoring`);
  }

  return res.status(200).json({ status: 'ok', event: eventType });
}
