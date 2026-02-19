// VIB3 Service Worker
const CACHE_NAME = 'vib3-cache-v1';
const VIDEO_CACHE_NAME = 'vib3-video-cache-v1';
const API_BASE = 'https://api.vib3app.net';
const DB_NAME = 'vib3-offline';
const DB_VERSION = 2;
const STORE_NAME = 'pending-actions';
const VIDEO_STORE_NAME = 'cached-videos';

// CDN domains for video content
const VIDEO_CDN_DOMAINS = ['vz-', '.b-cdn.net', 'bunnycdn', 'pull-zone'];

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
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== VIDEO_CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// GAP-17: Check if URL is a video CDN URL
function isVideoCdnUrl(url) {
  return VIDEO_CDN_DOMAINS.some(domain => url.includes(domain));
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // GAP-17: Intercept video CDN requests — serve cached version when offline
  if (isVideoCdnUrl(event.request.url)) {
    event.respondWith(
      caches.open(VIDEO_CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).catch(() =>
            new Response('', { status: 503, statusText: 'Offline' })
          );
        })
      )
    );
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) return;

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

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
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

// IndexedDB helpers for offline sync
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      // GAP-17: Video cache metadata store
      if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) {
        db.createObjectStore(VIDEO_STORE_NAME, { keyPath: 'videoId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getActionsByType(db, type) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      resolve(request.result.filter((a) => a.type === type));
    };
    request.onerror = () => reject(request.error);
  });
}

function deleteAction(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function syncActionsByType(type) {
  const db = await openDB();
  const actions = await getActionsByType(db, type);

  for (const action of actions) {
    try {
      const url = action.endpoint.startsWith('http') ? action.endpoint : `${API_BASE}${action.endpoint}`;
      const response = await fetch(url, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${action.token}`,
        },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });

      if (response.ok || response.status === 409) {
        await deleteAction(db, action.id);
      }
    } catch (error) {
      console.error(`[SW] Failed to sync ${type} action:`, error);
    }
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
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
  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || '/';

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

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data });
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', () => {});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncActionsByType('like'));
  }
  if (event.tag === 'sync-comments') {
    event.waitUntil(syncActionsByType('comment'));
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-feed') {
    event.waitUntil(updateFeedCache());
  }
});

async function updateFeedCache() {
  try {
    const response = await fetch(`${API_BASE}/feed?limit=10`);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(new Request('/api/feed'), response);
    }
  } catch {
    // Ignore errors during background sync
  }
}

// Handle messages from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // GAP-17: Cache a video for offline playback
  if (event.data.type === 'CACHE_VIDEO') {
    event.waitUntil(cacheVideo(event.data));
  }

  // GAP-17: Remove a cached video
  if (event.data.type === 'REMOVE_VIDEO') {
    event.waitUntil(removeCachedVideo(event.data.videoId, event.data.videoUrl));
  }

  // GAP-17: Get list of cached videos
  if (event.data.type === 'GET_CACHED_VIDEOS') {
    event.waitUntil(
      getCachedVideos().then(videos => {
        event.ports[0].postMessage({ type: 'CACHED_VIDEOS', videos });
      })
    );
  }
});

// GAP-17: Cache a video MP4 for offline playback
async function cacheVideo({ videoId, videoUrl, thumbnailUrl, caption }) {
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);

    // Cache the video file
    const videoResponse = await fetch(videoUrl);
    if (videoResponse.ok) {
      await cache.put(new Request(videoUrl), videoResponse.clone());
    }

    // Cache the thumbnail if provided
    if (thumbnailUrl) {
      try {
        const thumbResponse = await fetch(thumbnailUrl);
        if (thumbResponse.ok) {
          await cache.put(new Request(thumbnailUrl), thumbResponse.clone());
        }
      } catch { /* thumbnail cache is optional */ }
    }

    // Store metadata in IndexedDB
    const db = await openDB();
    const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
    tx.objectStore(VIDEO_STORE_NAME).put({
      videoId,
      videoUrl,
      thumbnailUrl,
      caption,
      cachedAt: new Date().toISOString(),
      size: videoResponse.headers.get('content-length') || 0,
    });

    // Notify all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'VIDEO_CACHED', videoId });
    });
  } catch (error) {
    console.error('[SW] Failed to cache video:', error);
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'VIDEO_CACHE_ERROR', videoId, error: error.message });
    });
  }
}

// GAP-17: Remove a cached video
async function removeCachedVideo(videoId, videoUrl) {
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    if (videoUrl) {
      await cache.delete(new Request(videoUrl));
    }

    const db = await openDB();
    const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
    tx.objectStore(VIDEO_STORE_NAME).delete(videoId);

    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'VIDEO_REMOVED', videoId });
    });
  } catch (error) {
    console.error('[SW] Failed to remove cached video:', error);
  }
}

// GAP-17: Get all cached video metadata
async function getCachedVideos() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readonly');
      const request = tx.objectStore(VIDEO_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}
