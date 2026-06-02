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

const getBookDownloadHref = (book) => {
  if (!book.downloadFile) return "";

  const basePath = window.location.pathname.includes("/pages/") ? "../assets/books/" : "assets/books/";
  return `${basePath}${book.downloadFile}`;
};

const renderBookCard = (book, options = {}) => {
  const isAvailable = book.status === "free" && book.downloadFile;
  const status = statusLabels[book.status] || book.priceLabel || "Binnenkort";
  const cardClass = options.compact ? "book-card book-card-compact" : "book-card";
  const imageLoading = options.compact ? "eager" : "lazy";
  const buttonText = book.buttonText || "Download PDF";
  const downloadHref = escapeHtml(getBookDownloadHref(book));
  const button = isAvailable
    ? `<a class="primary-button book-download" href="${downloadHref}" download>
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(buttonText)}</span>
        <small>Directe PDF-download</small>
      </a>`
    : `<a class="primary-button book-download" href="pages/boeken.html">
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(buttonText)}</span>
        <small>Na e-mailbevestiging</small>
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
}

if (featuredBooks) {
  featuredBooks.innerHTML = books.slice(0, 2).map((book) => renderBookCard(book, { compact: true })).join("");
}
