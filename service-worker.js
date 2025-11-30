// service-worker.js
// =====================================
// PWA updates + cache per versie
// =====================================

const APP_VERSION = "1.3.4"; // zelfde versie als in index.html
const CACHE_NAME = "arabic-kids-academy-v-" + APP_VERSION;

// Bestanden die we vooraf cachen (app-shell)
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png"
  // audio-bestanden worden "on demand" gecachet via fetch
];

// Install: cache nieuwe versie en activeer meteen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: oude caches opruimen + controle nemen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("arabic-kids-academy-v-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network First voor app-bestanden, Cache First voor audio
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Voor app-bestanden (HTML, CSS, JS): probeer eerst netwerk
  if (url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/')) {

    event.respondWith(
      fetch(req)
        .then((response) => {
          // Update cache met nieuwe versie
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => {
          // Als netwerk faalt, gebruik cache
          return caches.match(req);
        })
    );
  } else {
    // Voor audio en andere bestanden: cache first
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        });
      })
    );
  }
});

// Bericht van pagina om direct te updaten
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
