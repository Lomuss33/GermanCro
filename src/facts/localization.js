import { joinLocalizedList } from "../core/text.js";

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
  Wien: { de: "Wien", hr: "Beč", en: "Vienna" },
};

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

export function isNonEmptyFactValue(value) {
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

export function normalizeFactLookupKey(value) {
  return String(value || "")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export function lookupFactMap(map, value) {
  if (!map || !value) {
    return null;
  }
  return map[value] || map[normalizeFactLookupKey(value)] || null;
}

export function createFactsTranslator({ t, getLocale, getLocaleBundle }) {
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

  function getEuropeanStateForm(countryId, fallback = "") {
    const forms = EUROPE_STATE_FORMS[countryId];
    if (!forms) {
      return translateFactScalar(fallback);
    }
    return forms[{ de: 0, hr: 1, en: 2 }[getLocale()] ?? 0];
  }

  function getWorldStateForm(countryId, fallback = "") {
    const forms = WORLD_STATE_FORMS[countryId];
    if (!forms) {
      return translateFactScalar(fallback);
    }
    return forms[{ de: 0, hr: 1, en: 2 }[getLocale()] ?? 0];
  }

  function getLocalizedFactsOverview(factsData) {
    if (!factsData || !isNonEmptyFactValue(factsData.overview)) {
      return "";
    }

    const localizedOverview = factsData[`overview_${getLocale()}`];
    return isNonEmptyFactValue(localizedOverview)
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
      institutionSeats: translateFactScalar(unionData.institution_seats),
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

  return {
    getLocalizedCountryNameById,
    translateFactScalar,
    translateFactList,
    getEuropeanStateForm,
    getWorldStateForm,
    buildGermanyOverview,
    buildEuropeOverview,
    buildWorldOverview,
    buildStateOverview,
    buildCountryOverview,
  };
}
