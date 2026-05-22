const levelButtons = document.querySelectorAll("[data-level]");
const selectedLevelText = document.querySelector("#selected-level");
const startLink = document.querySelector(".start-link");
const appProgress = window.progressStore;
const appLevels = window.learningLevels || [];
const isPagesPath = window.location.pathname.includes("/pages/");
const getPageHref = (page) => `${isPagesPath ? "" : "pages/"}${page}`;

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
    startLink.href = getPageHref(`roadmap.html?level=${encodeURIComponent(selectedLevel.id)}`);
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
      startLink.href = getPageHref(`roadmap.html?level=${encodeURIComponent(selectedLevel.id)}`);
    }

    window.location.href = getPageHref(`roadmap.html?level=${encodeURIComponent(selectedLevel.id)}`);
  });
});

const roadmapLevelText = document.querySelector("#roadmap-level");
const roadmapList = document.querySelector("#roadmap-list");
const roadmapProgress = document.querySelector("#roadmap-progress");
const roadmapNextStep = document.querySelector("#roadmap-next-step");

const getSelectedRoadmapLevel = () => {
  const params = new URLSearchParams(window.location.search);
  const selectedLevelId = params.get("level") || appProgress?.getSelectedLevel() || "beginner";
  const requestedLevel = appProgress?.getLevel(selectedLevelId);

  return requestedLevel && !requestedLevel.locked ? requestedLevel : appProgress?.getLevel("beginner");
};

if (roadmapList && appProgress) {
  const selectedLevel = getSelectedRoadmapLevel();
  const levelProgress = appProgress.getLevelProgress(selectedLevel.id);
  const nextStep = appProgress.getNextStep(selectedLevel.id);

  if (roadmapLevelText) {
    roadmapLevelText.textContent = `Je leerroute: ${selectedLevel.name}. Speel alle levels vrij in de juiste volgorde.`;
  }

  if (roadmapProgress) {
    roadmapProgress.innerHTML = `
      <span class="roadmap-progress-label">Voortgang</span>
      <strong>${levelProgress.percent}%</strong>
      <div class="progress-bar roadmap-progress-track" aria-label="${levelProgress.completed} van ${levelProgress.total} stappen klaar">
        <span style="width: ${levelProgress.percent}%"></span>
      </div>
      <p>${levelProgress.completed} / ${levelProgress.total} levels klaar</p>
    `;
  }

  if (roadmapNextStep) {
    roadmapNextStep.textContent = nextStep
      ? `Volgende level: ${nextStep.title}`
      : `Alle ${selectedLevel.name.toLowerCase()} levels zijn klaar.`;
  }

  const beginnerItems = selectedLevel.steps
    .map((step, index) => {
      const isComplete = appProgress.isStepComplete(selectedLevel.id, step.id);
      const isUnlocked = appProgress.isStepUnlocked(selectedLevel, index);
      const stars = appProgress.getStepStars(selectedLevel.id, step.id);
      const stateText = isComplete ? "Klaar" : isUnlocked ? "Open" : "Op slot";
      const stepNumber = step.levelNumber || index + 1;
      const cardContent = `
        <span class="roadmap-node" aria-hidden="true">${isComplete ? "OK" : isUnlocked ? stepNumber : "Slot"}</span>
        <span class="roadmap-card-copy">
          <strong>Level ${stepNumber}: ${step.title}</strong>
          <span>${step.description}</span>
        </span>
        <span class="roadmap-card-meta">
          <span class="star-badge roadmap-stars" aria-label="${stars} van 3 sterren">
            <span aria-hidden="true">${Array.from({ length: 3 }, (_, starIndex) => (starIndex < stars ? "&#9733;" : "&#9734;")).join("")}</span>
          </span>
          <em>${stateText}</em>
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
const appVowelTypes = window.vowelTypes || [];
const vowelTypesById = window.vowelTypesById || Object.fromEntries(appVowelTypes.map((vowel) => [vowel.id, vowel]));
const audioPlayer = window.audioPlayer;
const playAudio = window.playAudio || ((src, options = {}) => audioPlayer?.play(src, options.button));
const preloadAudio = window.preloadAudio || (() => false);
const pageParams = new URLSearchParams(window.location.search);
const activeVowelGroup = pageParams.get("type");
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
  zay: "../pdf/pdf-letters/Zay.pdf.pdf",
  "zaa-heavy": "../pdf/pdf-letters/Zaa%20zwaar.pdf.pdf",
};
const getLetterWorksheetPath = (letter) => letter.worksheetSrc || letterWorksheetPaths[letter.id] || "";

const renderAudioButton = ({ src, label = "Luister", ariaLabel, className = "sound-button", content }) => `
  <button
    class="${className}"
    type="button"
    data-audio-src="${src || ""}"
    aria-label="${escapeAttribute(ariaLabel || label)}"
  >
    ${content}
    <span class="sound-status" data-audio-status>${label}</span>
  </button>
`;

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-audio-src]");

  if (!button || !audioPlayer) {
    return;
  }

  playAudio(button.dataset.audioSrc, { button });

  if (button.closest(".letter-card, .sound-letter-card")) {
    dispatchAppEvent("aka:letter-tap", {
      target: button,
    });
  }
});

document.addEventListener("pointerenter", (event) => {
  const button = event.target.closest?.("[data-audio-src]");

  if (button) {
    preloadAudio(button.dataset.audioSrc);
  }
}, true);

document.addEventListener("focusin", (event) => {
  const button = event.target.closest?.("[data-audio-src]");

  if (button) {
    preloadAudio(button.dataset.audioSrc);
  }
});

const lettersGrid = document.querySelector("#letters-grid");

if (lettersGrid && appLetters.length) {
  appProgress?.completeStep("beginner", "letters");

  const letterCards = appLetters
    .map((letter) => {
      const worksheetPath = getLetterWorksheetPath(letter);

      return `
        <article class="lesson-card letter-card">
          <p class="letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
          <div>
            <h2>${getLetterName(letter)}</h2>
            <p class="letter-meta">${letter.transliteration}</p>
          </div>
          <div class="letter-card-actions">
            ${renderAudioButton({
              src: letter.baseAudio,
              ariaLabel: `Luister naar de letter ${getLetterName(letter)}`,
              className: "sound-button letter-audio-button",
              content: '<span class="sound-name">🔊 Luister</span>',
            })}
            ${
              worksheetPath
                ? `<a class="sound-button letter-write-button" href="${worksheetPath}" download aria-label="Download oefenblad voor ${getLetterName(letter)}">
                    <span class="sound-name">✍️ Oefen schrijven</span>
                  </a>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  lettersGrid.innerHTML = letterCards;
}

const lettersScrollButton = document.querySelector("[data-letters-scroll]");

if (lettersScrollButton && lettersGrid) {
  const updateLettersScrollButton = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const canScrollDown = scrollTop < 160;

    lettersScrollButton.classList.toggle("is-up", !canScrollDown);
    lettersScrollButton.href = canScrollDown ? "#letters-page-bottom" : "#main-content";
    lettersScrollButton.setAttribute(
      "aria-label",
      canScrollDown ? "Scroll naar beneden" : "Scroll naar boven",
    );
  };

  updateLettersScrollButton();
  window.addEventListener("scroll", updateLettersScrollButton, { passive: true });
  window.addEventListener("resize", updateLettersScrollButton);
}

const letterSoundsIndex = document.querySelector("#letter-sounds-index");

if (letterSoundsIndex && appLetters.length) {
  if (activeVowelGroup === "short") {
    appProgress?.completeStep(activeProgressLevelId, "short-vowels");
  }

  if (activeVowelGroup === "long") {
    appProgress?.completeStep(activeProgressLevelId, "long-vowels");
  }

  const letterLinks = appLetters
    .map((letter) => {
      const sounds = getVowelSounds(letter, activeVowelGroup);
      const detailHref = `vowel-letter.html?letter=${encodeURIComponent(letter.id)}${
        activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""
      }&level=${encodeURIComponent(activeProgressLevelId)}`;

      return `
        <article class="lesson-card sound-letter-card">
          <div class="sound-letter-heading">
            <a class="letter-index-symbol" lang="ar" dir="rtl" href="${detailHref}">
              ${letter.arabic}
            </a>
            <div class="sound-letter-copy">
              <h2>${getLetterName(letter)}</h2>
              <p class="letter-meta">${sounds.length} klanken</p>
            </div>
          </div>

          <div class="sound-buttons" dir="rtl">
            ${sounds
              .map((sound) => {
                const vowelType = getVowelType(sound);

                return renderAudioButton({
                  src: sound.src,
                  ariaLabel: `Luister naar ${getLetterName(letter)} met ${vowelType.nameNl}`,
                  content: `
                    <span class="sound-example" lang="ar" dir="rtl">${sound.example}</span>
                    <span class="sound-name">${vowelType.nameNl}</span>
                    <span class="sound-copy">${sound.soundNl}</span>
                  `,
                });
              })
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");

  letterSoundsIndex.innerHTML = letterLinks;
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
      const worksheetUrl = selectedLetter.worksheetSrc || `../docs/letter-worksheets/${encodeURIComponent(selectedLetter.id)}.pdf`;
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
        <article class="lesson-card sound-letter-card">
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
                    content: `
                      <span class="sound-example" lang="ar" dir="rtl">${sound.example}</span>
                      <span class="sound-name">${vowelType.nameNl}</span>
                      <span class="sound-copy">${sound.soundNl}</span>
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
}

const quizCard = document.querySelector("#quiz-card");

if (quizCard && appLetters.length && window.createLetterQuiz) {
  const initialQuizMode = pageParams.get("mode") || "letters";
  const quiz = window.createLetterQuiz(appLetters, {
    difficulty: "medium",
    finishScore: 20,
    mode: initialQuizMode,
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

  const renderQuizProgress = () => {
    const state = quiz.state;
    const percent = Math.min(100, Math.round((state.score / state.finishScore) * 100));

    return `
      <div class="quiz-progress" aria-label="Quiz voortgang">
        <div class="quiz-progress-copy">
          <span>Vraag ${state.questionCount}</span>
          <strong>${state.score} / ${state.finishScore} punten</strong>
        </div>
        <div class="progress-bar quiz-progress-track" aria-hidden="true">
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
        <h2>Je hebt ${state.finishScore} punten gehaald</h2>
        <div class="progress-bar quiz-progress-track" aria-label="Eindscore 100%">
          <span style="width: 100%"></span>
        </div>
        <p class="letter-meta">Goed geoefend. Je kunt de quiz nog een keer doen.</p>
        <button class="primary-button" type="button" id="restart-quiz">Opnieuw starten</button>
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
        content: '<span class="sound-name">Luister naar de vraag</span>',
      })}

      <div class="sound-buttons quiz-choices" dir="rtl">
        ${question.choices
          .map(
            (choice) => `
              <button class="sound-button quiz-choice" type="button" data-quiz-answer="${choice.id}">
                <span class="sound-example" lang="ar" dir="rtl">${choice.arabic}</span>
                <span class="sound-name">${choice.title}</span>
                <span class="sound-copy">${choice.subtitle}</span>
              </button>
            `,
          )
          .join("")}
      </div>

      <p class="letter-meta" id="quiz-feedback" role="status"></p>
      <button class="primary-button is-disabled" type="button" id="next-quiz-question" disabled>Volgende vraag</button>
    `;
  };

  quizCard.addEventListener("click", (event) => {
    const answerButton = event.target.closest("[data-quiz-answer]");

    if (answerButton) {
      const result = quiz.answerQuestion(answerButton.dataset.quizAnswer);

      if (!result) {
        return;
      }

      const nextButton = document.querySelector("#next-quiz-question");
      const choices = quizCard.querySelectorAll("[data-quiz-answer]");

      if (result.isCorrect) {
        choices.forEach((choice) => {
          choice.disabled = true;
          choice.classList.toggle("is-playing", choice.dataset.quizAnswer === result.answer.id);
          choice.classList.toggle("is-correct", choice.dataset.quizAnswer === result.answer.id);
          choice.classList.remove("is-missing", "is-wrong");
        });

        setText("#quiz-feedback", "+1 punt. Goed gedaan!");
      } else {
        answerButton.disabled = true;
        answerButton.classList.add("is-wrong", "is-missing");
        setText("#quiz-feedback", "Nog niet goed. Luister nog een keer en probeer opnieuw.");
      }

      dispatchAppEvent("aka:quiz-answer", {
        isCorrect: result.isCorrect,
        target: answerButton,
        answerId: result.answer.id,
      });

      if (nextButton && result.isCorrect) {
        nextButton.disabled = false;
        nextButton.classList.remove("is-disabled");
        nextButton.textContent = result.isFinished ? "Bekijk resultaat" : "Volgende vraag";
      }
    }

    if (event.target.closest("#next-quiz-question")) {
      renderQuestion();
    }

    if (event.target.closest("#restart-quiz")) {
      quiz.reset();
      renderQuestion();
    }
  });

  quizCard.addEventListener("change", (event) => {
    if (event.target.matches("#quiz-mode")) {
      quiz.setMode(event.target.value);
      renderQuestion();
    }

    if (event.target.matches("#quiz-difficulty")) {
      quiz.setDifficulty(event.target.value);
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
