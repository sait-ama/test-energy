declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (string | { url: string; revision: string })[];
  registration: ServiceWorkerRegistration;
};

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
}

declare global {
  interface ServiceWorkerGlobalScopeEventMap {
    periodicsync: PeriodicSyncEvent;
  }
}

import type { RouteMatchCallback } from 'workbox-core/types';
import { ExpirationPlugin } from 'workbox-expiration';
import type { PrecacheEntry } from 'workbox-precaching';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

const CACHE_NAME = 're-cache-v1';
const PRECACHE_RESOURCES: PrecacheEntry[] = [
  { url: '/favicon.ico', revision: CACHE_NAME },
  { url: '/icons/icon-192x192.png', revision: CACHE_NAME },
  { url: '/icons/icon-512x512.png', revision: CACHE_NAME },
  { url: '/manifest.json', revision: CACHE_NAME },
];

precacheAndRoute([...self.__WB_MANIFEST, ...PRECACHE_RESOURCES]);

const staticAssetsMatcher: RouteMatchCallback = ({ request }) => {
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  );
};

registerRoute(
  staticAssetsMatcher,
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_RESOURCES.map((res) => res.url));
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return null;
          })
          .filter(Boolean) as Promise<boolean>[]
      );
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

const clearOldCaches = async (): Promise<void> => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
  );
};

self.addEventListener('periodicsync', (event: PeriodicSyncEvent) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(clearOldCaches());
  }
});
