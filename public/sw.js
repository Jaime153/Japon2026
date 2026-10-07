const CACHE = 'japon2026-v5';
const RUNTIME_CACHE = 'japon2026-runtime-v1';
const BASE = '/Japon2026/';
const SHELL = [
  BASE,
  BASE + 'hoy/',
  BASE + 'dias/',
  BASE + 'mapas/',
  BASE + 'fotos-tokyo-tower/',
  BASE + 'recomendaciones/',
  BASE + 'info/',
  BASE + 'viaje/viaje-ida/',
  BASE + 'viaje/tokio/',
  BASE + 'viaje/osaka-1/',
  BASE + 'viaje/kyoto/',
  BASE + 'viaje/hiroshima/',
  BASE + 'viaje/osaka-2/',
  BASE + 'manifest.webmanifest',
  BASE + 'icon.svg',
];

const CACHEABLE_EXTERNAL_HOSTS = new Set([
  'unpkg.com',
  'tile.openstreetmap.org',
  'nominatim.openstreetmap.org',
  'routing.openstreetmap.de',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request))
      || (fallbackUrl ? await caches.match(fallbackUrl) : undefined)
      || Response.error();
  }
}

async function runtimeCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const sameOriginTrip = url.origin === self.location.origin && url.pathname.startsWith(BASE);

  if (sameOriginTrip) {
    if (event.request.mode === 'navigate') {
      event.respondWith(networkFirst(event.request, BASE + 'dias/'));
      return;
    }

    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      }),
    );
    return;
  }

  if (CACHEABLE_EXTERNAL_HOSTS.has(url.hostname)) {
    event.respondWith(runtimeCacheFirst(event.request));
  }
});
