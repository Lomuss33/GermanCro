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
import { prefersReducedEffects } from "../ui/effects-preference.js";
import { createFactsTranslator, isNonEmptyFactValue } from "./localization.js";
import { createFactsViewRenderer, getStateFlagPath } from "./view-renderer.js";

function waitForIdleTurn() {
  return new Promise((resolve) => {
    if (typeof window.scheduler?.postTask === "function") {
      window.scheduler.postTask(resolve, { priority: "background" }).catch(resolve);
      return;
    }
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: 900 });
      return;
    }
    window.setTimeout(resolve, 16);
  });
}

export function createFactsController({ t, getLocale, getLocaleBundle, getTargetLanguage }) {
  let germanyFacts = null;
  let europeFacts = null;
  let worldFacts = null;

  let germanyLoadPromise = null;
  let europeLoadPromise = null;
  let worldLoadPromise = null;
  let factsLoadPromise = null;
  let factsLoaded = false;

  let factsMode = "germany";
  let selectedStateId = null;
  let selectedEuropeCountryId = null;
  let selectedWorldCountryId = null;

  let factsPickerRenderKey = "";
  const factsPickerButtons = new Map();

  const translator = createFactsTranslator({ t, getLocale, getLocaleBundle });
  const { getLocalizedCountryNameById } = translator;

  const viewRenderer = createFactsViewRenderer({
    t,
    getLocale,
    translator,
    getGermanyAreaKm2: () => germanyFacts?.country?.area_km2,
  });

  function normalizeFactsCollection(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const country = raw.country && typeof raw.country === "object" ? raw.country : null;
    const states = Array.isArray(raw.states) ? raw.states.filter((state) => state && typeof state === "object") : [];

    if (!country || !isNonEmptyFactValue(country.name) || states.length === 0) {
      return null;
    }

    const validStates = states.filter((state) => isNonEmptyFactValue(state.id) && isNonEmptyFactValue(state.name));
    if (!validStates.length) {
      return null;
    }

    return {
      country,
      states: validStates,
    };
  }

  function normalizeEuropeFacts(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const union = raw.union && typeof raw.union === "object" ? raw.union : null;
    const countries = Array.isArray(raw.countries)
      ? raw.countries.filter((country) => country && typeof country === "object")
      : [];

    if (!union || !isNonEmptyFactValue(union.name) || !countries.length) {
      return null;
    }

    const validCountries = countries.filter((country) => isNonEmptyFactValue(country.id) && isNonEmptyFactValue(country.name));
    if (!validCountries.length) {
      return null;
    }

    return {
      union,
      countries: validCountries,
    };
  }

  function loadGermanyFacts() {
    if (!germanyLoadPromise) {
      germanyLoadPromise = fetchJson("germany-facts.json", null).then((raw) => {
        germanyFacts = normalizeFactsCollection(raw);
        return germanyFacts;
      });
    }
    return germanyLoadPromise;
  }

  function loadEuropeFacts() {
    if (!europeLoadPromise) {
      europeLoadPromise = fetchJson("europe-facts.json", null).then((raw) => {
        const normalized = normalizeEuropeFacts(raw);
        if (normalized) {
          normalized.union = {
            ...normalized.union,
            name: "EU",
            official_name: "Europaeische Union",
            largest_city: "Berlin",
            states_count: "27",
            currency: "EUR",
            language: "24",
          };
        }
        europeFacts = normalized;
        return europeFacts;
      });
    }
    return europeLoadPromise;
  }

  function loadWorldFacts() {
    if (!worldLoadPromise) {
      worldLoadPromise = fetchJson("world-facts.json", null).then((raw) => {
        const normalized = normalizeEuropeFacts(raw);
        if (normalized) {
          normalized.union = {
            ...normalized.union,
            name: "UN",
            official_name: "Vereinte Nationen",
            largest_city: "Jakarta (41.9m, 2025)",
            founded: "1945",
            member_states: "193",
            secretary_general: "Antonio Guterres",
          };
        }
        worldFacts = normalized;
        return worldFacts;
      });
    }
    return worldLoadPromise;
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
        const label = document.createElement("span");
        label.className = "state-picker-btn-label";
        label.textContent = item.label;
        button.appendChild(label);
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
        viewRenderer.renderFactsError();
        return;
      }

      const activeState = germanyFacts.states.find((state) => state.id === selectedStateId) || null;
      if (factsMode === "state" && activeState) {
        viewRenderer.renderStateFacts(activeState, germanyFacts.country);
      } else {
        viewRenderer.renderCountryFacts(germanyFacts.country);
      }
    } else if (isWorldMode) {
      if (!worldFacts) {
        viewRenderer.renderFactsError();
        return;
      }

      const activeCountry = worldFacts.countries.find((country) => country.id === selectedWorldCountryId) || null;
      if (factsMode === "world-country" && activeCountry) {
        viewRenderer.renderWorldCountryFacts(activeCountry);
      } else {
        viewRenderer.renderWorldOverview(worldFacts.union);
      }
    } else {
      if (!europeFacts) {
        viewRenderer.renderFactsError();
        return;
      }

      const activeCountry = europeFacts.countries.find((country) => country.id === selectedEuropeCountryId) || null;
      if (factsMode === "europe-country" && activeCountry) {
        viewRenderer.renderEuropeanCountryFacts(activeCountry);
      } else {
        viewRenderer.renderEuropeOverview(europeFacts.union);
      }
    }

    updateFactsModeButtons();
    buildFactsPicker();
    updateStatePickerVisibility();
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
        window.scrollTo({ top: targetTop, behavior: prefersReducedEffects() ? "instant" : "smooth" });
      });
    });
  }

  function scrollFactsContentIntoView() {
    scheduleFactsScroll(() =>
      factsContentEl?.querySelector(".facts-view-head, .facts-error, .facts-view") ||
      factsContentEl ||
      factsPanelEl
    );
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
      viewRenderer.renderFactsError();
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
      factsLoadPromise = (async () => {
        await waitForIdleTurn();
        await loadGermanyFacts();
        refreshFactsPanelData();

        await waitForIdleTurn();
        await loadEuropeFacts();
        if (factsMode === "europe" || factsMode === "europe-country") {
          refreshFactsPanelData();
        }

        await waitForIdleTurn();
        await loadWorldFacts();
        factsLoaded = true;
        refreshFactsPanelData();
      })();
    }
    await factsLoadPromise;
  }

  function initFactsPanel() {
    factsCountryBtn.addEventListener("click", async () => {
      await loadGermanyFacts();
      factsMode = "germany";
      selectedStateId = null;
      renderFactsSelection();
      scrollFactsPanelTopIntoView();
    });

    factsStatesBtn.addEventListener("click", async () => {
      await loadEuropeFacts();
      if (!europeFacts || !europeFacts.countries.length) {
        viewRenderer.renderFactsError();
        return;
      }

      factsMode = "europe";
      selectedEuropeCountryId = null;
      renderFactsSelection();
      scrollFactsPanelTopIntoView();
    });

    factsWorldBtn.addEventListener("click", async () => {
      await loadWorldFacts();
      if (!worldFacts || !worldFacts.countries.length) {
        viewRenderer.renderFactsError();
        return;
      }

      factsMode = "world";
      selectedWorldCountryId = null;
      renderFactsSelection();
      scrollFactsPanelTopIntoView();
    });

    refreshFactsPanelData();
    // Start staged background warmup outside the critical bootstrap Promise:
    // Germany loads first in an idle turn, followed by Europe and World between frames.
    void loadFactsOnDemand();
  }

  return {
    init: initFactsPanel,
    render: renderFactsSelection,
    load: loadFactsOnDemand,
    get isLoaded() {
      return Boolean(germanyFacts || factsLoaded);
    },
  };
}
