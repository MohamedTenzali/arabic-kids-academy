const CACHE_VERSION = "arabicokids-v52";
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
  "js/arabic-letters-data.js",
  "js/app.js",
  "js/file-operations.js",
  "js/audio-player.js",
  "js/motion.js",
  "js/pwa-update.js",
  "js/quiz-engine.js",
  "pages/about.html",
  "pages/letters.html",
  "pages/letter-forms.html",
  "pages/boeken.html",
  "pages/contact.html",
  "pages/niveaus.html",
  "pages/privacy.html",
  "pages/quiz.html",
  "pages/roadmap.html",
  "pages/sounds.html",
  "pages/vowel-letter.html",
  "pages/vowels.html",
  "pages/werkbladen.html",
  "images/icons/apple-touch-icon.png",
  "images/icons/icon-192.png",
  "images/icons/icon-512.png",
  "images/books/mijn-arabische-letters-boekje.png.png",
  "images/worksheets/worksheet-letters.svg",
  "images/worksheets/worksheet-sounds.svg",
  "images/worksheets/worksheet-words.svg",
  "pdf/worksheets/gratis-letters-placeholder.pdf",
  "pdf/worksheets/niveau-1-placeholder.pdf",
  "pdf/worksheets/niveau-2-placeholder.pdf",
  "pdf/worksheets/niveau-3-placeholder.pdf",
  "pdf/pdf-letters/Ain.pdf.pdf",
  "pdf/pdf-letters/alif.pdf.pdf",
  "pdf/pdf-letters/baa.pdf.pdf",
  "pdf/pdf-letters/Daad.pdf.pdf",
  "pdf/pdf-letters/Dal.pdf.pdf",
  "pdf/pdf-letters/Dhal.pdf.pdf",
  "pdf/pdf-letters/Faa.pdf.pdf",
  "pdf/pdf-letters/Ghain.pdf.pdf",
  "pdf/pdf-letters/Ha.pdf.pdf",
  "pdf/pdf-letters/Haa.pdf.pdf",
  "pdf/pdf-letters/Jeem.pdf.pdf",
  "pdf/pdf-letters/Kaaf.pdf.pdf",
  "pdf/pdf-letters/Khaa.pdf.pdf",
  "pdf/pdf-letters/Laam.pdf.pdf",
  "pdf/pdf-letters/Meem.pdf.pdf",
  "pdf/pdf-letters/Noon.pdf.pdf",
  "pdf/pdf-letters/Qaaf.pdf.pdf",
  "pdf/pdf-letters/Raa.pdf.pdf",
  "pdf/pdf-letters/Saad.pdf.pdf",
  "pdf/pdf-letters/Seen.pdf.pdf",
  "pdf/pdf-letters/Sheen.pdf.pdf",
  "pdf/pdf-letters/taa.pdf.pdf",
  "pdf/pdf-letters/Thaa.pdf.pdf",
  "pdf/pdf-letters/Taa%20zwaar.pdf.pdf",
  "pdf/pdf-letters/Waw.pdf.pdf",
  "docs/letter-worksheets/yaa.pdf",
  "pdf/pdf-letters/Zay.pdf.pdf",
  "pdf/pdf-letters/Zaa%20zwaar.pdf.pdf",
];

const isAudioRequest = (request) => {
  const url = new URL(request.url);
  const audioPath = new URL("audio/", APP_ROOT).pathname;
  return url.pathname.startsWith(audioPath) || request.destination === "audio";
};

const isPdfRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.endsWith(".pdf") || request.destination === "document";
};

const isImageRequest = (request) => {
  return request.destination === "image" || 
         request.url.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i);
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

  // Don't cache audio files - stream them directly
  if (isAudioRequest(request)) {
    return;
  }

  // For PDFs: bypass cache to ensure fresh downloads on iPhone PWA
  if (isPdfRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Return fresh PDF without caching
          return response;
        })
        .catch(() => {
          // Offline fallback - try cache
          return caches.match(request).catch(() => {
            return new Response("PDF not available offline", { status: 503 });
          });
        })
    );
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
