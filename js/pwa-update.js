const showPwaUpdateNotice = (registration) => {
  if (document.querySelector(".pwa-update-notice")) {
    return;
  }

  const notice = document.createElement("div");
  notice.className = "pwa-update-notice";
  notice.setAttribute("role", "status");
  notice.innerHTML = `
    <span>Er is een nieuwe versie klaar.</span>
    <button type="button">Vernieuwen</button>
  `;

  notice.querySelector("button").addEventListener("click", () => {
    notice.querySelector("button").disabled = true;
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  });

  document.body.appendChild(notice);
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
        showPwaUpdateNotice(registration);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;

        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            showPwaUpdateNotice(registration);
          }
        });
      });
    });
  });
}
