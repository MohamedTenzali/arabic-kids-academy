// =======================================================
// AUDIO & KLANKEN
// - AUDIO_FILES: losse letter-audio
// - LETTER_KEYS / SHORT_VOWELS / LONG_VOWELS / BASE_LETTERS
// - generateAllVowels(): 168 klank-slides
// - resolveVowelAudio(): bepaalt bestandsnaam voor klank-mp3
// - WORD_ITEMS / generateWordSlides(): ~30 woorden met audio
// - speak(): speelt juiste mp3 af (letters, klanken, woorden)
// =======================================================

// Alleen losse letters hier. Klanken (korte/lange) worden automatisch
// via een bestandsnaam-regel opgezocht.
// ===================== PROGRESSIE SYSTEMEN =====================
// Voor slot-logica die logisch blijft voor kinderen
const STORAGE_VISITED_KEY = "aka_visitedSteps_v1";

// Lijsten: welke stappen zijn bezocht en welke zijn afgerond
let visitedSteps = loadVisitedFromStorage();

// Ophalen
function loadVisitedFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_VISITED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Opslaan
function saveVisitedToStorage() {
  localStorage.setItem(STORAGE_VISITED_KEY, JSON.stringify(visitedSteps));
}

// Markeer stap als bezocht
function markStepVisited(stepId) {
  if (!visitedSteps.includes(stepId)) {
    visitedSteps.push(stepId);
    saveVisitedToStorage();
  }
}// ===================== AUDIO: BASISLETTERS =====================

const AUDIO_FILES = {
  "أ": "audio/alif.mp3",
  "ب": "audio/ba.mp3",
  "ت": "audio/ta.mp3",
  "ث": "audio/tha.mp3",
  "ج": "audio/jim.mp3",
  "ح": "audio/ha_zacht.mp3",
  "خ": "audio/kha.mp3",
  "د": "audio/dal.mp3",
  "ذ": "audio/dhal.mp3",
  "ر": "audio/ra.mp3",
  "ز": "audio/zay.mp3",
  "س": "audio/sin.mp3",
  "ش": "audio/shin.mp3",
  "ص": "audio/sad.mp3",
  "ض": "audio/dad.mp3",
  "ط": "audio/ta_dik.mp3",
  "ظ": "audio/za_dik.mp3",
  "ع": "audio/ayn.mp3",
  "غ": "audio/ghayn.mp3",
  "ف": "audio/fa.mp3",
  "ق": "audio/qaf.mp3",
  "ك": "audio/kaf.mp3",
  "ل": "audio/lam.mp3",
  "م": "audio/mim.mp3",
  "ن": "audio/nun.mp3",
  "ه": "audio/ha.mp3",
  "هـ": "audio/ha.mp3", // fallback voor deze vorm
  "و": "audio/waw.mp3",
  "ي": "audio/ya.mp3"
};

// Sleutelnaam voor elke letter: gebruik je ook in bestandsnamen.
const LETTER_KEYS = {
  "أ": "alif",
  "ب": "ba",
  "ت": "ta",
  "ث": "tha",
  "ج": "jim",
  "ح": "ha_zacht",
  "خ": "kha",
  "د": "dal",
  "ذ": "dhal",
  "ر": "ra",
  "ز": "zay",
  "س": "sin",
  "ش": "shin",
  "ص": "sad",
  "ض": "dad",
  "ط": "ta_dik",
  "ظ": "za_dik",
  "ع": "ayn",
  "غ": "ghayn",
  "ف": "fa",
  "ق": "qaf",
  "ك": "kaf",
  "ل": "lam",
  "م": "mim",
  "ن": "nun",
  "ه": "ha",
  "هـ": "ha",
  "و": "waw",
  "ي": "ya"
};

// Korte klinkers (harakaat)
const SHORT_VOWELS = [
  { mark: "َ", suffix: "a_short", name: "Fatha (a)", desc: "Korte 'a'-klank boven de letter." },
  { mark: "ِ", suffix: "i_short", name: "Kasra (i)", desc: "Korte 'i'-klank onder de letter." },
  { mark: "ُ", suffix: "u_short", name: "Damma (oe)", desc: "Korte 'oe'-klank boven de letter." }
];

// Lange klinkers
const LONG_VOWELS = [
  { mark: "ا", suffix: "a_long", name: "Lange aa", desc: "Lange 'aa'-klank door Alif." },
  { mark: "ي", suffix: "i_long", name: "Lange ie", desc: "Lange 'ie'-klank door Ya." },
  { mark: "و", suffix: "u_long", name: "Lange oe", desc: "Lange 'oe'-klank door Waw." }
];

// Alle basisletters waarvoor we klanken genereren
const BASE_LETTERS = [
  "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز",
  "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "ه", "و", "ي"
];

// Bouw voor elke (letter, klinker) de uitleg-slides
function generateAllVowels() {
  const list = [];

  BASE_LETTERS.forEach(letter => {
    // korte klanken
    SHORT_VOWELS.forEach(v => {
      list.push({
        arabic: letter + v.mark,
        name: `${letter} met ${v.name}`,
        description: v.desc
      });
    });

    // lange klanken
    LONG_VOWELS.forEach(v => {
      list.push({
        arabic: letter + v.mark,
        name: `${letter} met ${v.name}`,
        description: v.desc
      });
    });
  });

  return list;
}

// Bepaal mp3-bestandsnaam voor een klank-tekst, bv "بَ" of "بَا"
function resolveVowelAudio(arabicText) {
  if (!arabicText || arabicText.length < 2) return null;

  const base = arabicText[0];
  const mark = arabicText[1];
  const key = LETTER_KEYS[base];
  if (!key) return null;

  // korte klinker?
  const sv = SHORT_VOWELS.find(v => v.mark === mark);
  if (sv) {
    return `audio/${key}_${sv.suffix}.mp3`;
  }

  // lange klinker?
  const lv = LONG_VOWELS.find(v => v.mark === mark);
  if (lv) {
    return `audio/${key}_${lv.suffix}.mp3`;
  }

  return null;
}

// Basis-woordenlijst: id wordt gebruikt in bestandsnaam: audio/word_<id>.mp3
const WORD_ITEMS = [
  { id: "baab", arabic: "بَاب", name: "Baab", nl: "Deur" },
  { id: "bayt", arabic: "بَيْت", name: "Bayt", nl: "Huis" },
  { id: "kitaab", arabic: "كِتَاب", name: "Kitaab", nl: "Boek" },
  { id: "ab", arabic: "أَب", name: "Ab", nl: "Vader" },
  { id: "umm", arabic: "أُمّ", name: "Umm", nl: "Moeder" },
  { id: "walad", arabic: "وَلَد", name: "Walad", nl: "Jongen" },
  { id: "bint", arabic: "بِنْت", name: "Bint", nl: "Meisje" },
  { id: "madrasa", arabic: "مَدْرَسَة", name: "Madrasa", nl: "School" },
  { id: "kursi", arabic: "كُرْسِيّ", name: "Kursi", nl: "Stoel" },
  { id: "maktab", arabic: "مَكْتَب", name: "Maktab", nl: "Bureau" },
  { id: "qalb", arabic: "قَلْب", name: "Qalb", nl: "Hart" },
  { id: "yad", arabic: "يَد", name: "Yad", nl: "Hand" },
  { id: "ain", arabic: "عَيْن", name: "Ayn", nl: "Oog" },
  { id: "ras", arabic: "رَأْس", name: "Ra’s", nl: "Hoofd" },
  { id: "samaa", arabic: "سَمَاء", name: "Samaa", nl: "Lucht" },
  { id: "shams", arabic: "شَمْس", name: "Shams", nl: "Zon" },
  { id: "qamar", arabic: "قَمَر", name: "Qamar", nl: "Maan" },
  { id: "maa", arabic: "مَاء", name: "Maa", nl: "Water" },
  { id: "laban", arabic: "لَبَن", name: "Laban", nl: "Melk" },
  { id: "tuffah", arabic: "تُفَّاح", name: "Tuffah", nl: "Appel" },
  { id: "khubz", arabic: "خُبْز", name: "Khubz", nl: "Brood" },
  { id: "sukar", arabic: "سُكَّر", name: "Sukkar", nl: "Suiker" },
  { id: "qahwa", arabic: "قَهْوَة", name: "Qahwa", nl: "Koffie" },
  { id: "halib", arabic: "حَلِيب", name: "Halib", nl: "Melk (ander woord)" },
  { id: "sayyara", arabic: "سَيَّارَة", name: "Sayyara", nl: "Auto" },
  { id: "babun", arabic: "بَابٌ", name: "Baab (onbep.)", nl: "Een deur" },
  { id: "baytun", arabic: "بَيْتٌ", name: "Bayt (onbep.)", nl: "Een huis" },
  { id: "ustadh", arabic: "أُسْتَاذ", name: "Ustadh", nl: "Leraar" },
  { id: "talib", arabic: "طَالِب", name: "Talib", nl: "Leerling" },
  // Nieuwe woorden
  { id: "qitt", arabic: "قِطّ", name: "Qitt", nl: "Kat" },
  { id: "kalb", arabic: "كَلْب", name: "Kalb", nl: "Hond" },
  { id: "asfur", arabic: "عُصْفُور", name: "Asfur", nl: "Vogel" },
  { id: "samak", arabic: "سَمَك", name: "Samak", nl: "Vis" },
  { id: "ahmar", arabic: "أَحْمَر", name: "Ahmar", nl: "Rood" },
  { id: "azraq", arabic: "أَزْرَق", name: "Azraq", nl: "Blauw" },
  { id: "akhdar", arabic: "أَخْضَر", name: "Akhdar", nl: "Groen" },
  { id: "wahid", arabic: "وَاحِد", name: "Wahid", nl: "Eén" },
  { id: "ithnan", arabic: "اِثْنَان", name: "Ithnan", nl: "Twee" },
  { id: "thalatha", arabic: "ثَلَاثَة", name: "Thalatha", nl: "Drie" }
];

// Slides voor woorden-les (met audio-pad)
function generateWordSlides() {
  return WORD_ITEMS.map(item => ({
    arabic: item.arabic,
    name: item.name,
    description: `Betekent: ${item.nl}.`,
    audio: `audio/word_${item.id}.mp3`
  }));
}

// Huidige audio zodat we kunnen stoppen als er opnieuw wordt afgespeeld
let currentAudio = null;

// Speel juiste audio, op basis van:
// - letters (AUDIO_FILES)
// - klanken (resolveVowelAudio)
// - woorden (slide.audio)
function speak(target, setLoading) {
  setLoading(true);

  let src = null;
  let arabicText = null;

  // target kan een string of een slide-object zijn
  if (typeof target === "string") {
    arabicText = target;
  } else if (target && typeof target === "object") {
    if (target.audio) {
      // woorden met eigen audio-bestand
      src = target.audio;
    }
    if (target.arabic) {
      arabicText = target.arabic;
    }
  }

  // Letters: directe mapping
  if (!src && arabicText && AUDIO_FILES[arabicText]) {
    src = AUDIO_FILES[arabicText];
  }

  // Klanken: gebruik bestandsnaam-regel
  if (!src && arabicText) {
    const vowelPath = resolveVowelAudio(arabicText);
    if (vowelPath) {
      src = vowelPath;
    }
  }

  if (!src) {
    console.warn("Geen audio-bestand gevonden voor:", target);
    setLoading(false);
    return;
  }

  // vorige audio stoppen
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const audio = new Audio(src);
  currentAudio = audio;

  // knop laten “pulsen” tijdens afspelen
  if (btnSpeak) {
    btnSpeak.classList.add("playing");
  }

  audio.addEventListener("ended", () => {
    currentAudio = null;
    if (btnSpeak) btnSpeak.classList.remove("playing");
    setLoading(false);
  });

  audio.addEventListener("error", () => {
    console.warn("Kon audio niet afspelen, probeer TTS fallback:", src);
    // Fallback naar browser TTS
    speakNative(arabicText, setLoading);
  });

  audio.play().catch(err => {
    console.error("Fout bij starten audio:", err);
    // Fallback
    speakNative(arabicText, setLoading);
  });
}

// iOS Audio Unlock
let audioContext = null;
function unlockAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  // Play silent buffer to unlock
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);

  // Remove listeners after first interaction
  document.removeEventListener('click', unlockAudioContext);
  document.removeEventListener('touchstart', unlockAudioContext);
  document.removeEventListener('keydown', unlockAudioContext);
}

// Add listeners for unlock
document.addEventListener('click', unlockAudioContext);
document.addEventListener('touchstart', unlockAudioContext);
document.addEventListener('keydown', unlockAudioContext);

// TTS Voices Loading
let voices = [];
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

function speakNative(text, setLoading) {
  if (!text) {
    if (setLoading) setLoading(false);
    return;
  }

  // Stop eventuele lopende audio
  if (currentAudio) {
    currentAudio = null;
  }
  window.speechSynthesis.cancel(); // Stop vorige TTS

  const utterance = new SpeechSynthesisUtterance(text);

  // Zoek beste Arabische stem
  const arVoice = voices.find(v => v.lang.includes('ar'));
  if (arVoice) {
    utterance.voice = arVoice;
  }

  utterance.lang = "ar-SA"; // Arabisch
  utterance.rate = 0.9; // Iets langzamer

  utterance.onend = () => {
    if (btnSpeak) btnSpeak.classList.remove("playing");
    if (setLoading) setLoading(false);
  };

  utterance.onerror = (e) => {
    console.error("TTS Error:", e);
    if (btnSpeak) btnSpeak.classList.remove("playing");
    if (setLoading) setLoading(false);
  };

  if (btnSpeak) btnSpeak.classList.add("playing");
  window.speechSynthesis.speak(utterance);
}

// Geluidseffecten voor quiz
function playCorrectSound() {
  new Audio("audio/sfx_correct.mp3").play().catch(() => { });
}

function playWrongSound() {
  new Audio("audio/sfx_wrong.mp3").play().catch(() => { });
}


// =======================================================
// CONTENT DATA (LESSONS & QUIZZEN)
// - alfabet
// - quiz letters (20 vragen)
// - klanken (168 slides + quiz)
// - woorden (met audio) / zinnen
// - eind-examen (mix)
// =======================================================

const CONTENT_DATA = {
  // Alfabet – 28 letters
  intro_letters: {
    title: "Het Alfabet",
    type: "lesson",
    content: [
      { arabic: "أ", name: "Alif", emoji: "🐰", description: "Klinkt als een lange 'aa' (zoals in 'kaas'). Arnab = Konijn" },
      { arabic: "ب", name: "Ba", emoji: "🦆", description: "Klinkt als de 'b' in 'boom'. Batta = Eend" },
      { arabic: "ت", name: "Ta", emoji: "🍎", description: "Klinkt als de 't' in 'tafel'. Tuffah = Appel" },
      { arabic: "ث", name: "Tha", emoji: "🐍", description: "Klinkt als 'th' in 'think' (zachte th). Thu'ban = Slang" },
      { arabic: "ج", name: "Jim", emoji: "🐪", description: "Klinkt als de 'dj' in 'djoek' of 'djeep'. Jamal = Kameel" },
      { arabic: "ح", name: "Ha (zacht)", emoji: "🐴", description: "Een zachte 'h' uit de keel, zwaarder dan Nederlands. Hisan = Paard" },
      { arabic: "خ", name: "Kha", emoji: "🥒", description: "Klinkt als een harde 'ch' in 'gracht'. Khiyar = Komkommer" },
      { arabic: "د", name: "Dal", emoji: "🐻", description: "Klinkt als de 'd' in 'deur'. Dubb = Beer" },
      { arabic: "ذ", name: "Dhal", emoji: "🐺", description: "Klinkt als 'th' in 'this' (harde th). Dhi'b = Wolf" },
      { arabic: "ر", name: "Ra", emoji: "👨", description: "Een rollende 'r'. Rajul = Man" },
      { arabic: "ز", name: "Zay", emoji: "🌸", description: "Klinkt als de 'z' in 'zon'. Zahra = Bloem" },
      { arabic: "س", name: "Sin", emoji: "🐟", description: "Klinkt als de 's' in 'sok'. Samak = Vis" },
      { arabic: "ش", name: "Shin", emoji: "☀️", description: "Klinkt als 'sj' in 'sjaal'. Shams = Zon" },
      { arabic: "ص", name: "Sad", emoji: "🦅", description: "Een zware 's', dikker uitgesproken. Saqr = Valk" },
      { arabic: "ض", name: "Dad", emoji: "🐸", description: "Zware 'd' (Arabische speciale letter). Difda' = Kikker" },
      { arabic: "ط", name: "Ta (dik)", emoji: "🐦", description: "Zware/dikke 't'. Tayr = Vogel" },
      { arabic: "ظ", name: "Za (dik)", emoji: "🦌", description: "Zware 'z', lijkt op harde 'th' maar dikker. Zabi = Hert" },
      { arabic: "ع", name: "Ayn", emoji: "👁️", description: "Keelklank, geen exacte Nederlandse klank. Ayn = Oog" },
      { arabic: "غ", name: "Ghayn", emoji: "☁️", description: "Klinkt als Franse / Arabische 'gh'. Ghaym = Wolk" },
      { arabic: "ف", name: "Fa", emoji: "🐘", description: "Klinkt als de 'f' in 'fiets'. Fil = Olifant" },
      { arabic: "ق", name: "Qaf", emoji: "🐒", description: "Een harde 'k' uit de keel. Qird = Aap" },
      { arabic: "ك", name: "Kaf", emoji: "🐶", description: "Normale 'k' zoals in 'kat'. Kalb = Hond" },
      { arabic: "ل", name: "Lam", emoji: "🦁", description: "Klinkt als de 'l' in 'lamp'. Layth = Leeuw" },
      { arabic: "م", name: "Mim", emoji: "💧", description: "Klinkt als de 'm' in 'maan'. Maa = Water" },
      { arabic: "ن", name: "Nun", emoji: "🐝", description: "Klinkt als de 'n' in 'neus'. Nahl = Bij" },
      { arabic: "هـ", name: "Ha", emoji: "🏠", description: "Normale 'h' zoals in 'huis'. Bayt = Huis" },
      { arabic: "و", name: "Waw", emoji: "🌹", description: "Klinkt als 'w' in 'water' of lange 'oe'. Warda = Roos" },
      { arabic: "ي", name: "Ya", emoji: "✋", description: "Klinkt als 'j' in 'jas' of lange 'ie'. Yad = Hand" }
    ]
  },

  // Quiz letters – 20 vragen
  quiz_letters: {
    title: "Quiz: Letters",
    type: "quiz",
    questions: [
      { question: "Welke letter heet 'Alif'?", options: ["ب", "أ", "ت"], answer: "أ" },
      { question: "Welke letter heet 'Ba'?", options: ["ت", "ب", "ث"], answer: "ب" },
      { question: "Welke letter heet 'Ta'?", options: ["ت", "ب", "ن"], answer: "ت" },
      { question: "Welke letter heet 'Tha'?", options: ["ث", "ف", "ح"], answer: "ث" },
      { question: "Welke letter heet 'Jim'?", options: ["ح", "ج", "خ"], answer: "ج" },
      { question: "Welke letter heet 'Ha (zacht)'?", options: ["ح", "ه", "ع"], answer: "ح" },
      { question: "Welke letter heet 'Kha'?", options: ["خ", "ح", "غ"], answer: "خ" },
      { question: "Welke letter heet 'Dal'?", options: ["د", "ك", "ذ"], answer: "د" },
      { question: "Welke letter heet 'Dhal'?", options: ["ذ", "ز", "د"], answer: "ذ" },
      { question: "Welke letter heet 'Ra'?", options: ["ر", "ز", "و"], answer: "ر" },
      { question: "Welke letter heet 'Zay'?", options: ["ز", "ر", "ذ"], answer: "ز" },
      { question: "Welke letter heet 'Sin'?", options: ["س", "ش", "ص"], answer: "س" },
      { question: "Welke letter heet 'Shin'?", options: ["ش", "ص", "س"], answer: "ش" },
      { question: "Welke letter heet 'Sad'?", options: ["ض", "ص", "س"], answer: "ص" },
      { question: "Welke letter heet 'Dad'?", options: ["ص", "ض", "ط"], answer: "ض" },
      { question: "Welke letter heet 'Ta (dik)'?", options: ["ط", "ت", "ظ"], answer: "ط" },
      { question: "Welke letter heet 'Za (dik)'?", options: ["ظ", "ز", "ذ"], answer: "ظ" },
      { question: "Welke letter heet 'Ayn'?", options: ["ع", "غ", "ا"], answer: "ع" },
      { question: "Welke letter heet 'Ghayn'?", options: ["غ", "ع", "ق"], answer: "غ" },
      { question: "Welke letter heet 'Fa'?", options: ["ف", "ق", "غ"], answer: "ف" }
    ]
  },

  // Klanken – 168 items (28 letters × 6 klanken)
  intro_vowels: {
    title: "Korte & Lange Klanken",
    type: "lesson",
    content: generateAllVowels()
  },

  quiz_vowels: {
    title: "Quiz: Klanken",
    type: "quiz",
    questions: [
      { question: "Welke klank is بَ ?", options: ["ba", "bi", "boe"], answer: "ba" },
      { question: "Welke klank is بِ ?", options: ["ba", "bi", "boe"], answer: "bi" },
      { question: "Welke klank is بُ ?", options: ["ba", "bi", "boe"], answer: "boe" },
      { question: "Welke korte klank is de 'a'?", options: ["بَ", "بِ", "بُ"], answer: "بَ" },
      { question: "Welke korte klank is de 'i'?", options: ["بَ", "بِ", "بُ"], answer: "بِ" },
      { question: "Welke korte klank is de 'oe'?", options: ["بَ", "بِ", "بُ"], answer: "بُ" },
      { question: "Welke maakt een lange 'aa'?", options: ["بَا", "بِ", "بُ"], answer: "بَا" },
      { question: "Welke maakt een lange 'ie'?", options: ["بَا", "بِي", "بُ"], answer: "بِي" },
      { question: "Welke maakt een lange 'oe'?", options: ["بَا", "بِي", "بُو"], answer: "بُو" }
    ]
  },

  // Woorden
  make_words: {
    title: "Woorden Maken",
    type: "lesson",
    content: generateWordSlides()
  },

  // Zinnen
  sentences: {
    title: "Zinnen Vormen",
    type: "lesson",
    content: [
      { arabic: "أَنَا أُحِبُّ أَبِي", name: "Ana uhibbu abi", description: "Ik hou van mijn vader." },
      { arabic: "أَنَا أُحِبُّ أُمِّي", name: "Ana uhibbu ummi", description: "Ik hou van mijn moeder." },
      { arabic: "الْبَيْتُ كَبِيرٌ", name: "Al-baytu kabirun", description: "Het huis is groot." }
    ]
  },

  // Eind examen – mix van alles
  final_exam: {
    title: "Eind Examen",
    type: "quiz",
    questions: [
      { question: "Welke letter heet 'Alif'?", options: ["أ", "ب", "ت"], answer: "أ" },
      { question: "Welke letter heet 'Ba'?", options: ["ث", "ب", "ن"], answer: "ب" },
      { question: "Welke letter heet 'Shin'?", options: ["س", "ش", "ص"], answer: "ش" },
      { question: "Welke letter heet 'Qaf'?", options: ["ق", "ك", "ف"], answer: "ق" },
      { question: "Welke letter heet 'Ayn'?", options: ["ع", "غ", "ا"], answer: "ع" },
      { question: "Welke letter heet 'Ghayn'?", options: ["ق", "غ", "ف"], answer: "غ" },

      { question: "Welke klank is بَ ?", options: ["ba", "bi", "boe"], answer: "ba" },
      { question: "Welke klank is بِ ?", options: ["ba", "bi", "boe"], answer: "bi" },
      { question: "Welke klank is بُ ?", options: ["ba", "bi", "boe"], answer: "boe" },
      { question: "Welke geeft een lange 'aa'?", options: ["بَا", "بِ", "بُ"], answer: "بَا" },

      { question: "Wat betekent 'Baab' (بَاب) ?", options: ["Huis", "Deur", "Boek"], answer: "Deur" },
      { question: "Wat betekent 'Bayt' (بَيْت) ?", options: ["Huis", "Vader", "Moeder"], answer: "Huis" },
      { question: "Wat betekent 'Kitaab' (كِتَاب) ?", options: ["Boek", "Deur", "Huis"], answer: "Boek" },
      { question: "Wat betekent 'Ab' (أَب) ?", options: ["Vader", "Moeder", "Kind"], answer: "Vader" },
      { question: "Wat betekent 'Umm' (أُمّ) ?", options: ["Vader", "Moeder", "Zoon"], answer: "Moeder" },

      {
        question: "Wat betekent: أَنَا أُحِبُّ أَبِي ?",
        options: ["Ik hou van mijn vader.", "Het huis is groot.", "Ik lees een boek."],
        answer: "Ik hou van mijn vader."
      },

      {
        question: "Wat betekent: أَنَا أُحِبُّ أُمِّي ?",
        options: ["Ik hou van mijn moeder.", "Ik ga naar school.", "Het huis is klein."],
        answer: "Ik hou van mijn moeder."
      },

      {
        question: "Wat betekent: الْبَيْتُ كَبِيرٌ ?",
        options: ["Het huis is groot.", "De deur is gesloten.", "Het boek is mooi."],
        answer: "Het huis is groot."
      },

      {
        question: "Welke letter hoort aan het begin van 'Bayt' (بَيْت)?",
        options: ["ب", "ت", "ك"], answer: "ب"
      },

      {
        question: "Welke letter hoor je in het midden van 'Kitaab' (كِتَاب)?",
        options: ["ت", "ب", "ن"], answer: "ت"
      }
    ]
  },

  // Memory Spel
  memory_letters: {
    title: "Memory Spel",
    type: "memory",
    pairs: [
      { id: 1, content: "أ" },
      { id: 2, content: "ب" },
      { id: 3, content: "ت" },
      { id: 4, content: "ج" },
      { id: 5, content: "ح" },
      { id: 6, content: "د" },
      { id: 7, content: "ر" },
      { id: 8, content: "س" }
    ]
  },

  // Nieuwe roadmap items
  writing_practice: {
    title: "Schrijfoefening",
    type: "writing"
  },

  flashcards_mix: {
    title: "Flitskaarten",
    type: "flashcards"
  },

  sticker_check: {
    title: "Stickerboek",
    type: "sticker"
  }
};

// =======================================================
// ROADMAPS (LEVELS & STAPPEN)
// - beginner / advanced / expert
// - elke stap linkt naar een sleutel in CONTENT_DATA
// =======================================================

const ROADMAPS = {
  beginner: [
    { id: "step1", dataKey: "intro_letters", title: "1. 🔤 Letters leren", icon: "🔤" },
    { id: "step_write", dataKey: "writing_practice", title: "2. ✏️ Schrijven", icon: "✏️" },
    { id: "step2", dataKey: "quiz_letters", title: "3. ⭐ Quiz: letters", icon: "⭐" },
    { id: "step2b", dataKey: "memory_letters", title: "4. 🎮 Memory Spel", icon: "🎮" },
    { id: "step_flash", dataKey: "flashcards_mix", title: "5. ⚡ Flitskaarten", icon: "⚡" },
    { id: "step3", dataKey: "intro_vowels", title: "6. 🎵 Klanken", icon: "🎵" },
    { id: "step4", dataKey: "quiz_vowels", title: "7. ⭐ Quiz: klanken", icon: "⭐" },
    { id: "step5", dataKey: "make_words", title: "8. 🧩 Woorden maken", icon: "🧩" },
    { id: "step6", dataKey: "sentences", title: "9. ✏️ Zinnen vormen", icon: "✏️" },
    { id: "step_sticker", dataKey: "sticker_check", title: "10. 🌟 Stickerboek", icon: "🌟" },
    { id: "step7", dataKey: "final_exam", title: "11. 🏆 Eind examen", icon: "🏆", isFinal: true }
  ],
  advanced: [
    { id: "step3", dataKey: "intro_vowels", title: "1. Klanken", icon: "🔊" },
    { id: "step4", dataKey: "quiz_vowels", title: "2. Quiz: Klanken", icon: "★" },
    { id: "step5", dataKey: "make_words", title: "3. Woorden Maken", icon: "📖" },
    { id: "step6", dataKey: "sentences", title: "4. Zinnen", icon: "📖" },
    { id: "step7", dataKey: "final_exam", title: "5. Eind Examen", icon: "🏆", isFinal: true }
  ],
  expert: [
    { id: "step5", dataKey: "make_words", title: "1. Woorden Maken", icon: "📖" },
    { id: "step6", dataKey: "sentences", title: "2. Zinnen", icon: "📖" },
    { id: "step7", dataKey: "final_exam", title: "3. Eind Examen", icon: "🏆", isFinal: true }
  ]
};

// ============ STICKERS ============
const STICKER_DATA = [
  { id: "s1", name: "Beginner", emoji: "🌟", desc: "Start je avontuur", unlockStep: "step1" },
  { id: "s2", name: "Letter Kampioen", emoji: "🅰️", desc: "Ken je letters", unlockStep: "step2" },
  { id: "s3", name: "Geheugen Meester", emoji: "🧠", desc: "Memory uitgespeeld", unlockStep: "step2b" },
  { id: "s4", name: "Klank Kenner", emoji: "🎵", desc: "Alle klanken geleerd", unlockStep: "step3" },
  { id: "s5", name: "Super Oren", emoji: "👂", desc: "Klanken quiz gehaald", unlockStep: "step4" },
  { id: "s6", name: "Woord Bouwer", emoji: "🧱", desc: "Woorden gemaakt", unlockStep: "step5" },
  { id: "s7", name: "Zinnen Maker", emoji: "📝", desc: "Zinnen gevormd", unlockStep: "step6" },
  { id: "s8", name: "Arabisch Expert", emoji: "🏆", desc: "Eind examen gehaald!", unlockStep: "step7" }
];

function getUnlockedStickerCount() {
  return STICKER_DATA.filter(s => completedSteps.includes(s.unlockStep)).length;
}

function renderStickerBook() {
  const grid = document.getElementById("stickerGrid");
  if (!grid) return;

  grid.innerHTML = "";

  STICKER_DATA.forEach(sticker => {
    const isUnlocked = completedSteps.includes(sticker.unlockStep);

    const el = document.createElement("div");
    el.className = `sticker-item ${isUnlocked ? "unlocked" : "locked"}`;

    el.innerHTML = `
      <div class="sticker-icon">${isUnlocked ? sticker.emoji : "🔒"}</div>
      <div class="sticker-name">${sticker.name}</div>
      <div class="sticker-desc">${sticker.desc}</div>
    `;

    grid.appendChild(el);
  });
}

function updateRewardBar() {
  const count = getUnlockedStickerCount();
  const total = STICKER_DATA.length;
  const el = document.getElementById("rewardStickers");
  if (el) {
    el.textContent = `${count} / ${total} stickers ➜`;
  }
}

// =======================================================
// STATE & PERSISTENTE PROGRESS (SLOT-LOGICA)
// - currentView, currentLevel, completedSteps, quizScore, ...
// - completedSteps wordt bewaard in localStorage
//   zodat volgende dag de stappen open blijven.
// =======================================================

const STORAGE_KEY = "aka_completedSteps_v1";

let currentView = "home";
let currentLevel = null;
let completedSteps = loadProgressFromStorage(); // array van step-id's
updateRewardBar(); // initiele update
let currentActivityStep = null;
let currentSlide = 0;
let quizScore = 0;
let quizFeedbackTimeout = null;
let isSpeaking = false;

// Lees progress uit localStorage
function loadProgressFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Kon progress niet lezen:", e);
    return [];
  }
}

// Schrijf progress naar localStorage
function saveProgressToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
  } catch (e) {
    console.warn("Kon progress niet opslaan:", e);
  }
}

// Een stap als voltooid markeren (en opslaan)
function markStepCompleted(stepId) {
  if (!completedSteps.includes(stepId)) {
    completedSteps.push(stepId);
    saveProgressToStorage();
    updateRewardBar(); // Update UI direct
  }
}

// =======================================================
// DOM-REFERENTIES
// =======================================================

const homeView = document.getElementById("homeView");
const rewardStickersEl = document.getElementById("rewardStickers");

const mapView = document.getElementById("mapView");
const activityView = document.getElementById("activityView");

const mapTitleEl = document.getElementById("mapTitle");
const mapStepsEl = document.getElementById("mapSteps");
const btnBackHome = document.getElementById("btnBackHome");

const activityTitleEl = document.getElementById("activityTitle");
const activityProgressEl = document.getElementById("activityProgress");

const lessonContentEl = document.getElementById("lessonContent");
const quizContentEl = document.getElementById("quizContent");
const resultContentEl = document.getElementById("resultContent");
const memoryContentEl = document.getElementById("memoryContent");
const memoryGridEl = document.getElementById("memoryGrid");

const lessonArabicEl = document.getElementById("lessonArabic");
const lessonNameEl = document.getElementById("lessonName");
const lessonDescEl = document.getElementById("lessonDesc");
const btnLessonPrev = document.getElementById("btnLessonPrev");
const btnLessonNext = document.getElementById("btnLessonNext");
const btnSpeak = document.getElementById("btnSpeak");

const quizQuestionEl = document.getElementById("quizQuestion");
const quizOptionsEl = document.getElementById("quizOptions");
const quizFeedbackEl = document.getElementById("quizFeedback");

const resultEmojiEl = document.getElementById("resultEmoji");
const resultTitleEl = document.getElementById("resultTitle");
const resultTextEl = document.getElementById("resultText");
const resultScoreEl = document.getElementById("resultScore");
const btnResultPrimary = document.getElementById("btnResultPrimary");

const btnActivityBack = document.getElementById("btnActivityBack");

// =======================================================
// VIEW WISSEL
// =======================================================

const btnBackFromStickers = document.getElementById("btnBackFromStickers");
const rewardBar = document.getElementById("rewardBar");
const stickerView = document.getElementById("stickerView");

// ============ VIEW WISSEL ============

function setView(view) {
  currentView = view;
  homeView.classList.add("hidden");
  mapView.classList.add("hidden");
  activityView.classList.add("hidden");
  stickerView.classList.add("hidden");
  if (writingView) writingView.classList.add("hidden");
  if (flashcardView) flashcardView.classList.add("hidden");

  if (view === "home") {
    homeView.classList.remove("hidden");
    updateRewardBar(); // update count on home
  }
  if (view === "map") mapView.classList.remove("hidden");
  if (view === "activity") activityView.classList.remove("hidden");
  if (view === "sticker") {
    stickerView.classList.remove("hidden");
    renderStickerBook();
  }
  if (view === "writing") {
    writingView.classList.remove("hidden");
  }
  if (view === "flashcard") {
    flashcardView.classList.remove("hidden");
  }
}

// Sticker navigatie
if (rewardBar) {
  rewardBar.addEventListener("click", () => {
    setView("sticker");
  });
}

if (btnBackFromStickers) {
  btnBackFromStickers.addEventListener("click", () => {
    if (currentActivityStep && currentActivityStep.dataKey === "sticker_check") {
      // Kwam vanuit roadmap
      markStepCompleted(currentActivityStep.id);
      setView("map");
      renderMap();
    } else {
      setView("home");
    }
  });
}

// =======================================================
// HOME LOGICA (niveau kiezen)
// =======================================================

document.querySelectorAll(".level-card").forEach(btn => {
  btn.addEventListener("click", () => {
    currentLevel = btn.dataset.level;
    setView("map");
    renderMap();
  });
});

// =======================================================
// MAP LOGICA (slotjes + ✔ + klik naar activiteit)
// =======================================================

btnBackHome.addEventListener("click", () => {
  setView("home");
});

// Slot-LOGICA: een stap is locked als de vorige stap nog NIET in completedSteps zit
function renderMap() {
  const roadmap = ROADMAPS[currentLevel];

  mapTitleEl.textContent =
    "Niveau: " + (currentLevel === "beginner"
      ? "Beginner"
      : currentLevel === "advanced"
        ? "Gevorderd"
        : "De Beste");

  mapStepsEl.innerHTML = "";

  roadmap.forEach((step, index) => {
    const stepId = step.id;

    // Deze stap ooit bezocht?
    const isVisited = visitedSteps.includes(stepId);

    // Vorige stap (binnen hetzelfde niveau)
    const prevStep = index > 0 ? roadmap[index - 1] : null;
    const prevDone =
      index === 0
        ? true                      // eerste stap is nooit op slot
        : visitedSteps.includes(prevStep.id);

    const isLocked = !prevDone;

    // =========== UI elementen ===========

    const row = document.createElement("div");
    row.className = "map-step";

    const icon = document.createElement("div");
    icon.className = "map-step-icon";
    const iconSpan = document.createElement("span");

    if (isLocked) {
      iconSpan.textContent = "🔒";
      icon.classList.add("icon-locked");
    } else if (isVisited) {
      iconSpan.textContent = "✔";
      icon.classList.add("icon-completed");
    } else {
      iconSpan.textContent = step.icon;
      icon.classList.add("icon-active");
    }
    icon.setAttribute("role", "button");
    icon.setAttribute("tabindex", "0");
    icon.setAttribute("aria-label", `Start ${step.title}`);

    // Enter-toets support
    icon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        handleClick();
      }
    });

    icon.appendChild(iconSpan);

    const card = document.createElement("div");
    card.className = "map-step-card";
    if (isLocked) {
      card.classList.add("card-locked");
    } else if (isVisited) {
      card.classList.add("card-completed");
    }

    const title = document.createElement("h3");
    title.textContent = step.title;

    const p = document.createElement("p");
    p.textContent = isLocked
      ? "Maak eerst de vorige opdracht af"
      : isVisited
        ? "Al een keer geoefend"
        : "Klik om te starten";

    card.appendChild(title);
    card.appendChild(p);

    function handleClick() {
      if (isLocked) return;       // op slot → niets doen
      startActivity(step);
    }

    icon.addEventListener("click", handleClick);
    card.addEventListener("click", handleClick);

    row.appendChild(icon);
    row.appendChild(card);
    mapStepsEl.appendChild(row);
  });
}


// =======================================================
// ACTIVITEIT LOGICA (LES + QUIZ)
// =======================================================

btnActivityBack.addEventListener("click", () => {
  setView("map");
});

// Volgende in les
btnLessonNext.addEventListener("click", () => {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  if (currentSlide < data.content.length - 1) {
    currentSlide++;
    renderLessonSlide();
  } else {
    showResultForActivity();
  }
});

// Vorige in les
btnLessonPrev.addEventListener("click", () => {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  if (!data || data.type !== "lesson") return;
  if (currentSlide > 0) {
    currentSlide--;
    renderLessonSlide();
  }
});

// TTS-button
btnSpeak.addEventListener("click", () => {
  if (!currentActivityStep) return;
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  if (data.type !== "lesson") return;
  const slide = data.content[currentSlide];
  if (!slide) return;

  if (isSpeaking) return;
  isSpeaking = true;
  btnSpeak.classList.add("disabled");
  btnSpeak.textContent = "Laden...";

  // we geven de hele slide door (letters, klanken, woorden)
  speak(slide, (loading) => {
    isSpeaking = loading;
    if (!loading) {
      btnSpeak.classList.remove("disabled");
      btnSpeak.textContent = "🔊 Afspelen";
    }
  });
});
// ===== STICKERS / BELONINGEN =====

// bron voor stickers: als visitedSteps bestaat en gevuld is, gebruik die,
// anders gewoon completedSteps in deze sessie.
function getStickerSource() {
  if (typeof visitedSteps !== "undefined" &&
    Array.isArray(visitedSteps) &&
    visitedSteps.length > 0) {
    return visitedSteps;
  }
  return completedSteps;
}

function renderStickers() {
  if (!rewardStickersEl) return;

  const source = getStickerSource();
  const count = source.length;

  if (!count) {
    rewardStickersEl.textContent = "Nog geen stickers…";
    return;
  }

  const maxIcons = 10;
  const icons = "⭐".repeat(Math.min(count, maxIcons));

  if (count > maxIcons) {
    rewardStickersEl.textContent = `${icons} x${count}`;
  } else {
    rewardStickersEl.textContent = icons;
  }
}


// Result-knop: verder of opnieuw
btnResultPrimary.addEventListener("click", () => {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const isLesson = data.type === "lesson";
  const isMemory = data.type === "memory";
  const total = !isLesson && !isMemory ? data.questions.length : 0;
  const percentage = !isLesson && !isMemory && total > 0
    ? Math.round((quizScore / total) * 100)
    : 100;
  const passed = isLesson || isMemory || percentage >= 70;

  if (passed) {
    if (!completedSteps.includes(currentActivityStep.id)) {
      completedSteps.push(currentActivityStep.id);
    }

    // stickers opnieuw tekenen
    renderStickers();

    resultContentEl.classList.add("hidden");
    setView("map");
    renderMap();
  } else {
    resultContentEl.classList.add("hidden");
    startActivity(currentActivityStep, true);
  }
});

function startActivity(step, retry) {
  // 1. huidige activiteit instellen
  currentActivityStep = step;
  currentSlide = 0;
  quizScore = 0;

  // 2. BELANGRIJK: deze stap markeren als bezocht (voor de slot-logica)
  markStepVisited(step.id);

  // 3. data voor deze stap ophalen
  const data = CONTENT_DATA[step.dataKey];

  // 4. titel en voortgang instellen
  activityTitleEl.textContent =
    data.type === "quiz" ? "Quiz Tijd!" : data.title;

  activityProgressEl.textContent = "";

  // 5. juiste view tonen
  setView("activity");
  resultContentEl.classList.add("hidden");
  quizFeedbackEl.textContent = "";
  quizFeedbackEl.className = "quiz-feedback";

  // 6. kiezen tussen les, quiz, memory of nieuwe types
  if (data.type === "lesson") {
    lessonContentEl.classList.remove("hidden");
    quizContentEl.classList.add("hidden");
    memoryContentEl.classList.add("hidden");
    renderLessonSlide();
  } else if (data.type === "quiz") {
    lessonContentEl.classList.add("hidden");
    quizContentEl.classList.remove("hidden");
    memoryContentEl.classList.add("hidden");
    renderQuizSlide();
  } else if (data.type === "memory") {
    lessonContentEl.classList.add("hidden");
    quizContentEl.classList.add("hidden");
    memoryContentEl.classList.remove("hidden");
    renderMemoryGame();
  } else if (data.type === "writing") {
    startWritingSession();
  } else if (data.type === "flashcards") {
    startFlashcardsSession();
  } else if (data.type === "sticker") {
    setView("sticker");
  }
}


// ===== LES =====

function renderLessonSlide() {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const slide = data.content[currentSlide];

  // Display emoji if present
  if (slide.emoji) {
    lessonArabicEl.innerHTML = `<div class="lesson-emoji">${slide.emoji}</div>${slide.arabic}`;
  } else {
    lessonArabicEl.textContent = slide.arabic;
  }

  lessonNameEl.textContent = slide.name;
  lessonDescEl.textContent = slide.description;

  const total = data.content.length;
  activityProgressEl.textContent = `${currentSlide + 1} / ${total}`;
  btnLessonNext.textContent =
    currentSlide === total - 1 ? "Afronden" : "Volgende";

  if (currentSlide === 0) {
    btnLessonPrev.style.visibility = "hidden";
  } else {
    btnLessonPrev.style.visibility = "visible";
  }
}

// ===== QUIZ =====

function renderQuizHeader(total) {
  const progress = (currentSlide / total) * 100;

  activityProgressEl.innerHTML = `
    <div class="quiz-progress-track">
      <div class="quiz-progress-fill" style="width: ${progress}%;"></div>
    </div>
    <div class="quiz-score-live">Score: ${quizScore}</div>
  `;
}

function renderQuizSlide() {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const q = data.questions[currentSlide];
  const total = data.questions.length;

  renderQuizHeader(total);

  if (!q) {
    console.error("Geen quizvraag voor index:", currentSlide);
    return;
  }

  quizQuestionEl.innerHTML = `
    ${q.question}
    <button class="quiz-audio-btn" id="quizAudioBtn" aria-label="Luister naar de letter">🔊</button>
  `;

  quizOptionsEl.innerHTML = "";
  quizFeedbackEl.textContent = "";
  quizFeedbackEl.className = "quiz-feedback";

  // Audio knop event listener
  const audioBtn = document.getElementById("quizAudioBtn");
  if (audioBtn && q.answer) {
    audioBtn.addEventListener("click", () => {
      speak(q.answer, (loading) => {
        if (loading) {
          audioBtn.textContent = "⏳";
          audioBtn.disabled = true;
        } else {
          audioBtn.textContent = "🔊";
          audioBtn.disabled = false;
        }
      });
    });
  }

  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(opt, q.answer));
    quizOptionsEl.appendChild(btn);
  });
}

function handleQuizAnswer(option, correct) {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const total = data.questions.length;

  const buttons = quizOptionsEl.querySelectorAll(".quiz-option");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    } else if (option === btn.textContent) {
      btn.classList.add("wrong");
    }
  });

  // Score-regels:
  // - Goed = +1
  // - Fout = -1, maar niet onder 0
  if (option === correct) {
    quizScore++;
    quizFeedbackEl.textContent = "Goed zo! 🎉";
    quizFeedbackEl.classList.add("good");
    playCorrectSound();
  } else {
    quizScore = Math.max(0, quizScore - 1);
    quizFeedbackEl.textContent = "Niet helemaal...";
    quizFeedbackEl.classList.add("bad");
    playWrongSound();
  }

  renderQuizHeader(total);

  clearTimeout(quizFeedbackTimeout);
  quizFeedbackTimeout = setTimeout(() => {
    if (currentSlide < data.questions.length - 1) {
      currentSlide++;
      renderQuizSlide();
    } else {
      showResultForActivity();
    }
  }, 1000);
}

// ===== RESULTAAT =====

function showResultForActivity() {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const isLesson = data.type === "lesson";

  resultContentEl.classList.remove("hidden");

  if (isLesson) {
    resultEmojiEl.textContent = "🎉";
    resultTitleEl.textContent = "Goed gedaan!";
    resultTextEl.textContent = "Je hebt " + data.title + " afgerond.";
    resultScoreEl.textContent = "";
    btnResultPrimary.textContent = "Ga verder";
  } else {
    const total = data.questions.length;
    const correct = quizScore;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= 70;

    if (passed) {
      resultEmojiEl.textContent = "🎉";
      resultTitleEl.textContent = "Goed gedaan!";
      resultTextEl.textContent = "Je hebt de quiz gehaald.";
      btnResultPrimary.textContent = "Ga verder";
    } else {
      resultEmojiEl.textContent = "😕";
      resultTitleEl.textContent = "Helaas...";
      resultTextEl.textContent = "Je hebt nog niet genoeg vragen goed. Probeer het nog eens!";
      btnResultPrimary.textContent = "Probeer opnieuw";
    }

    resultScoreEl.textContent =
      `Goed: ${correct}/${total}  |  Fout: ${wrong}  (${percentage}%)`;
  }
}

// =======================================================
// START APP
// =======================================================

setView("home");
renderStickers();

// =======================================================
// MEMORY GAME LOGICA
// =======================================================

let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

function renderMemoryGame() {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  if (!data || data.type !== "memory") return;

  // Reset game state
  memoryCards = [];
  flippedCards = [];
  matchedPairs = 0;

  // Maak paren: elk item 2x
  const pairs = data.pairs;
  const cards = [];
  pairs.forEach((pair, index) => {
    cards.push({ ...pair, pairId: index, uniqueId: `${index}-a` });
    cards.push({ ...pair, pairId: index, uniqueId: `${index}-b` });
  });

  // Shuffle de kaarten
  memoryCards = shuffleArray(cards);

  // Render grid
  memoryGridEl.innerHTML = "";
  activityProgressEl.textContent = `Paren: 0 / ${pairs.length}`;

  memoryCards.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "memory-card";
    cardEl.dataset.uniqueId = card.uniqueId;
    cardEl.dataset.pairId = card.pairId;

    cardEl.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-front">?</div>
        <div class="memory-card-back">${card.content}</div>
      </div>
    `;

    cardEl.addEventListener("click", () => handleMemoryCardClick(cardEl, card));
    memoryGridEl.appendChild(cardEl);
  });
}

function handleMemoryCardClick(cardEl, card) {
  // Negeer als kaart al geflipped of gematched is
  if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) {
    return;
  }

  // Negeer als er al 2 kaarten open zijn
  if (flippedCards.length >= 2) {
    return;
  }

  // Flip de kaart
  cardEl.classList.add("flipped");
  flippedCards.push({ cardEl, card });

  // Als er nu 2 kaarten open zijn, check voor match
  if (flippedCards.length === 2) {
    setTimeout(checkMemoryMatch, 600);
  }
}

function checkMemoryMatch() {
  const [first, second] = flippedCards;

  if (first.card.pairId === second.card.pairId) {
    // Match!
    first.cardEl.classList.add("matched");
    second.cardEl.classList.add("matched");
    playCorrectSound();
    matchedPairs++;

    const data = CONTENT_DATA[currentActivityStep.dataKey];
    const totalPairs = data.pairs.length;
    activityProgressEl.textContent = `Paren: ${matchedPairs} / ${totalPairs}`;

    // Check of alle paren gevonden zijn
    if (matchedPairs === totalPairs) {
      setTimeout(showMemoryResult, 800);
    }
  } else {
    // Geen match
    playWrongSound();
    setTimeout(() => {
      first.cardEl.classList.remove("flipped");
      second.cardEl.classList.remove("flipped");
    }, 800);
  }

  flippedCards = [];
}

function showMemoryResult() {
  resultContentEl.classList.remove("hidden");
  resultEmojiEl.textContent = "🎉";
  resultTitleEl.textContent = "Geweldig!";
  resultTextEl.textContent = "Je hebt alle paren gevonden!";
  resultScoreEl.textContent = "";
  btnResultPrimary.textContent = "Ga verder";
}

// Shuffle helper
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============ WRITING EXERCISES ============

const writingView = document.getElementById("writingView");
const btnStartWriting = document.getElementById("btnStartWriting");
const btnBackFromWriting = document.getElementById("btnBackFromWriting");
const btnClearCanvas = document.getElementById("btnClearCanvas");
const btnNextWriting = document.getElementById("btnNextWriting");
const writingCanvas = document.getElementById("writingCanvas");
const writingOverlay = document.getElementById("writingOverlay");
const writingLetterDisplay = document.getElementById("writingLetterDisplay");

let writingCtx = null;
let isDrawing = false;
let currentWritingIndex = 0;

// Letters om te oefenen (kan uitgebreid worden)
const WRITING_LETTERS = [
  // Basis
  "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض",
  "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",

  // Lange klanken (Alif, Ya, Waw)
  "بَا", "بِي", "بُو", // Ba
  "تَا", "تِي", "تُو", // Ta
  "ثَا", "ثِي", "ثُو", // Tha
  "جَا", "جِي", "جُو", // Jim
  "حَا", "حِي", "حُو", // Ha
  "خَا", "خِي", "خُو", // Kha
  "دَا", "دِي", "دُو", // Dal
  "ذَا", "ذِي", "ذُو", // Dhal
  "رَا", "رِي", "رُو", // Ra
  "زَا", "زِي", "زُو", // Zay
  "سَا", "سِي", "سُو", // Sin
  "شَا", "شِي", "شُو", // Shin
  "صَا", "صِي", "صُو", // Sad
  "ضَا", "ضِي", "ضُو", // Dad
  "طَا", "طِي", "طُو", // Ta (dik)
  "ظَا", "ظِي", "ظُو", // Za (dik)
  "عَا", "عِي", "عُو", // Ayn
  "غَا", "غِي", "غُو", // Ghayn
  "فَا", "فِي", "فُو", // Fa
  "قَا", "قِي", "قُو", // Qaf
  "كَا", "كِي", "كُو", // Kaf
  "لَا", "لِي", "لُو", // Lam
  "مَا", "مِي", "مُو", // Mim
  "نَا", "نِي", "نُو", // Nun
  "هَا", "هِي", "هُو", // Ha
  "وَا", "وِي", "وُو", // Waw
  "يَا", "يِي", "يُو"  // Ya
];

function initWriting() {
  if (!writingCanvas) return;
  writingCtx = writingCanvas.getContext("2d");

  // Canvas events
  writingCanvas.addEventListener("mousedown", startDraw);
  writingCanvas.addEventListener("mousemove", draw);
  writingCanvas.addEventListener("mouseup", stopDraw);
  writingCanvas.addEventListener("mouseout", stopDraw);

  // Touch events
  writingCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(e.touches[0]);
  });
  writingCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    draw(e.touches[0]);
  });
  writingCanvas.addEventListener("touchend", stopDraw);

  // Knoppen
  if (btnStartWriting) {
    btnStartWriting.addEventListener("click", () => {
      currentWritingIndex = 0;
      startWritingSession();
    });
  }

  if (btnBackFromWriting) {
    btnBackFromWriting.addEventListener("click", () => {
      if (currentActivityStep) {
        // Als we vanuit de map kwamen, markeer als gedaan?
        // Of gewoon terug. Laten we het als 'gedaan' markeren als ze tenminste iets gedaan hebben?
        // Voor nu: gewoon terug naar map en markeer als visited/completed.
        // Schrijven is oefenen, dus als je stopt is het 'klaar'.
        markStepCompleted(currentActivityStep.id);
        setView("map");
        renderMap(); // update slotjes
      } else {
        setView("home");
      }
    });
  }

  if (btnClearCanvas) {
    btnClearCanvas.addEventListener("click", clearCanvas);
  }

  if (btnNextWriting) {
    btnNextWriting.addEventListener("click", () => {
      currentWritingIndex = (currentWritingIndex + 1) % WRITING_LETTERS.length;
      loadWritingLetter();
    });
  }
}

function startWritingSession() {
  setView("writing");
  // Wacht even tot view zichtbaar is voor correcte canvas afmetingen
  setTimeout(() => {
    resizeCanvas();
    loadWritingLetter();
  }, 50);
}

function resizeCanvas() {
  // Zorg dat canvas resolutie matcht met weergave
  const rect = writingCanvas.getBoundingClientRect();
  writingCanvas.width = rect.width;
  writingCanvas.height = rect.height;

  // Stijl instellen
  writingCtx.lineWidth = 12;
  writingCtx.lineCap = "round";
  writingCtx.lineJoin = "round";
  writingCtx.strokeStyle = "#4f46e5"; // Kleur van de pen
}

function loadWritingLetter() {
  clearCanvas();
  const letter = WRITING_LETTERS[currentWritingIndex];
  writingOverlay.textContent = letter;
  writingLetterDisplay.textContent = letter;
}

function clearCanvas() {
  if (!writingCtx) return;
  writingCtx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
}

function startDraw(e) {
  isDrawing = true;
  const rect = writingCanvas.getBoundingClientRect();
  const x = (e.clientX || e.pageX) - rect.left;
  const y = (e.clientY || e.pageY) - rect.top;

  writingCtx.beginPath();
  writingCtx.moveTo(x, y);
}

function draw(e) {
  if (!isDrawing) return;
  const rect = writingCanvas.getBoundingClientRect();
  const x = (e.clientX || e.pageX) - rect.left;
  const y = (e.clientY || e.pageY) - rect.top;

  writingCtx.lineTo(x, y);
  writingCtx.stroke();
}

function stopDraw() {
  isDrawing = false;
  writingCtx.closePath();
}

// Init aanroepen
initWriting();

// ============ FLASHCARDS ============

const flashcardView = document.getElementById("flashcardView");
const btnStartFlashcards = document.getElementById("btnStartFlashcards");
const btnBackFromFlashcards = document.getElementById("btnBackFromFlashcards");
const btnNextFlashcard = document.getElementById("btnNextFlashcard");
const flashcardEl = document.getElementById("flashcard");
const flashcardFrontContent = document.getElementById("flashcardFrontContent");
const flashcardBackContent = document.getElementById("flashcardBackContent");

// Combineer letters en woorden voor flashcards
function getFlashcardItems() {
  const letters = CONTENT_DATA.intro_letters.content.map(c => ({
    front: c.arabic,
    back: c.name,
    type: "letter",
    audio: c.arabic // letter key for audio
  }));

  const words = WORD_ITEMS.map(w => ({
    front: w.arabic,
    back: w.nl,
    type: "word",
    audio: w.id // word id for audio
  }));

  return [...letters, ...words];
}

let flashcardItems = [];
let currentFlashcardItem = null;

function initFlashcards() {
  if (btnStartFlashcards) {
    btnStartFlashcards.addEventListener("click", startFlashcardsSession);
  }

  if (btnBackFromFlashcards) {
    btnBackFromFlashcards.addEventListener("click", () => {
      if (currentActivityStep) {
        markStepCompleted(currentActivityStep.id);
        setView("map");
        renderMap();
      } else {
        setView("home");
      }
    });
  }

  if (flashcardEl) {
    flashcardEl.addEventListener("click", () => {
      flashcardEl.classList.toggle("flipped");
      if (currentFlashcardItem) {
        // Optioneel: speel audio bij klik
      }
    });
  }

  if (btnNextFlashcard) {
    btnNextFlashcard.addEventListener("click", nextFlashcard);
  }
}

function startFlashcardsSession() {
  flashcardItems = getFlashcardItems();
  setView("flashcard");
  nextFlashcard();
}

function nextFlashcard() {
  // Reset flip
  if (flashcardEl) flashcardEl.classList.remove("flipped");

  // Wacht even op animatie als hij geflipped was
  setTimeout(() => {
    // Kies willekeurig item
    const idx = Math.floor(Math.random() * flashcardItems.length);
    currentFlashcardItem = flashcardItems[idx];

    // Render
    flashcardFrontContent.textContent = currentFlashcardItem.front;
    flashcardBackContent.textContent = currentFlashcardItem.back;

    // Speel audio
    let speakTarget = null;
    if (currentFlashcardItem.type === "letter") {
      speakTarget = currentFlashcardItem.front;
    } else {
      speakTarget = { audio: `audio/word_${currentFlashcardItem.audio}.mp3` };
    }

    speak(speakTarget, () => { });

  }, 200);
}

// Init
initFlashcards();
