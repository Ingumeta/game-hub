self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('game-hub-v1').then(cache => {
      return cache.addAll([
        './index.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png',
        './games/king-of-tokyo/king-of-tokyo.html'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});