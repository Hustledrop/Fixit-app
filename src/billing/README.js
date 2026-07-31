// src/billing/README.js
// ── Mobile Billing Architecture — Preparation (not yet implemented) ────────────
//
// Current: Web only → Stripe
// Future: Web + iOS + Android with a unified Pro account in Supabase
//
// ── Provider mapping ──────────────────────────────────────────────────────────
//
//   Platform          Payment Provider        Supabase update method
//   ─────────────────────────────────────────────────────────────────
//   Web               Stripe                  webhook → grantPro()
//   iOS (App Store)   Apple In-App Purchase   RevenueCat webhook → grantPro()
//   Android (Play)    Google Play Billing     RevenueCat webhook → grantPro()
//
// ── Architecture ──────────────────────────────────────────────────────────────
//
// All three providers activate the SAME Supabase Pro account:
//   profiles.is_pro = true
//   profiles.plan   = 'monthly' | 'yearly'
//
// Cross-platform sync: use RevenueCat (revenuecat.com) as the entitlement layer.
//   - RevenueCat abstracts Apple/Google/Stripe billing
//   - It fires a webhook to your server when any subscription changes
//   - Your server calls grantPro() or revokePro() identically to how Stripe does now
//   - A user subscribed on iOS who logs into the web app immediately has Pro
//
// ── Restore purchases ─────────────────────────────────────────────────────────
// RevenueCat SDK provides: Purchases.shared.restoreTransactions()
// After restore, the RevenueCat server updates entitlements → fires your webhook
// → grantPro() runs → user is immediately Pro in Supabase
//
// ── Existing Stripe users ─────────────────────────────────────────────────────
// Stripe users are already Pro in Supabase (profiles.is_pro=true).
// When they log into a mobile app, getProfile() returns is_pro=true immediately.
// No migration needed.
//
// ── Server changes needed when implementing ───────────────────────────────────
// 1. Add /api/revenuecat-webhook endpoint (similar to /api/webhook)
// 2. Verify RevenueCat webhook signature
// 3. Map RevenueCat event types to grantPro() / revokePro() calls
// 4. Add 'apple' | 'google' | 'stripe' to profiles.billing_provider (optional)
//
// ── No frontend changes needed ────────────────────────────────────────────────
// The frontend already reads is_pro from Supabase.
// It doesn't need to know which payment provider was used.
