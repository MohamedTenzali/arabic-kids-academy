(function () {
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

  // ── helpers ────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
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

    if (DEFAULT_REVIEWS.length === 0) {
      wall.innerHTML = `<p class="reviews-empty">Nog geen ervaringen. Wees de eerste!</p>`;
      return;
    }

    wall.innerHTML = DEFAULT_REVIEWS
      .map(
        (r) => `
        <article class="home-review-card" data-review-id="${esc(r.id)}">
          <div class="home-review-avatar" style="background:${r.avatarBg}" aria-hidden="true">${r.avatar}</div>
          <div class="home-review-body">
            <p class="home-review-stars" role="img" aria-label="${r.stars} van 5 sterren">${starsHtml(r.stars)}</p>
            <blockquote class="home-review-text">"${esc(r.text)}"</blockquote>
            <footer class="home-review-meta">
              <p class="home-review-name">${esc(r.name)}</p>
              <time class="home-review-date" datetime="${esc(r.date)}">${timeAgo(r.date)}</time>
            </footer>
          </div>
        </article>
      `,
      )
      .join("");
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

    if (!form) return;

    renderAvatarPicker();
    renderStarPicker();

    textarea?.addEventListener("input", () => {
      if (charLeft) charLeft.textContent = 200 - (textarea.value.length || 0);
    });

    form.addEventListener("submit", async (e) => {
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

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Verzenden…";
      }

      // Remove any previous error
      form.querySelector(".review-error-msg")?.remove();

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: "c1dfef04-ebf7-457f-808d-8e837b280a88",
            subject: "Nieuwe ouderreactie via arabicokids.com",
            naam: name,
            beoordeling: `${selectedStars} sterren`,
            avatar: opt.emoji,
            ervaring: text,
            botcheck: form.querySelector('[name="botcheck"]')?.checked || false,
          }),
        });

        const json = await res.json();

        if (json.success) {
          const wrapper = document.querySelector(".home-review-form-wrapper");
          if (wrapper) {
            wrapper.innerHTML = `<p class="review-success-msg" role="alert">Bedankt! Je reactie wordt beoordeeld en verschijnt binnenkort online 🎉</p>`;
          }
        } else {
          throw new Error(json.message || "Submission failed");
        }
      } catch {
        const errP = document.createElement("p");
        errP.className = "review-error-msg";
        errP.setAttribute("role", "alert");
        errP.textContent = "Er ging iets mis. Probeer het later opnieuw.";
        form.querySelector(".review-form-footer")?.prepend(errP);

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Reactie plaatsen 🎉";
        }
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
