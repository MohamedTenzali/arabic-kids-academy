(function () {
  const badgeDefinitions = [
    {
      id: "first-step",
      label: "Eerste stap!",
      emoji: "🏅",
      desc: "Je hebt je eerste les voltooid!",
    },
    {
      id: "letter-hero",
      label: "Letter held!",
      emoji: "📖",
      desc: "Je hebt alle 28 letters beluisterd!",
    },
    {
      id: "quiz-champion",
      label: "Quiz kampioen!",
      emoji: "🏆",
      desc: "Je haalde een quiz met 3 sterren!",
    },
    {
      id: "persistent",
      label: "Doorzetter!",
      emoji: "🔥",
      desc: "Je hebt 5 lessen voltooid!",
    },
  ];

  const LISTENED_KEY = "arabicKidsListenedLetters";
  const TOTAL_LETTERS = 28;

  // ── helpers ──────────────────────────────────────────────────────────────

  function getListenedLetterCount() {
    try {
      const value = JSON.parse(localStorage.getItem(LISTENED_KEY) || "[]");
      return Array.isArray(value) ? value.length : 0;
    } catch {
      return 0;
    }
  }

  function getBadgeDef(id) {
    return badgeDefinitions.find((b) => b.id === id);
  }

  function store() {
    return window.progressStore || null;
  }

  // ── badge modal ───────────────────────────────────────────────────────────

  const pendingBadges = [];
  let modalActive = false;

  function closeBadgeModal(overlay) {
    overlay.classList.add("badge-modal-closing");
    setTimeout(() => {
      overlay.remove();
      modalActive = false;
      drainBadgeQueue();
    }, 280);
  }

  function showBadgeModal(badge) {
    const overlay = document.createElement("div");
    overlay.className = "badge-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "badge-modal-title");
    overlay.innerHTML = `
      <div class="badge-modal" role="document">
        <span class="badge-modal-emoji" aria-hidden="true">${badge.emoji}</span>
        <p class="badge-modal-earned">Badge verdiend!</p>
        <h2 class="badge-modal-title" id="badge-modal-title">${badge.label}</h2>
        <p class="badge-modal-desc">${badge.desc}</p>
        <button class="primary-button badge-modal-close" type="button">Super! 🎉</button>
      </div>
    `;
    document.body.append(overlay);

    const modal = overlay.querySelector(".badge-modal");
    const closeBtn = overlay.querySelector(".badge-modal-close");

    // confetti from modal centre
    const motion = window.arabicKidsMotion;
    if (motion) {
      requestAnimationFrame(() => {
        const rect = modal.getBoundingClientRect();
        motion.createBurst({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height * 0.28,
          count: 38,
        });
      });
    }

    const close = () => closeBadgeModal(overlay);

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    function onKey(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", onKey);
      }
    }
    document.addEventListener("keydown", onKey);
    closeBtn.focus();
  }

  function drainBadgeQueue() {
    if (modalActive || pendingBadges.length === 0) return;
    modalActive = true;
    showBadgeModal(pendingBadges.shift());
  }

  function earnAndQueue(badgeId) {
    const s = store();
    if (!s || !s.earnBadge) return;
    const isNew = s.earnBadge(badgeId);
    if (!isNew) return;
    const def = getBadgeDef(badgeId);
    if (def) {
      pendingBadges.push(def);
      setTimeout(drainBadgeQueue, 800);
    }
    renderRoadmapBadges();
  }

  // ── badge checking ────────────────────────────────────────────────────────

  function checkBadges(context) {
    const s = store();
    if (!s) return;
    const total = s.getTotalCompletedSteps ? s.getTotalCompletedSteps() : 0;

    if (total >= 1) earnAndQueue("first-step");
    if (total >= 5) earnAndQueue("persistent");
    if (getListenedLetterCount() >= TOTAL_LETTERS) earnAndQueue("letter-hero");
    if (context && context.stars === 3) earnAndQueue("quiz-champion");
  }

  // ── star animation ────────────────────────────────────────────────────────

  function animateStars(quizCard, starCount) {
    const starsEl = quizCard.querySelector(".quiz-stars");
    if (!starsEl) return;

    const spans = starsEl.querySelectorAll("span[aria-hidden]");
    spans.forEach((span, i) => {
      span.style.display = "inline-block";
      span.style.opacity = "0";

      setTimeout(() => {
        span.style.opacity = "1";
        span.classList.add("reward-star-pop");
        // only pop earned stars with full gold animation
        if (i < starCount) {
          span.style.color = "#ffd166";
        }
      }, i * 300);
    });
  }

  // ── progress bar animation ────────────────────────────────────────────────

  function animateProgressBars() {
    document.querySelectorAll(".progress-bar span, .roadmap-progress-track span").forEach((bar) => {
      const target = bar.style.width;
      if (!target || target === "0%") return;
      bar.style.transition = "none";
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.transition = "width 900ms cubic-bezier(0.22, 1, 0.36, 1)";
          bar.style.width = target;
        });
      });
    });
  }

  // ── roadmap badge display ─────────────────────────────────────────────────

  function renderRoadmapBadges() {
    const container = document.getElementById("roadmap-badges");
    if (!container) return;

    const s = store();
    const earned = (s && s.getEarnedBadges) ? s.getEarnedBadges() : [];

    if (earned.length === 0) {
      container.innerHTML = "";
      return;
    }

    const chips = earned
      .map((id) => {
        const def = getBadgeDef(id);
        if (!def) return "";
        return `<span class="roadmap-badge-chip"><span aria-hidden="true">${def.emoji}</span>${def.label}</span>`;
      })
      .join("");

    container.innerHTML = `
      <p class="roadmap-badges-heading">Jouw badges</p>
      <div class="roadmap-badges-list">${chips}</div>
    `;
  }

  // ── roadmap: update star display after data is ready ─────────────────────

  function refreshRoadmapStars() {
    const s = store();
    if (!s) return;

    document.querySelectorAll("[data-step-stars]").forEach((el) => {
      const { levelId, stepId } = el.dataset;
      const stars = s.getStepStars(levelId, stepId);
      const filled = Array.from({ length: 3 }, (_, i) =>
        `<span aria-hidden="true" style="color:${i < stars ? "#ffd166" : "inherit"}">${i < stars ? "★" : "☆"}</span>`,
      ).join("");
      el.innerHTML = filled;
      el.setAttribute("aria-label", `${stars} van 3 sterren`);
    });
  }

  // ── event listeners ───────────────────────────────────────────────────────

  // fired by app.js after quiz result HTML is set
  window.addEventListener("aka:quiz-complete", (e) => {
    const { stars, target } = e.detail || {};
    const card = (target instanceof Element ? target : null) || document.getElementById("quiz-card");
    if (card) {
      setTimeout(() => animateStars(card, stars || 0), 80);
    }
    checkBadges({ stars });
  });

  // letter-hero: check after each letter tap
  window.addEventListener("aka:letter-tap", () => {
    setTimeout(() => {
      if (getListenedLetterCount() >= TOTAL_LETTERS) earnAndQueue("letter-hero");
    }, 400);
  });

  // general step completion
  window.addEventListener("aka:level-complete", () => {
    setTimeout(() => checkBadges({}), 300);
  });

  // ── init ──────────────────────────────────────────────────────────────────

  function init() {
    animateProgressBars();
    renderRoadmapBadges();
    refreshRoadmapStars();
    // also check on load in case milestones were reached before this page opened
    setTimeout(() => checkBadges({}), 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.arabicKidsRewards = { checkBadges, renderRoadmapBadges };
})();
