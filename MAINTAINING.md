# Maintaining GermanCro

This document is for repo maintenance. For the product overview, quick start, and data summary, use [README.md](README.md).

GermanCro is a static client-side app. There is no build step, backend, or package manifest in the repo.

## Local run

Run the app from the repo root with a local web server:

```bash
npx serve .
```

Do not open `index.html` directly from disk. `app.js` loads `cards.json` with `fetch()`, so the app needs HTTP.

## Files that matter

- `index.html`: app structure, controls, labels, and CDN font imports
- `style.css`: all visuals and responsive layout
- `app.js`: session flow, grading, hints, stats, category filtering, and search links
- `cards.json`: vocabulary source of truth

## Card data rules

- Keep the file valid JSON and UTF-8 encoded. German and Croatian diacritics must remain intact.
- Each card must have `de`, `hr`, `en`, and `cat`.
- Valid `cat` values are `Nomen`, `Verb`, `Adjektiv`, `Adverb`, `Präposition`, `Konjunktion`, `Ausdruck`, and `Satz`.
- If you add, rename, or remove a category, update both `cards.json` and `catColors` in `app.js`.

## Change checklist

- Content-only change: edit `cards.json`, then confirm category counts and a few sample answers in the browser.
- UI copy or layout change: update `index.html` and `style.css` together if spacing or labels shift.
- Gameplay change: update `app.js`, then manually retest difficulty modes, hints, answer checking, and session completion.

## Manual smoke test

1. Start the app through a local server and confirm cards load.
2. Switch between `Hard`, `Medium`, and `Easy`.
3. Answer one card correctly and one incorrectly.
4. Use `Tipp`, category filters, and the session size slider.
5. Finish a session and confirm the final score screen appears.
6. Open one search link for the active word and confirm it is populated.

## Notes

- There is currently no automated test suite or CI in this repo.
- If text looks garbled, check the editor and file encoding first before changing content.
