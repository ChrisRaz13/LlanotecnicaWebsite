// Service Worker for Llanotecnica - Advanced Caching Strategy
// Version 2.4 - Font Optimization Cache Refresh

const CACHE_NAME = 'llanotecnica-v2.4';
const STATIC_CACHE = 'llanotecnica-static-v2.4';
const DYNAMIC_CACHE = 'llanotecnica-dynamic-v2.4';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/assets/photos/background-desktop-1920x1080.webp',
  '/assets/photos/background-mobile-780x1080.webp',
  '/assets/photos/coverphoto.webp',
  '/assets/photos/logo.png',
  '/assets/fonts/Anton-Regular.ttf',
  '/assets/i18n/en.json',
  '/assets/i18n/es.json'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/api/',
  'https://restcountries.com/',
  'https://www.google.com/recaptcha/',
  'https://www.googletagmanager.com/'
];

// Cache-first resources (serve from cache, update in background)
const CACHE_FIRST = [
  '/assets/photos/',
  '/assets/videos/',
  '/assets/compressedvideos/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // COMPLETELY BYPASS service worker for flagcdn.com to fix flag carousel
  if (request.url.includes('flagcdn.com')) {
    // Let the browser handle flagcdn.com requests directly
    return;
  }

  // Network-first strategy for API calls and dynamic content
  if (NETWORK_FIRST.some(pattern => request.url.includes(pattern))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST.some(pattern => request.url.includes(pattern))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for HTML pages
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: cache-first for everything else
  event.respondWith(cacheFirst(request));
});

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return new Response(
        '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then(c => c.put(request, response));
        }
      })
      .catch(() => {}); // Ignore background update errors

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to fetch:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cachedResponse); // Fallback to cache on network error

  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('📡 Performing background sync...');
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('📬 Push notification received:', data);

    const options = {
      body: data.body,
      icon: '/assets/photos/logo.png',
      badge: '/assets/favicon/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.data);
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('🎯 Llanotecnica Service Worker v2.0 loaded successfully');
