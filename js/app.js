const levelButtons = document.querySelectorAll("[data-level]");
const selectedLevelText = document.querySelector("#selected-level");
const startLink = document.querySelector(".start-link");

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLevel = button.dataset.level;

    levelButtons.forEach((item) => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });

    selectedLevelText.textContent = `Gekozen niveau: ${selectedLevel}`;
    localStorage.setItem("selectedLevel", selectedLevel);

    if (startLink) {
      startLink.classList.remove("is-disabled");
      startLink.removeAttribute("aria-disabled");
      startLink.href = `pages/roadmap.html?level=${encodeURIComponent(selectedLevel)}`;
    }
  });
});

const roadmapLevelText = document.querySelector("#roadmap-level");

if (roadmapLevelText) {
  const params = new URLSearchParams(window.location.search);
  const selectedLevel = params.get("level") || localStorage.getItem("selectedLevel");

  roadmapLevelText.textContent = selectedLevel
    ? `Je leerroute: ${selectedLevel}`
    : "Kies eerst een niveau op de homepage.";
}

const lettersGrid = document.querySelector("#letters-grid");

if (lettersGrid && window.letters) {
  const letterCards = window.letters
    .map(
      (letter) => `
        <article class="letter-card">
          <p class="letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
          <div>
            <h2>${letter.nameNl}</h2>
            <p class="letter-meta">${letter.transliteration}</p>
          </div>
          <audio class="letter-audio" controls preload="none" src="${letter.audioSrc}">
            Je browser ondersteunt geen audio.
          </audio>
        </article>
      `,
    )
    .join("");

  lettersGrid.innerHTML = letterCards;
}

const vowelsGrid = document.querySelector("#vowels-grid");

if (vowelsGrid && window.vowels) {
  const vowelCards = window.vowels
    .map(
      (vowel) => `
        <article class="vowel-card">
          <p class="vowel-symbol" lang="ar" dir="rtl">${vowel.arabic}</p>
          <div>
            <h2>${vowel.nameNl}</h2>
            <p class="letter-meta">${vowel.soundNl}</p>
          </div>
          <p class="vowel-example">Voorbeeld: ${vowel.exampleNl}</p>
        </article>
      `,
    )
    .join("");

  vowelsGrid.innerHTML = vowelCards;
}

const letterForms = {
  alif: { isolated: "ا", start: "ا", middle: "ـا", end: "ـا" },
  baa: { isolated: "ب", start: "بـ", middle: "ـبـ", end: "ـب" },
  taa: { isolated: "ت", start: "تـ", middle: "ـتـ", end: "ـت" },
  thaa: { isolated: "ث", start: "ثـ", middle: "ـثـ", end: "ـث" },
  jeem: { isolated: "ج", start: "جـ", middle: "ـجـ", end: "ـج" },
  haa: { isolated: "ح", start: "حـ", middle: "ـحـ", end: "ـح" },
  khaa: { isolated: "خ", start: "خـ", middle: "ـخـ", end: "ـخ" },
  dal: { isolated: "د", start: "د", middle: "ـد", end: "ـد" },
  dhal: { isolated: "ذ", start: "ذ", middle: "ـذ", end: "ـذ" },
  raa: { isolated: "ر", start: "ر", middle: "ـر", end: "ـر" },
  zay: { isolated: "ز", start: "ز", middle: "ـز", end: "ـز" },
  seen: { isolated: "س", start: "سـ", middle: "ـسـ", end: "ـس" },
  sheen: { isolated: "ش", start: "شـ", middle: "ـشـ", end: "ـش" },
  saad: { isolated: "ص", start: "صـ", middle: "ـصـ", end: "ـص" },
  daad: { isolated: "ض", start: "ضـ", middle: "ـضـ", end: "ـض" },
  "taa-heavy": { isolated: "ط", start: "طـ", middle: "ـطـ", end: "ـط" },
  "zaa-heavy": { isolated: "ظ", start: "ظـ", middle: "ـظـ", end: "ـظ" },
  ain: { isolated: "ع", start: "عـ", middle: "ـعـ", end: "ـع" },
  ghain: { isolated: "غ", start: "غـ", middle: "ـغـ", end: "ـغ" },
  faa: { isolated: "ف", start: "فـ", middle: "ـفـ", end: "ـف" },
  qaaf: { isolated: "ق", start: "قـ", middle: "ـقـ", end: "ـق" },
  kaaf: { isolated: "ك", start: "كـ", middle: "ـكـ", end: "ـك" },
  laam: { isolated: "ل", start: "لـ", middle: "ـلـ", end: "ـل" },
  meem: { isolated: "م", start: "مـ", middle: "ـمـ", end: "ـم" },
  noon: { isolated: "ن", start: "نـ", middle: "ـنـ", end: "ـن" },
  waw: { isolated: "و", start: "و", middle: "ـو", end: "ـو" },
  yaa: { isolated: "ي", start: "يـ", middle: "ـيـ", end: "ـي" },
};

const letterWordExamples = {
  alif: [
    { label: "Begin", word: "أَكَلَ" },
    { label: "Midden", word: "سَأَلَ" },
    { label: "Eind", word: "قَرَأَ" },
  ],
  baa: [
    { label: "Begin", word: "بَتَرَ" },
    { label: "Midden", word: "سَحَبَ" },
    { label: "Eind", word: "ضَرَبَ" },
  ],
  taa: [
    { label: "Begin", word: "تَرَكَ" },
    { label: "Midden", word: "كَتَبَ" },
    { label: "Eind", word: "نَبَتَ" },
  ],
  thaa: [
    { label: "Begin", word: "ثَمَرَ" },
    { label: "Midden", word: "مَثَلَ" },
    { label: "Eind", word: "حَرَثَ" },
  ],
  jeem: [
    { label: "Begin", word: "جَبَلَ" },
    { label: "Midden", word: "شَجَرَ" },
    { label: "Eind", word: "خَرَجَ" },
  ],
  haa: [
    { label: "Begin", word: "حَمَلَ" },
    { label: "Midden", word: "سَمَحَ" },
    { label: "Eind", word: "فَتَحَ" },
  ],
  khaa: [
    { label: "Begin", word: "خَرَجَ" },
    { label: "Midden", word: "صَرَخَ" },
    { label: "Eind", word: "طَبَخَ" },
  ],
  dal: [
    { label: "Begin", word: "دَرَسَ" },
    { label: "Midden", word: "مَدَحَ" },
    { label: "Eind", word: "بَلَدَ" },
  ],
  dhal: [
    { label: "Begin", word: "ذَهَبَ" },
    { label: "Midden", word: "أَذِنَ" },
    { label: "Eind", word: "نَبَذَ" },
  ],
  raa: [
    { label: "Begin", word: "رَسَمَ" },
    { label: "Midden", word: "قَرَأَ" },
    { label: "Eind", word: "سَفَرَ" },
  ],
  zay: [
    { label: "Begin", word: "زَرَعَ" },
    { label: "Midden", word: "وَزَنَ" },
    { label: "Eind", word: "خَبَزَ" },
  ],
  seen: [
    { label: "Begin", word: "سَنَحَ" },
    { label: "Midden", word: "نَسَرَ" },
    { label: "Eind", word: "كَنَسَ" },
  ],
  sheen: [
    { label: "Begin", word: "شَجَرَ" },
    { label: "Midden", word: "نَشَرَ" },
    { label: "Eind", word: "فَرَشَ" },
  ],
  saad: [
    { label: "Begin", word: "صَبَرَ" },
    { label: "Midden", word: "نَصَحَ" },
    { label: "Eind", word: "قَنَصَ" },
  ],
  daad: [
    { label: "Begin", word: "ضَرَبَ" },
    { label: "Midden", word: "حَضَرَ" },
    { label: "Eind", word: "قَرَضَ" },
  ],
  "taa-heavy": [
    { label: "Begin", word: "طَرَبَ" },
    { label: "Midden", word: "بَطَنَ" },
    { label: "Eind", word: "رَبَطَ" },
  ],
  "zaa-heavy": [
    { label: "Begin", word: "ظَهَرَ" },
    { label: "Midden", word: "نَظَرَ" },
    { label: "Eind", word: "حَفِظَ" },
  ],
  ain: [
    { label: "Begin", word: "عَبَدَ" },
    { label: "Midden", word: "نَعَمَ" },
    { label: "Eind", word: "دَفَعَ" },
  ],
  ghain: [
    { label: "Begin", word: "غَسَلَ" },
    { label: "Midden", word: "رَغِبَ" },
    { label: "Eind", word: "فَرَغَ" },
  ],
  faa: [
    { label: "Begin", word: "فَرَضَ" },
    { label: "Midden", word: "نَفَحَ" },
    { label: "Eind", word: "وَقَفَ" },
  ],
  qaaf: [
    { label: "Begin", word: "قَلَمَ" },
    { label: "Midden", word: "نَسَقَ" },
    { label: "Eind", word: "سَبَقَ" },
  ],
  kaaf: [
    { label: "Begin", word: "كَتَبَ" },
    { label: "Midden", word: "بَكَرَ" },
    { label: "Eind", word: "دَلَكَ" },
  ],
  laam: [
    { label: "Begin", word: "لَعِبَ" },
    { label: "Midden", word: "كَلَمَ" },
    { label: "Eind", word: "عَمَلَ" },
  ],
  meem: [
    { label: "Begin", word: "مَنَحَ" },
    { label: "Midden", word: "نَمَرَ" },
    { label: "Eind", word: "قَلَمَ" },
  ],
  noon: [
    { label: "Begin", word: "نَبَتَ" },
    { label: "Midden", word: "مَنَعَ" },
    { label: "Eind", word: "دَرَنَ" },
  ],
  waw: [
    { label: "Begin", word: "وَجَدَ" },
    { label: "Midden", word: "رَوَعَ" },
    { label: "Eind", word: "دَلْوٌ" },
  ],
  yaa: [
    { label: "Begin", word: "يَسَرَ" },
    { label: "Midden", word: "لَيِّنٌ" },
    { label: "Eind", word: "رَضِيَ" },
  ],
};

const letterSoundsIndex = document.querySelector("#letter-sounds-index");

if (letterSoundsIndex && window.letterSounds) {
  const letterLinks = window.letterSounds
    .map(
      (letter) => `
        <a class="letter-index-card" href="vowel-letter.html?letter=${encodeURIComponent(letter.id)}">
          <span class="letter-index-symbol" lang="ar" dir="rtl">${letter.arabic}</span>
          <span class="letter-index-copy">
            <strong>${letter.nameNl}</strong>
            <span>${letter.sounds.length} klanken</span>
          </span>
        </a>
      `,
    )
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
let activeSound = null;
let activeSoundButton = null;
let activeSoundStopHandler = null;

if (soundsGrid && window.letterSounds) {
  const params = new URLSearchParams(window.location.search);
  const selectedLetterId = params.get("letter");
  const selectedLetter = selectedLetterId
    ? window.letterSounds.find((letter) => letter.id === selectedLetterId)
    : null;
  const lettersToRender = selectedLetter
    ? [selectedLetter]
    : letterDetailTitle
      ? []
      : window.letterSounds;

  if (letterDetailTitle) {
    if (selectedLetter) {
      letterDetailTitle.textContent = `${selectedLetter.nameNl}: korte en lange klinkers`;
    } else {
      letterDetailTitle.textContent = "Letter niet gevonden";
    }
  }

  if (letterDetailDescription) {
    letterDetailDescription.textContent = selectedLetter
      ? `Oefen ${selectedLetter.nameNl} met fatha, kasra, damma, lange klanken en tanween.`
      : "Ga terug en kies een letter uit het overzicht.";
  }

  if (letterFormsGrid && selectedLetter) {
    const forms = letterForms[selectedLetter.id] || {
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
          <article class="letter-form-card">
            <p class="letter-form-symbol" lang="ar" dir="rtl">${form.value}</p>
            <p class="letter-form-label">${form.label}</p>
          </article>
        `,
      )
      .join("");

    letterFormsGrid.innerHTML = formCards;

    if (letterWordExamplesGrid) {
      const examples = letterWordExamples[selectedLetter.id] || [];
      const exampleCards = examples
        .map(
          (example) => `
            <article class="letter-word-card">
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
          href="../docs/letter-worksheets/${encodeURIComponent(selectedLetter.id)}.pdf"
          download
        >
          <span class="worksheet-download-icon" aria-hidden="true">↓</span>
          <span>
            <strong>Download oefen-PDF</strong>
            <small>Oefening baart kunst</small>
          </span>
        </a>
      `;
    }
  }

  if (letterPageNav && selectedLetter) {
    const currentIndex = window.letterSounds.findIndex((letter) => letter.id === selectedLetter.id);
    const previousLetter = window.letterSounds[(currentIndex + window.letterSounds.length - 1) % window.letterSounds.length];
    const nextLetter = window.letterSounds[(currentIndex + 1) % window.letterSounds.length];

    letterPageNav.innerHTML = `
      <a class="letter-nav-button" href="vowel-letter.html?letter=${encodeURIComponent(previousLetter.id)}">
        <span aria-hidden="true">←</span>
        <span>Vorige</span>
      </a>
      <a class="letter-nav-button letter-nav-top" href="#top">
        <span aria-hidden="true">↑</span>
        <span>Naar boven</span>
      </a>
      <a class="letter-nav-button" href="vowel-letter.html?letter=${encodeURIComponent(nextLetter.id)}">
        <span>Volgende</span>
        <span aria-hidden="true">→</span>
      </a>
    `;
  }

  const soundGroups = lettersToRender
    .map(
      (letter) => `
        <article class="sound-letter-card">
          <div class="sound-letter-heading">
            <p class="sound-letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
            <div class="sound-letter-copy">
              <h2>${letter.nameNl}</h2>
              <p class="letter-meta">8 klanken</p>
            </div>
          </div>

          <div class="sound-buttons" dir="rtl">
            ${letter.sounds
              .map(
                (sound) => `
                  <button
                    class="sound-button"
                    type="button"
                    data-src="${sound.src}"
                  >
                    <span class="sound-example" lang="ar" dir="rtl">${sound.example}</span>
                    <span class="sound-name">${sound.nameNl}</span>
                    <span class="sound-copy">${sound.soundNl}</span>
                    <span class="sound-status">Luister</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");

  soundsGrid.innerHTML = soundGroups;

  soundsGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".sound-button");

    if (!button) {
      return;
    }

    if (activeSound) {
      activeSound.pause();
      activeSound.removeEventListener("timeupdate", activeSoundStopHandler);
    }

    if (activeSoundButton) {
      activeSoundButton.classList.remove("is-playing");
    }

    activeSound = new Audio(button.dataset.src);
    activeSoundButton = button;
    button.classList.add("is-playing");

    activeSound.addEventListener("ended", () => {
      button.classList.remove("is-playing");
    });

    activeSound.addEventListener("error", () => {
      button.classList.remove("is-playing");
      button.classList.add("is-missing");
      button.querySelector(".sound-status").textContent = "Audio mist";
    });

    activeSound.play().catch(() => {
      button.classList.remove("is-playing");
      button.classList.add("is-missing");
      button.querySelector(".sound-status").textContent = "Audio mist";
    });
  });
}
