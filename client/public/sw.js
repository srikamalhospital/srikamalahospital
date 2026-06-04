const CACHE = 'sk-hospital-v3';
const STATIC_CACHE = 'sk-hospital-static-v3';

const ADMIN_PATHS = ['/6665', '/lab-admin'];

const offlineResponse = () =>
  new Response('Offline — check your connection', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' },
  });

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/logo.png', '/manifest.webmanifest']).catch(() => undefined)
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
    event.respondWith(
      fetch(request).catch(() => offlineResponse())
    );
    return;
  }

  const isNavigate =
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/';

  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname);

  if (isNavigate || (!isStaticAsset && url.origin === self.location.origin)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match('/index.html');
          return shell || offlineResponse();
        })
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
