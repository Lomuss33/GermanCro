# 🇩🇪 GermanCro

**GermanCro** is a small vocabulary training app for learning **German** using
**English prompts** and **Croatian context** as support.

It’s inspired by [elon.io](https://elon.io) and focuses on accurate, practical vocabulary.

---

## 🧠 How It Works

1. You see an **English word or phrase**
2. A **Croatian translation** is shown as a hint
3. You type the **German translation** into the grid

This helps reduce ambiguity and improves retention.

---

---

## ✨ Features

* **230+ vocabulary cards**
* Engineering
* Methodology
* Argumentation
* Description
* Soft skills


* **Live character grid**
* Correct letters lock in
* Punctuation is filled automatically


* **Progress stats**
* Accuracy
* Streak
* WPM


* **Hints**
* Reveal 3 letters at a time


* **Category selection**
* Practice one topic or mix all



---

## 📂 Project Structure

```text
index.html   # UI and category selector
style.css    # Styling and layout
app.js       # App logic and scoring
cards.json   # Vocabulary (DE / EN / HR)

```

---


## 🚀 How to Run

The app loads data from `cards.json`, so it needs a local server.

### Option 1: Manual (Terminal)

```bash
npx serve .
```

Open the shown `localhost` link in your browser.

### Option 2: One-Click Launch (Desktop Shortcut)

To start the server and open the app instantly without opening VS Code:

#### **Windows (.bat)**

1. Create a new text file on your Desktop named `GermanCro.bat`.
2. Paste this code (replace with your actual folder path):
```batch
@echo off
cd /d "C:\path\to\GermanCro"
start "" http://localhost:3000
npx serve .
```


3. Double-click the icon to play.

#### **macOS (.command)**

1. Create a file on your Desktop named `GermanCro.command`.
2. Paste this code:
```bash
#!/bin/bash
cd /Users/yourname/path/to/GermanCro
open http://localhost:3000
npx serve .
```


3. Run `chmod +x ~/Desktop/GermanCro.command` in terminal once to enable it.

---

## 📝 Notes

* Fully client-side
* Easy to extend by editing `cards.json`
* Strict spelling is intentional