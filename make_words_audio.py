from pathlib import Path
from gtts import gTTS  # pip install gTTS

WORD_ITEMS = [
    {"id": "baab",   "text": "بَاب"},
    {"id": "bayt",   "text": "بَيْت"},
    {"id": "kitaab", "text": "كِتَاب"},
    {"id": "ab",     "text": "أَب"},
    {"id": "umm",    "text": "أُمّ"},
    {"id": "walad",  "text": "وَلَد"},
    {"id": "bint",   "text": "بِنْت"},
    {"id": "madrasa","text": "مَدْرَسَة"},
    {"id": "kursi",  "text": "كُرْسِيّ"},
    {"id": "maktab", "text": "مَكْتَب"},
    {"id": "qalb",   "text": "قَلْب"},
    {"id": "yad",    "text": "يَد"},
    {"id": "ain",    "text": "عَيْن"},
    {"id": "ras",    "text": "رَأْس"},
    {"id": "samaa",  "text": "سَمَاء"},
    {"id": "shams",  "text": "شَمْس"},
    {"id": "qamar",  "text": "قَمَر"},
    {"id": "maa",    "text": "مَاء"},
    {"id": "laban",  "text": "لَبَن"},
    {"id": "tuffah", "text": "تُفَّاح"},
    {"id": "khubz",  "text": "خُبْز"},
    {"id": "sukar",  "text": "سُكَّر"},
    {"id": "qahwa",  "text": "قَهْوَة"},
    {"id": "halib",  "text": "حَلِيب"},
    {"id": "sayyara","text": "سَيَّارَة"},
    {"id": "babun",  "text": "بَابٌ"},
    {"id": "baytun", "text": "بَيْتٌ"},
    {"id": "ustadh", "text": "أُسْتَاذ"},
    {"id": "talib",  "text": "طَالِب"},
]

audio_dir = Path("audio")
audio_dir.mkdir(exist_ok=True)

for w in WORD_ITEMS:
    filename = audio_dir / f"word_{w['id']}.mp3"
    print("Maak:", filename)
    tts = gTTS(text=w["text"], lang="ar", slow=True)
    tts.save(filename)
