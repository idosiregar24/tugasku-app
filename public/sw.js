const CACHE_VERSION = 'v4'
const SHELL_CACHE = `tugasku-shell-${CACHE_VERSION}`
const ASSET_CACHE = `tugasku-assets-${CACHE_VERSION}`
const SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/apple-touch-icon.png',
  '/backgrounds/scene-day-wide.webp',
  '/backgrounds/scene-day-tall.webp',
]
const MAX_ASSET_ENTRIES = 80

// Registered with ?mode=dev from the Vite dev server: caching Vite's
// unbundled modules would serve stale code, so dev only keeps notifications.
const CACHING_ENABLED = new URL(self.location.href).searchParams.get('mode') !== 'dev'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  if (!CACHING_ENABLED) return
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {}))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = CACHING_ENABLED ? [SHELL_CACHE, ASSET_CACHE] : []
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n.startsWith('tugasku-') && !keep.includes(n)).map((n) => caches.delete(n)))
      await self.clients.claim()
    })()
  )
})

async function trimCache(name, max) {
  const cache = await caches.open(name)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}

self.addEventListener('fetch', (event) => {
  if (!CACHING_ENABLED) return
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // Pages: network first so deploys show up immediately, cached shell when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(SHELL_CACHE).then((cache) => cache.put('/', copy))
          }
          return response
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Hashed build assets never change, so cache first
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/backgrounds/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches
                .open(ASSET_CACHE)
                .then((cache) => cache.put(request, copy))
                .then(() => trimCache(ASSET_CACHE, MAX_ASSET_ENTRIES))
            }
            return response
          })
      )
    )
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) return windowClients[0].focus()
      return self.clients.openWindow('/dashboard')
    })
  )
})
