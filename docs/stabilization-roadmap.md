# ArabicoKids Stabilization Roadmap

Status date: 2026-05-22

## Product Rule

ArabicoKids is now in stabilization mode.

Primary focus:

1. Stabiliseren
2. Structureren
3. Schalen

No new random feature pages until the core learning flow is stable, consistent, and fast.

## Core Pages

Definitive MVP pages:

1. Home: `index.html`
2. Beginner roadmap: `pages/roadmap.html`
3. Learn letters: `pages/letters.html`
4. Vowel overview: `pages/vowels.html`
5. Vowel letter detail: `pages/vowel-letter.html`
6. Quiz: `pages/quiz.html`

Candidate later page:

- Profile/progress: not part of the current MVP until progress behavior is stable.

Review candidate:

- `pages/sounds.html` exists as a legacy redirect to `pages/vowels.html`. Keep it only for old links unless a later product decision brings it back as a real page.

## Current State

### Af

- Home page exists with level selection.
- Roadmap page exists and uses `data/progress.js`.
- Letters page exists and renders from `data/letters.js`.
- Vowel pages exist for short and long sounds.
- Quiz page exists and uses `js/quiz-engine.js`.
- PWA shell exists with `manifest.json`, icons, and `service-worker.js`.
- `manifest.json` and page `theme-color` values now use the brand purple `#6b3bf5`.
- Audio player exists in `js/audio-player.js`.
- Letter audio/data wiring has 28 letters and 28 base audio entries.
- Vowel audio/data wiring has 168 vowel audio entries.
- Current audit found no missing local audio files referenced by `data/letters.js`.
- The Tha letter now uses `audio/letters/004-tha.mp3` and visible name `Tha`.
- `scripts/verify-static-assets.mjs` checks HTML references, service-worker core cache assets, and all letter audio paths.
- Active CSS tokens now start from the purple-led brand palette in `css/main.css`.

### Buggy / Risk

- `css/main.css` is the real active stylesheet and is about 2900 lines.
- Some deeper CSS rules still contain older hard-coded teal shadows and accents that should be replaced component by component.
- Page cache query versions are managed manually and can drift.
- The service worker caches the app shell, so visual/data changes need deliberate version bumps.
- Components are planned in `APP/components`, but active pages still repeat header/footer/nav HTML.
- `APP/styles` has future modular CSS files, but active pages load only `css/main.css`.
- `js/app.js` renders many different UI pieces in one file, which will become harder to maintain.
- Mascot/motion code is active while stabilization is still ongoing; keep it lightweight until performance is verified.

### Ontbreekt

- A single enforced design system used by the active app.
- A definitive component layer for navbar, footer, cards, audio buttons, quiz options, and progress bars.
- A profile/progress page, if it remains part of the product plan.
- A release checklist for iPhone/mobile testing.
- A cache/versioning checklist before publishing to GitHub Pages.
- A broader automated browser smoke test for mobile layout and audio button behavior.

## Design System Target

Use one active token system, not multiple competing palettes.

Core tokens:

- Primary: `#6b3bf5`
- Secondary/growth: `#8bc34a`
- Accent yellow: `#ffc83d`
- Accent pink: `#ff6fae`
- Sky blue: `#4db6ff`
- Background: `#f8f7ff`
- Surface: `#ffffff`
- Text: `#2d2d2d`
- Muted text: `#666666`

Typography target:

- Heading font: rounded, bold, child friendly.
- Body font: readable and calm.
- Arabic font: `Noto Naskh Arabic`.

Component targets:

- `button`
- `card`
- `audio-button`
- `quiz-option`
- `navbar`
- `progress-bar`
- `download-book-button`

## Sprint Plan

### Sprint 1: Stabiliseren

Goal: child can click, hear, understand, and practice without bugs.

Tasks:

- Verify all letter base audio on the letters page.
- Verify all short and long vowel audio.
- Keep audio requests out of the service worker cache unless there is a clear offline strategy.
- Align service worker versioning with every app-shell change.
- Test core pages on mobile viewport.
- Keep `pages/sounds.html` as a legacy redirect unless product scope changes.
- Use `docs/release-checklist.md` before each publish.

### Sprint 2: Design System

Goal: one visual identity everywhere.

Tasks:

- Replace remaining hard-coded teal rules in `css/main.css` component by component.
- Keep `manifest.json` and all page `theme-color` values aligned with the brand.
- Normalize button, card, navbar, quiz option, and progress styles.
- Remove duplicate or unused visual rules after each component is stable.

### Sprint 3: Component Structure

Goal: reduce repeated HTML and reduce future Codex context.

Tasks:

- Extract rendering helpers in `js/app.js` into focused component functions.
- Centralize nav/footer markup or generate it consistently.
- Keep all learning data in `data/`.
- Keep quiz logic in `js/quiz-engine.js`.
- Keep audio behavior in `js/audio-player.js`.

### Sprint 4: Polish Later

Goal: add delight after the core flow is stable.

Tasks:

- Improve quiz feedback polish.
- Improve progress visuals.
- Add mascot polish only after mobile performance is checked.
- Add rewards, XP, streaks, or badges only after the MVP learning path is stable.

## Next Implementation Target

Start with Sprint 1.

First implementation batch:

1. Lock the core page list in documentation.
2. Run `node scripts/verify-static-assets.mjs` before publishing.
3. Bump cache versions after visual/PWA changes.
4. Start Sprint 2 only after the checklist passes on mobile.
