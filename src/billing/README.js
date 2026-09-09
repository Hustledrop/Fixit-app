// src/billing/README.js
// ── FixIt Billing Architecture — IMPLEMENTED ────────────────────────────────
//
// ── Platform routing ────────────────────────────────────────────────────────
//
//   Platform          Payment Provider        Supabase update method
//   ─────────────────────────────────────────────────────────────────────────
//   Web (browser)     Stripe Checkout         api/webhook.js → grantPro()
//   iOS (Capacitor)   Apple IAP via RC        api/revenuecat-webhook.js → grantPro()
//   Android (Cap.)    Google Play via RC      api/revenuecat-webhook.js → grantPro()
//
// ── Source files ─────────────────────────────────────────────────────────────
//
//   src/billing/index.js          Platform-aware billing abstraction (NEW)
//   api/revenuecat-webhook.js     RC webhook → Supabase sync (NEW)
//   api/checkout.js               Stripe web checkout (existing, unchanged)
//   api/webhook.js                Stripe webhook (existing, unchanged)
//   vercel.json                   Added revenuecat-webhook route (updated)
//   src/App.jsx                   startCheckout() now routes by platform (updated)
//
// ── RevenueCat SDK ────────────────────────────────────────────────────────────
//   Package:  @revenuecat/purchases-capacitor@13.5.0
//   Requires: @capacitor/core >= 8.0.0 ✅ (project uses Capacitor 8.5.1)
//
// ── Configuration values needed before going live ───────────────────────────
//   See src/billing/index.js → REVENUECAT_CONFIG for full list:
//
//   1. APPLE_API_KEY   (appl_xxx)  — RevenueCat Dashboard → API keys → iOS key
//   2. GOOGLE_API_KEY  (goog_xxx)  — RevenueCat Dashboard → API keys → Android key
//   3. PRODUCT_IDS.monthly         — App Store Connect product ID
//   4. PRODUCT_IDS.yearly          — App Store Connect product ID
//      Same IDs also configured in Google Play Console and linked in RC Dashboard.
//
//   Vercel environment variables to add:
//   5. REVENUECAT_WEBHOOK_SECRET  — secret token set in RC webhook configuration
//
// ── RevenueCat Dashboard setup checklist ────────────────────────────────────
//   [ ] Create project named "FixIt"
//   [ ] Add iOS app (bundle: com.fixit.app)
//   [ ] Add Android app (package: com.fixit.app)
//   [ ] Create Entitlement: identifier = "pro"
//   [ ] Create Products and link them to the entitlement
//   [ ] Create Offering: identifier = "default" with monthly + annual packages
//   [ ] Add webhook: POST https://www.fixit-app.com/api/revenuecat-webhook
//       Set Authorization token = REVENUECAT_WEBHOOK_SECRET value
//
// ── App Store Connect setup checklist ────────────────────────────────────────
//   [ ] Create In-App Purchase (Auto-Renewable Subscription) for monthly plan
//       Suggested ID: com.fixit.app.pro_monthly
//   [ ] Create In-App Purchase for yearly plan
//       Suggested ID: com.fixit.app.pro_yearly
//   [ ] Create Subscription Group: "FixIt Pro"
//   [ ] Add both products to the group
//   [ ] Add localized names, prices, promotional text
//
// ── Google Play Console setup checklist ─────────────────────────────────────
//   [ ] Create Subscription for monthly plan
//       Suggested ID: com.fixit.app.pro_monthly (match App Store ID if possible)
//   [ ] Create Subscription for yearly plan
//       Suggested ID: com.fixit.app.pro_yearly
//   [ ] Link both products in RevenueCat Dashboard
//
// ── How Pro entitlement works ─────────────────────────────────────────────────
//   1. User taps "Upgrade to Pro" on any platform.
//   2a. Web:    → Stripe Checkout → api/webhook.js → grantPro() in Supabase
//   2b. Native: → RevenueCat SDK → purchasePro() → RC webhook → api/revenuecat-webhook.js → grantPro()
//   3. Both paths write: profiles.is_pro = true, profiles.plan = 'monthly'|'yearly'
//   4. useAuth() reads profiles.is_pro → isPro = true → app unlocks everywhere
//   5. Cancellation/expiry: CANCELLATION sets cancel_at; EXPIRATION calls revokePro()
//
// ── Cross-platform account sync ──────────────────────────────────────────────
//   When Purchases.logIn(supabaseUserId) is called, RC links all purchases on
//   that device to the Supabase user ID. This means:
//   - User subscribes on iPhone → web app immediately shows Pro (via Supabase)
//   - User subscribes on web (Stripe) → mobile app shows Pro (Supabase is_pro=true)
//   - No migration needed for existing Stripe subscribers
//
// ── Restore Purchases (required by Apple) ────────────────────────────────────
//   "Restore Purchases" button shown in Account screen on native only (non-Pro).
//   Calls Purchases.restorePurchases() → RC syncs entitlements → profile refreshed.
//
// ── Existing Stripe users ─────────────────────────────────────────────────────
//   Already Pro in Supabase (profiles.is_pro=true, profiles.plan set).
//   When they log in on mobile, getProfile() returns is_pro=true immediately.
//   No migration or code change needed.
