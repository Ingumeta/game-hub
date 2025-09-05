const CACHE = 'game-hub-v20';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './games/king-of-tokyo/king-of-tokyo.html',
  './games/king-of-tokyo/king-of-tokyo.css',
  './games/king-of-tokyo/king-of-tokyo.js',
  './games/codenames/codenames.css',
  './games/codenames/codenames.html',
  './games/codenames/codenames.js',
  './games/codenames/words-de.txt',
  './games/codenames/words-en.txt',
  './games/chameleon/chameleon.html',
  './games/chameleon/chameleon.css',
  './games/chameleon/chameleon.js',
  './games/chameleon/categories-de.txt',
  './shared/seed.js',
  './shared/emojis.txt',
  './shared/spinner.css',
  './shared/spinner.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: delete old caches and take control
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) && caches.delete(k)));
    await self.clients.claim();
  })());
});

// Fetch: cache-first for same-origin GET requests; otherwise just pass through
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req))
  );
});