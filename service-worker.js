
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('app').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/app.js'
        ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
