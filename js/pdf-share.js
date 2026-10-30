// iOS standalone PWA: PDFs from our own domain open inside the app without a
// share or back button. Intercept PDF links and offer the native share sheet
// (print / save to Files) instead. Outside the standalone app nothing changes.
(function () {
  const isStandalone =
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

  if (!isStandalone || typeof navigator.canShare !== "function") return;

  const STYLE_ID = "pdf-share-style";
  const STYLES = `
    .pdf-share-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      background: rgba(45, 45, 45, 0.45);
    }
    .pdf-share-sheet {
      inline-size: min(100%, 520px);
      display: grid;
      gap: var(--space-4, 16px);
      padding-block: var(--space-6, 24px) calc(var(--space-6, 24px) + env(safe-area-inset-bottom, 0px));
      padding-inline: var(--space-5, 20px);
      border-start-start-radius: var(--radius-xl, 32px);
      border-start-end-radius: var(--radius-xl, 32px);
      background: var(--color-surface, #ffffff);
      box-shadow: var(--shadow-panel, 0 18px 44px rgba(36, 48, 68, 0.1));
      color: var(--color-text, #2d2d2d);
      text-align: center;
      animation: pdf-share-up 0.25s ease-out;
    }
    .pdf-share-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--color-brand-dark, #4d2ac0);
    }
    .pdf-share-actions {
      display: grid;
      gap: var(--space-3, 12px);
    }
    .pdf-share-actions .primary-button,
    .pdf-share-actions .secondary-button {
      inline-size: 100%;
      min-block-size: 64px;
      min-inline-size: 64px;
      justify-content: center;
      font-size: 1.1rem;
    }
    @keyframes pdf-share-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .pdf-share-sheet { animation: none; }
    }
    /* The display values above (and .primary-button/.secondary-button) override the hidden attribute */
    .pdf-share-backdrop[hidden],
    .pdf-share-actions [hidden] { display: none !important; }
  `;

  let sheet = null;
  let lastTrigger = null;
  let loadController = null;
  let currentFile = null;
  let currentUrl = "";

  const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = STYLES;
    document.head.appendChild(style);
  };

  const buildSheet = () => {
    ensureStyles();
    const backdrop = document.createElement("div");
    backdrop.className = "pdf-share-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <div class="pdf-share-sheet" role="dialog" aria-modal="true" aria-labelledby="pdf-share-title">
        <p class="pdf-share-title" id="pdf-share-title" aria-live="polite">Even laden…</p>
        <div class="pdf-share-actions">
          <button class="primary-button pdf-share-button" type="button" hidden>
            <span aria-hidden="true">🖨️</span> Printen of bewaren
          </button>
          <a class="secondary-button pdf-share-fallback" href="#" target="_blank" rel="noopener noreferrer" data-pdf-share="off" hidden>Open PDF</a>
          <button class="secondary-button pdf-share-close" type="button">Sluiten</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const parts = {
      backdrop,
      dialog: backdrop.querySelector(".pdf-share-sheet"),
      title: backdrop.querySelector(".pdf-share-title"),
      shareButton: backdrop.querySelector(".pdf-share-button"),
      fallback: backdrop.querySelector(".pdf-share-fallback"),
      closeButton: backdrop.querySelector(".pdf-share-close"),
    };

    parts.closeButton.addEventListener("click", closeSheet);
    parts.fallback.addEventListener("click", closeSheet);
    parts.shareButton.addEventListener("click", shareFile);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeSheet();
    });
    backdrop.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key === "Tab") trapFocus(event);
    });

    return parts;
  };

  const trapFocus = (event) => {
    const focusable = [...sheet.dialog.querySelectorAll("button, a[href]")].filter((el) => !el.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const showFallback = (url, message) => {
    sheet.title.textContent = message;
    sheet.shareButton.hidden = true;
    sheet.fallback.href = url;
    sheet.fallback.hidden = false;
    sheet.fallback.focus();
  };

  const getFileName = (link, url) => {
    const fromAttribute = (link.getAttribute("download") || "").trim();
    if (fromAttribute) return fromAttribute;
    const lastSegment = decodeURIComponent(url.pathname.split("/").pop() || "werkblad");
    return lastSegment.replace(/(\.pdf)+$/i, "") + ".pdf";
  };

  const openSheet = (link, url) => {
    if (!sheet) sheet = buildSheet();
    lastTrigger = link;
    currentUrl = url.href;
    currentFile = null;
    if (loadController) loadController.abort();
    loadController = new AbortController();
    const { signal } = loadController;

    sheet.title.textContent = "Even laden…";
    sheet.shareButton.hidden = true;
    sheet.fallback.hidden = true;
    sheet.backdrop.hidden = false;
    sheet.closeButton.focus();

    fetch(url.href, { signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        if (signal.aborted) return;
        const file = new File([blob], getFileName(link, url), { type: "application/pdf" });
        if (!navigator.canShare({ files: [file] })) {
          showFallback(url.href, "Delen lukt hier niet.");
          return;
        }
        currentFile = file;
        sheet.title.textContent = "Klaar! 🎉";
        sheet.shareButton.hidden = false;
        sheet.shareButton.focus();
      })
      .catch((error) => {
        if (signal.aborted || error.name === "AbortError") return;
        showFallback(url.href, "Laden lukte niet.");
      });
  };

  // Must run directly inside the tap: iOS only allows share() after a user gesture.
  function shareFile() {
    if (!currentFile) return;
    navigator
      .share({ files: [currentFile] })
      .then(closeSheet)
      .catch((error) => {
        if (error.name === "AbortError") return;
        showFallback(currentUrl, "Delen lukte niet.");
      });
  }

  function closeSheet() {
    if (!sheet || sheet.backdrop.hidden) return;
    if (loadController) loadController.abort();
    loadController = null;
    currentFile = null;
    sheet.backdrop.hidden = true;
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  // Event delegation: the letter-page Download buttons are rendered later by app.js.
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href$=".pdf"]');
    if (!link || link.dataset.pdfShare === "off") return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    openSheet(link, url);
  });
})();
