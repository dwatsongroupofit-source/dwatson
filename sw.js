/**
 * D. Watson Chemist & Superstore - Service Worker (v15.7)
 * Customer identity and context sync for Tawk.to live chat
 */

const CACHE_NAME = "dwatson-cache-v15.7";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./departments.html",
  "./branches.html",
  "./prescription.html",
  "./journey.html",
  "./contact.html",
  "./privacy.html",
  "./terms.html",
  "./css/style.css?v=8.6",
  "./css/responsive.css?v=8.1",
  "./js/config.js?v=1.2",
  "./js/data.js?v=8.7",
  "./js/main.js?v=8.9",
  "./assets/images/pwa-icon-192.png",
  "./assets/images/pwa-icon-512.png",
  "./assets/images/pwa-maskable-192.png",
  "./assets/images/pwa-maskable-512.png",
  "./assets/images/apple-touch-icon-180.png",
  "./assets/images/logo-emblem.png",
  "./assets/images/logo.svg",
  "./assets/images/logo-white.svg",
  "./assets/images/logo-official.png",
  "./manifest.json",
  "./favicon.ico"
];

// Install Event - Pre-cache core shell safely
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("D. Watson PWA pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up all stale v1..v7 caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Safe Fallback (Guaranteed to return a valid Response)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Only handle http/https requests belonging to our same origin
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // On localhost, never intercept requests so development server is accessed directly
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful basic responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Safe cache fallback: NEVER return undefined to respondWith!
        try {
          // 1. Exact URL match
          const cached = await caches.match(event.request);
          if (cached) return cached;

          // 2. Match ignoring search query parameters (e.g. ?v=8.0 vs ?v=7.0)
          const cachedNoSearch = await caches.match(event.request, { ignoreSearch: true });
          if (cachedNoSearch) return cachedNoSearch;

          // 3. For navigation or HTML requests, return offline app shell
          const isHtmlRequest = event.request.mode === "navigate" || 
            (event.request.headers && event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html"));

          if (isHtmlRequest) {
            const fallbackShell = await caches.match("./index.html") || 
                                  await caches.match("/index.html") || 
                                  await caches.match("./") ||
                                  await caches.match("/");
            if (fallbackShell) return fallbackShell;
          }
        } catch (cacheErr) {
          console.warn("Service worker cache read error:", cacheErr);
        }

        // 4. Guaranteed fallback Response to avoid TypeError: Failed to convert value to 'Response'
        return new Response("D. Watson Chemist & Superstore - Network connection unavailable.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
        });
      })
  );
});
