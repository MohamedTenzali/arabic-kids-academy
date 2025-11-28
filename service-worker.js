const CACHE_NAME = "arabic-kids-cache-v1";

const ASSETS = [
  "index.html",
  "style.css",
  "app.js",
  "manifest.webmanifest",

  // ICONS
  "icons/icon-192.png",
  "icons/icon-512.png",

  // AUDIO MAP (!)
  // Belangrijk: we cachen de hele map
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// FETCH
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
