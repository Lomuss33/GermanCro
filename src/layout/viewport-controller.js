import {
  ANSWER_GUIDE_HEIGHT_BUDGETS,
  ANSWER_GUIDE_SIZE_PROFILES,
  DEFAULT_TYPE_PROFILE,
  PROMPT_FIT_PROFILES,
  clampGameDensity,
  clampNumber,
  computeResponsiveTypeProfile,
  getAnswerGuideLengthBucket,
  getGameDensityProfile,
  getNextAnswerGuideSizingTier,
  getNextDenserDensity,
  getScaledFontPx,
  hasResponsiveTypeProfileChanged,
} from "./type-profiles.js";
import {
  answerGuideActionRowEl,
  answerGuideBodyEl,
  answerGuideEl,
  answerGuideTrailFlagEl,
  arrowDockEl,
  gameArea,
  heroStageEl,
  inputEl,
  languageDockEl,
  mainCard,
  promptEl,
  promptSub,
  siteTitleRowEl,
  skipCardBtnEl,
  wordGrid,
} from "../ui/dom.js";

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

export const answerGuideSizingState = {
  target: "",
  typed: "",
  width: 0,
  baseDensity: "regular",
  targetBucket: -1,
  typedBucket: -1,
  lastTier: "",
  lastMeasuredHeight: 0,
};

let answerGuideMeasureFrame = 0;
let answerGuideResizeObserver = null;
let languageDockZoomFrame = 0;
let keyboardViewportFrame = 0;
let keyboardRevealTimer = 0;

const keyboardViewport = {
  baselineHeight: 0,
  isOpen: false,
};

export function getResponsiveTypeProfile() {
  return viewportProfile.typeProfile || DEFAULT_TYPE_PROFILE;
}

export function applyResponsiveTypeProfile(profile) {
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

export function isTouchKeyboardEnvironment() {
  return Boolean(
    window.matchMedia?.("(pointer: coarse)").matches ||
    window.matchMedia?.("(hover: none)").matches ||
    "ontouchstart" in window
  );
}

export function getCurrentGameDensity() {
  return clampGameDensity(document.body?.dataset?.gameDensity);
}

export function getPromptAvailableHeight(element) {
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

export function getPromptFitProfile({ text, width, height, density, kind }) {
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

export function getSiteTitleFitProfile() {
  const hasGuides = siteTitleRowEl?.classList.contains("has-install-guides");
  const viewportWidth = Math.max(0, window.innerWidth || document.documentElement.clientWidth || 0);
  const guidedMaxFontPx = viewportWidth >= 900 ? 38 : 37;
  return {
    maxLines: 1,
    minFontPx: hasGuides ? 10 : 16,
    maxFontPx: hasGuides ? guidedMaxFontPx : viewportWidth >= 900 ? 38 : 28,
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

export function applyAnswerGuideResponsiveSizing() {
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

export function scheduleAnswerGuideMeasure(reason) {
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

export function initAnswerGuideResizeObserver() {
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

function setStableViewportCssVars(viewport) {
  if (!viewport) {
    return;
  }

  const width = Math.max(0, Math.round(viewport.width || 0));
  const height = Math.max(0, Math.round(viewport.height || 0));
  document.documentElement.style.setProperty("--app-stable-viewport-width", `${width}px`);
  document.documentElement.style.setProperty("--app-stable-viewport-height", `${height}px`);
}

function getViewportSize() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height)),
  };
}

function getVisualViewportSize() {
  const visualViewport = window.visualViewport;
  const height = visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
  const top = visualViewport?.offsetTop || 0;

  return {
    height: Math.max(0, Math.round(height)),
    top: Math.max(0, Math.round(top)),
  };
}

function getVirtualKeyboardInset(layoutHeight) {
  const rect = navigator.virtualKeyboard?.boundingRect;
  const top = Number(rect?.top);
  const height = Number(rect?.height);
  if (
    !Number.isFinite(top) ||
    !Number.isFinite(height) ||
    height <= 0 ||
    top <= 0 ||
    top >= layoutHeight
  ) {
    return 0;
  }

  return Math.max(0, Math.min(layoutHeight, layoutHeight - top));
}

function getKeyboardVisibleViewport(layoutHeight) {
  const visualViewport = getVisualViewportSize();
  const virtualKeyboardInset = getVirtualKeyboardInset(layoutHeight);
  const visualBottom = visualViewport.top + visualViewport.height;
  const virtualKeyboardBottom = layoutHeight - virtualKeyboardInset;
  const bottom = Math.max(
    visualViewport.top,
    Math.min(visualBottom, virtualKeyboardInset > 0 ? virtualKeyboardBottom : visualBottom),
  );

  return {
    top: visualViewport.top,
    height: Math.max(0, bottom - visualViewport.top),
    bottom,
    virtualKeyboardInset,
  };
}

function syncKeyboardViewport() {
  keyboardViewportFrame = 0;

  const layoutHeight = Math.max(
    viewportProfile.height,
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
  );
  const visibleViewport = getKeyboardVisibleViewport(layoutHeight);
  const inputFocused = inputEl && document.activeElement === inputEl;

  if (!keyboardViewport.baselineHeight || !inputFocused) {
    keyboardViewport.baselineHeight = Math.max(layoutHeight, visibleViewport.height);
  }

  const visibleBottom = visibleViewport.bottom;
  const keyboardInset = Math.max(
    visibleViewport.virtualKeyboardInset,
    keyboardViewport.baselineHeight - visibleBottom,
  );
  const keyboardThreshold = Math.max(100, Math.round(keyboardViewport.baselineHeight * 0.16));
  const isOpen = Boolean(inputFocused && isTouchKeyboardEnvironment() && keyboardInset >= keyboardThreshold);

  setKeyboardViewportCssVar("--app-visible-viewport-height", visibleViewport.height);
  setKeyboardViewportCssVar("--keyboard-visible-bottom", visibleBottom);
  setKeyboardViewportCssVar("--keyboard-inset", keyboardInset);
  if (document.body.classList.contains("is-keyboard-visible") !== isOpen) {
    document.body.classList.toggle("is-keyboard-visible", isOpen);
  }

  if (keyboardViewport.isOpen !== isOpen) {
    keyboardViewport.isOpen = isOpen;
    scheduleAnswerGuideMeasure("keyboard-viewport");
  }

  if (isOpen) {
    window.clearTimeout(keyboardRevealTimer);
    keyboardRevealTimer = window.setTimeout(() => {
      keyboardRevealTimer = 0;
      revealGameSurfaceForKeyboard();
    }, 80);
  } else if (keyboardRevealTimer) {
    window.clearTimeout(keyboardRevealTimer);
    keyboardRevealTimer = 0;
  }
}

function setKeyboardViewportCssVar(name, value) {
  const nextValue = `${Math.max(0, Math.round(value))}px`;
  const rootStyle = document.documentElement.style;
  if (rootStyle.getPropertyValue(name) !== nextValue) {
    rootStyle.setProperty(name, nextValue);
  }
}

function resetKeyboardViewportState() {
  const wasOpen = keyboardViewport.isOpen || document.body?.classList.contains("is-keyboard-visible");
  keyboardViewport.baselineHeight = 0;
  keyboardViewport.isOpen = false;
  if (keyboardRevealTimer) {
    window.clearTimeout(keyboardRevealTimer);
    keyboardRevealTimer = 0;
  }
  document.body?.classList.remove("is-keyboard-visible");
  if (wasOpen) {
    scheduleAnswerGuideMeasure("keyboard-viewport-reset");
  }
}

function scheduleKeyboardViewportSync() {
  if (keyboardViewportFrame) {
    return;
  }

  keyboardViewportFrame = window.requestAnimationFrame(syncKeyboardViewport);
}

function revealGameSurfaceForKeyboard() {
  if (!keyboardViewport.isOpen || !gameArea || !inputEl) {
    return;
  }

  const layoutHeight = Math.max(
    viewportProfile.height,
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
  );
  const visibleViewport = getKeyboardVisibleViewport(layoutHeight);
  const top = visibleViewport.top + 8;
  const bottom = visibleViewport.bottom - 12;
  const promptRects = [promptEl, promptSub]
    .map((element) => element?.closest?.(".prompt-row")?.getBoundingClientRect())
    .filter(Boolean);
  const inputRect = inputEl.getBoundingClientRect();
  if (!promptRects.length || !Number.isFinite(inputRect.bottom)) {
    return;
  }

  const contentTop = Math.min(...promptRects.map((rect) => rect.top));
  const contentBottom = inputRect.bottom;
  const contentHeight = contentBottom - contentTop;
  const viewportHeight = bottom - top;
  let delta = 0;

  if (contentHeight <= viewportHeight) {
    if (contentTop < top) {
      delta = contentTop - top;
    } else if (contentBottom > bottom) {
      delta = contentBottom - bottom;
    }
  } else if (contentBottom > bottom) {
    delta = contentBottom - bottom;
  }

  if (Math.abs(delta) < 2) {
    return;
  }

  const behavior = prefersReducedMotion() ? "auto" : "smooth";
  const remainingDelta = scrollScrollableElementBy(gameArea, delta, behavior);
  if (Math.abs(remainingDelta) < 2) {
    return;
  }

  scrollScrollableElementBy(document.scrollingElement || document.documentElement, remainingDelta, behavior);
}

function scrollScrollableElementBy(element, delta, behavior) {
  if (!element || !Number.isFinite(delta)) {
    return delta;
  }

  const currentScroll = element.scrollTop || 0;
  const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
  const targetScroll = Math.min(maxScroll, Math.max(0, currentScroll + delta));
  const appliedDelta = targetScroll - currentScroll;
  if (Math.abs(appliedDelta) < 2) {
    return delta;
  }

  element.scrollTo({ top: targetScroll, behavior });
  return delta - appliedDelta;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
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

export function updateLanguageDockZoom(dockViewportRatio, nextViewport) {
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

export function createViewportProfileController({
  onRelayoutTextAndGrammar,
  onLayoutChanged,
  onCardRelayout,
  onTopbarSync,
  onPageshowRecover,
}) {
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

    if (sizeChanged || typeProfileChanged) {
      onRelayoutTextAndGrammar();
    }

    if (sizeChanged || layoutChanged) {
      onLayoutChanged();
    }

    if (sizeChanged || densityChanged || typeProfileChanged) {
      onCardRelayout();
    }

    onTopbarSync();
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
        resetKeyboardViewportState();
        syncViewportProfile();
        onPageshowRecover();
        scheduleKeyboardViewportSync();
      }, { passive: true });
      window.addEventListener("resize", scheduleViewportProfileSync, { passive: true });
      window.addEventListener("orientationchange", scheduleViewportProfileSync, { passive: true });
      window.addEventListener("resize", scheduleKeyboardViewportSync, { passive: true });
      window.visualViewport?.addEventListener("resize", scheduleKeyboardViewportSync, { passive: true });
      window.visualViewport?.addEventListener("scroll", scheduleKeyboardViewportSync, { passive: true });
      navigator.virtualKeyboard?.addEventListener?.("geometrychange", scheduleKeyboardViewportSync);
      inputEl?.addEventListener("focus", scheduleKeyboardViewportSync, { passive: true });
      inputEl?.addEventListener("blur", scheduleKeyboardViewportSync, { passive: true });
      window.addEventListener("orientationchange", () => {
        resetKeyboardViewportState();
        scheduleKeyboardViewportSync();
      }, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          resetKeyboardViewportState();
          scheduleKeyboardViewportSync();
        }
      }, { passive: true });
    }

    if (viewportProfile.syncFrame) {
      window.cancelAnimationFrame(viewportProfile.syncFrame);
      viewportProfile.syncFrame = 0;
    }

    syncViewportProfile();
    scheduleKeyboardViewportSync();
  }

  return {
    init: initViewportProfile,
    sync: syncViewportProfile,
  };
}
