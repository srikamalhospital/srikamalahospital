const CACHE = 'sk-hospital-v4';
const STATIC_CACHE = 'sk-hospital-static-v4';
const SPA_SHELL = '/index.html';

const ADMIN_PATHS = ['/6665', '/lab-admin'];

const offlineResponse = () =>
  new Response('Offline — check your connection', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' },
  });

const isNavigationRequest = (request, url) =>
  request.mode === 'navigate' ||
  request.destination === 'document' ||
  url.pathname.endsWith('.html') ||
  (!/\.[a-z0-9]+$/i.test(url.pathname) && url.origin === self.location.origin);

const isStaticAsset = (url) =>
  url.pathname.startsWith('/assets/') ||
  /\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?|webmanifest)$/i.test(url.pathname);

const cacheShell = async (response) => {
  if (!response?.ok) return;
  const copy = response.clone();
  const cache = await caches.open(STATIC_CACHE);
  await cache.put(SPA_SHELL, copy);
  await cache.put('/', copy);
};

const getCachedShell = async () => {
  const cache = await caches.open(STATIC_CACHE);
  return (await cache.match(SPA_SHELL)) || (await cache.match('/'));
};

const fetchShellFromNetwork = async () => {
  try {
    const response = await fetch(SPA_SHELL, { cache: 'no-store' });
    if (response.ok) {
      await cacheShell(response);
      return response.clone();
    }
  } catch {
    /* network unavailable */
  }
  return null;
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([SPA_SHELL, '/', '/logo.png', '/manifest.webmanifest']).catch(() => undefined)
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api') || url.hostname.includes('render.com')) return;

  if (ADMIN_PATHS.includes(url.pathname)) {
    event.respondWith(fetch(request).catch(() => offlineResponse()));
    return;
  }

  if (isNavigationRequest(request, url)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cacheShell(response);
            return response;
          }
        } catch {
          /* fall through to cached shell */
        }

        const cachedShell = await getCachedShell();
        if (cachedShell) return cachedShell;

        const networkShell = await fetchShellFromNetwork();
        if (networkShell) return networkShell;

        return offlineResponse();
      })()
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response?.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
