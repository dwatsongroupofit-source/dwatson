/**
 * D. Watson Chemist & Superstore - Service Worker
 * Ultra-fast caching & offline resilience for mobile devices
 */

const CACHE_NAME = "dwatson-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/journey.html",
  "/css/style.css?v=5.8",
  "/css/responsive.css?v=5.8",
  "/js/config.js?v=1.1",
  "/js/data.js?v=5.7",
  "/js/main.js?v=5.7",
  "/assets/images/logo-emblem.png"
];

// Install Event - Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for dynamic fresh content
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Handle cross-origin or chrome-extension URLs gracefully
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});
