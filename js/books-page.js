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

const booksGetPageHref = (path) => (isPagesPath && path.startsWith("pages/") ? path.slice("pages/".length) : path);

const renderBookCard = (book, options = {}) => {
  const status = statusLabels[book.status] || book.priceLabel || "Binnenkort";
  const cardClass = options.compact ? "book-card book-card-compact" : "book-card";
  const imageLoading = options.compact ? "eager" : "lazy";

  // Gebruik MailerLite formulier als mailerliteFormId aanwezig is
  const button = book.mailerliteFormId
    ? `<div class="ml-form-wrapper">
        <p style="font-size:.9rem;color:var(--color-muted);margin:0 0 8px;">✉️ Vul je naam en e-mail in en ontvang de downloadlink gratis:</p>
        <div class="ml-embedded" data-form="${escapeHtml(book.mailerliteFormId)}"></div>
      </div>`
    : book.pdfPath
    ? `<a class="primary-button book-download" href="${escapeHtml(getAssetHref(book.pdfPath))}" download>
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(book.buttonText || "Download PDF")}</span>
        <small>Direct downloaden</small>
      </a>`
    : `<a class="primary-button book-download" href="${escapeHtml(booksGetPageHref("pages/boeken.html"))}">
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(book.buttonText || "Bekijk boeken")}</span>
        <small>Bekijk boeken</small>
      </a>`;

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
  // MailerLite formulieren herladen na dynamisch renderen
  if (window.ml) {
    window.ml("reload");
  }
}

if (featuredBooks) {
  featuredBooks.innerHTML = books.slice(0, 2).map((book) => renderBookCard(book, { compact: true })).join("");
  if (window.ml) {
    window.ml("reload");
  }
}
