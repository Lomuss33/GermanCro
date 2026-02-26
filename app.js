// ─── Category colors ──────────────────────────────────────────────
const catColors = {
  "Ingenieurwesen": "#60a5fa",
  "Argumentation":  "#f472b6",
  "Methodik":       "#4ade80",
  "Beschreibung":   "#fb923c",
  "Soft Skills":    "#a78bfa",
};

// ─── Card data ────────────────────────────────────────────────────
// remove the whole allCards = [...] block and replace with:
let allCards = [];

fetch('cards.json')
  .then(r => r.json())
  .then(data => {
    allCards = data;
    buildCatPanel();
    startSession();
  });

// ─── State ────────────────────────────────────────────────────────
const SESSION_SIZE = 10;
const allCats = Object.keys(catColors);
let selectedCats = null;

let sessionCards = [], sessionIndex = 0;
let streak = 0, bestStreak = 0;
let totalCorrect = 0, totalAttempts = 0;
let forceCorrection = false, hintCount = 0;
let sessionStart = 0, totalCharsTyped = 0;

// ─── DOM refs ─────────────────────────────────────────────────────
const promptEl    = document.getElementById('promptText');
const promptSub   = document.getElementById('promptSub');
const inputEl     = document.getElementById('answer');
const solutionEl  = document.getElementById('solution');
const wordGrid    = document.getElementById('wordGrid');
const progFill    = document.getElementById('progressFill');
const categoryEl  = document.getElementById('categoryBadge');
const comboPop    = document.getElementById('comboPop');
const gameArea    = document.getElementById('gameArea');
const sessionEndEl = document.getElementById('sessionEnd');
const mainCard    = document.getElementById('mainCard');
const catCountEl  = document.getElementById('catCount');
const newGameBtn  = document.getElementById('newGameBtn');

// ─── Animated flag ────────────────────────────────────────────────
const flagEl = document.getElementById('deFlag');
for (let i = 0; i < 50; i++) {
  const col = document.createElement('div');
  col.className = 'de-flag-col';
  col.style.animationDelay = -(i / 20) * 3 + 's';
  col.style.setProperty('--billow', (i / 4) * 16 + 4 + 'px');
  flagEl.appendChild(col);
}

// ─── Category panel ───────────────────────────────────────────────
function buildCatPanel() {
  const container = document.getElementById('catButtons');
  container.innerHTML = '';

  const mixBtn = document.createElement('button');
  mixBtn.className = 'cat-btn mixed' + (selectedCats === null ? ' active' : '');
  if (selectedCats === null) mixBtn.style.background = '#e8ff47';
  mixBtn.textContent = '⚡ Gemischt';
  mixBtn.onclick = () => { selectedCats = null; buildCatPanel(); };
  container.appendChild(mixBtn);

  allCats.forEach(cat => {
    const color = catColors[cat];
    const isActive = selectedCats !== null && selectedCats.has(cat);
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (isActive ? ' active' : '');
    btn.textContent = cat;
    btn.style.borderColor = color + '55';
    btn.style.color = isActive ? '#000' : color;
    if (isActive) btn.style.background = color;
    btn.onclick = () => {
      if (selectedCats === null) selectedCats = new Set();
      if (selectedCats.has(cat)) {
        selectedCats.delete(cat);
        if (selectedCats.size === 0) selectedCats = null;
      } else {
        selectedCats.add(cat);
      }
      buildCatPanel();
    };
    container.appendChild(btn);
  });

  const pool = getPool();
  catCountEl.textContent = pool.length + ' Karten verfügbar';
  newGameBtn.disabled = pool.length === 0;
}

function getPool() {
  if (selectedCats === null) return allCards;
  return allCards.filter(c => selectedCats.has(c.cat));
}

// ─── Search links ─────────────────────────────────────────────────
const searchSites = [
  { name: "Duden",     icon: "📖", url: w => `https://www.duden.de/suchen/dudenonline/${encodeURIComponent(w)}` },
  { name: "DWDS",      icon: "🔤", url: w => `https://www.dwds.de/?q=${encodeURIComponent(w)}` },
  { name: "dict.cc",   icon: "🌐", url: w => `https://www.dict.cc/?s=${encodeURIComponent(w)}` },
  { name: "Wikipedia", icon: "📚", url: w => `https://de.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(w)}` },
  { name: "Google",    icon: "🔍", url: w => `https://www.google.com/search?q=${encodeURIComponent(w + ' auf Deutsch')}` },
  { name: "Linguee",   icon: "🗣️", url: w => `https://www.linguee.de/deutsch-englisch/search?query=${encodeURIComponent(w)}` },
  { name: "Leo",       icon: "🦁", url: w => `https://dict.leo.org/german-english/${encodeURIComponent(w)}` },
];

function updateSearchLinks(card) {
  const container = document.getElementById('searchLinks');
  container.innerHTML = '';
  const word = (card.target || card.source).replace(/^(der|die|das)\s+/i, '');
  searchSites.forEach(site => {
    const a = document.createElement('a');
    a.className = 'search-link';
    a.href = site.url(word);
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<span>${site.icon}</span><span>${site.name}</span>`;
    container.appendChild(a);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────
const PUNCT = /[.,!?:;]/;

function normalize(t) {
  return t.trim().replace(/\s+/g, ' ').replace(/[.,!?:;]+$/, '').toLowerCase();
}

function getCharMeta(target) {
  const hints = new Set(), autofill = new Set();
  let pos = 0;
  target.split(' ').forEach(word => {
    if (!word.length) { pos++; return; }
    hints.add(pos);
    let t = word.length - 1;
    while (t > 0 && PUNCT.test(word[t])) { autofill.add(pos + t); t--; }
    pos += word.length + 1;
  });
  return { hints, autofill };
}

function buildWordGrid(target, typed) {
  wordGrid.innerHTML = '';
  const { hints, autofill } = getCharMeta(target);
  const words = target.split(' ');
  let pos = 0;

  words.forEach((word, wi) => {
    const group = document.createElement('div');
    group.className = 'word-group';
    for (let ci = 0; ci < word.length; ci++) {
      const idx = pos + ci;
      const tChar = target[idx], uChar = typed[idx];
      const wrap   = document.createElement('div'); wrap.className = 'wchar';
      const letter = document.createElement('div'); letter.className = 'wchar-letter';
      const line   = document.createElement('div'); line.className = 'wchar-line';
      if (autofill.has(idx)) {
        letter.textContent = tChar; wrap.classList.add('state-auto');
      } else if (uChar !== undefined) {
        letter.textContent = tChar;
        wrap.classList.add(uChar.toLowerCase() === tChar.toLowerCase() ? 'state-ok' : 'state-bad');
      } else if (hints.has(idx)) {
        letter.textContent = tChar; wrap.classList.add('state-hint');
      } else {
        letter.textContent = '_'; wrap.classList.add('state-hidden');
      }
      wrap.appendChild(letter); wrap.appendChild(line); group.appendChild(wrap);
    }
    pos += word.length + 1;
    wordGrid.appendChild(group);
    if (wi < words.length - 1) {
      const sp = document.createElement('div');
      sp.style.cssText = 'width:5px;flex-shrink:0';
      wordGrid.appendChild(sp);
    }
  });
}

// ─── Session ──────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startSession() {
  const pool = getPool();
  if (!pool.length) return;
  sessionCards = shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));
  sessionIndex = 0;
  streak = 0; bestStreak = 0;
  totalCorrect = 0; totalAttempts = 0; totalCharsTyped = 0;
  sessionStart = Date.now();
  updateStats();
  gameArea.style.display = 'block';
  sessionEndEl.style.display = 'none';
  loadCard();
  mainCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function loadCard() {
  const card = sessionCards[sessionIndex];
  promptEl.textContent = card.croatian;
  promptSub.textContent = card.source || '';
  inputEl.value = '';
  inputEl.className = '';
  solutionEl.style.display = 'none';
  forceCorrection = false;
  hintCount = 0;
  progFill.style.width = (sessionIndex / sessionCards.length * 100) + '%';
  const color = catColors[card.cat] || '#888';
  categoryEl.textContent = card.cat;
  categoryEl.style.color = color;
  categoryEl.style.borderColor = color + '55';
  categoryEl.style.background = color + '14';
  mainCard.classList.add('active');
  buildWordGrid(card.target, '');
  updateSearchLinks(card);
  inputEl.focus();
}

// ─── Events ───────────────────────────────────────────────────────
inputEl.addEventListener('input', () => {
  buildWordGrid(sessionCards[sessionIndex].target, inputEl.value);
});

document.getElementById('hintBtn').addEventListener('click', () => {
  const target = sessionCards[sessionIndex].target;
  hintCount++;
  const reveal = target.slice(0, hintCount * 3);
  inputEl.value = reveal;
  buildWordGrid(target, reveal);
  inputEl.focus();
});

inputEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const card = sessionCards[sessionIndex];
  if (normalize(inputEl.value) === normalize(card.target)) {
    totalCharsTyped += card.target.length;
    if (!forceCorrection) {
      totalCorrect++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      showCombo();
      showToast(getEncouragement(streak));
    }
    totalAttempts++;
    inputEl.className = 'correct';
    updateStats();
    setTimeout(() => {
      sessionIndex++;
      if (sessionIndex >= sessionCards.length) showSessionEnd();
      else loadCard();
    }, 140);
  } else {
    if (!forceCorrection) { totalAttempts++; streak = 0; }
    inputEl.className = 'wrong';
    solutionEl.innerHTML = '<strong>Richtig:</strong> ' + card.target;
    solutionEl.style.display = 'block';
    forceCorrection = true;
    updateStats();
  }
});

// ─── Stats ────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('streakNum').textContent = streak;
  document.getElementById('correctVal').textContent = totalCorrect;
  document.getElementById('totalVal').textContent = totalAttempts;
  const acc = totalAttempts ? Math.round(totalCorrect / totalAttempts * 100) : null;
  document.getElementById('accuracyVal').textContent = acc !== null ? acc + '%' : '—';
  const mins = (Date.now() - sessionStart) / 60000;
  const wpm = mins > 0 && totalCharsTyped > 0 ? Math.round((totalCharsTyped / 5) / mins) : null;
  document.getElementById('wpmVal').textContent = wpm || '—';
}

// ─── Combo / Toast ────────────────────────────────────────────────
function showCombo() {
  if (streak < 3) return;
  const labels = ['','','','🔥 Gut!','⚡ Stark!','💥 Super!','🌟 Mega!','🚀 Wahnsinn!','👑 Unschlagbar!'];
  comboPop.textContent = labels[Math.min(streak, labels.length - 1)] || ('🔥 x' + streak);
  comboPop.classList.remove('animate');
  void comboPop.offsetWidth;
  comboPop.classList.add('animate');
}

let toastTimer;
function showToast(msg) {
  if (!msg) return;
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1400);
}

function getEncouragement(s) {
  if (s === 3)  return '🔥 Drei in Reihe!';
  if (s === 5)  return '⚡ Fünf! Weiter so!';
  if (s === 7)  return '💪 Perfekt!';
  if (s === 10) return '🌟 Legende!';
  return null;
}

// ─── Session end ──────────────────────────────────────────────────
function showSessionEnd() {
  progFill.style.width = '100%';
  gameArea.style.display = 'none';
  sessionEndEl.style.display = 'block';
  const pct = Math.round(totalCorrect / sessionCards.length * 100);
  document.getElementById('finalScore').textContent = pct + '%';
  const secs = Math.round((Date.now() - sessionStart) / 1000);
  const wpm  = secs > 0 ? Math.round((totalCharsTyped / 5) / (secs / 60)) : 0;
  document.getElementById('finalDetails').textContent =
    totalCorrect + '/' + sessionCards.length + ' richtig · Streak: ' + bestStreak + ' · ' + wpm + ' WPM · ' + secs + 's';
  document.getElementById('finalEmoji').textContent =
    pct === 100 ? '🏆🥇🔥' : pct >= 80 ? '🌟💪' : pct >= 60 ? '👍📚' : '💡 Weiterüben!';
}

// ─── Init ─────────────────────────────────────────────────────────
buildCatPanel();
startSession();