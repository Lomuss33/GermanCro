import { createWordGridRenderer, describeWordGrid } from "../game/word-grid.js";
import {
  filterCardsBySelection,
  filterRenderableCards,
  getPromptLanguagesForTarget as getPoolPromptLanguages,
  isCardRenderable,
} from "../game/card-pool.js";
import {
  createCategoryPanelController,
  getRequestedSessionSize,
  getTopicColor,
  resolveSessionSize,
  syncSessionSizeLabel,
} from "../game/category-panel.js";
import { initVisualEffects } from "../ui/visual-effects.js";
import { prefersReducedEffects } from "../ui/effects-preference.js";
import {
  animateStatsOnStart,
  renderRoundProgressBar,
  replayStatsClass,
  showCombo,
  showEnterTimeBurst,
  showFeedbackBurst,
  showToast,
} from "../ui/feedback-effects.js";
import { createInstallGuideController } from "../ui/install-guide.js";
import {
  createCardAuthoringController,
  loadSessionAuthoringCards,
} from "../authoring/card-authoring.js";
import { createFactsController } from "../facts/controller.js";
import { renderSiteTitleLineContent } from "../ui/site-title.js";
import {
  SESSION_SIZE,
  MAX_SESSION_SKIPS,
  AUTO_SUBMIT_DELAY_MS,
  AUTOFILL_TRAILING_PUNCT,
  EMERGENCY_FALLBACK_CARD,
  LEARNING_MODE_STORAGE_KEY,
  PROMPT_ORDER_STORAGE_KEY,
} from "../config/app.js";
import { shuffle } from "../core/random.js";
import { getByPath, formatTemplate, getCardValue, formatRoundTime } from "../core/text.js";
import { fetchJson, detectCapabilities } from "../core/http.js";
import {
  getCorrectPrefixLength,
  getGuideSeparatorKind,
  getGuideWordTokens,
  getGuideWordTokenAt,
  getGuidePreviousWordToken,
  getFreshCorrectIndexes,
  getFreshWrongIndexes,
  isExactTypedMatch,
} from "../game/answer-analysis.js";
import {
  calculateWpmMetrics,
  countInsertedTypingUnits,
  countTypingUnits,
  formatWpm,
} from "../game/typing-metrics.js";
import {
  answerGuideSizingState,
  createViewportProfileController,
  getCurrentGameDensity,
  getPromptAvailableHeight,
  getPromptFitProfile,
  getSiteTitleFitProfile,
  initAnswerGuideResizeObserver,
  isTouchKeyboardEnvironment,
  scheduleAnswerGuideMeasure,
} from "../layout/viewport-controller.js";
import {
  promptEl,
  promptSub,
  promptPrimaryFlagEl,
  promptSecondaryFlagEl,
  inputFlagEl,
  siteTitleEl,
  heroStageEl,
  languageDockButtons,
  arrowDockEl,
  arrowDockButtons,
  arrowDockLabelEls,
  appLoaderEl,
  appLoaderSpinnerEl,
  onboardingDialogEl,
  statLabelStreakEl,
  statLabelRemainingEl,
  statLabelAccuracyEl,
  statLabelWpmEl,
  cardLegendEl,
  cardTopbarEl,
  legendCorrectEl,
  legendNextEl,
  legendWrongEl,
  skipCardBtnEl,
  skipCardBtnLabelEl,
  skipCounterEl,
  enterKeyBtnEl,
  promptHeadTitleEl,
  inputEl,
  wordGrid,
  answerTerminalStatusRowEl,
  answerTerminalStatusEl,
  answerGuideEl,
  roundTimerEl,
  finalTimeEl,
  answerGuideLabelEl,
  answerGuideStatusEl,
  answerGuideNoteEl,
  categoryEl,
  gameArea,
  sessionEndEl,
  mainCard,
  progressTrackEl,
  statsBarEl,
  catCountEl,
  catButtonsLabelEl,
  subcategoryFilterLabelEl,
  settingsPanelTitleTextEl,
  tutorialReplayBtnEl,
  catPanelTitleEl,
  difficultyHardBtn,
  difficultyMediumBtn,
  difficultyEasyBtn,
  sessionSizeSliderEl,
  newGameBtn,
  searchPanelEl,
  searchPanelTitleEl,
  searchPanelSubtitleEl,
  grammarSectionTitleEl,
  grammarGridEl,
  searchLinksEl,
  authorPanelEl,
  authorToggleBtn,
  authorPanelTitleEl,
  addCardDeEl,
  addCardHrEl,
  addCardEnEl,
  authorLabelDeEl,
  authorLabelTopicEl,
  authorLabelSubcategoryEl,
  authorLabelScopeEl,
  authorLabelHrEl,
  authorLabelEnEl,
  factsPanelTitleEl,
  factsPanelSubtitleEl,
  factsCountryBtn,
  factsStatesBtn,
  factsWorldBtn,
  factsPanelEl,
  hintBtnEl,
  enterHintLabelEl,
  sessionEndLabelEl,
  finalCorrectLabelEl,
  finalSkippedLabelEl,
  finalStreakLabelEl,
  finalWpmLabelEl,
  finalTimeLabelEl,
  restartBtnEl,
  sessionSettingsBtnEl,
  finalCorrectEl,
  finalSkippedEl,
  finalStreakEl,
  finalWpmEl,
  siteFooterLinkEl,
} from "../ui/dom.js";
import { setLanguageFlagIcon } from "../ui/language-flags.js";
import { LANGUAGE_SEQUENCE, LANGUAGE_DOCK_LABELS, LANGUAGE_TITLES } from "../config/languages.js";
import { DEFAULT_SUBCATEGORIES, SUBCATEGORY_COLORS } from "../config/categories.js";
import { searchSites } from "../search/sites.js";
import { createPretextBlockController } from "../layout/pretext.js";
import { renderGrammarReference } from "../grammar/reference-view.js";
import { createFirstRunTour } from "../onboarding/first-run-tour.js";
import { initPageScrollAssist } from "../ui/page-scroll-assist.js";

import {
  MODE_SCOPE_MAP,
  SUBCATEGORY_OPTIONS,
  createCardDuplicateIndex,
  mergeCards,
  normalizeAnswer,
  sanitizeCard,
} from "../../shared/card-schema.js";

window.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    document.body.classList.add("is-keyboard-navigation");
  }
}, { passive: true });

window.addEventListener("pointerdown", () => {
  document.body.classList.remove("is-keyboard-navigation");
}, { passive: true });

let allCards = [];
let bundledCards = [];
let persistentCards = [];
let sessionOnlyCards = [];
const cardDuplicateIndex = createCardDuplicateIndex();
let selectedTopics = null;
let extendedRoundSize = false;
let selectedSubcategories = new Set(DEFAULT_SUBCATEGORIES);
let capabilities = { persistentSave: false };

let sessionCards = [];
let sessionIndex = 0;
let streak = 0;
let bestStreak = 0;
let totalCorrect = 0;
let totalAttempts = 0;
let skippedCount = 0;
let sessionSkipsUsed = 0;
let forceCorrection = false;
let sessionStart = 0;
let roundTimerStarted = false;
let roundTimerInterval = 0;
let totalCharsTyped = 0;
let totalTypingUnits = 0;
let sessionSkipCounts = new WeakMap();
let sessionSkippedCards = new WeakSet();
let cardStateByCard = new WeakMap();
let pendingAdvanceTimer = 0;
let pendingFinishAt = 0;
let autoSubmitTimer = 0;
let scoredCardEvents = new WeakSet();
let difficulty = "easy";
let previousTypedValue = "";
let answerGuideCompleteTimer = null;
let enterKeyPulseTimer = 0;
let currentCardShownAt = 0;
let cardTopbarLayoutRaf = 0;
let learningMode = "de";
let isPromptOrderSwapped = false;

let locales = null;
let hasBootstrappedApp = false;
let sessionRecoveryNonce = 0;
let pendingLanguageSwitchTimer = 0;
let pendingLanguageSwitchToken = 0;
let languageSwitchCleanupTimer = 0;
let firstRunTour = null;
let onboardingPending = false;
let onboardingOpenedAt = 0;

document.addEventListener("visibilitychange", () => {
  document.body.classList.toggle("is-page-hidden", document.hidden);
}, { passive: true });

let appLoaderStartedAt = Date.now();
let grammarSliderControllers = [];
let previousStatsSnapshot = null;

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
    onboardingPending ||
    firstRunTour?.isOpen() ||
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

  if (!mainCard?.contains(target)) {
    return false;
  }

  if (target.closest("button, a, input, textarea, select, label")) {
    return false;
  }

  return true;
}

function setExternalLookupInert(inert) {
  const searchToolsPanel = document.getElementById("searchToolsPanel");
  if (searchToolsPanel) {
    searchToolsPanel.setAttribute("aria-disabled", String(inert));
    searchToolsPanel.dataset.interactionLocked = String(inert);
  }
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
  mainCard?.classList.toggle("is-session-ended", showSessionEnd);
  setExternalLookupInert(showSessionEnd);
}

const siteTitleController = createPretextBlockController({
  element: siteTitleEl,
  lineHeightRatio: 0.92,
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
      height: getPromptAvailableHeight(promptEl),
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
      height: getPromptAvailableHeight(promptSub),
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

function loadLearningMode() {
  try {
    const saved = localStorage.getItem(LEARNING_MODE_STORAGE_KEY);
    return LANGUAGE_SEQUENCE.includes(saved) ? saved : "de";
  } catch {
    return "de";
  }
}

function loadPromptOrderPreference() {
  try {
    return localStorage.getItem(PROMPT_ORDER_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveLearningMode() {
  try {
    localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode);
  } catch {
    // Ignore storage failures and keep the in-memory preference.
  }
}

function savePromptOrderPreference() {
  try {
    localStorage.setItem(PROMPT_ORDER_STORAGE_KEY, String(isPromptOrderSwapped));
  } catch {
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

function t(path, params = {}, locale = getLocale()) {
  const current = getByPath(getLocaleBundle(locale), path);
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

function getSubcategoryColor(subcategory) {
  const index = SUBCATEGORY_OPTIONS.indexOf(subcategory);
  return index >= 0 ? SUBCATEGORY_COLORS[index] : "#ffffff";
}

function getScopeLabel(scope) {
  return t(`scopes.${scope}`);
}

const installGuideController = createInstallGuideController({
  translate: t,
  siteTitleController,
  showToast,
});

const categoryPanelController = createCategoryPanelController({
  translate: t,
  getTopicLabel,
  getSubcategoryLabel,
  getSelectedTopics: () => selectedTopics,
  setSelectedTopics: (nextTopics) => { selectedTopics = nextTopics; },
  getSelectedSubcategories: () => selectedSubcategories,
  setSelectedSubcategories: (nextSubcategories) => { selectedSubcategories = nextSubcategories; },
  getExtendedRoundSize: () => extendedRoundSize,
  getPool,
});

function hasDuplicate(card) {
  return cardDuplicateIndex.has(card);
}

function addCardToRuntime(card) {
  if (!cardDuplicateIndex.add(card)) {
    return;
  }
  allCards.push(card);
  categoryPanelController.buildTopicPanel();
}

const cardAuthoringController = createCardAuthoringController({
  translate: t,
  getTopicLabel,
  getSubcategoryLabel,
  getScopeLabel,
  getCapabilities: () => capabilities,
  getPersistentCards: () => persistentCards,
  setPersistentCards: (nextCards) => { persistentCards = nextCards; },
  getSessionOnlyCards: () => sessionOnlyCards,
  setSessionOnlyCards: (nextCards) => { sessionOnlyCards = nextCards; },
  hasDuplicateCard: hasDuplicate,
  addCardToRuntime,
  showToast,
});

const viewportController = createViewportProfileController({
  onRelayoutTextAndGrammar: () => {
    siteTitleController?.relayout();
    grammarSliderControllers.forEach((controller) => controller?.rerender?.());
  },
  onLayoutChanged: () => {
    installGuideController.maybeShow();
  },
  onCardRelayout: () => {
    setGameSurfaceMode(isSessionEndVisible());
    if (sessionCards.length && sessionCards[sessionIndex]) {
      promptController?.relayout();
      promptSubController?.relayout();
      buildWordGrid(getTargetValue(sessionCards[sessionIndex]), inputEl.value);
    }
  },
  onTopbarSync: () => {
    setGameSurfaceMode(isSessionEndVisible());
    scheduleCardTopbarLayoutSync();
  },
  onPageshowRecover: () => {
    if (hasBootstrappedApp) {
      void recoverPlayableSession("pageshow", sessionCards.length || SESSION_SIZE);
    }
  },
});

function renderCardBadge(card) {
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

function syncCardTopbarLayout() {
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

function scheduleCardTopbarLayoutSync() {
  if (cardTopbarLayoutRaf) {
    return;
  }

  cardTopbarLayoutRaf = window.requestAnimationFrame(syncCardTopbarLayout);
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
  return sessionSkipsUsed < MAX_SESSION_SKIPS && Boolean(getNextSkipCard());
}

function getNextSkipCard() {
  const currentCard = sessionCards[sessionIndex];
  const candidates = getRenderablePool(getPool()).filter((card) => (
    card !== currentCard &&
    !sessionCards.includes(card) &&
    !sessionSkippedCards.has(card)
  ));
  return candidates.length ? shuffle(candidates)[0] : null;
}

function cancelPendingCardAdvance() {
  pendingFinishAt = 0;
  if (!pendingAdvanceTimer) {
    return;
  }

  window.clearTimeout(pendingAdvanceTimer);
  pendingAdvanceTimer = 0;
}

function cancelAutoSubmit() {
  if (!autoSubmitTimer) {
    return;
  }

  window.clearTimeout(autoSubmitTimer);
  autoSubmitTimer = 0;
}

function scheduleAutoSubmit(target, card) {
  cancelAutoSubmit();
  autoSubmitTimer = window.setTimeout(() => {
    autoSubmitTimer = 0;
    if (sessionCards[sessionIndex] === card && isExactTypedMatch(target, inputEl.value)) {
      submitCurrentAnswer();
    }
  }, AUTO_SUBMIT_DELAY_MS);
}

function saveCurrentCardState() {
  const card = sessionCards[sessionIndex];
  if (isRenderableCard(card)) {
    cardStateByCard.set(card, {
      typedValue: inputEl.value,
      previousTypedValue,
      forceCorrection,
    });
  }
}

function getSavedCardState(card) {
  return isRenderableCard(card) ? cardStateByCard.get(card) || null : null;
}

function navigateToCardIndex(nextIndex) {
  if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= sessionCards.length) {
    return false;
  }

  const nextCard = sessionCards[nextIndex];
  if (!isRenderableCard(nextCard)) {
    return false;
  }

  cancelPendingCardAdvance();
  cancelAutoSubmit();
  saveCurrentCardState();
  sessionIndex = nextIndex;
  updateStats();
  setGameSurfaceMode(false);
  loadCard({ restoreState: getSavedCardState(nextCard) });
  return true;
}

function goBackToPreviousCard() {
  return navigateToCardIndex(sessionIndex - 1);
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

  const replacementCard = getNextSkipCard();
  if (sessionSkipsUsed >= MAX_SESSION_SKIPS || !replacementCard) {
    return;
  }

  cancelPendingCardAdvance();
  cancelAutoSubmit();
  saveCurrentCardState();
  skippedCount += 1;
  sessionSkipsUsed += 1;
  sessionSkippedCards.add(card);
  incrementCardSkipCount(card);
  streak = 0;
  updateStats({ event: "skip" });

  sessionCards[sessionIndex] = replacementCard;
  loadCard();
}

function updateSkipCardButtonState() {
  const hasPlayableCard = hasActivePlayableCard();
  if (enterKeyBtnEl) {
    enterKeyBtnEl.disabled = !hasPlayableCard;
  }
  if (hintBtnEl) {
    hintBtnEl.disabled = !hasPlayableCard;
  }

  if (skipCardBtnEl) {
    skipCardBtnEl.disabled = !canSkipCurrentCard();
  }
  if (!skipCounterEl) {
    return;
  }

  const remainingSkips = Math.max(0, MAX_SESSION_SKIPS - sessionSkipsUsed);
  const remainingLabel = t("messages.actions.skipRemaining", { count: remainingSkips });
  skipCounterEl.textContent = String(remainingSkips);
  skipCounterEl.classList.toggle("is-depleted", remainingSkips === 0);
  skipCounterEl.setAttribute("aria-label", remainingLabel);
  skipCounterEl.title = remainingLabel;
}

function renderHintButtonLabel() {
  if (!hintBtnEl) {
    return;
  }

  const textEl = hintBtnEl.querySelector(".hint-btn-text");
  const hintLabel = t("messages.actions.hint");
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

function getTargetLanguage() {
  return learningMode;
}

function getTargetValue(card) {
  return getCardValue(card, getTargetLanguage());
}

function getPromptLanguagesForTarget(language = getTargetLanguage()) {
  return getPoolPromptLanguages(language, isPromptOrderSwapped);
}

function getPromptLanguages() {
  return getPromptLanguagesForTarget(getTargetLanguage());
}

function isRenderableCard(card, language = getTargetLanguage()) {
  const targetLanguage = LANGUAGE_SEQUENCE.includes(language) ? language : getTargetLanguage();
  return isCardRenderable(card, targetLanguage);
}

function getRenderablePool(cards, language = getTargetLanguage()) {
  const targetLanguage = LANGUAGE_SEQUENCE.includes(language) ? language : getTargetLanguage();
  return filterRenderableCards(cards, targetLanguage);
}

function cycleLearningMode() {
  const currentIndex = LANGUAGE_SEQUENCE.indexOf(getTargetLanguage());
  return LANGUAGE_SEQUENCE[(currentIndex + 1) % LANGUAGE_SEQUENCE.length];
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
  if (arrowDockEl) {
    arrowDockEl.setAttribute("aria-label", t("messages.arrowDockAria"));
  }
  Object.entries(arrowDockLabelEls).forEach(([direction, labelEl]) => {
    if (labelEl) {
      labelEl.textContent = t(`messages.arrowActions.${direction}`);
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
      button.setAttribute("aria-label", t(`messages.arrowActions.${direction}`));
    }
  });
}

function applyLearningTheme() {
  document.body.dataset.learningMode = getTargetLanguage();
  document.documentElement.lang = getLocaleBundle()?.meta?.htmlLang || getTargetLanguage();
  updateLanguageDock();
  renderSiteTitle(getTargetLanguage());
}

function renderGrammarSection() {
  if (!grammarGridEl) return;
  grammarSliderControllers.forEach(controller => controller?.destroy?.());
  grammarGridEl.replaceChildren();
  grammarSliderControllers = renderGrammarReference(
    grammarGridEl, getLocaleBundle()?.grammar?.cards || [], getLocale()
  );
}

function renderStaticUi() {
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
    skipCardBtnEl.setAttribute("aria-label", t("messages.actions.skip"));
    skipCardBtnEl.setAttribute("title", t("messages.actions.skipTitle"));
  }
  if (enterKeyBtnEl) {
    const enterActionLabel = t("messages.actions.enterHint");
    const enterButtonLabel = `Enter ${enterActionLabel}`;
    enterKeyBtnEl.setAttribute("aria-label", enterButtonLabel);
    enterKeyBtnEl.setAttribute("title", enterButtonLabel);
  }
  setLocalizedText(promptHeadTitleEl, "messages.prompt.card");
  if (inputEl) {
    inputEl.placeholder = t("messages.prompt.placeholder");
  }
  setLocalizedText(answerGuideLabelEl, "messages.guide.label");
  renderHintButtonLabel();
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
    addCardDeEl.placeholder = t("messages.authoring.placeholders.de");
  }
  if (addCardHrEl) {
    addCardHrEl.placeholder = t("messages.authoring.placeholders.hr");
  }
  if (addCardEnEl) {
    addCardEnEl.placeholder = t("messages.authoring.placeholders.en");
  }
  cardAuthoringController.fillSelects();
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

function switchLearningMode(nextLanguage) {
  if (!LANGUAGE_SEQUENCE.includes(nextLanguage) || nextLanguage === getTargetLanguage()) {
    return;
  }

  window.clearTimeout(pendingLanguageSwitchTimer);
  cancelPendingCardAdvance();
  window.clearTimeout(languageSwitchCleanupTimer);
  const languageSwitchToken = ++pendingLanguageSwitchToken;
  saveCurrentCardState();
  document.body.classList.add("is-language-switching");
  document.querySelectorAll(".site-title").forEach((title) => {
    title.classList.remove("is-changing-in");
    title.classList.add("is-changing-out");
  });

  pendingLanguageSwitchTimer = window.setTimeout(async () => {
    pendingLanguageSwitchTimer = 0;
    if (languageSwitchToken !== pendingLanguageSwitchToken) {
      return;
    }

    learningMode = nextLanguage;
    saveLearningMode();
    applyLearningTheme();
    renderStaticUi();
    installGuideController.maybeShow();
    cardAuthoringController.renderMode();
    categoryPanelController.buildTopicPanel();
    updateStats();
    factsController.render();
    if (isRenderableCard(sessionCards[sessionIndex], nextLanguage)) {
      loadCard({ focusInput: false });
    } else {
      await recoverPlayableSession("language-switch", sessionCards.length || SESSION_SIZE);
      if (languageSwitchToken !== pendingLanguageSwitchToken) {
        return;
      }
    }

    document.querySelectorAll(".site-title").forEach((title) => {
      title.classList.remove("is-changing-out");
      title.classList.add("is-changing-in");
      window.setTimeout(() => title.classList.remove("is-changing-in"), 340);
    });

    languageSwitchCleanupTimer = window.setTimeout(() => {
      if (languageSwitchToken !== pendingLanguageSwitchToken) {
        return;
      }
      document.body.classList.remove("is-language-switching");
      languageSwitchCleanupTimer = 0;
    }, 180);
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

  setLanguageFlagIcon(promptPrimaryFlagEl, primaryLanguage);
  setLanguageFlagIcon(promptSecondaryFlagEl, secondaryLanguage);
  setLanguageFlagIcon(inputFlagEl, getTargetLanguage());
  syncPromptOrderControls();
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

async function loadLocales() {
  return fetchJson("locales.json?v=2026-08-21-onboarding4", null);
}

function getPool() {
  return filterCardsBySelection(allCards, {
    topics: selectedTopics,
    subcategories: selectedSubcategories,
    scope: getCurrentScopeMode(),
  });
}

searchLinksEl?.addEventListener("click", (event) => {
  const link = event.target.closest("a.search-link");
  const panel = searchLinksEl.closest("#searchToolsPanel");
  if (!link || panel?.getAttribute("aria-disabled") !== "true") {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
});

function updateSearchLinks(card) {
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

function getGuideSeparatorLabel(char, { overflow = false } = {}) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return t(overflow ? "messages.guide.extraSeparator" : "messages.guide.separator");
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

function submitCurrentAnswer({ finishNow = false } = {}) {
  if (pendingFinishAt) {
    if (finishNow) showSessionEnd();
    return;
  }
  if (!sessionCards.length) {
    return;
  }

  const card = sessionCards[sessionIndex];
  if (!isRenderableCard(card)) {
    void recoverPlayableSession("submit-invalid-card", sessionCards.length || SESSION_SIZE);
    return;
  }

  const target = getTargetValue(card);
  cancelAutoSubmit();
  const scoreAlreadyRecorded = scoredCardEvents.has(card);
  if (normalizeAnswer(inputEl.value) === normalizeAnswer(target)) {
    showFeedbackBurst("success", true);
    if (!scoreAlreadyRecorded) {
      scoredCardEvents.add(card);
      totalCharsTyped += countTypingUnits(target);
      totalAttempts += 1;
      if (!forceCorrection) {
        totalCorrect += 1;
        streak += 1;
        if (streak > bestStreak) {
          bestStreak = streak;
        }
        showCombo(streak, t);
        showToast(getEncouragement(streak));
      }
    }
    inputEl.className = "correct";
    updateStats({ event: "correct" });
    saveCurrentCardState();
    cancelPendingCardAdvance();
    const completedCard = card;
    const isLastCard = sessionIndex === sessionCards.length - 1;
    if (isLastCard) {
      pendingFinishAt = Date.now();
      updateRoundTimer();
    }
    pendingAdvanceTimer = window.setTimeout(() => {
      pendingAdvanceTimer = 0;
      if (sessionCards[sessionIndex] !== completedCard) {
        return;
      }

      if (sessionIndex >= sessionCards.length - 1) {
        showSessionEnd();
      } else {
        navigateToCardIndex(sessionIndex + 1);
      }
    }, isLastCard ? 5000 : 140);
    return;
  }

  showFeedbackBurst("error", false);
  if (!scoreAlreadyRecorded) {
    scoredCardEvents.add(card);
    totalAttempts += 1;
    streak = 0;
  }
  inputEl.className = "wrong";
  forceCorrection = true;
  updateStats({ event: "error" });
}

const renderWordGrid = createWordGridRenderer(wordGrid);

function buildWordGrid(
  target,
  typed,
  {
    freshCorrectIndexes = new Set(),
    freshWrongIndexes = new Set(),
    terminalHit = null,
  } = {}
) {
  renderWordGrid(target, describeWordGrid(target, typed, {
    ...getCharMeta(target), difficulty, separatorLabel: getGuideSeparatorLabel,
    freshCorrectIndexes, freshWrongIndexes,
  }));

  answerGuideSizingState.target = String(target ?? "");
  answerGuideSizingState.typed = String(typed ?? "");
  scheduleAnswerGuideMeasure("build-word-grid");
  updateAnswerTerminalStatus(target, typed, terminalHit);
  updateAnswerGuide(target, typed);
}

function updateRoundTimer() {
  if (!roundTimerEl || !sessionStart) {
    return;
  }
  const elapsedSeconds = Math.max(0, Math.floor(((pendingFinishAt || Date.now()) - sessionStart) / 1000));
  setRoundTimerText(formatRoundTime(elapsedSeconds));
}

function getRoundTimerValueEl() {
  if (!roundTimerEl) {
    return null;
  }

  let valueEl = roundTimerEl.querySelector(".round-timer-value");
  if (!valueEl) {
    valueEl = document.createElement("span");
    valueEl.className = "round-timer-value";
    valueEl.textContent = roundTimerEl.textContent || formatRoundTime(0);
    roundTimerEl.textContent = "";
    roundTimerEl.appendChild(valueEl);
  }
  return valueEl;
}

function setRoundTimerText(text) {
  const valueEl = getRoundTimerValueEl();
  if (valueEl) {
    valueEl.textContent = text;
  }
}

function getSessionTypingElapsedMs(referenceTime = Date.now()) {
  return roundTimerStarted && sessionStart
    ? Math.max(0, (pendingFinishAt || referenceTime) - sessionStart)
    : 0;
}

function getSessionTypingMetrics(referenceTime = Date.now()) {
  return calculateWpmMetrics({
    typedUnits: totalTypingUnits,
    acceptedUnits: totalCharsTyped,
    elapsedMs: getSessionTypingElapsedMs(referenceTime),
  });
}

function startRoundTimer() {
  if (roundTimerStarted) {
    return;
  }
  roundTimerStarted = true;
  sessionStart = Date.now();
  if (roundTimerInterval) {
    window.clearInterval(roundTimerInterval);
  }
  updateRoundTimer();
  roundTimerInterval = window.setInterval(updateRoundTimer, 1000);
}

function stopRoundTimer() {
  if (roundTimerInterval) {
    window.clearInterval(roundTimerInterval);
    roundTimerInterval = 0;
  }
  updateRoundTimer();
}

function renderRoundProgress({ reset = false, empty = false } = {}) {
  renderRoundProgressBar({
    sessionCards,
    scoredCardEvents,
    translate: t,
    reset,
    empty,
  });
}

function resetSessionProgress() {
  sessionIndex = 0;
  streak = 0;
  bestStreak = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  skippedCount = 0;
  sessionSkipsUsed = 0;
  totalCharsTyped = 0;
  totalTypingUnits = 0;
  currentCardShownAt = 0;
  sessionStart = 0;
  roundTimerStarted = false;
  setRoundTimerText(formatRoundTime(0));
  sessionSkipCounts = new WeakMap();
  sessionSkippedCards = new WeakSet();
  cardStateByCard = new WeakMap();
  cancelPendingCardAdvance();
  scoredCardEvents = new WeakSet();
  renderRoundProgress({ reset: true });
}

function clearSessionUi() {
  setGameSurfaceMode(false);
  inputEl.value = "";
  inputEl.className = "";
  previousTypedValue = "";
  clearTimeout(answerGuideCompleteTimer);
  answerGuideEl?.classList.remove("is-complete-hit");
  forceCorrection = false;
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
  cardDuplicateIndex.rebuild(allCards);
  categoryPanelController.buildTopicPanel();
  return allCards;
}

async function recoverPlayableSession(reason = "unknown", requestedSize = SESSION_SIZE) {
  void reason;
  const recoveryNonce = ++sessionRecoveryNonce;
  const nextSessionSize = resolveSessionSize(requestedSize, sessionCards.length || SESSION_SIZE);
  clearSessionUi();
  renderRoundProgress({ reset: true, empty: true });

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
    categoryPanelController.buildTopicPanel();
    if (rebuildSessionFromCards(getPool())) {
      return true;
    }
  }

  if (selectedSubcategories !== null) {
    selectedSubcategories = new Set(DEFAULT_SUBCATEGORIES);
    categoryPanelController.buildTopicPanel();
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

  animateStatsOnStart();

  const scrollTarget = heroStageEl || mainCard;
  scrollTarget.scrollIntoView({
    behavior: prefersReducedEffects() ? "instant" : "smooth",
    block: "start",
  });
}

function loadCard(options = {}) {
  const { focusInput = true, allowRecovery = true, restoreState = null } = options;
  const card = sessionCards[sessionIndex];
  if (!isRenderableCard(card)) {
    if (allowRecovery) {
      void recoverPlayableSession("load-card", sessionCards.length || SESSION_SIZE);
    }
    return;
  }

  clearSessionUi();
  currentCardShownAt = Date.now();
  renderPrompt(card);
  renderRoundProgress();

  renderCardBadge(card);
  updateSkipCardButtonState();

  mainCard.classList.add("active");
  const savedState = restoreState || getSavedCardState(card);
  const restoredTypedValue = savedState?.typedValue || "";
  inputEl.value = restoredTypedValue;
  previousTypedValue = savedState?.previousTypedValue || restoredTypedValue;
  forceCorrection = Boolean(savedState?.forceCorrection);
  buildWordGrid(getTargetValue(card), restoredTypedValue);
  updateSearchLinks(card);

  if (focusInput && !isAnswerFocusBlocked()) {
    focusAnswerInputWithoutScroll();
  }
}

function updateStats({ event = "update" } = {}) {
  renderRoundProgress();
  const streakEl = document.getElementById("streakNum");
  const correctEl = document.getElementById("correctVal");
  const remainingEl = document.getElementById("remainingVal");
  const accuracyEl = document.getElementById("accuracyVal");
  const wpmEl = document.getElementById("wpmVal");

  const nextSnapshot = {
    streak,
    correct: totalCorrect,
    remaining: sessionCards.length ? sessionCards.length - sessionIndex : null,
    accuracy: totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : null,
    wpm: null,
  };

  if (streakEl) {
    streakEl.textContent = streak;
    const streakStat = streakEl.closest(".stat");
    const fireStep = Math.min(Math.max(streak, 0), 10);
    const fireScale = fireStep === 0
      ? 0
      : 0.26 + (Math.sqrt(fireStep / 10) * 1.04);
    streakStat?.style.setProperty("--streak-fire-scale", fireScale.toFixed(3));
    streakStat?.style.setProperty("--streak-fire-opacity", fireStep === 0 ? "0" : Math.min(1, 0.25 + fireStep * 0.1).toFixed(2));
    streakStat?.style.setProperty("--streak-fire-gap", fireStep === 0 ? "0px" : "4px");
  }
  if (!streakEl) {
    document.querySelector(".stat-streak")?.style.setProperty("--streak-fire-scale", "0");
  }
  if (correctEl) {
    correctEl.textContent = totalCorrect;
  }
  if (remainingEl) {
    remainingEl.textContent = nextSnapshot.remaining !== null ? String(nextSnapshot.remaining) : "—";
  }

  if (accuracyEl) {
    accuracyEl.textContent = nextSnapshot.accuracy !== null ? `${nextSnapshot.accuracy}%` : "—";
  }

  const typingMetrics = getSessionTypingMetrics();
  nextSnapshot.wpm = typingMetrics.displayedWpm === null
    ? null
    : Math.round(typingMetrics.displayedWpm * 10) / 10;
  if (wpmEl) {
    const wpmText = formatWpm(nextSnapshot.wpm);
    const grossText = formatWpm(typingMetrics.grossWpm);
    const acceptedText = formatWpm(typingMetrics.acceptedWpm);
    const stat = wpmEl.closest(".stat");
    wpmEl.textContent = wpmText;
    stat?.style.setProperty("--wpm-level", `${Math.round(typingMetrics.level * 100)}%`);
    stat?.setAttribute("aria-label", `${wpmText} WPM`);
    stat?.setAttribute("title", `Live WPM: ${wpmText} · Gross: ${grossText} · Correct: ${acceptedText}`);
  }

  const previous = previousStatsSnapshot;
  previousStatsSnapshot = nextSnapshot;
  if (!previous || prefersReducedEffects()) {
    return;
  }

  const statFor = (element) => element?.closest(".stat");
  const streakStat = statFor(streakEl);
  const remainingStat = statFor(remainingEl);
  const accuracyStat = statFor(accuracyEl);
  const wpmStat = statFor(wpmEl);

  if (nextSnapshot.streak !== previous.streak) {
    replayStatsClass(streakStat, nextSnapshot.streak > previous.streak ? "is-rise" : "is-drop");
  }
  if (nextSnapshot.remaining !== previous.remaining) {
    replayStatsClass(remainingStat, "is-count-change");
  }
  if (nextSnapshot.accuracy !== previous.accuracy && nextSnapshot.accuracy !== null) {
    replayStatsClass(accuracyStat, nextSnapshot.accuracy > (previous.accuracy ?? -1) ? "is-improving" : "is-declining");
  }
  if (nextSnapshot.wpm !== previous.wpm && nextSnapshot.wpm !== null) {
    replayStatsClass(wpmStat, nextSnapshot.wpm > (previous.wpm ?? -1) ? "is-rise" : "is-count-change");
  }

  const eventClass = event === "correct" ? "is-event-success" : event === "error" ? "is-event-error" : event === "skip" ? "is-event-skip" : null;
  if (eventClass) {
    replayStatsClass(statsBarEl, eventClass, 880);
  }
}

function initFirstRunTour() {
  let restoreSessionEndAfterReplay = false;

  if (mainCard && onboardingDialogEl?.parentElement !== mainCard) {
    mainCard.prepend(onboardingDialogEl);
  }

  firstRunTour = createFirstRunTour({
    dialog: onboardingDialogEl,
    alwaysShow: true,
    translate: t,
    getLearningMode: getTargetLanguage,
    setLearningMode: switchLearningMode,
    focusAnswer: () => {
      if (canConvenienceFocusAnswerInput()) {
        focusAnswerInputWithoutScroll();
      }
    },
    onOpen: ({ replay }) => {
      restoreSessionEndAfterReplay = Boolean(replay && isSessionEndVisible());
      if (restoreSessionEndAfterReplay) {
        setGameSurfaceMode(false);
      }
      onboardingPending = false;
      onboardingOpenedAt = Date.now();
      gameArea?.setAttribute("inert", "");
      sessionEndEl?.setAttribute("inert", "");
      setExternalLookupInert(true);
      installGuideController.maybeShow();
    },
    onClose: ({ replay, reason }) => {
      const onboardingDuration = onboardingOpenedAt
        ? Math.max(0, Date.now() - onboardingOpenedAt)
        : 0;
      onboardingOpenedAt = 0;
      onboardingPending = false;
      gameArea?.removeAttribute("inert");
      sessionEndEl?.removeAttribute("inert");
      setExternalLookupInert(false);
      if (replay) {
        sessionStart += onboardingDuration;
      } else {
        sessionStart = Date.now();
      }
      if (restoreSessionEndAfterReplay) {
        setGameSurfaceMode(true);
        restoreSessionEndAfterReplay = false;
      }
      if (reason === "settings") {
        const settingsPanel = document.getElementById("catPanel");
        settingsPanel?.scrollIntoView({
          behavior: prefersReducedEffects() ? "instant" : "smooth",
          block: "start",
          inline: "nearest",
        });
        settingsPanel?.querySelector("button:not(:disabled), input:not(:disabled)")?.focus({ preventScroll: true });
      }
      updateStats();
      window.setTimeout(installGuideController.maybeShow, 0);
    },
  });

  onboardingPending = Boolean(firstRunTour?.shouldShow());
  tutorialReplayBtnEl?.addEventListener("click", () => {
    firstRunTour?.startTutorial();
  });
}

function getEncouragement(currentStreak) {
  const value = t(`messages.encouragement.${currentStreak}`);
  return value === `messages.encouragement.${currentStreak}` ? null : value;
}

function showSessionEnd() {
  const finishedAt = pendingFinishAt || Date.now();
  cancelPendingCardAdvance();
  cancelAutoSubmit();
  stopRoundTimer();
  renderRoundProgress();
  setGameSurfaceMode(true);
  updateSkipCardButtonState();

  const pct = Math.round((totalCorrect / sessionCards.length) * 100);
  document.getElementById("finalScore").textContent = `${pct}%`;

  const secs = roundTimerStarted && sessionStart
    ? Math.round((finishedAt - sessionStart) / 1000)
    : 0;
  if (finalTimeEl) {
    finalTimeEl.textContent = formatRoundTime(secs);
  }
  const typingMetrics = getSessionTypingMetrics(finishedAt);
  const wpm = typingMetrics.displayedWpm === null
    ? 0
    : Math.round(typingMetrics.displayedWpm * 10) / 10;
  const wpmText = formatWpm(wpm);
  if (finalCorrectEl) finalCorrectEl.textContent = `${totalCorrect}/${sessionCards.length}`;
  if (finalSkippedEl) finalSkippedEl.textContent = String(skippedCount);
  if (finalStreakEl) finalStreakEl.textContent = String(bestStreak);
  if (finalWpmEl) finalWpmEl.textContent = wpmText;
  document.getElementById("finalDetails").textContent =
    t("messages.session.finalDetails", {
      correct: totalCorrect,
      total: sessionCards.length,
      skipped: skippedCount,
      streak: bestStreak,
      wpm: wpmText,
      secs,
    });
  document.getElementById("finalEmoji").textContent =
    pct === 100 ? t("messages.session.emojiPerfect") :
    pct >= 80 ? t("messages.session.emojiStrong") :
    pct >= 60 ? t("messages.session.emojiGood") :
    t("messages.session.emojiPractice");
}

function triggerEnterTimeBurst() {
  showEnterTimeBurst({
    currentCardShownAt,
    getElapsedMs: getSessionTypingElapsedMs,
  });
}

function initInputEvents() {
  sessionSizeSliderEl?.addEventListener("input", syncSessionSizeLabel);
  catCountEl?.addEventListener("click", () => {
    extendedRoundSize = !extendedRoundSize;
    categoryPanelController.updateRoundSizeControl(getPool().length);
  });
  newGameBtn?.addEventListener("click", () => {
    if (firstRunTour?.playFromWelcome()) {
      return;
    }
    startSession(getRequestedSessionSize());
  });
  restartBtnEl?.addEventListener("click", () => {
    startSession(getRequestedSessionSize());
  });
  sessionSettingsBtnEl?.addEventListener("click", () => {
    document.getElementById("catPanel")?.scrollIntoView({
      behavior: prefersReducedEffects() ? "instant" : "smooth",
      block: "start",
      inline: "nearest",
    });
  });

  languageDockButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchLearningMode(button.dataset.lang);
    });
  });

  const arrowActions = {
    ArrowRight: () => skipCurrentCard(),
    ArrowLeft: () => goBackToPreviousCard(),
    ArrowUp: () => switchLearningMode(cycleLearningMode()),
    ArrowDown: () => hintBtnEl?.click(),
  };

  let arrowPressTimer = 0;
  const lightArrowButton = (key) => {
    const button = arrowDockButtons.find((candidate) => candidate.dataset.arrow === key);
    if (!button) {
      return;
    }

    button.classList.remove("is-pressed");
    void button.offsetWidth;
    button.classList.add("is-pressed");
    window.clearTimeout(arrowPressTimer);
    arrowPressTimer = window.setTimeout(() => {
      button.classList.remove("is-pressed");
    }, 180);
  };

  arrowDockButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = arrowActions[button.dataset.arrow];
      if (!action) {
        return;
      }
      lightArrowButton(button.dataset.arrow);
      action();
    });
  });

  for (const button of [skipCardBtnEl, hintBtnEl]) {
    if (!button) continue;
    let cornerPulse;
    button.addEventListener("click", () => {
      if (prefersReducedEffects()) return;
      cornerPulse?.cancel();
      cornerPulse = button.animate(
        [
          { transform: "scale(1)", offset: 0 },
          { transform: "scale(0.97)", offset: 0.28 },
          { transform: "scale(1.06)", offset: 0.62 },
          { transform: "scale(1)", offset: 1 }
        ],
        { duration: 300, easing: "cubic-bezier(0.22, 0.9, 0.3, 1.18)" }
      );
    });
  }

  if (skipCardBtnEl) {
    skipCardBtnEl.addEventListener("click", () => {
      skipCurrentCard();
    });
  }

  function pulseEnterKeyBadge() {
    if (!enterKeyBtnEl) {
      return;
    }
    window.clearTimeout(enterKeyPulseTimer);
    enterKeyBtnEl.classList.remove("is-key-pressed");
    void enterKeyBtnEl.offsetWidth;
    enterKeyBtnEl.classList.add("is-key-pressed");
    enterKeyPulseTimer = window.setTimeout(() => {
      enterKeyBtnEl.classList.remove("is-key-pressed");
      enterKeyPulseTimer = 0;
    }, 300);
  }

  enterKeyBtnEl?.addEventListener("click", () => {
    if (!sessionCards.length) {
      return;
    }
    pulseEnterKeyBadge();
    triggerEnterTimeBurst();
    submitCurrentAnswer({ finishNow: true });
    if (!mainCard.classList.contains("is-session-ended")) focusAnswerInputAtEnd();
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.defaultPrevented ||
      event.repeat ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      onboardingPending ||
      firstRunTour?.isOpen()
    ) {
      return;
    }

    const action = arrowActions[event.key];
    if (!action) {
      return;
    }

    event.preventDefault();
    lightArrowButton(event.key);
    action();
  });

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

  mainCard?.addEventListener("click", (event) => {
    if (!shouldTapFocusAnswerInput(event.target)) {
      return;
    }

    focusAnswerInputAtEnd();
  });

  inputEl.addEventListener("input", () => {
    if (!sessionCards.length) {
      return;
    }

    if (!roundTimerStarted && inputEl.value.length > 0) {
      startRoundTimer();
    }

    if (!isRenderableCard(sessionCards[sessionIndex])) {
      void recoverPlayableSession("input-invalid-card", sessionCards.length || SESSION_SIZE);
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    const typedValue = inputEl.value;
    const addedTypingUnits = countInsertedTypingUnits(previousTypedValue, typedValue);
    if (addedTypingUnits > 0) {
      totalTypingUnits += addedTypingUnits;
    }
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

    if (currentExact) {
      scheduleAutoSubmit(target, sessionCards[sessionIndex]);
    } else {
      cancelAutoSubmit();
    }
  });

  hintBtnEl?.addEventListener("click", () => {
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
    inputEl.className = "";
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

  document.addEventListener("keydown", (event) => {
    if (!pendingFinishAt || event.key !== "Enter" || event.repeat ||
        event.isComposing || event.ctrlKey || event.altKey || event.metaKey ||
        firstRunTour?.isOpen()) return;
    event.preventDefault();
    event.stopPropagation();
    pulseEnterKeyBadge();
    triggerEnterTimeBurst();
    showSessionEnd();
  }, { capture: true });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !sessionCards.length) {
      return;
    }
    event.preventDefault();
    if (event.repeat || event.isComposing) return;
    pulseEnterKeyBadge();
    triggerEnterTimeBurst();
    submitCurrentAnswer();
  });
}

let visualEffects = null;

async function initApp() {
  updateSearchLinks(null);
  syncSessionSizeLabel();
  learningMode = loadLearningMode();
  isPromptOrderSwapped = loadPromptOrderPreference();
  const [loadedLocales, baseCards, loadedPersistentCards, currentCapabilities] = await Promise.all([
    loadLocales(),
    fetchJson("cards.json", []),
    fetchJson("cards.user.json", []),
    detectCapabilities(),
  ]);

  locales = loadedLocales || {};
  applyLearningTheme();
  renderStaticUi();
  visualEffects = initVisualEffects({
    button: document.getElementById("visualEffectsBtn"), getLanguage: getLocale,
  });
  categoryPanelController.initPreviewObserver();
  initFirstRunTour();
  installGuideController.init();
  initDifficultyControls();
  initInputEvents();
  initAnswerGuideResizeObserver();
  cardAuthoringController.init();
  capabilities = currentCapabilities;
  bundledCards = Array.isArray(baseCards)
    ? baseCards.map(sanitizeCard).filter(Boolean)
    : [];
  persistentCards = Array.isArray(loadedPersistentCards)
    ? loadedPersistentCards.map(sanitizeCard).filter(Boolean)
    : [];
  sessionOnlyCards = capabilities.persistentSave ? [] : loadSessionAuthoringCards();
  allCards = mergeCards(bundledCards, persistentCards, sessionOnlyCards);
  cardDuplicateIndex.rebuild(allCards);

  cardAuthoringController.renderMode();
  factsController.init();
  renderStaticUi();
  categoryPanelController.buildTopicPanel();
  hasBootstrappedApp = true;
  initPageScrollAssist({
    targets: () => [
      { element: heroStageEl },
      { element: mainCard, isMainCard: true },
      { element: document.getElementById("catPanel") },
      { element: searchPanelEl },
      { element: factsPanelEl, requiresLoadedContent: true, isLoaded: () => factsController.isLoaded },
    ],
    shouldPause: () => onboardingPending || firstRunTour?.isOpen() || Boolean(onboardingDialogEl?.open),
  });
  await recoverPlayableSession("init-app", SESSION_SIZE);
  if (onboardingPending) {
    firstRunTour?.open();
  }
}

const factsController = createFactsController({ t, getLocale, getLocaleBundle, getTargetLanguage });

window.startSession = startSession;
viewportController.init();
initAppLoader();
initApp()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    hideAppLoader();
  });
