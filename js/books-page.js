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
  const isAvailable = book.status === "free" && book.downloadId && book.mailerLiteFormId;
  const status = statusLabels[book.status] || book.priceLabel || "Binnenkort";
  const cardClass = options.compact ? "book-card book-card-compact" : "book-card";
  const imageLoading = options.compact ? "eager" : "lazy";
  const buttonText = book.buttonText || "Download PDF";
  const formId = escapeHtml(book.mailerLiteFormId || "");
  const button = isAvailable
    ? `<button class="primary-button book-download" type="button" data-book-title="${escapeHtml(book.title)}" data-book-id="${escapeHtml(book.downloadId)}" data-mailerlite-form-id="${formId}" aria-describedby="book-status-${escapeHtml(book.id)}">
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(buttonText)}</span>
        <small>Gratis na e-mailbevestiging</small>
      </button>
      <p class="book-mailerlite-status" id="book-status-${escapeHtml(book.id)}" aria-hidden="true"></p>`
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


const setBookStatus = (button, message, state = "") => {
  const statusId = button.getAttribute("aria-describedby");
  const status = statusId ? document.getElementById(statusId) : null;

  if (!status) return;

  status.textContent = message;
  status.dataset.state = state;
  status.removeAttribute("aria-hidden");
};

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest(".book-download[data-mailerlite-form-id]");

  if (!button) return;

  const formId = button.dataset.mailerliteFormId;

  if (!formId) {
    setBookStatus(button, "Formulier-id ontbreekt. Controleer books-data.js.", "error");
    return;
  }

  if (typeof window.ml !== "function") {
    setBookStatus(button, "MailerLite is nog niet geladen. Herlaad de pagina en probeer opnieuw.", "error");
    return;
  }

  try {
    window.ml("show", formId, true);
    setBookStatus(button, "Formulier geopend. Vul uw e-mailadres in en bevestig via e-mail.", "success");
  } catch (error) {
    console.error("MailerLite formulier kon niet openen:", error);
    setBookStatus(button, "MailerLite formulier kon niet openen. Controleer form-id en script.", "error");
  }
});
