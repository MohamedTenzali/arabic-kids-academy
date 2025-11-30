// service-worker.js
// =====================================
// PWA updates + cache per versie
// =====================================

const APP_VERSION = "1.3.1"; // zelfde versie als in index.html
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

// Fetch: eerst cache, anders netwerk (en audio mag ook gecachet worden)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Optioneel: audio on-the-fly cachen
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return res;
      });
    })
  );
});

// Bericht van pagina om direct te updaten
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
