# GermanCro

GermanCro is a browser-based German vocabulary trainer with Croatian prompts and English support text. You see the Croatian prompt, use the English gloss as context, and type the German answer into a live character grid.

![GermanCro screenshot](image.png)

## What it includes

- 302 vocabulary cards in `cards.json`
- 8 grammar and usage categories
- Easy, Medium, and Hard difficulty modes
- Live per-character feedback while typing
- Hint reveal button and automatic punctuation fill
- Session stats for streak, accuracy, remaining cards, and WPM
- Search shortcuts for the active word

## Quick start

This app must be served over HTTP because `app.js` loads `cards.json` with `fetch()`.

```bash
npx serve .
```

Open the local URL shown by the server, usually `http://localhost:3000`.

If you want the add-card bubble to write permanently to a local file, run the built-in local server instead:

```bash
npm start
```

That enables persistent saves to `cards.user.json`. GitHub Pages stays read-only because it cannot run `server.js`.

## How the repo is organized

```text
index.html      App structure and controls
style.css       Visual design and responsive layout
app.js          Session flow, scoring, hints, filters, and search links
cards.json      Vocabulary dataset
image.png       README screenshot
MAINTAINING.md  Maintainer workflow and smoke-test checklist
server.js       Local editable server with persistent card saves
cards.user.json Local extension dataset written by server.js
```

## Data model

Each card is a JSON object with four fields:

```json
{
  "de": "die Schlussfolgerung",
  "hr": "zakljucak",
  "en": "conclusion",
  "cat": "Nomen"
}
```

Field meanings:

- `de`: German answer the user types
- `hr`: Croatian prompt shown as the main cue
- `en`: English support text shown below the prompt
- `cat`: category label used for filtering and styling

Valid categories are:

- `Nomen`
- `Verb`
- `Adjektiv`
- `Adverb`
- `Präposition`
- `Konjunktion`
- `Ausdruck`
- `Satz`

## Maintainer docs

Use [MAINTAINING.md](MAINTAINING.md) for:

- local maintenance workflow
- data-edit rules
- coordinated code/data changes
- manual smoke testing after edits

## Add-card bubble behavior

The UI now includes a bubble below "Aktuelles Wort nachschlagen".

- On GitHub Pages or any static host, saving stores the new card only for the current browser session.
- On a local repo copy started with `npm start`, saving writes permanently to `cards.user.json`.
- If you want to publish those locally added cards, commit `cards.user.json` or merge its entries into `cards.json`.

## Notes

- The app remains GitHub Pages-safe because persistent writes require a local Node server that static hosting does not provide.
- There is currently no automated test suite or CI.
- If text renders incorrectly after editing, verify the file encoding before changing content.
