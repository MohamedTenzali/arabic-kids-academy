
const APP_VERSION = "v1.2.0 - 2025-11-28";


// ===================== AUDIO: BASISLETTERS =====================

// Alleen losse letters hier. Klanken (korte/lange) worden automatisch
// via een bestandsnaam-regel opgezocht.
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

// ===================== KLANK-NAAMGEVING VOOR AUDIO =====================

// Sleutelnaam voor elke letter: gebruik je ook in de bestandsnamen.
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

// Lange klinkers (met alif / yaa / waaw)
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

// ===================== WOORDEN DATA + GENERATOR =====================

// Basis-woordenlijst: id wordt gebruikt in de bestandsnaam: audio/word_<id>.mp3
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
  { id: "talib", arabic: "طَالِب", name: "Talib", nl: "Leerling" }
];

// Generator: bouwt slides voor make_words, met audio-pad
function generateWordSlides() {
  return WORD_ITEMS.map(item => ({
    arabic: item.arabic,
    name: item.name,
    description: `Betekent: ${item.nl}.`,
    audio: `audio/word_${item.id}.mp3`
  }));
}
// ===================== ZINNEN DATA + GENERATOR =====================

// 10 voorbeeldzinnen. id gebruik je voor bestandsnaam: audio/sentence_<id>.mp3
const SENTENCE_ITEMS = [
  {
    id: "ana_uhibbu_abi",
    arabic: "أَنَا أُحِبُّ أَبِي",
    name: "Ana uhibbu abii",
    nl: "Ik hou van mijn vader."
  },
  {
    id: "ana_uhibbu_ummi",
    arabic: "أَنَا أُحِبُّ أُمِّي",
    name: "Ana uhibbu ummii",
    nl: "Ik hou van mijn moeder."
  },
  {
    id: "al_baytu_kabirun",
    arabic: "الْبَيْتُ كَبِيرٌ",
    name: "Al-baytu kabirun",
    nl: "Het huis is groot."
  },
  {
    id: "ana_ismii_ali",
    arabic: "أَنَا اسْمِي عَلِيّ",
    name: "Ana ismii Ali",
    nl: "Ik heet Ali."
  },
  {
    id: "ana_ismii_maryam",
    arabic: "أَنَا اسْمِي مَرْيَم",
    name: "Ana ismii Maryam",
    nl: "Ik heet Maryam."
  },
  {
    id: "indi_qittah",
    arabic: "عِنْدِي قِطَّةٌ",
    name: "ʿindii qitta",
    nl: "Ik heb een kat."
  },
  {
    id: "indi_kalb",
    arabic: "عِنْدِي كَلْبٌ",
    name: "ʿindii kalb",
    nl: "Ik heb een hond."
  },
  {
    id: "uhibbu_al_qiraah",
    arabic: "أُحِبُّ الْقِرَاءَةَ",
    name: "Uhibbu al-qirāʾa",
    nl: "Ik hou van lezen."
  },
  {
    id: "adhhabu_ila_al_madrasa",
    arabic: "أَذْهَبُ إِلَى الْمَدْرَسَةِ",
    name: "Adhhabu ilā al-madrasa",
    nl: "Ik ga naar school."
  },
  {
    id: "nalabu_fi_al_hadiqa",
    arabic: "نَلْعَبُ فِي الْحَدِيقَةِ",
    name: "Nalʿabu fī al-ḥadīqa",
    nl: "We spelen in de tuin."
  }
];

// Generator: maakt slides voor Zinnen Vormen met audio-pad
function generateSentenceSlides() {
  return SENTENCE_ITEMS.map(item => ({
    arabic: item.arabic,
    name: item.name,
    description: `Betekent: ${item.nl}.`,
    audio: `audio/sentence_${item.id}.mp3`
  }));
}


// ===================== SPEAK FUNCTIE (LOKALE AUDIO) =====================

function speak(target, setLoading) {
  setLoading(true);

  let src = null;

  // 1) target kan een string zijn (bijv. "أ" of "بَ")
  if (typeof target === "string") {
    src = AUDIO_FILES[target] || resolveVowelAudio(target);
  }

  // 2) of een slide-object { arabic, audio, ... }
  if (!src && target && typeof target === "object") {
    if (target.audio) {
      // woorden + klanken met eigen audiopad
      src = target.audio;
    } else if (target.arabic) {
      // eerst losse letter, dan klankbestanden
      src = AUDIO_FILES[target.arabic] || resolveVowelAudio(target.arabic);
    }
  }

  if (!src) {
    console.warn("Geen audio-bestand gevonden voor:", target);
    setLoading(false);
    return;
  }

  // stop eventueel vorige audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = new Audio(src);
  currentAudio = audio;

  audio.addEventListener("ended", () => {
    currentAudio = null;
    setLoading(false);
  });

  audio.addEventListener("error", () => {
    console.error("Kon audio niet afspelen:", src);
    currentAudio = null;
    setLoading(false);
  });

  audio.play().catch(err => {
    console.error("Fout bij starten audio:", err);
    currentAudio = null;
    setLoading(false);
  });
}

// ===================== DATA =====================

const CONTENT_DATA = {
  // Alfabet – 28 letters
  intro_letters: {
    title: "Het Alfabet",
    type: "lesson",
    content: [
      { arabic: "أ", name: "Alif", description: "Klinkt als een lange 'aa' (zoals in 'kaas')." },
      { arabic: "ب", name: "Ba", description: "Klinkt als de 'b' in 'boom'." },
      { arabic: "ت", name: "Ta", description: "Klinkt als de 't' in 'tafel'." },
      { arabic: "ث", name: "Tha", description: "Klinkt als 'th' in 'think' (zachte th)." },
      { arabic: "ج", name: "Jim", description: "Klinkt als de 'dj' in 'djoek' of 'djeep'." },
      { arabic: "ح", name: "Ha (zacht)", description: "Een zachte 'h' uit de keel, zwaarder dan Nederlands." },
      { arabic: "خ", name: "Kha", description: "Klinkt als een harde 'ch' in 'gracht'." },
      { arabic: "د", name: "Dal", description: "Klinkt als de 'd' in 'deur'." },
      { arabic: "ذ", name: "Dhal", description: "Klinkt als 'th' in 'this' (harde th)." },
      { arabic: "ر", name: "Ra", description: "Een rollende 'r'." },
      { arabic: "ز", name: "Zay", description: "Klinkt als de 'z' in 'zon'." },
      { arabic: "س", name: "Sin", description: "Klinkt als de 's' in 'sok'." },
      { arabic: "ش", name: "Shin", description: "Klinkt als 'sj' in 'sjaal'." },
      { arabic: "ص", name: "Sad", description: "Een zware 's', dikker uitgesproken." },
      { arabic: "ض", name: "Dad", description: "Zware 'd' (Arabische speciale letter)." },
      { arabic: "ط", name: "Ta (dik)", description: "Zware/dikke 't'." },
      { arabic: "ظ", name: "Za (dik)", description: "Zware 'z', lijkt op harde 'th' maar dikker." },
      { arabic: "ع", name: "Ayn", description: "Keelklank, geen exacte Nederlandse klank." },
      { arabic: "غ", name: "Ghayn", description: "Klinkt als Franse / Arabische 'gh'." },
      { arabic: "ف", name: "Fa", description: "Klinkt als de 'f' in 'fiets'." },
      { arabic: "ق", name: "Qaf", description: "Een harde 'k' uit de keel." },
      { arabic: "ك", name: "Kaf", description: "Normale 'k' zoals in 'kat'." },
      { arabic: "ل", name: "Lam", description: "Klinkt als de 'l' in 'lamp'." },
      { arabic: "م", name: "Mim", description: "Klinkt als de 'm' in 'maan'." },
      { arabic: "ن", name: "Nun", description: "Klinkt als de 'n' in 'neus'." },
      { arabic: "هـ", name: "Ha", description: "Normale 'h' zoals in 'huis'." },
      { arabic: "و", name: "Waw", description: "Klinkt als 'w' in 'water' of lange 'oe'." },
      { arabic: "ي", name: "Ya", description: "Klinkt als 'j' in 'jas' of lange 'ie'." }
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
      { question: "Welke maakt een lange 'oe'?",   options: ["بَا", "بِي", "بُو"], answer: "بُو" }

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
    content: generateSentenceSlides()
  },

  // Eind examen – mix van letters, klanken, woorden en zinnen
final_exam: {
  title: "Eind Examen",
  type: "quiz",
  questions: [
    // Letters (6)
    { question: "Welke letter heet 'Alif'?",  options: ["أ", "ب", "ت"], answer: "أ" },
    { question: "Welke letter heet 'Ba'?",    options: ["ث", "ب", "ن"], answer: "ب" },
    { question: "Welke letter heet 'Shin'?",  options: ["س", "ش", "ص"], answer: "ش" },
    { question: "Welke letter heet 'Qaf'?",   options: ["ق", "ك", "ف"], answer: "ق" },
    { question: "Welke letter heet 'Ayn'?",   options: ["ع", "غ", "ا"], answer: "ع" },
    { question: "Welke letter heet 'Ghayn'?", options: ["ق", "غ", "ف"], answer: "غ" },

    // Klanken (4)
    { question: "Welke klank is بَ ?", options: ["ba", "bi", "boe"], answer: "ba" },
    { question: "Welke klank is بِ ?", options: ["ba", "bi", "boe"], answer: "bi" },
    { question: "Welke klank is بُ ?", options: ["ba", "bi", "boe"], answer: "boe" },
    { question: "Welke geeft een lange 'aa'?", options: ["بَا", "بِ", "بُ"], answer: "بَا" },

    // Woorden (5)
    { question: "Wat betekent 'Baab' (بَاب) ?",   options: ["Huis", "Deur", "Boek"], answer: "Deur" },
    { question: "Wat betekent 'Bayt' (بَيْت) ?",  options: ["Huis", "Vader", "Moeder"], answer: "Huis" },
    { question: "Wat betekent 'Kitaab' (كِتَاب) ?", options: ["Boek", "Deur", "Huis"], answer: "Boek" },
    { question: "Wat betekent 'Walad' (وَلَد) ?", options: ["Jongen", "Meisje", "Auto"], answer: "Jongen" },
    { question: "Wat betekent 'Bint' (بِنْت) ?",  options: ["Jongen", "Melk", "Meisje"], answer: "Meisje" },

    // Zinnen (5)
    {
      question: "Wat betekent: أَنَا أُحِبُّ أَبِي ?",
      options: ["Ik hou van mijn vader.", "Het huis is groot.", "Ik lees een boek."],
      answer: "Ik hou van mijn vader."
    },
    {
      question: "Wat betekent: أَنَا أُحِبُّ أُمِّي ?",
      options: ["Ik ga naar school.", "Ik hou van mijn moeder.", "We spelen in de tuin."],
      answer: "Ik hou van mijn moeder."
    },
    {
      question: "Wat betekent: الْبَيْتُ كَبِيرٌ ?",
      options: ["Het huis is groot.", "De deur is gesloten.", "Het boek is mooi."],
      answer: "Het huis is groot."
    },
    {
      question: "Wat betekent: أَذْهَبُ إِلَى الْمَدْرَسَةِ ?",
      options: ["Ik ga naar school.", "Ik heb een kat.", "Ik heet Ali."],
      answer: "Ik ga naar school."
    },
    {
      question: "Wat betekent: نَلْعَبُ فِي الْحَدِيقَةِ ?",
      options: ["We spelen in de tuin.", "Ik hou van koffie.", "Ik ga slapen."],
      answer: "We spelen in de tuin."
    }
  ]
}
};

// ===================== ROADMAPS =====================

const ROADMAPS = {
  beginner: [
    { id: "step1", dataKey: "intro_letters", title: "1. Letters Leren", icon: "📖" },
    { id: "step2", dataKey: "quiz_letters", title: "2. Quiz: Letters", icon: "★" },
    { id: "step3", dataKey: "intro_vowels", title: "3. Klanken", icon: "🔊" },
    { id: "step4", dataKey: "quiz_vowels", title: "4. Quiz: Klanken", icon: "★" },
    { id: "step5", dataKey: "make_words", title: "5. Woorden Maken", icon: "📖" },
    { id: "step6", dataKey: "sentences", title: "6. Zinnen", icon: "📖" },
    { id: "step7", dataKey: "final_exam", title: "7. Eind Examen", icon: "🏆", isFinal: true }
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

// ===================== STATE =====================

let currentView = "home";
let currentLevel = null;
let completedSteps = [];
let currentActivityStep = null;
let currentSlide = 0;
let quizScore = 0;
let quizFeedbackTimeout = null;
let isSpeaking = false;
let currentAudio = null;   // huidig spelend audio-object

// ===================== DOM =====================

const homeView = document.getElementById("homeView");
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

// ===================== VIEW WISSEL =====================

function setView(view) {
  currentView = view;
  homeView.classList.add("hidden");
  mapView.classList.add("hidden");
  activityView.classList.add("hidden");

  if (view === "home") homeView.classList.remove("hidden");
  if (view === "map") mapView.classList.remove("hidden");
  if (view === "activity") activityView.classList.remove("hidden");
}

// ===================== HOME LOGICA =====================

document.querySelectorAll(".level-card").forEach(btn => {
  btn.addEventListener("click", () => {
    currentLevel = btn.dataset.level;
    setView("map");
    renderMap();
  });
});

// ===================== MAP LOGICA =====================

btnBackHome.addEventListener("click", () => {
  setView("home");
});

function renderMap() {
  const roadmap = ROADMAPS[currentLevel];

  mapTitleEl.textContent =
    "Niveau: " +
    (currentLevel === "beginner"
      ? "Beginner"
      : currentLevel === "advanced"
      ? "Gevorderd"
      : "De Beste");

  mapStepsEl.innerHTML = "";

  roadmap.forEach((step, index) => {
    const isCompleted = completedSteps.includes(step.id);
    // SLOT: stap > 0 is pas open als vorige stap voltooid is
    const isLocked =
      index > 0 && !completedSteps.includes(roadmap[index - 1].id);

    const row = document.createElement("div");
    row.className = "map-step";

    const icon = document.createElement("div");
    icon.className = "map-step-icon";
    const iconSpan = document.createElement("span");

    if (isLocked) {
      iconSpan.textContent = "🔒";
      icon.classList.add("icon-locked");
    } else if (isCompleted) {
      iconSpan.textContent = "✔";
      icon.classList.add("icon-completed");
    } else {
      iconSpan.textContent = step.icon;
      icon.classList.add("icon-active");
    }
    icon.appendChild(iconSpan);

    const card = document.createElement("div");
    card.className = "map-step-card";

    if (isLocked) {
      card.classList.add("card-locked");
    } else if (isCompleted) {
      card.classList.add("card-completed");
    }

    const title = document.createElement("h3");
    title.textContent = step.title;

    const p = document.createElement("p");
    p.textContent = isLocked
      ? "Voltooi eerst de vorige stap"
      : isCompleted
      ? "Voltooid!"
      : "Klik om te starten";

    card.appendChild(title);
    card.appendChild(p);

    function handleClick() {
      if (isLocked) return; // geblokkeerd
      startActivity(step);
    }

    icon.addEventListener("click", handleClick);
    card.addEventListener("click", handleClick);

    row.appendChild(icon);
    row.appendChild(card);
    mapStepsEl.appendChild(row);
  });
}


// ===================== ACTIVITEIT LOGICA =====================

btnActivityBack.addEventListener("click", () => {
  setView("map");
});

btnLessonNext.addEventListener("click", () => {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  if (currentSlide < data.content.length - 1) {
    currentSlide++;
    renderLessonSlide();
  } else {
    showResultForActivity();
  }
});

btnLessonPrev.addEventListener("click", () => {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  if (!data || data.type !== "lesson") return;
  if (currentSlide > 0) {
    currentSlide--;
    renderLessonSlide();
  }
});

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

  // hele slide doorgeven (zodat woorden ook hun audio-pad hebben)
  speak(slide, (loading) => {
    isSpeaking = loading;
    if (!loading) {
      btnSpeak.classList.remove("disabled");
      btnSpeak.textContent = "🔊 Afspelen";
    }
  });
});

btnResultPrimary.addEventListener("click", () => {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const isLesson = data.type === "lesson";
  const total = !isLesson ? data.questions.length : 0;
  const percentage = !isLesson && total > 0
    ? Math.round((quizScore / total) * 100)
    : 100;
  const passed = isLesson || percentage >= 70;

  if (passed) {
    if (!completedSteps.includes(currentActivityStep.id)) {
      completedSteps.push(currentActivityStep.id);
    }
    resultContentEl.classList.add("hidden");
    setView("map");
    renderMap();
  } else {
    resultContentEl.classList.add("hidden");
    startActivity(currentActivityStep, true);
  }
});

function startActivity(step, retry) {
  currentActivityStep = step;
  currentSlide = 0;
  quizScore = 0;

  const data = CONTENT_DATA[step.dataKey];

  activityTitleEl.textContent =
    data.type === "quiz" ? "Quiz Tijd!" : data.title;

  activityProgressEl.textContent = "";

  setView("activity");
  resultContentEl.classList.add("hidden");
  quizFeedbackEl.textContent = "";
  quizFeedbackEl.className = "quiz-feedback";

  if (data.type === "lesson") {
    lessonContentEl.classList.remove("hidden");
    quizContentEl.classList.add("hidden");
    renderLessonSlide();
  } else {
    lessonContentEl.classList.add("hidden");
    quizContentEl.classList.remove("hidden");
    renderQuizSlide();
  }
}

// ===== LES =====

function renderLessonSlide() {
  const data = CONTENT_DATA[currentActivityStep.dataKey];
  const slide = data.content[currentSlide];

  lessonArabicEl.textContent = slide.arabic;
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

  quizQuestionEl.textContent = q.question;
  quizOptionsEl.innerHTML = "";
  quizFeedbackEl.textContent = "";
  quizFeedbackEl.className = "quiz-feedback";

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

  if (option === correct) {
    quizScore++;
    quizFeedbackEl.textContent = "Goed zo! 🎉";
    quizFeedbackEl.classList.add("good");
  } else {
    quizScore = Math.max(0, quizScore - 1);
    quizFeedbackEl.textContent = "Niet helemaal...";
    quizFeedbackEl.classList.add("bad");
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

// Start
setView("home");
