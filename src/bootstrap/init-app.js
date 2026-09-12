import { createFactsController } from "../facts/controller.js";
import {
  SESSION_SIZE,
  MAX_SESSION_SKIPS,
  AUTO_SUBMIT_DELAY_MS,
  SESSION_STORAGE_KEY,
  AUTOFILL_TRAILING_PUNCT,
  EMERGENCY_FALLBACK_CARD,
  LEARNING_MODE_STORAGE_KEY,
  PROMPT_ORDER_STORAGE_KEY,
} from "../config/app.js";
import { getSecureRandomRange, shuffle } from "../core/random.js";
import { getByPath, formatTemplate, getCardValue, formatRoundTime } from "../core/text.js";
import { fetchJson, detectCapabilities } from "../core/http.js";
import {
  getCorrectPrefixLength,
  getGuideSeparatorKind,
  isGuideSeparatorChar,
  getGuideSeparatorSymbol,
  getGuideTokens,
  getGuideWordTokens,
  getGuideWordTokenAt,
  getGuidePreviousWordToken,
  getFreshCorrectIndexes,
  getFreshWrongIndexes,
  isExactTypedMatch,
} from "../game/answer-analysis.js";
import {
  clampNumber,
  getScaledFontPx,
  computeResponsiveTypeProfile,
  hasResponsiveTypeProfileChanged,
  DEFAULT_TYPE_PROFILE,
  clampGameDensity,
  getNextDenserDensity,
  getGameDensityProfile,
  getNextAnswerGuideSizingTier,
  getAnswerGuideLengthBucket,
  PROMPT_FIT_PROFILES,
  ANSWER_GUIDE_SIZE_PROFILES,
  ANSWER_GUIDE_HEIGHT_BUDGETS,
} from "../layout/type-profiles.js";
import {
  promptEl,
  promptSub,
  promptPrimaryFlagEl,
  promptSecondaryFlagEl,
  inputFlagEl,
  siteTitleEl,
  siteTitleRowEl,
  heroStageEl,
  phoneGuideBarEl,
  languageDockEl,
  languageDockButtons,
  arrowDockEl,
  arrowDockButtons,
  arrowDockLabelEls,
  appLoaderEl,
  appLoaderSpinnerEl,
  onboardingDialogEl,
  installGuidePanelEl,
  installGuideBrowserPanelEl,
  installGuideBrowserEl,
  installGuideStepsEl,
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
  answerGuideBodyEl,
  answerGuideTrailFlagEl,
  answerGuideActionRowEl,
  roundTimerEl,
  finalTimeEl,
  answerGuideLabelEl,
  answerGuideStatusEl,
  answerGuideNoteEl,
  feedbackBurstEl,
  progFill,
  categoryEl,
  comboPop,
  gameArea,
  sessionEndEl,
  mainCard,
  progressTrackEl,
  statsBarEl,
  catCountEl,
  catButtonsLabelEl,
  subcategoryFilterLabelEl,
  subcategoryButtonsEl,
  settingsPanelTitleTextEl,
  tutorialReplayBtnEl,
  catPanelTitleEl,
  difficultyHardBtn,
  difficultyMediumBtn,
  difficultyEasyBtn,
  sessionSizeSliderEl,
  sliderLabelEl,
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
  addCardForm,
  addCardDeEl,
  addCardHrEl,
  addCardEnEl,
  addCardTopicEl,
  addCardSubcategoryEl,
  addCardScopeEl,
  authorLabelDeEl,
  authorLabelTopicEl,
  authorLabelSubcategoryEl,
  authorLabelScopeEl,
  authorLabelHrEl,
  authorLabelEnEl,
  addCardSaveBtn,
  exportCardsBtn,
  addCardStatusEl,
  authorModeEl,
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
  finalCorrectEl,
  finalSkippedEl,
  finalStreakEl,
  finalWpmEl,
  siteFooterLinkEl,
} from "../ui/dom.js";
import { setLanguageFlagIcon } from "../ui/language-flags.js";
import { LANGUAGE_SEQUENCE, LANGUAGE_DOCK_LABELS, LANGUAGE_TITLES } from "../config/languages.js";
import { DEFAULT_SUBCATEGORIES, SUBCATEGORY_COLORS, SUBCATEGORY_ICONS } from "../config/categories.js";
import { searchSites } from "../search/sites.js";
import { createPretextBlockController } from "../layout/pretext.js";
import { renderGrammarReference } from "../grammar/reference-view.js";
import { createFirstRunTour } from "../onboarding/first-run-tour.js";

import {
  CARD_SCOPE_OPTIONS,
  MODE_SCOPE_MAP,
  SUBCATEGORY_OPTIONS,
  TOPIC_CONFIG,
  TOPIC_OPTIONS,
  cardKey,
  mergeCards,
  normalizeAnswer,
  sanitizeCard,
} from "../../shared/card-schema.js";

let allCards = [];
let bundledCards = [];
let persistentCards = [];
let sessionOnlyCards = [];
let selectedTopics = null;

let selectedSubcategories = new Set(DEFAULT_SUBCATEGORIES);

let mixedTopicFeedbackTimer = 0;
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
let sessionSkipCounts = new WeakMap();
let sessionSkippedCards = new WeakSet();
let cardStateByCard = new WeakMap();
let pendingAdvanceTimer = 0;
let autoSubmitTimer = 0;
let scoredCardEvents = new WeakSet();
let difficulty = "easy";
let previousTypedValue = "";
let feedbackBurstTimer = null;
let answerGuideCompleteTimer = null;
let enterKeyPulseTimer = 0;
let feedbackBurstPieces = [];
let answerGuideMeasureFrame = 0;
let answerGuideResizeObserver = null;
let onboardingCategoryPreviewResizeObserver = null;
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
let languageDockZoomFrame = 0;
let installGuideLayoutFrame = 0;
let statsAnimationFrame = 0;
let statsAnimationToken = 0;
let previousStatsSnapshot = null;
const statsAnimationTimers = new WeakMap();
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

function initScrollSnapController() {
  let settleTimer = 0;
  let snapReleaseTimer = 0;
  let isSnapping = false;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let lastScrollAt = performance.now();
  let lastScrollVelocity = 0;

  function getSnapPositions() {
    const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
    const getPosition = (element) => {
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const rawPosition = scrollY + rect.top;

      return Math.max(0, Math.min(maxScrollY, rawPosition));
    };

    return [
      { element: heroStageEl, position: 0 },
      { element: mainCard, position: getPosition(mainCard) },
      { element: searchPanelEl, position: getPosition(searchPanelEl) },
      { element: factsPanelEl, position: getPosition(factsPanelEl) },
    ].filter((target) => target.element && target.position !== null);
  }

  function settleScrollPosition() {
    // Facts replace their compact loading state with a much taller reading
    // surface. Never calculate or apply a snap against that temporary page
    // geometry.
    if (isSnapping || !factsController.isLoaded || onboardingPending || firstRunTour?.isOpen()) {
      return;
    }

    const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    // Momentum scrolling can briefly pause between large wheel/touchpad
    // deltas. Do not start a second scroll animation while that motion is
    // still settling; it makes the card and its measured grid fight the
    // browser's scroll position.
    if (lastScrollVelocity > 0.8) {
      lastScrollVelocity = 0;
      scheduleSettle(260);
      return;
    }
    const snapThreshold = viewportHeight / 3;
    const mainCardSnapThreshold = viewportHeight / 10;
    const nearestTarget = getSnapPositions()
      .map((target) => ({ ...target, distance: Math.abs(target.position - scrollY) }))
      .sort((left, right) => left.distance - right.distance)[0];

    if (!nearestTarget || nearestTarget.distance < 1) {
      return;
    }

    const targetThreshold = nearestTarget.element === mainCard
      ? mainCardSnapThreshold
      : snapThreshold;
    if (nearestTarget.distance > targetThreshold) {
      return;
    }

    isSnapping = true;
    window.clearTimeout(snapReleaseTimer);
    snapReleaseTimer = window.setTimeout(() => {
      isSnapping = false;
    }, 800);
    window.scrollTo({
      top: nearestTarget.position,
      // An immediate correction avoids a second compositor animation racing
      // with native wheel/touchpad momentum.
      behavior: "auto",
    });
  }

  function scheduleSettle(delay = 260) {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleScrollPosition, delay);
  }

  window.addEventListener("scroll", () => {
    const now = performance.now();
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const elapsed = Math.max(1, now - lastScrollAt);
    lastScrollVelocity = Math.abs(scrollY - lastScrollY) / elapsed;
    lastScrollY = scrollY;
    lastScrollAt = now;
    scheduleSettle();
  }, { passive: true });
  window.addEventListener("scrollend", () => {
    if (isSnapping) {
      isSnapping = false;
      window.clearTimeout(snapReleaseTimer);
      return;
    }
    scheduleSettle(80);
  }, { passive: true });
}

const FEEDBACK_BURST_SYMBOLS = Object.freeze({
  success: Object.freeze({
    big: Object.freeze(["\u{1F389}", "\u2728", "\u2B50", "\u{1F4A5}", "\u{1F38A}", "\u2728", "\u2B50", "\u{1F389}", "\u{1F4AB}", "\u2728"]),
    small: Object.freeze(["\u2728", "\u2B50", "\u{1F4AB}", "\u2728", "\u2B50", "\u2728"]),
  }),
  error: Object.freeze(["\u2716", "\u26A1", "\u2715", "\u26A0", "\u2716", "\u26A1"]),
});

function getResponsiveTypeProfile() {
  return viewportProfile.typeProfile || DEFAULT_TYPE_PROFILE;
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
  rootStyle.setProperty("--type-height-scale", String(profile.heightScale));
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

function getCurrentGameDensity() {
  return clampGameDensity(document.body?.dataset?.gameDensity);
}

function getPromptAvailableHeight(element) {
  const row = element?.closest?.(".prompt-row");
  if (!row) {
    return Number.POSITIVE_INFINITY;
  }

  const rowStyle = window.getComputedStyle(row);
  const verticalPadding =
    Number.parseFloat(rowStyle.paddingTop || "0") +
    Number.parseFloat(rowStyle.paddingBottom || "0");

  return Math.max(1, row.clientHeight - verticalPadding - 4);
}

function getPromptFitProfile({ text, width, height, density, kind }) {
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
  const widthScale = clampNumber(width / 390, 0.72, 1.45);
  const promptScale = Math.min(bodyScale, widthScale);
  const minFontPx = getScaledFontPx(baseProfile.minFontPx, promptScale);
  const maxFontPx = getScaledFontPx(baseProfile.maxFontPx, promptScale);
  const heightLineLimit = Number.isFinite(height)
    ? Math.max(1, Math.floor(height / Math.max(1, minFontPx * baseProfile.lineHeightRatio)))
    : baseProfile.maxLines;

  return {
    ...baseProfile,
    minFontPx,
    maxFontPx,
    maxLines: Math.max(baseProfile.maxLines, Math.min(14, heightLineLimit)),
    maxHeight: height,
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

function syncAnswerGuideTrailPosition() {
  if (!answerGuideTrailFlagEl || !answerGuideBodyEl || !answerGuideActionRowEl || !skipCardBtnEl) {
    return;
  }

  const skipRect = skipCardBtnEl.getBoundingClientRect();
  const actionRect = answerGuideActionRowEl.getBoundingClientRect();
  const bodyRect = answerGuideBodyEl.getBoundingClientRect();
  const midpoint = (skipRect.bottom + actionRect.bottom) / 2;
  const relativeTop = midpoint - bodyRect.top;

  if ([skipRect.bottom, actionRect.bottom, bodyRect.top, relativeTop].every(Number.isFinite)) {
    answerGuideTrailFlagEl.style.setProperty("--answer-guide-trail-top", `${relativeTop}px`);
  }
}

function scheduleAnswerGuideMeasure(reason) {
  void reason;
  if (answerGuideMeasureFrame || !answerGuideEl || !answerGuideBodyEl || !wordGrid) {
    return;
  }

  answerGuideMeasureFrame = window.requestAnimationFrame(() => {
    answerGuideMeasureFrame = 0;
    measureAnswerGuideBodyHeight();
    applyAnswerGuideResponsiveSizing();
    syncAnswerGuideTrailPosition();
  });
}

function initAnswerGuideResizeObserver() {
  if (!answerGuideEl || !answerGuideBodyEl || typeof window.ResizeObserver !== "function") {
    return;
  }

  answerGuideResizeObserver?.disconnect();
  answerGuideResizeObserver = new window.ResizeObserver(() => {
    scheduleAnswerGuideMeasure("answer-guide-resize");
  });
  answerGuideResizeObserver.observe(answerGuideEl);
  answerGuideResizeObserver.observe(answerGuideBodyEl);
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
    document.body.classList.remove("has-expanded-answer-guide");
    return;
  }

  if (measureAnswerGuideBodyHeight() > budget) {
    tier = getNextAnswerGuideSizingTier(tier);
    setAnswerGuideResponsiveVars(tier);
  }

  document.body.classList.toggle(
    "has-expanded-answer-guide",
    measureAnswerGuideBodyHeight() > budget
  );

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
  mainCard?.classList.toggle("is-session-ended", showSessionEnd);
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

  const nextPhonePortrait = nextViewport.width <= 700;
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
    grammarSliderControllers.forEach((controller) => controller?.rerender?.());
  }

  if (sizeChanged || layoutChanged) {
    maybeShowInstallGuide();
  }

  if ((sizeChanged || densityChanged || typeProfileChanged) && sessionCards.length && sessionCards[sessionIndex]) {
    promptController?.relayout();
    promptSubController?.relayout();
    buildWordGrid(getTargetValue(sessionCards[sessionIndex]), inputEl.value);
  }

  scheduleCardTopbarLayoutSync();
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
  lineHeightRatio: 1.05,
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

function isCardScopeCompatible(card) {
  return Boolean(card) && (card.scope === "all" || card.scope === getCurrentScopeMode());
}

function getTopicColor(topic) {
  return TOPIC_CONFIG[topic]?.color || "#888";
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

function goForwardToNextCard() {
  if (sessionIndex >= sessionCards.length - 1) {
    return false;
  }

  return navigateToCardIndex(sessionIndex + 1);
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
  arrowDockEl?.style.setProperty("--language-dock-zoom-scale", String(scale));
  const dockRect = languageDockEl.getBoundingClientRect();
  const isTooLarge =
    viewportWidth < 280 ||
    dockRect.width > viewportWidth * 0.24 ||
    dockRect.height > viewportHeight * 0.16;
  const isHidden = ratio < 0.52 && isTooLarge;
  languageDockEl.classList.toggle("is-zoom-hidden", isHidden);
  arrowDockEl?.classList.toggle("is-zoom-hidden", isHidden);
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
  if (!grammarGridEl) return;
  grammarSliderControllers.forEach(controller => controller?.destroy?.());
  grammarGridEl.replaceChildren();
  grammarSliderControllers = renderGrammarReference(
    grammarGridEl, getLocaleBundle()?.grammar?.cards || [], getLocale()
  );
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
  fillAuthoringSelects();
  setLocalizedText(factsPanelTitleEl, "facts.panelTitle");
  setLocalizedText(factsPanelSubtitleEl, "facts.panelSubtitle");
  setLocalizedText(factsCountryBtn, "facts.tabs.germany");
  setLocalizedText(factsStatesBtn, "facts.tabs.europe");
  setLocalizedText(factsWorldBtn, "facts.tabs.world");
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
  window.clearTimeout(languageSwitchCleanupTimer);
  const languageSwitchToken = ++pendingLanguageSwitchToken;
  saveCurrentCardState();
  document.body.classList.add("is-language-switching");
  if (siteTitleEl) {
    siteTitleEl.classList.remove("is-changing-in");
    siteTitleEl.classList.add("is-changing-out");
  }

  pendingLanguageSwitchTimer = window.setTimeout(async () => {
    pendingLanguageSwitchTimer = 0;
    if (languageSwitchToken !== pendingLanguageSwitchToken) {
      return;
    }

    learningMode = nextLanguage;
    saveLearningMode();
    applyLearningTheme();
    renderStaticUi();
    maybeShowInstallGuide();
    renderAuthoringMode();
    buildTopicPanel();
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

    if (siteTitleEl) {
      siteTitleEl.classList.remove("is-changing-out");
      siteTitleEl.classList.add("is-changing-in");
      window.setTimeout(() => siteTitleEl.classList.remove("is-changing-in"), 340);
    }

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

async function loadLocales() {
  return fetchJson("locales.json?v=2026-08-21-onboarding4", null);
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

function setTopicButtonContent(button, label, icon = "•") {
  const iconEl = document.createElement("span");
  iconEl.className = "cat-btn-icon";
  iconEl.setAttribute("aria-hidden", "true");

  const glyphEl = document.createElement("span");
  glyphEl.className = "cat-btn-icon-glyph";
  glyphEl.textContent = icon;
  iconEl.appendChild(glyphEl);

  const labelEl = document.createElement("span");
  labelEl.className = "cat-btn-label";
  labelEl.textContent = label;

  button.replaceChildren(iconEl, labelEl);
}

function playMixedTopicReselectFeedback() {
  const button = document.querySelector("#catButtons .cat-btn.mixed.active");
  if (!button) {
    return;
  }

  window.clearTimeout(mixedTopicFeedbackTimer);
  button.classList.remove("is-reselecting");
  void button.offsetWidth;
  button.classList.add("is-reselecting");
  mixedTopicFeedbackTimer = window.setTimeout(() => {
    button.classList.remove("is-reselecting");
    mixedTopicFeedbackTimer = 0;
  }, 220);
}

function updateOnboardingCategoryPreviewTarget() {
  const container = document.getElementById("catButtons");
  const target = container?.querySelector('[data-onboarding-target="category-preview"]');
  if (!container || !target) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const rows = [];
  Array.from(container.children)
    .filter((button) => button.classList.contains("cat-btn"))
    .forEach((button) => {
      const rect = button.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const currentRow = rows[rows.length - 1];
      if (!currentRow || Math.abs(rect.top - currentRow.top) > 1) {
        rows.push({ top: rect.top, bottom: rect.bottom });
      } else {
        currentRow.bottom = Math.max(currentRow.bottom, rect.bottom);
      }
    });

  const previewRows = rows.slice(0, 3);
  if (!previewRows.length) {
    target.style.height = "0px";
    return;
  }

  const previewTop = previewRows[0].top - containerRect.top;
  const previewBottom = previewRows[previewRows.length - 1].bottom - containerRect.top;
  target.style.top = `${Math.max(0, previewTop)}px`;
  target.style.height = `${Math.max(0, previewBottom - previewTop)}px`;
}

function initOnboardingCategoryPreviewTarget() {
  updateOnboardingCategoryPreviewTarget();
  window.addEventListener("resize", updateOnboardingCategoryPreviewTarget, { passive: true });
  window.addEventListener("orientationchange", updateOnboardingCategoryPreviewTarget, { passive: true });

  const container = document.getElementById("catButtons");
  if (container && typeof ResizeObserver === "function") {
    onboardingCategoryPreviewResizeObserver = new ResizeObserver(updateOnboardingCategoryPreviewTarget);
    onboardingCategoryPreviewResizeObserver.observe(container);
  }
}

function buildTopicPanel() {
  const container = document.getElementById("catButtons");
  container.innerHTML = "";

  const previewTarget = document.createElement("span");
  previewTarget.className = "onboarding-category-preview-target";
  previewTarget.dataset.onboardingTarget = "category-preview";
  previewTarget.setAttribute("aria-hidden", "true");
  container.appendChild(previewTarget);

  const mixBtn = document.createElement("button");
  mixBtn.type = "button";
  mixBtn.className = `cat-btn mixed${selectedTopics === null ? " active" : ""}`;
  mixBtn.style.setProperty("--cat-color", "#e8ff47");
  mixBtn.setAttribute("aria-pressed", String(selectedTopics === null));
  setTopicButtonContent(mixBtn, t("messages.categories.mixed"), "🧩");
  mixBtn.onclick = () => {
    const wasAlreadySelected = selectedTopics === null;
    selectedTopics = null;
    buildTopicPanel();
    if (wasAlreadySelected) {
      playMixedTopicReselectFeedback();
    }
  };
  container.appendChild(mixBtn);

  TOPIC_OPTIONS.forEach((topic) => {
    const color = getTopicColor(topic);
    const isActive = selectedTopics !== null && selectedTopics.has(topic);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-btn${isActive ? " active" : ""}`;
    btn.dataset.topic = topic;
    btn.setAttribute("aria-pressed", String(isActive));
    setTopicButtonContent(btn, getTopicLabel(topic), TOPIC_CONFIG[topic]?.icon);
    btn.style.setProperty("--cat-color", color);
    btn.style.borderColor = `${color}70`;
    btn.style.color = isActive ? "#07101b" : "#fff";
    btn.style.background = isActive
      ? color
      : `linear-gradient(135deg, ${color}b8, ${color}52), linear-gradient(180deg, rgba(18, 28, 64, 0.88), rgba(8, 14, 34, 0.94))`;
    const iconEl = btn.querySelector(".cat-btn-icon");
    if (iconEl) {
      iconEl.style.color = isActive ? "#07101b" : color;
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

  updateOnboardingCategoryPreviewTarget();

  buildSubcategoryPanel();

  const pool = getPool();
  catCountEl.textContent = `${pool.length} ${t("messages.categories.unit")}`;
  newGameBtn.disabled = pool.length === 0;
}

function buildSubcategoryPanel() {
  if (!subcategoryButtonsEl) {
    return;
  }

  subcategoryButtonsEl.replaceChildren();
  const options = [null, ...SUBCATEGORY_OPTIONS];
  options.forEach((subcategory, index) => {
    const isActive = subcategory === null
      ? selectedSubcategories === null
      : selectedSubcategories?.has(subcategory) === true;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `subcategory-btn${subcategory === null ? " subcategory-btn-all" : ""}${isActive ? " active" : ""}`;
    if (subcategory) {
      button.style.setProperty("--subcategory-color", SUBCATEGORY_COLORS[index - 1]);
    }
    button.dataset.subcategory = subcategory || "all";
    button.setAttribute("aria-pressed", String(isActive));
    const icon = document.createElement("span");
    icon.className = "subcategory-btn-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = SUBCATEGORY_ICONS[subcategory || "all"];
    const label = document.createElement("span");
    label.className = "subcategory-btn-label";
    label.textContent = subcategory ? getSubcategoryLabel(subcategory) : t("messages.categories.classAll");
    button.replaceChildren(icon, label);
    button.addEventListener("click", () => {
      if (subcategory === null) {
        selectedSubcategories = null;
      } else {
        if (selectedSubcategories === null) {
          selectedSubcategories = new Set();
        }
        if (selectedSubcategories.has(subcategory)) {
          selectedSubcategories.delete(subcategory);
          if (selectedSubcategories.size === 0) {
            selectedSubcategories = null;
          }
        } else {
          selectedSubcategories.add(subcategory);
        }
      }
      buildTopicPanel();
    });
    subcategoryButtonsEl.appendChild(button);
  });
}

function getPool() {
  const topicFiltered = selectedTopics === null
    ? allCards
    : allCards.filter((card) => selectedTopics.has(card.topic));
  const subcategoryFiltered = selectedSubcategories === null
    ? topicFiltered
    : topicFiltered.filter((card) => selectedSubcategories.has(card.subcategory));
  return subcategoryFiltered.filter(isCardScopeCompatible);
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

function submitCurrentAnswer() {
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
      totalCharsTyped += target.length;
      totalAttempts += 1;
      if (!forceCorrection) {
        totalCorrect += 1;
        streak += 1;
        if (streak > bestStreak) {
          bestStreak = streak;
        }
        showCombo();
        showToast(getEncouragement(streak));
      }
    }
    inputEl.className = "correct";
    updateStats({ event: "correct" });
    saveCurrentCardState();
    cancelPendingCardAdvance();
    const completedCard = card;
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
    }, 140);
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

  if (!showTerminalStatus && (caretIndex > target.length || !target.length)) {
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

function updateRoundTimer() {
  if (!roundTimerEl || !sessionStart) {
    return;
  }
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStart) / 1000));
  roundTimerEl.textContent = formatRoundTime(elapsedSeconds);
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

function resetSessionProgress() {
  sessionIndex = 0;
  streak = 0;
  bestStreak = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  skippedCount = 0;
  sessionSkipsUsed = 0;
  totalCharsTyped = 0;
  sessionStart = 0;
  roundTimerStarted = false;
  if (roundTimerEl) {
    roundTimerEl.textContent = formatRoundTime(0);
  }
  sessionSkipCounts = new WeakMap();
  sessionSkippedCards = new WeakSet();
  cardStateByCard = new WeakMap();
  cancelPendingCardAdvance();
  scoredCardEvents = new WeakSet();
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

  if (selectedSubcategories !== null) {
    selectedSubcategories = new Set(DEFAULT_SUBCATEGORIES);
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

  animateStatsOnStart();

  const scrollTarget = heroStageEl || mainCard;
  scrollTarget.scrollIntoView({
    behavior: "smooth",
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
  renderPrompt(card);
  progFill.style.width = `${(sessionIndex / sessionCards.length) * 100}%`;

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

function replayStatsClass(element, className, duration = 720) {
  if (!element) {
    return;
  }

  const currentTimer = statsAnimationTimers.get(element);
  if (currentTimer) {
    window.clearTimeout(currentTimer);
  }
  ["is-rise", "is-drop", "is-improving", "is-declining", "is-count-change", "is-event-success", "is-event-error", "is-event-skip"].forEach((transientClass) => {
    element.classList.remove(transientClass);
  });
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  statsAnimationTimers.set(element, window.setTimeout(() => {
    element.classList.remove(className);
    statsAnimationTimers.delete(element);
  }, duration));
}

function updateStats({ event = "update" } = {}) {
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

  const minutes = (Date.now() - sessionStart) / 60000;
  nextSnapshot.wpm = minutes > 0 && totalCharsTyped > 0
    ? Math.round((totalCharsTyped / 5) / minutes)
    : null;
  if (wpmEl) {
    wpmEl.textContent = nextSnapshot.wpm || "—";
  }

  const previous = previousStatsSnapshot;
  previousStatsSnapshot = nextSnapshot;
  if (!previous || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
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

function animateStatsOnStart() {
  if (!statsBarEl) {
    return;
  }

  const animationToken = ++statsAnimationToken;
  if (statsAnimationFrame) {
    window.cancelAnimationFrame(statsAnimationFrame);
    statsAnimationFrame = 0;
  }

  statsBarEl.classList.remove("is-starting");
  statsBarEl.querySelectorAll(".stat").forEach((stat) => stat.classList.remove("is-starting"));

  // Force a style boundary so pressing START twice reliably replays the
  // entrance animation instead of leaving the stats in their final state.
  void statsBarEl.offsetWidth;
  statsBarEl.classList.add("is-starting");
  statsBarEl.querySelectorAll(".stat").forEach((stat, index) => {
    stat.style.setProperty("--stat-delay", `${index * 90}ms`);
    stat.classList.add("is-starting");
  });

  const remainingEl = document.getElementById("remainingVal");
  const target = Number.parseInt(remainingEl?.textContent || "", 10);
  if (remainingEl && Number.isFinite(target) && target > 0 && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    const startedAt = performance.now();
    const duration = 720;
    const tick = (now) => {
      if (animationToken !== statsAnimationToken) {
        return;
      }
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      remainingEl.textContent = String(Math.max(1, Math.round(target * eased)));
      if (progress < 1) {
        statsAnimationFrame = window.requestAnimationFrame(tick);
      } else {
        statsAnimationFrame = 0;
      }
    };
    statsAnimationFrame = window.requestAnimationFrame(tick);
  }

  window.setTimeout(() => {
    if (animationToken === statsAnimationToken) {
      statsBarEl.classList.remove("is-starting");
      statsBarEl.querySelectorAll(".stat").forEach((stat) => {
        stat.classList.remove("is-starting");
        stat.style.removeProperty("--stat-delay");
      });
    }
  }, 1500);
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
  const browserPrefix = t("installGuide.browserPrefix");
  const browserText = browserPrefix === "installGuide.browserPrefix"
    ? `${context.browserLabel}: ${resolvedPath}`
    : `${browserPrefix} ${context.browserLabel}: ${resolvedPath}`;
  const stepsText = t("installGuide.cta");

  installGuideBrowserEl.textContent = browserText;
  installGuideStepsEl.textContent = stepsText;
  renderPhoneInstallGuide(browserText, stepsText);
}

function setDesktopInstallGuideShellVisible(isVisible) {
  const wasVisible = siteTitleRowEl?.classList.contains("has-install-guides") || false;
  siteTitleRowEl?.classList.toggle("has-install-guides", isVisible);
  if (wasVisible !== isVisible) {
    siteTitleController?.relayout();
  }
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

function initFirstRunTour() {
  let restoreSessionEndAfterReplay = false;

  // Keep the launch screen owned by the learning card, even for older cached HTML.
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
      maybeShowInstallGuide();
    },
    onClose: ({ replay, reason }) => {
      const onboardingDuration = onboardingOpenedAt
        ? Math.max(0, Date.now() - onboardingOpenedAt)
        : 0;
      onboardingOpenedAt = 0;
      onboardingPending = false;
      gameArea?.removeAttribute("inert");
      sessionEndEl?.removeAttribute("inert");
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
          behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
          block: "start",
          inline: "nearest",
        });
      }
      updateStats();
      window.setTimeout(maybeShowInstallGuide, 0);
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
  stopRoundTimer();
  progFill.style.width = "100%";
  setGameSurfaceMode(true);
  updateSkipCardButtonState();

  const pct = Math.round((totalCorrect / sessionCards.length) * 100);
  document.getElementById("finalScore").textContent = `${pct}%`;

  const secs = roundTimerStarted && sessionStart
    ? Math.round((Date.now() - sessionStart) / 1000)
    : 0;
  if (finalTimeEl) {
    finalTimeEl.textContent = formatRoundTime(secs);
  }
  const wpm = secs > 0 ? Math.round((totalCharsTyped / 5) / (secs / 60)) : 0;
  if (finalCorrectEl) finalCorrectEl.textContent = `${totalCorrect}/${sessionCards.length}`;
  if (finalSkippedEl) finalSkippedEl.textContent = String(skippedCount);
  if (finalStreakEl) finalStreakEl.textContent = String(bestStreak);
  if (finalWpmEl) finalWpmEl.textContent = String(wpm);
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
    if (firstRunTour?.playFromWelcome()) {
      return;
    }
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

  // Grow inward from the shared frame corner; never translate the attached edges.
  for (const button of [skipCardBtnEl, hintBtnEl]) {
    if (!button) continue;
    let cornerPulse;
    button.addEventListener("click", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    submitCurrentAnswer();
    focusAnswerInputAtEnd();
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

  inputEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !sessionCards.length) {
      return;
    }
    event.preventDefault();
    if (!event.repeat) {
      pulseEnterKeyBadge();
    }
    submitCurrentAnswer();
  });
}

function createFlagColumns() {
  const flagEl = document.getElementById("deFlag");
  for (let i = 0; i < 28; i += 1) {
    const col = document.createElement("div");
    col.className = "de-flag-col";
    col.style.animationDelay = `${-(i / 20) * 3}s`;
    const baseBillow = (i / 4) * 11.2 + 4;
    const billow = i >= 25 ? baseBillow * 1.3 : baseBillow;
    col.style.setProperty("--billow", `${billow}px`);
    flagEl.appendChild(col);
  }
}

async function initApp() {
  initScrollSnapController();
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
  createFlagColumns();
  initOnboardingCategoryPreviewTarget();
  initFirstRunTour();
  initInstallGuide();
  initDifficultyControls();
  initInputEvents();
  initAnswerGuideResizeObserver();
  initAuthoringForm();
  capabilities = currentCapabilities;
  bundledCards = Array.isArray(baseCards)
    ? baseCards.map(sanitizeCard).filter(Boolean)
    : [];
  persistentCards = Array.isArray(loadedPersistentCards)
    ? loadedPersistentCards.map(sanitizeCard).filter(Boolean)
    : [];
  sessionOnlyCards = capabilities.persistentSave ? [] : loadSessionCards();
  allCards = mergeCards(bundledCards, persistentCards, sessionOnlyCards);

  renderAuthoringMode();
  factsController.init();
  renderStaticUi();
  buildTopicPanel();
  hasBootstrappedApp = true;
  await recoverPlayableSession("init-app", SESSION_SIZE);
  if (onboardingPending) {
    firstRunTour?.open();
  }

}

const factsController = createFactsController({ t, getLocale, getLocaleBundle, getTargetLanguage });

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
