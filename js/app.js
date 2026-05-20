const levelButtons = document.querySelectorAll("[data-level]");
const selectedLevelText = document.querySelector("#selected-level");
const startLink = document.querySelector(".start-link");
const appProgress = window.progressStore;
const appLevels = window.learningLevels || [];

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
    }
  });

  if (selectedLevelId && startLink) {
    const selectedLevel = appProgress.getLevel(selectedLevelId);

    selectedLevelText.textContent = `Gekozen niveau: ${selectedLevel.name}`;
    startLink.classList.remove("is-disabled");
    startLink.removeAttribute("aria-disabled");
    startLink.href = `pages/roadmap.html?level=${encodeURIComponent(selectedLevel.id)}`;
  }
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLevelId = button.dataset.level;
    const selectedLevel = appProgress?.getLevel(selectedLevelId);

    if (!selectedLevel || selectedLevel.locked || !appProgress.selectLevel(selectedLevel.id)) {
      selectedLevelText.textContent = `${selectedLevel?.name || "Dit niveau"} is nog op slot.`;
      return;
    }

    levelButtons.forEach((item) => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });

    selectedLevelText.textContent = `Gekozen niveau: ${selectedLevel.name}`;

    if (startLink) {
      startLink.classList.remove("is-disabled");
      startLink.removeAttribute("aria-disabled");
      startLink.href = `pages/roadmap.html?level=${encodeURIComponent(selectedLevel.id)}`;
    }

    window.location.href = `pages/roadmap.html?level=${encodeURIComponent(selectedLevel.id)}`;
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
      : "Alle beginner levels zijn klaar.";
  }

  const beginnerItems = selectedLevel.steps
    .map((step, index) => {
      const isComplete = appProgress.isStepComplete(selectedLevel.id, step.id);
      const isUnlocked = appProgress.isStepUnlocked(selectedLevel, index);
      const stars = appProgress.getStepStars(selectedLevel.id, step.id);
      const stateText = isComplete ? "Klaar" : isUnlocked ? "Open" : "Op slot";
      const stepNumber = index + 1;
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
    .filter((level) => level.id !== selectedLevel.id && level.locked)
    .map(
      (level) => `
        <li class="roadmap-card roadmap-item is-locked locked-level">
          <div class="roadmap-link" aria-disabled="true">
            <strong>${level.name}</strong>
            <span>Dit niveau komt later.</span>
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

const setText = (selector, text) => {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text;
  }
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
    .map(
      (letter) => `
        <article class="lesson-card letter-card">
          <p class="letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
          <div>
            <h2>${getLetterName(letter)}</h2>
            <p class="letter-meta">${letter.transliteration}</p>
          </div>
          ${renderAudioButton({
            src: letter.baseAudio,
            ariaLabel: `Luister naar de letter ${getLetterName(letter)}`,
            className: "sound-button letter-audio-button",
            content: '<span class="sound-name">Letter</span>',
          })}
        </article>
      `,
    )
    .join("");

  lettersGrid.innerHTML = letterCards;
}

const letterSoundsIndex = document.querySelector("#letter-sounds-index");

if (letterSoundsIndex && appLetters.length) {
  if (activeVowelGroup === "short") {
    appProgress?.completeStep("beginner", "short-vowels");
  }

  if (activeVowelGroup === "long") {
    appProgress?.completeStep("beginner", "long-vowels");
  }

  const letterLinks = appLetters
    .map((letter) => {
      const sounds = getVowelSounds(letter, activeVowelGroup);
      const detailHref = `vowel-letter.html?letter=${encodeURIComponent(letter.id)}${
        activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""
      }`;

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
    appProgress?.completeStep("beginner", "short-vowels");
  }

  if (selectedLetter && activeVowelGroup === "long") {
    appProgress?.completeStep("beginner", "long-vowels");
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
      letterDownload.innerHTML = `
        <a
          class="worksheet-download-button"
          href="${selectedLetter.worksheetSrc || `../docs/letter-worksheets/${encodeURIComponent(selectedLetter.id)}.pdf`}"
          download
          aria-label="Download oefenblad voor ${getLetterName(selectedLetter)}"
        >
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
        </a>
      `;
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
            href="vowel-letter.html?letter=${encodeURIComponent(letter.id)}${activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""}"
            aria-label="Letter ${pageNumber}"
            ${isCurrent ? 'aria-current="page"' : ""}
          >${pageNumber}</a>
        `;
      })
      .join("");

    letterPageNav.innerHTML = `
      <a class="letter-page-arrow" aria-label="Vorige" href="vowel-letter.html?letter=${encodeURIComponent(previousLetter.id)}${activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""}">
        <svg width="9" height="16" viewBox="0 0 12 18" aria-hidden="true" focusable="false">
          <path d="M11 1L2 9.24L11 17" />
        </svg>
      </a>
      <div class="letter-page-numbers" aria-label="Letter pagina's">
        ${pageLinks}
      </div>
      <a class="letter-page-arrow" aria-label="Volgende" href="vowel-letter.html?letter=${encodeURIComponent(nextLetter.id)}${activeVowelGroup ? `&type=${encodeURIComponent(activeVowelGroup)}` : ""}">
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
    };
    const completedStepId = completedQuizSteps[state.mode];

    if (completedStepId) {
      appProgress?.completeStep("beginner", completedStepId);
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

      choices.forEach((choice) => {
        choice.disabled = true;
        choice.classList.toggle("is-playing", choice.dataset.quizAnswer === result.answer.id);
        choice.classList.toggle("is-missing", choice === answerButton && !result.isCorrect);
      });

      setText("#quiz-feedback", result.isCorrect ? "+1 punt. Goed gedaan!" : `-1 punt. Het goede antwoord was ${result.answer.title}.`);

      if (nextButton) {
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
