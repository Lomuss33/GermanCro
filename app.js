const CATEGORY_ALIASES = {
  "PrÃ¤position": "Präposition",
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

const SESSION_SIZE = 20;
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
    art: ["Marlene Dietrich", "Kaethe Kollwitz", "Bertolt Brecht"],
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
    art: ["Johann Wolfgang von Goethe", "Brueder Grimm", "Anne Frank"],
  },
  "mecklenburg-vorpommern": {
    science: ["Heinrich Schliemann", "Albrecht Kossel", "Otto Lilienthal"],
    politics: ["Angela Merkel", "Manuela Schwesig", "Joachim Gauck"],
    art: ["Caspar David Friedrich", "Fritz Reuter", "Uwe Johnson"],
  },
  niedersachsen: {
    science: ["Carl Friedrich Gauss", "Wilhelm Weber", "David Hilbert"],
    politics: ["Gerhard Schroeder", "Christian Wulff", "Ernst Albrecht"],
    art: ["Wilhelm Busch", "Kurt Schwitters", "Niki de Saint Phalle"],
  },
  "nordrhein-westfalen": {
    science: ["Harald zur Hausen", "Max Born", "Julius Pluecker"],
    politics: ["Konrad Adenauer", "Johannes Rau", "Armin Laschet"],
    art: ["Ludwig van Beethoven", "Heinrich Boell", "Joseph Beuys"],
  },
  "rheinland-pfalz": {
    science: ["Johannes Gutenberg", "Hermann Staudinger", "Julius Richard Petri"],
    politics: ["Helmut Kohl", "Malu Dreyer", "Kurt Beck"],
    art: ["Hildegard von Bingen", "Max Slevogt", "Thomas Nast"],
  },
  saarland: {
    science: ["Peter Gruenberg", "Wolfgang Wahlster"],
    politics: ["Oskar Lafontaine", "Heiko Maas", "Annegret Kramp-Karrenbauer"],
    art: ["Max Ophuels", "Nicole", "Gerd Dudenhoeffer"],
  },
  sachsen: {
    science: ["Gottfried Wilhelm Leibniz", "Wilhelm Ostwald", "Manfred von Ardenne"],
    politics: ["August Bebel", "Kurt Biedenkopf", "Stanislaw Tillich"],
    art: ["Richard Wagner", "Erich Kaestner", "Caspar David Friedrich"],
  },
  "sachsen-anhalt": {
    science: ["Otto von Guericke", "Dorothea Erxleben", "Georg Cantor"],
    politics: ["Hans-Dietrich Genscher", "Reiner Haseloff", "Wolfgang Boehmer"],
    art: ["Georg Friedrich Haendel", "Lyonel Feininger", "Johann Joachim Winckelmann"],
  },
  "schleswig-holstein": {
    science: ["Max Planck", "Otto Diels", "Ferdinand Toennies"],
    politics: ["Willy Brandt", "Heide Simonis", "Daniel Guenther"],
    art: ["Thomas Mann", "Guenter Grass", "Emil Nolde"],
  },
  thueringen: {
    science: ["Carl Zeiss", "Ernst Abbe", "Johann Wolfgang Doebereiner"],
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
let difficulty = "medium";
let previousTypedValue = "";
let germanyFacts = null;
let europeFacts = null;
let factsMode = "germany";
let selectedStateId = null;
let selectedEuropeCountryId = null;

const promptEl = document.getElementById("promptText");
const promptSub = document.getElementById("promptSub");
const inputEl = document.getElementById("answer");
const solutionEl = document.getElementById("solution");
const wordGrid = document.getElementById("wordGrid");
const progFill = document.getElementById("progressFill");
const categoryEl = document.getElementById("categoryBadge");
const comboPop = document.getElementById("comboPop");
const gameArea = document.getElementById("gameArea");
const sessionEndEl = document.getElementById("sessionEnd");
const mainCard = document.getElementById("mainCard");
const progressTrackEl = document.querySelector(".progress-track");
const statsBarEl = document.querySelector(".stats-bar");
const catCountEl = document.getElementById("catCount");
const newGameBtn = document.getElementById("newGameBtn");
const searchPanelEl = document.getElementById("searchPanel");
const searchLinksEl = document.getElementById("searchLinks");
const authorPanelEl = document.getElementById("authorPanel");
const authorToggleBtn = document.getElementById("authorToggleBtn");

const addCardForm = document.getElementById("addCardForm");
const addCardDeEl = document.getElementById("newCardDe");
const addCardHrEl = document.getElementById("newCardHr");
const addCardEnEl = document.getElementById("newCardEn");
const addCardCatEl = document.getElementById("newCardCat");
const addCardSaveBtn = document.getElementById("addCardSaveBtn");
const exportCardsBtn = document.getElementById("exportCardsBtn");
const addCardStatusEl = document.getElementById("addCardStatus");
const authorModeEl = document.getElementById("authorMode");
const factsCountryBtn = document.getElementById("factsCountryBtn");
const factsStatesBtn = document.getElementById("factsStatesBtn");
const statePickerWrap = document.getElementById("statePickerWrap");
const statePickerEl = document.getElementById("statePicker");
const factsContentEl = document.getElementById("factsContent");

if (statsBarEl && mainCard && progressTrackEl) {
  mainCard.insertBefore(statsBarEl, progressTrackEl);
}

if (authorPanelEl && searchPanelEl && searchPanelEl.parentNode) {
  searchPanelEl.parentNode.insertBefore(authorPanelEl, searchPanelEl);
}

function normalizeCategory(cat) {
  return CATEGORY_ALIASES[cat] || cat;
}

function normalizeField(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeAnswer(value) {
  return normalizeField(value).replace(/[.,!?:;]+$/, "").toLowerCase();
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

async function detectCapabilities() {
  try {
    const response = await fetch("/api/capabilities", { cache: "no-store" });
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
    ? "Speichert..."
    : capabilities.persistentSave
      ? "Dauerhaft speichern"
      : "Zur Sitzung speichern";
}

function renderAuthoringMode() {
  if (capabilities.persistentSave) {
    authorModeEl.classList.add("persistent");
    setAuthoringFeedback("Direktes Speichern ist aktiv. Export bleibt als Backup verfügbar.", false);
  } else {
    authorModeEl.classList.remove("persistent");
    setAuthoringFeedback("Mit npx serve . kannst du Karten lokal anlegen und danach als cards.user.json herunterladen.", false);
  }
  setAuthoringBusy(false);
}

function fillCategorySelect() {
  addCardCatEl.innerHTML = "";
  allCats.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
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
  mixBtn.textContent = "Gemischt";
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
    btn.textContent = cat;
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
  catCountEl.textContent = `${pool.length} Karten verfügbar`;
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
    return `${FACTS_IMAGE_ROOT}/country/deutschland.webp`;
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
    ["Bekannte Personen: Wissenschaft", notablePeople.science],
    ["Bekannte Personen: Politik", notablePeople.politics],
    ["Bekannte Personen: Kunst", notablePeople.art],
  ];
}

function renderFactsView(title, subtitle, imageSrc, fields, lists, tourismUrl = "") {
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
  flagEl.alt = `${title} Flagge`;
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

  const nameEl = document.createElement(isNonEmptyValue(tourismUrl) ? "a" : "div");
  nameEl.className = "facts-view-name";
  nameEl.textContent = title;
  if (isNonEmptyValue(tourismUrl)) {
    nameEl.href = tourismUrl;
    nameEl.target = "_blank";
    nameEl.rel = "noopener noreferrer";
    nameEl.title = `${title} Tourismus`;
    nameEl.setAttribute("aria-label", `${title} Tourismus in neuem Tab öffnen`);
  }
  titleCopy.appendChild(nameEl);

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
      countryData.name || "Deutschland",
      countryData.official_name || "",
      getFactsImagePath("country"),
    [
      ["Hauptstadt", countryData.capital],
      ["Gr\u00f6\u00dfte Stadt", countryData.largest_city],
      ["Hymne", countryData.anthem],
      ["Gegr\u00fcndet", countryData.founded],
      ["Staatsform", countryData.state_form],
      ["Nationalfeiertag", countryData.national_day],
      ["Einwohnerzahl", countryData.population],
      ["Fl\u00e4che", countryData.area_km2],
      ["Anzahl Bundesl\u00e4nder", countryData.states_count],
      ["W\u00e4hrung", countryData.currency],
      ["Sprache", countryData.language],
      ["Zeitzone", countryData.time_zone],
      ["Telefonvorwahl", countryData.calling_code],
      ["Internet-Domain", countryData.internet_tld],
      ["Nachbarl\u00e4nder", countryData.bordering_countries_count],
      ["BIP nominal", countryData.gdp_nominal],
      ["EU seit", countryData.eu_member_since],
      {
        label: "Deutschland im \u00dcberblick",
        value: countryData.overview,
        featured: true,
      },
    ],
    [
      ["Nachbarl\u00e4nder", countryData.neighboring_countries],
      ["Bekannte Orte", countryData.highlights],
      ["Natur und Landschaft", countryData.nature],
      ],
      TOURISM_LINKS.germany
    );
  }

function renderEuropeOverview(unionData) {
  renderFactsView(
      unionData.name || "Europa",
      unionData.official_name || "",
      EUROPE_FLAG_IMAGE,
    [
      ["Hauptstadt", unionData.capital],
      ["Groesste Stadt", unionData.largest_city],
      ["Hymne", unionData.anthem],
      ["Gegruendet", unionData.founded],
      ["Staatsform", unionData.state_form],
      ["Europatag", unionData.national_day],
      ["Bevoelkerung", unionData.population],
      ["Flaeche", unionData.area_km2],
      ["Mitgliedstaaten", unionData.states_count],
      ["Waehrung", unionData.currency],
      ["Sprachen", unionData.language],
      ["Zeitzonen", unionData.time_zone],
      ["Internet-Domain", unionData.internet_tld],
      ["BIP nominal", unionData.gdp_nominal],
      {
        label: "Europa im Ueberblick",
        value: unionData.overview,
        featured: true,
      },
    ],
    [
      ["Institutionen", unionData.institutions],
      ["Ausgewaehlte Orte", unionData.highlights],
      ["Natur und Grossraeume", unionData.nature],
      ["Meere und Verbindungen", unionData.neighboring_countries],
      ]
    );
  }

function renderStateFacts(stateData) {
  renderFactsView(
      stateData.name || "Bundesland",
      "",
      getFactsImagePath("state", stateData.id),
    [
      ["K\u00fcrzel", stateData.abbreviation],
      ["Landestyp", stateData.state_type],
      ["Region", stateData.region],
      ["Hauptstadt", stateData.capital],
      ["Gr\u00f6\u00dfte Stadt", stateData.largest_city],
      ["Einwohnerzahl", stateData.population],
      ["Fl\u00e4che", stateData.area_km2],
      ["Gegr\u00fcndet / in heutiger Form", stateData.joined_or_founded],
      ["Regierungschef", stateData.minister_president || stateData.state_head],
      {
        label: "Lage und Raum",
        value: stateData.location_summary,
        featured: true,
      },
      {
        label: "Kurzprofil",
        value: stateData.identity_summary,
        featured: true,
      },
    ],
    [
      ["Nachbar-Bundesl\u00e4nder", stateData.neighboring_states],
      ["Grenzt an", stateData.bordering_countries],
      ["Bekannt f\u00fcr", stateData.known_for],
      ["Natur und Landschaft", stateData.nature],
      ...getStatePeopleLists(stateData.id),
      ],
      TOURISM_LINKS.states[stateData.id] || ""
    );
  }

function renderEuropeanCountryFacts(countryData) {
  renderFactsView(
      countryData.name || "Land",
      countryData.official_name || "",
      countryData.flag_image || "",
    [
      ["Hauptstadt", countryData.capital],
      ["Region", countryData.region],
      ["Staatsform", countryData.state_form],
      ["Einwohnerzahl", countryData.population],
      ["Flaeche", countryData.area_km2],
      ["Waehrung", countryData.currency],
      ["Sprache", countryData.language],
      ["Zeitzone", countryData.time_zone],
      ["Telefonvorwahl", countryData.calling_code],
      ["Internet-Domain", countryData.internet_tld],
      ["Binnenland", countryData.landlocked],
      {
        label: "Kurzprofil",
        value: countryData.overview,
        featured: true,
      },
    ],
    [
      ["Nachbarlaender", countryData.neighboring_countries],
      ["Sprachen", countryData.languages_list],
      ["Zeitzonen", countryData.timezones_list],
      ],
      TOURISM_LINKS.countries[countryData.id] || ""
    );
  }

function renderFactsError() {
  factsContentEl.innerHTML = "";
  const error = document.createElement("div");
  error.className = "facts-error";
  error.textContent = "Fakten konnten nicht geladen werden.";
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
        ariaLabel: `Bundesland ${state.name} auswaehlen`,
        onClick: () => {
          factsMode = "state";
          selectedStateId = state.id;
          renderFactsSelection();
        },
      }))
    : (europeFacts?.countries || []).map((country) => ({
        id: country.id,
        label: country.name,
        active: country.id === selectedEuropeCountryId,
        ariaLabel: `Land ${country.name} auswaehlen`,
        onClick: () => {
          factsMode = "europe-country";
          selectedEuropeCountryId = country.id;
          renderFactsSelection();
        },
      }));

  statePickerEl.setAttribute(
    "aria-label",
    isGermanyMode ? "Bundeslaender auswaehlen" : "Europaeische Laender auswaehlen"
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
        buildWordGrid(sessionCards[sessionIndex].de, inputEl.value);
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
      const spacer = document.createElement("div");
      spacer.style.cssText = "width:5px;flex-shrink:0";
      wordGrid.appendChild(spacer);
    }
  });
}

function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
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

  promptEl.textContent = card.hr;
  promptSub.textContent = card.en || "";
  inputEl.value = "";
  inputEl.className = "";
  previousTypedValue = "";
  solutionEl.style.display = "none";
  forceCorrection = false;
  hintCount = 0;
  progFill.style.width = `${(sessionIndex / sessionCards.length) * 100}%`;

  const color = catColors[card.cat] || "#888";
  categoryEl.textContent = card.cat;
  categoryEl.style.color = color;
  categoryEl.style.borderColor = `${color}55`;
  categoryEl.style.background = `${color}14`;

  mainCard.classList.add("active");
  buildWordGrid(card.de, "");
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

  const labels = ["", "", "", "Gut!", "Stark!", "Super!", "Mega!", "Wahnsinn!", "Unschlagbar!"];
  comboPop.textContent = labels[Math.min(streak, labels.length - 1)] || `x${streak}`;
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

function getEncouragement(currentStreak) {
  if (currentStreak === 3) {
    return "Drei in Reihe!";
  }
  if (currentStreak === 5) {
    return "Fünf! Weiter so!";
  }
  if (currentStreak === 7) {
    return "Perfekt!";
  }
  if (currentStreak === 10) {
    return "Legende!";
  }
  return null;
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
    `${totalCorrect}/${sessionCards.length} richtig · Streak: ${bestStreak} · ${wpm} WPM · ${secs}s`;
  document.getElementById("finalEmoji").textContent =
    pct === 100 ? "Topscore" :
    pct >= 80 ? "Sehr stark" :
    pct >= 60 ? "Guter Lauf" :
    "Weiterüben";
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
    setAuthoringFeedback("Noch keine Zusatzkarten zum Exportieren vorhanden.", true);
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

  setAuthoringFeedback("cards.user.json wurde heruntergeladen. Lege die Datei ins Repo, damit sie beim nächsten Start geladen wird.", false);
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
    setAuthoringFeedback("Bitte Deutsch, Kroatisch, Englisch und eine gültige Kategorie ausfüllen.", true);
    return;
  }

  if (hasDuplicate(card)) {
    setAuthoringFeedback("Diese Karte existiert bereits.", true);
    return;
  }

  setAuthoringBusy(true);

  try {
    if (capabilities.persistentSave) {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Speichern fehlgeschlagen.");
      }

      const savedCard = payload.card || card;
      persistentCards = mergeCards(persistentCards, [savedCard]);
      addCardToRuntime(savedCard);
      setAuthoringFeedback("Dauerhaft lokal gespeichert. Ein neues Spiel nimmt die Karte in die Auswahl auf.", false);
    } else {
      sessionOnlyCards = mergeCards(sessionOnlyCards, [card]);
      saveSessionCards();
      addCardToRuntime(card);
      setAuthoringFeedback("Nur für diese Sitzung gespeichert. Beim Neuladen ohne lokale API bleibt die Datenbank unverändert.", false);
    }

    addCardForm.reset();
    addCardCatEl.value = allCats[0];
    showToast("Neue Karte gespeichert");
  } catch (error) {
    setAuthoringFeedback(error.message || "Speichern fehlgeschlagen.", true);
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
  inputEl.addEventListener("input", () => {
    if (!sessionCards.length) {
      return;
    }

    const typedValue = inputEl.value;
    const freshCorrectIndexes = getFreshCorrectIndexes(
      sessionCards[sessionIndex].de,
      previousTypedValue,
      typedValue
    );

    buildWordGrid(sessionCards[sessionIndex].de, typedValue, freshCorrectIndexes);
    previousTypedValue = typedValue;
  });

  document.getElementById("hintBtn").addEventListener("click", () => {
    if (!sessionCards.length) {
      return;
    }

    const target = sessionCards[sessionIndex].de;
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
    if (normalizeAnswer(inputEl.value) === normalizeAnswer(card.de)) {
      totalCharsTyped += card.de.length;
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
      if (!forceCorrection) {
        totalAttempts += 1;
        streak = 0;
      }
      inputEl.className = "wrong";
      solutionEl.innerHTML = `<strong>Richtig:</strong> ${card.de}`;
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
    col.style.setProperty("--billow", `${(i / 4) * 16 + 4}px`);
    flagEl.appendChild(col);
  }
}

async function initApp() {
  createFlagColumns();
  initDifficultyControls();
  initInputEvents();
  initAuthoringForm();
  buildCatPanel();

  const [baseCards, loadedPersistentCards, currentCapabilities, loadedFacts, loadedEuropeFacts] = await Promise.all([
    fetchJson("cards.json", []),
    fetchJson("cards.user.json", []),
    detectCapabilities(),
    loadGermanyFacts(),
    loadEuropeFacts(),
  ]);

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
  buildCatPanel();
  startSession();
}

window.startSession = startSession;
initApp();
