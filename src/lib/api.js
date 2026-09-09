// src/lib/api.js — central API routing abstraction
//
// Problem: Capacitor native apps serve bundled web assets from a virtual origin:
//   iOS:     capacitor://localhost
//   Android: http://localhost (Capacitor ≥ 5 on newer devices may use capacitor://)
//
// Relative fetch('/api/diagnose') from that origin resolves to:
//   capacitor://localhost/api/diagnose → no server → network error
//
// Fix: on native, prefix every /api/* call with the production backend URL.
//      On web (browser), use relative paths unchanged — no behavioral difference.
//
// Usage:
//   import { apiFetch } from '../lib/api.js';
//   const res = await apiFetch('/api/diagnose', { method: 'POST', ... });
//
// apiFetch is a drop-in replacement for fetch('/api/...'):
//   - same signature as fetch(url, options)
//   - returns the same Response object
//   - all existing error handling, headers, and body payloads unchanged

import { Capacitor } from '@capacitor/core';

// Production backend — only used as prefix for native builds.
// Web builds continue to use relative paths (the server that serves the HTML
// also serves /api/*, so no prefix is needed or desired).
const PRODUCTION_API_BASE = 'https://www.fixit-app.com';

/**
 * Returns the correct base URL prefix for API calls:
 *   - Native (iOS/Android Capacitor): 'https://www.fixit-app.com'
 *   - Web browser: '' (empty — relative paths work)
 */
export function apiBase() {
  return Capacitor.isNativePlatform() ? PRODUCTION_API_BASE : '';
}

/**
 * Drop-in replacement for fetch('/api/...').
 * Automatically prefixes the production URL on native platforms.
 * Passes all options through unchanged.
 *
 * @param {string} path  Must start with '/api/'
 * @param {RequestInit} [options]  Standard fetch options
 * @returns {Promise<Response>}
 */
export function apiFetch(path, options) {
  return fetch(apiBase() + path, options);
}
