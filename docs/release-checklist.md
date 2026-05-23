# ArabicoKids Release Checklist

Use this checklist before publishing to GitHub Pages.

## 1. Static Checks

Run:

```text
node scripts/verify-static-assets.mjs
```

Expected result:

```text
Static asset verification passed
```

## 2. Core Page Smoke Test

Open these pages locally or on GitHub Pages:

1. `index.html`
2. `pages/roadmap.html`
3. `pages/letters.html`
4. `pages/vowels.html?type=short`
5. `pages/vowels.html?type=long`
6. `pages/vowel-letter.html?letter=alif&type=short`
7. `pages/quiz.html?mode=letters`

Check:

- Page loads without broken layout.
- Header navigation works.
- Download book button works.
- Back links go to the expected page.
- No page says `Audio mist` before a user taps.

## 3. Audio Test

Letters page:

- Tap Alif, Ba, Ta, Tha, Jeem.
- Confirm the button changes from `Luister` to `Laden...` to `Speelt`.
- Confirm Tha sounds like `tha`, not `thaa`.

Vowel pages:

- Test one short vowel sound.
- Test one long vowel sound.
- Test one quiz audio question.

## 4. iPhone Safari Test

On iPhone:

1. Open the GitHub Pages URL in Safari.
2. Wait until the page is fully loaded.
3. Tap a letter audio button.
4. Navigate to quiz and answer one question.
5. Navigate to vowels and play one sound.
6. Add the app to the home screen and repeat one audio test.

Pass criteria:

- Audio starts after a tap.
- Buttons are easy to tap.
- No important text overlaps.
- No page gets stuck on `Laden...`.

## 5. Cache / PWA Checklist

When changing HTML, CSS, JS, data, manifest, or service worker:

- Bump relevant query strings in HTML, if used.
- Bump `CACHE_VERSION` in `service-worker.js`.
- Keep audio out of service-worker cache unless offline audio is intentionally added.
- After deploy, hard refresh once in desktop browser.
- On iPhone PWA, close and reopen the app after an update.

## 6. Publish Rule

Do not publish new feature work in the same batch as stabilization fixes unless the core checks above pass.

