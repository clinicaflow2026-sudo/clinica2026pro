// ClinicFlow Pro Service Worker with Full Push Notification & Offline Capabilities
const CACHE_NAME = 'clinicflow-pro-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-192x192.png',
  '/pwa-maskable-512x512.png'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching partial failure, caching individual assets', err);
      });
    })
  );
  self.skipWaiting();
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Interception with Network-First for Navigation & Cache-First for Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // For API or live sync endpoints, do standard network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first with cache fallback for HTML / navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html') || caches.match('/'))
    );
    return;
  }

  // For scripts and styles, use Network-First to ensure fresh code releases
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for images, fonts and static media assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an image, fallback gracefully
          return null;
        });
    })
  );
});

// ---------------------------------------------------------------------------
// PUSH NOTIFICATIONS HANDLER
// Receives remote Web Push notifications even when the app/browser is closed
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'ClinicFlow Pro',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'ClinicFlow Pro - Notificação';
  const options = {
    body: data.body || 'Você possui um novo lembrete clínico ou atualização de consulta.',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/favicon.svg',
    image: data.image || undefined,
    tag: data.tag || 'clinicflow-push-alert',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    timestamp: Date.now(),
    data: {
      url: data.url || (data.data && data.data.url) || '/?view=calendar',
      type: data.type || (data.data && data.data.type) || 'general',
      id: data.id || (data.data && data.data.id) || null,
      ...data.data,
    },
    actions: data.actions || [
      {
        action: 'open',
        title: 'Abrir no App',
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ---------------------------------------------------------------------------
// NOTIFICATION CLICK HANDLER
// Handles user tapping on notification or action buttons
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  if (action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  // Find if a tab/window is already open and focus it, or open a new window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url && client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ---------------------------------------------------------------------------
// NOTIFICATION CLOSE HANDLER
// ---------------------------------------------------------------------------
self.addEventListener('notificationclose', (event) => {
  console.log('Push notification dismissed:', event.notification.tag);
});

// ---------------------------------------------------------------------------
// CLIENT-TO-SERVICE-WORKER COMMUNICATION
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Allow triggering a local push simulation from client
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    self.registration.showNotification(title, options);
  }
});
