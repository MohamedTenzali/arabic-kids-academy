const CACHE_VERSION = "arabic-kids-academy-v26";
const APP_ROOT = self.registration.scope;
const INDEX_URL = new URL("index.html", APP_ROOT).href;
const CORE_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "css/main.css",
  "data/letters.js",
  "data/progress.js",
  "data/vowels.js",
  "js/app.js",
  "js/audio-player.js",
  "js/motion.js",
  "js/pwa-update.js",
  "js/quiz-engine.js",
  "pages/letters.html",
  "pages/quiz.html",
  "pages/roadmap.html",
  "pages/sounds.html",
  "pages/vowel-letter.html",
  "pages/vowels.html",
  "images/icons/apple-touch-icon.png",
  "images/icons/icon-192.png",
  "images/icons/icon-512.png",
];

const isAudioRequest = (request) => {
  const url = new URL(request.url);
  const audioPath = new URL("audio/", APP_ROOT).pathname;
  return url.pathname.startsWith(audioPath) || request.destination === "audio";
};

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_CACHE)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (isAudioRequest(request)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(INDEX_URL))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }

        return response;
      });
    }),
  );
});
