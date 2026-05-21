(function () {
  const reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  const pagePath = window.location.pathname;
  const contextMessages = {
    home: {
      title: "Welkom!",
      hint: "Kies Beginner en start je Arabische avontuur.",
    },
    roadmap: {
      title: "Goed bezig!",
      hint: "Open een level en verzamel sterren.",
    },
    letters: {
      title: "Luister goed",
      hint: "Tik op een letter om de klank te horen.",
    },
    vowels: {
      title: "Klanken oefenen",
      hint: "Kies een letter en luister rustig mee.",
    },
    quiz: {
      title: "Quiz tijd",
      hint: "Luister en kies het juiste antwoord.",
    },
    success: {
      title: "Super gedaan!",
      hint: "Je hebt een stap gehaald.",
    },
    unlock: {
      title: "Nieuw level open!",
      hint: "Je kunt verder oefenen.",
    },
    correct: {
      title: "Goed zo!",
      hint: "Dat antwoord was helemaal juist.",
    },
    wrong: {
      title: "Bijna!",
      hint: "Luister nog een keer rustig.",
    },
    letter: {
      title: "Mooi!",
      hint: "Luister naar de klank en zeg hem na.",
    },
  };

  const getContext = () => {
    if (pagePath.includes("roadmap")) return "roadmap";
    if (pagePath.includes("quiz")) return "quiz";
    if (pagePath.includes("vowel")) return "vowels";
    if (pagePath.includes("letters")) return "letters";
    return "home";
  };

  const getMotionLayer = () => {
    let layer = document.querySelector("#motion-layer");

    if (!layer) {
      layer = document.createElement("div");
      layer.id = "motion-layer";
      layer.className = "motion-layer";
      layer.setAttribute("aria-hidden", "true");
      document.body.append(layer);
    }

    return layer;
  };

  const mascotSvg = `
    <svg class="mascot-svg" viewBox="0 0 120 120" role="img" aria-label="Vriendelijke leerhulp">
      <g class="mascot-head">
        <path d="M31 74c-10-14-6-38 12-49 17-10 42-5 52 13 10 17 3 42-13 52-17 11-40 4-51-16Z" fill="#12a594"/>
        <path d="M38 78c-8-11-5-30 9-38 13-8 33-4 41 10 8 13 2 33-10 41-14 8-32 3-40-13Z" fill="#65d685"/>
        <path class="mascot-turban" d="M45 32c7-14 26-18 40-8-8-1-15 3-19 10-6 10-16 12-21-2Z" fill="#ffd166"/>
        <circle cx="49" cy="56" r="9" fill="#fff"/>
        <circle cx="76" cy="56" r="9" fill="#fff"/>
        <circle class="mascot-eye" cx="52" cy="58" r="4" fill="#243044"/>
        <circle class="mascot-eye" cx="73" cy="58" r="4" fill="#243044"/>
        <path d="M55 76c6 5 14 5 20 0" fill="none" stroke="#243044" stroke-width="5" stroke-linecap="round"/>
      </g>
      <g class="mascot-book">
        <path d="M19 88h73c5 0 9 4 9 9v8H28c-5 0-9-4-9-9v-8Z" fill="#fff" stroke="#08766f" stroke-width="4"/>
        <path d="M33 92h41" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>
      </g>
      <path class="mascot-star" d="M93 23l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z" fill="#ffd166"/>
    </svg>
  `;

  const renderMascot = (context = getContext()) => {
    let root = document.querySelector("#mascot-root");

    if (!root) {
      root = document.createElement("aside");
      root.id = "mascot-root";
      root.className = "mascot-root";
      document.body.append(root);
    }

    const message = contextMessages[context] || contextMessages.home;
    root.classList.add("mascot-root");
    root.innerHTML = `
      <div class="mascot" data-mascot-context="${context}">
        <div class="mascot-bubble" role="status">
          ${message.title}
          <small>${message.hint}</small>
        </div>
        ${mascotSvg}
      </div>
    `;
  };

  const setMascotMessage = (context) => {
    const root = document.querySelector("#mascot-root");
    const message = contextMessages[context] || contextMessages[getContext()];

    if (!root || !message) return;

    const bubble = root.querySelector(".mascot-bubble");
    if (bubble) {
      bubble.innerHTML = `${message.title}<small>${message.hint}</small>`;
    }
  };

  const playTapAnimation = (element) => {
    if (reduceMotion || !element) return;

    element.classList.remove("is-tapped");
    window.requestAnimationFrame(() => {
      element.classList.add("is-tapped");
      window.setTimeout(() => element.classList.remove("is-tapped"), 260);
    });
  };

  const playSuccessSound = () => {
    if (reduceMotion) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.28);
      gain.connect(audioContext.destination);

      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const osc = audioContext.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequency;
        osc.connect(gain);
        osc.start(audioContext.currentTime + index * 0.06);
        osc.stop(audioContext.currentTime + 0.22 + index * 0.06);
      });

      window.setTimeout(() => audioContext.close(), 520);
    } catch {
      // Sound feedback is optional; visual feedback still works.
    }
  };

  const createBurst = ({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 18 } = {}) => {
    if (reduceMotion) return;

    const layer = getMotionLayer();
    const colors = ["#ffd166", "#12a594", "#69c9ff", "#ff7a90", "#9f8cff", "#65d685"];

    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("span");
      const angle = (Math.PI * 2 * index) / count;
      const distance = 72 + Math.random() * 92;
      const isStar = index % 3 === 0;

      piece.className = isStar ? "star-piece" : "confetti-piece";
      piece.style.setProperty("--x", `${x}px`);
      piece.style.setProperty("--y", `${y}px`);
      piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      piece.style.setProperty("--dy", `${Math.sin(angle) * distance + 28}px`);
      piece.style.setProperty("--rotate", `${Math.round(Math.random() * 220 - 110)}deg`);
      piece.style.setProperty("--size", `${Math.round(7 + Math.random() * 7)}px`);
      piece.style.setProperty("--piece-color", colors[index % colors.length]);
      layer.append(piece);
      window.setTimeout(() => piece.remove(), 1600);
    }
  };

  const showQuizPoppet = ({ target, isCorrect }) => {
    const layer = getMotionLayer();
    const rect = target?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + Math.min(rect.height * 0.35, 84) : window.innerHeight / 2;
    const poppet = document.createElement("div");

    poppet.className = `quiz-poppet ${isCorrect ? "is-happy" : "is-sad"}`;
    poppet.style.setProperty("--x", `${x}px`);
    poppet.style.setProperty("--y", `${y}px`);
    poppet.setAttribute("role", "status");
    poppet.innerHTML = `
      <span class="quiz-poppet-face" aria-hidden="true">
        <span class="quiz-poppet-eye"></span>
        <span class="quiz-poppet-eye"></span>
        <span class="quiz-poppet-mouth"></span>
      </span>
      <strong>${isCorrect ? "Yes!" : "Nog eens"}</strong>
    `;

    layer.append(poppet);
    window.setTimeout(() => poppet.remove(), isCorrect ? 1500 : 1250);
  };

  const animateMascot = () => {
    if (reduceMotion) return;

    const mascot = document.querySelector("#mascot-root .mascot");

    if (!mascot) return;

    mascot.classList.remove("mascot-celebrate");
    window.requestAnimationFrame(() => {
      mascot.classList.add("mascot-celebrate");
      window.setTimeout(() => mascot.classList.remove("mascot-celebrate"), 1100);
    });
  };

  const celebrateSuccess = (detail = {}) => {
    const target = detail.target instanceof Element ? detail.target : document.querySelector(".quiz-card, .roadmap-card, .primary-button");
    const rect = target?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    setMascotMessage(detail.type === "unlock" ? "unlock" : "success");
    animateMascot();
    createBurst({ x, y, count: detail.count || 26 });
    playSuccessSound();
  };

  const addTemporaryClass = (element, className, duration = 620) => {
    if (reduceMotion || !element) return;

    element.classList.remove(className);
    window.requestAnimationFrame(() => {
      element.classList.add(className);
      window.setTimeout(() => element.classList.remove(className), duration);
    });
  };

  const celebrateLetterTap = (detail = {}) => {
    const target = detail.target instanceof Element ? detail.target : null;
    const card = target?.closest(".lesson-card, .sound-letter-card, .letter-card") || target;
    const rect = card?.getBoundingClientRect();

    setMascotMessage("letter");
    animateMascot();
    addTemporaryClass(card, "motion-correct", 920);

    if (rect && !reduceMotion) {
      createBurst({
        x: rect.left + rect.width / 2,
        y: rect.top + Math.min(rect.height * 0.42, 90),
        count: 16,
      });
    }
  };

  const celebrateQuizAnswer = (detail = {}) => {
    const target = detail.target instanceof Element ? detail.target : null;
    const isCorrect = Boolean(detail.isCorrect);

    setMascotMessage(isCorrect ? "correct" : "wrong");
    animateMascot();
    showQuizPoppet({ target, isCorrect });
    addTemporaryClass(target, isCorrect ? "motion-correct" : "motion-wrong", isCorrect ? 980 : 720);

    if (isCorrect) {
      const rect = target?.getBoundingClientRect();

      if (rect) {
        createBurst({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          count: 22,
        });
      }

      return;
    }

    addTemporaryClass(document.querySelector(".quiz-card"), "motion-shake", 720);
  };

  const markUnlockedLevels = () => {
    if (!pagePath.includes("roadmap") || reduceMotion) return;

    const unlocked = [...document.querySelectorAll(".roadmap-item.is-unlocked:not(.is-complete)")];
    unlocked.slice(0, 2).forEach((item, index) => {
      window.setTimeout(() => item.classList.add("motion-unlock"), 120 + index * 140);
    });
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, .primary-button, .secondary-button, .level-card, .lesson-card, .roadmap-link, [data-audio-src]");
    playTapAnimation(target);
  }, { passive: true });

  window.addEventListener("aka:success", (event) => celebrateSuccess(event.detail));
  window.addEventListener("aka:unlock", (event) => celebrateSuccess({ ...event.detail, type: "unlock" }));
  window.addEventListener("aka:letter-tap", (event) => celebrateLetterTap(event.detail));
  window.addEventListener("aka:quiz-answer", (event) => celebrateQuizAnswer(event.detail));
  window.addEventListener("aka:level-complete", (event) => celebrateSuccess({ ...event.detail, type: "success", count: 30 }));

  document.addEventListener("DOMContentLoaded", () => {
    renderMascot();
    markUnlockedLevels();
    document.body.classList.add("fade-in");
  });

  window.arabicKidsMotion = {
    celebrateSuccess,
    createBurst,
    playTapAnimation,
    setMascotMessage,
  };
})();
