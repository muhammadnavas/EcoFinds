// Service Worker for EcoFinds Push Notifications
const CACHE_NAME = 'ecofinds-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'EcoFinds',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'ecofinds-notification'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  let url = '/';

  // Handle different actions
  switch (action) {
    case 'view-product':
      if (data.productId) {
        url = `/product/${data.productId}`;
      }
      break;
    case 'add-to-cart':
      if (data.productId) {
        url = `/product/${data.productId}`;
        // Add to cart logic would be handled by the app
      }
      break;
    case 'buy-now':
      if (data.productId) {
        url = `/product/${data.productId}`;
      }
      break;
    case 'track-order':
      if (data.orderId) {
        url = `/orders/${data.orderId}`;
      }
      break;
    case 'view-order':
      if (data.orderId) {
        url = `/orders/${data.orderId}`;
      }
      break;
    case 'reply':
    case 'view-conversation':
      if (data.messageId) {
        url = `/messages`;
      }
      break;
    default:
      // Default action (clicking notification without specific action)
      if (data.productId) {
        url = `/product/${data.productId}`;
      } else if (data.orderId) {
        url = `/orders/${data.orderId}`;
      } else if (data.messageId) {
        url = `/messages`;
      }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate to the target URL
          client.postMessage({ 
            type: 'NAVIGATE', 
            url: url,
            action: action,
            data: data
          });
          return client.focus();
        }
      }

      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + url);
      }
    })
  );
});

// Background sync event (for offline functionality)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      console.log('Background sync triggered')
    );
  }
});

// Periodic background sync (for regular updates)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-background-sync') {
    event.waitUntil(
      // Perform periodic sync operations
      console.log('Periodic background sync triggered')
    );
  }
});

// Message event (for communication with main app)
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(event.data.urls);
        })
      );
      break;
  }
});

// Activate event
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
});

console.log('EcoFinds Service Worker loaded');