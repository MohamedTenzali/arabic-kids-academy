(function () {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => {
        if (!window.caches) return Promise.resolve();
        return caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      })
      .catch(() => {
        // Debug mode: cache cleanup should never block the page.
      });
  });
})();
