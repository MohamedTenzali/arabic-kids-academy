from gtts import gTTS  # pip install gTTS
from pathlib import Path

# Zelfde lijst als in app.js (SENTENCE_ITEMS)
SENTENCE_ITEMS = [
    {"id": "ana_uhibbu_abi", "arabic": "أَنَا أُحِبُّ أَبِي"},
    {"id": "ana_uhibbu_ummi", "arabic": "أَنَا أُحِبُّ أُمِّي"},
    {"id": "al_baytu_kabirun", "arabic": "الْبَيْتُ كَبِيرٌ"},
    {"id": "ana_ismii_ali", "arabic": "أَنَا اسْمِي عَلِيّ"},
    {"id": "ana_ismii_maryam", "arabic": "أَنَا اسْمِي مَرْيَم"},
    {"id": "indi_qittah", "arabic": "عِنْدِي قِطَّةٌ"},
    {"id": "indi_kalb", "arabic": "عِنْدِي كَلْبٌ"},
    {"id": "uhibbu_al_qiraah", "arabic": "أُحِبُّ الْقِرَاءَةَ"},
    {"id": "adhhabu_ila_al_madrasa", "arabic": "أَذْهَبُ إِلَى الْمَدْرَسَةِ"},
    {"id": "nalabu_fi_al_hadiqa", "arabic": "نَلْعَبُ فِي الْحَدِيقَةِ"},
]

BASE_DIR = Path(__file__).parent
audio_dir = BASE_DIR / "audio"
audio_dir.mkdir(exist_ok=True)

for item in SENTENCE_ITEMS:
    out_path = audio_dir / f"sentence_{item['id']}.mp3"
    print("Maak:", out_path)
    tts = gTTS(text=item["arabic"], lang="ar")
    tts.save(str(out_path))

print("Klaar: alle zinnen-audio is gemaakt.")
