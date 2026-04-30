import { createPretextBlockController } from "../../pretext-layout.js?v=2026-04-29-fix1";
import { createGrammarSliderTable } from "../../grammar-slider-table.js?v=2026-04-29-fix1";
import {
  CARD_SCOPE_OPTIONS,
  MODE_SCOPE_MAP,
  SUBCATEGORY_OPTIONS,
  TOPIC_CONFIG,
  TOPIC_OPTIONS,
  cardKey,
  mergeCards,
  normalizeAnswer,
  normalizeField,
  normalizeScope,
  normalizeSubcategory,
  normalizeTopic,
  sanitizeCard,
} from "../../shared/card-schema.js?v=2026-04-29-fix1";

const searchSites = [
  { name: "dict.cc", icon: "C", url: (w) => `https://www.dict.cc/?s=${encodeURIComponent(w)}` },
  { name: "Google", icon: "G", url: (w) => `https://www.google.com/search?q=${encodeURIComponent(`${w} auf Deutsch`)}` },
  { name: "Linguee", icon: "L", url: (w) => `https://www.linguee.de/deutsch-englisch/search?query=${encodeURIComponent(w)}` },
  { name: "Leo", icon: "L", url: (w) => `https://dict.leo.org/german-english/${encodeURIComponent(w)}` },
];

const ASSET_REV = "2026-04-29-fix1";
const SESSION_SIZE = 10;
const SESSION_STORAGE_KEY = "germancro-session-cards";
const AUTOFILL_TRAILING_PUNCT = /[.!?:;]/;
const FACTS_IMAGE_ROOT = "assets/facts";
const FACTS_STATE_IMAGE_OVERRIDES = Object.freeze({
  bayern: `${FACTS_IMAGE_ROOT}/states/bayern-facts.webp`,
});
const EMERGENCY_FALLBACK_CARD = Object.freeze({
  de: "das Haus",
  hr: "kuća",
  en: "house",
  topic: "basics",
  subcategory: "Nomen",
  scope: "all",
});
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
    "schweiz": "https://www.myswitzerland.com/",
    "vatikanstadt": "https://www.vaticanstate.va/en/",
    "portugal": "https://www.visitportugal.com/",
    "montenegro": "https://www.montenegro.travel/en",
    "luxemburg": "https://www.visitluxembourg.com/",
    "liechtenstein": "https://tourismus.li/en/",
    "andorra": "https://visitandorra.com/en/",
    "kanada": "https://travel.destinationcanada.com/",
    "usa": "https://www.visittheusa.com/",
    "china": "https://www.visitchina.com/",
    "brasilien": "https://www.visitbrasil.com/",
    "australien": "https://www.australia.com/",
    "indien": "https://www.incredibleindia.gov.in/",
    "argentinien": "https://www.argentina.travel/en",
    "algerien": "https://www.algeria.com/",
    "mexiko": "https://www.visitmexico.com/en/",
    "indonesien": "https://www.indonesia.travel/gb/en/home",
    "japan": "https://www.japan.travel/en/",
    "suedkorea": "https://english.visitkorea.or.kr/",
    "pakistan": "https://www.tourism.gov.pk/",
    "bangladesch": "https://bangladeshtourismboard.gov.bd/",
    "nigeria": "https://tourism.gov.ng/",
    "aethiopien": "https://visitethiopia.et/",
    "aegypten": "https://www.experienceegypt.eg/",
    "suedafrika": "https://www.southafrica.net/gl/en/travel",
    "kasachstan": "https://kazakhstan.travel/en",
    "peru": "https://www.peru.travel/en",
    "kolumbien": "https://colombia.travel/en",
    "chile": "https://www.chile.travel/en/",
    "venezuela": "https://www.venezuelatuya.com/",
    "neuseeland": "https://www.newzealand.com/int/",
    "thailand": "https://www.tourismthailand.org/home",
    "vietnam": "https://vietnam.travel/",
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
    "schweiz": "https://www.admin.ch/gov/en/start.html",
    "vatikanstadt": "https://www.vaticanstate.va/en/",
    "portugal": "https://www.portugal.gov.pt/en/gc23",
    "montenegro": "https://www.gov.me/en",
    "luxemburg": "https://gouvernement.lu/en.html",
    "liechtenstein": "https://www.liechtenstein.li/en/",
    "andorra": "https://www.govern.ad/en/",
    "kanada": "https://www.canada.ca/en.html",
    "usa": "https://www.usa.gov/",
    "china": "https://english.www.gov.cn/",
    "brasilien": "https://www.gov.br/planalto/en",
    "australien": "https://www.australia.gov.au/",
    "indien": "https://www.india.gov.in/",
    "argentinien": "https://www.argentina.gob.ar/",
    "algerien": "https://www.interieur.gov.dz/",
    "dr-kongo": "https://www.primature.gouv.cd/",
    "saudi-arabien": "https://www.my.gov.sa/wps/portal/snp/main",
    "mexiko": "https://www.gob.mx/",
    "indonesien": "https://indonesia.go.id/",
    "sudan": "https://www.sudan.gov.sd/",
    "libyen": "https://government.gov.ly/",
    "iran": "https://en.irna.ir/",
    "mongolei": "https://mongolia.gov.mn/en/",
    "japan": "https://www.japan.go.jp/",
    "suedkorea": "https://www.korea.net/",
    "pakistan": "https://www.pakistan.gov.pk/",
    "bangladesch": "https://bangladesh.gov.bd/index.php",
    "nigeria": "https://statehouse.gov.ng/",
    "aethiopien": "https://pmo.gov.et/",
    "aegypten": "https://www.sis.gov.eg/",
    "suedafrika": "https://www.gov.za/",
    "kasachstan": "https://www.gov.kz/memleket/entities?lang=en",
    "peru": "https://www.gob.pe/en/",
    "kolumbien": "https://www.gov.co/",
    "chile": "https://www.gob.cl/en/",
    "venezuela": "https://mppre.gob.ve/en/",
    "neuseeland": "https://www.govt.nz/",
    "thailand": "https://www.thaigov.go.th/",
    "vietnam": "https://en.vietnamplus.vn/",
  },
  world: "https://www.un.org/en/",
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
let bundledCards = [];
let persistentCards = [];
let sessionOnlyCards = [];
let selectedTopics = null;
let capabilities = { persistentSave: false };

let sessionCards = [];
let sessionIndex = 0;
let streak = 0;
let bestStreak = 0;
let totalCorrect = 0;
let totalAttempts = 0;
let skippedCount = 0;
let forceCorrection = false;
let sessionStart = 0;
let totalCharsTyped = 0;
let sessionSkipCounts = new WeakMap();
let difficulty = "easy";
let previousTypedValue = "";
let feedbackBurstTimer = null;
let answerGuideCompleteTimer = null;
let feedbackBurstPieces = [];
let answerGuideMeasureRaf = 0;
let learningMode = "de";
let isPromptOrderSwapped = false;
let germanyFacts = null;
let europeFacts = null;
let worldFacts = null;
let factsMode = "germany";
let selectedStateId = null;
let selectedEuropeCountryId = null;
let selectedWorldCountryId = null;
let locales = null;
let hasBootstrappedApp = false;
let sessionRecoveryNonce = 0;

const LEARNING_MODE_STORAGE_KEY = "germancro.learningMode";
const PROMPT_ORDER_STORAGE_KEY = "germancro.promptOrderSwapped";
const LANGUAGE_SEQUENCE = ["de", "hr", "en"];
const LANGUAGE_FLAGS = {
  de: "🇩🇪",
  hr: "🇭🇷",
  en: "🇬🇧",
};
const LANGUAGE_DOCK_LABELS = {
  de: "DE",
  hr: "HR",
  en: "GB",
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
const inputFlagEl = document.querySelector(".input-flag");
const siteTitleEl = document.querySelector(".site-title");
const siteTitleRowEl = document.querySelector(".site-title-row");
const heroStageEl = document.getElementById("heroStage");
const phoneGuideBarEl = document.getElementById("phoneGuideBar");
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
const skipCardBtnEl = document.getElementById("skipCardBtn");
const skipCardBtnLabelEl = document.getElementById("skipCardBtnLabel");
const promptHeadTitleEl = document.getElementById("promptHeadTitle");
const inputEl = document.getElementById("answer");
const wordGrid = document.getElementById("wordGrid");
const answerTerminalStatusRowEl = document.getElementById("answerTerminalStatusRow");
const answerTerminalStatusEl = document.getElementById("answerTerminalStatus");
const answerGuideEl = document.getElementById("answerGuide");
const answerGuideBodyEl = answerGuideEl?.querySelector(".answer-guide-body") || null;
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
const catCountEl = document.getElementById("catCount");
const settingsPanelTitleEl = document.getElementById("settingsPanelTitle");
const catPanelTitleEl = document.getElementById("catPanelTitle");
const difficultyHardBtn = document.getElementById("difficultyHardBtn");
const difficultyMediumBtn = document.getElementById("difficultyMediumBtn");
const difficultyEasyBtn = document.getElementById("difficultyEasyBtn");
const sliderUnitLabelEl = document.getElementById("sliderUnitLabel");
const sessionSizeSliderEl = document.getElementById("sessionSizeSlider");
const sliderLabelEl = document.getElementById("sliderLabel");
const newGameBtn = document.getElementById("newGameBtn");
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
const addCardTopicEl = document.getElementById("newCardTopic");
const addCardSubcategoryEl = document.getElementById("newCardSubcategory");
const addCardScopeEl = document.getElementById("newCardScope");
const authorLabelDeEl = document.getElementById("authorLabelDe");
const authorLabelTopicEl = document.getElementById("authorLabelTopic");
const authorLabelSubcategoryEl = document.getElementById("authorLabelSubcategory");
const authorLabelScopeEl = document.getElementById("authorLabelScope");
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
const factsWorldBtn = document.getElementById("factsWorldBtn");
const statePickerWrap = document.getElementById("statePickerWrap");
const statePickerEl = document.getElementById("statePicker");
const factsContentEl = document.getElementById("factsContent");
const factsPanelEl = document.querySelector(".facts-panel");
const hintBtnEl = document.getElementById("hintBtn");
const enterHintTextEl = document.getElementById("enterHintText");
const sessionEndLabelEl = document.getElementById("sessionEndLabel");
const restartBtnEl = document.getElementById("restartBtn");
const siteFooterLinkEl = document.getElementById("siteFooterLink");
let appLoaderStartedAt = Date.now();
let grammarSliderControllers = [];
let languageDockZoomFrame = 0;
let installGuideLayoutFrame = 0;
const viewportProfile = {
  width: 0,
  height: 0,
  maxObservedWidth: 0,
  maxObservedHeight: 0,
  isPhonePortrait: false,
  gameDensity: "regular",
  typeProfile: null,
  initialized: false,
  syncFrame: 0,
};
const answerGuideSizingState = {
  target: "",
  typed: "",
  width: 0,
  baseDensity: "regular",
  targetBucket: -1,
  typedBucket: -1,
  lastTier: "",
  lastMeasuredHeight: 0,
};
const FEEDBACK_BURST_SYMBOLS = Object.freeze({
  success: Object.freeze({
    big: Object.freeze(["\u{1F389}", "\u2728", "\u2B50", "\u{1F4A5}", "\u{1F38A}", "\u2728", "\u2B50", "\u{1F389}", "\u{1F4AB}", "\u2728"]),
    small: Object.freeze(["\u2728", "\u2B50", "\u{1F4AB}", "\u2728", "\u2B50", "\u2728"]),
  }),
  error: Object.freeze(["\u2716", "\u26A1", "\u2715", "\u26A0", "\u2716", "\u26A1"]),
});

const GAME_DENSITY_ORDER = ["regular", "compact", "dense"];
const DEFAULT_TYPE_PROFILE = Object.freeze({
  contentWidth: 390,
  bodyScale: 1,
  microScale: 1,
  displayScale: 1,
  controlScale: 1,
  iconScale: 1,
  gameTextScale: 1.3,
});
const PROMPT_FIT_PROFILES = {
  main: {
    regular: { maxLines: 2, minFontPx: 15, maxFontPx: 20, lineHeightRatio: 1.12 },
    compact: { maxLines: 3, minFontPx: 14, maxFontPx: 20, lineHeightRatio: 1.14 },
    dense: { maxLines: 4, minFontPx: 12, maxFontPx: 19, lineHeightRatio: 1.16 },
  },
  secondary: {
    regular: { maxLines: 2, minFontPx: 10, maxFontPx: 13, lineHeightRatio: 1.32 },
    compact: { maxLines: 3, minFontPx: 10, maxFontPx: 13, lineHeightRatio: 1.34 },
    dense: { maxLines: 4, minFontPx: 9, maxFontPx: 12, lineHeightRatio: 1.36 },
  },
};
const ANSWER_GUIDE_SIZE_PROFILES = {
  regular: {
    textScale: 1,
    metaScale: 1,
    tokenGap: 8,
    charGap: 3,
    separatorMinWidth: 28,
    separatorPaddingInline: 6,
    spaceSeparatorGap: 6,
  },
  compact: {
    textScale: 0.92,
    metaScale: 0.96,
    tokenGap: 6,
    charGap: 2,
    separatorMinWidth: 22,
    separatorPaddingInline: 5,
    spaceSeparatorGap: 5,
  },
  dense: {
    textScale: 0.84,
    metaScale: 0.92,
    tokenGap: 4,
    charGap: 2,
    separatorMinWidth: 18,
    separatorPaddingInline: 4,
    spaceSeparatorGap: 4,
  },
  "dense-minus": {
    textScale: 0.78,
    metaScale: 0.9,
    tokenGap: 3,
    charGap: 1,
    separatorMinWidth: 16,
    separatorPaddingInline: 3,
    spaceSeparatorGap: 3,
  },
};
const ANSWER_GUIDE_HEIGHT_BUDGETS = {
  regular: 120,
  compact: 140,
  dense: 160,
};

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundScale(value) {
  return Math.round(value * 1000) / 1000;
}

function getResponsiveTypeProfile() {
  return viewportProfile.typeProfile || DEFAULT_TYPE_PROFILE;
}

function getScaledFontPx(fontPx, scale) {
  return Math.max(1, Math.round(Number(fontPx || 0) * Number(scale || 1)));
}

function computeResponsiveTypeProfile({ viewportWidth, viewportHeight, heroWidth, cardWidth }) {
  const contentWidth = clampNumber(
    Math.max(0, Math.round(cardWidth || heroWidth || viewportWidth || 0)),
    390,
    780
  );
  const contentBoost = clampNumber((contentWidth - 390) / 390, 0, 1);
  const viewportBoost = clampNumber((viewportWidth - 1280) / 1920, 0, 1);
  const heightBoost = clampNumber((viewportHeight - 800) / 1400, 0, 1);

  const bodyScale = clampNumber(1 + contentBoost * 0.08 + viewportBoost * 0.06 + heightBoost * 0.02, 1, 1.16);
  const microScale = clampNumber(1 + (bodyScale - 1) * 0.7, 1, 1.11);
  const displayScale = clampNumber(1 + (bodyScale - 1) * 1.2, 1, 1.19);
  const controlScale = clampNumber(1 + (bodyScale - 1) * 0.6, 1, 1.1);
  const iconScale = clampNumber(1 + (bodyScale - 1) * 0.5, 1, 1.08);
  const gameTextScale = clampNumber(1.3 + (bodyScale - 1) * 0.9, 1.3, 1.44);

  return {
    contentWidth,
    bodyScale: roundScale(bodyScale),
    microScale: roundScale(microScale),
    displayScale: roundScale(displayScale),
    controlScale: roundScale(controlScale),
    iconScale: roundScale(iconScale),
    gameTextScale: roundScale(gameTextScale),
  };
}

function hasResponsiveTypeProfileChanged(currentProfile, nextProfile) {
  if (!currentProfile) {
    return true;
  }

  return Object.keys(DEFAULT_TYPE_PROFILE).some((key) => {
    const currentValue = Number(currentProfile[key] ?? 0);
    const nextValue = Number(nextProfile[key] ?? 0);
    return Math.abs(currentValue - nextValue) > 0.001;
  });
}

function applyResponsiveTypeProfile(profile) {
  if (!profile) {
    return;
  }

  const rootStyle = document.documentElement?.style;
  if (!rootStyle) {
    return;
  }

  rootStyle.setProperty("--type-scale-body", String(profile.bodyScale));
  rootStyle.setProperty("--type-scale-micro", String(profile.microScale));
  rootStyle.setProperty("--type-scale-display", String(profile.displayScale));
  rootStyle.setProperty("--type-scale-control", String(profile.controlScale));
  rootStyle.setProperty("--type-scale-icon", String(profile.iconScale));
  rootStyle.setProperty("--game-text-scale", String(profile.gameTextScale));
  rootStyle.setProperty("--type-content-width", `${profile.contentWidth}px`);
  viewportProfile.typeProfile = profile;
}

function isPhonePortraitLayoutActive() {
  return viewportProfile.isPhonePortrait;
}

function isTouchKeyboardEnvironment() {
  return Boolean(
    window.matchMedia?.("(pointer: coarse)").matches ||
    window.matchMedia?.("(hover: none)").matches ||
    "ontouchstart" in window
  );
}

function clampGameDensity(density) {
  return GAME_DENSITY_ORDER.includes(density) ? density : "regular";
}

function getNextDenserDensity(density) {
  const currentIndex = GAME_DENSITY_ORDER.indexOf(clampGameDensity(density));
  if (currentIndex === -1 || currentIndex >= GAME_DENSITY_ORDER.length - 1) {
    return GAME_DENSITY_ORDER[GAME_DENSITY_ORDER.length - 1];
  }
  return GAME_DENSITY_ORDER[currentIndex + 1];
}

function getCurrentGameDensity() {
  return clampGameDensity(document.body?.dataset?.gameDensity);
}

function getGameDensityProfile({ viewportWidth, viewportHeight, cardWidth }) {
  const resolvedWidth = Math.max(0, Math.round(cardWidth || 0)) || Math.max(0, Math.round(viewportWidth || 0));
  const aspectRatio = viewportWidth > 0 ? viewportHeight / viewportWidth : 0;

  if (resolvedWidth <= 400 || aspectRatio >= 1.9) {
    return "dense";
  }

  if (
    (resolvedWidth >= 401 && resolvedWidth <= 560) ||
    (aspectRatio >= 1.6 && aspectRatio < 1.9)
  ) {
    return "compact";
  }

  return "regular";
}

function getPromptFitProfile({ text, width, density, kind }) {
  const trimmedText = String(text ?? "").trim();
  const promptKind = kind === "secondary" ? "secondary" : "main";
  const bumpThreshold = promptKind === "secondary" ? 46 : 38;
  let effectiveDensity = clampGameDensity(density);

  if (Array.from(trimmedText).length > bumpThreshold) {
    effectiveDensity = getNextDenserDensity(effectiveDensity);
  }

  const profileGroup = PROMPT_FIT_PROFILES[promptKind] || PROMPT_FIT_PROFILES.main;
  const baseProfile = profileGroup[effectiveDensity] || profileGroup.regular;
  const { bodyScale } = getResponsiveTypeProfile();

  return {
    ...baseProfile,
    minFontPx: getScaledFontPx(baseProfile.minFontPx, bodyScale),
    maxFontPx: getScaledFontPx(baseProfile.maxFontPx, bodyScale),
  };
}

function getSiteTitleFitProfile() {
  const { displayScale } = getResponsiveTypeProfile();

  return {
    maxLines: 1,
    minFontPx: getScaledFontPx(10, displayScale),
    maxFontPx: getScaledFontPx(38, displayScale),
  };
}

function getNextAnswerGuideSizingTier(tier) {
  if (tier === "regular") {
    return "compact";
  }
  if (tier === "compact") {
    return "dense";
  }
  if (tier === "dense") {
    return "dense-minus";
  }
  return "dense-minus";
}

function getAnswerGuideVerticalBudget(density) {
  const baseBudget = ANSWER_GUIDE_HEIGHT_BUDGETS[clampGameDensity(density)] || ANSWER_GUIDE_HEIGHT_BUDGETS.regular;
  return Math.round(baseBudget * getResponsiveTypeProfile().controlScale);
}

function setAnswerGuideResponsiveVars(tier) {
  if (!answerGuideEl) {
    return;
  }

  const profile = ANSWER_GUIDE_SIZE_PROFILES[tier] || ANSWER_GUIDE_SIZE_PROFILES.regular;
  const { controlScale } = getResponsiveTypeProfile();
  answerGuideEl.style.setProperty("--answer-guide-text-scale", String(profile.textScale));
  answerGuideEl.style.setProperty("--answer-guide-meta-scale", String(profile.metaScale));
  answerGuideEl.style.setProperty("--answer-guide-token-gap", `${Math.round(profile.tokenGap * controlScale)}px`);
  answerGuideEl.style.setProperty("--answer-guide-char-gap", `${Math.round(profile.charGap * controlScale)}px`);
  answerGuideEl.style.setProperty("--answer-guide-separator-min-width", `${Math.round(profile.separatorMinWidth * controlScale)}px`);
  answerGuideEl.style.setProperty("--answer-guide-separator-padding-inline", `${Math.round(profile.separatorPaddingInline * controlScale)}px`);
  answerGuideEl.style.setProperty("--answer-guide-space-separator-gap", `${Math.round(profile.spaceSeparatorGap * controlScale)}px`);
  answerGuideEl.dataset.answerGuideScale = tier;
}

function syncPromptOrderControls() {
  const swapAria = t("messages.actions.switchPromptAria");

  [promptPrimaryFlagEl, promptSecondaryFlagEl].forEach((button) => {
    if (!button) {
      return;
    }

    button.setAttribute("aria-label", swapAria);
    button.setAttribute("title", swapAria);
    button.setAttribute("aria-pressed", String(isPromptOrderSwapped));
    button.classList.toggle("is-swapped", isPromptOrderSwapped);
  });
}

function measureAnswerGuideBodyHeight() {
  if (!answerGuideBodyEl) {
    return 0;
  }

  const height = Math.max(
    answerGuideBodyEl.scrollHeight || 0,
    Math.ceil(answerGuideBodyEl.getBoundingClientRect().height || 0),
    wordGrid?.scrollHeight || 0,
  );
  answerGuideSizingState.lastMeasuredHeight = height;
  return height;
}

function getAnswerGuideLengthBucket(length) {
  if (length <= 24) {
    return 0;
  }
  if (length <= 48) {
    return 1;
  }
  if (length <= 72) {
    return 2;
  }
  if (length <= 96) {
    return 3;
  }
  return 4;
}

function scheduleAnswerGuideMeasure(reason) {
  void reason;
  if (answerGuideMeasureRaf || !answerGuideEl || !answerGuideBodyEl || !wordGrid) {
    return;
  }

  answerGuideMeasureRaf = requestAnimationFrame(() => {
    answerGuideMeasureRaf = 0;
    measureAnswerGuideBodyHeight();
    applyAnswerGuideResponsiveSizing();
  });
}

function applyAnswerGuideResponsiveSizing() {
  if (!answerGuideEl || !answerGuideBodyEl || !wordGrid) {
    return;
  }

  const baseDensity = getCurrentGameDensity();
  const budget = getAnswerGuideVerticalBudget(baseDensity);
  const targetLength = Array.from(String(answerGuideSizingState.target ?? "")).length;
  const typedLength = Array.from(String(answerGuideSizingState.typed ?? "")).length;
  const width = Math.round(answerGuideBodyEl.clientWidth || answerGuideEl.clientWidth || 0);
  const targetBucket = getAnswerGuideLengthBucket(targetLength);
  const typedBucket = getAnswerGuideLengthBucket(typedLength);
  let tier = baseDensity;

  if (targetLength > 72 || typedLength > 72) {
    tier = getNextDenserDensity(tier);
  }

  const sameSizingInputs =
    answerGuideSizingState.width === width &&
    answerGuideSizingState.baseDensity === baseDensity &&
    answerGuideSizingState.targetBucket === targetBucket &&
    answerGuideSizingState.typedBucket === typedBucket &&
    answerGuideSizingState.lastTier === tier;

  setAnswerGuideResponsiveVars(tier);

  if (sameSizingInputs && answerGuideSizingState.lastMeasuredHeight <= budget) {
    return;
  }

  if (measureAnswerGuideBodyHeight() > budget) {
    tier = getNextAnswerGuideSizingTier(tier);
    setAnswerGuideResponsiveVars(tier);
  }

  answerGuideSizingState.width = width;
  answerGuideSizingState.baseDensity = baseDensity;
  answerGuideSizingState.targetBucket = targetBucket;
  answerGuideSizingState.typedBucket = typedBucket;
  answerGuideSizingState.lastTier = tier;
}

function setStableViewportCssVars(viewport) {
  if (!viewport) {
    return;
  }

  const width = Math.max(0, Math.round(viewport.width || 0));
  const height = Math.max(0, Math.round(viewport.height || 0));
  document.documentElement.style.setProperty("--app-stable-viewport-width", `${width}px`);
  document.documentElement.style.setProperty("--app-stable-viewport-height", `${height}px`);
}

function activateTouchInputWithoutScroll(event) {
  if (!isTouchKeyboardEnvironment() || !inputEl || document.activeElement === inputEl) {
    return;
  }

  event.preventDefault();
  focusAnswerInputAtEnd();
}

function focusAnswerInputWithoutScroll() {
  if (!inputEl) {
    return;
  }

  try {
    inputEl.focus({ preventScroll: true });
  } catch {
    inputEl.focus();
  }
}

function focusAnswerInputAtEnd() {
  if (!inputEl) {
    return;
  }

  focusAnswerInputWithoutScroll();
  const caretPosition = inputEl.value.length;
  try {
    inputEl.setSelectionRange(caretPosition, caretPosition);
  } catch {
    // ignore inputs that do not support selection APIs
  }
}

function isAnswerFocusBlocked() {
  return Boolean(
    isSessionEndVisible() ||
    (authorPanelEl && !authorPanelEl.classList.contains("is-hidden"))
  );
}

function hasActivePlayableCard() {
  return sessionCards.length > 0 && isRenderableCard(sessionCards[sessionIndex]);
}

function canConvenienceFocusAnswerInput() {
  return Boolean(inputEl && hasActivePlayableCard() && !isAnswerFocusBlocked());
}

function shouldCaptureTypingForAnswer(event) {
  if (!canConvenienceFocusAnswerInput()) {
    return false;
  }

  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  if (event.key.length !== 1) {
    return false;
  }

  const activeElement = document.activeElement;
  if (!activeElement || activeElement === document.body || activeElement === document.documentElement) {
    return true;
  }

  return false;
}

function insertTextIntoAnswerInput(text) {
  if (!inputEl || !text) {
    return;
  }

  const start = typeof inputEl.selectionStart === "number" ? inputEl.selectionStart : inputEl.value.length;
  const end = typeof inputEl.selectionEnd === "number" ? inputEl.selectionEnd : inputEl.value.length;

  if (typeof inputEl.setRangeText === "function") {
    inputEl.setRangeText(text, start, end, "end");
  } else {
    inputEl.value = `${inputEl.value.slice(0, start)}${text}${inputEl.value.slice(end)}`;
  }

  inputEl.dispatchEvent(new Event("input", { bubbles: true }));
}

function shouldTapFocusAnswerInput(target) {
  if (!canConvenienceFocusAnswerInput() || !(target instanceof Element)) {
    return false;
  }

  if (!gameArea?.contains(target)) {
    return false;
  }

  if (target.closest("button, a, input, textarea, select, label")) {
    return false;
  }

  return true;
}

function getViewportSize() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height)),
  };
}

function renderPhoneInstallGuide(browserText, stepsText) {
  if (!phoneGuideBarEl) {
    return;
  }

  const browserLine = document.createElement("span");
  browserLine.className = "phone-guide-bar-browser";
  browserLine.textContent = browserText;

  const stepsLine = document.createElement("span");
  stepsLine.className = "phone-guide-bar-steps";
  stepsLine.textContent = stepsText;

  phoneGuideBarEl.replaceChildren(browserLine, stepsLine);
}

function isSessionEndVisible() {
  return Boolean(sessionEndEl) && window.getComputedStyle(sessionEndEl).display !== "none";
}

function setGameSurfaceMode(showSessionEnd) {
  if (!gameArea || !sessionEndEl) {
    return;
  }

  gameArea.style.display = showSessionEnd ? "none" : "";
  sessionEndEl.style.display = showSessionEnd ? "flex" : "none";
}

function syncViewportProfile() {
  viewportProfile.syncFrame = 0;

  const measuredViewport = getViewportSize();
  const shouldIgnoreHeightOnlyChange =
    isTouchKeyboardEnvironment() &&
    viewportProfile.width > 0 &&
    viewportProfile.height > 0 &&
    Math.abs(measuredViewport.width - viewportProfile.width) <= 2;
  const nextViewport = shouldIgnoreHeightOnlyChange
    ? {
        width: viewportProfile.width,
        height: viewportProfile.height,
      }
    : measuredViewport;

  viewportProfile.maxObservedWidth = Math.max(viewportProfile.maxObservedWidth, nextViewport.width);
  viewportProfile.maxObservedHeight = Math.max(viewportProfile.maxObservedHeight, nextViewport.height);
  setStableViewportCssVars(nextViewport);
  const nextTypeProfile = computeResponsiveTypeProfile({
    viewportWidth: nextViewport.width,
    viewportHeight: nextViewport.height,
    heroWidth: heroStageEl?.clientWidth || 0,
    cardWidth: mainCard?.clientWidth || 0,
  });
  const typeProfileChanged = hasResponsiveTypeProfileChanged(viewportProfile.typeProfile, nextTypeProfile);
  applyResponsiveTypeProfile(nextTypeProfile);

  const widthRatio = viewportProfile.maxObservedWidth > 0
    ? nextViewport.width / viewportProfile.maxObservedWidth
    : 1;
  const heightRatio = viewportProfile.maxObservedHeight > 0
    ? nextViewport.height / viewportProfile.maxObservedHeight
    : 1;
  updateLanguageDockZoom(Math.min(widthRatio, heightRatio), nextViewport);

  const nextPhonePortrait = true;
  const nextGameDensity = getGameDensityProfile({
    viewportWidth: nextViewport.width,
    viewportHeight: nextViewport.height,
    cardWidth: mainCard?.clientWidth || 0,
  });
  const layoutChanged = viewportProfile.isPhonePortrait !== nextPhonePortrait;
  const densityChanged = viewportProfile.gameDensity !== nextGameDensity;
  const sizeChanged =
    viewportProfile.width !== nextViewport.width ||
    viewportProfile.height !== nextViewport.height;

  viewportProfile.width = nextViewport.width;
  viewportProfile.height = nextViewport.height;
  viewportProfile.isPhonePortrait = nextPhonePortrait;
  viewportProfile.gameDensity = nextGameDensity;

  document.body.classList.toggle("layout-phone-portrait", nextPhonePortrait);
  document.body.dataset.gameDensity = nextGameDensity;
  setGameSurfaceMode(isSessionEndVisible());

  if (sizeChanged || typeProfileChanged) {
    siteTitleController?.relayout();
  }

  if (sizeChanged || layoutChanged) {
    maybeShowInstallGuide();
  }

  if ((sizeChanged || densityChanged || typeProfileChanged) && sessionCards.length && sessionCards[sessionIndex]) {
    promptController?.relayout();
    promptSubController?.relayout();
    buildWordGrid(getTargetValue(sessionCards[sessionIndex]), inputEl.value);
  }
}

function scheduleViewportProfileSync() {
  if (viewportProfile.syncFrame) {
    return;
  }

  viewportProfile.syncFrame = window.requestAnimationFrame(syncViewportProfile);
}

function initViewportProfile() {
  if (!viewportProfile.initialized) {
    viewportProfile.initialized = true;
    if ("virtualKeyboard" in navigator && navigator.virtualKeyboard) {
      navigator.virtualKeyboard.overlaysContent = true;
    }
    window.addEventListener("load", scheduleViewportProfileSync, { passive: true });
    window.addEventListener("pageshow", () => {
      syncViewportProfile();
      if (hasBootstrappedApp) {
        void recoverPlayableSession("pageshow", sessionCards.length || SESSION_SIZE);
      }
    }, { passive: true });
    window.addEventListener("resize", scheduleViewportProfileSync, { passive: true });
    window.addEventListener("orientationchange", scheduleViewportProfileSync, { passive: true });
  }

  if (viewportProfile.syncFrame) {
    window.cancelAnimationFrame(viewportProfile.syncFrame);
    viewportProfile.syncFrame = 0;
  }

  syncViewportProfile();
}

function renderSiteTitleLineContent({ line, startCharIndex }) {
  const fragment = document.createDocumentFragment();
  Array.from(line.text).forEach((letter, index) => {
    const globalIndex = startCharIndex + index;
    const span = document.createElement("span");
    span.className = `site-title-letter band-${Math.min(3, Math.floor(globalIndex / 3) + 1)}`;
    span.dataset.letter = letter;
    span.textContent = letter;
    fragment.appendChild(span);
  });
  return fragment;
}

const siteTitleController = createPretextBlockController({
  element: siteTitleEl,
  lineHeightRatio: 0.82,
  fontFamily: "Tahoma, sans-serif",
  fontWeight: 800,
  targetWidthRatio: 0.98,
  lineClassName: "pretext-line--hero",
  renderLineContent: renderSiteTitleLineContent,
  getLayoutConfig() {
    return getSiteTitleFitProfile();
  },
});

const promptController = createPretextBlockController({
  element: promptEl,
  fontFamily: "Tahoma, sans-serif",
  fontWeight: 400,
  targetWidthRatio: 0.96,
  lineClassName: "pretext-line--prompt",
  getLayoutConfig({ text, width }) {
    return getPromptFitProfile({
      text,
      width,
      density: getCurrentGameDensity(),
      kind: "main",
    });
  },
});

const promptSubController = createPretextBlockController({
  element: promptSub,
  fontFamily: "Tahoma, sans-serif",
  fontWeight: 700,
  targetWidthRatio: 0.96,
  lineClassName: "pretext-line--prompt",
  getLayoutConfig({ text, width }) {
    return getPromptFitProfile({
      text,
      width,
      density: getCurrentGameDensity(),
      kind: "secondary",
    });
  },
});

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

function getCurrentScopeMode() {
  return MODE_SCOPE_MAP[getTargetLanguage()] || "all";
}

function isCardScopeCompatible(card) {
  return Boolean(card) && (card.scope === "all" || card.scope === getCurrentScopeMode());
}

function getTopicColor(topic) {
  return TOPIC_CONFIG[topic]?.color || "#888";
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

function loadPromptOrderPreference() {
  try {
    return localStorage.getItem(PROMPT_ORDER_STORAGE_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function saveLearningMode() {
  try {
    localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode);
  } catch (error) {
    // Ignore storage failures and keep the in-memory preference.
  }
}

function savePromptOrderPreference() {
  try {
    localStorage.setItem(PROMPT_ORDER_STORAGE_KEY, String(isPromptOrderSwapped));
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

function getTopicLabel(topic) {
  return t(`topics.${topic}`);
}

function getSubcategoryLabel(subcategory) {
  return t(`categories.${subcategory}`);
}

function getScopeLabel(scope) {
  return t(`scopes.${scope}`);
}

function renderCardBadge(card) {
  if (!categoryEl) {
    return;
  }

  categoryEl.innerHTML = "";

  if (!card) {
    categoryEl.style.removeProperty("color");
    categoryEl.style.removeProperty("border-color");
    categoryEl.style.removeProperty("background");
    return;
  }

  const color = getTopicColor(card.topic);

  const topicEl = document.createElement("span");
  topicEl.className = "category-badge-main";
  topicEl.textContent = getTopicLabel(card.topic);

  const metaEl = document.createElement("span");
  metaEl.className = "category-badge-meta";
  metaEl.textContent = `· ${getSubcategoryLabel(card.subcategory)}`;

  categoryEl.append(topicEl, metaEl);
  categoryEl.style.color = color;
  categoryEl.style.borderColor = `${color}55`;
  categoryEl.style.background = `${color}14`;
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

function canSkipCurrentCard() {
  return sessionCards.length - sessionIndex > 1;
}

function incrementCardSkipCount(card) {
  const currentCount = sessionSkipCounts.get(card) || 0;
  sessionSkipCounts.set(card, currentCount + 1);
}

function skipCurrentCard() {
  const card = sessionCards[sessionIndex];
  if (!isRenderableCard(card)) {
    void recoverPlayableSession("skip-invalid-card", sessionCards.length || SESSION_SIZE);
    return;
  }

  if (!canSkipCurrentCard()) {
    return;
  }

  skippedCount += 1;
  incrementCardSkipCount(card);
  streak = 0;
  updateStats();

  const [currentCard] = sessionCards.splice(sessionIndex, 1);
  sessionCards.push(currentCard);
  loadCard();
}

function updateSkipCardButtonState() {
  if (!skipCardBtnEl) {
    return;
  }

  skipCardBtnEl.disabled = !canSkipCurrentCard();
}

function renderHintButtonLabel() {
  if (!hintBtnEl) {
    return;
  }

  const textEl = hintBtnEl.querySelector(".hint-btn-text");
  if (textEl && hintBtnEl.querySelector(".button-icon-emoji")) {
    textEl.textContent = t("messages.actions.hint");
    return;
  }

  hintBtnEl.replaceChildren();

  const iconEl = document.createElement("span");
  iconEl.className = "button-icon button-icon-emoji";
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.textContent = String.fromCodePoint(0x1F4A1);

  const labelEl = document.createElement("span");
  labelEl.className = "hint-btn-text";
  labelEl.textContent = t("messages.actions.hint");

  hintBtnEl.append(iconEl, document.createTextNode(" "), labelEl);
  return;

  hintBtnEl.innerHTML = `<span class="button-icon button-icon-emoji" aria-hidden="true">💡</span> <span>${t("messages.actions.hint")}</span>`;
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

function resolveSessionSize(size, fallback = SESSION_SIZE) {
  const parsed = Number(size);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.max(1, Math.floor(parsed));
}

function getRequestedSessionSize() {
  return resolveSessionSize(sessionSizeSliderEl?.value, SESSION_SIZE);
}

function syncSessionSizeLabel() {
  if (sliderLabelEl && sessionSizeSliderEl) {
    sliderLabelEl.textContent = sessionSizeSliderEl.value;
  }
}

function getTargetLanguage() {
  return learningMode;
}

function getTargetValue(card) {
  return getCardValue(card, getTargetLanguage());
}

function getPromptLanguagesForTarget(language = getTargetLanguage()) {
  const activeIndex = LANGUAGE_SEQUENCE.indexOf(language);
  const promptLanguages = [
    LANGUAGE_SEQUENCE[(activeIndex + 1) % LANGUAGE_SEQUENCE.length],
    LANGUAGE_SEQUENCE[(activeIndex + 2) % LANGUAGE_SEQUENCE.length],
  ];

  return isPromptOrderSwapped ? promptLanguages.reverse() : promptLanguages;
}

function getPromptLanguages() {
  return getPromptLanguagesForTarget(getTargetLanguage());
}

function isRenderableCard(card, language = getTargetLanguage()) {
  if (!card) {
    return false;
  }

  const targetLanguage = LANGUAGE_SEQUENCE.includes(language) ? language : getTargetLanguage();
  const promptLanguages = getPromptLanguagesForTarget(targetLanguage);
  return [targetLanguage, ...promptLanguages].every((currentLanguage) => getCardValue(card, currentLanguage));
}

function getRenderablePool(cards, language = getTargetLanguage()) {
  return (Array.isArray(cards) ? cards : []).filter((card) => isRenderableCard(card, language));
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
  siteTitleEl.setAttribute("aria-label", title);
  if (siteTitleController) {
    siteTitleController.setText(title, { animate: true });
    return;
  }

  siteTitleEl.textContent = title;
}

function updateLanguageDock() {
  const languageDock = document.getElementById("languageDock");
  if (languageDock) {
    languageDock.setAttribute("aria-label", t("messages.languageDockAria"));
  }
  languageDockButtons.forEach((button) => {
    const language = button.dataset.lang;
    const labelEl = button.querySelector(".language-dock-label");
    if (labelEl) {
      labelEl.textContent = LANGUAGE_DOCK_LABELS[language] || "";
    }
    button.classList.toggle("is-active", language === getTargetLanguage());
    button.setAttribute("aria-pressed", String(language === getTargetLanguage()));
    button.setAttribute("aria-label", t(`messages.languageNames.${language}`));
  });
}

function getLanguageDockZoomScale(dockViewportRatio) {
  const ratio = Number.isFinite(dockViewportRatio) ? dockViewportRatio : 1;

  if (ratio >= 0.9) {
    return 1;
  }

  if (ratio >= 0.72) {
    return Math.max(0.82, Math.min(1, 0.82 + ((ratio - 0.72) / 0.18) * 0.18));
  }

  if (ratio >= 0.52) {
    return Math.max(0.64, Math.min(0.82, 0.64 + ((ratio - 0.52) / 0.2) * 0.18));
  }

  return 0.64;
}

function cancelLanguageDockZoomFrame() {
  if (!languageDockZoomFrame) {
    return;
  }

  window.cancelAnimationFrame(languageDockZoomFrame);
  languageDockZoomFrame = 0;
}

function applyLanguageDockZoomLayout(dockViewportRatio, nextViewport) {
  languageDockZoomFrame = 0;

  if (!languageDockEl) {
    return;
  }

  const ratio = Number.isFinite(dockViewportRatio) ? dockViewportRatio : 1;
  const scale = getLanguageDockZoomScale(ratio);
  const viewportWidth = Math.max(0, Math.round(nextViewport?.width || 0));
  const viewportHeight = Math.max(0, Math.round(nextViewport?.height || 0));

  languageDockEl.style.setProperty("--language-dock-zoom-scale", String(scale));
  const dockRect = languageDockEl.getBoundingClientRect();
  const isTooLarge =
    viewportWidth < 280 ||
    dockRect.width > viewportWidth * 0.24 ||
    dockRect.height > viewportHeight * 0.16;
  const isHidden = ratio < 0.52 && isTooLarge;
  languageDockEl.classList.toggle("is-zoom-hidden", isHidden);
}

function scheduleLanguageDockZoomLayout(dockViewportRatio, nextViewport) {
  if (!languageDockEl) {
    return;
  }

  cancelLanguageDockZoomFrame();
  const scheduledViewport = {
    width: Math.max(0, Math.round(nextViewport?.width || 0)),
    height: Math.max(0, Math.round(nextViewport?.height || 0)),
  };
  languageDockZoomFrame = window.requestAnimationFrame(() => {
    applyLanguageDockZoomLayout(dockViewportRatio, scheduledViewport);
  });
}

function updateLanguageDockZoom(dockViewportRatio, nextViewport) {
  scheduleLanguageDockZoomLayout(dockViewportRatio, nextViewport);
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

  grammarSliderControllers.forEach((controller) => controller?.destroy?.());
  grammarSliderControllers = [];
  grammarGridEl.innerHTML = "";
  const cards = getLocaleBundle()?.grammar?.cards || [];

  cards.forEach((card) => {
    const section = document.createElement("section");
    section.className = "grammar-card";

    const title = document.createElement("div");
    title.className = "grammar-card-title";
    title.textContent = card.title;
    section.appendChild(title);

    if (card?.interaction?.mode === "fixed_first_slider") {
      section.classList.add("grammar-card--interactive");

      const mount = document.createElement("div");
      mount.className = "grammar-slider-mount";
      section.appendChild(mount);
      grammarGridEl.appendChild(section);

      const controller = createGrammarSliderTable({ root: mount, card });
      if (controller) {
        grammarSliderControllers.push(controller);
      }
      return;
    }

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
  setLocalizedText(skipCardBtnLabelEl, "messages.actions.skip");
  if (skipCardBtnEl) {
    skipCardBtnEl.setAttribute("aria-label", t("messages.actions.skip"));
    skipCardBtnEl.setAttribute("title", t("messages.actions.skipTitle"));
  }
  setLocalizedText(promptHeadTitleEl, "messages.prompt.card");
  if (inputEl) {
    inputEl.placeholder = t("messages.prompt.placeholder");
  }
  setLocalizedText(answerGuideLabelEl, "messages.guide.label");
  renderHintButtonLabel();
  setLocalizedText(enterHintTextEl, "messages.actions.enterHint");
  setLocalizedText(sessionEndLabelEl, "messages.session.finished");
  setLocalizedText(restartBtnEl, "messages.session.newRound");
  setLocalizedText(settingsPanelTitleEl, "messages.actions.settings");
  setLocalizedText(catPanelTitleEl, "messages.categories.title");
  setLocalizedText(newGameBtn, "messages.categories.newGame");
  syncPromptOrderControls();
  setLocalizedText(difficultyEasyBtn, "difficulty.easy");
  setLocalizedText(difficultyMediumBtn, "difficulty.medium");
  setLocalizedText(difficultyHardBtn, "difficulty.hard");
  setLocalizedText(searchPanelTitleEl, "messages.search.title");
  setLocalizedText(searchPanelSubtitleEl, "messages.search.subtitle");
  setLocalizedText(authorToggleBtn, "messages.search.authorToggle");
  setLocalizedText(grammarSectionTitleEl, "grammar.title");
  setLocalizedText(authorPanelTitleEl, "messages.authoring.title");
  setLocalizedText(authorLabelDeEl, "messages.authoring.labels.de");
  setLocalizedText(authorLabelTopicEl, "messages.authoring.labels.topic");
  setLocalizedText(authorLabelSubcategoryEl, "messages.authoring.labels.subcategory");
  setLocalizedText(authorLabelScopeEl, "messages.authoring.labels.scope");
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
  fillAuthoringSelects();
  setLocalizedText(factsPanelTitleEl, "facts.panelTitle");
  setLocalizedText(factsPanelSubtitleEl, "facts.panelSubtitle");
  setLocalizedText(factsCountryBtn, "facts.tabs.germany");
  setLocalizedText(factsStatesBtn, "facts.tabs.europe");
  setLocalizedText(factsWorldBtn, "facts.tabs.world");
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

  window.setTimeout(async () => {
    learningMode = nextLanguage;
    saveLearningMode();
    applyLearningTheme();
    renderStaticUi();
    maybeShowInstallGuide();
    renderAuthoringMode();
    buildTopicPanel();
    updateStats();
    renderFactsSelection();
    if (isRenderableCard(sessionCards[sessionIndex], nextLanguage)) {
      loadCard({ focusInput: false });
    } else {
      await recoverPlayableSession("language-switch", sessionCards.length || SESSION_SIZE);
    }

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
  const primaryText = getCardValue(card, primaryLanguage);
  const secondaryText = getCardValue(card, secondaryLanguage);

  if (promptController) {
    promptController.setText(primaryText, { animate: true });
  } else if (promptEl) {
    promptEl.textContent = primaryText;
  }

  if (promptSubController) {
    promptSubController.setText(secondaryText, { animate: true });
  } else if (promptSub) {
    promptSub.textContent = secondaryText;
  }

  if (promptPrimaryFlagEl) {
    promptPrimaryFlagEl.textContent = LANGUAGE_FLAGS[primaryLanguage];
  }
  if (promptSecondaryFlagEl) {
    promptSecondaryFlagEl.textContent = LANGUAGE_FLAGS[secondaryLanguage];
  }
  if (inputFlagEl) {
    inputFlagEl.textContent = LANGUAGE_FLAGS[getTargetLanguage()];
  }
  syncPromptOrderControls();
  return;
}

function togglePromptOrder() {
  isPromptOrderSwapped = !isPromptOrderSwapped;
  savePromptOrderPreference();

  if (sessionCards.length && sessionCards[sessionIndex]) {
    renderPrompt(sessionCards[sessionIndex]);
    return;
  }

  syncPromptOrderControls();
}

async function fetchJson(url, fallback) {
  try {
    const cacheSafeUrl = url.includes("?") ? `${url}&v=${ASSET_REV}` : `${url}?v=${ASSET_REV}`;
    const response = await fetch(cacheSafeUrl, { cache: "no-store" });
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

function fillSelectOptions(selectEl, values, getLabel, fallbackValue) {
  if (!selectEl) {
    return;
  }

  const currentValue = selectEl.value;
  selectEl.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = getLabel(value);
    selectEl.appendChild(option);
  });

  const nextValue = values.includes(currentValue) ? currentValue : fallbackValue;
  if (nextValue) {
    selectEl.value = nextValue;
  }
}

function fillAuthoringSelects() {
  fillSelectOptions(addCardTopicEl, TOPIC_OPTIONS, getTopicLabel, TOPIC_OPTIONS[0]);
  fillSelectOptions(addCardSubcategoryEl, SUBCATEGORY_OPTIONS, getSubcategoryLabel, SUBCATEGORY_OPTIONS[0]);
  fillSelectOptions(addCardScopeEl, CARD_SCOPE_OPTIONS, getScopeLabel, CARD_SCOPE_OPTIONS[0]);
}

function buildTopicPanel() {
  const container = document.getElementById("catButtons");
  container.innerHTML = "";

  const mixBtn = document.createElement("button");
  mixBtn.className = `cat-btn mixed${selectedTopics === null ? " active" : ""}`;
  if (selectedTopics === null) {
    mixBtn.style.background = "#e8ff47";
  }
  mixBtn.textContent = t("messages.categories.mixed");
  mixBtn.onclick = () => {
    selectedTopics = null;
    buildTopicPanel();
  };
  container.appendChild(mixBtn);

  TOPIC_OPTIONS.forEach((topic) => {
    const color = getTopicColor(topic);
    const isActive = selectedTopics !== null && selectedTopics.has(topic);
    const btn = document.createElement("button");
    btn.className = `cat-btn${isActive ? " active" : ""}`;
    btn.textContent = getTopicLabel(topic);
    btn.style.borderColor = `${color}55`;
    btn.style.color = isActive ? "#000" : color;
    if (isActive) {
      btn.style.background = color;
    }
    btn.onclick = () => {
      if (selectedTopics === null) {
        selectedTopics = new Set();
      }

      if (selectedTopics.has(topic)) {
        selectedTopics.delete(topic);
        if (selectedTopics.size === 0) {
          selectedTopics = null;
        }
      } else {
        selectedTopics.add(topic);
      }

      buildTopicPanel();
    };
    container.appendChild(btn);
  });

  const pool = getPool();
  catCountEl.textContent = `${pool.length} ${t("messages.categories.unit")}`;
  newGameBtn.disabled = pool.length === 0;
}

function getPool() {
  const topicFiltered = selectedTopics === null
    ? allCards
    : allCards.filter((card) => selectedTopics.has(card.topic));
  return topicFiltered.filter(isCardScopeCompatible);
}

function updateSearchLinks(card) {
  searchLinksEl.innerHTML = "";
  if (!card) {
    return;
  }

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
  "Französisch": { de: "Französisch", hr: "francuski", en: "French" },
  Spanisch: { de: "Spanisch", hr: "španjolski", en: "Spanish" },
  Katalanisch: { de: "Katalanisch", hr: "katalonski", en: "Catalan" },
  Baskisch: { de: "Baskisch", hr: "baskijski", en: "Basque" },
  Galicisch: { de: "Galicisch", hr: "galicijski", en: "Galician" },
  Schwedisch: { de: "Schwedisch", hr: "švedski", en: "Swedish" },
  Polnisch: { de: "Polnisch", hr: "poljski", en: "Polish" },
  Ungarisch: { de: "Ungarisch", hr: "mađarski", en: "Hungarian" },
  Portugiesisch: { de: "Portugiesisch", hr: "portugalski", en: "Portuguese" },
  Italienisch: { de: "Italienisch", hr: "talijanski", en: "Italian" },
  "Rätoromanisch": { de: "Rätoromanisch", hr: "retoromanski", en: "Romansh" },
  Latein: { de: "Latein", hr: "latinski", en: "Latin" },
  Arabisch: { de: "Arabisch", hr: "arapski", en: "Arabic" },
  Chinesisch: { de: "Chinesisch", hr: "kineski", en: "Chinese" },
  Russisch: { de: "Russisch", hr: "ruski", en: "Russian" },
  Hindi: { de: "Hindi", hr: "hindski", en: "Hindi" },
  Persisch: { de: "Persisch", hr: "perzijski", en: "Persian" },
  Indonesisch: { de: "Indonesisch", hr: "indonezijski", en: "Indonesian" },
  Mongolisch: { de: "Mongolisch", hr: "mongolski", en: "Mongolian" },
  Montenegrinisch: { de: "Montenegrinisch", hr: "crnogorski", en: "Montenegrin" },
  Luxemburgisch: { de: "Luxemburgisch", hr: "luksemburski", en: "Luxembourgish" },
  Japanisch: { de: "Japanisch", hr: "japanski", en: "Japanese" },
  Koreanisch: { de: "Koreanisch", hr: "korejski", en: "Korean" },
  Urdu: { de: "Urdu", hr: "urdu", en: "Urdu" },
  Bengalisch: { de: "Bengalisch", hr: "bengalski", en: "Bengali" },
  Amharisch: { de: "Amharisch", hr: "amharski", en: "Amharic" },
  Kasachisch: { de: "Kasachisch", hr: "kazaški", en: "Kazakh" },
  Thai: { de: "Thai", hr: "tajlandski", en: "Thai" },
  Vietnamesisch: { de: "Vietnamesisch", hr: "vijetnamski", en: "Vietnamese" },
  Bosnisch: { de: "Bosnisch", hr: "bosanski", en: "Bosnian" },
  Serbisch: { de: "Serbisch", hr: "srpski", en: "Serbian" },
  Mazedonisch: { de: "Mazedonisch", hr: "makedonski", en: "Macedonian" },
  Albanisch: { de: "Albanisch", hr: "albanski", en: "Albanian" },
  Griechisch: { de: "Griechisch", hr: "grčki", en: "Greek" },
  Bulgarisch: { de: "Bulgarisch", hr: "bugarski", en: "Bulgarian" },
  "Türkisch": { de: "Türkisch", hr: "turski", en: "Turkish" },
  "Rumänisch": { de: "Rumänisch", hr: "rumunjski", en: "Romanian" },
  Ukrainisch: { de: "Ukrainisch", hr: "ukrajinski", en: "Ukrainian" },
  Belarussisch: { de: "Belarussisch", hr: "bjeloruski", en: "Belarusian" },
  Tschechisch: { de: "Tschechisch", hr: "češki", en: "Czech" },
  Slowakisch: { de: "Slowakisch", hr: "slovački", en: "Slovak" },
  Slowenisch: { de: "Slowenisch", hr: "slovenski", en: "Slovene" },
  "Niederländisch": { de: "Niederländisch", hr: "nizozemski", en: "Dutch" },
  "Dänisch": { de: "Dänisch", hr: "danski", en: "Danish" },
  Finnisch: { de: "Finnisch", hr: "finski", en: "Finnish" },
  Irisch: { de: "Irisch", hr: "irski", en: "Irish" },
  "Norwegisch (Nynorsk)": { de: "Norwegisch (Nynorsk)", hr: "norveški (nynorsk)", en: "Norwegian (Nynorsk)" },
  "Norwegisch (Bokmål)": { de: "Norwegisch (Bokmål)", hr: "norveški (bokmål)", en: "Norwegian (Bokmål)" },
  smi: { de: "Sami", hr: "sami", en: "Sami" },
};

FACT_LANGUAGE_MAP.Franzoesisch = FACT_LANGUAGE_MAP["Französisch"];
FACT_LANGUAGE_MAP.Raetoromanisch = FACT_LANGUAGE_MAP["Rätoromanisch"];
FACT_LANGUAGE_MAP.Tuerkisch = FACT_LANGUAGE_MAP["Türkisch"];
FACT_LANGUAGE_MAP.Rumaenisch = FACT_LANGUAGE_MAP["Rumänisch"];
FACT_LANGUAGE_MAP.Niederlaendisch = FACT_LANGUAGE_MAP["Niederländisch"];
FACT_LANGUAGE_MAP.Daenisch = FACT_LANGUAGE_MAP["Dänisch"];
FACT_LANGUAGE_MAP["Norwegisch (Bokmal)"] = FACT_LANGUAGE_MAP["Norwegisch (Bokmål)"];

const EXTRA_FACT_LABEL_MAP = {
  Monaco: { de: "Monaco", hr: "Monako", en: "Monaco" },
  Gibraltar: { de: "Gibraltar", hr: "Gibraltar", en: "Gibraltar" },
  Marokko: { de: "Marokko", hr: "Maroko", en: "Morocco" },
  Schottland: { de: "Schottland", hr: "Skotska", en: "Scotland" },
  Wales: { de: "Wales", hr: "Wales", en: "Wales" },
  Litauen: { de: "Litauen", hr: "Litva", en: "Lithuania" },
  Moldawien: { de: "Moldawien", hr: "Moldavija", en: "Moldova" },
  Afghanistan: { de: "Afghanistan", hr: "Afganistan", en: "Afghanistan" },
  Armenien: { de: "Armenien", hr: "Armenija", en: "Armenia" },
  Aserbaidschan: { de: "Aserbaidschan", hr: "Azerbajdzan", en: "Azerbaijan" },
  Angola: { de: "Angola", hr: "Angola", en: "Angola" },
  Belize: { de: "Belize", hr: "Belize", en: "Belize" },
  Bolivien: { de: "Bolivien", hr: "Bolivija", en: "Bolivia" },
  Guatemala: { de: "Guatemala", hr: "Gvatemala", en: "Guatemala" },
  Guyana: { de: "Guyana", hr: "Gvajana", en: "Guyana" },
  Irak: { de: "Irak", hr: "Irak", en: "Iraq" },
  Israel: { de: "Israel", hr: "Izrael", en: "Israel" },
  Jemen: { de: "Jemen", hr: "Jemen", en: "Yemen" },
  Jordanien: { de: "Jordanien", hr: "Jordan", en: "Jordan" },
  Kambodscha: { de: "Kambodscha", hr: "Kambodza", en: "Cambodia" },
  Kamerun: { de: "Kamerun", hr: "Kamerun", en: "Cameroon" },
  Kenia: { de: "Kenia", hr: "Kenija", en: "Kenya" },
  Kirgisistan: { de: "Kirgisistan", hr: "Kirgistan", en: "Kyrgyzstan" },
  Laos: { de: "Laos", hr: "Laos", en: "Laos" },
  Lettland: { de: "Lettland", hr: "Latvija", en: "Latvia" },
  Malaysia: { de: "Malaysia", hr: "Malezija", en: "Malaysia" },
  Mali: { de: "Mali", hr: "Mali", en: "Mali" },
  Nepal: { de: "Nepal", hr: "Nepal", en: "Nepal" },
  Niger: { de: "Niger", hr: "Niger", en: "Niger" },
  Nordkorea: { de: "Nordkorea", hr: "Sjeverna Koreja", en: "North Korea" },
  Panama: { de: "Panama", hr: "Panama", en: "Panama" },
  "Papua-Neuguinea": { de: "Papua-Neuguinea", hr: "Papua Nova Gvineja", en: "Papua New Guinea" },
  Paraguay: { de: "Paraguay", hr: "Paragvaj", en: "Paraguay" },
  "Republik Kongo": { de: "Republik Kongo", hr: "Republika Kongo", en: "Republic of the Congo" },
  Ruanda: { de: "Ruanda", hr: "Ruanda", en: "Rwanda" },
  "San Marino": { de: "San Marino", hr: "San Marino", en: "San Marino" },
  Simbabwe: { de: "Simbabwe", hr: "Zimbabve", en: "Zimbabwe" },
  Somalia: { de: "Somalia", hr: "Somalija", en: "Somalia" },
  Suedsudan: { de: "Südsudan", hr: "Južni Sudan", en: "South Sudan" },
  Syrien: { de: "Syrien", hr: "Sirija", en: "Syria" },
  "Timor-Leste": { de: "Timor-Leste", hr: "Timor-Leste", en: "Timor-Leste" },
  Tschad: { de: "Tschad", hr: "Čad", en: "Chad" },
  Tunesien: { de: "Tunesien", hr: "Tunis", en: "Tunisia" },
  Turkmenistan: { de: "Turkmenistan", hr: "Turkmenistan", en: "Turkmenistan" },
  Uganda: { de: "Uganda", hr: "Uganda", en: "Uganda" },
  Uruguay: { de: "Uruguay", hr: "Urugvaj", en: "Uruguay" },
  Usbekistan: { de: "Usbekistan", hr: "Uzbekistan", en: "Uzbekistan" },
  "Vereinigte Arabische Emirate": { de: "Vereinigte Arabische Emirate", hr: "Ujedinjeni Arapski Emirati", en: "United Arab Emirates" },
  Atlantik: { de: "Atlantik", hr: "Atlantik", en: "Atlantic Ocean" },
  Mittelmeer: { de: "Mittelmeer", hr: "Sredozemno more", en: "Mediterranean Sea" },
  Nordsee: { de: "Nordsee", hr: "Sjeverno more", en: "North Sea" },
  Ostsee: { de: "Ostsee", hr: "Baltičko more", en: "Baltic Sea" },
  "Schwarzes Meer": { de: "Schwarzes Meer", hr: "Crno more", en: "Black Sea" },
  Pazifik: { de: "Pazifik", hr: "Tihi ocean", en: "Pacific Ocean" },
  "Indischer Ozean": { de: "Indischer Ozean", hr: "Indijski ocean", en: "Indian Ocean" },
  "Arktischer Ozean": { de: "Arktischer Ozean", hr: "Arktički ocean", en: "Arctic Ocean" },
  "Suedlicher Ozean": { de: "Südlicher Ozean", hr: "Južni ocean", en: "Southern Ocean" },
  "Europaeisches Parlament": { de: "Europäisches Parlament", hr: "Europski parlament", en: "European Parliament" },
  "Europaeische Kommission": { de: "Europäische Kommission", hr: "Europska komisija", en: "European Commission" },
  "Europaeischer Rat": { de: "Europäischer Rat", hr: "Europsko vijeće", en: "European Council" },
  "UN-Generalversammlung": { de: "UN-Generalversammlung", hr: "Glavna skupština UN-a", en: "UN General Assembly" },
  "UN-Sicherheitsrat": { de: "UN-Sicherheitsrat", hr: "Vijeće sigurnosti UN-a", en: "UN Security Council" },
  "UN-Sekretariat": { de: "UN-Sekretariat", hr: "Tajništvo UN-a", en: "UN Secretariat" },
  "Internationaler Gerichtshof": { de: "Internationaler Gerichtshof", hr: "Međunarodni sud pravde", en: "International Court of Justice" },
  Bruessel: { de: "Brüssel", hr: "Bruxelles", en: "Brussels" },
  Strassburg: { de: "Straßburg", hr: "Strasbourg", en: "Strasbourg" },
  Genf: { de: "Genf", hr: "Ženeva", en: "Geneva" },
  Wien: { de: "Wien", hr: "Beč", en: "Vienna" }
};

function normalizeFactLookupKey(value) {
  return String(value || "")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function lookupFactMap(map, value) {
  if (!map || !value) {
    return null;
  }
  return map[value] || map[normalizeFactLookupKey(value)] || null;
}

function getFactsBundle() {
  return getLocaleBundle()?.facts || getLocaleBundle("de")?.facts || {};
}

function getLocalizedCountryNameById(id, fallback = "") {
  return getFactsBundle().names?.countries?.[id] || fallback;
}

function translateCountryOrRegionName(value) {
  const factsBundle = getFactsBundle();
  const normalizedValue = normalizeFactLookupKey(value);
  if (value === "Deutschland") {
    return factsBundle.names?.germany || value;
  }
  if (value === "Europa") {
    return factsBundle.names?.europe || value;
  }
  if (value === "Welt") {
    return factsBundle.names?.world || value;
  }
  const countryEntries = Object.entries(getLocaleBundle("de")?.facts?.names?.countries || {});
  for (const [id, name] of countryEntries) {
    if (name === value || normalizeFactLookupKey(name) === normalizedValue) {
      return getLocalizedCountryNameById(id, value);
    }
  }
  const extraLabel = lookupFactMap(EXTRA_FACT_LABEL_MAP, value);
  if (extraLabel) {
    return extraLabel[getLocale()] || extraLabel.de;
  }
  return lookupFactMap(factsBundle.regions, value) || value;
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

  const stateTypeLabel = lookupFactMap(factsBundle.stateTypes, trimmed);
  if (stateTypeLabel) {
    return stateTypeLabel;
  }
  const stateFormLabel = lookupFactMap(factsBundle.stateForms, trimmed);
  if (stateFormLabel) {
    return stateFormLabel;
  }
  const regionLabel = lookupFactMap(factsBundle.regions, trimmed);
  if (regionLabel) {
    return regionLabel;
  }
  const languageLabel = lookupFactMap(FACT_LANGUAGE_MAP, trimmed);
  if (languageLabel) {
    return languageLabel[getLocale()] || languageLabel.de;
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
    memberStates: unionData.states_count,
    capital: translateFactScalar(unionData.capital),
    institutions: joinLocalizedList(translateFactList(unionData.institutions)),
  });
}

function buildWorldOverview(unionData) {
  return t("facts.values.worldOverviewText", {
    memberStates: unionData.member_states,
    headquarters: unionData.headquarters,
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

function buildStateOverview(stateData) {
  const location = buildStateLocationSummary(stateData);
  const profile = buildStateProfileSummary(stateData);
  if (!location) {
    return profile;
  }
  if (!profile) {
    return location;
  }
  return `${location} ${profile}`;
}

function buildCountryOverview(countryData) {
  const name = getLocalizedCountryNameById(countryData.id, countryData.name);
  const region = translateFactScalar(countryData.region);
  const capital = countryData.capital;

  if (getLocale() === "hr") {
    return `${name} se nalazi u ${region}. Glavni grad je ${capital}.`;
  }
  if (getLocale() === "en") {
    return `${name} is in ${region}. Its capital is ${capital}.`;
  }
  return `${name} liegt in ${region}. Hauptstadt ist ${capital}.`;
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
  const normalized = normalizeEuropeFacts(raw);
  if (!normalized) {
    return normalized;
  }

  normalized.union = {
    ...normalized.union,
    name: "EU",
    official_name: "Europaeische Union",
    capital: "Bruessel",
    largest_city: "Berlin",
    population: "452.162.974 (2026)",
    states_count: "27",
    currency: "EUR",
    language: "24",
  };

  return normalized;
}

async function loadWorldFacts() {
  const raw = await fetchJson("world-facts.json", null);
  const normalized = normalizeEuropeFacts(raw);
  if (!normalized) {
    return normalized;
  }

  normalized.union = {
    ...normalized.union,
    name: "UN",
    official_name: "Vereinte Nationen",
    largest_city: "Jakarta (41.9m, 2025)",
    founded: "1945",
    member_states: "193",
    secretary_general: "Antonio Guterres",
  };

  return normalized;
}

function getFactsImagePath(type, stateId) {
  if (type === "country") {
    return "https://flagcdn.com/de.svg";
  }

  if (type === "state" && isNonEmptyValue(stateId)) {
    if (FACTS_STATE_IMAGE_OVERRIDES[stateId]) {
      return FACTS_STATE_IMAGE_OVERRIDES[stateId];
    }

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
      "",
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
      "",
      EUROPE_FLAG_IMAGE,
    [
      [t("facts.fields.capital"), translateFactScalar(unionData.capital)],
      [t("facts.fields.anthem"), unionData.anthem],
      [t("facts.fields.founded"), unionData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(unionData.state_form)],
      [t("facts.fields.nationalDay"), unionData.national_day],
      [t("facts.fields.population"), unionData.population],
      [t("facts.fields.area"), unionData.area_km2],
      [t("facts.fields.statesCount"), unionData.states_count],
      [t("facts.fields.currency"), translateFactScalar(unionData.currency)],
      [t("facts.fields.officialLanguages"), unionData.language],
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

function renderWorldOverview(unionData) {
  renderFactsView(
      t("facts.names.world"),
      "",
      unionData.flag_image || "",
    [
      [t("facts.fields.headquarters"), unionData.headquarters],
      [t("facts.fields.founded"), unionData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(unionData.state_form)],
      [t("facts.fields.nationalDay"), unionData.national_day],
      [t("facts.fields.memberStates"), unionData.member_states],
      [t("facts.fields.officialLanguages"), translateFactScalar(unionData.language)],
      [t("facts.fields.secretaryGeneral"), unionData.secretary_general],
      {
        label: t("facts.featured.worldOverview"),
        value: buildWorldOverview(unionData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.institutions"), translateFactList(unionData.institutions)],
      [t("facts.lists.highlights"), translateFactList(unionData.highlights)],
      [t("facts.lists.nature"), translateFactList(unionData.nature)],
      [t("facts.lists.seas"), translateFactList(unionData.neighboring_countries)],
      ],
      "",
      OFFICIAL_LINKS.world
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
        label: t("facts.featured.overview"),
        value: buildStateOverview(stateData),
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
      "",
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
        label: t("facts.featured.overview"),
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

function renderWorldCountryFacts(countryData) {
  renderFactsView(
      getLocalizedCountryNameById(countryData.id, countryData.name || "Land"),
      "",
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
        label: t("facts.featured.overview"),
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
  const isWorldMode = factsMode === "world" || factsMode === "world-country";
  factsCountryBtn.classList.toggle("active", isGermanyMode);
  factsStatesBtn.classList.toggle("active", isEuropeMode);
  factsWorldBtn.classList.toggle("active", isWorldMode);
}

function updateStatePickerVisibility() {
  const showGermanyPicker = (factsMode === "germany" || factsMode === "state") && Boolean(germanyFacts);
  const showEuropePicker = (factsMode === "europe" || factsMode === "europe-country") && Boolean(europeFacts);
  const showWorldPicker = (factsMode === "world" || factsMode === "world-country") && Boolean(worldFacts);
  statePickerWrap.classList.toggle("is-open", showGermanyPicker || showEuropePicker || showWorldPicker);
}

function buildFactsPicker() {
  statePickerEl.innerHTML = "";

  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const isWorldMode = factsMode === "world" || factsMode === "world-country";
  const items = isGermanyMode
    ? (germanyFacts?.states || []).map((state) => ({
        id: state.id,
        label: state.name,
        flagSrc: getFactsImagePath("state", state.id),
        active: state.id === selectedStateId,
        ariaLabel: t("facts.picker.stateButton", { name: state.name }),
        onClick: () => {
          factsMode = "state";
          selectedStateId = state.id;
          renderFactsSelection();
          scrollFactsContentIntoView();
        },
      }))
    : isWorldMode
    ? (worldFacts?.countries || []).map((country) => ({
        id: country.id,
        label: getLocalizedCountryNameById(country.id, country.name),
        flagSrc: country.flag_image || "",
        active: country.id === selectedWorldCountryId,
        ariaLabel: t("facts.picker.countryButton", {
          name: getLocalizedCountryNameById(country.id, country.name),
        }),
        onClick: () => {
          factsMode = "world-country";
          selectedWorldCountryId = country.id;
          renderFactsSelection();
          scrollFactsContentIntoView();
        },
      }))
    : (europeFacts?.countries || []).map((country) => ({
        id: country.id,
        label: getLocalizedCountryNameById(country.id, country.name),
        flagSrc: country.flag_image || "",
        active: country.id === selectedEuropeCountryId,
        ariaLabel: t("facts.picker.countryButton", {
          name: getLocalizedCountryNameById(country.id, country.name),
        }),
        onClick: () => {
          factsMode = "europe-country";
          selectedEuropeCountryId = country.id;
          renderFactsSelection();
          scrollFactsContentIntoView();
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
    if (item.flagSrc) {
      button.classList.add("has-flag");

      const copy = document.createElement("span");
      copy.className = "state-picker-btn-copy";

      const flag = document.createElement("img");
      flag.className = "state-picker-btn-flag";
      flag.src = item.flagSrc;
      flag.alt = "";
      flag.loading = "lazy";
      flag.decoding = "async";
      flag.addEventListener("error", () => {
        flag.hidden = true;
        button.classList.remove("has-flag");
      });

      const label = document.createElement("span");
      label.className = "state-picker-btn-label";
      label.textContent = item.label;

      copy.appendChild(flag);
      copy.appendChild(label);
      button.appendChild(copy);
    } else {
      button.textContent = item.label;
    }
    button.classList.toggle("active", item.active);
    button.setAttribute("aria-pressed", String(item.active));
    button.setAttribute("aria-label", item.ariaLabel);
    button.addEventListener("click", item.onClick);
    statePickerEl.appendChild(button);
  });
}

function renderFactsSelection() {
  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const isWorldMode = factsMode === "world" || factsMode === "world-country";

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
  } else if (isWorldMode) {
    if (!worldFacts) {
      renderFactsError();
      return;
    }

    const activeCountry = worldFacts.countries.find((country) => country.id === selectedWorldCountryId) || null;
    if (factsMode === "world-country" && activeCountry) {
      renderWorldCountryFacts(activeCountry);
    } else {
      renderWorldOverview(worldFacts.union);
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

function scrollFactsContentIntoView() {
  scheduleFactsScroll(() =>
    factsContentEl?.querySelector(".facts-view-head, .facts-error, .facts-view") ||
    factsContentEl ||
    factsPanelEl
  );
}

function shouldScrollFactsTargetIntoView(targetEl, offset = 10) {
  if (!targetEl) {
    return false;
  }

  const rect = targetEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportHeight <= 0) {
    return true;
  }

  return rect.top < offset || rect.top > viewportHeight - offset;
}

function scheduleFactsScroll(resolveTarget, offset = 10) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetEl = typeof resolveTarget === "function" ? resolveTarget() : resolveTarget;
      if (!targetEl || !shouldScrollFactsTargetIntoView(targetEl, offset)) {
        return;
      }

      const targetTop = Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - offset);
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  });
}

function scrollFactsPanelTopIntoView() {
  scheduleFactsScroll(factsPanelEl);
}

function initFactsPanel() {
  updateFactsModeButtons();
  updateStatePickerVisibility();

  factsCountryBtn.addEventListener("click", () => {
    factsMode = "germany";
    selectedStateId = null;
    renderFactsSelection();
    scrollFactsPanelTopIntoView();
  });

  factsStatesBtn.addEventListener("click", () => {
    if (!europeFacts || !europeFacts.countries.length) {
      renderFactsError();
      return;
    }

    factsMode = "europe";
    selectedEuropeCountryId = null;
    renderFactsSelection();
    scrollFactsPanelTopIntoView();
  });

  factsWorldBtn.addEventListener("click", () => {
    if (!worldFacts || !worldFacts.countries.length) {
      renderFactsError();
      return;
    }

    factsMode = "world";
    selectedWorldCountryId = null;
    renderFactsSelection();
    scrollFactsPanelTopIntoView();
  });

  if (!germanyFacts && !europeFacts && !worldFacts) {
    factsCountryBtn.disabled = true;
    factsStatesBtn.disabled = true;
    factsWorldBtn.disabled = true;
    renderFactsError();
    return;
  }

  if (!germanyFacts && europeFacts) {
    factsMode = "europe";
  }

  if (!germanyFacts && !europeFacts && worldFacts) {
    factsMode = "world";
  }

  if (germanyFacts && !europeFacts) {
    factsStatesBtn.disabled = true;
  }

  if (!worldFacts) {
    factsWorldBtn.disabled = true;
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

function getHintRevealStep() {
  if (difficulty === "easy") {
    return 3;
  }
  if (difficulty === "medium") {
    return 2;
  }
  return 1;
}

function getHintRevealValue(target, typed) {
  const nextLength = Math.min(target.length, getCorrectPrefixLength(target, typed) + getHintRevealStep());
  return target.slice(0, nextLength);
}

function getGuideSeparatorKind(char) {
  if (char === " ") {
    return "space";
  }
  return null;
}

function isGuideSeparatorChar(char) {
  return getGuideSeparatorKind(char) !== null;
}

function getGuideSeparatorLabel(char, { overflow = false } = {}) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return t(overflow ? "messages.guide.extraSeparator" : "messages.guide.separator");
  }

  return char;
}

function getGuideSeparatorSymbol(char) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return "";
  }

  return char;
}

function getGuideStatusForSeparator(char, word, total) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return t("messages.guide.statusSpace", { word, total });
  }

  return "";
}

function getGuideTokens(target) {
  const tokens = [];
  let wordStart = -1;

  for (let index = 0; index < target.length; index += 1) {
    const char = target[index];

    if (isGuideSeparatorChar(char)) {
      if (wordStart !== -1) {
        tokens.push({
          type: "word",
          start: wordStart,
          end: index,
          text: target.slice(wordStart, index),
        });
        wordStart = -1;
      }

      tokens.push({
        type: "separator",
        start: index,
        end: index + 1,
        char,
        kind: getGuideSeparatorKind(char),
      });
      continue;
    }

    if (wordStart === -1) {
      wordStart = index;
    }
  }

  if (wordStart !== -1) {
    tokens.push({
      type: "word",
      start: wordStart,
      end: target.length,
      text: target.slice(wordStart),
    });
  }

  return tokens;
}

function getGuideWordTokens(target) {
  return getGuideTokens(target)
    .filter((token) => token.type === "word")
    .map((token, index) => ({
      ...token,
      wordNumber: index + 1,
    }));
}

function getGuideWordTokenAt(wordTokens, index) {
  for (const token of wordTokens) {
    if (index >= token.start && index < token.end) {
      return token;
    }
  }

  return null;
}

function getGuidePreviousWordToken(wordTokens, index) {
  let previous = null;

  for (const token of wordTokens) {
    if (token.start >= index) {
      break;
    }
    previous = token;
  }

  return previous;
}

function getCharMeta(target) {
  const hints = new Set();
  const autofill = new Set();
  const hintCountPerWord =
    difficulty === "easy" ? 3 :
    difficulty === "medium" ? 1 :
    0;

  getGuideWordTokens(target).forEach((wordToken) => {
    const word = wordToken.text;

    for (let i = 0; i < hintCountPerWord && i < word.length; i += 1) {
      hints.add(wordToken.start + i);
    }

    let tail = wordToken.end - 1;
    while (tail > wordToken.start && AUTOFILL_TRAILING_PUNCT.test(target[tail])) {
      autofill.add(tail);
      tail -= 1;
    }
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
        const target = getTargetValue(sessionCards[sessionIndex]);
        buildWordGrid(target, inputEl.value);
        updateAnswerGuide(target, inputEl.value);
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

function getFreshWrongIndexes(target, previousTyped, currentTyped) {
  const freshIndexes = new Set();
  const maxLen = Math.max(previousTyped.length, currentTyped.length);

  for (let idx = 0; idx < maxLen; idx += 1) {
    const prevChar = previousTyped[idx];
    const currentChar = currentTyped[idx];
    const targetChar = target[idx];

    if (currentChar === undefined || targetChar === undefined) {
      continue;
    }

    const isWrong = currentChar.toLowerCase() !== targetChar.toLowerCase();
    if (!isWrong) {
      continue;
    }

    if (prevChar === undefined || currentChar !== prevChar || prevChar.toLowerCase() === targetChar.toLowerCase()) {
      freshIndexes.add(idx);
    }
  }

  return freshIndexes;
}

function getGuideProgress(target, typed) {
  const correctPrefixLen = getCorrectPrefixLength(target, typed);
  const wordTokens = getGuideWordTokens(target);
  const totalWords = Math.max(wordTokens.length, 1);
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
    const expectedChar = target[correctPrefixLen];
    const separatorStatus = getGuideStatusForSeparator(
      expectedChar,
      getGuidePreviousWordToken(wordTokens, correctPrefixLen)?.wordNumber || 1,
      totalWords,
    );

    if (separatorStatus) {
      return {
        state: "error",
        statusText: separatorStatus,
        noteText: t("messages.guide.noteWrong")
      };
    }

    const currentWordToken =
      getGuideWordTokenAt(wordTokens, correctPrefixLen) ||
      getGuidePreviousWordToken(wordTokens, correctPrefixLen) ||
      wordTokens[0];

    return {
      state: "error",
      statusText: t("messages.guide.statusWrong", {
        word: currentWordToken?.wordNumber || 1,
        total: totalWords,
        char: currentWordToken ? (correctPrefixLen - currentWordToken.start + 1) : 1,
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

  const nextChar = target[correctPrefixLen];
  const separatorStatus = getGuideStatusForSeparator(
    nextChar,
    getGuidePreviousWordToken(wordTokens, correctPrefixLen)?.wordNumber || 1,
    totalWords,
  );

  if (separatorStatus) {
    return {
      state: "progress",
      statusText: separatorStatus,
      noteText: ""
    };
  }

  const currentWordToken =
    getGuideWordTokenAt(wordTokens, correctPrefixLen) ||
    wordTokens[wordTokens.length - 1] ||
    null;

  return {
    state: "progress",
    statusText: t("messages.guide.statusProgress", {
      word: currentWordToken?.wordNumber || 1,
      total: totalWords,
      char: currentWordToken ? (correctPrefixLen - currentWordToken.start + 1) : 1,
      length: currentWordToken?.text.length || 1,
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

function playAnswerGuideCompleteHit() {
  if (!answerGuideEl) {
    return;
  }

  clearTimeout(answerGuideCompleteTimer);
  answerGuideEl.classList.remove("is-complete-hit");
  void answerGuideEl.offsetWidth;
  answerGuideEl.classList.add("is-complete-hit");
  answerGuideCompleteTimer = setTimeout(() => {
    answerGuideEl.classList.remove("is-complete-hit");
  }, 360);
}

function updateAnswerTerminalStatus(target, typed, terminalHit = null) {
  if (!answerTerminalStatusRowEl || !answerTerminalStatusEl) {
    return;
  }

  const showTerminalStatus = Boolean(target) && typed.length >= target.length;
  answerTerminalStatusRowEl.classList.toggle("is-visible", showTerminalStatus);
  answerTerminalStatusEl.className = "answer-terminal-status-badge";

  if (!showTerminalStatus) {
    answerTerminalStatusEl.textContent = "";
    return;
  }

  const terminalStatusKind = isExactTypedMatch(target, typed) ? "success" : "error";
  answerTerminalStatusEl.classList.add("is-visible", `is-${terminalStatusKind}`);

  if (terminalHit && terminalHit === terminalStatusKind) {
    answerTerminalStatusEl.classList.add(`is-hit-${terminalHit}`);
  }

  answerTerminalStatusEl.textContent = terminalStatusKind === "success" ? "\u2665" : "\u2715";
}

function isExactTypedMatch(target, typed) {
  return typed.length === target.length && getCorrectPrefixLength(target, typed) === target.length;
}

function ensureFeedbackBurstPieces(count) {
  if (!feedbackBurstEl) {
    return [];
  }

  while (feedbackBurstPieces.length < count) {
    const piece = document.createElement("span");
    piece.className = "burst-piece";
    piece.hidden = true;
    feedbackBurstEl.appendChild(piece);
    feedbackBurstPieces.push(piece);
  }

  return feedbackBurstPieces;
}

function getFeedbackBurstSymbols(kind, isBig) {
  if (kind === "success") {
    return isBig ? FEEDBACK_BURST_SYMBOLS.success.big : FEEDBACK_BURST_SYMBOLS.success.small;
  }

  return FEEDBACK_BURST_SYMBOLS.error;
}

function resetFeedbackBurstPieces() {
  feedbackBurstPieces.forEach((piece) => {
    piece.hidden = true;
    piece.textContent = "";
    piece.style.animation = "none";
  });
}

function showFeedbackBurst(kind, isBig = false) {
  if (!feedbackBurstEl) {
    return;
  }

  clearTimeout(feedbackBurstTimer);
  feedbackBurstEl.className = `feedback-burst is-${kind}${isBig ? " is-big" : ""}`;

  const pieces = getFeedbackBurstSymbols(kind, isBig);
  const baseDistance = isBig ? 164 : 116;
  const distanceJitter = isBig ? 42 : 30;
  const startAngle = getSecureRandomRange(0, 359);
  const angleStep = 360 / Math.max(pieces.length, 1);
  const midpointPull = kind === "success" ? (isBig ? 20 : 14) : 8;
  const burstPieces = ensureFeedbackBurstPieces(pieces.length);

  burstPieces.forEach((piece, index) => {
    piece.hidden = true;
    piece.style.animation = "none";
    if (index >= pieces.length) {
      piece.textContent = "";
      return;
    }

    const symbol = pieces[index];
    const angleDegrees = startAngle + (angleStep * index) + getSecureRandomRange(-12, 12);
    const angle = angleDegrees * (Math.PI / 180);
    const distance = baseDistance + getSecureRandomRange(-distanceJitter, distanceJitter);
    const dx = Math.round(Math.cos(angle) * distance);
    const dy = Math.round(Math.sin(angle) * distance);
    const mx = Math.round(dx * 0.52);
    const my = Math.round(dy * 0.4 - midpointPull);

    piece.textContent = symbol;
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    const rotation = getSecureRandomRange(-44, 44);
    piece.style.setProperty("--mx", `${mx}px`);
    piece.style.setProperty("--my", `${my}px`);
    piece.style.setProperty("--rot-mid", `${Math.round(rotation * 0.45)}deg`);
    piece.style.setProperty("--rot", `${rotation}deg`);
    piece.style.animationDelay = `${index * 18}ms`;
    piece.hidden = false;
  });

  void feedbackBurstEl.offsetWidth;
  burstPieces.forEach((piece, index) => {
    if (index < pieces.length) {
      piece.style.animation = "";
    }
  });

  feedbackBurstTimer = setTimeout(() => {
    resetFeedbackBurstPieces();
    feedbackBurstEl.className = "feedback-burst";
  }, isBig ? 980 : 760);
}

function buildWordGrid(
  target,
  typed,
  {
    freshCorrectIndexes = new Set(),
    freshWrongIndexes = new Set(),
    terminalHit = null,
  } = {}
) {
  wordGrid.innerHTML = "";
  const { hints, autofill } = getCharMeta(target);
  const correctPrefixLen = getCorrectPrefixLength(target, typed);
  const caretIndex = typed.length;
  const showTerminalStatus = target.length > 0 && caretIndex >= target.length;
  const terminalStatusKind = showTerminalStatus && isExactTypedMatch(target, typed)
    ? "success"
    : "error";
  const tokens = getGuideTokens(target);

  tokens.forEach((token) => {
    if (token.type === "separator") {
      const separator = document.createElement("div");
      const letter = document.createElement("div");
      const line = document.createElement("div");
      const typedSeparator = typed[token.start];
      const separatorLabel = getGuideSeparatorLabel(token.char);

      separator.className = "word-separator wchar";
      separator.dataset.separatorKind = token.kind;
      separator.classList.add(`is-${token.kind}`);
      separator.setAttribute("aria-label", separatorLabel);
      separator.setAttribute("title", separatorLabel);

      letter.className = "word-separator-letter wchar-letter";
      line.className = "word-separator-line wchar-line";
      letter.textContent =
        typedSeparator !== undefined && typedSeparator !== token.char
          ? "x"
          : getGuideSeparatorSymbol(token.char);
      separator.appendChild(letter);
      separator.appendChild(line);

      if (typedSeparator !== undefined) {
        separator.classList.add(typedSeparator === token.char ? "state-ok" : "state-bad");
      } else if (token.start === correctPrefixLen) {
        separator.classList.add("state-next");
      }

      if (freshCorrectIndexes.has(token.start)) {
        separator.classList.add("state-hit");
      }

      if (freshWrongIndexes.has(token.start)) {
        separator.classList.add("state-miss");
      }

      if (token.start === caretIndex) {
        separator.classList.add("state-caret");
      }

      if (!showTerminalStatus && token.end === caretIndex && caretIndex === target.length) {
        separator.classList.add("state-caret-after");
      }

      wordGrid.appendChild(separator);
      return;
    }

    const group = document.createElement("div");
    group.className = "word-group";

    for (let idx = token.start; idx < token.end; idx += 1) {
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
        const isCorrectChar = typedChar.toLowerCase() === targetChar.toLowerCase();
        letter.textContent = isCorrectChar ? targetChar : "x";
        wrap.classList.add(isCorrectChar ? "state-ok" : "state-bad");
        if (freshCorrectIndexes.has(idx)) {
          wrap.classList.add("state-hit");
        }
        if (freshWrongIndexes.has(idx)) {
          wrap.classList.add("state-miss");
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

      if (idx === caretIndex) {
        wrap.classList.add("state-caret");
      }

      if (!showTerminalStatus && idx + 1 === caretIndex && caretIndex === target.length) {
        wrap.classList.add("state-caret-after");
      }

      wrap.appendChild(letter);
      wrap.appendChild(line);
      group.appendChild(wrap);
    }

    wordGrid.appendChild(group);
  });

  if (typed.length > target.length) {
    typed.slice(target.length).split("").forEach((extraChar) => {
      if (isGuideSeparatorChar(extraChar)) {
        const extraSeparator = document.createElement("div");
        const letter = document.createElement("div");
        const line = document.createElement("div");
        const separatorLabel = getGuideSeparatorLabel(extraChar, { overflow: true });
        extraSeparator.className = "word-separator wchar state-bad is-overflow";
        extraSeparator.dataset.separatorKind = getGuideSeparatorKind(extraChar);
        extraSeparator.classList.add(`is-${getGuideSeparatorKind(extraChar)}`);
        extraSeparator.setAttribute("aria-label", separatorLabel);
        extraSeparator.setAttribute("title", separatorLabel);
        letter.className = "word-separator-letter wchar-letter";
        line.className = "word-separator-line wchar-line";
        letter.textContent = "x";
        extraSeparator.appendChild(letter);
        extraSeparator.appendChild(line);
        wordGrid.appendChild(extraSeparator);
        return;
      }

      const overflowWrap = document.createElement("div");
      const overflowLetter = document.createElement("div");
      const overflowLine = document.createElement("div");

      overflowWrap.className = "wchar state-bad";
      overflowLetter.className = "wchar-letter";
      overflowLine.className = "wchar-line";
      overflowLetter.textContent = "x";
      overflowWrap.appendChild(overflowLetter);
      overflowWrap.appendChild(overflowLine);
      wordGrid.appendChild(overflowWrap);
    });
  }

  if (showTerminalStatus) {
    const terminalStatus = document.createElement("div");
    terminalStatus.className = `answer-guide-terminal-status is-${terminalStatusKind}`;
    if (terminalHit && terminalHit === terminalStatusKind) {
      terminalStatus.classList.add(`is-hit-${terminalHit}`);
    }
    terminalStatus.textContent = terminalStatusKind === "success" ? "♥" : "×";
    terminalStatus.setAttribute("aria-hidden", "true");
    wordGrid.appendChild(terminalStatus);
  } else if (caretIndex > target.length || !target.length) {
    const endCaret = document.createElement("div");
    endCaret.className = "answer-guide-inline-caret";
    endCaret.setAttribute("aria-hidden", "true");
    wordGrid.appendChild(endCaret);
  }

  answerGuideSizingState.target = String(target ?? "");
  answerGuideSizingState.typed = String(typed ?? "");
  scheduleAnswerGuideMeasure("build-word-grid");
  updateAnswerTerminalStatus(target, typed, terminalHit);
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

function resetSessionProgress() {
  sessionIndex = 0;
  streak = 0;
  bestStreak = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  skippedCount = 0;
  totalCharsTyped = 0;
  sessionStart = Date.now();
  sessionSkipCounts = new WeakMap();
}

function clearSessionUi() {
  setGameSurfaceMode(false);
  inputEl.value = "";
  inputEl.className = "";
  previousTypedValue = "";
  clearTimeout(answerGuideCompleteTimer);
  answerGuideEl?.classList.remove("is-complete-hit");
  forceCorrection = false;
  progFill.style.width = "0%";
  renderCardBadge(null);
  updateSearchLinks(null);
  buildWordGrid("", "");
  updateSkipCardButtonState();
}

async function loadCriticalCardsWithRetry() {
  if (allCards.length) {
    return allCards;
  }

  await new Promise((resolve) => window.setTimeout(resolve, 120));
  const retriedBundledCards = await fetchJson("cards.json", []);
  bundledCards = Array.isArray(retriedBundledCards)
    ? retriedBundledCards.map(sanitizeCard).filter(Boolean)
    : [];
  allCards = mergeCards(bundledCards, persistentCards, sessionOnlyCards);
  buildTopicPanel();
  return allCards;
}

async function recoverPlayableSession(reason = "unknown", requestedSize = SESSION_SIZE) {
  const recoveryNonce = ++sessionRecoveryNonce;
  const nextSessionSize = resolveSessionSize(requestedSize, sessionCards.length || SESSION_SIZE);
  clearSessionUi();

  const currentCard = sessionCards[sessionIndex];
  if (isRenderableCard(currentCard)) {
    loadCard({ allowRecovery: false });
    return true;
  }

  const rebuildSessionFromCards = (cards) => {
    const renderablePool = getRenderablePool(cards);
    if (!renderablePool.length) {
      return false;
    }

    sessionCards = shuffle(renderablePool).slice(0, Math.min(nextSessionSize, renderablePool.length));
    resetSessionProgress();
    updateStats();
    loadCard({ allowRecovery: false });
    return true;
  };

  if (rebuildSessionFromCards(getPool())) {
    return true;
  }

  if (selectedTopics !== null) {
    selectedTopics = null;
    buildTopicPanel();
    if (rebuildSessionFromCards(getPool())) {
      return true;
    }
  }

  await loadCriticalCardsWithRetry();
  if (recoveryNonce !== sessionRecoveryNonce) {
    return false;
  }

  if (rebuildSessionFromCards(getPool())) {
    return true;
  }

  sessionCards = [EMERGENCY_FALLBACK_CARD];
  resetSessionProgress();
  updateStats();
  loadCard({ allowRecovery: false });
  return false;
}

async function startSession(size) {
  const renderablePool = getRenderablePool(getPool());
  const count = resolveSessionSize(size);

  if (renderablePool.length) {
    sessionCards = shuffle(renderablePool).slice(0, Math.min(count, renderablePool.length));
    resetSessionProgress();
    updateStats();
    loadCard();
  } else {
    await recoverPlayableSession("start-session", count);
  }

  const scrollTarget = heroStageEl || mainCard;
  scrollTarget.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function loadCard(options = {}) {
  const { focusInput = true, allowRecovery = true } = options;
  const card = sessionCards[sessionIndex];
  if (!isRenderableCard(card)) {
    if (allowRecovery) {
      void recoverPlayableSession("load-card", sessionCards.length || SESSION_SIZE);
    }
    return;
  }

  clearSessionUi();
  renderPrompt(card);
  progFill.style.width = `${(sessionIndex / sessionCards.length) * 100}%`;

  renderCardBadge(card);
  updateSkipCardButtonState();

  mainCard.classList.add("active");
  buildWordGrid(getTargetValue(card), "");
  updateSearchLinks(card);

  if (focusInput) {
    focusAnswerInputWithoutScroll();
  }
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
  if (!installGuideBrowserEl || !installGuideStepsEl) {
    return;
  }

  const context = detectInstallGuideContext();
  const localizedPath = t(`installGuide.paths.${context.installPathKey}`);
  const resolvedPath = localizedPath === `installGuide.paths.${context.installPathKey}`
    ? t("installGuide.paths.default")
    : localizedPath;
  const browserText = `${context.browserLabel}: ${resolvedPath}`;
  const stepsText = t("installGuide.cta");

  installGuideBrowserEl.textContent = browserText;
  installGuideStepsEl.textContent = stepsText;
  renderPhoneInstallGuide(browserText, stepsText);
}

function setDesktopInstallGuideShellVisible(isVisible) {
  siteTitleRowEl?.classList.toggle("has-install-guides", isVisible);
}

function setInstallGuidePillVisible(element, isVisible) {
  element?.classList.toggle("is-hidden", !isVisible);
}

function measureInstallGuidePillFits(element) {
  if (!element || !element.parentElement) {
    return false;
  }

  const panel = element.parentElement;
  if (panel.classList.contains("is-hidden")) {
    return false;
  }

  if (element.clientWidth <= 0 || element.clientHeight <= 0) {
    return false;
  }

  return element.scrollHeight <= element.clientHeight + 1;
}

function cancelInstallGuideLayoutFrame() {
  if (!installGuideLayoutFrame) {
    return;
  }

  window.cancelAnimationFrame(installGuideLayoutFrame);
  installGuideLayoutFrame = 0;
}

function finalizeDesktopInstallGuideLayout() {
  installGuideLayoutFrame = 0;

  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !installGuideBrowserEl || !installGuideStepsEl || !phoneGuideBarEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  phoneGuideBarEl.classList.add("is-hidden");

  const browserFits = measureInstallGuidePillFits(installGuideBrowserEl);
  const stepsFits = measureInstallGuidePillFits(installGuideStepsEl);

  setInstallGuidePillVisible(installGuideBrowserPanelEl, browserFits);
  setInstallGuidePillVisible(installGuidePanelEl, stepsFits);
  setDesktopInstallGuideShellVisible(browserFits || stepsFits);
}

function applyInstallGuideLayout() {
  installGuideLayoutFrame = 0;

  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !phoneGuideBarEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  renderInstallGuide();

  phoneGuideBarEl.classList.add("is-hidden");
  setDesktopInstallGuideShellVisible(true);
  setInstallGuidePillVisible(installGuideBrowserPanelEl, true);
  setInstallGuidePillVisible(installGuidePanelEl, true);

  installGuideLayoutFrame = window.requestAnimationFrame(finalizeDesktopInstallGuideLayout);
}

function scheduleInstallGuideLayout() {
  cancelInstallGuideLayoutFrame();
  installGuideLayoutFrame = window.requestAnimationFrame(applyInstallGuideLayout);
}

function hideInstallGuide() {
  cancelInstallGuideLayoutFrame();
  setDesktopInstallGuideShellVisible(false);
  setInstallGuidePillVisible(installGuideBrowserPanelEl, false);
  setInstallGuidePillVisible(installGuidePanelEl, false);
  phoneGuideBarEl?.classList.add("is-hidden");
}

function maybeShowInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !phoneGuideBarEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  scheduleInstallGuideLayout();
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
  setGameSurfaceMode(true);
  updateSkipCardButtonState();

  const pct = Math.round((totalCorrect / sessionCards.length) * 100);
  document.getElementById("finalScore").textContent = `${pct}%`;

  const secs = Math.round((Date.now() - sessionStart) / 1000);
  const wpm = secs > 0 ? Math.round((totalCharsTyped / 5) / (secs / 60)) : 0;
  document.getElementById("finalDetails").textContent =
    t("messages.session.finalDetails", {
      correct: totalCorrect,
      total: sessionCards.length,
      skipped: skippedCount,
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
  buildTopicPanel();
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
    topic: addCardTopicEl.value,
    subcategory: addCardSubcategoryEl.value,
    scope: addCardScopeEl.value,
    de: addCardDeEl.value,
    hr: addCardHrEl.value,
    en: addCardEnEl.value,
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
    fillAuthoringSelects();
    addCardTopicEl.value = TOPIC_OPTIONS[0];
    addCardSubcategoryEl.value = SUBCATEGORY_OPTIONS[0];
    addCardScopeEl.value = CARD_SCOPE_OPTIONS[0];
    showToast(t("messages.toasts.cardSaved"));
  } catch (error) {
    setAuthoringFeedback(error.message || t("messages.authoring.saveFailed"), true);
  } finally {
    setAuthoringBusy(false);
  }
}

function initAuthoringForm() {
  fillAuthoringSelects();
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
  sessionSizeSliderEl?.addEventListener("input", syncSessionSizeLabel);
  newGameBtn?.addEventListener("click", () => {
    startSession(getRequestedSessionSize());
  });
  restartBtnEl?.addEventListener("click", () => {
    startSession(getRequestedSessionSize());
  });

  languageDockButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchLearningMode(button.dataset.lang);
    });
  });

  if (skipCardBtnEl) {
    skipCardBtnEl.addEventListener("click", () => {
      skipCurrentCard();
    });
  }

  [promptPrimaryFlagEl, promptSecondaryFlagEl].forEach((button) => {
    button?.addEventListener("click", () => {
      togglePromptOrder();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!shouldCaptureTypingForAnswer(event)) {
      return;
    }

    event.preventDefault();
    focusAnswerInputAtEnd();
    insertTextIntoAnswerInput(event.key);
  });

  gameArea?.addEventListener("click", (event) => {
    if (!shouldTapFocusAnswerInput(event.target)) {
      return;
    }

    focusAnswerInputAtEnd();
  });

  inputEl.addEventListener("input", () => {
    if (!sessionCards.length) {
      return;
    }

    if (!isRenderableCard(sessionCards[sessionIndex])) {
      void recoverPlayableSession("input-invalid-card", sessionCards.length || SESSION_SIZE);
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    const typedValue = inputEl.value;
    const previousPrefix = getCorrectPrefixLength(target, previousTypedValue);
    const currentPrefix = getCorrectPrefixLength(target, typedValue);
    const previousExact = isExactTypedMatch(target, previousTypedValue);
    const currentExact = isExactTypedMatch(target, typedValue);
    const previousAtOrPastEnd = previousTypedValue.length >= target.length;
    const currentAtOrPastEnd = typedValue.length >= target.length;
    const reachedTerminalSuccess = !previousExact && currentExact;
    const reachedTerminalError = currentAtOrPastEnd && !currentExact && (!previousAtOrPastEnd || previousExact);
    const freshCorrectIndexes = getFreshCorrectIndexes(
      target,
      previousTypedValue,
      typedValue
    );
    const freshWrongIndexes = getFreshWrongIndexes(
      target,
      previousTypedValue,
      typedValue
    );

    buildWordGrid(target, typedValue, {
      freshCorrectIndexes,
      freshWrongIndexes,
      terminalHit:
        reachedTerminalSuccess ? "success" :
        reachedTerminalError ? "error" :
        null,
    });

    if (reachedTerminalSuccess) {
      playAnswerGuideCompleteHit();
      showFeedbackBurst("success", false);
    } else if (
      reachedTerminalError ||
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

    if (!isRenderableCard(sessionCards[sessionIndex])) {
      void recoverPlayableSession("hint-invalid-card", sessionCards.length || SESSION_SIZE);
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    const reveal = getHintRevealValue(target, inputEl.value);
    inputEl.value = reveal;
    buildWordGrid(target, reveal, {
      terminalHit: isExactTypedMatch(target, reveal) ? "success" : null,
    });
    if (isExactTypedMatch(target, reveal)) {
      playAnswerGuideCompleteHit();
    }
    previousTypedValue = reveal;
    focusAnswerInputAtEnd();
  });

  inputEl.addEventListener("touchstart", activateTouchInputWithoutScroll, { passive: false });

  inputEl.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      activateTouchInputWithoutScroll(event);
    }
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !sessionCards.length) {
      return;
    }

    const card = sessionCards[sessionIndex];
    if (!isRenderableCard(card)) {
      void recoverPlayableSession("submit-invalid-card", sessionCards.length || SESSION_SIZE);
      return;
    }
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
  syncSessionSizeLabel();
  learningMode = loadLearningMode();
  isPromptOrderSwapped = loadPromptOrderPreference();
  const [loadedLocales, baseCards, loadedPersistentCards, currentCapabilities, loadedFacts, loadedEuropeFacts, loadedWorldFacts] = await Promise.all([
    loadLocales(),
    fetchJson("cards.json", []),
    fetchJson("cards.user.json", []),
    detectCapabilities(),
    loadGermanyFacts(),
    loadEuropeFacts(),
    loadWorldFacts(),
  ]);

  locales = loadedLocales || {};
  applyLearningTheme();
  renderStaticUi();
  createFlagColumns();
  initInstallGuide();
  initDifficultyControls();
  initInputEvents();
  initAuthoringForm();
  capabilities = currentCapabilities;
  germanyFacts = loadedFacts;
  europeFacts = loadedEuropeFacts;
  worldFacts = loadedWorldFacts;
  bundledCards = Array.isArray(baseCards)
    ? baseCards.map(sanitizeCard).filter(Boolean)
    : [];
  persistentCards = Array.isArray(loadedPersistentCards)
    ? loadedPersistentCards.map(sanitizeCard).filter(Boolean)
    : [];
  sessionOnlyCards = capabilities.persistentSave ? [] : loadSessionCards();
  allCards = mergeCards(bundledCards, persistentCards, sessionOnlyCards);

  renderAuthoringMode();
  initFactsPanel();
  renderStaticUi();
  buildTopicPanel();
  hasBootstrappedApp = true;
  await recoverPlayableSession("init-app", SESSION_SIZE);
}

window.startSession = startSession;
initViewportProfile();
initAppLoader();
initApp()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    hideAppLoader();
  });
