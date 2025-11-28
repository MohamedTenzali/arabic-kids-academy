from gtts import gTTS
import os

AUDIO_DIR = "audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# sleutel = latijnse naam, waarde = Arabische letter
BASES = {
    "ba": "ب",
    "ta": "ت",
    "tha": "ث",
    "jim": "ج",
    "ha_zacht": "ح",
    "kha": "خ",
    "dal": "د",
    "dhal": "ذ",
    "ra": "ر",
    "zay": "ز",
    "sin": "س",
    "shin": "ش",
    "sad": "ص",
    "dad": "ض",
    "ta_dik": "ط",
    "za_dik": "ظ",
    "ayn": "ع",
    "ghayn": "غ",
    "fa": "ف",
    "qaf": "ق",
    "kaf": "ك",
    "lam": "ل",
    "mim": "م",
    "nun": "ن",
    "ha": "ه",
    "waw": "و",
    "ya": "ي",
}

SHORT_VOWELS = {
    "a_short": "َ",   # korte a
    "i_short": "ِ",   # korte i
    "u_short": "ُ",   # korte oe
}

LONG_VOWELS = {
    "a_long": "ا",    # lange aa
    "i_long": "ي",    # lange ie
    "u_long": "و",    # lange oe
}

def main():
    for code, letter in BASES.items():
        # korte klanken
        for suffix, diacritic in SHORT_VOWELS.items():
            arabic_text = letter + diacritic
            filename = f"{code}_{suffix}.mp3"
            path = os.path.join(AUDIO_DIR, filename)
            print(f"Maak korte klank: {arabic_text}  ->  {path}")
            tts = gTTS(text=arabic_text, lang="ar")
            tts.save(path)

        # lange klanken
        for suffix, extender in LONG_VOWELS.items():
            arabic_text = letter + extender
            filename = f"{code}_{suffix}.mp3"
            path = os.path.join(AUDIO_DIR, filename)
            print(f"Maak lange klank: {arabic_text}  ->  {path}")
            tts = gTTS(text=arabic_text, lang="ar")
            tts.save(path)

    print("\nKlaar! Alle klank-bestanden zijn opgeslagen in de map 'audio/'.")

if __name__ == "__main__":
    main()
