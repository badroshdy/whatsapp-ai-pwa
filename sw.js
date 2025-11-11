const CACHE = 'wa-ai-v5';
const FILES = [
  '/whatsapp-ai-pwa/',
  '/whatsapp-ai-pwa/index.html',
  '/whatsapp-ai-pwa/key.html',
  '/whatsapp-ai-pwa/sources.html',
  '/whatsapp-ai-pwa/app.js',
  '/whatsapp-ai-pwa/key.js',
  '/whatsapp-ai-pwa/sources.js',
  '/whatsapp-ai-pwa/style.css',
  '/whatsapp-ai-pwa/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
