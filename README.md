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
- "Deutschland kennenlernen" facts panel for Germany and all 16 states

## Quick start

This app must be served over HTTP because `app.js` loads `cards.json` with `fetch()`.

```bash
npx serve .
```

Open the local URL shown by the server, usually `http://localhost:3000`.

If you want direct file writes from the UI, run the built-in local server instead:

```bash
npm start
```

That enables persistent saves to `cards.user.json`. GitHub Pages stays read-only because it cannot run `server.js`.

If you prefer `npx serve .`, that also works for adding cards:

- cards are added to the current session in the browser
- you can then export them as `cards.user.json`
- place that file in the repo root so it will load the next time you start the app

## How the repo is organized

```text
index.html      App structure and controls
style.css       Visual design and responsive layout
app.js          Session flow, scoring, hints, filters, and search links
cards.json      Vocabulary dataset
image.png       README screenshot
MAINTAINING.md  Maintainer workflow and smoke-test checklist
USER_GUIDE.md   End-user guide for controls and clickable UI sections
germany-facts.json Germany and Bundeslander facts dataset
assets/facts/... Placeholder or real WebP flags for Germany and the states
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

Use [USER_GUIDE.md](USER_GUIDE.md) for:

- what each clickable interface section does
- how sessions, filters, and lookup links work
- how to use the `Neue Karte hinzufügen` panel

## Deutschland kennenlernen

The UI now includes a facts panel at the bottom of the page.

- `Deutschland` shows country-level quick facts such as capital, anthem, population, area, GDP, and highlights.
- `Bundeslander` opens a picker for all 16 states.
- Choosing a state shows its basic data and short highlight lists.

The module is fully static and GitHub Pages-safe because it loads data from `germany-facts.json`.

Flag images for this panel are loaded from:

- `assets/facts/country/deutschland.webp`
- `assets/facts/states/<state-id>.webp`

You can replace the placeholder files with your own WebP flags without changing the code.

## Add-card bubble behavior

The UI now includes a separate "Neue Karte hinzufügen" panel below the lookup panel.

- On GitHub Pages or any static host, saving stores the new card only for the current browser session.
- On a local repo copy started with `npm start`, saving writes directly to `cards.user.json`.
- On a local repo copy started with `npx serve .`, saving stays in-session but you can export `cards.user.json` from the UI.
- If you want to publish locally added cards, commit `cards.user.json` or merge its entries into `cards.json`.

## Adding cards

Use the "Neue Karte hinzufügen" panel and fill in:

- `Deutsch`: the exact German answer users should type
- `Kategorie`: one of the supported grammar categories
- `Kroatisch`: the main prompt shown on the card
- `Englisch`: the support gloss shown under the prompt

Save behavior:

- Static hosting mode: the card is added only for the current browser session and is not written to the repo.
- Local static mode with `npx serve .`: the card is added for the current session and can be exported as `cards.user.json`.
- Local editable mode with `npm start`: the card is appended to `cards.user.json` and becomes available after saving.

Rules:

- All four fields are required.
- Duplicate cards are blocked based on German answer plus Croatian prompt.
- The category must match one of the existing supported categories.

Publishing new cards:

1. Run the app locally with either `npx serve .` or `npm start`.
2. Add cards through the panel.
3. If you used `npx serve .`, export `cards.user.json` from the panel and place it in the repo root.
4. Review the saved entries in `cards.user.json`.
5. Commit `cards.user.json`, or move the entries into `cards.json` if you want them in the main dataset.

## Notes

- The app remains GitHub Pages-safe because persistent writes require a local Node server that static hosting does not provide.
- There is currently no automated test suite or CI.
- If text renders incorrectly after editing, verify the file encoding before changing content.
