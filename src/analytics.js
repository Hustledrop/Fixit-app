// analytics.js — Lightweight event tracking wrapper
// Works standalone (console only) until a provider is configured.
// To connect Vercel Analytics: npm install @vercel/analytics, then import { track } from '@vercel/analytics'
// To connect Plausible: set VITE_PLAUSIBLE_DOMAIN env var
// All calls are fire-and-forget and never block the UI.

const IS_DEV = import.meta.env.DEV;

// Internal queue for events before provider loads
let _queue = [];
let _provider = null;

// Call this once when your analytics provider is ready
export function initAnalytics(provider) {
  _provider = provider;
  _queue.forEach(([name, props]) => _provider(name, props));
  _queue = [];
}

export function track(eventName, props = {}) {
  const payload = { ...props, _ts: Date.now(), _v: '1.0' };
  if (IS_DEV) {
    console.debug(`[Analytics] ${eventName}`, payload);
    return;
  }
  try {
    if (_provider) {
      _provider(eventName, payload);
    } else {
      _queue.push([eventName, payload]);
      // Vercel Analytics auto-tracking (if @vercel/analytics is installed)
      if (typeof window !== 'undefined' && window.va) {
        window.va('event', { name: eventName, ...payload });
      }
    }
  } catch (_) { /* never crash on analytics */ }
}

// Pre-defined event helpers for consistent naming
export const Analytics = {
  appOpen:          (lang, cc)         => track('app_open', { lang, cc }),
  langDetected:     (lang, source)     => track('language_detected', { lang, source }),
  diagnosisStarted: (cat, hasPhoto)    => track('diagnosis_started', { cat, has_photo: hasPhoto }),
  diagnosisSuccess: (cat, confidence)  => track('diagnosis_success', { cat, confidence }),
  diagnosisFailed:  (cat, errCode)     => track('diagnosis_failed', { cat, err: errCode }),
  imageUploaded:    (sizeKB)           => track('image_uploaded', { size_kb: sizeKB }),
  limitReached:     ()                 => track('limit_reached'),
  paywallViewed:    ()                 => track('paywall_viewed'),
  nearbyOpened:     (cat)              => track('nearby_opened', { cat }),
  partsOpened:      (cat)              => track('parts_opened', { cat }),
  emergencyOpened:  (key)              => track('emergency_opened', { key }),
  shareClicked:     ()                 => track('share_clicked'),
  loginStarted:     ()                 => track('login_started'),
  signupSuccess:    ()                 => track('signup_success'),
  loginSuccess:     ()                 => track('login_success'),
  logout:           ()                 => track('logout'),
};
