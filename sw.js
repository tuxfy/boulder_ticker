// WICHTIG: Bei jeder Freigabe die Version hochzählen, damit Clients die neue
// App-Shell laden (alte Caches werden beim Aktivieren gelöscht).
const CACHE = 'bouldering-v7';

// Komplette App-Shell für den Offline-Start. Neue Dateien hier ergänzen!
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './styles/base.css',
  './src/app.js',
  './src/core/router.js',
  './src/core/store.js',
  './src/core/api.js',
  './src/core/audio.js',
  './src/core/text.js',
  './src/views/menu/menu.js',
  './src/views/menu/menu.css',
  './src/views/timer/timer.js',
  './src/views/timer/timer.logic.js',
  './src/views/timer/timer.css',
  './src/views/boulderlog/boulderlog.js',
  './src/views/boulderlog/boulderlog.logic.js',
  './src/views/boulderlog/boulderlog.css',
  './src/views/gym/gym.js',
  './src/views/gym/gym.logic.js',
  './src/views/gym/gym.css',
  './src/views/scanner/scanner.js',
  './src/views/scanner/scanner.css',
  './src/vendor/jsqr.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Cross-Origin (BETA7/Firestore) immer direkt ans Netz — nie cachen.
  if (url.origin !== self.location.origin) return;

  // Navigationen: network-first (frische index.html wenn online), Fallback Cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Statische App-Shell: cache-first, sonst Netz (und nachcachen).
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if (res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return res;
      })
    )
  );
});
