# Maintaining GermanCro

This document is for developers and future agents who need to add cards or extend the card taxonomy.

## Local run

Run the app from the repo root with a local web server:

```bash
npx serve .
```

Do not open `index.html` directly from disk. `app.js` loads JSON with `fetch()`, so the app needs HTTP.

For direct writes from the add-card panel, run:

```bash
npm start
```

That enables `POST /api/cards` and writes to `cards.user.json`.

## Files that matter for cards

- `cards.json`: main vocabulary dataset
- `cards.user.json`: local extension dataset written by `server.js`
- `app.js`: client-side card sanitizing, topic filtering, authoring selects, and scope handling
- `server.js`: save API and server-side card validation
- `locales.json`: display labels for topics, subcategories, and scopes
- `index.html`: add-card form fields
- `style.css`: badge and authoring-form layout

## Card contract

Every card must have these fields:

```json
{
  "de": "das Auto",
  "hr": "auto",
  "en": "car",
  "topic": "vehicles",
  "subcategory": "Nomen",
  "scope": "all"
}
```

Rules:

- keep files valid JSON and UTF-8 encoded
- keep `de`, `hr`, and `en` trimmed and human-readable
- `topic` must exist in both the client and server allow-lists
- `subcategory` must exist in both the client and server allow-lists
- `scope` must be one of `all`, `de`, `hr`, or `gb`
- duplicates are blocked by `de + hr + topic + subcategory + scope`

## Current taxonomy

Topics:

- `basics`
- `vehicles`
- `nature`
- `food`
- `travel`
- `work`
- `health`
- `people`
- `shopping`
- `developertech`
- `itnetwork`

Subcategories:

- `Nomen`
- `Verb`
- `Adjektiv`
- `Adverb`
- `Präposition`
- `Konjunktion`
- `Ausdruck`
- `Satz`

Scopes:

- `all`
- `de`
- `hr`
- `gb`

## How to add new cards

Preferred workflow:

1. Run `npx serve .` or `npm start`.
2. Open the add-card panel in the UI.
3. Fill `Topic`, `Subcategory`, `Mode`, `Deutsch`, `Kroatisch`, and `Englisch`.
4. Save the card.
5. If you used `npx serve .`, export `cards.user.json`.
6. Review the saved cards.
7. Either keep them in `cards.user.json` or merge them into `cards.json`.

Save modes:

- `npx serve .`: session-only storage, optional export
- `npm start`: persistent save to `cards.user.json`

## How to add a new topic

When you create a new top-level topic, update all of these together:

1. `app.js`
   Add the topic key to `TOPIC_CONFIG` and choose a color.
2. `server.js`
   Add the same key to `VALID_TOPICS`.
3. `locales.json`
   Add labels for the topic in `de.topics`, `hr.topics`, and `en.topics`.
4. `cards.json`
   Add cards that use the new topic key.

If one of those steps is skipped, the new topic will either fail validation or render with raw keys.

## How to add a new subcategory

When you introduce a new subcategory, update all of these together:

1. `app.js`
   Add the new value to `SUBCATEGORY_OPTIONS`.
2. `server.js`
   Add the same value to `VALID_SUBCATEGORIES`.
3. `locales.json`
   Add translated labels under `categories` for `de`, `hr`, and `en`.
4. `cards.json`
   Add or update cards to use the new subcategory.

## How to use scope correctly

- Use `all` for shared vocabulary.
- Use `de`, `hr`, or `gb` only for language-mode-specific cards.
- The session pool in the client automatically hides incompatible scoped cards for the active learning mode.
- If you ever add a brand-new learning mode, you must also update `MODE_SCOPE_MAP` in `app.js`.

## Change checklist

- Card content change: validate JSON, then test topic filters and a few sample answers.
- Topic taxonomy change: update `app.js`, `server.js`, `locales.json`, and `cards.json` together.
- Add-card form change: test both `npx serve .` export flow and `npm start` persistent-save flow.
- Scope change: switch learning modes and confirm the expected cards remain available.

## Manual smoke test

1. Start the app through a local server and confirm cards load.
2. Open settings and confirm topic buttons render.
3. Start a mixed session and answer one card correctly and one incorrectly.
4. Filter to a single topic and start a new session.
5. Use `Tipp`, difficulty buttons, and the session-size slider.
6. Add a new card through the browser form and confirm validation works.
7. In `npx serve .` mode, export `cards.user.json` and confirm the file downloads.
8. In `npm start` mode, add a card and confirm it is written to `cards.user.json`.

## Notes

- Static hosting remains read-only.
- There is no automated test suite or CI yet.
- If text looks garbled, check the editor encoding before editing content.
