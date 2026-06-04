// FixIt Service Worker — cache version tied to build timestamp
// CACHE_VERSION must change on every deploy to invalidate old cached bundles.
// This version is stamped at build time via the version file.

const CACHE_VERSION = '202606041229';
const CACHE_NAME = 'fixit-' + CACHE_VERSION;

// Only precache static icons/images — NOT the JS bundle or HTML.
// Vite JS bundles have content-hashed filenames and are immutable.
// index.html is fetched fresh on every navigation (network-first).
const PRECACHE_IMMUTABLE = [
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.png',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_IMMUTABLE))
      .then(() => self.skipWaiting())  // activate immediately
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)  // delete ALL old versioned caches
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())  // take control of all open tabs
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;  // never cache API

  const url = new URL(event.request.url);

  // index.html: ALWAYS network-first, never serve stale HTML
  if (url.pathname === '/' || url.pathname === '/index.html' || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh HTML
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/'))  // offline fallback only
    );
    return;
  }

  // Vite JS/CSS bundles: content-hashed filenames → cache-first (immutable)
  // e.g. /assets/index-Bx8xYZ.js
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        }))
    );
    return;
  }

  // Icons, manifest, og-image: cache-first (rarely change)
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          if (response.ok && !event.request.url.includes('chrome-extension')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => undefined)
      )
  );
});
