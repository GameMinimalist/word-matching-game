/* Simple offline-first service worker for Feed.
 *
 * Strategy:
 *  - On install, pre-cache the app shell (index.html).
 *  - Navigation requests: network-first, fall back to cached index.html
 *    (so the installed app opens offline straight to the feed).
 *  - Other same-origin GETs (hashed JS/CSS, icons, cards.json): stale-while-
 *    revalidate — serve from cache instantly, refresh in the background.
 *
 * The cache name carries a version; bump BUILD_ID to force clients to drop the
 * old cache on the next visit. Vite fingerprints asset filenames, so stale JS
 * is never served under a new name anyway — this is mostly for index.html.
 */
const BUILD_ID = 'feed-v1'
const CACHE = `feed-cache-${BUILD_ID}`
const APP_SHELL = ['./', './index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // App navigations -> network first, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    )
    return
  }

  // Everything else -> stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
