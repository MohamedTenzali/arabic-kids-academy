const requestPwaRefresh = (registration) => {
  if (!registration.waiting || pwaRefreshPending) {
    return;
  }

  registration.waiting.postMessage({ type: "SKIP_WAITING" });
};

const pwaUpdateScriptUrl = document.currentScript?.src || new URL("pwa-update.js", window.location.href).href;
let pwaRefreshPending = false;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = new URL("../service-worker.js", pwaUpdateScriptUrl);
    const scope = new URL("../", pwaUpdateScriptUrl);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (pwaRefreshPending) {
        return;
      }

      pwaRefreshPending = true;
      window.location.reload();
    });

    navigator.serviceWorker.register(swUrl, { scope }).then((registration) => {
      if (registration.waiting) {
        requestPwaRefresh(registration);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;

        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            requestPwaRefresh(registration);
          }
        });
      });
    });
  });
}
