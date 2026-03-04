# 🇩🇪 GermanCro

**GermanCro** is a vocabulary training app for learning **German** using
**Croatian prompts** with **English context** as support.

You see the Croatian word, the English translation below it as a hint, and type the German answer into the character grid.

---

![Screenshot](image.png)

## 🧠 How It Works

1. You see a **Croatian word or phrase** as the main prompt
2. The **English translation** is shown below as context
3. You type the **German translation** into the input field
4. The **character grid** gives you live feedback letter by letter

---

## ✨ Features

### 📚 300+ Vocabulary Cards

Cards are organized into 8 categories:

| Category | Deutsch | Description |
|---|---|---|
| Noun | Nomen | das Hauptwort |
| Verb | Verb | das Tätigkeitswort |
| Adjective | Adjektiv | das Eigenschaftswort |
| Adverb | Adverb | das Umstandswort |
| Preposition | Präposition | das Verhältniswort |
| Conjunction | Konjunktion | das Bindewort |
| Phrase | Ausdruck | feste Wortverbindungen & Redewendungen |
| Sentence | Satz | ganze Satzstrukturen & Satzteile |

### 🔤 Live Character Grid
- Correct letters turn green as you type
- Wrong letters turn red
- Punctuation is filled in automatically
- The next expected letter pulses to guide you

### 🎯 Difficulty Modes
| Mode | Hint shown |
|---|---|
| **Easy** | First 3 letters of each word revealed |
| **Medium** | First letter of each word revealed |
| **Hard** | No hints — blank grid |

### 💡 Hint Button
Reveals 3 more characters of the answer per click.

### 📊 Live Stats Bar
- 🔥 **Streak** — consecutive correct answers
- ✅ **Richtig** — correct answers this session
- 🃏 **Übrig** — cards remaining in session
- 🎯 **Genauigkeit** — accuracy percentage
- ⚡ **WPM** — words per minute typed

### 🃏 Session Size Slider
Use the slider in the category panel to choose how many cards per session (5–50). Default is 20.

### 🗂️ Category Selection
- **⚡ Gemischt** — all categories mixed
- Select one or more categories to focus your practice
- Shows how many cards are available for the current selection

### 🔍 Search Panel
Quick links to look up the current word in:
Duden · DWDS · dict.cc · Wikipedia · Google · Linguee · Leo

---

## 📂 Project Structure

```text
index.html   # UI, stats bar, category selector, search panel
style.css    # Styling and layout
app.js       # App logic, scoring, grid rendering
cards.json   # Vocabulary cards (de / hr / en / cat)
```

### Card Format

```json
{ "de": "die Schlussfolgerung", "hr": "zaključak", "en": "conclusion", "cat": "Nomen" }
```

| Field | Content |
|---|---|
| `de` | German (the answer to type) |
| `hr` | Croatian (main prompt shown) |
| `en` | English (shown as context hint) |
| `cat` | One of the 8 categories below |

**Valid `cat` values:**

| Value | Meaning |
|---|---|
| `Nomen` | Noun |
| `Verb` | Verb |
| `Adjektiv` | Adjective |
| `Adverb` | Adverb |
| `Präposition` | Preposition |
| `Konjunktion` | Conjunction |
| `Ausdruck` | Phrase / idiomatic expression |
| `Satz` | Sentence fragment or full sentence |

---

## 🚀 How to Run

The app loads `cards.json` via `fetch()`, so it requires a local server.

### Option 1: Terminal

```bash
npx serve .
```

Open the shown `localhost` URL in your browser.

### Option 2: One-Click Desktop Shortcut

#### Windows (.bat)

1. Create `GermanCro.bat` on your Desktop
2. Paste (replace path with your actual folder):

```batch
@echo off
cd /d "C:\path\to\GermanCro"
start "" http://localhost:3000
npx serve .
```

3. Double-click to launch.

#### macOS (.command)

1. Create `GermanCro.command` on your Desktop
2. Paste:

```bash
#!/bin/bash
cd /Users/yourname/path/to/GermanCro
open http://localhost:3000
npx serve .
```

3. Run once in terminal to enable: `chmod +x ~/Desktop/GermanCro.command`

---

## 📝 Notes

- Fully client-side — no backend, no account needed
- Extend by editing `cards.json` — one JSON object per card
- Spelling is checked strictly (case-insensitive, trailing punctuation ignored)
- Session end shows score %, streak, WPM, and time taken