/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/client" />

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Extend the SW global with the injected precache manifest token
declare const self: ServiceWorkerGlobalScope;

// ── Lifecycle ─────────────────────────────────────────────────────────────────

// Skip the waiting phase immediately when a new SW is installed.
// The UI prompt (UpdatePrompt) is what gates the actual page reload.
self.skipWaiting();
clientsClaim();

// ── Precaching ────────────────────────────────────────────────────────────────

// vite-plugin-pwa replaces this token with the real manifest at build time.
precacheAndRoute(self.__WB_MANIFEST);

// Remove precache entries from previous SW versions
cleanupOutdatedCaches();

// ── Routing strategies ────────────────────────────────────────────────────────

// Navigation: network-first → fall back to precached shell
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigation',
      networkTimeoutSeconds: 3,
    }),
  ),
);

// REST API calls: always try network first, short timeout
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  }),
);

// Images & fonts: serve from cache, revalidate in background
registerRoute(
  ({ request }) =>
    request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries:     60,                   // máximo 60 arquivos em cache
        maxAgeSeconds:  30 * 24 * 60 * 60,   // 30 dias
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ── Push notifications ────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  const data = event.data?.json() as {
    title?: string;
    body?: string;
    tag?: string;
    url?: string;
    icon?: string;
  } | undefined;

  const title = data?.title ?? 'Denúncias Urbanas';
  const options: NotificationOptions = {
    body: data?.body ?? 'Você tem uma nova notificação.',
    icon: data?.icon ?? '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data?.tag ?? 'denuncias-urbanas',
    data: { url: data?.url ?? '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl: string = (event.notification.data as { url?: string })?.url ?? '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus an already-open tab at the target URL if possible
        const existing = clients.find(
          (c) => c.url === targetUrl && 'focus' in c,
        );
        if (existing) return (existing as WindowClient).focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});
