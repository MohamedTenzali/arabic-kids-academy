# Arabic Kids Academy

Arabic Kids Academy is een kindvriendelijke leerapp voor Arabische letters,
korte klinkers, lange klinkers en quiz-oefeningen. De app werkt zonder account
en gebruikt alleen lokale voortgang in de browser.

## Privacy en veiligheid

- Er is geen login nodig.
- Er worden geen persoonlijke gegevens verzameld.
- Er is geen tracking van kinderen.
- Er zijn geen advertenties.
- Er is nog geen analytics toegevoegd.
- Voortgang wordt lokaal opgeslagen met `localStorage` op het apparaat van de gebruiker.

## Huidige inhoud

- Arabische letters
- Korte klinkers
- Lange klinkers
- Quiz met letters en klinkers

Woorden en zinnen zijn bewust nog niet toegevoegd.

## Developer checklist: 28 basisletter-audio

Plaats de basisletter MP3-bestanden in:

```text
audio/letters/
```

Vereiste bestandsnamen:

```text
alif.mp3
ba.mp3
ta.mp3
004-tha.mp3
jeem.mp3
haa.mp3
khaa.mp3
dal.mp3
dhal.mp3
raa.mp3
zay.mp3
seen.mp3
sheen.mp3
saad.mp3
daad.mp3
taa-heavy.mp3
zaa-heavy.mp3
ain.mp3
ghain.mp3
faa.mp3
qaaf.mp3
kaaf.mp3
laam.mp3
meem.mp3
noon.mp3
ha.mp3
waw.mp3
yaa.mp3
```

De paden in `data/letters.js` moeten relatief blijven, bijvoorbeeld:

```text
../audio/letters/alif.mp3
../audio/letters/ba.mp3
../audio/letters/ta.mp3
../audio/letters/004-tha.mp3
```

Run de lokale asset-check voor publicatie:

```text
node scripts/verify-static-assets.mjs
```

Testen op GitHub Pages:

- Open `https://mohamedtenzali.github.io/arabic-kids-academy/pages/letters.html`.
- Tik op elke letterknop en controleer dat de status verandert van `Luister` naar `Laden...` en daarna `Speelt`.
- Als `Audio mist` verschijnt, controleer of het exacte MP3-bestand in `audio/letters/` staat en of hoofdletters/kleine letters overeenkomen.

Testen op iPhone:

- Open de live GitHub Pages URL in Safari.
- Tik pas op een luisterknop nadat de pagina volledig geladen is.
- Voeg de app eventueel toe via Delen > Zet op beginscherm en test daarna opnieuw vanuit het beginscherm.
- Bij een update kan Safari/PWA nog oude cache gebruiken; herlaad de pagina of open de app opnieuw zodat de nieuwe service worker actief wordt.
