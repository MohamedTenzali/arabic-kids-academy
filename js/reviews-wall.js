(function () {
  const STORAGE_KEY = "arabicKidsUserReviews";

  const DEFAULT_REVIEWS = [
    {
      id: "d1",
      name: "Fatima A.",
      avatar: "👩",
      avatarBg: "linear-gradient(135deg,#6b3bf5,#4db6ff)",
      stars: 5,
      text: "Mijn dochter vraagt zelf elke avond om te oefenen!",
      date: "2026-01-15",
    },
    {
      id: "d2",
      name: "Youssef B.",
      avatar: "👨",
      avatarBg: "linear-gradient(135deg,#ff6fae,#ffc83d)",
      stars: 5,
      text: "Eindelijk een app die écht geschikt is voor jonge kinderen.",
      date: "2026-01-10",
    },
  ];

  const AVATAR_OPTIONS = [
    // Kinderen
    { emoji: "👧",   label: "Meisje",             bg: "linear-gradient(135deg,#6b3bf5,#9f8cff)" },
    { emoji: "👦",   label: "Jongetje",            bg: "linear-gradient(135deg,#4db6ff,#69c9ff)" },
    { emoji: "🧒",   label: "Kind",                bg: "linear-gradient(135deg,#8bc34a,#b4e066)" },
    // Vrouwen
    { emoji: "👩",   label: "Vrouw",               bg: "linear-gradient(135deg,#ff6fae,#ff9fbf)" },
    { emoji: "👩‍🦱", label: "Krullend haar",       bg: "linear-gradient(135deg,#e83a60,#ff6fae)" },
    { emoji: "👩‍🦳", label: "Grijs haar vrouw",    bg: "linear-gradient(135deg,#9b8ea8,#c5b5d5)" },
    { emoji: "🧕",   label: "Hoofddoek",           bg: "linear-gradient(135deg,#12a594,#65d685)" },
    { emoji: "👩🏿", label: "Vrouw donkere huid",  bg: "linear-gradient(135deg,#4d2ac0,#6b3bf5)" },
    // Mannen
    { emoji: "👨",   label: "Man",                 bg: "linear-gradient(135deg,#ffc83d,#ffda80)" },
    { emoji: "🧔",   label: "Man met baard",       bg: "linear-gradient(135deg,#8b5e3c,#c4956a)" },
    { emoji: "👨‍🦲", label: "Kale man",            bg: "linear-gradient(135deg,#4d2ac0,#6b3bf5)" },
    { emoji: "👨‍🦱", label: "Krullend haar man",   bg: "linear-gradient(135deg,#ff9f43,#ffc83d)" },
    { emoji: "👨‍🦳", label: "Grijs haar man",      bg: "linear-gradient(135deg,#667085,#98a2b3)" },
    { emoji: "👨🏿", label: "Man donkere huid",    bg: "linear-gradient(135deg,#12a594,#65d685)" },
    // Overig
    { emoji: "🤓",   label: "Met bril",            bg: "linear-gradient(135deg,#6b3bf5,#4db6ff)" },
    { emoji: "👴",   label: "Opa",                 bg: "linear-gradient(135deg,#667085,#98a2b3)" },
    { emoji: "👵",   label: "Oma",                 bg: "linear-gradient(135deg,#9b8ea8,#c5b5d5)" },
    { emoji: "🧑‍🦲", label: "Kale persoon",        bg: "linear-gradient(135deg,#e83a60,#ff9f43)" },
  ];

  // ── state ──────────────────────────────────────────────────────────────

  let selectedAvatarIndex = 0;
  let selectedStars = 5;
  let editingId = null; // null = add mode, string = edit mode

  // ── helpers ────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  function readReviews() {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  function writeReviews(reviews) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {}
  }

  function getAllReviews() {
    return [...DEFAULT_REVIEWS, ...readReviews()].sort(
      (a, b) => b.date.localeCompare(a.date),
    );
  }

  function isUserReview(id) {
    return String(id).startsWith("u");
  }

  function starsHtml(count, total = 5) {
    return Array.from({ length: total }, (_, i) =>
      `<span aria-hidden="true">${i < count ? "⭐" : "☆"}</span>`,
    ).join("");
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Vandaag";
    if (days === 1) return "Gisteren";
    if (days < 30) return `${days} dagen geleden`;
    const months = Math.floor(days / 30);
    return `${months} maand${months > 1 ? "en" : ""} geleden`;
  }

  // ── wall ───────────────────────────────────────────────────────────────

  function renderWall() {
    const wall = document.getElementById("reviews-wall");
    if (!wall) return;

    const all = getAllReviews();

    if (all.length === 0) {
      wall.innerHTML = `<p class="reviews-empty">Nog geen ervaringen. Wees de eerste!</p>`;
      return;
    }

    wall.innerHTML = all
      .map(
        (r) => `
        <article class="home-review-card${editingId === r.id ? " is-editing" : ""}" data-review-id="${esc(r.id)}">
          <div class="home-review-avatar" style="background:${r.avatarBg}" aria-hidden="true">${r.avatar}</div>
          <div class="home-review-body">
            <p class="home-review-stars" aria-label="${r.stars} van 5 sterren">${starsHtml(r.stars)}</p>
            <blockquote class="home-review-text">"${esc(r.text)}"</blockquote>
            <footer class="home-review-meta">
              <p class="home-review-name">${esc(r.name)}</p>
              <time class="home-review-date" datetime="${esc(r.date)}">${timeAgo(r.date)}</time>
              ${
                isUserReview(r.id)
                  ? `<button class="review-edit-btn" type="button" data-edit-id="${esc(r.id)}" aria-label="Reactie bewerken van ${esc(r.name)}">
                       ✏️ Bewerken
                     </button>`
                  : ""
              }
            </footer>
          </div>
        </article>
      `,
      )
      .join("");

    // Edit button listeners
    wall.querySelectorAll(".review-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => startEdit(btn.dataset.editId));
    });
  }

  // ── edit mode ──────────────────────────────────────────────────────────

  function startEdit(id) {
    const review = readReviews().find((r) => r.id === id);
    if (!review) return;

    editingId = id;

    // Pre-fill form
    const nameInput = document.getElementById("review-name");
    const textarea = document.getElementById("review-text");
    const charLeft = document.getElementById("review-char-left");
    const submitBtn = document.querySelector(".review-submit-btn");
    const cancelBtn = document.getElementById("review-cancel-btn");
    const formTitle = document.querySelector(".home-review-form-title");

    if (nameInput) nameInput.value = review.name;
    if (textarea) {
      textarea.value = review.text;
      if (charLeft) charLeft.textContent = 200 - review.text.length;
    }

    // Avatar: find matching index
    const avatarIdx = AVATAR_OPTIONS.findIndex(
      (o) => o.emoji === review.avatar,
    );
    selectedAvatarIndex = avatarIdx >= 0 ? avatarIdx : 0;
    renderAvatarPicker();

    // Stars
    selectedStars = review.stars;
    paintStars(selectedStars);

    // UI: switch to edit mode
    if (submitBtn) submitBtn.textContent = "Wijziging opslaan ✓";
    if (cancelBtn) cancelBtn.hidden = false;
    if (formTitle) formTitle.dataset.editMode = "true";

    // Highlight editing card
    renderWall();

    // Scroll to form
    document
      .querySelector(".home-review-form-wrapper")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    editingId = null;
    selectedAvatarIndex = 0;
    selectedStars = 5;

    const form = document.getElementById("review-form");
    const charLeft = document.getElementById("review-char-left");
    const submitBtn = document.querySelector(".review-submit-btn");
    const cancelBtn = document.getElementById("review-cancel-btn");
    const formTitle = document.querySelector(".home-review-form-title");

    form?.reset();
    if (charLeft) charLeft.textContent = "200";
    if (submitBtn) submitBtn.textContent = "Reactie plaatsen 🎉";
    if (cancelBtn) cancelBtn.hidden = true;
    if (formTitle) delete formTitle.dataset.editMode;

    renderAvatarPicker();
    renderStarPicker();
    renderWall();
  }

  // ── avatar picker ──────────────────────────────────────────────────────

  function renderAvatarPicker() {
    const container = document.querySelector(".review-avatar-options");
    if (!container) return;

    container.innerHTML = AVATAR_OPTIONS.map(
      (opt, i) => `
      <button
        type="button"
        class="review-avatar-option${i === selectedAvatarIndex ? " is-selected" : ""}"
        data-idx="${i}"
        style="background:${opt.bg}"
        aria-label="${opt.label}"
        aria-pressed="${i === selectedAvatarIndex ? "true" : "false"}"
        title="${opt.label}"
      >${opt.emoji}</button>
    `,
    ).join("");

    // Remove old listener by cloning
    const fresh = container.cloneNode(true);
    container.replaceWith(fresh);

    fresh.addEventListener("click", (e) => {
      const btn = e.target.closest(".review-avatar-option");
      if (!btn) return;
      selectedAvatarIndex = parseInt(btn.dataset.idx, 10);
      fresh.querySelectorAll(".review-avatar-option").forEach((b, i) => {
        b.classList.toggle("is-selected", i === selectedAvatarIndex);
        b.setAttribute("aria-pressed", i === selectedAvatarIndex ? "true" : "false");
      });
    });
  }

  // ── star picker ────────────────────────────────────────────────────────

  function paintStars(n) {
    document.querySelectorAll(".review-star-btn").forEach((btn, i) => {
      const active = i < n;
      btn.textContent = active ? "⭐" : "☆";
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderStarPicker() {
    const container = document.querySelector(".review-stars-picker");
    if (!container) return;

    container.innerHTML = Array.from(
      { length: 5 },
      (_, i) => `
      <button type="button" class="review-star-btn is-active" data-star="${i + 1}"
        aria-label="${i + 1} ster" aria-pressed="true">⭐</button>
    `,
    ).join("");

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".review-star-btn");
      if (!btn) return;
      selectedStars = parseInt(btn.dataset.star, 10);
      paintStars(selectedStars);
    });
  }

  // ── form ───────────────────────────────────────────────────────────────

  function initForm() {
    const form = document.getElementById("review-form");
    const nameInput = document.getElementById("review-name");
    const textarea = document.getElementById("review-text");
    const charLeft = document.getElementById("review-char-left");
    const submitBtn = form?.querySelector(".review-submit-btn");
    const cancelBtn = document.getElementById("review-cancel-btn");

    if (!form) return;

    renderAvatarPicker();
    renderStarPicker();

    textarea?.addEventListener("input", () => {
      if (charLeft) charLeft.textContent = 200 - (textarea.value.length || 0);
    });

    cancelBtn?.addEventListener("click", cancelEdit);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameInput?.value.trim() || "";
      const text = textarea?.value.trim() || "";

      if (!name || !text) {
        const missing = !name ? nameInput : textarea;
        missing?.focus();
        missing?.classList.add("review-input-error");
        setTimeout(() => missing?.classList.remove("review-input-error"), 1800);
        return;
      }

      const opt = AVATAR_OPTIONS[selectedAvatarIndex];
      const reviews = readReviews();

      if (editingId) {
        // ── Update existing review ──
        const idx = reviews.findIndex((r) => r.id === editingId);
        if (idx !== -1) {
          reviews[idx] = {
            ...reviews[idx],
            name: name.slice(0, 40),
            avatar: opt.emoji,
            avatarBg: opt.bg,
            stars: selectedStars,
            text: text.slice(0, 200),
            edited: true,
          };
          writeReviews(reviews);
        }
        editingId = null;

        if (submitBtn) submitBtn.textContent = "Reactie plaatsen 🎉";
        if (cancelBtn) cancelBtn.hidden = true;
        const formTitle = document.querySelector(".home-review-form-title");
        if (formTitle) delete formTitle.dataset.editMode;

        renderWall();
        form.reset();
        selectedAvatarIndex = 0;
        selectedStars = 5;
        if (charLeft) charLeft.textContent = "200";
        renderAvatarPicker();
        renderStarPicker();

        if (submitBtn) {
          const orig = submitBtn.textContent;
          submitBtn.textContent = "Opgeslagen! ✓";
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.textContent = orig;
            submitBtn.disabled = false;
          }, 2200);
        }
      } else {
        // ── Add new review ──
        const review = {
          id: `u${Date.now()}`,
          name: name.slice(0, 40),
          avatar: opt.emoji,
          avatarBg: opt.bg,
          stars: selectedStars,
          text: text.slice(0, 200),
          date: new Date().toISOString().slice(0, 10),
        };
        reviews.push(review);
        writeReviews(reviews);

        renderWall();
        form.reset();
        selectedAvatarIndex = 0;
        selectedStars = 5;
        if (charLeft) charLeft.textContent = "200";
        renderAvatarPicker();
        renderStarPicker();

        if (submitBtn) {
          const orig = submitBtn.textContent;
          submitBtn.textContent = "Geplaatst! 🎉";
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.textContent = orig;
            submitBtn.disabled = false;
          }, 2800);
        }

        document
          .getElementById("reviews-wall")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  // ── init ───────────────────────────────────────────────────────────────

  function init() {
    renderWall();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
