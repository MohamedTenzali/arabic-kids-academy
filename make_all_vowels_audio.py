from gtts import gTTS
import os

# Map van Arabische letter → sleutel (moet gelijk zijn aan LETTER_KEYS in app.js)
LETTER_KEYS = {
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
    "و": "waw",
    "ي": "ya",
}

BASE_LETTERS = list(LETTER_KEYS.keys())

SHORT_VOWELS = [
    ("a_short", "َ"),  # fatha
    ("i_short", "ِ"),  # kasra
    ("u_short", "ُ"),  # damma
]

LONG_VOWELS = [
    ("a_long", "ا"),   # lange aa
    ("i_long", "ي"),   # lange ie
    ("u_long", "و"),   # lange oe
]

AUDIO_DIR = "audio"


def ensure_audio_dir():
    if not os.path.isdir(AUDIO_DIR):
        os.makedirs(AUDIO_DIR, exist_ok=True)


def make_clip(letter, key, suffix, mark):
    text = letter + mark  # bijv. بَ of بَا
    filename = os.path.join(AUDIO_DIR, f"{key}_{suffix}.mp3")
    if os.path.exists(filename):
        print("Bestaat al, sla over:", filename)
        return
    print("Maak:", filename, "voor tekst:", text)
    tts = gTTS(text=text, lang="ar")
    tts.save(filename)


def main():
    ensure_audio_dir()

    for letter in BASE_LETTERS:
        key = LETTER_KEYS[letter]

        # Korte klinkers
        for suffix, mark in SHORT_VOWELS:
            make_clip(letter, key, suffix, mark)

        # Lange klinkers
        for suffix, mark in LONG_VOWELS:
            make_clip(letter, key, suffix, mark)


if __name__ == "__main__":
    main()
