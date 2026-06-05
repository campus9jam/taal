/**
 * Taal Service Worker
 * Keeps audio playing in the background and enables offline support.
 */
const CACHE_NAME = 'taal-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API/audio, cache-first for shell
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Audio streams: always network (never cache streams)
  if (
    event.request.url.includes('.mp3') ||
    event.request.url.includes('.m4a') ||
    event.request.url.includes('.ogg') ||
    event.request.url.includes('.flac') ||
    url.hostname.includes('streams.') ||
    url.hostname.includes('radio')
  ) {
    // Let the browser handle range requests natively
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
