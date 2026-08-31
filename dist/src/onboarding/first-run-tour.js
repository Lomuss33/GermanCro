import { expandRect, getUnionRect, placeTourPanel } from "./tour-geometry.js?v=2026-08-21-onboarding1";
import { normalizeTutorialLanguage, resolveTutorialLanguage } from "./tutorial-language.js?v=2026-08-21-onboarding2";

export const ONBOARDING_STORAGE_KEY = "germancro.onboarding.v2";

const TOUR_STEPS = Object.freeze([
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

function safelyReadSeenState(storage) {
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

function safelyWriteSeenState(storage, completedTour) {
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

function resolveBrowserStorage(storage) {
  if (storage) {
    return storage;
  }
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function getBrowserLanguagePreferences(preferredLanguages) {
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

function nextAnimationFrame() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(fallbackTimer);
      resolve();
    };
    const fallbackTimer = window.setTimeout(finish, 50);
    window.requestAnimationFrame(finish);
  });
}

function isVisibleTarget(element) {
  if (!(element instanceof Element)) {
    return false;
  }
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
}

export function createFirstRunTour({
  dialog,
  translate,
  preferredLanguages,
  getLearningMode,
  setLearningMode,
  focusAnswer,
  onOpen,
  onClose,
  storage,
  alwaysShow = false,
} = {}) {
  if (
    typeof HTMLDialogElement !== "function" ||
    !(dialog instanceof HTMLDialogElement) ||
    typeof translate !== "function"
  ) {
    return null;
  }

  const cardHost = document.getElementById("mainCard");

  function isCardStart() {
    return dialog.parentElement === cardHost;
  }

  function promoteToGlobalTour() {
    if (!cardHost || dialog.parentElement !== cardHost) {
      return;
    }
    document.body.append(dialog);
    dialog.classList.remove("is-card-start");
    dialog.classList.add("is-global");
    if (dialog.open) {
      dialog.close();
    }
    dialog.showModal();
    document.body.classList.add("has-onboarding-open");
    document.documentElement.classList.add("has-onboarding-open");
  }

  const elements = {
    panel: dialog.querySelector(".onboarding-panel"),
    spotlight: dialog.querySelector(".onboarding-spotlight"),
    welcomeScrim: dialog.querySelector(".onboarding-welcome-scrim"),
    scrimTop: dialog.querySelector(".onboarding-scrim--top"),
    scrimLeft: dialog.querySelector(".onboarding-scrim--left"),
    scrimRight: dialog.querySelector(".onboarding-scrim--right"),
    scrimBottom: dialog.querySelector(".onboarding-scrim--bottom"),
    brand: dialog.querySelector(".onboarding-brand"),
    brandSegments: Array.from(dialog.querySelectorAll("[data-brand-segment]")),
    progress: dialog.querySelector("#onboardingProgress"),
    title: dialog.querySelector("#onboardingTitle"),
    body: dialog.querySelector("#onboardingBody"),
    feedbackKey: dialog.querySelector("#onboardingFeedbackKey"),
    feedbackCorrect: dialog.querySelector("#onboardingFeedbackCorrect"),
    feedbackNext: dialog.querySelector("#onboardingFeedbackNext"),
    feedbackWrong: dialog.querySelector("#onboardingFeedbackWrong"),
    languageGroup: dialog.querySelector("#onboardingLanguageGroup"),
    languageLabel: dialog.querySelector("#onboardingLanguageLabel"),
    languageLabelText: dialog.querySelector(".onboarding-language-label-text"),
    languageLabelLetters: dialog.querySelector(".onboarding-language-label-letters"),
    languageButtons: Array.from(dialog.querySelectorAll(".onboarding-language-btn")),
    backButton: dialog.querySelector("#onboardingBackBtn"),
    secondaryButton: dialog.querySelector("#onboardingSecondaryBtn"),
    settingsButton: dialog.querySelector("#onboardingSettingsBtn"),
    primaryButton: dialog.querySelector("#onboardingPrimaryBtn"),
    skipButton: dialog.querySelector("#onboardingSkipBtn"),
    replayNote: dialog.querySelector("#onboardingReplayNote"),
  };

  let state = "idle";
  let stepIndex = -1;
  let replay = false;
  let layoutFrame = 0;
  let renderToken = 0;
  let observedTargets = [];
  let openingScrollX = 0;
  let openingScrollY = 0;
  let previouslyFocusedElement = null;
  const browserStorage = resolveBrowserStorage(storage);
  let sessionSeen = safelyReadSeenState(browserStorage);
  const tutorialLanguage = resolveTutorialLanguage(getBrowserLanguagePreferences(preferredLanguages));
  const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)") || null;
  const resizeObserver = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => scheduleLayout())
    : null;

  function isOpen() {
    return dialog.open && state !== "idle";
  }

  function shouldShow() {
    // The welcome state can act as the app's launch gate when enabled by the host.
    return alwaysShow || !sessionSeen;
  }

  function resolveStepTargets(step = TOUR_STEPS[stepIndex]) {
    if (!step) {
      return [];
    }
    return step.targets
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter(isVisibleTarget);
  }

  function stopObservingTargets() {
    resizeObserver?.disconnect();
    observedTargets = [];
  }

  function observeTargets(targets) {
    stopObservingTargets();
    observedTargets = targets;
    targets.forEach((target) => resizeObserver?.observe(target));
    if (elements.panel) {
      resizeObserver?.observe(elements.panel);
    }
  }

  function setBox(element, { left, top, width, height }) {
    if (!element) {
      return;
    }
    const boxLeft = Math.floor(left);
    const boxTop = Math.floor(top);
    const boxRight = Math.ceil(left + width);
    const boxBottom = Math.ceil(top + height);
    element.style.left = `${boxLeft}px`;
    element.style.top = `${boxTop}px`;
    element.style.width = `${Math.max(0, boxRight - boxLeft)}px`;
    element.style.height = `${Math.max(0, boxBottom - boxTop)}px`;
  }

  function clearSpotlight() {
    elements.spotlight?.classList.remove("is-visible");
    [elements.scrimTop, elements.scrimLeft, elements.scrimRight, elements.scrimBottom]
      .forEach((scrim) => scrim?.classList.remove("is-visible"));
  }

  function layoutCurrentStep() {
    layoutFrame = 0;
    if (!isOpen() || state !== "tour" || !elements.panel) {
      return;
    }

    const targets = resolveStepTargets();
    const viewportWidth = Math.max(
      0,
      window.innerWidth || 0,
      document.documentElement.clientWidth || 0,
    );
    const viewportHeight = Math.max(
      0,
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
    );
    const union = getUnionRect(targets.map((target) => target.getBoundingClientRect()));
    const isPhone = document.body.classList.contains("layout-phone-portrait") || viewportWidth <= 700;
    const spotlight = expandRect(union, {
      padding: isPhone ? 6 : 10,
      edge: isPhone ? 6 : 10,
      viewportWidth,
      viewportHeight,
    });

    if (!spotlight) {
      clearSpotlight();
      return;
    }

    setBox(elements.spotlight, spotlight);
    elements.spotlight?.classList.add("is-visible");

    // Slight overlaps remove sub-pixel seams and guarantee coverage through
    // the final device pixel at the right and bottom viewport edges.
    setBox(elements.scrimTop, { left: -2, top: -2, width: viewportWidth + 4, height: spotlight.top + 3 });
    setBox(elements.scrimBottom, {
      left: -2,
      top: spotlight.bottom - 1,
      width: viewportWidth + 4,
      height: viewportHeight - spotlight.bottom + 5,
    });
    setBox(elements.scrimLeft, {
      left: -2,
      top: spotlight.top - 1,
      width: spotlight.left + 3,
      height: spotlight.height + 2,
    });
    setBox(elements.scrimRight, {
      left: spotlight.right - 1,
      top: spotlight.top - 1,
      width: viewportWidth - spotlight.right + 3,
      height: spotlight.height + 2,
    });
    [elements.scrimTop, elements.scrimLeft, elements.scrimRight, elements.scrimBottom]
      .forEach((scrim) => scrim?.classList.add("is-visible"));

    const panelRect = elements.panel.getBoundingClientRect();
    const placement = placeTourPanel({
      spotlight,
      panelWidth: panelRect.width,
      panelHeight: panelRect.height,
      viewportWidth,
      viewportHeight,
      edge: isPhone ? 12 : 18,
      gap: isPhone ? 12 : 18,
      isPhone,
    });

    if (placement) {
      elements.panel.style.left = `${Math.round(placement.left)}px`;
      elements.panel.style.top = `${Math.round(placement.top)}px`;
      elements.panel.dataset.placement = placement.placement;
    }
  }

  function scheduleLayout() {
    if (layoutFrame || !isOpen() || state !== "tour") {
      return;
    }
    layoutFrame = window.requestAnimationFrame(layoutCurrentStep);
  }

  function tutorialTranslate(path, params = {}) {
    return translate(path, params, tutorialLanguage);
  }

  function syncLanguageButtons() {
    dialog.setAttribute("lang", tutorialLanguage);
    const activeLearningMode = normalizeTutorialLanguage(getLearningMode?.()) || "de";
    syncBrandAccent(activeLearningMode);
    elements.languageButtons.forEach((button) => {
      const buttonLanguage = normalizeTutorialLanguage(button.dataset.learningLanguage);
      const isActive = buttonLanguage === activeLearningMode;
      const languageName = tutorialTranslate(`onboarding.languages.${buttonLanguage}`);
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute("aria-label", languageName);
      const visibleName = button.querySelector(".onboarding-language-name");
      if (visibleName) {
        visibleName.textContent = languageName;
      }
    });
  }

  function syncBrandAccent(activeLanguage) {
    const normalizedLanguage = normalizeTutorialLanguage(activeLanguage) || "de";
    elements.brandSegments.forEach((segment) => {
      const segmentLanguage = normalizeTutorialLanguage(segment.dataset.brandSegment);
      segment.classList.toggle("is-accent", segmentLanguage === normalizedLanguage);
    });
  }

  function renderFeedbackKey() {
    if (elements.feedbackCorrect) {
      elements.feedbackCorrect.textContent = tutorialTranslate("onboarding.feedback.correct");
    }
    if (elements.feedbackNext) {
      elements.feedbackNext.textContent = tutorialTranslate("onboarding.feedback.next");
    }
    if (elements.feedbackWrong) {
      elements.feedbackWrong.textContent = tutorialTranslate("onboarding.feedback.wrong");
    }
  }

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

    const characters = Array.from(labelText);
    const fragment = document.createDocumentFragment();
    characters.forEach((character) => {
      const letter = document.createElement("span");
      letter.className = "onboarding-language-label-letter";
      if (character === " ") {
        letter.classList.add("is-space");
        letter.setAttribute("aria-hidden", "true");
      }
      letter.textContent = character === " " ? "\u00a0" : character;
      fragment.append(letter);
    });
    elements.languageLabelLetters.replaceChildren(fragment);
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

  function renderWelcome({ focusTitle = true } = {}) {
    state = "welcome";
    stepIndex = -1;
    stopObservingTargets();
    clearSpotlight();
    dialog.classList.add("is-welcome");
    dialog.classList.remove("is-tour");
    elements.welcomeScrim?.classList.add("is-visible");
    elements.brand?.classList.remove("is-hidden");
    elements.progress?.classList.add("is-hidden");
    elements.skipButton?.classList.add("is-hidden");
    elements.backButton?.classList.add("is-hidden");
    elements.feedbackKey?.classList.add("is-hidden");
    elements.languageGroup?.classList.remove("is-hidden");
    elements.secondaryButton?.classList.remove("is-hidden");
    elements.settingsButton?.classList.remove("is-hidden");
    elements.replayNote?.classList.remove("is-hidden");

    if (elements.title) {
      elements.title.textContent = tutorialTranslate("onboarding.welcome.title");
    }
    if (elements.body) {
      elements.body.textContent = tutorialTranslate("onboarding.welcome.body");
    }
    if (elements.languageLabel) {
      renderLanguageLabel(tutorialTranslate("onboarding.welcome.languageLabel"));
    }
    if (elements.replayNote) {
      renderReplayNote(tutorialTranslate("onboarding.welcome.replayNote"));
    }
    if (elements.secondaryButton) {
      elements.secondaryButton.textContent = tutorialTranslate("onboarding.controls.tour");
    }
    if (elements.settingsButton) {
      const settingsLabel = tutorialTranslate("onboarding.controls.settings");
      elements.settingsButton.textContent = settingsLabel;
      elements.settingsButton.setAttribute("aria-label", settingsLabel);
    }
    if (elements.primaryButton) {
      elements.primaryButton.textContent = tutorialTranslate("onboarding.controls.play");
    }
    syncLanguageButtons();
    elements.panel?.removeAttribute("style");
    if (focusTitle) {
      window.requestAnimationFrame(() => elements.title?.focus({ preventScroll: true }));
    }
  }

  async function renderStep(nextIndex) {
    const token = ++renderToken;
    let resolvedIndex = nextIndex;
    let targets = [];

    while (resolvedIndex < TOUR_STEPS.length) {
      targets = resolveStepTargets(TOUR_STEPS[resolvedIndex]);
      if (targets.length) {
        break;
      }
      resolvedIndex += 1;
    }

    if (resolvedIndex >= TOUR_STEPS.length) {
      finish("completed");
      return;
    }

    state = "tour";
    stepIndex = resolvedIndex;
    const step = TOUR_STEPS[stepIndex];
    dialog.classList.remove("is-welcome");
    dialog.classList.add("is-tour");
    elements.welcomeScrim?.classList.remove("is-visible");
    elements.brand?.classList.add("is-hidden");
    elements.progress?.classList.remove("is-hidden");
    elements.skipButton?.classList.remove("is-hidden");
    elements.backButton?.classList.toggle("is-hidden", stepIndex === 0);
    elements.feedbackKey?.classList.toggle("is-hidden", !step.showFeedbackKey);
    elements.languageGroup?.classList.add("is-hidden");
    elements.secondaryButton?.classList.add("is-hidden");
    elements.settingsButton?.classList.add("is-hidden");
    elements.replayNote?.classList.add("is-hidden");

    if (elements.progress) {
      elements.progress.textContent = tutorialTranslate("onboarding.progress", {
        current: stepIndex + 1,
        total: TOUR_STEPS.length,
      });
    }
    if (elements.title) {
      elements.title.textContent = tutorialTranslate(step.titleKey);
    }
    if (elements.body) {
      elements.body.textContent = tutorialTranslate(step.bodyKey);
    }
    if (elements.backButton) {
      elements.backButton.textContent = tutorialTranslate("onboarding.controls.back");
    }
    if (elements.skipButton) {
      elements.skipButton.textContent = tutorialTranslate("onboarding.controls.skip");
    }
    if (elements.primaryButton) {
      elements.primaryButton.textContent = tutorialTranslate(
        stepIndex === TOUR_STEPS.length - 1
          ? "onboarding.controls.start"
          : "onboarding.controls.next"
      );
    }
    renderFeedbackKey();
    observeTargets(targets);

    const union = getUnionRect(targets.map((target) => target.getBoundingClientRect()));
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (union) {
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
      const isPhone = document.body.classList.contains("layout-phone-portrait") || viewportWidth <= 700;
      const edge = isPhone ? 12 : 18;
      const gap = isPhone ? 12 : 18;
      const targetPadding = isPhone ? 6 : 10;
      const panelHeight = elements.panel?.getBoundingClientRect().height || 0;
      const minimumTargetTop = edge + targetPadding;
      const maximumTargetBottom = Math.max(
        minimumTargetTop,
        viewportHeight - edge - gap - panelHeight - targetPadding,
      );
      let scrollDelta = 0;

      if (union.bottom > maximumTargetBottom) {
        scrollDelta = union.bottom - maximumTargetBottom;
      } else if (union.top < minimumTargetTop) {
        scrollDelta = union.top - minimumTargetTop;
      }

      if (Math.abs(scrollDelta) > 1) {
        window.scrollBy({
          top: Math.round(scrollDelta),
          left: 0,
          behavior: "auto",
        });
      }
    }

    await nextAnimationFrame();
    await nextAnimationFrame();
    if (token !== renderToken || !isOpen() || state !== "tour") {
      return;
    }
    layoutCurrentStep();
    elements.title?.focus({ preventScroll: true });
  }

  function refreshCopy() {
    if (!isOpen()) {
      return;
    }
    if (state === "welcome") {
      renderWelcome({ focusTitle: false });
    } else if (state === "tour") {
      void renderStep(stepIndex);
    }
  }

  function markSeen(completedTour) {
    sessionSeen = true;
    if (!replay) {
      safelyWriteSeenState(browserStorage, completedTour);
    }
  }

  function finish(reason = "skipped") {
    if (!isOpen()) {
      return;
    }
    const completedTour = reason === "completed";
    markSeen(completedTour);
    renderToken += 1;
    stopObservingTargets();
    clearSpotlight();
    if (layoutFrame) {
      window.cancelAnimationFrame(layoutFrame);
      layoutFrame = 0;
    }
    const wasReplay = replay;
    state = "idle";
    stepIndex = -1;
    document.body.classList.remove("has-onboarding-open");
    document.documentElement.classList.remove("has-onboarding-open");
    elements.welcomeScrim?.classList.remove("is-visible");
    dialog.close(reason);
    dialog.classList.remove("is-welcome", "is-tour");
    elements.panel?.removeAttribute("style");
    if (elements.panel) {
      delete elements.panel.dataset.placement;
    }
    if (!isCardStart()) {
      window.scrollTo({ left: openingScrollX, top: openingScrollY, behavior: "auto" });
    }
    if (!isCardStart() && cardHost) {
      cardHost.prepend(dialog);
      dialog.classList.remove("is-global");
    }
    dialog.style.removeProperty("--onboarding-card-height");
    onClose?.({ reason, replay: wasReplay, completedTour });
    if (
      wasReplay &&
      typeof HTMLElement === "function" &&
      previouslyFocusedElement instanceof HTMLElement &&
      previouslyFocusedElement.isConnected
    ) {
      previouslyFocusedElement.focus({ preventScroll: true });
    } else {
      focusAnswer?.();
    }
    previouslyFocusedElement = null;
  }

  function open({ isReplay = false } = {}) {
    if (isOpen()) {
      return;
    }
    replay = Boolean(isReplay);
    previouslyFocusedElement = document.activeElement;
    openingScrollX = window.scrollX;
    openingScrollY = window.scrollY;
    if (isReplay) {
      promoteToGlobalTour();
    } else {
      cardHost?.prepend(dialog);
      dialog.classList.add("is-card-start");
      if (cardHost) {
        dialog.style.setProperty("--onboarding-card-height", `${Math.ceil(cardHost.getBoundingClientRect().height)}px`);
      }
    }
    if (!isCardStart()) {
      document.body.classList.add("has-onboarding-open");
      document.documentElement.classList.add("has-onboarding-open");
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.show();
    }
    onOpen?.({ replay });
    renderWelcome();
  }

  function replayTour() {
    open({ isReplay: true });
  }

  function startWelcomeTour() {
    if (state !== "welcome") {
      return false;
    }
    promoteToGlobalTour();
    void renderStep(0);
    return true;
  }

  function playFromWelcome() {
    if (state !== "welcome") {
      return false;
    }
    finish("played");
    return true;
  }

  function advanceTour() {
    if (state === "welcome") {
      startWelcomeTour();
      return;
    }
    if (state !== "tour") {
      return;
    }
    if (stepIndex >= TOUR_STEPS.length - 1) {
      finish("completed");
      return;
    }
    void renderStep(stepIndex + 1);
  }

  function goToPreviousTourStep() {
    if (state === "tour" && stepIndex > 0) {
      void renderStep(stepIndex - 1);
    }
  }

  elements.primaryButton?.addEventListener("click", () => {
    if (state === "welcome") {
      playFromWelcome();
      return;
    }
    advanceTour();
  });

  elements.secondaryButton?.addEventListener("click", () => {
    if (state === "welcome") {
      startWelcomeTour();
    }
  });

  elements.settingsButton?.addEventListener("click", () => {
    if (state === "welcome") {
      finish("settings");
    }
  });

  elements.backButton?.addEventListener("click", () => {
    goToPreviousTourStep();
  });

  elements.skipButton?.addEventListener("click", () => finish("skipped"));

  elements.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = normalizeTutorialLanguage(button.dataset.learningLanguage);
      if (
        nextLanguage &&
        typeof setLearningMode === "function" &&
        nextLanguage !== normalizeTutorialLanguage(getLearningMode?.())
      ) {
        syncBrandAccent(nextLanguage);
        setLearningMode(nextLanguage);
        window.setTimeout(syncLanguageButtons, 180);
      }
    });
  });

  dialog.addEventListener("keydown", (event) => {
    if (
      !isOpen() ||
      event.repeat ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      finish("skipped");
      return;
    }

    if (event.key === "ArrowLeft") {
      if (state !== "tour" || stepIndex <= 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      goToPreviousTourStep();
      return;
    }

    const isSpaceKey = event.key === " " || event.key === "Spacebar";
    const isAdvanceKey = event.key === "Enter" || isSpaceKey || event.key === "ArrowRight";
    if (!isAdvanceKey) {
      return;
    }

    const target = event.target;
    if (
      (event.key === "Enter" || isSpaceKey) &&
      target instanceof Element &&
      target.closest("button, a, input, textarea, select")
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    advanceTour();
  }, { capture: true });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    finish("skipped");
  });
  window.addEventListener("resize", scheduleLayout, { passive: true });
  window.addEventListener("orientationchange", scheduleLayout, { passive: true });
  window.addEventListener("scroll", scheduleLayout, { passive: true, capture: true });
  window.visualViewport?.addEventListener("resize", scheduleLayout, { passive: true });
  window.visualViewport?.addEventListener("scroll", scheduleLayout, { passive: true });
  reduceMotionQuery?.addEventListener?.("change", scheduleLayout);

  return Object.freeze({
    isOpen,
    open,
    refreshCopy,
    playFromWelcome,
    replay: replayTour,
    startWelcomeTour,
    shouldShow,
  });
}
