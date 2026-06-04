// FixIt Service Worker v1.0
// Provides offline fallback and basic caching

const CACHE_NAME = 'fixit-v1';
const OFFLINE_URL = '/';

// Assets to precache
const PRECACHE = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.png',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Clean old caches
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  // Never cache API calls
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // Cache successful responses for static assets
            if (response.ok && !event.request.url.includes('chrome-extension')) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback: return cached root for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});
