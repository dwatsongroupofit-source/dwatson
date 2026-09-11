/**
 * D. Watson Chemist & Superstore - Service Worker (v30.0)
 * Fix: Handle 308/301/302 redirect responses on navigate requests (mobile white screen fix)
 */

const CACHE_NAME = "dwatson-cache-v30.0";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./departments.html",
  "./departments",
  "./department",
  "./branches.html",
  "./branches",
  "./prescription.html",
  "./prescription",
  "./journey.html",
  "./journey",
  "./contact.html",
  "./contact",
  "./privacy.html",
  "./privacy",
  "./terms.html",
  "./terms",
  "./css/style.css?v=30.0",
  "./css/responsive.css?v=30.0",
  "./js/config.js?v=30.0",
  "./js/data.js?v=30.0",
  "./js/main.js?v=30.0",
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

// Install Event - Pre-cache core shell safely and skip waiting immediately
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

// Activate Event - Clean up all stale caches immediately and take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Redirect Resolution + Safe Offline Fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Only handle http/https requests belonging to our same origin
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Never intercept or cache Admin Studio or API endpoints!
  if (requestUrl.pathname.includes("admin") || requestUrl.pathname.includes("/api/")) {
    return;
  }

  // On localhost, never intercept requests so development server is accessed directly
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    return;
  }

  // ─── NAVIGATION REQUESTS (page loads) ────────────────────────────────────────
  // Key fix: Vercel cleanUrls returns 308 redirects for .html URLs.
  // Passing a redirected response to respondWith() causes mobile browsers to
  // show a white/blank screen. We must follow the redirect ourselves.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((response) => {
        // If Vercel returned a redirect (308/301/302), follow it manually
        if (response.redirected) {
          return fetch(response.url);
        }
        // Cache good 200 responses
        if (response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone).catch(() => {}));
        }
        return response;
      }).catch(async () => {
        // Offline fallback for navigation
        try {
          const cached =
            await caches.match(event.request) ||
            await caches.match(event.request, { ignoreSearch: true }) ||
            await caches.match("./index.html") ||
            await caches.match("/index.html") ||
            await caches.match("./");
          if (cached) return cached;
        } catch (e) {}
        return new Response("D. Watson Chemist & Superstore - Network connection unavailable.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
        });
      })
    );
    return;
  }

  // ─── ASSET REQUESTS (CSS, JS, Images, Fonts) ─────────────────────────────────
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

          // 3. Match normalized clean URL / .html URL / singular alias
          const pathname = requestUrl.pathname;
          if (pathname === "/department" || pathname === "/department.html") {
            const deptMatch = await caches.match("./departments.html", { ignoreSearch: true }) ||
                              await caches.match("/departments.html", { ignoreSearch: true }) ||
                              await caches.match("./departments", { ignoreSearch: true });
            if (deptMatch) return deptMatch;
          }

          if (!pathname.endsWith(".html") && !pathname.includes(".")) {
            const htmlAlt = await caches.match(pathname + ".html", { ignoreSearch: true }) ||
                            await caches.match("." + pathname + ".html", { ignoreSearch: true });
            if (htmlAlt) return htmlAlt;
          } else if (pathname.endsWith(".html")) {
            const cleanAlt = await caches.match(pathname.replace(/\.html$/, ""), { ignoreSearch: true }) ||
                             await caches.match("." + pathname.replace(/\.html$/, ""), { ignoreSearch: true });
            if (cleanAlt) return cleanAlt;
          }

          // 4. For HTML requests, return offline app shell
          const isHtmlRequest = event.request.headers &&
            event.request.headers.get("accept") &&
            event.request.headers.get("accept").includes("text/html");

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

        // Guaranteed fallback Response
        return new Response("D. Watson Chemist & Superstore - Network connection unavailable.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
        });
      })
  );
});
