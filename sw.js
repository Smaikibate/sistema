// Система – service worker. Bump VERSION on every release.
const VERSION = 'sistema-v1.5.0';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // never touch API/sync calls
  const isPage = req.mode === 'navigate';
  e.respondWith(
    caches.match(isPage ? './index.html' : req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req, isPage ? {} : { cache: 'no-cache' }).then(res => { if (res && res.ok && !isPage) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
