// VIB3 Service Worker
const CACHE_NAME = 'vib3-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API requests (don't cache dynamic data)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // For navigation requests, try network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(event.request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // For other requests, try cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Update cache in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        });
        return response;
      }

      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'VIB3',
    body: 'You have a new notification',
    type: 'general',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  // Determine icon based on notification type
  let icon = '/vib3-logo.png';
  let actions = [];

  switch (data.type) {
    case 'like':
      actions = [{ action: 'view', title: 'View Video' }];
      break;
    case 'comment':
      actions = [
        { action: 'view', title: 'View' },
        { action: 'reply', title: 'Reply' },
      ];
      break;
    case 'follow':
      actions = [{ action: 'view', title: 'View Profile' }];
      break;
    case 'message':
      actions = [
        { action: 'view', title: 'Open' },
        { action: 'reply', title: 'Reply' },
      ];
      break;
    case 'live':
      actions = [{ action: 'view', title: 'Watch Live' }];
      break;
    case 'mention':
      actions = [{ action: 'view', title: 'View' }];
      break;
  }

  const options = {
    body: data.body,
    icon: icon,
    badge: '/vib3-logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || `vib3-${data.type}-${Date.now()}`,
    requireInteraction: data.type === 'live' || data.type === 'message',
    data: {
      type: data.type,
      url: data.url || '/',
      videoId: data.videoId,
      userId: data.userId,
      conversationId: data.conversationId,
      streamId: data.streamId,
    },
    actions,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action, event.notification.data);
  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || '/';

  // Route based on notification type
  if (data.type === 'like' || data.type === 'comment' || data.type === 'mention') {
    url = data.videoId ? `/video/${data.videoId}` : '/';
    if (data.type === 'comment' && event.action === 'reply') {
      url += '?showComments=true';
    }
  } else if (data.type === 'follow') {
    url = data.userId ? `/profile/${data.userId}` : '/';
  } else if (data.type === 'message') {
    url = data.conversationId ? `/messages/${data.conversationId}` : '/messages';
  } else if (data.type === 'live') {
    url = data.streamId ? `/live/${data.streamId}` : '/live';
  }

  // Handle action-specific behavior
  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Send message to client
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data,
          });
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  }
  if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  }
});

async function syncLikes() {
  // Get pending likes from IndexedDB and sync with server
  // Implementation would depend on your offline storage strategy
}

async function syncComments() {
  // Get pending comments from IndexedDB and sync with server
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-feed') {
    event.waitUntil(updateFeedCache());
  }
});

async function updateFeedCache() {
  // Fetch latest feed data and cache it
  try {
    const response = await fetch('/api/feed?limit=10');
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/api/feed', response);
    }
  } catch {
    // Ignore errors during background sync
  }
}
