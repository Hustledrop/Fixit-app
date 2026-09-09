// src/billing/index.js
// ── FixIt Cross-Platform Billing Layer ────────────────────────────────────────
//
// Platform routing:
//   Web  (browser)   → Stripe Checkout  (/api/checkout — unchanged)
//   iOS  (Capacitor) → RevenueCat / Apple In-App Purchase
//   Android (Cap.)   → RevenueCat / Google Play Billing
//
// ── Source of truth precedence (native) ──────────────────────────────────────
//   1. RevenueCat CustomerInfo.entitlements.active  — IMMEDIATE, device-local
//   2. Supabase profiles.is_pro                     — PERSISTENT, server mirror
//
//   RC CustomerInfo is authoritative for whether the entitlement is active RIGHT
//   NOW. Supabase is updated asynchronously by the RC webhook and is used as the
//   persistent backend record and cross-device sync mechanism. A stale Supabase
//   value must NEVER downgrade a currently active RC entitlement.
//
// ── Configuration required before going live ─────────────────────────────────
//   Replace PLACEHOLDER values in REVENUECAT_CONFIG below with real RC API keys.
//   App gracefully degrades (no crashes, Stripe web still works) when RC keys
//   are PLACEHOLDER_ values.

import { Capacitor } from '@capacitor/core';

// ── RevenueCat config — replace PLACEHOLDER values before going live ──────────
export const REVENUECAT_CONFIG = {
  // PUBLIC SDK API keys — safe to ship in client code (NOT secret keys).
  // RevenueCat Dashboard → Project → API keys → Public SDK keys
  APPLE_API_KEY:   'PLACEHOLDER_RC_APPLE_API_KEY',    // e.g. appl_xxxxxxxxxxxxxxxxxxxx
  GOOGLE_API_KEY:  'PLACEHOLDER_RC_GOOGLE_API_KEY',   // e.g. goog_xxxxxxxxxxxxxxxxxxxx

  // Entitlement identifier — must match RC Dashboard → Entitlements → identifier
  ENTITLEMENT_ID: 'pro',

  // Offering identifier — must match RC Dashboard → Offerings → identifier
  // The purchase flow fetches packages from the RC Offering at runtime.
  // Product IDs live in the RC Dashboard, linked to App Store Connect / Play Console.
  // Suggested product IDs to create in stores (reference only, not used in code):
  //   com.fixit.app.pro_monthly  (App Store Connect + Google Play Console)
  //   com.fixit.app.pro_yearly   (App Store Connect + Google Play Console)
  OFFERING_ID: 'default',
};

// ── Platform detection ────────────────────────────────────────────────────────
export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

export function isNativeBillingAvailable() {
  if (!isNativePlatform()) return false;
  const key = Capacitor.getPlatform() === 'ios'
    ? REVENUECAT_CONFIG.APPLE_API_KEY
    : REVENUECAT_CONFIG.GOOGLE_API_KEY;
  return Boolean(key && !key.startsWith('PLACEHOLDER_'));
}

// ── Lazy-load RC plugin (never imported on web) ───────────────────────────────
let _Purchases = null;
async function getPurchases() {
  if (_Purchases) return _Purchases;
  try {
    const mod = await import('@revenuecat/purchases-capacitor');
    _Purchases = mod.Purchases;
    return _Purchases;
  } catch (err) {
    console.error('[billing] Failed to load RevenueCat plugin:', err.message);
    throw new BillingError('sdk_load_failed', err.message);
  }
}

// ── Custom error type ─────────────────────────────────────────────────────────
export class BillingError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
    this.name = 'BillingError';
  }
}

// ── RC initialization ─────────────────────────────────────────────────────────
// initRevenueCat(userId) is called from the useEffect in App.jsx that watches
// user?.id. It is safe to call on web (returns immediately).
//
// Initialization flow:
//   Cold start, user already logged in:  configure(userId)  → _rcInitialized = true
//   Cold start, user not yet loaded:     configure(null)    → anonymous RC user
//     then when auth resolves:           logIn(userId)      → RC merges anonymous → identified
//   User logs out:                       logOut()           → RC switches to fresh anonymous
//   Different user logs in:              logIn(newUserId)   → RC switches identity
//
// Purchases are gated behind user auth (startCheckout guards !user → signup).
// Therefore no purchase can be made while RC is in anonymous state, so the
// anonymous → identified merge never carries a real purchase via an unmappable
// anonymous app_user_id into the webhook.

let _rcInitialized = false;

export async function initRevenueCat(userId) {
  if (!isNativePlatform()) return;

  if (_rcInitialized) {
    // RC already configured — update the appUserID when auth changes
    try {
      const Purchases = await getPurchases();
      if (userId) {
        await Purchases.logIn({ appUserID: userId });
        console.log(`[billing] RC logIn userId=${userId}`);
      } else {
        await Purchases.logOut();
        console.log('[billing] RC logOut — switched to anonymous');
      }
    } catch (err) {
      console.warn('[billing] RC user update failed (non-fatal):', err.message);
    }
    return;
  }

  if (!isNativeBillingAvailable()) {
    console.warn('[billing] RC keys not yet configured — native billing disabled');
    return;
  }

  try {
    const Purchases = await getPurchases();
    const platform  = Capacitor.getPlatform();
    const apiKey    = platform === 'ios'
      ? REVENUECAT_CONFIG.APPLE_API_KEY
      : REVENUECAT_CONFIG.GOOGLE_API_KEY;

    await Purchases.configure({ apiKey, appUserID: userId || null });
    _rcInitialized = true;
    console.log(`[billing] RC initialized platform=${platform} userId=${userId || 'anonymous'}`);

    // Register a listener so RC pushes CustomerInfo updates (renewals, expirations)
    // to the app automatically — no polling needed.
    // The callback receives the fresh CustomerInfo whenever RC detects a change.
    // Consumers can subscribe via setCustomerInfoListener() below.
    try {
      await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        const entitlement = parseEntitlement(customerInfo);
        console.log(`[billing] RC customerInfo update isPro=${entitlement.isPro}`);
        if (_customerInfoCallback) _customerInfoCallback(entitlement);
      });
    } catch (err) {
      console.warn('[billing] Could not register RC listener (non-fatal):', err.message);
    }
  } catch (err) {
    console.error('[billing] RC init failed:', err.message);
    // Non-fatal — app continues; web Stripe path unaffected
  }
}

// ── CustomerInfo update listener ──────────────────────────────────────────────
// App.jsx registers a callback here to receive RC entitlement updates in real time
// (renewals, expirations, plan changes detected by the RC SDK).
let _customerInfoCallback = null;
export function setCustomerInfoListener(cb) {
  _customerInfoCallback = cb;
}

// ── Check current RC entitlement (launch/resume reconciliation) ───────────────
// Call this on app launch and on resume from background to reconcile RC state
// with Supabase without depending on webhook timing.
// Returns: { isPro: boolean, plan: 'monthly'|'yearly'|null, expiresAt: Date|null }
// Returns { isPro: false } (not null) when RC is not initialized — callers must
// check isNativePlatform() before using the result for gating decisions.
export async function checkNativeEntitlement() {
  if (!isNativePlatform() || !_rcInitialized) {
    return { isPro: false, plan: null, expiresAt: null };
  }
  try {
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return parseEntitlement(customerInfo);
  } catch (err) {
    console.error('[billing] checkNativeEntitlement failed:', err.message);
    return { isPro: false, plan: null, expiresAt: null };
  }
}

// ── Load available offerings ──────────────────────────────────────────────────
export async function loadOfferings() {
  if (!isNativePlatform() || !_rcInitialized) {
    throw new BillingError('not_available', 'Native billing not available on this platform');
  }
  try {
    const Purchases = await getPurchases();
    const offerings = await Purchases.getOfferings();
    const offering  = offerings.current;
    if (!offering) throw new BillingError('no_offering', 'No RevenueCat offering available');
    return { monthly: offering.monthly ?? null, yearly: offering.annual ?? null, offering };
  } catch (err) {
    if (err instanceof BillingError) throw err;
    throw new BillingError('load_failed', err.message);
  }
}

// ── Purchase a Pro plan (native only) ────────────────────────────────────────
// Returns: { isPro: true, plan: 'monthly'|'yearly', expiresAt: Date|null }
// Throws:  BillingError — including BillingError('user_cancelled') for silent handling
//
// ── On the caller side (App.jsx startCheckout) ───────────────────────────────
// After purchasePro() returns successfully:
//   1. RC CustomerInfo confirms entitlement is active — this is the authoritative
//      client-side signal. Call grantProOptimistic(result.plan) immediately.
//   2. The RC webhook will update Supabase asynchronously. Do NOT call
//      refreshProfile() immediately — it reads Supabase before the webhook fires
//      and returns is_pro=false, falsely downgrading an active entitlement.
//   3. The addCustomerInfoUpdateListener registered in initRevenueCat() will
//      fire on any subsequent RC entitlement change (renewal, expiry, etc.)
//      and can trigger a Supabase reconciliation at that point.
export async function purchasePro(plan) {
  if (!isNativePlatform()) {
    throw new BillingError('use_stripe', 'Use Stripe checkout on web');
  }
  if (!_rcInitialized) {
    throw new BillingError('not_configured', 'RevenueCat is not yet configured');
  }

  try {
    const Purchases = await getPurchases();
    const offerings = await Purchases.getOfferings();
    const offering  = offerings.current;
    if (!offering) throw new BillingError('no_offering', 'No products available');

    const pkg = plan === 'yearly'
      ? (offering.annual  ?? offering.availablePackages.find(p => p.packageType === 'ANNUAL'))
      : (offering.monthly ?? offering.availablePackages.find(p => p.packageType === 'MONTHLY'));

    if (!pkg) throw new BillingError('no_package', `No ${plan} package found in offering`);

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const entitlement = parseEntitlement(customerInfo);

    if (!entitlement.isPro) {
      throw new BillingError('purchase_failed', 'Purchase completed but entitlement not granted');
    }

    console.log(`[billing] ✅ purchasePro success plan=${plan}`);
    return entitlement;
  } catch (err) {
    if (err instanceof BillingError) throw err;
    const code = err.code ?? '';
    if (code === '1' || err.userCancelled) {
      throw new BillingError('user_cancelled', 'Purchase was cancelled');
    }
    throw new BillingError('purchase_error', err.message || String(err));
  }
}

// ── Restore purchases (native only — required by Apple Review) ────────────────
// Returns: { isPro: boolean, plan: string|null, expiresAt: Date|null }
// Same caller guidance as purchasePro: use grantProOptimistic, not refreshProfile.
export async function restorePurchases() {
  if (!isNativePlatform() || !_rcInitialized) {
    throw new BillingError('not_available', 'Restore not available on this platform');
  }
  try {
    const Purchases = await getPurchases();
    const { customerInfo } = await Purchases.restorePurchases();
    const entitlement = parseEntitlement(customerInfo);
    console.log(`[billing] restorePurchases isPro=${entitlement.isPro}`);
    return entitlement;
  } catch (err) {
    if (err instanceof BillingError) throw err;
    throw new BillingError('restore_failed', err.message);
  }
}

// ── Sync RC user identity when Supabase auth changes ─────────────────────────
export async function syncRCUser(userId) {
  if (!isNativePlatform() || !_rcInitialized) return;
  try {
    const Purchases = await getPurchases();
    if (userId) {
      const { customerInfo } = await Purchases.logIn({ appUserID: userId });
      return parseEntitlement(customerInfo);
    } else {
      await Purchases.logOut();
      return { isPro: false, plan: null, expiresAt: null };
    }
  } catch (err) {
    console.warn('[billing] syncRCUser failed:', err.message);
    return null;
  }
}

// ── Parse RC CustomerInfo into a simple entitlement object ────────────────────
// Uses customerInfo.entitlements.active — the RC SDK only places an entitlement
// here when isActive=true (i.e. the subscription has not expired). The SDK
// correctly handles grace periods (billing issues), paused subscriptions, and
// trials — the active map already reflects all of these correctly.
function parseEntitlement(customerInfo) {
  if (!customerInfo) return { isPro: false, plan: null, expiresAt: null };

  const proEnt = customerInfo.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID];
  if (!proEnt) return { isPro: false, plan: null, expiresAt: null };

  const productId = proEnt.productIdentifier ?? '';
  const plan = (productId.includes('yearly') || productId.includes('annual'))
    ? 'yearly'
    : 'monthly';

  const expiresAt = proEnt.expirationDate ? new Date(proEnt.expirationDate) : null;
  return { isPro: true, plan, expiresAt };
}

// ── Reconcile RC entitlement with Supabase on launch/resume ──────────────────
// Call this after initRevenueCat() completes and after any app resume.
// If RC says isPro but Supabase doesn't, apply grantProOptimistic immediately.
// If RC says not Pro, let Supabase remain authoritative (webhook may be delayed
// in the revoke direction too — don't prematurely downgrade).
//
// RULE: RC active entitlement always wins over stale Supabase is_pro=false.
//       Supabase is_pro=true is never overridden by RC alone (only by webhook).
//
// Usage in App.jsx:
//   const rcEnt = await reconcileNativeEntitlement();
//   if (rcEnt?.isPro && !isPro) grantProOptimistic(rcEnt.plan);
export async function reconcileNativeEntitlement() {
  if (!isNativePlatform() || !_rcInitialized) return null;
  return checkNativeEntitlement();
}
