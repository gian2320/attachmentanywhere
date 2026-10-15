// Service Worker for Talk with GI PWA
const CACHE_NAME = 'gi-pwa-v2';
const PRECACHE_ASSETS = [
  './g.portfolio.html',
  './manifest.json',
  './favicon.svg',
  './avatar/frame_48_delay-0.05s.webp',
  './GI.jpg',
  './brandbgrmv.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const path = url.pathname.toLowerCase();

  // CRITICAL: Bypass Service Worker for HTTP Range requests and media files (.mp4, .webm, .mov, .mp3)
  // so HTML5 video streaming functions natively without 206 Partial Content corruption.
  if (
    event.request.headers.has('range') ||
    path.endsWith('.mp4') ||
    path.endsWith('.webm') ||
    path.endsWith('.mov') ||
    path.endsWith('.mp3')
  ) {
    return;
  }

  // Network-first for navigation requests to ensure fresh content
  if (event.request.mode === 'navigate' || path.endsWith('.html') || path === '/' || path === '/gian' || path === '/gi') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('./g.portfolio.html')))
    );
    return;
  }

  // Stale-while-revalidate for static shell assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
