# CLAUDE.md — ArabicOKids Project Regels
# Locatie: C:\Users\Dell\Desktop\arabic-kids-academy\CLAUDE.md
# Lees dit ALTIJD volledig voor je iets doet.

---

## 🚀 Hoe Claude Code starten (verplicht)

```bash
cd C:\Users\Dell\Desktop\arabic-kids-academy
claude
```

NOOIT starten vanuit C:\Users\Dell of een andere map.

---

## ✅ Huidige scores — NIET breken

| Categorie        | Score | Status     |
|------------------|-------|------------|
| Performance      | 92    | ✅ Behouden |
| Accessibility    | 100   | ✅ Behouden |
| Best Practices   | 100   | ✅ Behouden |
| SEO              | 100   | ✅ Behouden |

Na ELKE sessie Lighthouse draaien en controleren dat deze scores intact zijn:
```bash
npx lighthouse https://arabicokids.com --chrome-flags="--headless --no-sandbox" --output=json
```

---

## ⛔ NOOIT aanraken zonder expliciete toestemming

### Bestanden die je NOOIT mag wijzigen tenzij de gebruiker dit uitdrukkelijk vraagt:
- `sw.js` — Service Worker (cachinglogica)
- `manifest.json` — PWA manifest
- `sitemap.xml` — SEO sitemap
- `robots.txt` — SEO crawling
- `og-image.png` — Social media afbeelding
- Alle bestanden in `/fonts/` — zelfgehoste Arabic fonts
- Alle bestanden in `/assets/icons/` — PWA icons

### CSS-regels die je NOOIT mag wijzigen:
- `@font-face` declaraties (font paths staan correct)
- `:focus-visible` stijlen (accessibility vereiste)
- `unicode-range` in font-face (scoping Arabic vs emoji)

### HTML-elementen die je NOOIT mag verwijderen:
- `<meta name="google-site-verification">` tags
- `<link rel="canonical">` tags
- `<link rel="alternate" hreflang>` tags (staan op alle 25 pagina's)
- JSON-LD structured data blocks (`<script type="application/ld+json">`)

---

## ⚠️ VERPLICHTE REGELS bij elke bestandswijziging

### 1. Encoding — ALTIJD UTF-8 bewaren
Bij het lezen en schrijven van HTML-bestanden:
- Lees altijd met UTF-8 encoding
- Schrijf altijd met UTF-8 encoding (geen BOM)
- Controleer na schrijven: Arabische tekens en emoji moeten leesbaar zijn, NOOIT als `?` of `???`
- Test na elke HTML-wijziging: `grep -r "???" .` mag GEEN resultaten geven

```bash
# Controleer encoding na elke wijziging
grep -rn "???" --include="*.html" .
# Dit commando mag 0 resultaten geven
```

### 2. CSS-paden — altijd absoluut
NOOIT relatieve paden gebruiken voor CSS, JS of fonts:
```html
<!-- FOUT -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="../css/main.css">

<!-- GOED -->
<link rel="stylesheet" href="/css/main.css">
```

Dit geldt voor ALLE bestanden in /pages/ en subdirectories.

### 3. Service Worker — versie ophogen bij elke content-wijziging
Als je HTML, CSS, JS of audio bestanden wijzigt, MOET je ook sw.js aanpassen:
```javascript
// In sw.js — verhoog dit versienummer bij elke deployment
const CACHE_VERSION = 'v3'; // Was v2 → maak v3, etc.
```

### 4. Brand naam — altijd consistent
De correcte naam is: **ArabicOKids** (met hoofdletter O)
NOOIT schrijven als: ArabicoKids, Arabico Kids, Arabic O Kids, arabicokids

---

## 📋 Werkwijze — Verplichte stappen

### Voor je begint met een taak:
1. Zeg eerst welke bestanden je gaat aanpassen
2. Wacht op bevestiging van de gebruiker
3. Pas dan pas bestanden aan

### Voorbeeld van de juiste aanpak:
```
Gebruiker: "Verbeter de quiz pagina"

Claude Code MOET eerst zeggen:
"Ik ga de volgende bestanden aanpassen:
- pages/quiz.html (tekst aanpassen)
- css/quiz.css (stijl verbeteren)
Mag ik doorgaan?"

Dan wachten op "ja" voor uitvoering.
```

### Na elke wijziging:
1. Encoding check: `grep -rn "???" --include="*.html" .`
2. CSS pad check op gewijzigde bestanden
3. Git commit met duidelijke message
4. Lighthouse draaien als HTML/CSS/JS gewijzigd

---

## 🗂️ Project structuur

```
arabic-kids-academy/
├── index.html              # Homepage
├── sitemap.xml             # SEO — NIET aanraken
├── robots.txt              # SEO — NIET aanraken
├── manifest.json           # PWA — NIET aanraken
├── sw.js                   # Service Worker — versie ophogen bij wijziging
├── og-image.png            # Social sharing — NIET aanraken
├── css/
│   └── main.css            # Hoofdstijl
├── fonts/                  # Zelfgehoste WOFF2 — NIET aanraken
│   ├── amiri-regular.woff2
│   └── ...
├── assets/
│   ├── icons/              # PWA icons — NIET aanraken
│   └── audio/              # MP3 letters — NIET aanraken
└── pages/
    ├── letters.html
    ├── quiz.html
    ├── werkbladen.html
    └── ...                 # Alle subpagina's
```

---

## 📱 Mobiel — Verplichte vereisten (iOS & Android)

De website MOET werken op:
- **iPhone**: iOS Safari 15+ (iPhone 11 en nieuwer)
- **Android**: Chrome 90+ (Samsung, Pixel, etc.)

### CSS — Mobiel verplicht

Elke pagina MOET deze viewport meta tag hebben:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Verplichte mobiele CSS regels — NOOIT verwijderen:
```css
/* Geen horizontale scroll op mobiel */
html, body {
  overflow-x: hidden;
  max-width: 100%;
}

/* Knoppen minimaal 64x64px voor kindervingers */
button, .btn, a.btn {
  min-height: 64px;
  min-width: 64px;
}

/* Tekst nooit kleiner dan 16px op mobiel (iOS zoom-preventie) */
input, select, textarea {
  font-size: 16px;
}
```

### Arabische tekens & emoji op mobiel — KRITIEK

Dit was een groot probleem in het verleden. Verplichte regels:

1. **Font-face altijd met unicode-range** zodat Arabisch en emoji apart geladen worden:
```css
@font-face {
  font-family: 'Amiri';
  src: url('/fonts/amiri-regular.woff2') format('woff2');
  unicode-range: U+0600-06FF; /* Alleen Arabische tekens */
  font-display: swap;
}
```

2. **Emoji NOOIT in een Arabisch font-family** — gebruik altijd aparte stack:
```css
.emoji {
  font-family: 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
}
```

3. **Na elke HTML-wijziging controleren** of Arabische tekens en emoji correct staan — NOOIT als `?` of `???`

### Touch & audio op iOS

- Audio NOOIT autoplay — altijd starten via gebruikersinteractie (tap/click)
- Howler.js handelt iOS AudioContext unlock automatisch af — geen extra code nodig
- Alle klikgebieden minimaal 64×64px (grove motoriek kinderen)

### Testen voor deployment

Controleer ALTIJD deze punten voor je pusht naar GitHub:

| Test | Wat controleren |
|------|----------------|
| Arabische letters zichtbaar | Geen `?` of blokjes op mobiel |
| Emoji zichtbaar | Geen `?` of blokjes |
| Audio werkt | Na eerste tap op iPhone/Android |
| Geen horizontale scroll | Op 375px breedte (iPhone SE) |
| Knoppen groot genoeg | Minimaal 64×64px |
| Fonts geladen | `/fonts/` pad correct in Network tab |
| SW cache vers | CACHE_VERSION opgehoogd na wijziging |

### Lighthouse mobiele test (verplicht na grote wijzigingen)
```bash
npx lighthouse https://arabicokids.com --emulated-form-factor=mobile --chrome-flags="--headless --no-sandbox"
```

---

## 🔤 RTL / Arabisch — Regels

- Arabische tekst altijd in `<span lang="ar" dir="rtl">` of `<section lang="ar" dir="rtl">`
- CSS: altijd logical properties (`margin-inline-start` nooit `margin-left`)
- Fonts: altijd zelfgehost in `/fonts/`, NOOIT Google Fonts CDN

---

## 🔒 Privacy — Nooit toevoegen

- Geen Google Analytics
- Geen Facebook Pixel
- Geen externe tracking scripts
- Geen cookies zonder toestemming
- Geen externe font CDN's (privacy)

---

## 📦 Goedgekeurde libraries (geen andere toevoegen)

| Library      | Gebruik                        |
|--------------|--------------------------------|
| Howler.js    | Audio MP3 letters              |
| GSAP 3.x     | SVG mascot animaties           |
| Animate.css  | Beloningsscherm animaties      |
| Workbox 7.x  | Service Worker caching         |
| Open Props   | Design tokens                  |

NOOIT Bootstrap, Tailwind, React, Vue of andere frameworks toevoegen.

---

## 🚨 Als er iets misgaat

### Encoding kapot (??? tekens):
```bash
git diff --stat HEAD~1
git revert HEAD
```

### Lighthouse score gedaald:
```bash
git log --oneline -10
git revert [commit-hash]
```

### Service Worker cached oude versie:
1. Verhoog CACHE_VERSION in sw.js
2. Commit en push
3. Wacht 2 minuten
4. Hard refresh op mobiel: Settings → Safari → Clear History

---

## Git — Werkwijze

Commit na ELKE werkende stap, niet pas aan het eind:
```bash
git add .
git commit -m "✅ [beschrijving van wat je gedaan hebt]"
git push origin main
```

Gebruik duidelijke commit messages:
- ✅ Fix encoding Arabic characters letters.html
- ✅ Bump SW cache version to v3
- ✅ Fix absolute CSS paths in /pages/
- ⛔ NOOIT: "fix", "update", "changes"
