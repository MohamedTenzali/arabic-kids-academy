const vowelTypes = [
  {
    "id": "fatha",
    "mark": "َ",
    "nameNl": "Fatha",
    "soundNl": "korte a",
    "group": "short"
  },
  {
    "id": "kasra",
    "mark": "ِ",
    "nameNl": "Kasra",
    "soundNl": "korte i",
    "group": "short"
  },
  {
    "id": "damma",
    "mark": "ُ",
    "nameNl": "Damma",
    "soundNl": "korte oe",
    "group": "short"
  },
  {
    "id": "aa",
    "mark": "َا",
    "nameNl": "Lange aa",
    "soundNl": "lange aa",
    "group": "long"
  },
  {
    "id": "ii",
    "mark": "ِي",
    "nameNl": "Lange ie",
    "soundNl": "lange ie",
    "group": "long"
  },
  {
    "id": "uu",
    "mark": "ُو",
    "nameNl": "Lange oe",
    "soundNl": "lange oe",
    "group": "long"
  }
];

const vowels = vowelTypes.filter((vowel) => vowel.group === "short");

window.vowelTypes = vowelTypes;
window.vowelTypesById = Object.fromEntries(vowelTypes.map((vowel) => [vowel.id, vowel]));
window.vowels = vowels;
