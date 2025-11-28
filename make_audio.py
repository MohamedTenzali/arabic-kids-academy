from gtts import gTTS
import os

letters = {
    "alif": "أ",
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
    "ya": "ي"
}

os.makedirs("audio", exist_ok=True)

for name, arabic in letters.items():
    tts = gTTS(text=arabic, lang="ar")
    filename = f"audio/{name}.mp3"
    tts.save(filename)
    print("[✔] Opgeslagen:", filename)

print("\nAlle 28 mp3-bestanden zijn klaar!")
