const CATEGORY_ALIASES = {
  "PrÃ¤position": "Präposition",
  "PrÃƒÂ¤position": "Präposition",
};

const catColors = {
  Nomen: "#60a5fa",
  Verb: "#f472b6",
  Adjektiv: "#4ade80",
  Adverb: "#dbfa60",
  Präposition: "#f47272",
  Konjunktion: "#884ade",
  Ausdruck: "#fb923c",
  Satz: "#a78bfa",
};

const allCats = Object.keys(catColors);
const searchSites = [
  { name: "dict.cc", icon: "C", url: (w) => `https://www.dict.cc/?s=${encodeURIComponent(w)}` },
  { name: "Google", icon: "G", url: (w) => `https://www.google.com/search?q=${encodeURIComponent(`${w} auf Deutsch`)}` },
  { name: "Linguee", icon: "L", url: (w) => `https://www.linguee.de/deutsch-englisch/search?query=${encodeURIComponent(w)}` },
  { name: "Leo", icon: "L", url: (w) => `https://dict.leo.org/german-english/${encodeURIComponent(w)}` },
];

const SESSION_SIZE = 10;
const SESSION_STORAGE_KEY = "germancro-session-cards";
const PUNCT = /[.,!?:;]/;
const FACTS_IMAGE_ROOT = "assets/facts";
const TOURISM_LINKS = {
  germany: "https://www.germany.travel/",
  states: {
    "baden-wuerttemberg": "https://www.tourismus-bw.de/",
    "bayern": "https://www.bayern.by/",
    "berlin": "https://www.visitberlin.de/",
    "brandenburg": "https://www.reiseland-brandenburg.de/",
    "bremen": "https://www.bremen-tourism.de/",
    "hamburg": "https://www.hamburg-tourism.de/",
    "hessen": "https://www.hessen-tourismus.de/",
    "mecklenburg-vorpommern": "https://www.auf-nach-mv.de/",
    "niedersachsen": "https://www.reiseland-niedersachsen.de/",
    "nordrhein-westfalen": "https://www.nrw-tourismus.de/",
    "rheinland-pfalz": "https://www.rlp-tourismus.com/",
    "saarland": "https://www.urlaub.saarland/",
    "sachsen": "https://www.sachsen-tourismus.de/",
    "sachsen-anhalt": "https://www.sachsen-anhalt-tourismus.de/",
    "schleswig-holstein": "https://www.sh-tourismus.de/",
    "thueringen": "https://www.thueringen-entdecken.de/",
  },
  countries: {
    "frankreich": "https://www.france.fr/",
    "spanien": "https://www.spain.info/",
    "england": "https://www.visitengland.com/",
    "schweden": "https://visitsweden.com/",
    "polen": "https://www.polen.travel/de/",
    "oesterreich": "https://www.austria.info/",
    "ungarn": "https://visithungary.com/",
    "kroatien": "https://croatia.hr/",
    "bosnien-herzegowina": "https://www.tourismbih.com/",
    "serbien": "https://www.serbia.travel/en",
    "nordmazedonien": "https://northmacedonia-timeless.com/",
    "albanien": "https://albania.al/",
    "griechenland": "https://www.visitgreece.gr/",
    "bulgarien": "https://bulgariatravel.org/en/",
    "tuerkei": "https://goturkiye.com/",
    "rumaenien": "https://www.romania.travel/",
    "ukraine": "https://ukraine.ua/visit/",
    "russland": "https://visitrussia.org.uk/",
    "weissrussland": "https://www.belarus.by/en/travel/",
    "tschechien": "https://www.visitczechia.com/",
    "slowakei": "https://slovakia.travel/en",
    "slowenien": "https://www.slovenia.info/en",
    "italien": "https://www.italia.it/en",
    "niederlande": "https://www.holland.com/global/tourism/discover-the-netherlands.htm",
    "belgien": "https://visitbelgium.com/",
    "daenemark": "https://www.visitdenmark.com/",
    "finnland": "https://www.visitfinland.com/",
    "norwegen": "https://www.visitnorway.com/",
    "irland": "https://www.ireland.com/",
  },
};
const OFFICIAL_LINKS = {
  germany: "https://www.deutschland.de/",
  states: {
    "baden-wuerttemberg": "https://www.baden-wuerttemberg.de/",
    "bayern": "https://www.bayern.de/",
    "berlin": "https://www.berlin.de/",
    "brandenburg": "https://www.brandenburg.de/",
    "bremen": "https://www.bremen.de/",
    "hamburg": "https://www.hamburg.de/",
    "hessen": "https://www.hessen.de/",
    "mecklenburg-vorpommern": "https://www.regierung-mv.de/",
    "niedersachsen": "https://www.niedersachsen.de/",
    "nordrhein-westfalen": "https://www.land.nrw/",
    "rheinland-pfalz": "https://www.rlp.de/",
    "saarland": "https://www.saarland.de/",
    "sachsen": "https://www.sachsen.de/",
    "sachsen-anhalt": "https://www.sachsen-anhalt.de/",
    "schleswig-holstein": "https://www.schleswig-holstein.de/",
    "thueringen": "https://thueringen.de/",
  },
  countries: {
    "frankreich": "https://www.gouvernement.fr/en",
    "spanien": "https://administracion.gob.es/",
    "england": "https://www.gov.uk/",
    "schweden": "https://sweden.se/",
    "polen": "https://www.gov.pl/web/gov",
    "oesterreich": "https://www.oesterreich.gv.at/en/",
    "ungarn": "https://abouthungary.hu/",
    "kroatien": "https://vlada.gov.hr/?lang=en",
    "bosnien-herzegowina": "https://bih.gov.ba/?lang=en",
    "serbien": "https://www.srbija.gov.rs/?lang=en-US",
    "nordmazedonien": "https://vlada.mk/?ln=en-gb",
    "albanien": "https://albania.al/",
    "griechenland": "https://www.gov.gr/en/",
    "bulgarien": "https://www.government.bg/en",
    "tuerkei": "https://www.turkiye.gov.tr/",
    "rumaenien": "https://www.romania.gov.ro/en/",
    "ukraine": "https://www.ukraine.ua/",
    "russland": "https://government.ru/en/",
    "weissrussland": "https://www.belarus.by/en/",
    "tschechien": "https://www.czech.cz/en/",
    "slowakei": "https://welcometoslovakia.gov.sk/",
    "slowenien": "https://slovenia.si/",
    "italien": "https://www.governo.it/en",
    "niederlande": "https://www.government.nl/",
    "belgien": "https://www.belgium.be/en",
    "daenemark": "https://denmark.dk/",
    "finnland": "https://finland.fi/",
    "norwegen": "https://www.norge.no/en",
    "irland": "https://www.gov.ie/en/",
  },
};
const EUROPE_FLAG_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 90" role="img" aria-label="Flagge Europas">
    <rect width="150" height="90" fill="#003399"/>
    <g fill="#ffcc00">
      <circle cx="75" cy="19" r="3.2"/>
      <circle cx="89" cy="22.8" r="3.2"/>
      <circle cx="99.2" cy="33" r="3.2"/>
      <circle cx="103" cy="45" r="3.2"/>
      <circle cx="99.2" cy="57" r="3.2"/>
      <circle cx="89" cy="67.2" r="3.2"/>
      <circle cx="75" cy="71" r="3.2"/>
      <circle cx="61" cy="67.2" r="3.2"/>
      <circle cx="50.8" cy="57" r="3.2"/>
      <circle cx="47" cy="45" r="3.2"/>
      <circle cx="50.8" cy="33" r="3.2"/>
      <circle cx="61" cy="22.8" r="3.2"/>
    </g>
  </svg>`
)}`;
const STATE_NOTABLE_PEOPLE = {
  "baden-wuerttemberg": {
    science: ["Albert Einstein", "Johannes Kepler", "Carl Benz"],
    politics: ["Theodor Heuss", "Carlo Schmid", "Winfried Kretschmann"],
    art: ["Friedrich Schiller", "Hermann Hesse", "Otto Dix"],
  },
  bayern: {
    science: ["Werner Heisenberg", "Carl von Linde", "Rudolf Diesel"],
    politics: ["Franz Josef Strauss", "Kurt Eisner", "Markus Soeder"],
    art: ["Richard Wagner", "Franz Marc", "Oskar Maria Graf"],
  },
  berlin: {
    science: ["Albert Einstein", "Max Planck", "Rudolf Virchow"],
    politics: ["Willy Brandt", "Angela Merkel", "Walter Rathenau"],
    art: ["Marlene Dietrich", "Käthe Kollwitz", "Bertolt Brecht"],
  },
  brandenburg: {
    science: ["Hermann von Helmholtz", "Hasso Plattner", "Karl Foerster"],
    politics: ["Matthias Platzeck", "Dietmar Woidke", "Manfred Stolpe"],
    art: ["Heinrich von Kleist", "Theodor Fontane", "Wolfgang Joop"],
  },
  bremen: {
    science: ["Heinrich Wilhelm Olbers", "Adolf Bastian"],
    politics: ["Hans Koschnick", "Henning Scherf", "Karl Carstens"],
    art: ["Paula Modersohn-Becker", "Loriot", "Wilhelm Wagenfeld"],
  },
  hamburg: {
    science: ["Otto Stern", "Ernst Ruska", "Klaus Hasselmann"],
    politics: ["Helmut Schmidt", "Olaf Scholz", "Peter Tschentscher"],
    art: ["Johannes Brahms", "Udo Lindenberg", "Wolfgang Borchert"],
  },
  hessen: {
    science: ["Paul Ehrlich", "Robert Bunsen", "Otto Hahn"],
    politics: ["Joschka Fischer", "Georg-August Zinn", "Volker Bouffier"],
    art: ["Johann Wolfgang von Goethe", "Brüder Grimm", "Anne Frank"],
  },
  "mecklenburg-vorpommern": {
    science: ["Heinrich Schliemann", "Albrecht Kossel", "Otto Lilienthal"],
    politics: ["Angela Merkel", "Manuela Schwesig", "Joachim Gauck"],
    art: ["Caspar David Friedrich", "Fritz Reuter", "Uwe Johnson"],
  },
  niedersachsen: {
    science: ["Carl Friedrich Gauss", "Wilhelm Weber", "David Hilbert"],
    politics: ["Gerhard Schröder", "Christian Wulff", "Ernst Albrecht"],
    art: ["Wilhelm Busch", "Kurt Schwitters", "Niki de Saint Phalle"],
  },
  "nordrhein-westfalen": {
    science: ["Harald zur Hausen", "Max Born", "Julius Plücker"],
    politics: ["Konrad Adenauer", "Johannes Rau", "Armin Laschet"],
    art: ["Ludwig van Beethoven", "Heinrich Böll", "Joseph Beuys"],
  },
  "rheinland-pfalz": {
    science: ["Johannes Gutenberg", "Hermann Staudinger", "Julius Richard Petri"],
    politics: ["Helmut Kohl", "Malu Dreyer", "Kurt Beck"],
    art: ["Hildegard von Bingen", "Max Slevogt", "Thomas Nast"],
  },
  saarland: {
    science: ["Peter Grünberg", "Wolfgang Wahlster"],
    politics: ["Oskar Lafontaine", "Heiko Maas", "Annegret Kramp-Karrenbauer"],
    art: ["Max Ophüls", "Nicole", "Gerd Dudenhöffer"],
  },
  sachsen: {
    science: ["Gottfried Wilhelm Leibniz", "Wilhelm Ostwald", "Manfred von Ardenne"],
    politics: ["August Bebel", "Kurt Biedenkopf", "Stanislaw Tillich"],
    art: ["Richard Wagner", "Erich Kästner", "Caspar David Friedrich"],
  },
  "sachsen-anhalt": {
    science: ["Otto von Guericke", "Dorothea Erxleben", "Georg Cantor"],
    politics: ["Hans-Dietrich Genscher", "Reiner Haseloff", "Wolfgang Böhmer"],
    art: ["Georg Friedrich Händel", "Lyonel Feininger", "Johann Joachim Winckelmann"],
  },
  "schleswig-holstein": {
    science: ["Max Planck", "Otto Diels", "Ferdinand Tönnies"],
    politics: ["Willy Brandt", "Heide Simonis", "Daniel Günther"],
    art: ["Thomas Mann", "Günter Grass", "Emil Nolde"],
  },
  thueringen: {
    science: ["Carl Zeiss", "Ernst Abbe", "Johann Wolfgang Döbereiner"],
    politics: ["Bodo Ramelow", "Christine Lieberknecht", "Bernhard Vogel"],
    art: ["Johann Sebastian Bach", "Johann Wolfgang von Goethe", "Friedrich Schiller"],
  },
};

let allCards = [];
let persistentCards = [];
let sessionOnlyCards = [];
let selectedCats = null;
let capabilities = { persistentSave: false };

let sessionCards = [];
let sessionIndex = 0;
let streak = 0;
let bestStreak = 0;
let totalCorrect = 0;
let totalAttempts = 0;
let forceCorrection = false;
let hintCount = 0;
let sessionStart = 0;
let totalCharsTyped = 0;
let difficulty = "easy";
let previousTypedValue = "";
let feedbackBurstTimer = null;
let learningMode = "de";
let isSettingsOpen = false;
let germanyFacts = null;
let europeFacts = null;
let factsMode = "germany";
let selectedStateId = null;
let selectedEuropeCountryId = null;
let locales = null;

const LEARNING_MODE_STORAGE_KEY = "germancro.learningMode";
const LANGUAGE_SEQUENCE = ["de", "hr", "en"];
const LANGUAGE_FLAGS = {
  de: "🇩🇪",
  hr: "🇭🇷",
  en: "🇬🇧",
};
const LANGUAGE_TITLES = {
  de: "Germancro",
  hr: "Crogerman",
  en: "Mancroger",
};
const promptEl = document.getElementById("promptText");
const promptSub = document.getElementById("promptSub");
const promptPrimaryFlagEl = document.getElementById("promptPrimaryFlag");
const promptSecondaryFlagEl = document.getElementById("promptSecondaryFlag");
const promptSwapBtn = document.getElementById("promptSwapBtn");
const inputFlagEl = document.querySelector(".input-flag");
const siteTitleEl = document.querySelector(".site-title");
const languageDockEl = document.getElementById("languageDock");
const languageDockButtons = Array.from(document.querySelectorAll(".language-dock-btn"));
const appLoaderEl = document.getElementById("appLoader");
const appLoaderSpinnerEl = document.getElementById("appLoaderSpinner");
const installGuidePanelEl = document.getElementById("installGuidePanel");
const installGuideBrowserPanelEl = document.getElementById("installGuideBrowserPanel");
const installGuideBrowserEl = document.getElementById("installGuideBrowser");
const installGuideStepsEl = document.getElementById("installGuideSteps");
const statLabelStreakEl = document.getElementById("statLabelStreak");
const statLabelRemainingEl = document.getElementById("statLabelRemaining");
const statLabelAccuracyEl = document.getElementById("statLabelAccuracy");
const statLabelWpmEl = document.getElementById("statLabelWpm");
const cardLegendEl = document.getElementById("cardLegend");
const legendCorrectEl = document.getElementById("legendCorrect");
const legendNextEl = document.getElementById("legendNext");
const legendWrongEl = document.getElementById("legendWrong");
const promptHeadTitleEl = document.getElementById("promptHeadTitle");
const inputEl = document.getElementById("answer");
const solutionEl = document.getElementById("solution");
const wordGrid = document.getElementById("wordGrid");
const answerGuideEl = document.getElementById("answerGuide");
const answerGuideLabelEl = document.getElementById("answerGuideLabel");
const answerGuideStatusEl = document.getElementById("answerGuideStatus");
const answerGuideNoteEl = document.getElementById("answerGuideNote");
const feedbackBurstEl = document.getElementById("feedbackBurst");
const progFill = document.getElementById("progressFill");
const categoryEl = document.getElementById("categoryBadge");
const comboPop = document.getElementById("comboPop");
const gameArea = document.getElementById("gameArea");
const sessionEndEl = document.getElementById("sessionEnd");
const mainCard = document.getElementById("mainCard");
const progressTrackEl = document.querySelector(".progress-track");
const statsBarEl = document.querySelector(".stats-bar");
const catPanelEl = document.getElementById("catPanel");
const catCountEl = document.getElementById("catCount");
const catPanelTitleEl = document.getElementById("catPanelTitle");
const difficultyHardBtn = document.getElementById("difficultyHardBtn");
const difficultyMediumBtn = document.getElementById("difficultyMediumBtn");
const difficultyEasyBtn = document.getElementById("difficultyEasyBtn");
const sliderUnitLabelEl = document.getElementById("sliderUnitLabel");
const newGameBtn = document.getElementById("newGameBtn");
const settingsBtn = document.getElementById("settingsBtn");
const searchPanelEl = document.getElementById("searchPanel");
const searchPanelTitleEl = document.getElementById("searchPanelTitle");
const searchPanelSubtitleEl = document.getElementById("searchPanelSubtitle");
const grammarSectionTitleEl = document.getElementById("grammarSectionTitle");
const grammarGridEl = document.getElementById("grammarGrid");
const searchLinksEl = document.getElementById("searchLinks");
const authorPanelEl = document.getElementById("authorPanel");
const authorToggleBtn = document.getElementById("authorToggleBtn");
const authorPanelTitleEl = document.getElementById("authorPanelTitle");

const addCardForm = document.getElementById("addCardForm");
const addCardDeEl = document.getElementById("newCardDe");
const addCardHrEl = document.getElementById("newCardHr");
const addCardEnEl = document.getElementById("newCardEn");
const addCardCatEl = document.getElementById("newCardCat");
const authorLabelDeEl = document.getElementById("authorLabelDe");
const authorLabelCatEl = document.getElementById("authorLabelCat");
const authorLabelHrEl = document.getElementById("authorLabelHr");
const authorLabelEnEl = document.getElementById("authorLabelEn");
const addCardSaveBtn = document.getElementById("addCardSaveBtn");
const exportCardsBtn = document.getElementById("exportCardsBtn");
const addCardStatusEl = document.getElementById("addCardStatus");
const authorModeEl = document.getElementById("authorMode");
const factsPanelTitleEl = document.getElementById("factsPanelTitle");
const factsPanelSubtitleEl = document.getElementById("factsPanelSubtitle");
const factsCountryBtn = document.getElementById("factsCountryBtn");
const factsStatesBtn = document.getElementById("factsStatesBtn");
const statePickerWrap = document.getElementById("statePickerWrap");
const statePickerEl = document.getElementById("statePicker");
const factsContentEl = document.getElementById("factsContent");
const enterHintTextEl = document.getElementById("enterHintText");
const sessionEndLabelEl = document.getElementById("sessionEndLabel");
const restartBtnEl = document.getElementById("restartBtn");
const siteFooterLinkEl = document.getElementById("siteFooterLink");
let appLoaderStartedAt = Date.now();

if (statsBarEl && mainCard && progressTrackEl) {
  mainCard.insertBefore(statsBarEl, progressTrackEl);
}

if (authorPanelEl && searchPanelEl && searchPanelEl.parentNode) {
  searchPanelEl.parentNode.insertBefore(authorPanelEl, searchPanelEl);
}

function initAppLoader() {
  if (!appLoaderSpinnerEl) {
    return;
  }

  appLoaderStartedAt = Date.now();
  appLoaderSpinnerEl.innerHTML = "";

  const loaderColors = ["is-black", "is-red", "is-gold"];

  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    dot.className = "app-loader-dot";
    dot.classList.add(loaderColors[i]);
    dot.style.setProperty("--offset", `${(i - 1) * 24}px`);

    appLoaderSpinnerEl.appendChild(dot);
  }
}

function hideAppLoader() {
  if (!appLoaderEl) {
    return;
  }

  const elapsed = Date.now() - appLoaderStartedAt;
  const delay = Math.max(0, 600 - elapsed);

  window.setTimeout(() => {
    appLoaderEl.classList.add("is-hidden");
  }, delay);
}

function setSettingsOpen(isOpen) {
  isSettingsOpen = Boolean(isOpen);

  if (catPanelEl) {
    catPanelEl.classList.toggle("is-hidden", !isSettingsOpen);
  }

  if (settingsBtn) {
    settingsBtn.classList.toggle("active", isSettingsOpen);
    settingsBtn.setAttribute("aria-expanded", String(isSettingsOpen));
  }

  if (languageDockEl) {
    languageDockEl.classList.toggle("is-settings-open", isSettingsOpen);
  }
}

function normalizeCategory(cat) {
  return CATEGORY_ALIASES[cat] || cat;
}

function normalizeField(value) {
  const raw = String(value || "");
  let normalized = "";
  let sawSpace = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const isSpace = char <= " ";

    if (isSpace) {
      sawSpace = normalized.length > 0;
      continue;
    }

    if (sawSpace) {
      normalized += " ";
      sawSpace = false;
    }

    normalized += char;
  }

  return normalized;
}

function normalizeAnswer(value) {
  const normalized = normalizeField(value);
  let end = normalized.length;

  while (end > 0) {
    const char = normalized[end - 1];
    if (char !== "." && char !== "," && char !== "!" && char !== "?" && char !== ":" && char !== ";") {
      break;
    }
    end -= 1;
  }

  return normalized.slice(0, end).toLowerCase();
}

function getSecureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    return 0;
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    return 0;
  }

  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const values = new Uint32Array(1);

  do {
    cryptoApi.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % maxExclusive;
}

function getSecureRandomRange(minInclusive, maxInclusive) {
  if (!Number.isFinite(minInclusive) || !Number.isFinite(maxInclusive)) {
    return minInclusive;
  }

  const min = Math.ceil(Math.min(minInclusive, maxInclusive));
  const max = Math.floor(Math.max(minInclusive, maxInclusive));
  return min + getSecureRandomInt((max - min) + 1);
}

function loadLearningMode() {
  try {
    const saved = localStorage.getItem(LEARNING_MODE_STORAGE_KEY);
    return LANGUAGE_SEQUENCE.includes(saved) ? saved : "de";
  } catch (error) {
    return "de";
  }
}

function saveLearningMode() {
  try {
    localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode);
  } catch (error) {
    // Ignore storage failures and keep the in-memory preference.
  }
}

function getLocale() {
  return learningMode;
}

function getLocaleBundle(locale = getLocale()) {
  if (!locales) {
    return null;
  }
  return locales[locale] || locales.de || null;
}

function getByPath(object, path) {
  return String(path || "")
    .split(".")
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);
}

function formatTemplate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (
    params[key] !== undefined && params[key] !== null ? String(params[key]) : ""
  ));
}

function t(path, params = {}) {
  const current = getByPath(getLocaleBundle(), path);
  if (current !== undefined) {
    return formatTemplate(current, params);
  }
  const fallback = getByPath(getLocaleBundle("de"), path);
  if (fallback !== undefined) {
    return formatTemplate(fallback, params);
  }
  return path;
}

function getCategoryLabel(cat) {
  return t(`categories.${cat}`);
}

function setTextContent(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setLocalizedText(element, path, params) {
  setTextContent(element, t(path, params));
}

function setLocalizedAriaLabel(element, path, params) {
  if (element) {
    element.setAttribute("aria-label", t(path, params));
  }
}

function joinLocalizedList(items, conjunction = ", ") {
  return items.filter(Boolean).join(conjunction);
}

function getCardValue(card, language) {
  if (!card) {
    return "";
  }
  return String(card[language] || "").trim();
}

function getTargetLanguage() {
  return learningMode;
}

function getTargetValue(card) {
  return getCardValue(card, getTargetLanguage());
}

function getPromptLanguages() {
  const activeIndex = LANGUAGE_SEQUENCE.indexOf(getTargetLanguage());
  return [
    LANGUAGE_SEQUENCE[(activeIndex + 1) % LANGUAGE_SEQUENCE.length],
    LANGUAGE_SEQUENCE[(activeIndex + 2) % LANGUAGE_SEQUENCE.length],
  ];
}

function cycleLearningMode() {
  const currentIndex = LANGUAGE_SEQUENCE.indexOf(getTargetLanguage());
  learningMode = LANGUAGE_SEQUENCE[(currentIndex + 1) % LANGUAGE_SEQUENCE.length];
}

function renderSiteTitle(language) {
  if (!siteTitleEl) {
    return;
  }

  const title = LANGUAGE_TITLES[language] || LANGUAGE_TITLES.de;
  siteTitleEl.innerHTML = "";
  siteTitleEl.setAttribute("aria-label", title);

  title.split("").forEach((letter, index) => {
    const span = document.createElement("span");
    span.className = `site-title-letter band-${Math.min(3, Math.floor(index / 3) + 1)}`;
    span.dataset.letter = letter;
    span.textContent = letter;
    siteTitleEl.appendChild(span);
  });
}

function updateLanguageDock() {
  const languageDock = document.getElementById("languageDock");
  if (languageDock) {
    languageDock.setAttribute("aria-label", t("messages.languageDockAria"));
  }
  languageDockButtons.forEach((button) => {
    const language = button.dataset.lang;
    button.textContent = LANGUAGE_FLAGS[language] || "";
    button.classList.toggle("is-active", language === getTargetLanguage());
    button.setAttribute("aria-pressed", String(language === getTargetLanguage()));
    button.setAttribute("aria-label", t(`messages.languageNames.${language}`));
  });
}

function applyLearningTheme() {
  document.body.dataset.learningMode = getTargetLanguage();
  document.documentElement.lang = getLocaleBundle()?.meta?.htmlLang || getTargetLanguage();
  updateLanguageDock();
  renderSiteTitle(getTargetLanguage());
}

function renderGrammarSection() {
  if (!grammarGridEl) {
    return;
  }

  grammarGridEl.innerHTML = "";
  const cards = getLocaleBundle()?.grammar?.cards || [];

  cards.forEach((card) => {
    const section = document.createElement("section");
    section.className = "grammar-card";

    const title = document.createElement("div");
    title.className = "grammar-card-title";
    title.textContent = card.title;
    section.appendChild(title);

    const wrap = document.createElement("div");
    wrap.className = "grammar-table-wrap";

    const table = document.createElement("table");
    table.className = "grammar-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    card.columns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    card.rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell, index) => {
        const td = document.createElement(index === 0 ? "th" : "td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    section.appendChild(wrap);
    grammarGridEl.appendChild(section);
  });
}

function renderStaticUi() {
  setLocalizedText(statLabelStreakEl, "messages.stats.streak");
  setLocalizedText(statLabelRemainingEl, "messages.stats.remaining");
  setLocalizedText(statLabelAccuracyEl, "messages.stats.accuracy");
  setLocalizedText(statLabelWpmEl, "messages.stats.wpm");
  setLocalizedAriaLabel(cardLegendEl, "messages.legend.aria");
  setLocalizedText(legendCorrectEl, "messages.legend.correct");
  setLocalizedText(legendNextEl, "messages.legend.next");
  setLocalizedText(legendWrongEl, "messages.legend.wrong");
  setLocalizedText(promptHeadTitleEl, "messages.prompt.card");
  if (promptSwapBtn) {
    promptSwapBtn.setAttribute("aria-label", t("messages.prompt.swapAria"));
    promptSwapBtn.setAttribute("title", t("messages.prompt.swapTitle"));
  }
  if (inputEl) {
    inputEl.placeholder = t("messages.prompt.placeholder");
  }
  setLocalizedText(answerGuideLabelEl, "messages.guide.label");
  setLocalizedText(document.getElementById("hintBtn"), "messages.actions.hint");
  setLocalizedText(enterHintTextEl, "messages.actions.enterHint");
  setLocalizedText(sessionEndLabelEl, "messages.session.finished");
  setLocalizedText(restartBtnEl, "messages.session.newRound");
  setLocalizedText(catPanelTitleEl, "messages.categories.title");
  setLocalizedText(sliderUnitLabelEl, "messages.categories.unit");
  setLocalizedText(newGameBtn, "messages.categories.newGame");
  setLocalizedText(difficultyEasyBtn, "difficulty.easy");
  setLocalizedText(difficultyMediumBtn, "difficulty.medium");
  setLocalizedText(difficultyHardBtn, "difficulty.hard");
  setLocalizedText(searchPanelTitleEl, "messages.search.title");
  setLocalizedText(searchPanelSubtitleEl, "messages.search.subtitle");
  setLocalizedText(authorToggleBtn, "messages.search.authorToggle");
  setLocalizedText(grammarSectionTitleEl, "grammar.title");
  setLocalizedText(authorPanelTitleEl, "messages.authoring.title");
  setLocalizedText(authorLabelDeEl, "messages.authoring.labels.de");
  setLocalizedText(authorLabelCatEl, "messages.authoring.labels.cat");
  setLocalizedText(authorLabelHrEl, "messages.authoring.labels.hr");
  setLocalizedText(authorLabelEnEl, "messages.authoring.labels.en");
  if (addCardDeEl) {
    addCardDeEl.placeholder = t("messages.authoring.placeholders.de");
  }
  if (addCardHrEl) {
    addCardHrEl.placeholder = t("messages.authoring.placeholders.hr");
  }
  if (addCardEnEl) {
    addCardEnEl.placeholder = t("messages.authoring.placeholders.en");
  }
  setLocalizedText(factsPanelTitleEl, "facts.panelTitle");
  setLocalizedText(factsPanelSubtitleEl, "facts.panelSubtitle");
  setLocalizedText(factsCountryBtn, "facts.tabs.germany");
  setLocalizedText(factsStatesBtn, "facts.tabs.europe");
  setLocalizedText(siteFooterLinkEl, "footer");
  renderGrammarSection();
}

function switchLearningMode(nextLanguage) {
  if (!LANGUAGE_SEQUENCE.includes(nextLanguage) || nextLanguage === getTargetLanguage()) {
    return;
  }

  document.body.classList.add("is-language-switching");
  if (siteTitleEl) {
    siteTitleEl.classList.remove("is-changing-in");
    siteTitleEl.classList.add("is-changing-out");
  }

  window.setTimeout(() => {
    learningMode = nextLanguage;
    saveLearningMode();
    applyLearningTheme();
    renderStaticUi();
    renderInstallGuide();
    renderAuthoringMode();
    updateStats();
    renderFactsSelection();
    loadCard();

    if (siteTitleEl) {
      siteTitleEl.classList.remove("is-changing-out");
      siteTitleEl.classList.add("is-changing-in");
      window.setTimeout(() => siteTitleEl.classList.remove("is-changing-in"), 340);
    }

    window.setTimeout(() => document.body.classList.remove("is-language-switching"), 180);
  }, 85);
}

function renderPrompt(card) {
  if (!card) {
    return;
  }

  const [primaryLanguage, secondaryLanguage] = getPromptLanguages();
  promptEl.textContent = getCardValue(card, primaryLanguage);
  promptSub.textContent = getCardValue(card, secondaryLanguage);

  if (promptPrimaryFlagEl) {
    promptPrimaryFlagEl.textContent = LANGUAGE_FLAGS[primaryLanguage];
  }
  if (promptSecondaryFlagEl) {
    promptSecondaryFlagEl.textContent = LANGUAGE_FLAGS[secondaryLanguage];
  }
  if (inputFlagEl) {
    inputFlagEl.textContent = LANGUAGE_FLAGS[getTargetLanguage()];
  }
  if (promptSwapBtn) {
    promptSwapBtn.innerHTML = "&#128260;";
    promptSwapBtn.setAttribute("aria-label", t("messages.prompt.swapAria"));
    promptSwapBtn.setAttribute("title", t("messages.prompt.swapTitle"));
  }
  return;
}

function cardKey(card) {
  return [
    normalizeAnswer(card.de),
    normalizeAnswer(card.hr),
    normalizeCategory(card.cat),
  ].join("::");
}

function sanitizeCard(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const card = {
    de: normalizeField(raw.de),
    hr: normalizeField(raw.hr),
    en: normalizeField(raw.en),
    cat: normalizeCategory(normalizeField(raw.cat)),
  };

  if (!card.de || !card.hr || !card.en || !allCats.includes(card.cat)) {
    return null;
  }

  return card;
}

function mergeCards(...groups) {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((item) => {
    const card = sanitizeCard(item);
    if (!card) {
      return;
    }

    const key = cardKey(card);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(card);
  });

  return merged;
}

async function fetchJson(url, fallback) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return fallback;
    }
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

async function loadLocales() {
  return fetchJson("locales.json", null);
}

async function detectCapabilities() {
  try {
    const response = await fetch("./api/capabilities", { cache: "no-store" });
    if (!response.ok) {
      return { persistentSave: false };
    }
    const data = await response.json();
    return {
      persistentSave: Boolean(data && data.persistentSave),
      storageFile: data && data.storageFile ? data.storageFile : null,
    };
  } catch (error) {
    return { persistentSave: false };
  }
}

function loadSessionCards() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(sanitizeCard).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveSessionCards() {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionOnlyCards, null, 2));
}

function getExtraCardsForExport() {
  return mergeCards(persistentCards, sessionOnlyCards);
}

function setAuthoringFeedback(message, isError) {
  addCardStatusEl.textContent = message;
  addCardStatusEl.classList.toggle("is-error", Boolean(isError));
}

function setAuthoringBusy(isBusy) {
  addCardSaveBtn.disabled = isBusy;
  exportCardsBtn.disabled = isBusy;
  addCardSaveBtn.textContent = isBusy
    ? t("messages.authoring.saveBusy")
    : capabilities.persistentSave
      ? t("messages.authoring.savePersistent")
      : t("messages.authoring.saveSession");
  exportCardsBtn.textContent = t("messages.authoring.export");
}

function renderAuthoringMode() {
  if (capabilities.persistentSave) {
    authorModeEl.classList.add("persistent");
    setAuthoringFeedback(t("messages.authoring.modePersistent"), false);
  } else {
    authorModeEl.classList.remove("persistent");
    setAuthoringFeedback(t("messages.authoring.modeSession"), false);
  }
  setAuthoringBusy(false);
}

function fillCategorySelect() {
  addCardCatEl.innerHTML = "";
  allCats.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = getCategoryLabel(cat);
    addCardCatEl.appendChild(option);
  });
}

function buildCatPanel() {
  const container = document.getElementById("catButtons");
  container.innerHTML = "";

  const mixBtn = document.createElement("button");
  mixBtn.className = `cat-btn mixed${selectedCats === null ? " active" : ""}`;
  if (selectedCats === null) {
    mixBtn.style.background = "#e8ff47";
  }
  mixBtn.textContent = t("messages.categories.mixed");
  mixBtn.onclick = () => {
    selectedCats = null;
    buildCatPanel();
  };
  container.appendChild(mixBtn);

  allCats.forEach((cat) => {
    const color = catColors[cat];
    const isActive = selectedCats !== null && selectedCats.has(cat);
    const btn = document.createElement("button");
    btn.className = `cat-btn${isActive ? " active" : ""}`;
    btn.textContent = getCategoryLabel(cat);
    btn.style.borderColor = `${color}55`;
    btn.style.color = isActive ? "#000" : color;
    if (isActive) {
      btn.style.background = color;
    }
    btn.onclick = () => {
      if (selectedCats === null) {
        selectedCats = new Set();
      }

      if (selectedCats.has(cat)) {
        selectedCats.delete(cat);
        if (selectedCats.size === 0) {
          selectedCats = null;
        }
      } else {
        selectedCats.add(cat);
      }

      buildCatPanel();
    };
    container.appendChild(btn);
  });

  const pool = getPool();
  catCountEl.textContent = t("messages.categories.available", {
    count: pool.length,
    unit: t("messages.categories.unit"),
  });
  newGameBtn.disabled = pool.length === 0;
}

function getPool() {
  if (selectedCats === null) {
    return allCards;
  }
  return allCards.filter((card) => selectedCats.has(card.cat));
}

function updateSearchLinks(card) {
  searchLinksEl.innerHTML = "";
  const query = String(card.de || card.en || "").trim();

  searchSites.forEach((site) => {
    const link = document.createElement("a");
    link.className = "search-link";
    link.href = site.url(query);
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = `<span class="search-link-icon">${site.icon}</span><span>${site.name}</span>`;
    searchLinksEl.appendChild(link);
  });
}

const FACT_LANGUAGE_MAP = {
  Deutsch: { de: "Deutsch", hr: "njemački", en: "German" },
  Englisch: { de: "Englisch", hr: "engleski", en: "English" },
  Kroatisch: { de: "Kroatisch", hr: "hrvatski", en: "Croatian" },
  Französisch: { de: "Französisch", hr: "francuski", en: "French" },
  Spanisch: { de: "Spanisch", hr: "španjolski", en: "Spanish" },
  Katalanisch: { de: "Katalanisch", hr: "katalonski", en: "Catalan" },
  Baskisch: { de: "Baskisch", hr: "baskijski", en: "Basque" },
  Galicisch: { de: "Galicisch", hr: "galicijski", en: "Galician" },
  Schwedisch: { de: "Schwedisch", hr: "švedski", en: "Swedish" },
  Polnisch: { de: "Polnisch", hr: "poljski", en: "Polish" },
  Ungarisch: { de: "Ungarisch", hr: "mađarski", en: "Hungarian" },
};

function getFactsBundle() {
  return getLocaleBundle()?.facts || getLocaleBundle("de")?.facts || {};
}

function getLocalizedCountryNameById(id, fallback = "") {
  return getFactsBundle().names?.countries?.[id] || fallback;
}

function translateCountryOrRegionName(value) {
  const factsBundle = getFactsBundle();
  if (value === "Deutschland") {
    return factsBundle.names?.germany || value;
  }
  if (value === "Europa") {
    return factsBundle.names?.europe || value;
  }
  const countryEntries = Object.entries(getLocaleBundle("de")?.facts?.names?.countries || {});
  for (const [id, name] of countryEntries) {
    if (name === value) {
      return getLocalizedCountryNameById(id, value);
    }
  }
  return factsBundle.regions?.[value] || value;
}

function translateFactScalar(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  const factsBundle = getFactsBundle();
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed === "Ja") {
    return factsBundle.values?.yes || trimmed;
  }
  if (trimmed === "Nein") {
    return factsBundle.values?.no || trimmed;
  }

  if (factsBundle.stateTypes?.[trimmed]) {
    return factsBundle.stateTypes[trimmed];
  }
  if (factsBundle.stateForms?.[trimmed]) {
    return factsBundle.stateForms[trimmed];
  }
  if (factsBundle.regions?.[trimmed]) {
    return factsBundle.regions[trimmed];
  }
  if (FACT_LANGUAGE_MAP[trimmed]) {
    return FACT_LANGUAGE_MAP[trimmed][getLocale()] || FACT_LANGUAGE_MAP[trimmed].de;
  }
  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((part) => translateFactScalar(part.trim()))
      .join(", ");
  }
  return translateCountryOrRegionName(trimmed);
}

function translateFactList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((value) => translateFactScalar(value));
}

function buildGermanyOverview(countryData) {
  return t("facts.values.germanyOverviewText", {
    statesCount: countryData.states_count,
    neighbors: joinLocalizedList(translateFactList(countryData.neighboring_countries)),
  });
}

function buildEuropeOverview(unionData) {
  return t("facts.values.europeOverviewText", {
    capital: unionData.capital,
    institutions: joinLocalizedList(translateFactList(unionData.institutions)),
  });
}

function buildStateLocationSummary(stateData) {
  return t("facts.values.stateLocationText", {
    name: stateData.name,
    region: translateFactScalar(stateData.region),
    capital: stateData.capital,
  });
}

function buildStateProfileSummary(stateData) {
  return t("facts.values.stateProfileText", {
    name: stateData.name,
    knownFor: joinLocalizedList(translateFactList(stateData.known_for)),
  });
}

function buildCountryOverview(countryData) {
  return t("facts.values.countryOverviewText", {
    name: getLocalizedCountryNameById(countryData.id, countryData.name),
    region: translateFactScalar(countryData.region),
    capital: countryData.capital,
    neighbors: joinLocalizedList(translateFactList(countryData.neighboring_countries)),
  });
}

function isNonEmptyValue(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

function normalizeFactsCollection(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const country = raw.country && typeof raw.country === "object" ? raw.country : null;
  const states = Array.isArray(raw.states) ? raw.states.filter((state) => state && typeof state === "object") : [];

  if (!country || !isNonEmptyValue(country.name) || states.length === 0) {
    return null;
  }

  const validStates = states.filter((state) => isNonEmptyValue(state.id) && isNonEmptyValue(state.name));
  if (!validStates.length) {
    return null;
  }

  return {
    country,
    states: validStates,
  };
}

async function loadGermanyFacts() {
  const raw = await fetchJson("germany-facts.json", null);
  return normalizeFactsCollection(raw);
}

function normalizeEuropeFacts(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const union = raw.union && typeof raw.union === "object" ? raw.union : null;
  const countries = Array.isArray(raw.countries)
    ? raw.countries.filter((country) => country && typeof country === "object")
    : [];

  if (!union || !isNonEmptyValue(union.name) || !countries.length) {
    return null;
  }

  const validCountries = countries.filter((country) => isNonEmptyValue(country.id) && isNonEmptyValue(country.name));
  if (!validCountries.length) {
    return null;
  }

  return {
    union,
    countries: validCountries,
  };
}

async function loadEuropeFacts() {
  const raw = await fetchJson("europe-facts.json", null);
  return normalizeEuropeFacts(raw);
}

function getFactsImagePath(type, stateId) {
  if (type === "country") {
    return "https://flagcdn.com/de.svg";
  }

  if (type === "state" && isNonEmptyValue(stateId)) {
    return `${FACTS_IMAGE_ROOT}/states/${stateId}.webp`;
  }

  return "";
}

function normalizeFactsField(field) {
  if (Array.isArray(field)) {
    return {
      label: field[0],
      value: field[1],
      featured: false,
    };
  }

  if (field && typeof field === "object") {
    return {
      label: field.label,
      value: field.value,
      featured: Boolean(field.featured),
    };
  }

  return null;
}

function createFactsField(field) {
  const normalized = normalizeFactsField(field);
  if (!normalized) {
    return null;
  }

  const { label, value, featured } = normalized;
  if (!isNonEmptyValue(value)) {
    return null;
  }

  const card = document.createElement("div");
  card.className = "facts-card";
  if (featured) {
    card.classList.add("featured");
  }

  const cardLabel = document.createElement("div");
  cardLabel.className = "facts-card-label";
  cardLabel.textContent = label;

  const cardValue = document.createElement("div");
  cardValue.className = "facts-card-value";
  cardValue.textContent = String(value);

  card.appendChild(cardLabel);
  card.appendChild(cardValue);
  return card;
}

function createFactsList(label, items) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  const section = document.createElement("section");
  section.className = "facts-list-section";

  const title = document.createElement("div");
  title.className = "facts-list-title";
  title.textContent = label;

  const list = document.createElement("div");
  list.className = "facts-chip-list";

  items
    .filter((item) => isNonEmptyValue(item))
    .forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "facts-chip";
      chip.textContent = String(item);
      list.appendChild(chip);
    });

  if (!list.children.length) {
    return null;
  }

  section.appendChild(title);
  section.appendChild(list);
  return section;
}

function getStatePeopleLists(stateId) {
  const notablePeople = STATE_NOTABLE_PEOPLE[stateId] || {};
  return [
    [t("facts.lists.science"), notablePeople.science],
    [t("facts.lists.politics"), notablePeople.politics],
    [t("facts.lists.art"), notablePeople.art],
  ];
}

function renderFactsView(title, subtitle, imageSrc, fields, lists, tourismUrl = "", officialUrl = "") {
  factsContentEl.innerHTML = "";

  const view = document.createElement("div");
  view.className = "facts-view";

  const head = document.createElement("div");
  head.className = "facts-view-head";

  const titleRow = document.createElement("div");
  titleRow.className = "facts-title-row";

  const flagWrap = document.createElement("div");
  flagWrap.className = "facts-flag-wrap";

  const flagEl = document.createElement("img");
  flagEl.className = "facts-flag";
  flagEl.alt = `${title} flag`;
  flagEl.loading = "lazy";
  flagEl.decoding = "async";
  flagEl.addEventListener("error", () => {
    flagWrap.classList.add("is-fallback");
    flagEl.hidden = true;
  });

  if (isNonEmptyValue(imageSrc)) {
    flagEl.src = imageSrc;
  } else {
    flagWrap.classList.add("is-fallback");
    flagEl.hidden = true;
  }

  flagWrap.appendChild(flagEl);
  titleRow.appendChild(flagWrap);

  const titleCopy = document.createElement("div");
  titleCopy.className = "facts-title-copy";

  const titleBar = document.createElement("div");
  titleBar.className = "facts-title-bar";

  const nameEl = document.createElement("div");
  nameEl.className = "facts-view-name";
  nameEl.textContent = title;
  titleBar.appendChild(nameEl);

  if (isNonEmptyValue(tourismUrl) || isNonEmptyValue(officialUrl)) {
    const linksEl = document.createElement("div");
    linksEl.className = "facts-title-links";

    if (isNonEmptyValue(tourismUrl)) {
      const tourismEl = document.createElement("a");
      tourismEl.className = "facts-title-link";
      tourismEl.href = tourismUrl;
      tourismEl.target = "_blank";
      tourismEl.rel = "noopener noreferrer";
      tourismEl.textContent = t("facts.links.tourism");
      tourismEl.setAttribute("aria-label", t("facts.values.tourismAria", { name: title }));
      linksEl.appendChild(tourismEl);
    }

    if (isNonEmptyValue(officialUrl)) {
      const officialEl = document.createElement("a");
      officialEl.className = "facts-title-link";
      officialEl.href = officialUrl;
      officialEl.target = "_blank";
      officialEl.rel = "noopener noreferrer";
      officialEl.textContent = t("facts.links.official");
      officialEl.setAttribute("aria-label", t("facts.values.officialSiteAria", { name: title }));
      linksEl.appendChild(officialEl);
    }

    titleBar.appendChild(linksEl);
  }

  titleCopy.appendChild(titleBar);

  if (isNonEmptyValue(subtitle)) {
    const subtitleEl = document.createElement("div");
    subtitleEl.className = "facts-view-subtitle";
    subtitleEl.textContent = String(subtitle);
    titleCopy.appendChild(subtitleEl);
  }

  titleRow.appendChild(titleCopy);
  head.appendChild(titleRow);
  view.appendChild(head);

  const grid = document.createElement("div");
  grid.className = "facts-grid";
  fields.forEach((fieldData) => {
    const field = createFactsField(fieldData);
    if (field) {
      grid.appendChild(field);
    }
  });

  if (grid.children.length) {
    view.appendChild(grid);
  }

  lists.forEach(([label, values]) => {
    const list = createFactsList(label, values);
    if (list) {
      view.appendChild(list);
    }
  });

  factsContentEl.appendChild(view);
}

function renderCountryFacts(countryData) {
  renderFactsView(
      t("facts.names.germany"),
      translateFactScalar(countryData.official_name || ""),
      getFactsImagePath("country"),
    [
      [t("facts.fields.capital"), countryData.capital],
      [t("facts.fields.largestCity"), countryData.largest_city],
      [t("facts.fields.anthem"), countryData.anthem],
      [t("facts.fields.founded"), countryData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(countryData.state_form)],
      [t("facts.fields.nationalDay"), countryData.national_day],
      [t("facts.fields.population"), countryData.population],
      [t("facts.fields.area"), countryData.area_km2],
      [t("facts.fields.statesCount"), countryData.states_count],
      [t("facts.fields.currency"), translateFactScalar(countryData.currency)],
      [t("facts.fields.language"), translateFactScalar(countryData.language)],
      [t("facts.fields.timeZone"), countryData.time_zone],
      [t("facts.fields.callingCode"), countryData.calling_code],
      [t("facts.fields.internetTld"), countryData.internet_tld],
      [t("facts.fields.bordersCount"), countryData.bordering_countries_count],
      [t("facts.fields.gdp"), countryData.gdp_nominal],
      [t("facts.fields.euSince"), countryData.eu_member_since],
      {
        label: t("facts.featured.germanyOverview"),
        value: buildGermanyOverview(countryData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries)],
      [t("facts.lists.highlights"), translateFactList(countryData.highlights)],
      [t("facts.lists.nature"), translateFactList(countryData.nature)],
      ],
      TOURISM_LINKS.germany,
      OFFICIAL_LINKS.germany
    );
  }

function renderEuropeOverview(unionData) {
  renderFactsView(
      t("facts.names.europe"),
      translateFactScalar(unionData.official_name || ""),
      EUROPE_FLAG_IMAGE,
    [
      [t("facts.fields.capital"), unionData.capital],
      [t("facts.fields.largestCity"), unionData.largest_city],
      [t("facts.fields.anthem"), unionData.anthem],
      [t("facts.fields.founded"), unionData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(unionData.state_form)],
      [t("facts.fields.nationalDay"), unionData.national_day],
      [t("facts.fields.population"), unionData.population],
      [t("facts.fields.area"), unionData.area_km2],
      [t("facts.fields.statesCount"), unionData.states_count],
      [t("facts.fields.currency"), translateFactScalar(unionData.currency)],
      [t("facts.fields.language"), translateFactScalar(unionData.language)],
      [t("facts.fields.timeZone"), unionData.time_zone],
      [t("facts.fields.internetTld"), unionData.internet_tld],
      [t("facts.fields.gdp"), unionData.gdp_nominal],
      {
        label: t("facts.featured.europeOverview"),
        value: buildEuropeOverview(unionData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.institutions"), translateFactList(unionData.institutions)],
      [t("facts.lists.highlights"), translateFactList(unionData.highlights)],
      [t("facts.lists.nature"), translateFactList(unionData.nature)],
      [t("facts.lists.seas"), translateFactList(unionData.neighboring_countries)],
      ]
    );
  }

function renderStateFacts(stateData) {
  renderFactsView(
      stateData.name || "Bundesland",
      "",
      getFactsImagePath("state", stateData.id),
    [
      [t("facts.fields.abbreviation"), stateData.abbreviation],
      [t("facts.fields.stateType"), translateFactScalar(stateData.state_type)],
      [t("facts.fields.region"), translateFactScalar(stateData.region)],
      [t("facts.fields.capital"), stateData.capital],
      [t("facts.fields.largestCity"), stateData.largest_city],
      [t("facts.fields.population"), stateData.population],
      [t("facts.fields.area"), stateData.area_km2],
      [t("facts.fields.joined"), stateData.joined_or_founded],
      [t("facts.fields.headOfGovernment"), stateData.minister_president || stateData.state_head],
      {
        label: t("facts.featured.location"),
        value: buildStateLocationSummary(stateData),
        featured: true,
      },
      {
        label: t("facts.featured.profile"),
        value: buildStateProfileSummary(stateData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighborStates"), translateFactList(stateData.neighboring_states)],
      [t("facts.lists.borders"), translateFactList(stateData.bordering_countries)],
      [t("facts.lists.knownFor"), translateFactList(stateData.known_for)],
      [t("facts.lists.nature"), translateFactList(stateData.nature)],
      ...getStatePeopleLists(stateData.id),
      ],
      TOURISM_LINKS.states[stateData.id] || "",
      OFFICIAL_LINKS.states[stateData.id] || ""
    );
  }

function renderEuropeanCountryFacts(countryData) {
  renderFactsView(
      getLocalizedCountryNameById(countryData.id, countryData.name || "Land"),
      translateFactScalar(countryData.official_name || ""),
      countryData.flag_image || "",
    [
      [t("facts.fields.capital"), countryData.capital],
      [t("facts.fields.region"), translateFactScalar(countryData.region)],
      [t("facts.fields.stateForm"), translateFactScalar(countryData.state_form)],
      [t("facts.fields.population"), countryData.population],
      [t("facts.fields.area"), countryData.area_km2],
      [t("facts.fields.currency"), translateFactScalar(countryData.currency)],
      [t("facts.fields.language"), translateFactScalar(countryData.language)],
      [t("facts.fields.timeZone"), countryData.time_zone],
      [t("facts.fields.callingCode"), countryData.calling_code],
      [t("facts.fields.internetTld"), countryData.internet_tld],
      [t("facts.fields.landlocked"), translateFactScalar(countryData.landlocked)],
      {
        label: t("facts.featured.profile"),
        value: buildCountryOverview(countryData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries)],
      [t("facts.lists.languages"), translateFactList(countryData.languages_list)],
      [t("facts.lists.timezones"), countryData.timezones_list],
      ],
      TOURISM_LINKS.countries[countryData.id] || "",
      OFFICIAL_LINKS.countries[countryData.id] || ""
    );
  }

function renderFactsError() {
  factsContentEl.innerHTML = "";
  const error = document.createElement("div");
  error.className = "facts-error";
  error.textContent = t("facts.errors.loadFailed");
  factsContentEl.appendChild(error);
}

function updateFactsModeButtons() {
  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const isEuropeMode = factsMode === "europe" || factsMode === "europe-country";
  factsCountryBtn.classList.toggle("active", isGermanyMode);
  factsStatesBtn.classList.toggle("active", isEuropeMode);
}

function updateStatePickerVisibility() {
  const showGermanyPicker = (factsMode === "germany" || factsMode === "state") && Boolean(germanyFacts);
  const showEuropePicker = (factsMode === "europe" || factsMode === "europe-country") && Boolean(europeFacts);
  statePickerWrap.classList.toggle("is-open", showGermanyPicker || showEuropePicker);
}

function buildFactsPicker() {
  statePickerEl.innerHTML = "";

  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const items = isGermanyMode
    ? (germanyFacts?.states || []).map((state) => ({
        id: state.id,
        label: state.name,
        active: state.id === selectedStateId,
        ariaLabel: t("facts.picker.stateButton", { name: state.name }),
        onClick: () => {
          factsMode = "state";
          selectedStateId = state.id;
          renderFactsSelection();
        },
      }))
    : (europeFacts?.countries || []).map((country) => ({
        id: country.id,
        label: getLocalizedCountryNameById(country.id, country.name),
        active: country.id === selectedEuropeCountryId,
        ariaLabel: t("facts.picker.countryButton", {
          name: getLocalizedCountryNameById(country.id, country.name),
        }),
        onClick: () => {
          factsMode = "europe-country";
          selectedEuropeCountryId = country.id;
          renderFactsSelection();
        },
      }));

  statePickerEl.setAttribute(
    "aria-label",
    isGermanyMode ? t("facts.picker.statesAria") : t("facts.picker.countriesAria")
  );

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "state-picker-btn";
    button.textContent = item.label;
    button.classList.toggle("active", item.active);
    button.setAttribute("aria-pressed", String(item.active));
    button.setAttribute("aria-label", item.ariaLabel);
    button.addEventListener("click", item.onClick);
    statePickerEl.appendChild(button);
  });
}

function renderFactsSelection() {
  const isGermanyMode = factsMode === "germany" || factsMode === "state";

  if (isGermanyMode) {
    if (!germanyFacts) {
      renderFactsError();
      return;
    }

    const activeState = germanyFacts.states.find((state) => state.id === selectedStateId) || null;
    if (factsMode === "state" && activeState) {
      renderStateFacts(activeState);
    } else {
      renderCountryFacts(germanyFacts.country);
    }
  } else {
    if (!europeFacts) {
      renderFactsError();
      return;
    }

    const activeCountry = europeFacts.countries.find((country) => country.id === selectedEuropeCountryId) || null;
    if (factsMode === "europe-country" && activeCountry) {
      renderEuropeanCountryFacts(activeCountry);
    } else {
      renderEuropeOverview(europeFacts.union);
    }
  }

  updateFactsModeButtons();
  buildFactsPicker();
  updateStatePickerVisibility();
}

function initFactsPanel() {
  updateFactsModeButtons();
  updateStatePickerVisibility();

  factsCountryBtn.addEventListener("click", () => {
    factsMode = "germany";
    selectedStateId = null;
    renderFactsSelection();
  });

  factsStatesBtn.addEventListener("click", () => {
    if (!europeFacts || !europeFacts.countries.length) {
      renderFactsError();
      return;
    }

    factsMode = "europe";
    selectedEuropeCountryId = null;
    renderFactsSelection();
  });

  if (!germanyFacts && !europeFacts) {
    factsCountryBtn.disabled = true;
    factsStatesBtn.disabled = true;
    renderFactsError();
    return;
  }

  if (!germanyFacts && europeFacts) {
    factsMode = "europe";
  }

  if (germanyFacts && !europeFacts) {
    factsStatesBtn.disabled = true;
  }

  renderFactsSelection();
}

function getCorrectPrefixLength(target, typed) {
  let index = 0;
  while (
    index < typed.length &&
    index < target.length &&
    typed[index].toLowerCase() === target[index].toLowerCase()
  ) {
    index += 1;
  }
  return index;
}

function getCharMeta(target) {
  const hints = new Set();
  const autofill = new Set();
  const hintCountPerWord =
    difficulty === "easy" ? 3 :
    difficulty === "medium" ? 1 :
    0;
  let pos = 0;

  target.split(" ").forEach((word) => {
    if (!word.length) {
      pos += 1;
      return;
    }

    for (let i = 0; i < hintCountPerWord && i < word.length; i += 1) {
      hints.add(pos + i);
    }

    let tail = word.length - 1;
    while (tail > 0 && PUNCT.test(word[tail])) {
      autofill.add(pos + tail);
      tail -= 1;
    }

    pos += word.length + 1;
  });

  return { hints, autofill };
}

function initDifficultyControls() {
  document.querySelectorAll(".difficulty-panel button").forEach((btn) => {
    btn.addEventListener("click", () => {
      difficulty = btn.dataset.diff;

      document.querySelectorAll(".difficulty-panel button").forEach((button) => {
        button.classList.remove("active");
      });

      btn.classList.add("active");

      if (sessionCards.length) {
        buildWordGrid(getTargetValue(sessionCards[sessionIndex]), inputEl.value);
      }
    });
  });
}

function getFreshCorrectIndexes(target, previousTyped, currentTyped) {
  const freshIndexes = new Set();
  const maxLen = Math.max(previousTyped.length, currentTyped.length);

  for (let idx = 0; idx < maxLen; idx += 1) {
    const prevChar = previousTyped[idx];
    const currentChar = currentTyped[idx];
    const targetChar = target[idx];

    if (currentChar === undefined || targetChar === undefined) {
      continue;
    }

    const wasCorrect = prevChar !== undefined && prevChar.toLowerCase() === targetChar.toLowerCase();
    const isCorrect = currentChar.toLowerCase() === targetChar.toLowerCase();

    if (!wasCorrect && isCorrect) {
      freshIndexes.add(idx);
    }
  }

  return freshIndexes;
}

function getGuideProgress(target, typed) {
  const correctPrefixLen = getCorrectPrefixLength(target, typed);
  const words = target.split(" ");
  const totalWords = words.length;
  const hasExtraChars = typed.length > target.length && correctPrefixLen >= target.length;
  const hasWrongChar = typed.length > correctPrefixLen && !hasExtraChars;

  if (hasExtraChars) {
    return {
      state: "error",
      statusText: t("messages.guide.statusTooLong"),
      noteText: t("messages.guide.noteTooLong")
    };
  }

  if (hasWrongChar) {
    let currentWord = 1;
    let charInWord = 1;

    for (let i = 0; i < correctPrefixLen; i += 1) {
      if (target[i] === " ") {
        currentWord += 1;
        charInWord = 1;
      } else {
        charInWord += 1;
      }
    }

    return {
      state: "error",
      statusText: t("messages.guide.statusWrong", {
        word: currentWord,
        total: totalWords,
        char: charInWord,
      }),
      noteText: t("messages.guide.noteWrong")
    };
  }

  if (correctPrefixLen >= target.length) {
    return {
      state: "success",
      statusText: t("messages.guide.statusDone", { total: totalWords }),
      noteText: ""
    };
  }

  let currentWord = 1;
  let charInWord = 1;

  for (let i = 0; i < correctPrefixLen; i += 1) {
    if (target[i] === " ") {
      currentWord += 1;
      charInWord = 1;
    } else {
      charInWord += 1;
    }
  }

  const nextChar = target[correctPrefixLen];

  if (nextChar === " ") {
    return {
      state: "progress",
      statusText: t("messages.guide.statusSpace", {
        word: currentWord,
        total: totalWords,
      }),
      noteText: ""
    };
  }

  return {
    state: "progress",
    statusText: t("messages.guide.statusProgress", {
      word: currentWord,
      total: totalWords,
      char: charInWord,
      length: words[currentWord - 1].length,
    }),
    noteText: ""
  };
}

function updateAnswerGuide(target, typed) {
  if (!answerGuideEl || !answerGuideStatusEl || !answerGuideNoteEl) {
    return;
  }

  if (!target) {
    answerGuideEl.classList.remove("is-success", "is-error");
    answerGuideStatusEl.classList.remove("is-success", "is-error");
    answerGuideStatusEl.textContent = "";
    answerGuideNoteEl.textContent = "";
    return;
  }

  const { state, statusText, noteText } = getGuideProgress(target, typed);
  answerGuideEl.classList.toggle("is-success", state === "success");
  answerGuideEl.classList.toggle("is-error", state === "error");
  answerGuideStatusEl.classList.toggle("is-success", state === "success");
  answerGuideStatusEl.classList.toggle("is-error", state === "error");
  answerGuideStatusEl.textContent = statusText;
  answerGuideNoteEl.textContent = noteText;
}

function isExactTypedMatch(target, typed) {
  return typed.length === target.length && getCorrectPrefixLength(target, typed) === target.length;
}

function showFeedbackBurst(kind, isBig = false) {
  if (!feedbackBurstEl) {
    return;
  }

  clearTimeout(feedbackBurstTimer);
  feedbackBurstEl.innerHTML = "";
  feedbackBurstEl.className = `feedback-burst is-${kind}${isBig ? " is-big" : ""}`;

  const pieces = kind === "success"
    ? (isBig
      ? ["🎉", "✨", "⭐", "💥", "🎊", "✨", "⭐", "🎉", "💫", "✨"]
      : ["✨", "⭐", "💫", "✨", "⭐", "✨"])
    : ["✖", "⚡", "✕", "⚠", "✖", "⚡"];
  const spread = isBig ? 92 : 58;
  const verticalLift = kind === "success" ? (isBig ? -96 : -62) : 54;

  pieces.forEach((symbol, index) => {
    const piece = document.createElement("span");
    const angle = (-90 + (180 / Math.max(pieces.length - 1, 1)) * index) * (Math.PI / 180);
    const distance = spread * (0.7 + (index % 3) * 0.16);
    const dx = Math.round(Math.cos(angle) * distance);
    const dy = Math.round(Math.sin(angle) * distance + verticalLift);

    piece.className = "burst-piece";
    piece.textContent = symbol;
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    piece.style.setProperty("--rot", `${getSecureRandomRange(-30, 30)}deg`);
    piece.style.animationDelay = `${index * 18}ms`;
    feedbackBurstEl.appendChild(piece);
  });

  feedbackBurstTimer = setTimeout(() => {
    feedbackBurstEl.innerHTML = "";
    feedbackBurstEl.className = "feedback-burst";
  }, isBig ? 980 : 760);
}

function buildWordGrid(target, typed, freshCorrectIndexes = new Set()) {
  wordGrid.innerHTML = "";
  const { hints, autofill } = getCharMeta(target);
  const correctPrefixLen = getCorrectPrefixLength(target, typed);
  const words = target.split(" ");
  let pos = 0;

  words.forEach((word, wordIndex) => {
    const group = document.createElement("div");
    group.className = "word-group";

    for (let charIndex = 0; charIndex < word.length; charIndex += 1) {
      const idx = pos + charIndex;
      const targetChar = target[idx];
      const typedChar = typed[idx];
      const wrap = document.createElement("div");
      const letter = document.createElement("div");
      const line = document.createElement("div");

      wrap.className = "wchar";
      letter.className = "wchar-letter";
      line.className = "wchar-line";

      if (autofill.has(idx)) {
        letter.textContent = targetChar;
        wrap.classList.add("state-auto");
      } else if (typedChar !== undefined) {
        letter.textContent = targetChar;
        wrap.classList.add(
          typedChar.toLowerCase() === targetChar.toLowerCase() ? "state-ok" : "state-bad"
        );
        if (freshCorrectIndexes.has(idx)) {
          wrap.classList.add("state-hit");
        }
      } else if (difficulty === "easy" && idx >= correctPrefixLen && idx < correctPrefixLen + 3) {
        letter.textContent = targetChar;
        wrap.classList.add("state-hint");
      } else if (hints.has(idx)) {
        letter.textContent = targetChar;
        wrap.classList.add("state-hint");
      } else if (difficulty !== "hard" && idx === correctPrefixLen) {
        letter.textContent = targetChar;
        wrap.classList.add("state-next");
      } else {
        letter.textContent = "_";
        wrap.classList.add("state-hidden");
      }

      wrap.appendChild(letter);
      wrap.appendChild(line);
      group.appendChild(wrap);
    }

    pos += word.length + 1;
    wordGrid.appendChild(group);

    if (wordIndex < words.length - 1) {
      const separator = document.createElement("div");
      const separatorIndex = pos - 1;
      const typedSeparator = typed[separatorIndex];

      separator.className = "word-separator";
      separator.textContent = t("messages.guide.separator");

      if (typedSeparator !== undefined) {
        separator.classList.add(typedSeparator === " " ? "state-ok" : "state-bad");
      } else if (separatorIndex === correctPrefixLen) {
        separator.classList.add("state-next");
      }

      wordGrid.appendChild(separator);
    }
  });

  if (typed.length > target.length) {
    typed.slice(target.length).split("").forEach((extraChar) => {
      if (extraChar === " ") {
        const extraSeparator = document.createElement("div");
        extraSeparator.className = "word-separator state-bad is-overflow";
        extraSeparator.textContent = t("messages.guide.extraSeparator");
        wordGrid.appendChild(extraSeparator);
        return;
      }

      const overflowWrap = document.createElement("div");
      const overflowLetter = document.createElement("div");
      const overflowLine = document.createElement("div");

      overflowWrap.className = "wchar state-bad";
      overflowLetter.className = "wchar-letter";
      overflowLine.className = "wchar-line";
      overflowLetter.textContent = extraChar;
      overflowWrap.appendChild(overflowLetter);
      overflowWrap.appendChild(overflowLine);
      wordGrid.appendChild(overflowWrap);
    });
  }

  updateAnswerGuide(target, typed);
}

function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startSession(size) {
  const pool = getPool();
  if (!pool.length) {
    return;
  }

  const count = Math.min(size || SESSION_SIZE, pool.length);
  sessionCards = shuffle(pool).slice(0, count);
  sessionIndex = 0;
  streak = 0;
  bestStreak = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  totalCharsTyped = 0;
  sessionStart = Date.now();
  updateStats();
  gameArea.style.display = "block";
  sessionEndEl.style.display = "none";
  loadCard();
  mainCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function loadCard() {
  const card = sessionCards[sessionIndex];
  if (!card) {
    return;
  }

  renderPrompt(card);
  inputEl.value = "";
  inputEl.className = "";
  previousTypedValue = "";
  solutionEl.style.display = "none";
  forceCorrection = false;
  hintCount = 0;
  progFill.style.width = `${(sessionIndex / sessionCards.length) * 100}%`;

  const color = catColors[card.cat] || "#888";
  categoryEl.textContent = getCategoryLabel(card.cat);
  categoryEl.style.color = color;
  categoryEl.style.borderColor = `${color}55`;
  categoryEl.style.background = `${color}14`;

  mainCard.classList.add("active");
  buildWordGrid(getTargetValue(card), "");
  updateSearchLinks(card);
  inputEl.focus();
}

function updateStats() {
  const streakEl = document.getElementById("streakNum");
  const correctEl = document.getElementById("correctVal");
  const remainingEl = document.getElementById("remainingVal");
  const accuracyEl = document.getElementById("accuracyVal");
  const wpmEl = document.getElementById("wpmVal");

  if (streakEl) {
    streakEl.textContent = streak;
  }
  if (correctEl) {
    correctEl.textContent = totalCorrect;
  }
  if (remainingEl) {
    remainingEl.textContent = sessionCards.length
      ? String(sessionCards.length - sessionIndex)
      : "—";
  }

  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : null;
  if (accuracyEl) {
    accuracyEl.textContent = accuracy !== null ? `${accuracy}%` : "—";
  }

  const minutes = (Date.now() - sessionStart) / 60000;
  const wpm = minutes > 0 && totalCharsTyped > 0
    ? Math.round((totalCharsTyped / 5) / minutes)
    : null;
  if (wpmEl) {
    wpmEl.textContent = wpm || "—";
  }
}

function showCombo() {
  if (streak < 3) {
    return;
  }

  comboPop.textContent = t(`combo.${Math.min(streak, 8)}`) || `x${streak}`;
  comboPop.classList.remove("animate");
  void comboPop.offsetWidth;
  comboPop.classList.add("animate");
}

let toastTimer;
function showToast(message) {
  if (!message) {
    return;
  }

  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

function isStandaloneMode() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function detectInstallGuideContext() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isDesktop = !isMobile;
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isEdgeAndroid = /EdgA/i.test(ua);
  const isEdgeIOS = /EdgiOS/i.test(ua);
  const isEdgeDesktop = /Edg/i.test(ua) && !isEdgeAndroid && !isEdgeIOS;
  const isEdge = isEdgeAndroid || isEdgeIOS || isEdgeDesktop;
  const isOperaTouch = /OPT/i.test(ua);
  const isOpera = /OPR|Opera/i.test(ua) || isOperaTouch;
  const isChromeIOS = /CriOS/i.test(ua);
  const isChromeDesktopOrAndroid = /Chrome/i.test(ua) && !isSamsung && !isFirefox && !isEdge && !isOpera;
  const isChrome = isChromeIOS || isChromeDesktopOrAndroid;
  const isSafari = /Safari/i.test(ua) && !isChrome && !isFirefox && !isEdge && !isOpera && !isSamsung;
  const isFirefoxIOS = /FxiOS/i.test(ua);
  const isFirefoxDesktop = isFirefox && !isMobile;
  const isFirefoxMobile = isFirefox && isMobile;

  let browserLabel = t("installGuide.fallbackBrowser");
  let installPathKey = "default";

  if (isIOS && isSafari) {
    browserLabel = "Safari";
    installPathKey = "iosShare";
  } else if (isEdgeIOS) {
    browserLabel = "Edge iPhone";
    installPathKey = "iosShare";
  } else if (isIOS && isChromeIOS) {
    browserLabel = "Chrome iOS";
    installPathKey = "iosShare";
  } else if (isFirefoxIOS) {
    browserLabel = "Firefox iPhone";
    installPathKey = "iosShare";
  } else if (isAndroid && isSamsung) {
    browserLabel = "Samsung";
    installPathKey = "samsung";
  } else if (isEdgeAndroid) {
    browserLabel = "Edge Android";
    installPathKey = "edgeAndroid";
  } else if (isAndroid && isOperaTouch) {
    browserLabel = "Opera Touch";
    installPathKey = "opera";
  } else if (isAndroid && isOpera) {
    browserLabel = "Opera";
    installPathKey = "opera";
  } else if (isFirefoxMobile) {
    browserLabel = "Firefox";
    installPathKey = "firefoxMobile";
  } else if (isAndroid && isChromeDesktopOrAndroid) {
    browserLabel = "Chrome";
    installPathKey = "chromeAndroid";
  } else if (isEdgeDesktop) {
    browserLabel = "Edge";
    installPathKey = "edgeDesktop";
  } else if (isDesktop && isOpera) {
    browserLabel = "Opera";
    installPathKey = "default";
  } else if (isDesktop && isChromeDesktopOrAndroid) {
    browserLabel = "Chrome";
    installPathKey = "chromeDesktop";
  } else if (isFirefoxDesktop) {
    browserLabel = "Firefox";
    installPathKey = "firefoxDesktop";
  } else if (isDesktop) {
    browserLabel = t("installGuide.fallbackDesktop");
  } else if (isMobile) {
    browserLabel = t("installGuide.fallbackMobile");
  }

  return { isMobile, isDesktop, browserLabel, installPathKey };
}

function renderInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !installGuideBrowserEl || !installGuideStepsEl) {
    return;
  }

  const context = detectInstallGuideContext();
  const localizedPath = t(`installGuide.paths.${context.installPathKey}`);
  const resolvedPath = localizedPath === `installGuide.paths.${context.installPathKey}`
    ? t("installGuide.paths.default")
    : localizedPath;
  installGuideBrowserEl.textContent = `${context.browserLabel}: ${resolvedPath}`;
  installGuideStepsEl.textContent = t("installGuide.cta");
}

function hideInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl) {
    return;
  }

  installGuidePanelEl.classList.add("is-hidden");
  installGuideBrowserPanelEl.classList.add("is-hidden");
}

function maybeShowInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  renderInstallGuide();
  installGuidePanelEl.classList.remove("is-hidden");
  installGuideBrowserPanelEl.classList.remove("is-hidden");
}

function initInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl) {
    return;
  }

  window.addEventListener("appinstalled", () => {
    hideInstallGuide();
    showToast(t("messages.toasts.install"));
  });

  maybeShowInstallGuide();
}

function getEncouragement(currentStreak) {
  const value = t(`messages.encouragement.${currentStreak}`);
  return value === `messages.encouragement.${currentStreak}` ? null : value;
}

function showSessionEnd() {
  progFill.style.width = "100%";
  gameArea.style.display = "none";
  sessionEndEl.style.display = "block";

  const pct = Math.round((totalCorrect / sessionCards.length) * 100);
  document.getElementById("finalScore").textContent = `${pct}%`;

  const secs = Math.round((Date.now() - sessionStart) / 1000);
  const wpm = secs > 0 ? Math.round((totalCharsTyped / 5) / (secs / 60)) : 0;
  document.getElementById("finalDetails").textContent =
    t("messages.session.finalDetails", {
      correct: totalCorrect,
      total: sessionCards.length,
      streak: bestStreak,
      wpm,
      secs,
    });
  document.getElementById("finalEmoji").textContent =
    pct === 100 ? t("messages.session.emojiPerfect") :
    pct >= 80 ? t("messages.session.emojiStrong") :
    pct >= 60 ? t("messages.session.emojiGood") :
    t("messages.session.emojiPractice");
}

function hasDuplicate(card) {
  const key = cardKey(card);
  return allCards.some((existing) => cardKey(existing) === key);
}

function addCardToRuntime(card) {
  allCards = mergeCards(allCards, [card]);
  buildCatPanel();
}

function downloadCardsUserJson() {
  const cards = getExtraCardsForExport();
  if (!cards.length) {
    setAuthoringFeedback(t("messages.authoring.exportEmpty"), true);
    return;
  }

  const blob = new Blob([`${JSON.stringify(cards, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cards.user.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setAuthoringFeedback(t("messages.authoring.exportDone"), false);
}

async function handleAddCardSubmit(event) {
  event.preventDefault();

  const card = sanitizeCard({
    de: addCardDeEl.value,
    hr: addCardHrEl.value,
    en: addCardEnEl.value,
    cat: addCardCatEl.value,
  });

  if (!card) {
    setAuthoringFeedback(t("messages.authoring.invalid"), true);
    return;
  }

  if (hasDuplicate(card)) {
    setAuthoringFeedback(t("messages.authoring.duplicate"), true);
    return;
  }

  setAuthoringBusy(true);

  try {
    if (capabilities.persistentSave) {
    const response = await fetch("./api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || t("messages.authoring.saveFailed"));
      }

      const savedCard = payload.card || card;
      persistentCards = mergeCards(persistentCards, [savedCard]);
      addCardToRuntime(savedCard);
      setAuthoringFeedback(t("messages.authoring.savedPersistent"), false);
    } else {
      sessionOnlyCards = mergeCards(sessionOnlyCards, [card]);
      saveSessionCards();
      addCardToRuntime(card);
      setAuthoringFeedback(t("messages.authoring.savedSession"), false);
    }

    addCardForm.reset();
    addCardCatEl.value = allCats[0];
    showToast(t("messages.toasts.cardSaved"));
  } catch (error) {
    setAuthoringFeedback(error.message || t("messages.authoring.saveFailed"), true);
  } finally {
    setAuthoringBusy(false);
  }
}

function initAuthoringForm() {
  fillCategorySelect();
  addCardForm.addEventListener("submit", handleAddCardSubmit);
  exportCardsBtn.addEventListener("click", downloadCardsUserJson);

  if (authorToggleBtn && authorPanelEl) {
    authorToggleBtn.addEventListener("click", () => {
      const isOpen = !authorPanelEl.classList.contains("is-hidden");
      authorPanelEl.classList.toggle("is-hidden", isOpen);
      authorToggleBtn.classList.toggle("active", !isOpen);
      authorToggleBtn.setAttribute("aria-expanded", String(!isOpen));
    });
  }
}

function initInputEvents() {
  languageDockButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchLearningMode(button.dataset.lang);
    });
  });

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      setSettingsOpen(!isSettingsOpen);
    });
  }

  inputEl.addEventListener("input", () => {
    if (!sessionCards.length) {
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    const typedValue = inputEl.value;
    const previousPrefix = getCorrectPrefixLength(target, previousTypedValue);
    const currentPrefix = getCorrectPrefixLength(target, typedValue);
    const previousExact = isExactTypedMatch(target, previousTypedValue);
    const currentExact = isExactTypedMatch(target, typedValue);
    const freshCorrectIndexes = getFreshCorrectIndexes(
      target,
      previousTypedValue,
      typedValue
    );

    buildWordGrid(target, typedValue, freshCorrectIndexes);

    if (!previousExact && currentExact) {
      showFeedbackBurst("success", false);
    } else if (
      (previousExact && !currentExact && typedValue.length > previousTypedValue.length) ||
      (typedValue.length > previousTypedValue.length && currentPrefix < typedValue.length && currentPrefix <= previousPrefix)
    ) {
      showFeedbackBurst("error", false);
    }

    previousTypedValue = typedValue;
  });

  document.getElementById("hintBtn").addEventListener("click", () => {
    if (!sessionCards.length) {
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    hintCount += 1;
    const reveal = target.slice(0, hintCount * 3);
    inputEl.value = reveal;
    buildWordGrid(target, reveal);
    previousTypedValue = reveal;
    inputEl.focus();
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !sessionCards.length) {
      return;
    }

    const card = sessionCards[sessionIndex];
    const target = getTargetValue(card);
    if (normalizeAnswer(inputEl.value) === normalizeAnswer(target)) {
      showFeedbackBurst("success", true);
      totalCharsTyped += target.length;
      if (!forceCorrection) {
        totalCorrect += 1;
        streak += 1;
        if (streak > bestStreak) {
          bestStreak = streak;
        }
        showCombo();
        showToast(getEncouragement(streak));
      }
      totalAttempts += 1;
      inputEl.className = "correct";
      updateStats();
      setTimeout(() => {
        sessionIndex += 1;
        if (sessionIndex >= sessionCards.length) {
          showSessionEnd();
        } else {
          loadCard();
        }
      }, 140);
    } else {
      showFeedbackBurst("error", false);
      if (!forceCorrection) {
        totalAttempts += 1;
        streak = 0;
      }
      inputEl.className = "wrong";
      solutionEl.innerHTML = `<strong>${t("messages.solution.correctPrefix")}</strong> ${target}`;
      solutionEl.style.display = "block";
      forceCorrection = true;
      updateStats();
    }
  });
}

function createFlagColumns() {
  const flagEl = document.getElementById("deFlag");
  for (let i = 0; i < 50; i += 1) {
    const col = document.createElement("div");
    col.className = "de-flag-col";
    col.style.animationDelay = `${-(i / 20) * 3}s`;
    const baseBillow = (i / 4) * 16 + 4;
    const billow = i >= 25 ? baseBillow * 1.3 : baseBillow;
    col.style.setProperty("--billow", `${billow}px`);
    flagEl.appendChild(col);
  }
}

async function initApp() {
  learningMode = loadLearningMode();
  const [loadedLocales, baseCards, loadedPersistentCards, currentCapabilities, loadedFacts, loadedEuropeFacts] = await Promise.all([
    loadLocales(),
    fetchJson("cards.json", []),
    fetchJson("cards.user.json", []),
    detectCapabilities(),
    loadGermanyFacts(),
    loadEuropeFacts(),
  ]);

  locales = loadedLocales || {};
  applyLearningTheme();
  renderStaticUi();
  createFlagColumns();
  initInstallGuide();
  initDifficultyControls();
  initInputEvents();
  initAuthoringForm();
  setSettingsOpen(false);

  capabilities = currentCapabilities;
  germanyFacts = loadedFacts;
  europeFacts = loadedEuropeFacts;
  persistentCards = Array.isArray(loadedPersistentCards)
    ? loadedPersistentCards.map(sanitizeCard).filter(Boolean)
    : [];
  sessionOnlyCards = capabilities.persistentSave ? [] : loadSessionCards();
  allCards = mergeCards(baseCards, persistentCards, sessionOnlyCards);

  renderAuthoringMode();
  initFactsPanel();
  renderStaticUi();
  buildCatPanel();
  startSession();
}

window.startSession = startSession;
initAppLoader();
initApp()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    hideAppLoader();
  });
