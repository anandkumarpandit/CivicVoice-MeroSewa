self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('merosewa-store').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/manifest.json',
      '/favi.png',
      '/favicon.png'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
