const CACHE = 'wa-ai-v1';
const FILES = [
  '/whatsapp-ai-pwa/',
  '/whatsapp-ai-pwa/index.html',
  '/whatsapp-ai-pwa/key.html',
  '/whatsapp-ai-pwa/app.js',
  '/whatsapp-ai-pwa/key.js',
  '/whatsapp-ai-pwa/style.css',
  '/whatsapp-ai-pwa/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
