// Minimal offline cache for Tally (PWA-lite). Data is NOT cached here — it
// lives in localStorage. This only makes the app shell load offline / when
// added to the home screen.
const CACHE = 'tally-shell-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  // Network-first, falling back to cache; populate cache on success so the
  // app works offline after the first successful load.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy))
        return res
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match('./index.html')),
      ),
  )
})
