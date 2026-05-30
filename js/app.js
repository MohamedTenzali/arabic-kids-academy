const levelButtons = document.querySelectorAll("[data-level]");
const selectedLevelText = document.querySelector("#selected-level");
const startLink = document.querySelector(".start-link");
const contactForm = document.querySelector("#contact-form");
const appProgress = window.progressStore;
const appLevels = window.learningLevels || [];
const isPagesPath = window.location.pathname.includes("/pages/");
const getPageHref = (page) => `${isPagesPath ? "" : "pages/"}${page}`;
const levelStartPages = {
  beginner: "letters.html",
  advanced: "vowels.html?type=short&level=advanced",
  expert: "quiz.html?mode=mixed&level=expert",
};
const getLevelStartHref = (levelId) =>
  getPageHref(levelStartPages[levelId] || `roadmap.html?level=${encodeURIComponent(levelId)}`);

document.querySelectorAll(".aka-footer .footer-contact").forEach((footerContact) => {
  if (footerContact.querySelector(".footer-support-inline")) {
    return;
  }

  const support = document.createElement("div");
  support.className = "footer-support-inline";
  support.innerHTML = `
    <p class="footer-support-copy">Help ons gratis lessen en werkbladen maken voor kinderen.</p>
    <a class="support-btn footer-support-btn" href="https://ko-fi.com/arabicokids" target="_blank" rel="noopener noreferrer">
      ☕ Steun ArabicoKids
    </a>
  `;
  footerContact.appendChild(support);
});

if (levelButtons.length && appProgress) {
  const selectedLevelId = appProgress.getSelectedLevel();

  levelButtons.forEach((button) => {
    const level = appProgress.getLevel(button.dataset.level);
    const isLocked = !level || level.locked;
    const isSelected = level?.id === selectedLevelId;

    button.classList.toggle("is-locked", isLocked);
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.setAttribute("aria-disabled", isLocked ? "true" : "false");

    if (isLocked) {
      button.querySelector(".level-route").textContent = "Nog op slot";
      button.setAttribute("aria-label", `Niveau ${level?.name || button.dataset.level} is nog op slot`);
    } else {
      button.setAttribute("aria-label", `Kies niveau ${level.name}`);
    }
  });

  if (selectedLevelId && startLink) {
    const selectedLevel = appProgress.getLevel(selectedLevelId);

    if (selectedLevelText) {
      selectedLevelText.textContent = `Gekozen niveau: ${selectedLevel.name}`;
    }
    startLink.classList.remove("is-disabled");
    startLink.removeAttribute("aria-disabled");
    startLink.href = getLevelStartHref(selectedLevel.id);
  }
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLevelId = button.dataset.level;
    const selectedLevel = appProgress?.getLevel(selectedLevelId);

    if (!selectedLevel || selectedLevel.locked || !appProgress.selectLevel(selectedLevel.id)) {
      if (selectedLevelText) {
        selectedLevelText.textContent = `${selectedLevel?.name || "Dit niveau"} is nog op slot.`;
      }
      return;
    }

    levelButtons.forEach((item) => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });

    if (selectedLevelText) {
      selectedLevelText.textContent = `Gekozen niveau: ${selectedLevel.name}`;
    }

    if (startLink) {
      startLink.classList.remove("is-disabled");
      startLink.removeAttribute("aria-disabled");
      startLink.href = getLevelStartHref(selectedLevel.id);
    }
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "Vraag via ArabicoKids").trim();
    const message = String(formData.get("message") || "").trim();
    const body = [
      `Naam ouder: ${name}`,
      `E-mailadres: ${email}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:info@arabicokids.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const roadmapLevelText = document.querySelector("#roadmap-level");
const roadmapList = document.querySelector("#roadmap-list");
const roadmapProgress = document.querySelector("#roadmap-progress");
const roadmapNextStep = document.querySelector("#roadmap-next-step");

const getSelectedRoadmapLevel = () => {
  const params = new URLSearchParams(window.location.search);
  const selectedLevelId = params.get("level") || "beginner";
  const requestedLevel = appProgress?.getLevel(selectedLevelId);

  return requestedLevel && !requestedLevel.locked ? requestedLevel : appProgress?.getLevel("beginner");
};

if (roadmapList && appProgress) {
  const selectedLevel = getSelectedRoadmapLevel();
  const levelProgress = appProgress.getLevelProgress(selectedLevel.id);
  const nextStep = appProgress.getNextStep(selectedLevel.id);

  if (roadmapLevelText) {
    roadmapLevelText.textContent = "Volg de stappen rustig op volgorde: letters, klanken en quizzen.";
  }

  if (roadmapProgress) {
    roadmapProgress.innerHTML = `
      <span class="roadmap-progress-label">Voortgang</span>
      <strong>${levelProgress.percent}%</strong>
      <p>${levelProgress.completed} van ${levelProgress.total} stappen klaar</p>
      <div
        class="progress-bar roadmap-progress-track"
        role="progressbar"
        aria-label="Voortgang leerroute"
        aria-valuemin="0"
        aria-valuemax="${levelProgress.total}"
        aria-valuenow="${levelProgress.completed}"
        aria-valuetext="${levelProgress.completed} van ${levelProgress.total} stappen klaar"
      >
        <span style="width: ${levelProgress.percent}%"></span>
      </div>
      <p class="roadmap-next-inline">Volgende stap: ${nextStep?.title || "Alles klaar"}</p>
    `;
  }

  if (roadmapNextStep) {
    roadmapNextStep.textContent = nextStep
      ? `Volgende stap: ${nextStep.title}`
      : `Alle stappen van ${selectedLevel.name.toLowerCase()} zijn klaar.`;
  }

  const beginnerItems = selectedLevel.steps
    .map((step, index) => {
      const isComplete = appProgress.isStepComplete(selectedLevel.id, step.id);
      const isUnlocked = appProgress.isStepUnlocked(selectedLevel, index);
      const stars = appProgress.getStepStars(selectedLevel.id, step.id);
      const stateText = isComplete ? "Klaar" : isUnlocked ? "Open" : "Op slot";
      const statusIcon = isComplete ? "OK" : isUnlocked ? "Start" : "Slot";
      const actionText = isComplete ? "Opnieuw oefenen" : isUnlocked ? "Start stap" : "Op slot";
      const stepNumber = step.levelNumber || index + 1;
      const cardContent = `
        <span class="roadmap-node" aria-hidden="true">${stepNumber}</span>
        <span class="roadmap-card-copy">
          <strong>Level ${stepNumber}: ${step.title}</strong>
          <span>${step.description}</span>
        </span>
        <span class="roadmap-card-meta">
          <span class="roadmap-status-chip" aria-label="Status: ${stateText}">
            <span aria-hidden="true">${statusIcon}</span>
            ${stateText}
          </span>
          <span class="star-badge roadmap-stars" aria-label="${stars} van 3 sterren">
            <span aria-hidden="true">${Array.from({ length: 3 }, (_, starIndex) => (starIndex < stars ? "&#9733;" : "&#9734;")).join("")}</span>
          </span>
          <em>${actionText}</em>
        </span>
      `;

      return `
        <li class="roadmap-card roadmap-item roadmap-step-${stepNumber} ${isComplete ? "is-complete" : ""} ${isUnlocked ? "is-unlocked" : "is-locked locked-level"}">
          ${
            isUnlocked
              ? `<a class="roadmap-link" href="${step.href}">${cardContent}</a>`
              : `<div class="roadmap-link" aria-disabled="true">
                  ${cardContent}
                </div>`
          }
        </li>
      `;
    })
    .join("");
  const lockedLevelItems = appLevels
    .map((level) => appProgress.getLevel(level.id))
    .filter((level) => level && level.id !== selectedLevel.id && level.locked)
    .map(
      (level) => `
        <li class="roadmap-card roadmap-item is-locked locked-level">
          <div class="roadmap-link" aria-disabled="true">
            <strong>${level.name}</strong>
            <span>Speel eerst de vorige quiz vrij.</span>
            <em>Op slot</em>
          </div>
        </li>
      `,
    )
    .join("");

  roadmapList.innerHTML = beginnerItems + lockedLevelItems;
}

const appLetters = [...(window.letters || [])].sort((a, b) => a.order - b.order);
const appLetterForms = [...(window.arabicLetterForms || [])].sort((a, b) => a.order - b.order);
const appLetterFormsById =
  window.arabicLetterFormsById || Object.fromEntries(appLetterForms.map((letter) => [letter.id, letter]));
const appVowelTypes = window.vowelTypes || [];
const vowelTypesById = window.vowelTypesById || Object.fromEntries(appVowelTypes.map((vowel) => [vowel.id, vowel]));
const vowelPracticeGroups = {
  short: ["fatha", "kasra", "damma"],
  long: ["aa", "ii", "uu"],
  // TODO: Add tanween ["an", "in", "un"] when audio/data is available.
  all: ["fatha", "kasra", "damma", "aa", "ii", "uu"],
};
const audioPlayer = window.audioPlayer;
const playAudio = window.playAudio || ((src, options = {}) => audioPlayer?.play(src, options.button));
const preloadAudio = window.preloadAudio || (() => false);
const pageParams = new URLSearchParams(window.location.search);
const activeVowelGroup = pageParams.get("type") || document.body.dataset.vowelGroup || null;
const activeLearningLevelId = pageParams.get("level") || appProgress?.getSelectedLevel() || "beginner";
const activeProgressLevelId = appProgress?.getLevel(activeLearningLevelId)?.id || "beginner";

const setText = (selector, text) => {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text;
  }
};

const dispatchAppEvent = (name, detail = {}) => {
  let event;

  if (typeof window.CustomEvent === "function") {
    event = new CustomEvent(name, { detail });
  } else if (typeof document.createEvent === "function") {
    event = document.createEvent("CustomEvent");
    event.initCustomEvent(name, false, false, detail);
  } else {
    return;
  }

  window.dispatchEvent(event);
};

const completeStepWithFeedback = (levelId, stepId, target) => {
  if (!appProgress || !stepId) {
    return false;
  }

  const wasComplete = appProgress.isStepComplete(levelId, stepId);
  appProgress.completeStep(levelId, stepId);

  if (wasComplete) {
    return false;
  }

  dispatchAppEvent("aka:level-complete", {
    levelId,
    stepId,
    target,
  });

  const nextStep = appProgress.getNextStep(levelId);

  if (nextStep) {
    window.setTimeout(() => {
      dispatchAppEvent("aka:unlock", {
        levelId,
        stepId: nextStep.id,
        target,
      });
    }, 520);
  }

  return true;
};

const getLetterName = (letter) => letter.nameDutch || letter.nameNl || letter.id;
const getVowelType = (sound) => vowelTypesById[sound.type] || { nameNl: sound.nameNl || sound.type };
const escapeAttribute = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
const getVowelSounds = (letter, group = "") =>
  appVowelTypes
    .filter((vowel) => !group || vowel.group === group)
    .filter((vowel) => letter.vowelAudio?.[vowel.id])
    .map((vowel) => ({
      type: vowel.id,
      soundNl: vowel.soundNl,
      example: `${letter.arabic}${vowel.mark || ""}`,
      src: letter.vowelAudio[vowel.id],
    }));
const letterWorksheetPaths = {
  ain: "../pdf/pdf-letters/Ain.pdf.pdf",
  alif: "../pdf/pdf-letters/alif.pdf.pdf",
  baa: "../pdf/pdf-letters/baa.pdf.pdf",
  daad: "../pdf/pdf-letters/Daad.pdf.pdf",
  dal: "../pdf/pdf-letters/Dal.pdf.pdf",
  dhal: "../pdf/pdf-letters/Dhal.pdf.pdf",
  faa: "../pdf/pdf-letters/Faa.pdf.pdf",
  ghain: "../pdf/pdf-letters/Ghain.pdf.pdf",
  ha: "../pdf/pdf-letters/Ha.pdf.pdf",
  haa: "../pdf/pdf-letters/Haa.pdf.pdf",
  jeem: "../pdf/pdf-letters/Jeem.pdf.pdf",
  kaaf: "../pdf/pdf-letters/Kaaf.pdf.pdf",
  khaa: "../pdf/pdf-letters/Khaa.pdf.pdf",
  laam: "../pdf/pdf-letters/Laam.pdf.pdf",
  meem: "../pdf/pdf-letters/Meem.pdf.pdf",
  noon: "../pdf/pdf-letters/Noon.pdf.pdf",
  qaaf: "../pdf/pdf-letters/Qaaf.pdf.pdf",
  raa: "../pdf/pdf-letters/Raa.pdf.pdf",
  saad: "../pdf/pdf-letters/Saad.pdf.pdf",
  seen: "../pdf/pdf-letters/Seen.pdf.pdf",
  sheen: "../pdf/pdf-letters/Sheen.pdf.pdf",
  taa: "../pdf/pdf-letters/taa.pdf.pdf",
  thaa: "../pdf/pdf-letters/Thaa.pdf.pdf",
  "taa-heavy": "../pdf/pdf-letters/Taa%20zwaar.pdf.pdf",
  waw: "../pdf/pdf-letters/Waw.pdf.pdf",
  yaa: "../docs/letter-worksheets/yaa.pdf",
  zay: "../pdf/pdf-letters/Zay.pdf.pdf",
  "zaa-heavy": "../pdf/pdf-letters/Zaa%20zwaar.pdf.pdf",
};
const getLetterWorksheetPath = (letter) => letter.worksheetSrc || letterWorksheetPaths[letter.id] || "";
const letterFormWorksheetPaths = {
  ain: "../pdf/lettervormen/ain.pdf",
  alif: "../pdf/lettervormen/alif.pdf",
  baa: "../pdf/lettervormen/baa.pdf",
  daad: "../pdf/lettervormen/daad.pdf",
  dal: "../pdf/lettervormen/daal.pdf",
  dhal: "../pdf/lettervormen/dhaal.pdf",
  faa: "../pdf/lettervormen/faa.pdf",
  ghain: "../pdf/lettervormen/ghain.pdf",
  ha: "../pdf/lettervormen/ha.pdf",
  haa: "../pdf/lettervormen/haa.pdf",
  jeem: "../pdf/lettervormen/jeem.pdf",
  kaaf: "../pdf/lettervormen/kaaf.pdf",
  khaa: "../pdf/lettervormen/khaa.pdf",
  laam: "../pdf/lettervormen/laam.pdf",
  meem: "../pdf/lettervormen/meem.pdf",
  noon: "../pdf/lettervormen/noon.pdf",
  qaaf: "../pdf/lettervormen/qaaf.pdf",
  raa: "../pdf/lettervormen/raa.pdf",
  saad: "../pdf/lettervormen/saad.pdf",
  seen: "../pdf/lettervormen/seen.pdf",
  sheen: "../pdf/lettervormen/sheen.pdf",
  taa: "../pdf/lettervormen/taa.pdf",
  thaa: "../pdf/lettervormen/thaa.pdf",
  "taa-heavy": "../pdf/lettervormen/taa%20zwaar.pdf",
  waw: "../pdf/lettervormen/waaw.pdf",
  yaa: "../pdf/lettervormen/yaa.pdf",
  zay: "../pdf/lettervormen/zay.pdf",
  "zaa-heavy": "../pdf/lettervormen/zaa%20zwaar.pdf",
};
const getLetterFormWorksheetPath = (letter) => letter.formWorksheetSrc || letterFormWorksheetPaths[letter.id] || "";
const listenedLettersStorageKey = "arabicKidsListenedLetters";
const getListenedLetters = () => {
  try {
    const value = JSON.parse(localStorage.getItem(listenedLettersStorageKey) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
};
const saveListenedLetters = (listenedLetters) => {
  try {
    localStorage.setItem(listenedLettersStorageKey, JSON.stringify([...listenedLetters]));
  } catch {
    // Letter progress is helpful, but the page should still work if storage is blocked.
  }
};
const updateLettersProgress = () => {
  const progressText = document.querySelector("#letters-progress-text");
  const progressFill = document.querySelector("#letters-progress-fill");
  const progressMeter = document.querySelector("#letters-progress-meter");
  const progressCta = document.querySelector("#letters-progress-cta");

  if (!progressText || !progressFill || !appLetters.length) {
    return;
  }

  const listenedLetters = getListenedLetters();
  const completedCount = appLetters.filter((letter) => listenedLetters.has(letter.id)).length;
  const percent = Math.round((completedCount / appLetters.length) * 100);

  progressText.textContent =
    completedCount === appLetters.length
      ? `Knap gedaan: je hebt alle ${appLetters.length} letters beluisterd.`
      : `Je hebt ${completedCount} van de ${appLetters.length} letters beluisterd.`;
  progressFill.style.width = `${percent}%`;
  progressMeter?.setAttribute("aria-valuemax", String(appLetters.length));
  progressMeter?.setAttribute("aria-valuenow", String(completedCount));
  progressMeter?.setAttribute("aria-valuetext", `${completedCount} van ${appLetters.length} letters beluisterd`);

  if (progressCta) {
    progressCta.hidden = completedCount !== appLetters.length;
  }

  document.querySelectorAll("[data-letter-id]").forEach((card) => {
    card.classList.toggle("is-complete", listenedLetters.has(card.dataset.letterId));
  });
};
const markLetterListened = (letterId) => {
  if (!letterId) {
    return;
  }

  const listenedLetters = getListenedLetters();
  listenedLetters.add(letterId);
  saveListenedLetters(listenedLetters);
  updateLettersProgress();
};
const practicedVowelsStorageKey = "arabicKidsPracticedVowels";
const getActiveVowelTypes = () => {
  const group = activeVowelGroup && vowelPracticeGroups[activeVowelGroup] ? activeVowelGroup : "all";
  return appVowelTypes.filter((vowel) => vowelPracticeGroups[group].includes(vowel.id));
};
const getPracticedVowels = () => {
  try {
    const value = JSON.parse(localStorage.getItem(practicedVowelsStorageKey) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
};
const savePracticedVowels = (practicedVowels) => {
  try {
    localStorage.setItem(practicedVowelsStorageKey, JSON.stringify([...practicedVowels]));
  } catch {
    // Vowel progress is optional; audio practice should continue without storage.
  }
};
const getVowelPracticeItems = () => {
  const activeTypes = new Set(getActiveVowelTypes().map((vowel) => vowel.id));

  return appLetters.flatMap((letter) =>
    Object.entries(letter.vowelAudio || {})
      .filter(([type]) => activeTypes.has(type))
      .map(([type]) => ({
        key: `${letter.id}:${type}`,
        letterId: letter.id,
        type,
      })),
  );
};
const updateVowelsProgress = () => {
  const progressText = document.querySelector("#vowels-progress-text");
  const progressFill = document.querySelector("#vowels-progress-fill");

  if (!progressText || !progressFill || !appLetters.length) {
    return;
  }

  const practicedVowels = getPracticedVowels();
  const items = getVowelPracticeItems();
  const completedCount = items.filter((item) => practicedVowels.has(item.key)).length;
  const percent = items.length ? Math.round((completedCount / items.length) * 100) : 0;
  const isShortVowels = activeVowelGroup === "short";
  const progressLabel = isShortVowels ? "korte klanken" : "klanken";

  progressText.textContent = `Je hebt ${completedCount} van ${items.length} ${progressLabel} geoefend.`;
  progressFill.style.width = `${percent}%`;

  document.querySelectorAll("[data-vowel-key]").forEach((button) => {
    button.classList.toggle("is-complete", practicedVowels.has(button.dataset.vowelKey));
  });

  document.querySelectorAll("[data-vowel-letter-card]").forEach((card) => {
    const buttons = [...card.querySelectorAll("[data-vowel-key]")];
    const isComplete = buttons.length > 0 && buttons.every((button) => practicedVowels.has(button.dataset.vowelKey));
    card.classList.toggle("is-complete", isComplete);
  });
};
const markVowelPracticed = (vowelKey) => {
  if (!vowelKey) {
    return;
  }

  const practicedVowels = getPracticedVowels();
  practicedVowels.add(vowelKey);
  savePracticedVowels(practicedVowels);
  updateVowelsProgress();

  const feedback = document.querySelector("#vowels-feedback");

  if (feedback) {
    feedback.textContent = "Goed geluisterd!";
  }
};

const renderAudioButton = ({
  src,
  label = "Luister",
  ariaLabel,
  className = "sound-button",
  content,
  attributes = "",
  statusLabel = "",
}) => `
  <button
    class="${className}"
    type="button"
    data-audio-src="${src || ""}"
    aria-label="${escapeAttribute(ariaLabel || label)}"
    ${attributes}
  >
    ${content}
    <span class="sound-status" data-audio-status aria-live="polite">${statusLabel}</span>
  </button>
`;

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-audio-src]");

  if (!button || !audioPlayer) {
    return;
  }

  const playResult = playAudio(button.dataset.audioSrc, { button });

  if (button.closest("#quiz-card")) {
    playResult.then((didPlay) => {
      if (didPlay) {
        button.dispatchEvent(new CustomEvent("aka:quiz-audio-ready", { bubbles: true }));
      }
    });
  }

  if (button.closest(".letter-card, .sound-letter-card")) {
    dispatchAppEvent("aka:letter-tap", {
      target: button,
    });
  }

  const letterCard = button.closest(".letter-card");

  if (letterCard) {
    letterCard.classList.remove("is-tapped");
    void letterCard.offsetWidth;
    letterCard.classList.add("is-tapped");
    playResult.then((didPlay) => {
      if (didPlay) {
        markLetterListened(letterCard.dataset.letterId);
      }
    });
  }

  const vowelKey = button.dataset.vowelKey;

  if (vowelKey) {
    const soundCard = button.closest(".sound-button");
    soundCard?.classList.remove("is-tapped");
    void soundCard?.offsetWidth;
    soundCard?.classList.add("is-tapped", "is-active-sound");
    window.setTimeout(() => soundCard?.classList.remove("is-active-sound"), 900);
    playResult.then((didPlay) => {
      if (didPlay) {
        markVowelPracticed(vowelKey);
      }
    });
  }
});

document.addEventListener("pointerenter", (event) => {
  const button = event.target.closest?.("[data-audio-src]");

  if (button) {
    if (button.closest(".letter-card")) {
      return;
    }

    preloadAudio(button.dataset.audioSrc);
  }
}, true);

document.addEventListener("focusin", (event) => {
  const button = event.target.closest?.("[data-audio-src]");

  if (button) {
    if (button.closest(".letter-card")) {
      return;
    }

    preloadAudio(button.dataset.audioSrc);
  }
});

const lettersGrid = document.querySelector("#letters-grid");

if (lettersGrid && appLetters.length) {
  appProgress?.completeStep("beginner", "letters");

  const letterCards = appLetters
    .slice()
    .sort((firstLetter, secondLetter) => firstLetter.order - secondLetter.order)
    .map((letter) => {
      // TODO: When a new letter is added, add its own worksheet PDF before relying on the fallback link.
      const worksheetPath = getLetterWorksheetPath(letter);
      const letterName = getLetterName(letter);
      const pronunciation = letter.transliteration || letterName.toLowerCase();

      return `
        <article class="lesson-card letter-card" data-letter-id="${escapeAttribute(letter.id)}">
          <span class="letter-complete-badge" aria-label="Beluisterd">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5 12.5l4.2 4L19 7" />
            </svg>
          </span>
          <p class="letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
          <div>
            <h2>${letterName}</h2>
            <p class="letter-meta">Klinkt als: <strong>${pronunciation}</strong></p>
          </div>
          <div class="letter-card-actions">
            ${renderAudioButton({
              src: letter.baseAudio,
              ariaLabel: `Luister naar de letter ${letterName}`,
              className: "sound-button letter-audio-button",
              content: `
                <span class="letter-button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                    <path d="M16 9.5c.8.7 1.3 1.5 1.3 2.5s-.5 1.8-1.3 2.5" />
                    <path d="M18.5 7c1.4 1.3 2.2 3 2.2 5s-.8 3.7-2.2 5" />
                  </svg>
                </span>
                <span class="sound-name">Luister</span>
              `,
            })}
            ${
              worksheetPath
                ? `<a class="sound-button letter-write-button" href="${worksheetPath}" download aria-label="Oefen schrijven met de letter ${letterName}">
                    <span class="letter-button-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M4 20h5l10-10a2.8 2.8 0 0 0-4-4L5 16l-1 4Z" />
                        <path d="M13.5 7.5l3 3" />
                      </svg>
                    </span>
                    <span class="sound-name">Oefen schrijven</span>
                  </a>`
                : `<a class="sound-button letter-write-button" href="werkbladen.html" aria-label="Bekijk schrijfwerkbladen voor de letter ${letterName}">
                    <span class="letter-button-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M4 20h5l10-10a2.8 2.8 0 0 0-4-4L5 16l-1 4Z" />
                        <path d="M13.5 7.5l3 3" />
                      </svg>
                    </span>
                    <span class="sound-name">Oefen schrijven</span>
                  </a>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  lettersGrid.innerHTML = letterCards;
  updateLettersProgress();
}

const letterSoundsIndex = document.querySelector("#letter-sounds-index");

if (letterSoundsIndex && appLetters.length) {
  if (activeVowelGroup === "short") {
    appProgress?.completeStep(activeProgressLevelId, "short-vowels");
  }

  if (activeVowelGroup === "long") {
    appProgress?.completeStep(activeProgressLevelId, "long-vowels");
  }

  const vowelPageNav = document.querySelector("#vowel-page-nav");
  const vowelPageSize = 3;
  const vowelLastPageSize = 4;
  const vowelPageCount = Math.ceil((appLetters.length - vowelLastPageSize) / vowelPageSize) + 1;
  const requestedVowelPage = Number.parseInt(pageParams.get("page") || "1", 10);
  const activeVowelPage = Math.min(
    Math.max(Number.isNaN(requestedVowelPage) ? 1 : requestedVowelPage, 1),
    vowelPageCount,
  );
  const vowelPageStart = activeVowelPage === vowelPageCount
    ? Math.max(0, appLetters.length - vowelLastPageSize)
    : (activeVowelPage - 1) * vowelPageSize;
  const vowelPageEnd = activeVowelPage === vowelPageCount
    ? appLetters.length
    : vowelPageStart + vowelPageSize;
  const visibleVowelLetters = appLetters.slice(vowelPageStart, vowelPageEnd);
  const getVowelPageHref = (pageNumber) => {
    const params = new URLSearchParams();

    if (activeVowelGroup) {
      params.set("type", activeVowelGroup);
    }

    if (activeProgressLevelId) {
      params.set("level", activeProgressLevelId);
    }

    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }

    const query = params.toString();

    return `vowels.html${query ? `?${query}` : ""}`;
  };

  const letterLinks = visibleVowelLetters
    .map((letter) => {
      const sounds = getVowelSounds(letter, activeVowelGroup);
      const detailHref = `vowel-letter.html?letter=${encodeURIComponent(letter.id)}${
        activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""
      }&level=${encodeURIComponent(activeProgressLevelId)}&page=${encodeURIComponent(activeVowelPage)}`;
      const formsHref = `letter-forms.html?letter=${encodeURIComponent(letter.id)}`;
      const formWorksheetPath = getLetterFormWorksheetPath(letter);
      const isShortVowelCard = activeVowelGroup === "short";

      return `
        <article class="lesson-card sound-letter-card" data-vowel-letter-card="${escapeAttribute(letter.id)}">
          <div class="sound-letter-heading">
            <a class="letter-index-symbol" lang="ar" dir="rtl" href="${detailHref}">
              ${letter.arabic}
            </a>
            <div class="sound-letter-copy">
              <h2>${getLetterName(letter)}</h2>
              <p class="letter-meta">${isShortVowelCard ? "Fatha, Kasra en Damma" : `${sounds.length} klanken`}</p>
            </div>
          </div>
          <p class="sound-letter-help">
            ${isShortVowelCard ? "Luister naar de korte a, korte i en korte oe bij deze letter." : "Luister naar elke klank rustig na elkaar."}
          </p>

          <div class="sound-buttons" dir="rtl">
            ${sounds
              .map((sound) => {
                const vowelType = getVowelType(sound);

                return renderAudioButton({
                  src: sound.src,
                  ariaLabel: `Luister naar ${getLetterName(letter)} met ${vowelType.nameNl}`,
                  attributes: `data-vowel-key="${escapeAttribute(`${letter.id}:${sound.type}`)}"`,
                  content: `
                    <span class="sound-complete-badge" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="M5 12.5l4.2 4L19 7" /></svg>
                    </span>
                    <span class="sound-example" lang="ar" dir="rtl">${sound.example}</span>
                    <span class="sound-name">${vowelType.nameNl}</span>
                    <span class="sound-copy">${sound.soundNl}</span>
                    <span class="sound-action-label">Luister</span>
                  `,
                });
              })
              .join("")}
          </div>
          <a class="sound-button forms-link-button" href="${formsHref}" aria-label="Bekijk lettervormen van ${getLetterName(letter)}">
            <span class="forms-link-icon" aria-hidden="true">Aa</span>
            <span class="sound-name">Bekijk lettervormen</span>
            <span class="sound-copy">Los, begin, midden en eind</span>
          </a>
          ${
            formWorksheetPath
              ? `<a class="sound-button forms-link-button form-download-button" href="${formWorksheetPath}" download aria-label="Download schrijf-PDF voor ${getLetterName(letter)}">
                  <span class="forms-link-icon form-download-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M12 5v11" />
                      <path d="M8 12l4 4 4-4" />
                      <path d="M5 20h14" />
                    </svg>
                  </span>
                  <span class="sound-name">Download schrijfblad</span>
                  <span class="sound-copy">Los, begin en eind oefenen</span>
                </a>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  letterSoundsIndex.innerHTML = letterLinks;
  updateVowelsProgress();

  if (vowelPageNav) {
    const previousPage = Math.max(1, activeVowelPage - 1);
    const nextPage = Math.min(vowelPageCount, activeVowelPage + 1);
    const pageLinks = Array.from({ length: vowelPageCount }, (_, index) => {
      const pageNumber = index + 1;
      const isCurrent = pageNumber === activeVowelPage;

      return `
        <a
          class="letter-page-number${isCurrent ? " is-current" : ""}"
          href="${getVowelPageHref(pageNumber)}"
          aria-label="Klinker pagina ${pageNumber}"
          ${isCurrent ? 'aria-current="page"' : ""}
        >${pageNumber}</a>
      `;
    }).join("");

    vowelPageNav.innerHTML = `
      <a class="letter-page-arrow ${activeVowelPage === 1 ? "is-disabled" : ""}" aria-label="Vorige pagina" href="${getVowelPageHref(previousPage)}" ${activeVowelPage === 1 ? 'aria-disabled="true"' : ""}>
        <svg width="9" height="16" viewBox="0 0 12 18" aria-hidden="true" focusable="false">
          <path d="M11 1L2 9.24L11 17" />
        </svg>
      </a>
      <div class="letter-page-numbers" aria-label="Klinker pagina's">
        ${pageLinks}
      </div>
      <a class="letter-page-arrow ${activeVowelPage === vowelPageCount ? "is-disabled" : ""}" aria-label="Volgende pagina" href="${getVowelPageHref(nextPage)}" ${activeVowelPage === vowelPageCount ? 'aria-disabled="true"' : ""}>
        <svg width="9" height="16" viewBox="0 0 12 18" aria-hidden="true" focusable="false">
          <path d="M1 1L10 9.24L1 17" />
        </svg>
      </a>
    `;
  }
}

const soundsGrid = document.querySelector("#sounds-grid");
const letterDetailTitle = document.querySelector("#letter-detail-title");
const letterDetailDescription = document.querySelector("#letter-detail-description");
const letterFormsGrid = document.querySelector("#letter-forms");
const letterWordExamplesGrid = document.querySelector("#letter-word-examples");
const letterDownload = document.querySelector("#letter-download");
const letterPageNav = document.querySelector("#letter-page-nav");

if (soundsGrid && appLetters.length) {
  const params = new URLSearchParams(window.location.search);
  const selectedLetterId = params.get("letter");
  const selectedLetter = selectedLetterId
    ? appLetters.find((letter) => letter.id === selectedLetterId)
    : null;
  const lettersToRender = selectedLetter
    ? [selectedLetter]
    : letterDetailTitle
      ? []
      : appLetters;

  if (letterDetailTitle) {
    if (selectedLetter) {
      letterDetailTitle.textContent = `${getLetterName(selectedLetter)}: korte en lange klinkers`;
    } else {
      letterDetailTitle.textContent = "Letter niet gevonden";
    }
  }

  if (letterDetailDescription) {
    letterDetailDescription.textContent = selectedLetter
      ? `Oefen ${getLetterName(selectedLetter)} met fatha, kasra, damma en lange klanken.`
      : "Ga terug en kies een letter uit het overzicht.";
  }

  if (selectedLetter && activeVowelGroup === "short") {
    appProgress?.completeStep(activeProgressLevelId, "short-vowels");
  }

  if (selectedLetter && activeVowelGroup === "long") {
    appProgress?.completeStep(activeProgressLevelId, "long-vowels");
  }

  if (letterFormsGrid && selectedLetter) {
    const forms = selectedLetter.forms || {
      isolated: selectedLetter.arabic,
      start: selectedLetter.arabic,
      middle: selectedLetter.arabic,
      end: selectedLetter.arabic,
    };
    const formCards = [
      { label: "Losse letter", value: forms.isolated },
      { label: "Begin van woord", value: forms.start },
      { label: "Midden van woord", value: forms.middle },
      { label: "Eind van woord", value: forms.end },
    ]
      .map(
        (form) => `
          <article class="lesson-card letter-form-card">
            <p class="letter-form-symbol" lang="ar" dir="rtl">${form.value}</p>
            <p class="letter-form-label">${form.label}</p>
          </article>
        `,
      )
      .join("");

    letterFormsGrid.innerHTML = formCards;

    if (letterWordExamplesGrid) {
      const examples = selectedLetter.wordExamples || [];
      const exampleCards = examples
        .map(
          (example) => `
            <article class="lesson-card letter-word-card">
              <p class="letter-word-symbol" lang="ar" dir="rtl">${example.word}</p>
              <p class="letter-form-label">Voorbeeld ${example.label.toLowerCase()}</p>
            </article>
          `,
        )
        .join("");

      letterWordExamplesGrid.innerHTML = `
        <h3>Voorbeelden in woorden</h3>
        <div class="letter-word-grid">${exampleCards}</div>
      `;
    }

    if (letterDownload) {
      const worksheetUrl = getLetterWorksheetPath(selectedLetter);
      const fileName = `${getLetterName(selectedLetter)}-oefenblad.pdf`;
      
      letterDownload.innerHTML = "";
      
      // Create action buttons container
      const actionContainer = document.createElement("div");
      actionContainer.style.display = "flex";
      actionContainer.style.justifyContent = "center";
      actionContainer.style.marginTop = "22px";
      
      // Create download button
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "worksheet-download-button";
      downloadBtn.setAttribute("aria-label", `Download oefenblad voor ${getLetterName(selectedLetter)}`);
      downloadBtn.innerHTML = `
        <span class="worksheet-spinner-dot" aria-hidden="true"></span>
        <span class="worksheet-download-icon" aria-hidden="true">
          <span class="worksheet-progress-fill"></span>
          <svg class="worksheet-download-svg" viewBox="0 0 24 24" focusable="false">
            <path d="M12 5v14m0 0-4-4m4 4 4-4" />
          </svg>
          <span class="worksheet-loading-block"></span>
        </span>
        <span class="worksheet-download-label">
          <strong>Download</strong>
          <small>Oefening baart kunst</small>
        </span>
      `;
      
      downloadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (downloadBtn.classList.contains("is-downloading")) return;
        
        downloadBtn.classList.add("is-downloading");
        downloadBtn.setAttribute("aria-busy", "true");
        
        FileOperations.downloadFile(worksheetUrl, fileName, {
          onComplete: () => {
            downloadBtn.classList.remove("is-downloading");
            downloadBtn.removeAttribute("aria-busy");
          },
          onError: (err) => {
            downloadBtn.classList.remove("is-downloading");
            downloadBtn.removeAttribute("aria-busy");
            console.error("Download failed:", err);
          }
        });
      });
      
      actionContainer.appendChild(downloadBtn);
      letterDownload.appendChild(actionContainer);
    }
  }

  if (letterPageNav && selectedLetter) {
    const currentIndex = appLetters.findIndex((letter) => letter.id === selectedLetter.id);
    const previousLetter = appLetters[(currentIndex + appLetters.length - 1) % appLetters.length];
    const nextLetter = appLetters[(currentIndex + 1) % appLetters.length];
    const pageLinks = appLetters
      .map((letter, index) => {
        const pageNumber = index + 1;
        const isCurrent = index === currentIndex;

        return `
          <a
            class="letter-page-number${isCurrent ? " is-current" : ""}"
            href="vowel-letter.html?letter=${encodeURIComponent(letter.id)}${activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""}&level=${encodeURIComponent(activeProgressLevelId)}"
            aria-label="Letter ${pageNumber}"
            ${isCurrent ? 'aria-current="page"' : ""}
          >${pageNumber}</a>
        `;
      })
      .join("");

    letterPageNav.innerHTML = `
      <a class="letter-page-arrow" aria-label="Vorige" href="vowel-letter.html?letter=${encodeURIComponent(previousLetter.id)}${activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""}&level=${encodeURIComponent(activeProgressLevelId)}">
        <svg width="9" height="16" viewBox="0 0 12 18" aria-hidden="true" focusable="false">
          <path d="M11 1L2 9.24L11 17" />
        </svg>
      </a>
      <div class="letter-page-numbers" aria-label="Letter pagina's">
        ${pageLinks}
      </div>
      <a class="letter-page-arrow" aria-label="Volgende" href="vowel-letter.html?letter=${encodeURIComponent(nextLetter.id)}${activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""}&level=${encodeURIComponent(activeProgressLevelId)}">
        <svg width="9" height="16" viewBox="0 0 12 18" aria-hidden="true" focusable="false">
          <path d="M1 1L10 9.24L1 17" />
        </svg>
      </a>
    `;
  }

  const soundGroups = lettersToRender
    .map((letter) => {
      const sounds = getVowelSounds(letter, activeVowelGroup);

      return `
        <article class="lesson-card sound-letter-card" data-vowel-letter-card="${escapeAttribute(letter.id)}">
          <div class="sound-letter-heading">
            <p class="sound-letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
            <div class="sound-letter-copy">
              <h2>${getLetterName(letter)}</h2>
              <p class="letter-meta">${sounds.length} klanken</p>
            </div>
          </div>

          <div class="sound-buttons" dir="rtl">
            ${sounds
              .map(
                (sound) => {
                  const vowelType = getVowelType(sound);

                  return renderAudioButton({
                    src: sound.src,
                    ariaLabel: `Luister naar ${getLetterName(letter)} met ${vowelType.nameNl}`,
                    attributes: `data-vowel-key="${escapeAttribute(`${letter.id}:${sound.type}`)}"`,
                    content: `
                      <span class="sound-complete-badge" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false"><path d="M5 12.5l4.2 4L19 7" /></svg>
                    </span>
                    <span class="sound-example" lang="ar" dir="rtl">${sound.example}</span>
                    <span class="sound-name">${vowelType.nameNl}</span>
                    <span class="sound-copy">${sound.soundNl}</span>
                    <span class="sound-action-label">Luister</span>
                  `,
                  });
                },
              )
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");

  soundsGrid.innerHTML = soundGroups;
  updateVowelsProgress();
}

const letterFormsPage = document.querySelector("#letter-forms-page");

if (letterFormsPage && appLetterForms.length) {
  const formsContent = document.querySelector("#letter-forms-content");
  const formsPicker = document.querySelector("#forms-letter-picker");
  const formsProgressText = document.querySelector("#forms-progress-text");
  const formsProgressFill = document.querySelector("#forms-progress-fill");
  const formsTitle = document.querySelector("#letter-forms-title");
  const formsDescription = document.querySelector("#letter-forms-description");
  const formLabels = [
    {
      key: "isolated",
      label: "Los",
      className: "is-isolated",
      description: "Zo ziet de letter eruit als hij alleen staat.",
    },
    {
      key: "beginning",
      label: "Begin",
      className: "is-beginning",
      description: "Zo ziet de letter eruit aan het begin van een woord.",
    },
    {
      key: "middle",
      label: "Midden",
      className: "is-middle",
      description: "Zo ziet de letter eruit tussen twee letters.",
    },
    {
      key: "end",
      label: "Eind",
      className: "is-end",
      description: "Zo ziet de letter eruit aan het einde van een woord.",
    },
  ];
  const exerciseChoices = formLabels.filter((form) => form.key !== "isolated");
  const requestedLetterId = pageParams.get("letter");
  const selectedFormsLetter =
    appLetterFormsById[requestedLetterId] || appLetterForms.find((letter) => letter.id === requestedLetterId) || appLetterForms[0];
  const selectedFormsLetterId = selectedFormsLetter.id;

  const getFormSeenKey = (letterId) => `aka_forms_seen_${letterId}`;
  const getFormPracticedKey = (letterId) => `aka_forms_practiced_${letterId}`;
  const setLocalFlag = (key) => {
    try {
      localStorage.setItem(key, "true");
    } catch {
      // Letter form progress should never block the lesson if storage is unavailable.
    }
  };
  const getLocalFlag = (key) => {
    try {
      return localStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  };
  const getFormsProgressCount = () =>
    appLetterForms.filter((letter) => getLocalFlag(getFormPracticedKey(letter.id))).length;
  const updateFormsProgress = () => {
    if (!formsProgressText || !formsProgressFill) {
      return;
    }

    const completedCount = getFormsProgressCount();
    const percent = Math.round((completedCount / appLetterForms.length) * 100);

    formsProgressText.textContent = `Je hebt ${completedCount} van ${appLetterForms.length} lettervormen geoefend.`;
    formsProgressFill.style.width = `${percent}%`;

    document.querySelectorAll("[data-form-letter-link]").forEach((link) => {
      const letterId = link.getAttribute("data-form-letter-link");
      link.classList.toggle("is-seen", getLocalFlag(getFormSeenKey(letterId)));
      link.classList.toggle("is-practiced", getLocalFlag(getFormPracticedKey(letterId)));
    });
  };
  const getExerciseTarget = (letter) => exerciseChoices[letter.order % exerciseChoices.length];
  const getExercisePositionText = (formKey) => ({
    beginning: "aan het begin",
    middle: "in het midden",
    end: "aan het einde",
  })[formKey] || "op de juiste plek";
  const renderExample = (letter) => {
    if (!letter.exampleWord || !Array.isArray(letter.exampleParts)) {
      return `
        <article class="forms-example-card">
          <p class="eyebrow">Voorbeeld</p>
          <h2>Voorbeeldwoord volgt</h2>
          <p class="letter-meta">TODO: add child-friendly word example</p>
        </article>
      `;
    }

    return `
      <article class="forms-example-card">
        <p class="eyebrow">Voorbeeldwoord</p>
        <h2>Bekijk de letter in een woord</h2>
        <p class="forms-example-equation" lang="ar" dir="rtl">
          ${letter.exampleParts.join(" + ")} = <strong>${letter.exampleWord}</strong>
        </p>
      </article>
    `;
  };
  const renderLetterForms = (letter) => {
    const exerciseTarget = getExerciseTarget(letter);
    const formWorksheetPath = getLetterFormWorksheetPath(letter);
    const nonJoiningNote = letter.connectsAfter
      ? ""
      : `<p class="forms-hand-note">Deze letter geeft geen handje aan de volgende letter. Daarom verandert hij minder.</p>`;
    const formCards = formLabels
      .map(
        (form) => `
          <article class="form-card ${form.className}" data-form-key="${form.key}">
            <span class="form-card-label">${form.label}</span>
            <p class="form-card-symbol" lang="ar" dir="rtl">${letter[form.key]}</p>
            <p>${form.description}</p>
          </article>
        `,
      )
      .join("");

    return `
      <section class="forms-workspace" aria-labelledby="active-letter-title">
        <article class="forms-hero-card">
          <div>
            <div class="forms-hero-topline">
              <p class="eyebrow">Letter ${letter.order} van ${appLetterForms.length}</p>
              ${
                formWorksheetPath
                  ? `<a class="forms-download-button" href="${formWorksheetPath}" download aria-label="Download schrijfblad voor ${letter.name}">
                      <span class="forms-download-button-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false">
                          <path d="M12 5v11" />
                          <path d="M8 12l4 4 4-4" />
                          <path d="M5 20h14" />
                        </svg>
                      </span>
                      <span>
                        <strong>Download schrijfblad</strong>
                        <small>Print en oefen mee</small>
                      </span>
                    </a>`
                  : ""
              }
            </div>
            <h2 id="active-letter-title">${letter.name}: zo verandert de letter</h2>
            <p class="letter-meta">Van los naar begin, midden en eind. Kijk vooral naar de kleine handjes aan de zijkant.</p>
            ${nonJoiningNote}
          </div>
          <p class="forms-hero-symbol" lang="ar" dir="rtl">${letter.isolated}</p>
        </article>

        <div class="forms-grid">
          ${formCards}
        </div>

        <article class="forms-magic-card">
          <div>
            <p class="eyebrow">Magic transformation</p>
            <h2>Laat de letter veranderen</h2>
          </div>
          <div class="forms-transform-strip" aria-live="polite">
            ${formLabels
              .map(
                (form, index) => `
                  <span class="forms-transform-symbol${index === 0 ? " is-active" : ""}" data-transform-step="${index}" lang="ar" dir="rtl">
                    ${letter[form.key]}
                  </span>
                  ${index < formLabels.length - 1 ? '<span class="forms-transform-arrow" aria-hidden="true">-&gt;</span>' : ""}
                `,
              )
              .join("")}
          </div>
          <button class="primary-button forms-magic-button" type="button" data-forms-magic>
            Laat de letter veranderen
          </button>
        </article>

        ${renderExample(letter)}

        <article class="forms-exercise-card" data-forms-exercise data-correct-form="${exerciseTarget.key}">
          <p class="eyebrow">Mini-oefening</p>
          <h2>Waar staat deze letter?</h2>
          <p class="forms-exercise-symbol" lang="ar" dir="rtl">${letter[exerciseTarget.key]}</p>
          <div class="forms-exercise-answers" role="group" aria-label="Kies de positie van de letter">
            ${exerciseChoices
              .map(
                (choice) => `
                  <button class="secondary-button forms-answer-button" type="button" data-form-answer="${choice.key}">
                    ${choice.label}
                  </button>
                `,
              )
              .join("")}
          </div>
          <p class="forms-exercise-feedback" role="status"></p>
        </article>
      </section>
    `;
  };

  setLocalFlag(getFormSeenKey(selectedFormsLetterId));

  if (formsTitle) {
    formsTitle.textContent = `Zo verandert ${selectedFormsLetter.name}`;
  }

  if (formsDescription) {
    formsDescription.textContent = `${selectedFormsLetter.name} kan los staan, aan het begin komen, in het midden staan of aan het einde komen.`;
  }

  if (formsPicker) {
    formsPicker.innerHTML = appLetterForms
      .map(
        (letter) => `
          <a
            class="forms-letter-link${letter.id === selectedFormsLetterId ? " is-current" : ""}"
            href="letter-forms.html?letter=${encodeURIComponent(letter.id)}"
            data-form-letter-link="${escapeAttribute(letter.id)}"
            aria-label="Bekijk vormen van ${letter.name}"
            ${letter.id === selectedFormsLetterId ? 'aria-current="page"' : ""}
          >
            <span lang="ar" dir="rtl">${letter.isolated}</span>
            <small>${letter.name}</small>
          </a>
        `,
      )
      .join("");
  }

  if (formsContent) {
    formsContent.innerHTML = renderLetterForms(selectedFormsLetter);
  }

  updateFormsProgress();

  letterFormsPage.addEventListener("click", (event) => {
    const magicButton = event.target.closest("[data-forms-magic]");

    if (magicButton) {
      const workspace = magicButton.closest(".forms-workspace");
      const cards = [...workspace.querySelectorAll("[data-form-key]")];
      const symbols = [...workspace.querySelectorAll("[data-transform-step]")];

      magicButton.disabled = true;
      cards.forEach((card) => card.classList.remove("is-active"));
      symbols.forEach((symbol) => symbol.classList.remove("is-active"));

      formLabels.forEach((form, index) => {
        window.setTimeout(() => {
          cards.forEach((card) => card.classList.toggle("is-active", card.dataset.formKey === form.key));
          symbols.forEach((symbol) => symbol.classList.toggle("is-active", symbol.dataset.transformStep === String(index)));

          if (index === formLabels.length - 1) {
            magicButton.disabled = false;
          }
        }, index * 520);
      });
    }

    const answerButton = event.target.closest("[data-form-answer]");

    if (answerButton) {
      const exercise = answerButton.closest("[data-forms-exercise]");
      const feedback = exercise.querySelector(".forms-exercise-feedback");
      const isCorrect = answerButton.dataset.formAnswer === exercise.dataset.correctForm;
      const correctChoice = exerciseChoices.find((choice) => choice.key === exercise.dataset.correctForm);

      exercise.querySelectorAll("[data-form-answer]").forEach((button) => {
        button.classList.toggle("is-correct", button.dataset.formAnswer === exercise.dataset.correctForm);
        button.classList.toggle("is-wrong", button === answerButton && !isCorrect);
      });

      if (isCorrect) {
        setLocalFlag(getFormPracticedKey(selectedFormsLetterId));
        feedback.textContent = `Goed gedaan! Deze letter staat ${getExercisePositionText(correctChoice.key)}.`;
        exercise.classList.add("is-complete");
        dispatchAppEvent("aka:success", {
          type: "letter-forms",
          message: "Lettervorm geoefend",
          target: exercise,
        });
        updateFormsProgress();
      } else {
        feedback.textContent = "Bijna! Kijk goed naar de handjes aan de zijkant.";
      }
    }
  });
}

const quizCard = document.querySelector("#quiz-card");

if (quizCard && appLetters.length && window.createLetterQuiz) {
  const initialQuizMode = pageParams.get("mode") || "letters";
  const quiz = window.createLetterQuiz(appLetters, {
    difficulty: "medium",
    mode: initialQuizMode,
    totalQuestions: 20,
  });
  const modeOptions = [
    ["letters", "Letters"],
    ["short", "Korte klinkers"],
    ["long", "Lange klinkers"],
    ["mixed", "Mix"],
  ];
  const difficultyOptions = [
    ["easy", "Makkelijk"],
    ["medium", "Normaal"],
    ["hard", "Moeilijk"],
  ];
  let quizStreak = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let quizAudioReady = false;
  let quizAnswered = false;
  const quizMistakeCounts = new Map();

  const playQuizTone = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    try {
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.14);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.24);
      window.setTimeout(() => context.close?.(), 320);
    } catch {
      // Quiz feedback should keep working even when the browser blocks WebAudio.
    }
  };

  const resetQuizSessionStats = () => {
    quizStreak = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    quizMistakeCounts.clear();
  };

  const renderQuizProgress = () => {
    const state = quiz.state;
    const totalQuestions = state.totalQuestions || state.finishScore || 20;
    const currentQuestion = Math.min(Math.max(state.questionCount, 1), totalQuestions);
    const percent = Math.min(100, Math.round((currentQuestion / totalQuestions) * 100));

    return `
      <div class="quiz-progress" aria-label="Quiz voortgang">
        <div class="quiz-progress-copy">
          <span>Vraag ${currentQuestion} van ${totalQuestions}</span>
          <strong>${state.score} / ${totalQuestions} punten</strong>
          <em class="quiz-streak" aria-live="polite">${quizStreak ? `${quizStreak} goed op rij` : "Start je reeks"}</em>
        </div>
        <div class="progress-bar quiz-progress-track" role="progressbar" aria-label="Quiz voortgang" aria-valuemin="0" aria-valuemax="${totalQuestions}" aria-valuenow="${currentQuestion}">
          <span style="width: ${percent}%"></span>
        </div>
      </div>
    `;
  };

  const renderQuizControls = () => {
    const state = quiz.state;

    return `
      <div class="quiz-controls" aria-label="Quiz instellingen">
        <label>
          <span>Quiz</span>
          <select id="quiz-mode">
            ${modeOptions
              .map(([value, label]) => `<option value="${value}"${state.mode === value ? " selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>Niveau</span>
          <select id="quiz-difficulty">
            ${difficultyOptions
              .map(([value, label]) => `<option value="${value}"${state.difficulty === value ? " selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>
      </div>
    `;
  };

  const renderQuizResult = () => {
    const state = quiz.state;
    const totalQuestions = state.totalQuestions || state.finishScore || 20;
    const scorePercent = Math.min(100, Math.round((state.score / totalQuestions) * 100));
    const resultMessage = state.score >= 18
      ? "Geweldig gedaan!"
      : state.score >= 12
        ? "Goed bezig!"
        : "Blijf oefenen!";
    const starCount = state.score >= 18 ? 3 : state.score >= 12 ? 2 : state.score > 0 ? 1 : 0;
    const stars = Array.from({ length: 3 }, (_, index) => `<span aria-hidden="true">${index < starCount ? "&#9733;" : "&#9734;"}</span>`).join("");
    const completedQuizSteps = {
      letters: "letter-quiz",
      short: "short-vowels-quiz",
      long: "long-vowels-quiz",
      mixed: "mixed-quiz",
    };
    const completedStepId = completedQuizSteps[state.mode];
    let completedNow = false;

    if (completedStepId) {
      completedNow = completeStepWithFeedback(activeProgressLevelId, completedStepId, quizCard);
    }

    if (!completedNow) {
      dispatchAppEvent("aka:success", {
        type: "quiz",
        message: "Quiz gehaald",
        target: quizCard,
      });
    }

    quizCard.innerHTML = `
      ${renderQuizControls()}
      <div class="quiz-result">
        <p class="eyebrow">Klaar</p>
        <h2>${resultMessage}</h2>
        <p class="letter-meta">Je eindscore is ${state.score} van ${totalQuestions} punten.</p>
        <div class="quiz-stars" aria-label="${starCount} van 3 sterren">${stars}</div>
        <div class="progress-bar quiz-progress-track" role="progressbar" aria-label="Eindscore" aria-valuemin="0" aria-valuemax="${totalQuestions}" aria-valuenow="${state.score}">
          <span style="width: ${scorePercent}%"></span>
        </div>
        <div class="quiz-result-stats" aria-label="Quiz resultaat">
          <span><strong>${correctAnswers}</strong> goed</span>
          <span><strong>${wrongAnswers}</strong> nog oefenen</span>
        </div>
        <p class="letter-meta">Luister nog eens naar moeilijke letters en speel daarna opnieuw.</p>
        <div class="quiz-result-actions">
          <button class="primary-button" type="button" id="restart-quiz">Opnieuw oefenen</button>
          <a class="secondary-button" href="roadmap.html?level=beginner">Terug naar leerroute</a>
        </div>
      </div>
    `;
  };

  const renderQuestion = () => {
    const question = quiz.createQuestion();
    const state = quiz.state;

    if (!question) {
      renderQuizResult();
      return;
    }

    quizAudioReady = false;
    quizAnswered = false;

    quizCard.innerHTML = `
      ${renderQuizControls()}
      ${renderQuizProgress()}

      <div class="sound-letter-heading">
        <p class="sound-letter-symbol" lang="ar" dir="rtl">؟</p>
        <div class="sound-letter-copy">
          <h2>${question.prompt}</h2>
          <p class="letter-meta">${state.modeLabel} - ${state.choiceCount} keuzes</p>
        </div>
      </div>

      ${renderAudioButton({
        src: question.answer.audioSrc,
        ariaLabel: "Luister naar de quizvraag",
        className: "sound-button quiz-audio-button",
        content: `
          <span class="quiz-audio-label">
            <span class="letter-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                <path d="M16 9.5c.8.7 1.3 1.5 1.3 2.5s-.5 1.8-1.3 2.5" />
                <path d="M18.5 7c1.4 1.3 2.2 3 2.2 5s-.8 3.7-2.2 5" />
              </svg>
            </span>
            <span class="sound-name">Luister naar de vraag</span>
          </span>
        `,
      })}

      <div class="sound-buttons quiz-choices" dir="rtl">
        ${question.choices
          .map((choice) => {
            const choiceLabel = choice.vowelName
              ? `${choice.title} - ${choice.vowelName} - ${choice.subtitle}`
              : `${choice.title}: ${choice.subtitle}`;

            return `
              <button class="sound-button quiz-choice is-locked" type="button" data-quiz-answer="${choice.id}" aria-label="${escapeAttribute(`Kies ${choiceLabel}`)}" aria-disabled="true" disabled>
                <span class="sound-example" lang="ar" dir="rtl">${choice.arabic}</span>
                <span class="sound-name">${choice.title}</span>
                ${choice.vowelName ? `<span class="quiz-vowel-name">${choice.vowelName}</span>` : ""}
                <span class="sound-copy">${choice.subtitle}</span>
                <span class="quiz-choice-mark" aria-hidden="true"></span>
              </button>
            `;
          })
          .join("")}
      </div>

      <p class="quiz-feedback" id="quiz-feedback" role="status">Luister eerst naar de vraag.</p>
      <button class="primary-button is-disabled" type="button" id="next-quiz-question" aria-disabled="true" disabled>Volgende vraag</button>
    `;
  };

  quizCard.addEventListener("click", (event) => {
    const answerButton = event.target.closest("[data-quiz-answer]");

    if (answerButton) {
      if (!quizAudioReady) {
        setText("#quiz-feedback", "Luister eerst naar de vraag.");
        return;
      }

      if (quizAnswered) {
        return;
      }

      const result = quiz.answerQuestion(answerButton.dataset.quizAnswer);

      if (!result) {
        return;
      }

      const nextButton = document.querySelector("#next-quiz-question");
      const choices = quizCard.querySelectorAll("[data-quiz-answer]");
      const feedback = quizCard.querySelector("#quiz-feedback");
      quizAnswered = true;

      if (result.isCorrect) {
        quizStreak += 1;
        correctAnswers += 1;
        playQuizTone();

        choices.forEach((choice) => {
          choice.disabled = true;
          choice.setAttribute("aria-disabled", "true");
          choice.classList.toggle("is-playing", choice.dataset.quizAnswer === result.answer.id);
          choice.classList.toggle("is-correct", choice.dataset.quizAnswer === result.answer.id);
          choice.classList.remove("is-locked", "is-missing", "is-wrong");
        });

        setText("#quiz-feedback", "Goed gedaan!");
        feedback?.classList.remove("is-wrong");
        feedback?.classList.add("is-correct");
      } else {
        quizStreak = 0;
        wrongAnswers += 1;
        quizMistakeCounts.set(result.answer.letterId, (quizMistakeCounts.get(result.answer.letterId) || 0) + 1);
        // TODO: Use quizMistakeCounts later to repeat letters or klanken that need extra practice.

        choices.forEach((choice) => {
          choice.disabled = true;
          choice.setAttribute("aria-disabled", "true");
          choice.classList.toggle("is-correct", choice.dataset.quizAnswer === result.answer.id);
          choice.classList.toggle("is-wrong", choice === answerButton);
          choice.classList.remove("is-locked", "is-playing");
        });
        answerButton.classList.add("is-wrong", "is-missing");
        setText("#quiz-feedback", "Bijna! Kijk naar het juiste antwoord.");
        feedback?.classList.remove("is-correct");
        feedback?.classList.add("is-wrong");
      }

      dispatchAppEvent("aka:quiz-answer", {
        isCorrect: result.isCorrect,
        target: answerButton,
        answerId: result.answer.id,
      });

      if (nextButton) {
        nextButton.disabled = false;
        nextButton.removeAttribute("aria-disabled");
        nextButton.classList.remove("is-disabled");
        nextButton.classList.add("is-ready");
        nextButton.textContent = result.isFinished ? "Bekijk resultaat" : "Volgende vraag";
      }
    }

    if (event.target.closest("#next-quiz-question")) {
      const nextButton = event.target.closest("#next-quiz-question");

      if (nextButton.disabled) {
        return;
      }

      renderQuestion();
    }

    if (event.target.closest("#restart-quiz")) {
      quiz.reset();
      resetQuizSessionStats();
      renderQuestion();
    }
  });

  quizCard.addEventListener("aka:quiz-audio-ready", () => {
    if (quizAnswered) {
      return;
    }

    quizAudioReady = true;
    quizCard.querySelectorAll("[data-quiz-answer]").forEach((choice) => {
      choice.disabled = false;
      choice.removeAttribute("aria-disabled");
      choice.classList.remove("is-locked");
    });
    setText("#quiz-feedback", "Kies nu het juiste antwoord.");
  });

  quizCard.addEventListener("change", (event) => {
    if (event.target.matches("#quiz-mode")) {
      quiz.setMode(event.target.value);
      resetQuizSessionStats();
      renderQuestion();
    }

    if (event.target.matches("#quiz-difficulty")) {
      quiz.setDifficulty(event.target.value);
      resetQuizSessionStats();
      renderQuestion();
    }
  });

  renderQuestion();
}

document.addEventListener("click", (event) => {
  const downloadButton = event.target.closest(".worksheet-download-button");

  if (!downloadButton) {
    return;
  }

  if (downloadButton.classList.contains("is-downloading")) {
    event.preventDefault();
    return;
  }

  downloadButton.classList.add("is-downloading");
  downloadButton.setAttribute("aria-busy", "true");

  window.setTimeout(() => {
    downloadButton.classList.remove("is-downloading");
    downloadButton.removeAttribute("aria-busy");
  }, 3500);
});
