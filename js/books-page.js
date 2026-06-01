const booksGrid = document.querySelector("[data-books-grid]");
const featuredBooks = document.querySelector("[data-featured-books]");
const books = window.arabicoKidsBooks || [];
const bookLeadFormAction = "https://assets.mailerlite.com/jsonp/2393476/forms/188964693741667549/subscribe";
const bookLeadFrameName = "book-lead-mailerlite-frame";
const bookLeadStorageKey = "arabicokidsBookLeads";
let pendingBookRequest = null;
let bookLeadModal = null;
let lastFocusedBookButton = null;
const disposableEmailDomains = new Set([
  "yopmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "temp-mail.org",
  "getnada.com",
  "fakemail.net",
]);

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
  const isAvailable = book.status === "free" && book.downloadId;
  const status = statusLabels[book.status] || book.priceLabel || "Binnenkort";
  const cardClass = options.compact ? "book-card book-card-compact" : "book-card";
  const imageLoading = options.compact ? "eager" : "lazy";
  const buttonText = book.buttonText || "Download PDF";
  const button = isAvailable
    ? `<button class="primary-button book-download" type="button" data-book-title="${escapeHtml(book.title)}" data-book-id="${escapeHtml(book.downloadId)}">
        <span class="book-download-lock" aria-hidden="true">PDF</span>
        <span>${escapeHtml(buttonText)}</span>
        <small>Gratis na bevestiging</small>
      </button>`
    : `<button class="primary-button book-download is-disabled" type="button" disabled>${escapeHtml(book.buttonText || "Binnenkort")}</button>`;

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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getEmailDomain = (value) => value.toLowerCase().split("@").pop() || "";

const isDisposableEmail = (value) => {
  const domain = getEmailDomain(value);
  return Array.from(disposableEmailDomains).some(
    (blockedDomain) => domain === blockedDomain || domain.endsWith(`.${blockedDomain}`),
  );
};

const getStoredBookLeads = () => {
  try {
    const leads = JSON.parse(localStorage.getItem(bookLeadStorageKey) || "[]");
    return Array.isArray(leads) ? leads : [];
  } catch {
    return [];
  }
};

const rememberBookLead = ({ name, email, bookTitle, bookId }) => {
  try {
    const leads = getStoredBookLeads();
    leads.push({
      name,
      email,
      bookTitle,
      bookId,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem(bookLeadStorageKey, JSON.stringify(leads.slice(-20)));
  } catch {
    // The MailerLite submit still runs if local storage is unavailable.
  }
};

const closeBookLeadModal = () => {
  if (!bookLeadModal) return;

  bookLeadModal.hidden = true;
  document.body.classList.remove("book-lead-open");
  const form = bookLeadModal.querySelector("#book-lead-form");
  const submitButton = form?.querySelector("button[type='submit']");

  form?.reset();
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButton.textContent = "Download gratis boek";
  }

  bookLeadModal.querySelector("#book-lead-status").textContent = "";
  bookLeadModal.querySelector("#book-lead-error").textContent = "";
  pendingBookRequest = null;
  lastFocusedBookButton?.focus();
};

const createBookLeadModal = () => {
  if (bookLeadModal) return bookLeadModal;

  const modal = document.createElement("div");
  modal.className = "book-lead-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="book-lead-backdrop" data-book-lead-close></div>
    <section class="book-lead-dialog" role="dialog" aria-modal="true" aria-labelledby="book-lead-title" aria-describedby="book-lead-subtitle">
      <button class="book-lead-close" type="button" data-book-lead-close aria-label="Sluit formulier">x</button>
      <div class="book-lead-header">
        <span class="book-lead-icon" aria-hidden="true">PDF</span>
        <p class="eyebrow">Gratis boek</p>
        <h2 id="book-lead-title">Download gratis boek</h2>
        <p id="book-lead-subtitle">Voer uw naam en e-mailadres in om dit gratis ArabicoKids-boek te downloaden en toekomstige nieuwe werkbladen en updates te ontvangen.</p>
      </div>
      <form class="book-lead-form" id="book-lead-form" novalidate>
        <label for="book-lead-name">Voornaam</label>
        <input id="book-lead-name" name="name" type="text" autocomplete="given-name" required>
        <label for="book-lead-email">E-mailadres</label>
        <input id="book-lead-email" name="email" type="email" autocomplete="email" required>
        <p class="book-lead-error" id="book-lead-error" role="alert"></p>
        <button class="primary-button" type="submit">Download gratis boek</button>
        <p class="book-lead-privacy">Wij sturen geen spam. Alleen nieuwe leerboeken, werkbladen en updates van ArabicoKids.</p>
        <p class="book-lead-status" id="book-lead-status" role="status" aria-live="polite"></p>
      </form>
      <iframe class="book-lead-frame" name="${bookLeadFrameName}" title="MailerLite inschrijving" hidden></iframe>
    </section>
  `;

  document.body.appendChild(modal);
  bookLeadModal = modal;

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-book-lead-close]")) {
      closeBookLeadModal();
    }
  });

  modal.querySelector("#book-lead-form").addEventListener("submit", handleBookLeadSubmit);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && bookLeadModal && !bookLeadModal.hidden) {
      closeBookLeadModal();
    }
  });

  return modal;
};

const openBookLeadModal = ({ bookId, bookTitle, trigger }) => {
  const modal = createBookLeadModal();
  pendingBookRequest = { bookId, bookTitle };
  lastFocusedBookButton = trigger;
  modal.hidden = false;
  document.body.classList.add("book-lead-open");
  modal.querySelector("#book-lead-status").textContent = "";
  modal.querySelector("#book-lead-error").textContent = "";
  modal.querySelector("#book-lead-name").focus();
};

function submitLeadToMailerLite({ name, email, bookTitle, bookId }) {
  const form = document.createElement("form");
  form.action = bookLeadFormAction;
  form.method = "post";
  form.target = bookLeadFrameName;
  form.style.display = "none";
  form.innerHTML = `
    <input type="hidden" name="fields[name]" value="${escapeHtml(name)}">
    <input type="hidden" name="fields[email]" value="${escapeHtml(email)}">
    <input type="hidden" name="fields[book]" value="${escapeHtml(bookTitle)}">
    <input type="hidden" name="fields[book_id]" value="${escapeHtml(bookId)}">
    <input type="hidden" name="ml-submit" value="1">
    <input type="hidden" name="anticsrf" value="true">
  `;
  document.body.appendChild(form);
  form.submit();
  window.setTimeout(() => form.remove(), 1000);
}

function handleBookLeadSubmit(event) {
  event.preventDefault();

  if (!pendingBookRequest) return;

  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const error = form.querySelector("#book-lead-error");
  const status = form.querySelector("#book-lead-status");
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();

  error.textContent = "";
  status.textContent = "";

  if (!name) {
    error.textContent = "Vul je voornaam in.";
    form.elements.name.focus();
    return;
  }

  if (!isValidEmail(email)) {
    error.textContent = "Gebruik een geldig persoonlijk e-mailadres.";
    form.elements.email.focus();
    return;
  }

  if (isDisposableEmail(email)) {
    error.textContent = "Gebruik een geldig persoonlijk e-mailadres.";
    form.elements.email.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButton.textContent = "Versturen...";

  rememberBookLead({
    name,
    email,
    bookTitle: pendingBookRequest.bookTitle,
    bookId: pendingBookRequest.bookId,
  });
  submitLeadToMailerLite({
    name,
    email,
    bookTitle: pendingBookRequest.bookTitle,
    bookId: pendingBookRequest.bookId,
  });
  status.textContent = "Controleer uw e-mail om de download te bevestigen.";

  window.setTimeout(() => {
    submitButton.removeAttribute("aria-busy");
    submitButton.textContent = "Verzonden";
  }, 1600);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".book-download[data-book-id]");

  if (!button || button.disabled) return;

  event.preventDefault();
  openBookLeadModal({
    bookId: button.dataset.bookId,
    bookTitle: button.dataset.bookTitle || "ArabicoKids boek",
    trigger: button,
  });
});
