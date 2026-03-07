# User Guide

This guide explains the clickable parts of the GermanCro interface and what they do.

## Main card

The main card is the central learning area.

- Croatian prompt: the large text at the top of the card. This is the item you translate into German.
- English hint: the smaller line below the prompt. This gives extra context.
- Category badge: shows which type of card is currently active, such as `Nomen` or `Verb`.
- Answer field: where you type the German answer.
- Character grid: shows the target answer letter by letter and reacts while you type.

Character grid behavior:

- Green letter: the typed letter is correct.
- Red letter: the typed letter is wrong.
- Hint letter: the letter is being shown as a difficulty or hint reveal.
- Auto-filled letter: punctuation at the end of a word can be filled automatically.
- Next-letter marker: in non-hard modes, the next expected position is highlighted.

## Difficulty buttons

The difficulty buttons are inside the main card.

- `Hard`: no starting letters are shown.
- `Medium`: the first letter of each word is shown.
- `Easy`: the first three letters of each word are shown.

These buttons only change how much visual help you get. They do not change the underlying card data.

## Tipp button

The `Tipp` button reveals more of the answer.

- Each click reveals more characters from the start of the German answer.
- This helps when you want to continue the round instead of stopping.
- The revealed text is placed directly into the answer field.

## New game controls

The category area below the main card controls the session.

- Category buttons: filter the active card pool.
- `Gemischt`: uses all categories together.
- Session size slider: chooses how many cards the next session will use.
- `Neues Spiel`: starts a fresh session using the currently selected categories and slider value.

Important behavior:

- Category changes do not automatically restart the current session.
- Start a new session after changing categories or session size if you want the change to apply immediately.

## Aktuelles Wort nachschlagen

This panel contains quick external lookup links for the current card.

Each button opens a new browser tab for the active German word on a reference site such as:

- Duden
- DWDS
- dict.cc
- Wikipedia
- Google
- Linguee
- Leo

Use this when you want more context, examples, dictionary detail, or confirmation outside the app.

## Neue Karte hinzufügen

This panel lets you add learning items from the browser without editing JSON manually.

### Fields

- `Deutsch`: the exact German answer the learner should type
- `Kategorie`: the grammar or content category for the card
- `Kroatisch`: the Croatian prompt shown on the card
- `Englisch`: the English support text shown below the prompt

### How to add a card

1. Enter the German answer in `Deutsch`.
2. Choose the correct category.
3. Enter the Croatian prompt.
4. Enter the English helper translation.
5. Click the save button.

### What happens after saving

There are two save modes.

- Static-host mode, such as GitHub Pages:
  The card is stored only for the current browser session.
  It is usable immediately in the app, but it is not written to the repository.
  Reloading or opening the hosted site elsewhere will not update the published dataset.

- Local static mode with `npx serve .`:
  The card is also stored only in the current session at first.
  Use the `cards.user.json exportieren` button to download the added cards as `cards.user.json`.
  Put that file into the repo root if you want the app to load those cards again next time.

- Local editable mode with `npm start`:
  The card is saved to `cards.user.json`.
  It becomes part of your local extended dataset and can be committed later if you want to publish it.

### Validation rules

- All four fields must be filled in.
- The category must match one of the supported categories.
- Duplicate entries are rejected.

In practice, duplicate blocking is based on the German answer and Croatian prompt combination.

### Best practices

- Put the full answer in `Deutsch`, including articles when they matter, for example `der Tisch`.
- Keep `Kroatisch` concise and consistent with the rest of the dataset.
- Use `Englisch` as a helper gloss, not as the main teaching language.
- Choose the category carefully because it affects filtering and visual grouping.

### Publishing locally added cards

If you add cards while running `npm start`, review `cards.user.json` afterwards.

If you add cards while running `npx serve .`, export `cards.user.json` first and place the downloaded file into the repo root.

You can then:

- keep them in `cards.user.json` as an extension dataset, or
- move reviewed entries into `cards.json` if you want them in the main published set

## Session end screen

When a session finishes, the app shows a summary.

- Score percent
- Correct answers
- Best streak
- WPM
- Total session time

Use `Neue Runde` to start again.
