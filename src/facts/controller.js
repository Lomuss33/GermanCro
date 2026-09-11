import { COUNTRY_NOTABLE_PEOPLE } from "./notable-people.js";
import {
  FACTS_IMAGE_ROOT,
  FACTS_STATE_IMAGE_OVERRIDES,
  TOURISM_LINKS,
  OFFICIAL_LINKS,
  EUROPE_FLAG_IMAGE,
  STATE_NOTABLE_PEOPLE,
} from "./config.js";
import {
  factsContentEl,
  factsCountryBtn,
  factsPanelEl,
  factsStatesBtn,
  factsWorldBtn,
  statePickerEl,
  statePickerWrap,
} from "../ui/dom.js";
import { fetchJson } from "../core/http.js";
import { joinLocalizedList } from "../core/text.js";

export function createFactsController({ t, getLocale, getLocaleBundle, getTargetLanguage }) {
  let germanyFacts = null;

  let europeFacts = null;

  let worldFacts = null;

  let factsLoadPromise = null;

  let factsLoaded = false;

  let factsMode = "germany";

  let selectedStateId = null;

  let selectedEuropeCountryId = null;

  let selectedWorldCountryId = null;

  let factsPickerRenderKey = "";

  const factsPickerButtons = new Map();

  let lastFactsPaletteHue = -1;

  function getRandomFactsPalette(colorCount = 3) {
    let hue = Math.floor(Math.random() * 360);
    if (lastFactsPaletteHue >= 0 && Math.abs(hue - lastFactsPaletteHue) < 42) {
      hue = (hue + 137) % 360;
    }
    lastFactsPaletteHue = hue;
    return Array.from({ length: colorCount }, (_, index) =>
      `hsl(${(hue + index * 137) % 360} ${96 - (index % 3) * 2}% ${62 + (index % 2) * 3}%)`
    );
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

  const EUROPE_STATE_FORMS = Object.freeze({
    frankreich: ["Semipräsidentielle Republik", "polupredsjednička republika", "semi-presidential republic"],
    spanien: ["Parlamentarische Monarchie", "parlamentarna monarhija", "parliamentary monarchy"],
    england: ["Teil des Vereinigten Königreichs", "dio Ujedinjenog Kraljevstva", "part of the United Kingdom"],
    schweden: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    polen: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    oesterreich: ["Bundesstaatliche parlamentarische Republik", "savezna parlamentarna republika", "federal parliamentary republic"],
    ungarn: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    kroatien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    "bosnien-herzegowina": ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    serbien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    nordmazedonien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    albanien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    griechenland: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    bulgarien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    tuerkei: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    rumaenien: ["Semipräsidentielle Republik", "polupredsjednička republika", "semi-presidential republic"],
    ukraine: ["Semipräsidentielle Republik", "polupredsjednička republika", "semi-presidential republic"],
    russland: ["Föderale semipräsidentielle Republik", "savezna polupredsjednička republika", "federal semi-presidential republic"],
    weissrussland: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    tschechien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    slowakei: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    slowenien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    italien: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    niederlande: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    belgien: ["Föderale konstitutionelle Monarchie", "savezna ustavna monarhija", "federal constitutional monarchy"],
    daenemark: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    finnland: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    norwegen: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    irland: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    schweiz: ["Föderale direktoriale Republik", "savezna direktorialna republika", "federal directorial republic"],
    vatikanstadt: ["Wahlmonarchie", "izborna monarhija", "elective monarchy"],
    portugal: ["Semipräsidentielle Republik", "polupredsjednička republika", "semi-presidential republic"],
    montenegro: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    luxemburg: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    liechtenstein: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    andorra: ["Parlamentarisches Kofürstentum", "parlamentarna suvladavina knezova", "parliamentary co-principality"],
  });

  function getEuropeanStateForm(countryId, fallback = "") {
    const forms = EUROPE_STATE_FORMS[countryId];
    if (!forms) {
      return translateFactScalar(fallback);
    }
    return forms[{ de: 0, hr: 1, en: 2 }[getLocale()] ?? 0];
  }

  const WORLD_STATE_FORMS = Object.freeze({
    kanada: ["Föderale parlamentarische konstitutionelle Monarchie", "savezna parlamentarna ustavna monarhija", "federal parliamentary constitutional monarchy"],
    usa: ["Föderale präsidentielle Republik", "savezna predsjednička republika", "federal presidential republic"],
    china: ["Kommunistisch geführter Staat", "država pod vodstvom Komunističke partije", "communist party-led state"],
    brasilien: ["Föderale präsidentielle Republik", "savezna predsjednička republika", "federal presidential republic"],
    australien: ["Föderale parlamentarische konstitutionelle Monarchie", "savezna parlamentarna ustavna monarhija", "federal parliamentary constitutional monarchy"],
    indien: ["Föderale parlamentarische Republik", "savezna parlamentarna republika", "federal parliamentary republic"],
    argentinien: ["Föderale präsidentielle Republik", "savezna predsjednička republika", "federal presidential republic"],
    algerien: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    "dr-kongo": ["Semipräsidentielle Republik", "polupredsjednička republika", "semi-presidential republic"],
    "saudi-arabien": ["Absolute Monarchie", "apsolutna monarhija", "absolute monarchy"],
    mexiko: ["Föderale präsidentielle Republik", "savezna predsjednička republika", "federal presidential republic"],
    indonesien: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    sudan: ["Militärisch geführte Übergangsregierung", "vojno vođena prijelazna vlada", "military-led transitional government"],
    libyen: ["Übergangsregierung", "prijelazna vlada", "transitional government"],
    iran: ["Theokratische Republik", "teokratska republika", "theocratic republic"],
    mongolei: ["Semipräsidentielle Republik", "polupredsjednička republika", "semi-presidential republic"],
    japan: ["Parlamentarische konstitutionelle Monarchie", "parlamentarna ustavna monarhija", "parliamentary constitutional monarchy"],
    suedkorea: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    pakistan: ["Föderale parlamentarische Republik", "savezna parlamentarna republika", "federal parliamentary republic"],
    bangladesch: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    nigeria: ["Föderale präsidentielle Republik", "savezna predsjednička republika", "federal presidential republic"],
    aethiopien: ["Föderale parlamentarische Republik", "savezna parlamentarna republika", "federal parliamentary republic"],
    aegypten: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    suedafrika: ["Parlamentarische Republik", "parlamentarna republika", "parliamentary republic"],
    kasachstan: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    peru: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    kolumbien: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    chile: ["Präsidentielle Republik", "predsjednička republika", "presidential republic"],
    venezuela: ["Föderale präsidentielle Republik", "savezna predsjednička republika", "federal presidential republic"],
    neuseeland: ["Parlamentarische konstitutionelle Monarchie", "parlamentarna ustavna monarhija", "parliamentary constitutional monarchy"],
    thailand: ["Konstitutionelle Monarchie", "ustavna monarhija", "constitutional monarchy"],
    vietnam: ["Kommunistisch geführter Staat", "država pod vodstvom Komunističke partije", "communist party-led state"],
  });

  function getWorldStateForm(countryId, fallback = "") {
    const forms = WORLD_STATE_FORMS[countryId];
    if (!forms) {
      return translateFactScalar(fallback);
    }
    return forms[{ de: 0, hr: 1, en: 2 }[getLocale()] ?? 0];
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

  function getLocalizedFactsOverview(factsData) {
    if (!factsData || !isNonEmptyValue(factsData.overview)) {
      return "";
    }

    const localizedOverview = factsData[`overview_${getLocale()}`];
    return isNonEmptyValue(localizedOverview)
      ? String(localizedOverview)
      : String(factsData.overview);
  }

  function buildGermanyOverview(countryData) {
    return getLocalizedFactsOverview(countryData) || t("facts.values.germanyOverviewText");
  }

  function buildEuropeOverview(unionData) {
    const overview = getLocalizedFactsOverview(unionData);
    if (overview) {
      return overview;
    }

    return t("facts.values.europeOverviewText", {
      memberStates: unionData.states_count,
      capital: translateFactScalar(unionData.capital),
      institutions: joinLocalizedList(translateFactList(unionData.institutions)),
    });
  }

  function buildWorldOverview(unionData) {
    const overview = getLocalizedFactsOverview(unionData);
    if (overview) {
      return overview;
    }

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
    const overview = getLocalizedFactsOverview(stateData);
    if (overview) {
      return overview;
    }

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
    const overview = getLocalizedFactsOverview(countryData);
    if (overview) {
      return overview;
    }

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

  function getStateFlagPath(stateId) {
    return isNonEmptyValue(stateId) ? `${FACTS_IMAGE_ROOT}/states/${stateId}.webp` : "";
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

  function getFactsSearchTerm(label, value, contextName = "") {
    const valueText = String(value ?? "").trim();
    const isNumericValue = valueText !== "" && (/^\d/.test(valueText) || /^[\d\s.,%+\-€$£]+$/.test(valueText));
    return [label, isNumericValue ? "" : valueText, contextName]
      .filter(isNonEmptyValue)
      .join(" ");
  }

  function createFactsField(field, contextName = "") {
    const normalized = normalizeFactsField(field);
    if (!normalized) {
      return null;
    }

    const { label, value, featured } = normalized;
    if (!isNonEmptyValue(value)) {
      return null;
    }

    const card = document.createElement(featured ? "div" : "a");
    card.className = "facts-card";
    if (featured) {
      card.classList.add("featured");
    } else {
      const searchTerm = getFactsSearchTerm(label, value, contextName);
      card.classList.add("facts-card-link");
      card.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.title = t("facts.values.googleCardSearchAria", { search: searchTerm });
      card.setAttribute("aria-label", t("facts.values.googleCardSearchAria", { search: searchTerm }));
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

  function splitFactsOverviewSentences(value) {
    const protectedOrdinals = String(value || "")
      .trim()
      .replace(/\b(\d{1,2})\.(?=\s+\p{L})/gu, "$1\u0000");

    return protectedOrdinals
      .split(/(?<=[.!?])\s+(?=[\p{Lu}\p{N}])/u)
      .map((sentence) => sentence.replace(/\u0000/g, ".").trim())
      .filter(Boolean);
  }

  function createFactsList(label, items, variant = "", contextName = "") {
    if (!Array.isArray(items) || !items.length) {
      return null;
    }

    const section = document.createElement("section");
    section.className = "facts-list-section";
    if (variant) {
      section.classList.add(`facts-${variant}`);
    }

    const title = document.createElement("div");
    title.className = "facts-list-title";
    title.textContent = label;

    const list = document.createElement("div");
    list.className = "facts-chip-list";

    items
      .filter((item) => isNonEmptyValue(item))
      .forEach((item) => {
      const itemText = String(item);
      const searchTerm = ["neighbors", "borders"].includes(variant)
        ? `${itemText} border ${contextName}`.trim()
        : itemText;
        const chip = document.createElement("a");
        chip.className = "facts-chip facts-chip-link";
        chip.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
        chip.target = "_blank";
        chip.rel = "noopener noreferrer";
        chip.textContent = itemText;
        chip.title = t("facts.values.googleSearchAria", { item: searchTerm });
        chip.setAttribute("aria-label", t("facts.values.googleSearchAria", { item: searchTerm }));
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
    return getNotablePeopleLists(STATE_NOTABLE_PEOPLE[stateId]);
  }

  function getCountryPeopleLists(countryId) {
    return getNotablePeopleLists(COUNTRY_NOTABLE_PEOPLE[countryId]);
  }

  function getNotablePeopleLists(notablePeople = {}) {
    return [
      [t("facts.lists.science"), notablePeople.science, "people-science"],
      [t("facts.lists.engineering"), notablePeople.engineering, "people-engineering"],
      [t("facts.lists.art"), notablePeople.art, "people-art"],
      [t("facts.lists.politics"), notablePeople.politics, "people-politics"],
    ];
  }

  function createNotablePeopleSection(groups) {
    const peopleGroups = groups
      .map(([label, values, variant]) => ({ label, variant, values: Array.isArray(values) ? values.filter(isNonEmptyValue) : [] }))
      .filter(({ values }) => values.length);

    if (!peopleGroups.length) {
      return null;
    }

    const section = document.createElement("section");
    section.className = "facts-notable-people";

    const title = document.createElement("div");
    title.className = "facts-notable-people-title";
    title.textContent = t("facts.lists.notablePeople");
    section.appendChild(title);

    const groupsEl = document.createElement("div");
    groupsEl.className = "facts-notable-people-groups";
    peopleGroups.forEach(({ label, values }) => {
      const group = createFactsList(label, values, "", "");
      if (group) {
        group.classList.add("facts-notable-people-group");
        groupsEl.appendChild(group);
      }
    });

    if (!groupsEl.children.length) {
      return null;
    }

    section.appendChild(groupsEl);
    return section;
  }

  function renderFactsView(title, subtitle, imageSrc, fields, lists, tourismUrl = "", officialUrl = "", notablePeople = []) {
    factsContentEl.innerHTML = "";

    const view = document.createElement("div");
    view.className = "facts-view";
    const factsPalette = getRandomFactsPalette(Math.max(3, lists.length));
    view.style.setProperty("--facts-color-a", factsPalette[0]);
    view.style.setProperty("--facts-color-b", factsPalette[1]);
    view.style.setProperty("--facts-color-c", factsPalette[2]);

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
        tourismEl.className = "facts-title-link facts-title-link--tourism";
        tourismEl.href = tourismUrl;
        tourismEl.target = "_blank";
        tourismEl.rel = "noopener noreferrer";
        tourismEl.textContent = t("facts.links.tourism");
        tourismEl.setAttribute("aria-label", t("facts.values.tourismAria", { name: title }));
        linksEl.appendChild(tourismEl);
      }

      if (isNonEmptyValue(officialUrl)) {
        if (isNonEmptyValue(tourismUrl)) {
          const websitesLabelEl = document.createElement("span");
          websitesLabelEl.className = "facts-title-link-separator";
          websitesLabelEl.textContent = t("facts.links.websites");
          linksEl.appendChild(websitesLabelEl);
        }

        const officialEl = document.createElement("a");
        officialEl.className = "facts-title-link facts-title-link--official";
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

    const featuredFieldData = fields.find((fieldData) => normalizeFactsField(fieldData)?.featured);
    const featuredField = createFactsField(featuredFieldData);
    if (featuredField) {
      featuredField.classList.add("facts-head-overview");

      const overviewValueEl = featuredField.querySelector(".facts-card-value");
      const overviewSentences = splitFactsOverviewSentences(overviewValueEl?.textContent);
      if (overviewValueEl && overviewSentences.length > 1) {
        overviewValueEl.replaceChildren();
        overviewSentences.forEach((sentence) => {
          const sentenceEl = document.createElement("span");
          sentenceEl.className = "facts-overview-sentence";
          sentenceEl.textContent = sentence;
          overviewValueEl.appendChild(sentenceEl);
        });
      }

      titleCopy.appendChild(featuredField);
    }

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
    const stateFormLabel = t("facts.fields.stateForm");
    const orderedFields = [...fields].sort((left, right) => {
      const leftIsStateForm = normalizeFactsField(left)?.label === stateFormLabel;
      const rightIsStateForm = normalizeFactsField(right)?.label === stateFormLabel;
      return Number(leftIsStateForm) - Number(rightIsStateForm);
    });
    orderedFields.forEach((fieldData) => {
      if (normalizeFactsField(fieldData)?.featured) {
        return;
      }

      const field = createFactsField(fieldData, title);
      if (field) {
        grid.appendChild(field);
      }
    });

    if (grid.children.length) {
      view.appendChild(grid);
    }

    lists.forEach(([label, values, variant], listIndex) => {
      const list = createFactsList(label, values, variant, title);
      if (list) {
        list.style.setProperty("--list-accent", factsPalette[listIndex]);
        view.appendChild(list);
      }
    });

    const peopleSection = createNotablePeopleSection(notablePeople);
    if (peopleSection) {
      view.appendChild(peopleSection);
    }

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
        [t("facts.lists.nature"), translateFactList(countryData.nature)],
        [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries), "neighbors"],
        [t("facts.lists.highlights"), translateFactList(countryData.highlights)],
        ],
        TOURISM_LINKS.germany,
        OFFICIAL_LINKS.germany,
        getCountryPeopleLists("germany")
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
        ],
        "",
        "",
        getCountryPeopleLists("europe")
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
        OFFICIAL_LINKS.world,
        getCountryPeopleLists("world")
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
        [t("facts.lists.neighborStates"), translateFactList(stateData.neighboring_states), "neighbors"],
        [t("facts.lists.borders"), translateFactList(stateData.bordering_countries), "borders"],
        [t("facts.lists.knownFor"), translateFactList(stateData.known_for)],
        [t("facts.lists.nature"), translateFactList(stateData.nature)],
        ],
        TOURISM_LINKS.states[stateData.id] || "",
        OFFICIAL_LINKS.states[stateData.id] || "",
        getStatePeopleLists(stateData.id)
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
        [t("facts.fields.stateForm"), getEuropeanStateForm(countryData.id, countryData.state_form)],
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
        [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries), "neighbors"],
        [t("facts.lists.languages"), translateFactList(countryData.languages_list)],
        [t("facts.lists.timezones"), countryData.timezones_list],
        ],
        TOURISM_LINKS.countries[countryData.id] || "",
        OFFICIAL_LINKS.countries[countryData.id] || "",
        getCountryPeopleLists(countryData.id)
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
        [t("facts.fields.stateForm"), getWorldStateForm(countryData.id, countryData.state_form)],
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
        [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries), "neighbors"],
        [t("facts.lists.languages"), translateFactList(countryData.languages_list)],
        [t("facts.lists.timezones"), countryData.timezones_list],
        ],
        TOURISM_LINKS.countries[countryData.id] || "",
        OFFICIAL_LINKS.countries[countryData.id] || "",
        getCountryPeopleLists(countryData.id)
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

  function getFactsPickerMode() {
    if (factsMode === "germany" || factsMode === "state") {
      return "germany";
    }

    if (factsMode === "world" || factsMode === "world-country") {
      return "world";
    }

    return "europe";
  }

  function getFactsPickerItems() {
    const pickerMode = getFactsPickerMode();
    return pickerMode === "germany"
      ? (germanyFacts?.states || []).map((state) => ({
          id: state.id,
          label: state.name,
          flagSrc: getStateFlagPath(state.id),
          ariaLabel: t("facts.picker.stateButton", { name: state.name }),
          onClick: () => {
            factsMode = "state";
            selectedStateId = state.id;
            renderFactsSelection();
            scrollFactsContentIntoView();
          },
        }))
      : pickerMode === "world"
      ? (worldFacts?.countries || []).map((country) => ({
          id: country.id,
          label: getLocalizedCountryNameById(country.id, country.name),
          flagSrc: country.flag_image || "",
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
  }

  function getActiveFactsPickerId() {
    const pickerMode = getFactsPickerMode();
    if (pickerMode === "germany") {
      return selectedStateId;
    }
    if (pickerMode === "world") {
      return selectedWorldCountryId;
    }
    return selectedEuropeCountryId;
  }

  function updateFactsPickerSelection() {
    const activeId = getActiveFactsPickerId();
    factsPickerButtons.forEach((button, id) => {
      const isActive = id === activeId;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function buildFactsPicker() {
    const pickerMode = getFactsPickerMode();
    const items = getFactsPickerItems();
    const pickerKey = `${pickerMode}|${getTargetLanguage()}|${items.map((item) => item.id).join(",")}`;

    statePickerEl.dataset.pickerMode = pickerMode;

    statePickerEl.setAttribute(
      "aria-label",
      pickerMode === "germany" ? t("facts.picker.statesAria") : t("facts.picker.countriesAria")
    );

    if (factsPickerRenderKey === pickerKey && factsPickerButtons.size === items.length) {
      updateFactsPickerSelection();
      return;
    }

    factsPickerRenderKey = pickerKey;
    factsPickerButtons.clear();
    statePickerEl.innerHTML = "";

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
      button.setAttribute("aria-label", item.ariaLabel);
      button.addEventListener("click", item.onClick);
      factsPickerButtons.set(item.id, button);
      statePickerEl.appendChild(button);
    });

    updateFactsPickerSelection();
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

  function refreshFactsPanelData() {
    const hasGermanyFacts = Boolean(germanyFacts);
    const hasEuropeFacts = Boolean(europeFacts?.countries?.length);
    const hasWorldFacts = Boolean(worldFacts?.countries?.length);

    factsCountryBtn.disabled = factsLoaded && !hasGermanyFacts;
    factsStatesBtn.disabled = factsLoaded && !hasEuropeFacts;
    factsWorldBtn.disabled = factsLoaded && !hasWorldFacts;

    if (!hasGermanyFacts && !hasEuropeFacts && !hasWorldFacts) {
      updateFactsModeButtons();
      updateStatePickerVisibility();
      renderFactsError();
      return;
    }

    if (factsMode === "germany" && !hasGermanyFacts) {
      factsMode = hasEuropeFacts ? "europe" : "world";
    } else if (factsMode === "europe" && !hasEuropeFacts) {
      factsMode = hasGermanyFacts ? "germany" : "world";
    } else if (factsMode === "world" && !hasWorldFacts) {
      factsMode = hasGermanyFacts ? "germany" : "europe";
    }

    renderFactsSelection();
  }

  async function loadFactsOnDemand() {
    if (factsLoaded) {
      return;
    }
    if (!factsLoadPromise) {
      factsLoadPromise = Promise.all([
        loadGermanyFacts(),
        loadEuropeFacts(),
        loadWorldFacts(),
      ]).then(([loadedGermanyFacts, loadedEuropeFacts, loadedWorldFacts]) => {
        germanyFacts = loadedGermanyFacts;
        europeFacts = loadedEuropeFacts;
        worldFacts = loadedWorldFacts;
        factsLoaded = true;
        refreshFactsPanelData();
      });
    }
    await factsLoadPromise;
  }

  function initFactsPanel() {
    factsCountryBtn.addEventListener("click", async () => {
      await loadFactsOnDemand();
      factsMode = "germany";
      selectedStateId = null;
      renderFactsSelection();
      scrollFactsPanelTopIntoView();
    });

    factsStatesBtn.addEventListener("click", async () => {
      await loadFactsOnDemand();
      if (!europeFacts || !europeFacts.countries.length) {
        renderFactsError();
        return;
      }

      factsMode = "europe";
      selectedEuropeCountryId = null;
      renderFactsSelection();
      scrollFactsPanelTopIntoView();
    });

    factsWorldBtn.addEventListener("click", async () => {
      await loadFactsOnDemand();
      if (!worldFacts || !worldFacts.countries.length) {
        renderFactsError();
        return;
      }

      factsMode = "world";
      selectedWorldCountryId = null;
      renderFactsSelection();
      scrollFactsPanelTopIntoView();
    });

    refreshFactsPanelData();
    // Start this optional request during the loader's minimum display time.
    // It remains outside the critical bootstrap Promise, but normally settles
    // before a user can reach the facts panel.
    void loadFactsOnDemand();
  }

  return {
    init: initFactsPanel,
    render: renderFactsSelection,
    load: loadFactsOnDemand,
    get isLoaded() { return factsLoaded; },
  };
}
