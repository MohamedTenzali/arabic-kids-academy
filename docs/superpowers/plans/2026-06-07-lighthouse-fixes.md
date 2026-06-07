# Lighthouse Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all Lighthouse audit failures to push scores from Performance 83 / Accessibility 96 / Best Practices 0 / SEO 100 → 90+ / 100 / 100 / 100.

**Architecture:** Five independent fixes: (1) JS variable collision crash, (2) ARIA attribute on wrong element, (3) CSS minification in-place, (4) async Google Fonts on all pages, (5) Cache-Control headers in vercel.json + _headers. All are targeted surgical edits — no build system or architecture changes.

**Tech Stack:** Vanilla JS, CSS (clean-css-cli via npx), Vercel (`vercel.json`), Netlify-style `_headers`, Node.js v24 (available)

---

## File Map

| File | Action | Task |
|---|---|---|
| `js/books-page.js` | Remove duplicate `isPagesPath`/`getAssetHref`, rename `getPageHref` | T1 |
| `js/reviews-wall.js` | Add `role="img"` to `<p class="home-review-stars">` | T2 |
| `css/main.css` | Minify in-place with `clean-css-cli` | T3 |
| All 30 HTML pages with Google Fonts | Replace blocking `<link rel="stylesheet">` with async pattern | T4 |
| `vercel.json` | Add `Cache-Control` headers for assets | T5 |
| `_headers` | Add matching `Cache-Control` headers | T5 |

---

## Task 1: Fix `isPagesPath` double declaration — Best Practices 0 → 100

**Root cause:** `js/app.js` (lines 7–9) and `js/books-page.js` (lines 20–22) both declare `const isPagesPath`, `const getAssetHref`, and `const getPageHref` at global scope. When both scripts load on the same page (index.html), the browser throws `SyntaxError: Identifier 'isPagesPath' has already been declared` — crashing all JS and scoring Best Practices 0.

**Files:**
- Modify: `js/books-page.js` lines 20–22

The `getPageHref` in `books-page.js` has **different logic** than `app.js`'s version:
- `app.js`: `` (page) => `${isPagesPath ? "" : "pages/"}${page}` ``
- `books-page.js`: `(path) => (isPagesPath && path.startsWith("pages/") ? path.slice("pages/".length) : path)`

So only `isPagesPath` and `getAssetHref` can be fully removed (identical). `getPageHref` must be **renamed** to `booksGetPageHref`.

- [ ] **Step 1: Edit `js/books-page.js` lines 20–22**

Change:
```js
const isPagesPath = window.location.pathname.includes("/pages/");
const getAssetHref = (path) => `${isPagesPath ? "../" : ""}${path}`;
const getPageHref = (path) => (isPagesPath && path.startsWith("pages/") ? path.slice("pages/".length) : path);
```
to:
```js
const booksGetPageHref = (path) => (isPagesPath && path.startsWith("pages/") ? path.slice("pages/".length) : path);
```

`isPagesPath` and `getAssetHref` are now inherited from `app.js` (loaded first, same global scope).

- [ ] **Step 2: Update the single usage of `getPageHref` in `books-page.js` (line 41)**

Change:
```js
    : `<a class="primary-button book-download" href="${escapeHtml(getPageHref("pages/boeken.html"))}">
```
to:
```js
    : `<a class="primary-button book-download" href="${escapeHtml(booksGetPageHref("pages/boeken.html"))}">
```

- [ ] **Step 3: Verify no other `getPageHref` calls remain in `books-page.js`**

Run:
```powershell
Select-String -Path "js\books-page.js" -Pattern "getPageHref"
```
Expected: one match only — the `booksGetPageHref` declaration on line 20.

- [ ] **Step 4: Commit**

```bash
git add js/books-page.js
git commit -m "fix: remove duplicate isPagesPath/getAssetHref from books-page.js, rename getPageHref to booksGetPageHref"
```

---

## Task 2: Fix `aria-prohibited-attr` — Accessibility 96 → 100

**Root cause:** `js/reviews-wall.js` line 127 renders `<p class="home-review-stars" aria-label="5 van 5 sterren">`. A `<p>` element has implicit role `paragraph`, which does not permit `aria-label`. Fix: add `role="img"` so the `aria-label` is valid.

**Files:**
- Modify: `js/reviews-wall.js` line 127

- [ ] **Step 1: Edit `js/reviews-wall.js` line 127**

Change:
```js
            <p class="home-review-stars" aria-label="${r.stars} van 5 sterren">${starsHtml(r.stars)}</p>
```
to:
```js
            <p class="home-review-stars" role="img" aria-label="${r.stars} van 5 sterren">${starsHtml(r.stars)}</p>
```

- [ ] **Step 2: Commit**

```bash
git add js/reviews-wall.js
git commit -m "fix: add role=img to home-review-stars p element to allow aria-label (aria-prohibited-attr)"
```

---

## Task 3: Minify CSS — Performance (reduce render-blocking time from 340ms)

**Root cause:** `css/main.css` is 222 KB / 11,206 lines unminified. Minifying reduces the blocking parse time. We minify in-place so no HTML changes are needed.

**Files:**
- Modify: `css/main.css` (overwrite with minified content)

- [ ] **Step 1: Install and run clean-css-cli**

```powershell
npx clean-css-cli@5 -o css/main.min.css css/main.css
```
Expected: `css/main.min.css` created. Verify it exists and is smaller:
```powershell
Get-Item css/main.css, css/main.min.css | Select-Object Name, @{n='KB';e={[math]::Round($_.Length/1KB,1)}}
```
Expected: `main.min.css` should be 50–70% smaller than `main.css`.

- [ ] **Step 2: Back up original and replace**

```powershell
Copy-Item css/main.css css/main.source.css
Copy-Item css/main.min.css css/main.css
Remove-Item css/main.min.css
```

- [ ] **Step 3: Verify the page still renders correctly**

Open `index.html` in a browser (or `start index.html`). Check that layout and styles look correct. The page should look identical to before.

- [ ] **Step 4: Commit**

```bash
git add css/main.css css/main.source.css
git commit -m "perf: minify main.css in-place with clean-css-cli, keep source as main.source.css"
```

---

## Task 4: Async Google Fonts loading — Performance (remove 782ms render-block)

**Root cause:** 30 HTML pages load Google Fonts as a blocking `<link rel="stylesheet">`, adding 782ms to render-blocking time. Fix: use the `media="print" onload` pattern so fonts load asynchronously after the page paints.

**Files:**
- Modify: All 30 HTML pages that contain `fonts.googleapis.com`

The pages are (from grep output):
`index.html`, `about.html`, `contact.html`, `quiz.html`, `werkbladen.html`, `letters.html`, `klinkers.html`, `download-book.html`, `arabisch-leren-kinderen/index.html`, `arabisch-oefenen-pdf/index.html`, `arabische-klanken/index.html`, `arabische-letters-kinderen/index.html`, `pages/about.html`, `pages/contact.html`, `pages/quiz.html`, `pages/roadmap.html`, `pages/sounds.html`, `pages/werkbladen.html`, `pages/vowels.html`, `pages/vowel-letter.html`, `pages/boeken.html`, `pages/letters.html`, `pages/letter-forms.html`, `pages/niveaus.html`, `pages/privacy.html`, `pages/boek-niveau-1.html`, `pages/bedankt.html`, `pages/bevestigd.html`, `pages/bevestiging-verzonden.html`, `pages/download-book.html`

The pattern to replace varies slightly (some pages have a multi-line `<link>`, some single-line). The consistent searchable string in all pages is `rel="stylesheet"` on a line containing `fonts.googleapis.com`.

**Replacement strategy:** Use PowerShell to find each `<link ... href="https://fonts.googleapis.com/..." rel="stylesheet">` tag (handling both inline and multiline forms) and replace it with the async pattern.

- [ ] **Step 1: Run PowerShell batch replacement**

```powershell
$base = "C:\Users\Dell\Desktop\arabic-kids-academy"

$htmlFiles = Get-ChildItem -Path $base -Recurse -Filter "*.html" |
  Where-Object { $_.FullName -notmatch '\\.superpowers' }

$count = 0
foreach ($file in $htmlFiles) {
  $content = Get-Content $file.FullName -Raw -Encoding UTF8

  # Skip if no Google Fonts link
  if ($content -notmatch 'fonts\.googleapis\.com') { continue }

  # Skip if already async
  if ($content -match 'media="print"') { continue }

  # Extract the actual font URL from this file
  if ($content -match 'href="(https://fonts\.googleapis\.com/[^"]+)"') {
    $fontUrl = $matches[1]
  } else {
    Write-Output "WARN: could not extract font URL from $($file.Name)"
    continue
  }

  # Replace the blocking <link rel="stylesheet"> line (handles both inline and multi-line)
  # Pattern: the <link> block that references googleapis and has rel="stylesheet"
  $blockingPattern = '(?s)<link[^>]+href="' + [regex]::Escape($fontUrl) + '"[^>]*rel="stylesheet"[^>]*>|(?s)<link[^>]+rel="stylesheet"[^>]+href="' + [regex]::Escape($fontUrl) + '"[^>]*>'
  
  $asyncReplacement = @"
<link rel="preload" as="style" href="$fontUrl">
    <link href="$fontUrl" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="$fontUrl" rel="stylesheet"></noscript>
"@

  $newContent = [regex]::Replace($content, $blockingPattern, $asyncReplacement)

  if ($newContent -eq $content) {
    Write-Output "WARN: no replacement made in $($file.Name)"
    continue
  }

  Set-Content $file.FullName $newContent -Encoding UTF8 -NoNewline
  $count++
  Write-Output "OK: $($file.FullName.Replace($base + '\', ''))"
}
Write-Output "`nDone: $count files updated"
```

- [ ] **Step 2: Spot-check two files**

```powershell
Select-String -Path "index.html" -Pattern "fonts.googleapis" | Select-Object -ExpandProperty Line
Select-String -Path "pages\letters.html" -Pattern "fonts.googleapis" | Select-Object -ExpandProperty Line
```
Expected: Each file should now show 3 lines: `preload`, `media="print"`, and `noscript` variants.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "perf: load Google Fonts asynchronously (media=print onload) on all 30 pages"
```

---

## Task 5: Cache-Control headers — Performance (fix cache lifetime audit)

**Root cause:** Versioned assets (`css/*.css?v=76`, `js/*.js?v=N`, `assets/*`, `audio/*`) have no `Cache-Control` header set, so browsers re-validate them on every visit. Since assets use version query params, they are safe to cache for 1 year.

**Files:**
- Modify: `vercel.json` (Vercel deployment headers)
- Modify: `_headers` (Netlify-style headers, kept in sync)

**Cache strategy:**
- HTML pages: `no-cache` (always re-validate — content can change)
- CSS/JS/data: `public, max-age=31536000, immutable` (1 year — version param busts cache)
- Images/audio/icons: `public, max-age=31536000, immutable`
- `manifest.json` / `service-worker.js`: keep existing `no-cache, no-store, must-revalidate`

- [ ] **Step 1: Update `vercel.json` — add Cache-Control to all asset rules**

Replace the full `vercel.json` with:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.arabicokids.com" }],
      "destination": "https://arabicokids.com/:path*",
      "permanent": true
    },
    {
      "source": "/index.html",
      "destination": "/",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "Content-Type", "value": "application/manifest+json; charset=UTF-8" }
      ]
    },
    {
      "source": "/service-worker.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "Content-Type", "value": "text/javascript; charset=UTF-8" }
      ]
    },
    {
      "source": "/(.*)\\.html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Content-Type", "value": "text/html; charset=UTF-8" }
      ]
    },
    {
      "source": "/css/(.*)\\.css",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Content-Type", "value": "text/css; charset=UTF-8" }
      ]
    },
    {
      "source": "/js/(.*)\\.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Content-Type", "value": "text/javascript; charset=UTF-8" }
      ]
    },
    {
      "source": "/data/(.*)\\.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Content-Type", "value": "text/javascript; charset=UTF-8" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/audio/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)\\.json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Content-Type", "value": "application/json; charset=UTF-8" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Update `_headers` — add matching Cache-Control rules**

Replace the full `_headers` with:

```
/*.html
  Cache-Control: public, max-age=0, must-revalidate
  Content-Type: text/html; charset=UTF-8

/*/index.html
  Cache-Control: public, max-age=0, must-revalidate
  Content-Type: text/html; charset=UTF-8

/manifest.json
  Cache-Control: no-cache, no-store, must-revalidate

/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate

/css/*.css
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: text/css; charset=UTF-8

/js/*.js
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: text/javascript; charset=UTF-8

/data/*.js
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: text/javascript; charset=UTF-8

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/audio/*
  Cache-Control: public, max-age=31536000, immutable

/*.json
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/json; charset=UTF-8

/*.webmanifest
  Content-Type: application/manifest+json; charset=UTF-8

/*.xml
  Content-Type: application/xml; charset=UTF-8

/*.txt
  Content-Type: text/plain; charset=UTF-8

/images/*.svg
  Content-Type: image/svg+xml; charset=UTF-8
```

- [ ] **Step 3: Commit**

```bash
git add vercel.json _headers
git commit -m "perf: add Cache-Control headers for assets (1yr immutable) and HTML (no-cache) in vercel.json and _headers"
```

---

## Self-Review

**Spec coverage:**
1. ✅ Performance CSS minify — Task 3
2. ✅ Performance render-blocking (Google Fonts async) — Task 4
3. ✅ Performance cache lifetimes — Task 5
4. ✅ Accessibility aria-prohibited-attr — Task 2
5. ✅ Best Practices isPagesPath crash — Task 1

Note on "Unused CSS": This is a Lighthouse opportunity audit, not a hard failure. Removing truly unused rules from a 11,000-line CSS file requires careful manual audit (risk of breaking pages). Minification handles the size; removing specific unused rules is a separate refactoring task with higher breakage risk — not included here.

Note on "Render-blocking main.css": CSS is inherently render-blocking. Inlining critical CSS would fix this but requires identifying which ~20KB of rules are "above the fold" — a complex, error-prone task. Minification (Task 3) reduces blocking time significantly. This is the practical fix.

**Placeholder scan:** No TBDs. All code is complete.

**Type consistency:** No shared types — independent JS, CSS, JSON, and plaintext changes.
