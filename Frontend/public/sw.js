const CACHE_NAME = 'study-sync-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests - network first with cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before using it
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available, otherwise fail
          return caches.match(request);
        })
    );
    return;
  }

  // For other requests, use cache first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // Update cache in background
        fetch(request).then((freshResponse) => {
          if (freshResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, freshResponse.clone());
            });
          }
        });
        return response;
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      });
    }).catch(() => {
      // Return a fallback response if offline
      if (request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});

// Handle background sync for task submission
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      fetch('/api/tasks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      })
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'STUDY_SYNC notification',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: 'study-sync-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('STUDY_SYNC', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
