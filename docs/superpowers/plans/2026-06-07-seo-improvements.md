# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 SEO issues on arabicokids.com: title tag, structured data, hreflang, sitemap, robots.txt, og-image.

**Architecture:** All changes are to static HTML/XML/TXT files and one generated PNG asset. No build system or JS changes needed. Each task is independently deployable with its own commit.

**Tech Stack:** Static HTML, JSON-LD, XML sitemap, robots.txt, PowerShell System.Drawing (og-image PNG generation)

---

## File Map

| File | Action | Task |
|---|---|---|
| `index.html` | Modify title, og:title, twitter:title + add WebSite + LearningResource JSON-LD | T1 + T2 |
| All public HTML files (listed in T3) | Add 3 hreflang `<link>` tags in `<head>` | T3 |
| `sitemap.xml` | Replace with full sitemap (all pages + 28 letter anchors) | T4 |
| `robots.txt` | Expand with Disallow rules for non-public paths | T5 |
| `assets/og-image.png` | Create 1200×630 branded PNG with PowerShell System.Drawing | T6 |

---

## Task 1: Fix title tag on index.html

**Files:**
- Modify: `index.html` lines 6, 12, 19

- [ ] **Step 1: Edit the title tag**

In `index.html`, change line 6 from:
```html
<title>ArabicoKids startpagina | Arabisch leren voor kinderen</title>
```
to:
```html
<title>Arabisch leren voor kinderen | ArabicoKids</title>
```

- [ ] **Step 2: Update og:title (line 12)**

Change:
```html
<meta property="og:title" content="ArabicoKids startpagina | Arabisch leren voor kinderen">
```
to:
```html
<meta property="og:title" content="Arabisch leren voor kinderen | ArabicoKids">
```

- [ ] **Step 3: Update twitter:title (line 19)**

Change:
```html
<meta name="twitter:title" content="ArabicoKids startpagina | Arabisch leren voor kinderen">
```
to:
```html
<meta name="twitter:title" content="Arabisch leren voor kinderen | ArabicoKids">
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "seo: fix index.html title - remove 'startpagina', keyword-first format"
```

---

## Task 2: Add WebSite + LearningResource JSON-LD to index.html

**Files:**
- Modify: `index.html` (append after existing EducationalOrganization script block, before `</head>`)

The existing block ends at the `</script>` after line 58. Insert two new `<script type="application/ld+json">` blocks right after that closing `</script>` tag.

- [ ] **Step 1: Add WebSite schema**

Insert after the existing `</script>` (end of EducationalOrganization block):
```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ArabicoKids",
      "url": "https://arabicokids.com",
      "description": "Arabisch leren voor kinderen van 4 tot 8 jaar via letters, audio, quizzen en werkbladen.",
      "inLanguage": "nl",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://arabicokids.com/letters.html"
        },
        "query-input": "required name=search_term_string"
      }
    }
    </script>
```

- [ ] **Step 2: Add LearningResource schema**

Insert directly after the WebSite script block:
```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": "Arabisch leren voor kinderen",
      "url": "https://arabicokids.com",
      "description": "Interactief Arabisch leerplatform voor kinderen van 4 tot 8 jaar met letters, audio, quizzen en printbare werkbladen.",
      "inLanguage": "nl",
      "educationalLevel": "Beginner",
      "learningResourceType": ["InteractiveResource", "Quiz", "Worksheet"],
      "teaches": "Arabisch alfabet en klanken",
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": "student",
        "audienceType": "Kinderen 4-8 jaar"
      },
      "provider": {
        "@type": "EducationalOrganization",
        "name": "ArabicoKids",
        "url": "https://arabicokids.com"
      }
    }
    </script>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "seo: add WebSite and LearningResource JSON-LD structured data to index.html"
```

---

## Task 3: Add hreflang tags to all HTML pages

**Files to modify** (add 3 `<link rel="alternate">` tags after the `<link rel="canonical">` line in each):

| File | Canonical URL |
|---|---|
| `index.html` | `https://arabicokids.com/` |
| `about.html` | `https://arabicokids.com/about.html` |
| `contact.html` | `https://arabicokids.com/contact.html` |
| `quiz.html` | `https://arabicokids.com/quiz.html` |
| `werkbladen.html` | `https://arabicokids.com/werkbladen.html` |
| `letters.html` | `https://arabicokids.com/letters.html` |
| `klinkers.html` | `https://arabicokids.com/klinkers.html` |
| `download-book.html` | `https://arabicokids.com/download-book.html` |
| `arabisch-leren-kinderen/index.html` | `https://arabicokids.com/arabisch-leren-kinderen/` |
| `arabisch-oefenen-pdf/index.html` | `https://arabicokids.com/arabisch-oefenen-pdf/` |
| `arabische-klanken/index.html` | `https://arabicokids.com/arabische-klanken/` |
| `arabische-letters-kinderen/index.html` | `https://arabicokids.com/arabische-letters-kinderen/` |
| `pages/about.html` | `https://arabicokids.com/about.html` |
| `pages/contact.html` | `https://arabicokids.com/contact.html` |
| `pages/bedankt.html` | `https://arabicokids.com/pages/bedankt.html` |
| `pages/bevestigd.html` | `https://arabicokids.com/pages/bevestigd.html` |
| `pages/letter-forms.html` | `https://arabicokids.com/pages/letter-forms.html` |
| `pages/niveaus.html` | `https://arabicokids.com/pages/niveaus.html` |
| `pages/privacy.html` | `https://arabicokids.com/pages/privacy.html` |
| `pages/quiz.html` | `https://arabicokids.com/quiz.html` |
| `pages/roadmap.html` | `https://arabicokids.com/pages/roadmap.html` |
| `pages/sounds.html` | `https://arabicokids.com/pages/sounds.html` |
| `pages/werkbladen.html` | `https://arabicokids.com/werkbladen.html` |
| `pages/vowels.html` | `https://arabicokids.com/klinkers.html` |
| `pages/vowel-letter.html` | `https://arabicokids.com/pages/vowel-letter.html` |
| `pages/boeken.html` | `https://arabicokids.com/pages/boeken.html` |
| `pages/bevestiging-verzonden.html` | `https://arabicokids.com/pages/bevestiging-verzonden.html` |
| `pages/download-book.html` | `https://arabicokids.com/download-book.html` |
| `pages/letters.html` | `https://arabicokids.com/letters.html` |
| `pages/boek-niveau-1.html` | `https://arabicokids.com/pages/boek-niveau-1.html` |

The hreflang block to add after each `<link rel="canonical" href="[URL]">` line is:
```html
    <link rel="alternate" hreflang="nl" href="[CANONICAL-URL]">
    <link rel="alternate" hreflang="ar" href="[CANONICAL-URL]">
    <link rel="alternate" hreflang="x-default" href="[CANONICAL-URL]">
```

Where `[CANONICAL-URL]` is the value from the `href` of the `<link rel="canonical">` tag already present in that file.

- [ ] **Step 1: Add hreflang to root-level pages** (index.html, about.html, contact.html, quiz.html, werkbladen.html, letters.html, klinkers.html, download-book.html)

For `index.html`, find:
```html
    <link rel="canonical" href="https://arabicokids.com/">
```
Insert immediately after:
```html
    <link rel="alternate" hreflang="nl" href="https://arabicokids.com/">
    <link rel="alternate" hreflang="ar" href="https://arabicokids.com/">
    <link rel="alternate" hreflang="x-default" href="https://arabicokids.com/">
```

For `about.html`, find:
```html
    <link rel="canonical" href="https://arabicokids.com/about.html">
```
Insert immediately after:
```html
    <link rel="alternate" hreflang="nl" href="https://arabicokids.com/about.html">
    <link rel="alternate" hreflang="ar" href="https://arabicokids.com/about.html">
    <link rel="alternate" hreflang="x-default" href="https://arabicokids.com/about.html">
```

Apply the same pattern to `contact.html`, `quiz.html`, `werkbladen.html`, `letters.html`, `klinkers.html`, `download-book.html` using their respective canonical URLs (already present in each file).

- [ ] **Step 2: Add hreflang to SEO landing pages** (arabisch-leren-kinderen/index.html, arabisch-oefenen-pdf/index.html, arabische-klanken/index.html, arabische-letters-kinderen/index.html)

Same pattern: read the canonical URL from each file and insert the 3 hreflang tags after it.

- [ ] **Step 3: Add hreflang to pages/ directory** (all 18 pages listed in the table above)

Same pattern for all pages/ files.

- [ ] **Step 4: Commit**

```bash
git add index.html about.html contact.html quiz.html werkbladen.html letters.html klinkers.html download-book.html
git add arabisch-leren-kinderen/index.html arabisch-oefenen-pdf/index.html arabische-klanken/index.html arabische-letters-kinderen/index.html
git add pages/
git commit -m "seo: add hreflang nl/ar/x-default tags to all HTML pages"
```

---

## Task 4: Rebuild sitemap.xml with all 28 letters + all pages

**Files:**
- Modify: `sitemap.xml`

The 28 letter IDs from `data/letters.js` (in order): alif, baa, taa, thaa, jeem, haa, khaa, dal, dhal, raa, zay, seen, sheen, saad, daad, taa-heavy, zaa-heavy, ain, ghain, faa, qaaf, kaaf, laam, meem, noon, ha, waw, yaa

Letter URLs use anchor fragments: `https://arabicokids.com/letters.html#[id]`

- [ ] **Step 1: Write the new sitemap.xml**

Replace the full contents of `sitemap.xml` with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>https://arabicokids.com/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Main content pages -->
  <url>
    <loc>https://arabicokids.com/letters.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/klinkers.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/quiz.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/werkbladen.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/download-book.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/about.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/contact.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- SEO landing pages -->
  <url>
    <loc>https://arabicokids.com/arabisch-leren-kinderen/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/arabische-letters-kinderen/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/arabisch-oefenen-pdf/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/arabische-klanken/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Sub-pages -->
  <url>
    <loc>https://arabicokids.com/pages/roadmap.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/vowel-letter.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/letter-forms.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/sounds.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/boeken.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/niveaus.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/boek-niveau-1.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://arabicokids.com/pages/privacy.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- 28 Arabic letters (anchor fragments on letters.html) -->
  <url><loc>https://arabicokids.com/letters.html#alif</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#baa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#taa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#thaa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#jeem</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#haa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#khaa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#dal</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#dhal</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#raa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#zay</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#seen</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#sheen</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#saad</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#daad</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#taa-heavy</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#zaa-heavy</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#ain</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#ghain</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#faa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#qaaf</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#kaaf</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#laam</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#meem</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#noon</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#ha</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#waw</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://arabicokids.com/letters.html#yaa</loc><lastmod>2026-06-07</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>

</urlset>
```

- [ ] **Step 2: Commit**

```bash
git add sitemap.xml
git commit -m "seo: rebuild sitemap.xml with all pages and all 28 Arabic letter anchors"
```

---

## Task 5: Update robots.txt

**Files:**
- Modify: `robots.txt`

Current `robots.txt` only has 3 lines. Improve it by disallowing non-public paths while keeping everything else crawlable.

- [ ] **Step 1: Write new robots.txt**

Replace full contents with:
```
User-agent: *
Allow: /

Disallow: /APP/
Disallow: /.superpowers/
Disallow: /.venv/
Disallow: /docs/
Disallow: /BRAND/
Disallow: /data/
Disallow: /pages/bedankt.html
Disallow: /pages/bevestigd.html
Disallow: /pages/bevestiging-verzonden.html

Sitemap: https://arabicokids.com/sitemap.xml
```

- [ ] **Step 2: Commit**

```bash
git add robots.txt
git commit -m "seo: expand robots.txt with Disallow rules for non-public paths"
```

---

## Task 6: Create og-image.png (1200×630)

**Files:**
- Create: `assets/og-image.png`
- Modify: `index.html` (update og:image and twitter:image to point to new file)

Use PowerShell `System.Drawing` to generate a branded 1200×630 PNG.
Brand colors: bg `#F8F7FF`, primary purple `#6B3BF5`, green `#8BC34A`, yellow `#FFC83D`.

- [ ] **Step 1: Generate og-image.png with PowerShell**

Run this PowerShell script:

```powershell
Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#F8F7FF"))
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Purple banner (top strip)
$purpleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#6B3BF5"))
$g.FillRectangle($purpleBrush, 0, 0, $width, 12)

# Purple banner (bottom strip)
$g.FillRectangle($purpleBrush, 0, $height - 12, $width, 12)

# Large purple rounded rectangle (card)
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#6B3BF5"))
$g.FillRectangle($cardBrush, 60, 60, 500, 510)

# Arabic letter Alif (decorative, right side)
$arabicFont = New-Object System.Drawing.Font("Arial", 200, [System.Drawing.FontStyle]::Bold)
$arabicBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#6B3BF5"))
$arabicTransparent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 107, 59, 245))
$g.DrawString("ا", $arabicFont, $arabicTransparent, 750, 100)

# Title text on card
$titleFont = New-Object System.Drawing.Font("Arial", 54, [System.Drawing.FontStyle]::Bold)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString("ArabicoKids", $titleFont, $whiteBrush, 80, 140)

# Subtitle
$subFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Regular)
$lightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 255, 255, 255))
$g.DrawString("Arabisch leren voor kinderen", $subFont, $lightBrush, 80, 230)
$g.DrawString("Letters • Audio • Quiz • Werkbladen", $subFont, $lightBrush, 80, 280)

# Green badge
$greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#8BC34A"))
$g.FillEllipse($greenBrush, 80, 370, 200, 60)
$badgeFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Gratis starten", $badgeFont, $whiteBrush, 100, 385)

# Yellow stars decoration
$yellowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#FFC83D"))
$starFont = New-Object System.Drawing.Font("Arial", 36)
$g.DrawString("★ ★ ★ ★ ★", $starFont, $yellowBrush, 80, 450)

# Domain
$domainFont = New-Object System.Drawing.Font("Arial", 20)
$g.DrawString("arabicokids.com", $domainFont, $lightBrush, 80, 510)

# Right side: Arabic letters showcase
$showcaseFont = New-Object System.Drawing.Font("Arial", 72, [System.Drawing.FontStyle]::Bold)
$purpleText = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#6B3BF5"))
$g.DrawString("ب  ت  ث", $showcaseFont, $purpleText, 620, 180)
$g.DrawString("ج  ح  خ", $showcaseFont, $purpleText, 620, 290)
$g.DrawString("د  ذ  ر", $showcaseFont, $purpleText, 620, 400)

$outPath = "C:\Users\Dell\Desktop\arabic-kids-academy\assets\og-image.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Saved: $outPath"
```

- [ ] **Step 2: Update og:image in index.html**

In `index.html`, change:
```html
    <meta property="og:image" content="https://arabicokids.com/assets/icons/icon-512.png">
```
to:
```html
    <meta property="og:image" content="https://arabicokids.com/assets/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
```

Also update the twitter:image:
```html
    <meta name="twitter:image" content="https://arabicokids.com/assets/icons/icon-512.png">
```
to:
```html
    <meta name="twitter:image" content="https://arabicokids.com/assets/og-image.png">
```

- [ ] **Step 3: Commit**

```bash
git add assets/og-image.png index.html
git commit -m "seo: add branded og-image.png 1200x630 and update og:image tags in index.html"
```

---

## Self-Review

**Spec coverage:**
1. ✅ Title tag fixed — Task 1
2. ✅ Structured data (EducationalOrganization already exists + WebSite + LearningResource added) — Task 2
3. ✅ Hreflang nl + ar + x-default on all HTML pages — Task 3
4. ✅ Sitemap with all 28 letters + all pages — Task 4
5. ✅ robots.txt updated — Task 5
6. ✅ og-image.png 1200×630 — Task 6

**Placeholder scan:** No TBDs, all code is complete.

**Type consistency:** No shared types — each task is independent HTML/XML/PNG.
