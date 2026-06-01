const booksGrid = document.querySelector("[data-books-grid]");
const featuredBooks = document.querySelector("[data-featured-books]");
const books = window.arabicoKidsBooks || [];

const statusLabels = {
  free: "Gratis",
  paid: "Premium",
  "coming-soon": "Binnenkort",
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char]);

const renderBookCard = (book, options = {}) => {
  const isAvailable = book.status === "free" && book.downloadId && book.mailerLiteFormId && book.formContainerId;
  const status = statusLabels[book.status] || book.priceLabel || "Binnenkort";
  const cardClass = options.compact ? "book-card book-card-compact" : "book-card";
  const imageLoading = options.compact ? "eager" : "lazy";
  const buttonText = book.buttonText || "Download PDF";
  const formId = escapeHtml(book.mailerLiteFormId || "");
  const formTarget = escapeHtml(book.formContainerId || "");
  const button = isAvailable
    ? `<button class="primary-button book-download" type="button" data-book-title="${escapeHtml(book.title)}" data-book-id="${escapeHtml(book.downloadId)}" data-mailerlite-form-id="${formId}" data-form-target="${formTarget}">
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(buttonText)}</span>
        <small>Gratis na e-mailbevestiging</small>
      </button>`
    : `<span class="primary-button book-download">${escapeHtml(book.buttonText || "Binnenkort")}</span>`;

  return `
    <article class="${cardClass}" aria-labelledby="book-title-${escapeHtml(book.id)}">
      <div class="book-cover">
        <img
          class="book-cover-image"
          src="${escapeHtml(book.cover)}"
          alt="Cover van ${escapeHtml(book.title)}"
          width="720"
          height="1018"
          loading="${imageLoading}"
          decoding="async"
        >
      </div>
      <div class="book-copy">
        <div class="book-heading">
          <span class="book-level">${escapeHtml(book.level)}</span>
          <span class="book-price book-status-${escapeHtml(book.status)}">${escapeHtml(status)}</span>
        </div>
        <h2 id="book-title-${escapeHtml(book.id)}">${escapeHtml(book.title)}</h2>
        <p>${escapeHtml(book.description)}</p>
        ${button}
      </div>
    </article>
  `;
};

if (booksGrid) {
  booksGrid.innerHTML = books.map((book) => renderBookCard(book)).join("");
}

if (featuredBooks) {
  featuredBooks.innerHTML = books.slice(0, 2).map((book) => renderBookCard(book, { compact: true })).join("");
}

const formPanels = ["worksheet-form", "book-level1-form", "book-level2-form"];
const thanksPageUrl = new URL("bedankt.html", window.location.href).href;
const blankDocumentUrl = ["about", "blank"].join(":");

const isBlankUrl = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || normalized === blankDocumentUrl;
};

const hideAllMailerLiteForms = () => {
  formPanels.forEach((id) => {
    const panel = document.getElementById(id);
    if (!panel) return;

    panel.hidden = true;
    panel.classList.remove("active");
  });
};

const normalizeMailerLiteForm = (form) => {
  const target = form.getAttribute("target");

  if (target && ["_blank", blankDocumentUrl].includes(target.trim().toLowerCase())) {
    form.removeAttribute("target");
  }

  if (isBlankUrl(form.getAttribute("action"))) {
    form.setAttribute("action", window.location.href);
  }

  form
    .querySelectorAll('input[name*="redirect" i], input[name*="success" i], input[name*="thank" i], input[name*="return" i]')
    .forEach((input) => {
      if (input instanceof HTMLInputElement && isBlankUrl(input.value)) {
        input.value = thanksPageUrl;
      }
    });
};

const normalizeMailerLiteForms = (root = document) => {
  root.querySelectorAll(".book-email-panel form, #worksheet-form form").forEach((form) => {
    if (form instanceof HTMLFormElement) {
      normalizeMailerLiteForm(form);
    }
  });
};

const revealEmailForm = (button) => {
  const formSection = document.getElementById("book-email-section");
  const targetId = button.dataset.formTarget;
  const targetPanel = targetId ? document.getElementById(targetId) : null;

  if (!targetPanel) return;

  hideAllMailerLiteForms();
  if (formSection) formSection.hidden = false;
  targetPanel.hidden = false;
  targetPanel.classList.add("active");
  normalizeMailerLiteForms(targetPanel);
  targetPanel.scrollIntoView({ behavior: "smooth", block: "start" });
};

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest(".book-download[data-mailerlite-form-id][data-form-target]");

  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  revealEmailForm(button);
});

document.addEventListener("submit", (event) => {
  const form = event.target;

  if (!(form instanceof HTMLFormElement) || !form.closest(".book-email-panel, #worksheet-form")) return;

  const hadBlankAction = isBlankUrl(form.getAttribute("action"));

  normalizeMailerLiteForm(form);

  if (hadBlankAction) {
    event.preventDefault();
    window.location.assign(thanksPageUrl);
  }
}, true);

const mailerLiteObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) {
        normalizeMailerLiteForms(node);
      }
    });
  });
});

formPanels.forEach((id) => {
  const panel = document.getElementById(id);
  if (panel) {
    mailerLiteObserver.observe(panel, { childList: true, subtree: true });
  }
});

normalizeMailerLiteForms();
