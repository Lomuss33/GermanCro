import { COUNTRY_NOTABLE_PEOPLE } from "./notable-people.js";
import { summarizeTimeZone } from "./time-zone.js";
import { factFieldSearchQuery, factListSearchQuery } from "./search-query.js";
import { createNumericalInsights, factsInsightCopy, getPlaceContext } from "./insights.js";
import {
  FACTS_IMAGE_ROOT,
  FACTS_STATE_IMAGE_OVERRIDES,
  TOURISM_LINKS,
  OFFICIAL_LINKS,
  EUROPE_FLAG_IMAGE,
  STATE_NOTABLE_PEOPLE,
} from "./config.js";
import { factsContentEl } from "../ui/dom.js";
import { isNonEmptyFactValue } from "./localization.js";

export function getStateFlagPath(stateId) {
  return isNonEmptyFactValue(stateId) ? `${FACTS_IMAGE_ROOT}/states/${stateId}.webp` : "";
}

export function getFactsImagePath(type, stateId) {
  if (type === "country") {
    return "https://flagcdn.com/de.svg";
  }

  if (type === "state" && isNonEmptyFactValue(stateId)) {
    if (FACTS_STATE_IMAGE_OVERRIDES[stateId]) {
      return FACTS_STATE_IMAGE_OVERRIDES[stateId];
    }

    return `${FACTS_IMAGE_ROOT}/states/${stateId}.webp`;
  }

  return "";
}

export function createFactsViewRenderer({ t, getLocale, translator, getGermanyAreaKm2 }) {
  let countryTitleObserver = null;
  let lastFactsPaletteHue = -1;

  const {
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
  } = translator;

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

  function selectAvailableFactsFields(fields) {
    const seenLabels = new Set();
    return fields.filter((field) => {
      const normalized = normalizeFactsField(field);
      if (!normalized || normalized.featured || !isNonEmptyFactValue(normalized.value) || seenLabels.has(normalized.label)) {
        return false;
      }
      seenLabels.add(normalized.label);
      return true;
    });
  }

  function createFactsField(field, contextName = "") {
    const normalized = normalizeFactsField(field);
    if (!normalized) {
      return null;
    }

    const { label, value, featured } = normalized;
    if (!isNonEmptyFactValue(value)) {
      return null;
    }

    const unavailable = Array.isArray(field) && field[3] === true;
    const card = document.createElement(featured || unavailable ? "div" : "a");
    card.className = "facts-card";
    if (!featured && String(value).length > 38) {
      card.classList.add("facts-card--dense");
    }
    if (!featured && String(value).length > 64) {
      card.classList.add("facts-card--very-dense");
    }
    if (unavailable) {
      card.classList.add("facts-card--unavailable");
    }
    if (featured) {
      card.classList.add("featured");
    } else if (!unavailable) {
      const locale = getLocale();
      const comparisonPlace = label === factsInsightCopy(locale).size
        ? { de: "Deutschland", en: "Germany", hr: "Njemačka" }[locale] || "Deutschland"
        : "";
      const searchTerm = factFieldSearchQuery(contextName, label, comparisonPlace);
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
      .filter((item) => isNonEmptyFactValue(item))
      .forEach((item) => {
        const itemText = String(item);
        const searchTerm = factListSearchQuery(contextName, label, itemText);
        const chip = document.createElement("a");
        chip.className = "facts-chip facts-chip-link";
        chip.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
        chip.target = "_blank";
        chip.rel = "noopener noreferrer";
        const chipLabel = document.createElement("span");
        chipLabel.className = "facts-chip-label";
        chipLabel.textContent = itemText;
        chip.appendChild(chipLabel);
        chip.title = t("facts.values.googleSearchAria", { item: searchTerm });
        chip.setAttribute("aria-label", t("facts.values.googleSearchAria", { item: searchTerm }));
        list.appendChild(chip);
      });

    if (!list.children.length) {
      return null;
    }
    list.dataset.count = String(list.children.length);

    section.appendChild(title);
    section.appendChild(list);
    return section;
  }

  function getNotablePeopleLists(notablePeople = {}) {
    return [
      [t("facts.lists.science"), notablePeople.science, "people-science"],
      [t("facts.lists.engineering"), notablePeople.engineering, "people-engineering"],
      [t("facts.lists.art"), notablePeople.art, "people-art"],
      [t("facts.lists.politics"), notablePeople.politics, "people-politics"],
    ];
  }

  function getStatePeopleLists(stateId) {
    return getNotablePeopleLists(STATE_NOTABLE_PEOPLE[stateId]);
  }

  function getCountryPeopleLists(countryId) {
    return getNotablePeopleLists(COUNTRY_NOTABLE_PEOPLE[countryId]);
  }

  function createNotablePeopleSection(groups, contextName) {
    const peopleGroups = groups
      .map(([label, values, variant]) => ({ label, variant, values: Array.isArray(values) ? values.filter(isNonEmptyFactValue) : [] }))
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
    peopleGroups.forEach(({ label, variant, values }) => {
      const group = createFactsList(label, values, variant, contextName);
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

  function splitCountryTitle(title) {
    const text = String(title ?? "").trim();
    if (text === "Deutschland") return ["Deutsch", "land"];

    const words = text.split(/\s+/);
    if (words.length > 1) {
      let bestIndex = 1;
      let bestDistance = Infinity;
      for (let index = 1; index < words.length; index += 1) {
        const distance = Math.abs(words.slice(0, index).join(" ").length - text.length / 2);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
      return [words.slice(0, bestIndex).join(" "), words.slice(bestIndex).join(" ")];
    }

    const letters = Array.from(text);
    const midpoint = Math.ceil(letters.length / 2);
    return [letters.slice(0, midpoint).join(""), letters.slice(midpoint).join("")];
  }

  function renderFactsView(title, subtitle, imageSrc, fields, lists, tourismUrl = "", officialUrl = "", notablePeople = [], place = {}) {
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

    if (isNonEmptyFactValue(imageSrc)) {
      flagEl.src = imageSrc;
    } else {
      flagWrap.classList.add("is-fallback");
      flagEl.hidden = true;
    }

    flagWrap.appendChild(flagEl);

    const titleCopy = document.createElement("div");
    titleCopy.className = "facts-title-copy";

    const titleBar = document.createElement("div");
    titleBar.className = "facts-title-bar";

    const nameEl = document.createElement("div");
    nameEl.className = "facts-view-name";
    const [leftTitle, rightTitle] = splitCountryTitle(title);
    const leftTitleEl = document.createElement("span");
    leftTitleEl.className = "facts-view-name-half facts-view-name-half--left";
    leftTitleEl.setAttribute("aria-hidden", "true");
    leftTitleEl.textContent = leftTitle;
    const rightTitleEl = document.createElement("span");
    rightTitleEl.className = "facts-view-name-half facts-view-name-half--right";
    rightTitleEl.setAttribute("aria-hidden", "true");
    rightTitleEl.textContent = rightTitle;
    const accessibleTitleEl = document.createElement("span");
    accessibleTitleEl.className = "visually-hidden";
    accessibleTitleEl.textContent = title;
    nameEl.append(leftTitleEl, flagWrap, rightTitleEl, accessibleTitleEl);
    titleBar.appendChild(nameEl);

    if (isNonEmptyFactValue(tourismUrl) || isNonEmptyFactValue(officialUrl)) {
      const linksEl = document.createElement("div");
      linksEl.className = "facts-title-links";

      if (isNonEmptyFactValue(tourismUrl)) {
        const tourismEl = document.createElement("a");
        tourismEl.className = "facts-title-link facts-title-link--tourism";
        tourismEl.href = tourismUrl;
        tourismEl.target = "_blank";
        tourismEl.rel = "noopener noreferrer";
        tourismEl.textContent = t("facts.links.tourism");
        tourismEl.setAttribute("aria-label", t("facts.values.tourismAria", { name: title }));
        linksEl.appendChild(tourismEl);
      }

      if (isNonEmptyFactValue(officialUrl)) {
        if (isNonEmptyFactValue(tourismUrl)) {
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

    if (isNonEmptyFactValue(subtitle)) {
      const subtitleEl = document.createElement("div");
      subtitleEl.className = "facts-view-subtitle";
      subtitleEl.textContent = String(subtitle);
      titleCopy.appendChild(subtitleEl);
    }

    titleRow.appendChild(titleCopy);
    head.appendChild(titleRow);
    view.appendChild(head);

    const locale = getLocale();
    const copy = factsInsightCopy(locale);
    const context = getPlaceContext(place.kind, place.id, locale);
    if (context.length) {
      const strip = document.createElement("div");
      strip.className = "facts-context-strip";
      strip.setAttribute("aria-label", copy.context);
      context.forEach(({ label, url }) => {
        const chip = document.createElement(url ? "a" : "span");
        chip.className = "facts-context-chip";
        chip.textContent = label;
        if (url) {
          chip.href = url;
          chip.target = "_blank";
          chip.rel = "noopener noreferrer";
        }
        strip.appendChild(chip);
      });
      view.appendChild(strip);
    }

    const grid = document.createElement("div");
    grid.className = "facts-grid";
    const orderedFields = selectAvailableFactsFields(fields);
    const addField = (fieldData) => {
      if (normalizeFactsField(fieldData)?.featured) {
        return;
      }
      const field = createFactsField(fieldData, title);
      if (field) grid.appendChild(field);
    };
    orderedFields.forEach(addField);
    if (place.population && place.area) {
      createNumericalInsights(place.population, place.area, getGermanyAreaKm2(), locale)
        .forEach(addField);
    }

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

    const peopleSection = createNotablePeopleSection(notablePeople, title);
    if (peopleSection) {
      view.appendChild(peopleSection);
    }

    factsContentEl.appendChild(view);

    countryTitleObserver?.disconnect();
    const titleMeasureContext = document.createElement("canvas").getContext("2d");
    const syncCountryTitleLayout = () => {
      if (!nameEl.isConnected) return;
      const nameStyle = window.getComputedStyle(nameEl);
      if (!titleMeasureContext || !nameEl.clientWidth) return;

      const maxFontSize = Math.min(Number.parseFloat(nameStyle.fontSize) || 24, 24);
      titleMeasureContext.font = `${nameStyle.fontStyle} ${nameStyle.fontWeight} ${maxFontSize}px ${nameStyle.fontFamily}`;
      const letterSpacing = Number.parseFloat(nameStyle.letterSpacing) || 0;
      const titleLength = Array.from(String(title)).length;
      const titleWidth = titleMeasureContext.measureText(String(title)).width + Math.max(0, titleLength - 1) * letterSpacing;
      const leftWidth = titleMeasureContext.measureText(leftTitle).width + Math.max(0, Array.from(leftTitle).length - 1) * letterSpacing;
      const rightWidth = titleMeasureContext.measureText(rightTitle).width + Math.max(0, Array.from(rightTitle).length - 1) * letterSpacing;
      const horizontalPadding = (Number.parseFloat(nameStyle.paddingLeft) || 0) + (Number.parseFloat(nameStyle.paddingRight) || 0);
      const flagWidth = flagWrap.getBoundingClientRect().width;
      const columnGap = Number.parseFloat(nameStyle.columnGap) || 0;
      const sideWidth = (nameEl.clientWidth - horizontalPadding - flagWidth - columnGap * 2) / 2;
      const showFullName = sideWidth >= titleWidth + 8;
      const splitTextWidth = Math.max(leftWidth, rightWidth);
      const splitFontSize = Math.min(maxFontSize, maxFontSize * Math.max(0, sideWidth - 4) / Math.max(1, splitTextWidth));

      nameEl.classList.toggle("is-full-name-sides", showFullName);
      nameEl.style.setProperty("--facts-title-half-size", `${showFullName ? maxFontSize : splitFontSize}px`);
      leftTitleEl.textContent = showFullName ? title : leftTitle;
      rightTitleEl.textContent = showFullName ? title : rightTitle;
    };

    if (typeof ResizeObserver === "function") {
      countryTitleObserver = new ResizeObserver(syncCountryTitleLayout);
      countryTitleObserver.observe(nameEl);
    }
    syncCountryTitleLayout();
    document.fonts?.ready.then(syncCountryTitleLayout);
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
        [t("facts.fields.timeZone"), summarizeTimeZone(countryData.time_zone)],
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
      getCountryPeopleLists("germany"),
      { kind: "germany", id: "germany", population: countryData.population, area: countryData.area_km2 }
    );
  }

  function renderEuropeOverview(unionData) {
    renderFactsView(
      t("facts.names.europe"),
      "",
      EUROPE_FLAG_IMAGE,
      [
        [t("facts.fields.institutionSeats"), translateFactScalar(unionData.institution_seats)],
        [t("facts.fields.anthem"), unionData.anthem],
        [t("facts.fields.founded"), unionData.founded],
        [t("facts.fields.organizationType"), translateFactScalar(unionData.state_form)],
        [t("facts.fields.europeDay"), unionData.national_day],
        [t("facts.fields.population"), unionData.population],
        [t("facts.fields.area"), unionData.area_km2],
        [t("facts.fields.euMemberStates"), unionData.states_count],
        [t("facts.fields.currency"), translateFactScalar(unionData.currency)],
        [t("facts.fields.euroAreaMembers"), `${unionData.euro_area_members}/${unionData.states_count}`],
        [t("facts.fields.officialLanguages"), unionData.language],
        [t("facts.fields.timeZone"), summarizeTimeZone(unionData.time_zone)],
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
      getCountryPeopleLists("europe"),
      { kind: "eu" }
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
        [t("facts.fields.organizationType"), translateFactScalar(unionData.state_form)],
        [t("facts.fields.unDay"), unionData.national_day],
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
      getCountryPeopleLists("world"),
      { kind: "world" }
    );
  }

  function renderStateFacts(stateData, parentCountry = {}) {
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
        [t("facts.fields.currency"), translateFactScalar(parentCountry.currency)],
        [t("facts.fields.language"), translateFactScalar(parentCountry.language)],
        [t("facts.fields.timeZone"), summarizeTimeZone(parentCountry.time_zone)],
        [t("facts.fields.callingCode"), parentCountry.calling_code],
        [t("facts.fields.internetTld"), parentCountry.internet_tld],
        [t("facts.fields.bordersCount"), Array.isArray(stateData.bordering_countries) ? stateData.bordering_countries.length : 0],
        [t("facts.fields.joined"), stateData.joined_or_founded],
        [t("facts.fields.parliament"), stateData.parliament],
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
      getStatePeopleLists(stateData.id),
      { kind: "state", id: stateData.id, population: stateData.population, area: stateData.area_km2 }
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
        [t("facts.fields.timeZone"), summarizeTimeZone(countryData.time_zone)],
        [t("facts.fields.callingCode"), countryData.calling_code],
        [t("facts.fields.internetTld"), countryData.internet_tld],
        [countryData.id === "england" ? t("facts.fields.neighboringPartsCount") : t("facts.fields.bordersCount"), Array.isArray(countryData.neighboring_countries) ? countryData.neighboring_countries.length : undefined],
        [t("facts.fields.landlocked"), translateFactScalar(countryData.landlocked)],
        {
          label: t("facts.featured.overview"),
          value: buildCountryOverview(countryData),
          featured: true,
        },
      ],
      [
        [countryData.id === "england" ? t("facts.lists.neighboringParts") : t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries), "neighbors"],
        [t("facts.lists.languages"), translateFactList(countryData.languages_list)],
        [t("facts.lists.timezones"), countryData.timezones_list],
      ],
      TOURISM_LINKS.countries[countryData.id] || "",
      OFFICIAL_LINKS.countries[countryData.id] || "",
      getCountryPeopleLists(countryData.id),
      { kind: "country", id: countryData.id, population: countryData.population, area: countryData.area_km2 }
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
        [t("facts.fields.timeZone"), summarizeTimeZone(countryData.time_zone)],
        [t("facts.fields.callingCode"), countryData.calling_code],
        [t("facts.fields.internetTld"), countryData.internet_tld],
        [t("facts.fields.bordersCount"), Array.isArray(countryData.neighboring_countries) ? countryData.neighboring_countries.length : undefined],
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
      getCountryPeopleLists(countryData.id),
      { kind: "country", id: countryData.id, population: countryData.population, area: countryData.area_km2 }
    );
  }

  function renderFactsError() {
    factsContentEl.innerHTML = "";
    const error = document.createElement("div");
    error.className = "facts-error";
    error.textContent = t("facts.errors.loadFailed");
    factsContentEl.appendChild(error);
  }

  return {
    renderCountryFacts,
    renderEuropeOverview,
    renderWorldOverview,
    renderStateFacts,
    renderEuropeanCountryFacts,
    renderWorldCountryFacts,
    renderFactsError,
  };
}
