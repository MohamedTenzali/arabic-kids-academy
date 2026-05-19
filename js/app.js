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

const soundsGrid = document.querySelector("#sounds-grid");
let activeSound = null;
let activeSoundButton = null;
let activeSoundStopHandler = null;

if (soundsGrid && window.letterSounds) {
  const soundGroups = window.letterSounds
    .map(
      (letter) => `
        <article class="sound-letter-card">
          <div class="sound-letter-heading">
            <p class="sound-letter-symbol" lang="ar" dir="rtl">${letter.arabic}</p>
            <div>
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
