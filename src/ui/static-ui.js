import { LANGUAGE_DOCK_LABELS, LANGUAGE_TITLES } from "../config/languages.js";
import { SUBCATEGORY_COLORS } from "../config/categories.js";
import { SUBCATEGORY_OPTIONS } from "../../shared/card-schema.js";
import { getTopicColor } from "../game/category-panel.js";
import { searchSites } from "../search/sites.js";
import {
  addCardDeEl,
  addCardEnEl,
  addCardHrEl,
  answerGuideLabelEl,
  arrowDockButtons,
  arrowDockEl,
  arrowDockLabelEls,
  authorLabelDeEl,
  authorLabelEnEl,
  authorLabelHrEl,
  authorLabelScopeEl,
  authorLabelSubcategoryEl,
  authorLabelTopicEl,
  authorPanelTitleEl,
  authorToggleBtn,
  cardLegendEl,
  cardTopbarEl,
  catButtonsLabelEl,
  categoryEl,
  catPanelTitleEl,
  difficultyEasyBtn,
  difficultyHardBtn,
  difficultyMediumBtn,
  enterHintLabelEl,
  enterKeyBtnEl,
  factsCountryBtn,
  factsPanelSubtitleEl,
  factsPanelTitleEl,
  factsStatesBtn,
  factsWorldBtn,
  finalCorrectLabelEl,
  finalSkippedLabelEl,
  finalStreakLabelEl,
  finalTimeLabelEl,
  finalWpmLabelEl,
  grammarSectionTitleEl,
  hintBtnEl,
  inputEl,
  languageDockButtons,
  legendCorrectEl,
  legendNextEl,
  legendWrongEl,
  newGameBtn,
  promptEl,
  promptHeadTitleEl,
  restartBtnEl,
  searchLinksEl,
  searchPanelSubtitleEl,
  searchPanelTitleEl,
  sessionEndLabelEl,
  sessionSettingsBtnEl,
  settingsPanelTitleTextEl,
  siteFooterLinkEl,
  siteTitleEl,
  skipCardBtnEl,
  skipCardBtnLabelEl,
  statLabelAccuracyEl,
  statLabelRemainingEl,
  statLabelStreakEl,
  statLabelWpmEl,
  statsBarEl,
  subcategoryFilterLabelEl,
  tutorialReplayBtnEl,
} from "./dom.js";

let cardTopbarLayoutRaf = 0;

function getSubcategoryColor(subcategory) {
  const index = SUBCATEGORY_OPTIONS.indexOf(subcategory);
  return index >= 0 ? SUBCATEGORY_COLORS[index] : "#ffffff";
}

export function syncCardTopbarLayout() {
  cardTopbarLayoutRaf = 0;
  if (!cardTopbarEl || !cardLegendEl || !categoryEl) {
    return;
  }

  if (!categoryEl.textContent.trim() || cardTopbarEl.clientWidth <= 0) {
    cardTopbarEl.classList.remove("is-legend-stacked");
    return;
  }

  const legendItems = Array.from(cardLegendEl.querySelectorAll(".card-legend-item"));
  const topbarStyles = window.getComputedStyle(cardTopbarEl);
  const legendStyles = window.getComputedStyle(cardLegendEl);
  const topbarGap = Number.parseFloat(topbarStyles.columnGap || topbarStyles.gap) || 0;
  const legendGap = Number.parseFloat(legendStyles.columnGap || legendStyles.gap) || 0;
  const legendWidth = legendItems.reduce((width, item) => width + item.getBoundingClientRect().width, 0)
    + Math.max(0, legendItems.length - 1) * legendGap;
  const categoryWidth = Math.max(categoryEl.scrollWidth, categoryEl.getBoundingClientRect().width);
  const comfortSpace = 12;
  const shouldStack = categoryWidth + topbarGap + legendWidth + comfortSpace > cardTopbarEl.clientWidth;

  cardTopbarEl.classList.toggle("is-legend-stacked", shouldStack);
}

export function scheduleCardTopbarLayoutSync() {
  if (cardTopbarLayoutRaf) {
    return;
  }

  cardTopbarLayoutRaf = window.requestAnimationFrame(syncCardTopbarLayout);
}

export function renderCardBadge(card, { getTopicLabel, getSubcategoryLabel }) {
  if (!categoryEl) {
    return;
  }

  categoryEl.innerHTML = "";

  if (!card) {
    categoryEl.style.removeProperty("color");
    categoryEl.style.removeProperty("--category-color");
    categoryEl.style.removeProperty("border-color");
    categoryEl.style.removeProperty("background");
    scheduleCardTopbarLayoutSync();
    return;
  }

  const color = getTopicColor(card.topic);

  const topicEl = document.createElement("span");
  topicEl.className = "category-badge-main";
  topicEl.textContent = getTopicLabel(card.topic);

  const metaEl = document.createElement("span");
  metaEl.className = "category-badge-meta";
  metaEl.textContent = getSubcategoryLabel(card.subcategory);
  metaEl.style.setProperty("--subcategory-color", getSubcategoryColor(card.subcategory));

  categoryEl.append(metaEl, topicEl);
  categoryEl.style.color = color;
  categoryEl.style.setProperty("--category-color", color);
  categoryEl.style.removeProperty("border-color");
  categoryEl.style.removeProperty("background");
  scheduleCardTopbarLayoutSync();
}

export function renderSiteTitle(language, siteTitleController) {
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

export function updateLanguageDock({ translate, targetLanguage }) {
  const languageDock = document.getElementById("languageDock");
  if (languageDock) {
    languageDock.setAttribute("aria-label", translate("messages.languageDockAria"));
  }
  languageDockButtons.forEach((button) => {
    const language = button.dataset.lang;
    const labelEl = button.querySelector(".language-dock-label");
    if (labelEl) {
      labelEl.textContent = LANGUAGE_DOCK_LABELS[language] || "";
    }
    button.classList.toggle("is-active", language === targetLanguage);
    button.setAttribute("aria-pressed", String(language === targetLanguage));
    button.setAttribute("aria-label", translate(`messages.languageNames.${language}`));
  });
  if (arrowDockEl) {
    arrowDockEl.setAttribute("aria-label", translate("messages.arrowDockAria"));
  }
  Object.entries(arrowDockLabelEls).forEach(([direction, labelEl]) => {
    if (labelEl) {
      labelEl.textContent = translate(`messages.arrowActions.${direction}`);
    }
  });
  const arrowDirections = {
    ArrowUp: "up",
    ArrowLeft: "left",
    ArrowDown: "down",
    ArrowRight: "right",
  };
  arrowDockButtons.forEach((button) => {
    const direction = arrowDirections[button.dataset.arrow];
    if (direction) {
      button.setAttribute("aria-label", translate(`messages.arrowActions.${direction}`));
    }
  });
}

export function renderHintButtonLabel(translate) {
  if (!hintBtnEl) {
    return;
  }

  const textEl = hintBtnEl.querySelector(".hint-btn-text");
  const hintLabel = translate("messages.actions.hint");
  hintBtnEl.setAttribute("aria-label", hintLabel);
  if (textEl && hintBtnEl.querySelector(".button-icon-emoji")) {
    textEl.textContent = hintLabel;
    return;
  }

  hintBtnEl.replaceChildren();

  const iconEl = document.createElement("span");
  iconEl.className = "button-icon button-icon-emoji";
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.textContent = String.fromCodePoint(0x1F4A1);

  const labelEl = document.createElement("span");
  labelEl.className = "hint-btn-text";
  labelEl.textContent = hintLabel;

  hintBtnEl.append(iconEl, document.createTextNode(" "), labelEl);
}

export function updateSearchLinks(card) {
  if (!searchLinksEl) {
    return;
  }

  searchLinksEl.innerHTML = "";
  const query = String(card?.de || card?.en || promptEl?.textContent || "Deutsch").trim();

  searchSites.forEach((site) => {
    const link = document.createElement("a");
    link.className = "search-link";
    link.href = site.url(query);
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", `${site.name} – open in a new tab`);
    link.title = `Open ${site.name} in a new tab`;
    link.innerHTML =
      `<span class="search-link-main"><span class="search-link-name">${site.name}</span></span>` +
      `<span class="search-link-arrow" aria-hidden="true">&#8599;</span>`;
    searchLinksEl.appendChild(link);
  });
}

export function renderStaticLabels({
  translate,
  syncPromptOrderControls,
  fillAuthoringSelects,
  renderGrammarSection,
  visualEffects,
  firstRunTour,
}) {
  const setLocalizedText = (element, path, params) => {
    if (element) {
      element.textContent = translate(path, params);
    }
  };
  const setLocalizedAriaLabel = (element, path, params) => {
    if (element) {
      element.setAttribute("aria-label", translate(path, params));
    }
  };

  visualEffects?.sync();
  setLocalizedText(statLabelStreakEl, "messages.stats.streak");
  setLocalizedText(statLabelRemainingEl, "messages.stats.remaining");
  setLocalizedText(statLabelAccuracyEl, "messages.stats.accuracy");
  setLocalizedText(statLabelWpmEl, "messages.stats.wpm");
  if (statsBarEl) {
    const remainingLabelLength = (statLabelRemainingEl?.textContent || "").trim().length;
    statsBarEl.dataset.remainingLabel = remainingLabelLength > 6 ? "long" : "short";
  }
  setLocalizedAriaLabel(cardLegendEl, "messages.legend.aria");
  setLocalizedText(legendCorrectEl, "messages.legend.correct");
  setLocalizedText(legendNextEl, "messages.legend.next");
  setLocalizedText(legendWrongEl, "messages.legend.wrong");
  setLocalizedText(skipCardBtnLabelEl, "messages.actions.skip");
  if (skipCardBtnEl) {
    skipCardBtnEl.setAttribute("aria-label", translate("messages.actions.skip"));
    skipCardBtnEl.setAttribute("title", translate("messages.actions.skipTitle"));
  }
  if (enterKeyBtnEl) {
    const enterActionLabel = translate("messages.actions.enterHint");
    const enterButtonLabel = `Enter ${enterActionLabel}`;
    enterKeyBtnEl.setAttribute("aria-label", enterButtonLabel);
    enterKeyBtnEl.setAttribute("title", enterButtonLabel);
  }
  setLocalizedText(promptHeadTitleEl, "messages.prompt.card");
  if (inputEl) {
    inputEl.placeholder = translate("messages.prompt.placeholder");
  }
  setLocalizedText(answerGuideLabelEl, "messages.guide.label");
  renderHintButtonLabel(translate);
  setLocalizedText(enterHintLabelEl, "messages.actions.enterHint");
  setLocalizedText(sessionEndLabelEl, "messages.session.finished");
  setLocalizedText(finalCorrectLabelEl, "messages.session.correct");
  setLocalizedText(finalSkippedLabelEl, "messages.session.skipped");
  setLocalizedText(finalStreakLabelEl, "messages.session.bestStreak");
  setLocalizedText(finalWpmLabelEl, "messages.session.wpm");
  setLocalizedText(finalTimeLabelEl, "messages.session.time");
  setLocalizedText(sessionSettingsBtnEl, "messages.actions.settings");
  setLocalizedText(restartBtnEl, "messages.session.newRound");
  setLocalizedText(settingsPanelTitleTextEl, "messages.actions.settings");
  setLocalizedText(tutorialReplayBtnEl, "onboarding.controls.replay");
  setLocalizedText(catPanelTitleEl, "messages.categories.title");
  setLocalizedText(catButtonsLabelEl, "messages.categories.select");
  setLocalizedText(subcategoryFilterLabelEl, "messages.categories.classSelect");
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
    addCardDeEl.placeholder = translate("messages.authoring.placeholders.de");
  }
  if (addCardHrEl) {
    addCardHrEl.placeholder = translate("messages.authoring.placeholders.hr");
  }
  if (addCardEnEl) {
    addCardEnEl.placeholder = translate("messages.authoring.placeholders.en");
  }
  fillAuthoringSelects();
  setLocalizedText(factsPanelTitleEl, "facts.panelTitle");
  setLocalizedText(factsPanelSubtitleEl, "facts.panelSubtitle");
  setLocalizedText(factsCountryBtn?.querySelector(".facts-switch-btn-label"), "facts.tabs.germany");
  setLocalizedText(factsStatesBtn?.querySelector(".facts-switch-btn-label"), "facts.tabs.europe");
  setLocalizedText(factsWorldBtn?.querySelector(".facts-switch-btn-label"), "facts.tabs.world");
  setLocalizedText(siteFooterLinkEl, "footer");
  renderGrammarSection();
  scheduleCardTopbarLayoutSync();
  firstRunTour?.refreshCopy();
}
