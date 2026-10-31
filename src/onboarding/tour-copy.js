export const ONBOARDING_STORAGE_KEY = "germancro.onboarding.v2";

export const TOUR_STEPS = Object.freeze([
  Object.freeze({
    id: "prompts",
    targets: Object.freeze([
      '[data-onboarding-target="prompt-main"]',
      '[data-onboarding-target="prompt-secondary"]',
    ]),
    titleKey: "onboarding.steps.prompts.title",
    bodyKey: "onboarding.steps.prompts.body",
  }),
  Object.freeze({
    id: "input",
    targets: Object.freeze(['[data-onboarding-target="answer-input"]']),
    titleKey: "onboarding.steps.input.title",
    bodyKey: "onboarding.steps.input.body",
  }),
  Object.freeze({
    id: "feedback",
    targets: Object.freeze([
      '[data-onboarding-target="answer-guide"]',
      '[data-onboarding-target="answer-actions"]',
    ]),
    titleKey: "onboarding.steps.feedback.title",
    bodyKey: "onboarding.steps.feedback.body",
    showFeedbackKey: true,
  }),
  Object.freeze({
    id: "settings",
    targets: Object.freeze([
      '[data-onboarding-target="round-settings"]',
      '[data-onboarding-target="category-preview"]',
    ]),
    titleKey: "onboarding.steps.settings.title",
    bodyKey: "onboarding.steps.settings.body",
  }),
]);

export const WELCOME_COPY = Object.freeze({
  de: Object.freeze({
    body: "",
    languageLabel: "Welche Sprache m\u00f6chtest du \u00fcben?",
    play: "{language} \u00fcben",
    click: "Klicke hier, um",
    press: "Dr\u00fccke hier, um",
    tour: "Kurze Einf\u00fchrung",
    settings: "Runde anpassen",
  }),
  hr: Object.freeze({
    body: "",
    languageLabel: "Koji jezik \u017eeli\u0161 vje\u017ebati?",
    play: "Vje\u017ebaj: {language}",
    click: "Klikni ovdje za",
    press: "Pritisni za",
    tour: "Kratki vodi\u010d",
    settings: "Prilagodi krug",
  }),
  en: Object.freeze({
    body: "",
    languageLabel: "Which language do you want to practise?",
    play: "Practise {language}",
    click: "Click here to",
    press: "Press here to",
    tour: "Quick tour",
    settings: "Customise round",
  }),
});

export function safelyReadSeenState(storage) {
  try {
    const value = storage?.getItem(ONBOARDING_STORAGE_KEY);
    if (!value) {
      return false;
    }
    const parsed = JSON.parse(value);
    return parsed?.seen === true;
  } catch {
    return false;
  }
}

export function safelyWriteSeenState(storage, completedTour) {
  try {
    storage?.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
      seen: true,
      completedTour: Boolean(completedTour),
      dismissedAt: new Date().toISOString(),
    }));
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export function resolveBrowserStorage(storage) {
  if (storage) {
    return storage;
  }
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function getBrowserLanguagePreferences(preferredLanguages) {
  if (Array.isArray(preferredLanguages) || typeof preferredLanguages === "string") {
    return preferredLanguages;
  }
  try {
    if (Array.isArray(globalThis.navigator?.languages) && globalThis.navigator.languages.length) {
      return globalThis.navigator.languages;
    }
    return globalThis.navigator?.language ? [globalThis.navigator.language] : [];
  } catch {
    return [];
  }
}

export function setupPrimaryButtonContent(elements) {
  const primaryButtonIcon = elements.primaryButton ? document.createElement("span") : null;
  const primaryButtonLabel = elements.primaryButton ? document.createElement("span") : null;
  const primaryButtonCopy = elements.primaryButton ? document.createElement("span") : null;
  const primaryButtonHint = elements.primaryButton ? document.createElement("span") : null;

  if (primaryButtonIcon) {
    primaryButtonIcon.className = "onboarding-primary-icon";
    primaryButtonIcon.setAttribute("aria-hidden", "true");
  }
  if (primaryButtonLabel) {
    primaryButtonLabel.className = "onboarding-primary-label";
    primaryButtonCopy.className = "onboarding-primary-copy";
    primaryButtonHint.className = "onboarding-primary-hint";
    primaryButtonCopy.append(primaryButtonHint, primaryButtonLabel);
    elements.primaryButton.replaceChildren(primaryButtonIcon, primaryButtonCopy);
  }

  const primarySettingsSummary = elements.primaryButton ? document.createElement("span") : null;
  if (primarySettingsSummary) {
    const wordTypeText = document.createElement("span");
    const difficultyText = document.createElement("span");
    const roundText = document.createElement("span");
    primarySettingsSummary.className = "onboarding-primary-settings";
    primarySettingsSummary.setAttribute("aria-hidden", "true");
    wordTypeText.className = "onboarding-primary-settings-types";
    difficultyText.className = "onboarding-primary-settings-difficulty";
    roundText.className = "onboarding-primary-settings-rounds";
    primarySettingsSummary.append(wordTypeText, difficultyText, roundText);
    elements.primaryButton.append(primarySettingsSummary);

    const syncSettingsSummary = () => {
      const activeTypes = Array.from(document.querySelectorAll("#subcategoryButtons button.active"));
      const allTypesSelected = activeTypes.some((button) => button.dataset.subcategory === "all");
      const selectedTypeNames = allTypesSelected
        ? []
        : activeTypes
          .map((button) => button.querySelector(".subcategory-btn-label")?.textContent?.trim())
          .filter(Boolean);
      const activeDifficulty = document.querySelector(".difficulty-panel button.active");
      const slider = document.querySelector("#sessionSizeSlider");
      const sliderValue = document.querySelector("#sliderLabel");
      const sliderUnit = document.querySelector("#sliderUnitLabel")?.textContent
        ?.replace(/:\s*$/, "")
        .trim();
      difficultyText.textContent = activeDifficulty?.textContent?.trim() || "";
      const rounds = sliderValue?.textContent?.trim() || slider?.value || "";
      roundText.textContent = [rounds, sliderUnit].filter(Boolean).join(" ");
      const visibleTypes = allTypesSelected
        ? "Alle"
        : selectedTypeNames.length > 2
          ? `${selectedTypeNames.slice(0, 2).join(", ")} +${selectedTypeNames.length - 2}`
          : selectedTypeNames.join(", ") || "—";
      wordTypeText.textContent = `Wortarten: ${visibleTypes}`;
      wordTypeText.title = allTypesSelected
        ? "Wortarten: Alle"
        : `Wortarten: ${selectedTypeNames.join(", ") || "—"}`;
    };
    syncSettingsSummary();
    document.addEventListener("click", (event) => {
      if (event.target.closest?.(".difficulty-panel button, #subcategoryButtons button")) syncSettingsSummary();
    });
    document.addEventListener("input", (event) => {
      if (event.target.matches?.("#sessionSizeSlider")) syncSettingsSummary();
    });
    const subcategoryContainer = document.querySelector("#subcategoryButtons");
    if (subcategoryContainer && typeof window.MutationObserver === "function") {
      new window.MutationObserver(syncSettingsSummary).observe(subcategoryContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "aria-pressed"],
      });
    }
  }

  return { primaryButtonLabel, primaryButtonHint };
}

export function createOnboardingCopyRenderer(elements) {
  function renderLanguageLabel(label) {
    const labelText = String(label || "");
    if (elements.languageLabelText) {
      elements.languageLabelText.textContent = labelText;
    }
    if (!elements.languageLabelLetters) {
      if (elements.languageLabel) {
        elements.languageLabel.textContent = labelText;
      }
      return;
    }

    elements.languageLabelLetters.textContent = labelText;
  }

  function renderReplayNote(note) {
    if (!elements.replayNote) {
      return;
    }

    const noteText = String(note || "");
    const tokenPattern = /\[\[(lead|pink)\]\]([\s\S]*?)\[\[\/\1\]\]/g;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let match;

    while ((match = tokenPattern.exec(noteText))) {
      if (match.index > cursor) {
        fragment.append(document.createTextNode(noteText.slice(cursor, match.index)));
      }
      const span = document.createElement("span");
      span.className = `onboarding-replay-note-${match[1]}`;
      span.textContent = match[2];
      fragment.append(span);
      cursor = tokenPattern.lastIndex;
    }

    if (cursor < noteText.length) {
      fragment.append(document.createTextNode(noteText.slice(cursor)));
    }
    elements.replayNote.replaceChildren(fragment);
  }

  return { renderLanguageLabel, renderReplayNote };
}
