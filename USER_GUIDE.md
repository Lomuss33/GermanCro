# User Guide

This guide explains the main clickable parts of the GermanCro interface.

## Main card

The main card is the central learning area.

- Croatian prompt: the large cue line
- English support line: the smaller helper gloss
- Topic badge: shows the active card's topic, subcategory, and mode
- Answer field: where you type the German answer
- Character grid: shows the target answer letter by letter while you type

## Difficulty buttons

The difficulty buttons change how much of the answer is visible.

- `Hard`: no starting letters
- `Medium`: first letter of each word
- `Easy`: first three letters of each word

They do not change the card data itself.

## Tipp button

The `Tipp` button reveals more of the current German answer and writes the revealed part into the answer field.

## New game controls

The settings area below the main card controls session setup.

- Topic buttons: filter the pool by top-level topic
- `All topics`: uses every available topic together
- Session-size slider: sets how many cards the next session uses
- `Neues Spiel`: starts a fresh session with the current filter

Important behavior:

- topic changes do not restart the current session automatically
- start a new session after changing the topic filter or session size

## Search links

This panel opens external reference links for the current German word.

The current app uses:

- `dict.cc`
- `Google`
- `Linguee`
- `Leo`

## Add a new card

The add-card panel lets you create cards without editing JSON manually.

### Fields

- `Topic`: top-level group such as `basics`, `developertech`, `itnetwork`, `deutschebahn`, or `bahn-technik`
- `Subcategory`: `Nomen`, `Verb`, `Adjektiv`, `Adverb`, `Präposition`, `Konjunktion`, `Ausdruck`, or `Satz`
- `Mode`: `all`, `de`, `hr`, or `gb`
- `Deutsch`: exact German answer
- `Kroatisch`: Croatian prompt
- `Englisch`: English helper gloss

### Scope meanings

- `all`: shared card for every learning mode
- `de`: DE-mode-specific card
- `hr`: HR-mode-specific card
- `gb`: GB-mode-specific card

### How to add a card

1. Choose the topic.
2. Choose the subcategory.
3. Choose the mode.
4. Enter the German answer.
5. Enter the Croatian prompt.
6. Enter the English support text.
7. Save the card.

### Validation rules

- all six fields are required
- duplicate cards are rejected
- topic, subcategory, and mode must be supported values

In practice, duplicate blocking is based on:

- German answer
- Croatian prompt
- topic
- subcategory
- mode

### Save behavior

- On static hosting, the card is stored only for the current browser session.
- With `npx serve .`, the card is also session-only at first, but you can export `cards.user.json`.
- With `npm start`, the card is written directly to `cards.user.json`.

## Session end screen

When a session finishes, the app shows:

- score percent
- correct answers
- best streak
- WPM
- total session time

Use `Neue Runde` to start again.
