const CACHE_NAME = "arabicokids-v2026-59";
const APP_ROOT = self.registration.scope;
const INDEX_URL = new URL("index.html", APP_ROOT).href;
const CORE_CACHE = [
  "./",
  "index.html",
  "download-book.html",
  "letters.html",
  "klinkers.html",
  "quiz.html",
  "werkbladen.html",
  "about.html",
  "contact.html",
  "css/main.css",
  "css/fonts.css",
  "data/letters.js",
  "data/progress.js",
  "data/vowels.js",
  "js/arabic-letters-data.js",
  "js/app.js",
  "js/file-operations.js",
  "js/audio-player.js",
  "js/motion.js",
  "js/books-data.js",
  "js/books-page.js",
  "js/pwa-update.js",
  "js/quiz-engine.js",
  "js/rewards.js",
  "js/reviews-wall.js",
  "pages/about.html",
  "pages/bedankt.html",
  "pages/boek-niveau-1.html",
  "pages/download-book.html",
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
  "arabisch-leren-kinderen/index.html",
  "arabische-letters-kinderen/index.html",
  "arabisch-oefenen-pdf/index.html",
  "arabische-klanken/index.html",
  "robots.txt",
  "sitemap.xml",
  "/assets/icons/favicon.ico",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "images/icons/back-to-top.png",
  "assets/book-covers/arabicokids-level-1-cover.webp",
  "assets/book-covers/arabicokids-level-2-cover.webp",
  "images/worksheets/worksheet-letters.svg",
  "images/worksheets/worksheet-sounds.svg",
  "images/worksheets/worksheet-words.svg",
  "pdf/worksheets/gratis-letters-placeholder.pdf",
  "pdf/worksheets/niveau-1-placeholder.pdf",
  "pdf/worksheets/niveau-2-placeholder.pdf",
  "pdf/worksheets/niveau-3-placeholder.pdf",
  "pdf/pdf-letters/alif.pdf.pdf",
  "pdf/pdf-letters/baa.pdf.pdf",
  "pdf/pdf-letters/taa.pdf.pdf",
  "pdf/pdf-letters/Thaa.pdf.pdf",
  "pdf/pdf-letters/Jeem.pdf.pdf",
  "pdf/pdf-letters/Haa.pdf.pdf",
  "pdf/pdf-letters/Khaa.pdf.pdf",
  "pdf/pdf-letters/Dal.pdf.pdf",
  "pdf/pdf-letters/Dhal.pdf.pdf",
  "pdf/pdf-letters/Raa.pdf.pdf",
  "pdf/pdf-letters/Zay.pdf.pdf",
  "pdf/pdf-letters/Seen.pdf.pdf",
  "pdf/pdf-letters/Sheen.pdf.pdf",
  "pdf/pdf-letters/Saad.pdf.pdf",
  "pdf/pdf-letters/Daad.pdf.pdf",
  "pdf/pdf-letters/Taa%20zwaar.pdf.pdf",
  "pdf/pdf-letters/Zaa%20zwaar.pdf.pdf",
  "pdf/pdf-letters/Ain.pdf.pdf",
  "pdf/pdf-letters/Ghain.pdf.pdf",
  "pdf/pdf-letters/Faa.pdf.pdf",
  "pdf/pdf-letters/Qaaf.pdf.pdf",
  "pdf/pdf-letters/Kaaf.pdf.pdf",
  "pdf/pdf-letters/Laam.pdf.pdf",
  "pdf/pdf-letters/Meem.pdf.pdf",
  "pdf/pdf-letters/Noon.pdf.pdf",
  "pdf/pdf-letters/Ha.pdf.pdf",
  "pdf/pdf-letters/Waw.pdf.pdf",
  "docs/letter-worksheets/ain.pdf",
  "docs/letter-worksheets/alif.pdf",
  "docs/letter-worksheets/baa.pdf",
  "docs/letter-worksheets/daad.pdf",
  "docs/letter-worksheets/dal.pdf",
  "docs/letter-worksheets/dhal.pdf",
  "docs/letter-worksheets/faa.pdf",
  "docs/letter-worksheets/ghain.pdf",
  "docs/letter-worksheets/ha.pdf",
  "docs/letter-worksheets/haa.pdf",
  "docs/letter-worksheets/jeem.pdf",
  "docs/letter-worksheets/kaaf.pdf",
  "docs/letter-worksheets/khaa.pdf",
  "docs/letter-worksheets/laam.pdf",
  "docs/letter-worksheets/meem.pdf",
  "docs/letter-worksheets/noon.pdf",
  "docs/letter-worksheets/qaaf.pdf",
  "docs/letter-worksheets/raa.pdf",
  "docs/letter-worksheets/saad.pdf",
  "docs/letter-worksheets/seen.pdf",
  "docs/letter-worksheets/sheen.pdf",
  "docs/letter-worksheets/taa.pdf",
  "docs/letter-worksheets/thaa.pdf",
  "docs/letter-worksheets/taa-heavy.pdf",
  "docs/letter-worksheets/waw.pdf",
  "docs/letter-worksheets/yaa.pdf",
  "docs/letter-worksheets/zay.pdf",
  "docs/letter-worksheets/zaa-heavy.pdf",
  "pdf/lettervormen/ain.pdf",
  "pdf/lettervormen/alif.pdf",
  "pdf/lettervormen/baa.pdf",
  "pdf/lettervormen/daad.pdf",
  "pdf/lettervormen/daal.pdf",
  "pdf/lettervormen/dhaal.pdf",
  "pdf/lettervormen/faa.pdf",
  "pdf/lettervormen/ghain.pdf",
  "pdf/lettervormen/ha.pdf",
  "pdf/lettervormen/haa.pdf",
  "pdf/lettervormen/jeem.pdf",
  "pdf/lettervormen/kaaf.pdf",
  "pdf/lettervormen/khaa.pdf",
  "pdf/lettervormen/laam.pdf",
  "pdf/lettervormen/meem.pdf",
  "pdf/lettervormen/noon.pdf",
  "pdf/lettervormen/qaaf.pdf",
  "pdf/lettervormen/raa.pdf",
  "pdf/lettervormen/saad.pdf",
  "pdf/lettervormen/seen.pdf",
  "pdf/lettervormen/sheen.pdf",
  "pdf/lettervormen/taa.pdf",
  "pdf/lettervormen/thaa.pdf",
  "pdf/lettervormen/taa%20zwaar.pdf",
  "pdf/lettervormen/waaw.pdf",
  "pdf/lettervormen/yaa.pdf",
  "pdf/lettervormen/zay.pdf",
  "pdf/lettervormen/zaa%20zwaar.pdf",
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

const getUtf8ContentType = (request, response) => {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  if (request.mode === "navigate" || path.endsWith(".html") || path.endsWith("/")) {
    return "text/html; charset=UTF-8";
  }

  if (path.endsWith(".css")) return "text/css; charset=UTF-8";
  if (path.endsWith(".js")) return "text/javascript; charset=UTF-8";
  if (path.endsWith(".json") || path.endsWith(".webmanifest")) return "application/json; charset=UTF-8";
  if (path.endsWith(".svg")) return "image/svg+xml; charset=UTF-8";
  if (path.endsWith(".txt") || path.endsWith(".xml")) return "text/plain; charset=UTF-8";

  const contentType = response.headers.get("Content-Type") || "";
  if (/^(text\/|application\/(javascript|json|xml))/.test(contentType) && !/charset=/i.test(contentType)) {
    return `${contentType}; charset=UTF-8`;
  }

  return "";
};

const withUtf8Headers = (request, response) => {
  const contentType = getUtf8ContentType(request, response);

  if (!contentType || !response.ok) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Content-Type", contentType);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.allSettled(CORE_CACHE.map((url) => cache.add(url)))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
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

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.pathname.endsWith("/manifest.json") || url.pathname.endsWith("/service-worker.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  // Don't cache audio files - stream them directly
  if (isAudioRequest(request)) {
    return;
  }

  // Cache First for fonts — they are immutable once deployed
  if (request.destination === "font" || url.pathname.startsWith("/fonts/")) {
    event.respondWith(
      caches.open("fonts-v2").then((fontCache) =>
        fontCache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) fontCache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  const isCodeOrStyleRequest = ["script", "style"].includes(request.destination) || /\.(js|css)(\?.*)?$/i.test(url.pathname);

  if (isCodeOrStyleRequest) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const utf8Response = withUtf8Headers(request, response);
          if (utf8Response.ok) {
            const copy = utf8Response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return utf8Response;
        })
        .catch(() => caches.match(request).then((cached) => (cached ? withUtf8Headers(request, cached) : cached))),
    );
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
          const utf8Response = withUtf8Headers(request, response);

          if (utf8Response.ok) {
            const copy = utf8Response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }

          return utf8Response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(INDEX_URL))
            .then((response) => (response ? withUtf8Headers(request, response) : response)),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return withUtf8Headers(request, cached);
      }

      return fetch(request).then((response) => {
        const utf8Response = withUtf8Headers(request, response);

        if (utf8Response.ok) {
          const copy = utf8Response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }

        return utf8Response;
      });
    }),
  );
});
