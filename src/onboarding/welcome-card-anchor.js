import { prefersReducedEffects } from "../ui/effects-preference.js";

export function createWelcomeCardAnchor({
  dialog,
  cardHost,
  elements,
  isCardStart,
  isOpen,
  getState,
} = {}) {
  const titleHome = {
    parent: elements.title?.parentNode || null,
    nextSibling: elements.title?.nextSibling || null,
  };
  let promotedTitle = false;
  let titleProgress = 0;
  const titleSequence = "germancro";

  function syncCardStartHeight() {
    if (!cardHost || !isCardStart()) {
      return;
    }
    const height = `${Math.ceil(cardHost.getBoundingClientRect().height)}px`;
    dialog.style.setProperty("--onboarding-card-height", height);
    cardHost.style.setProperty("--onboarding-card-height", height);
    syncWelcomeAnchorMetrics();
  }

  function refreshCardStartHeight() {
    cardHost?.style.removeProperty("--onboarding-card-height");
    clearWelcomeAnchorMetrics();
    syncCardStartHeight();
  }

  function setWelcomeMetric(name, value) {
    if (dialog.style.getPropertyValue(name) !== value) {
      dialog.style.setProperty(name, value);
    }
    if (cardHost?.style.getPropertyValue(name) !== value) {
      cardHost?.style.setProperty(name, value);
    }
  }

  function clearWelcomeAnchorMetrics() {
    [
      "--onboarding-input-left",
      "--onboarding-input-top",
      "--onboarding-input-width",
      "--onboarding-input-height",
      "--onboarding-guide-left",
      "--onboarding-guide-top",
      "--onboarding-guide-width",
      "--onboarding-guide-height",
      "--onboarding-language-top",
      "--onboarding-language-height",
    ].forEach((name) => {
      dialog.style.removeProperty(name);
      cardHost?.style.removeProperty(name);
    });
  }

  function syncWelcomeAnchorMetrics() {
    const input = document.getElementById("answer")?.closest(".input-shell");
    const guide = document.getElementById("answerGuide");
    const panel = elements.panel;
    if (!cardHost || !panel || !input || !guide) {
      clearWelcomeAnchorMetrics();
      return;
    }
    const panelRect = panel.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const guideRect = guide.getBoundingClientRect();
    if (panelRect.width <= 0 || panelRect.height <= 0 || inputRect.height <= 0 || guideRect.height <= 0) {
      clearWelcomeAnchorMetrics();
      return;
    }
    const inputTop = Math.max(0, inputRect.top - panelRect.top);
    const bottomBuffer = Math.max(8, Math.min(24, panelRect.bottom - guideRect.bottom));
    const languageTop = bottomBuffer;
    const languageHeight = Math.max(92, inputTop - languageTop - 14);
    setWelcomeMetric("--onboarding-input-left", `${Math.max(0, inputRect.left - panelRect.left)}px`);
    setWelcomeMetric("--onboarding-input-top", `${inputTop}px`);
    setWelcomeMetric("--onboarding-input-width", `${Math.max(0, inputRect.width)}px`);
    setWelcomeMetric("--onboarding-input-height", `${Math.max(0, inputRect.height)}px`);
    setWelcomeMetric("--onboarding-guide-left", `${Math.max(0, guideRect.left - panelRect.left)}px`);
    setWelcomeMetric("--onboarding-guide-top", `${Math.max(0, guideRect.top - panelRect.top)}px`);
    setWelcomeMetric("--onboarding-guide-width", `${Math.max(0, guideRect.width)}px`);
    setWelcomeMetric("--onboarding-guide-height", `${Math.max(0, guideRect.height)}px`);
    setWelcomeMetric("--onboarding-language-top", `${languageTop}px`);
    setWelcomeMetric("--onboarding-language-height", `${languageHeight}px`);
  }

  function syncTitleProgress() {
    elements.title?.querySelectorAll(".site-title-letter").forEach((letter, index) => {
      letter.classList.toggle("is-title-filled", index < titleProgress);
      letter.classList.toggle("is-title-next", index === titleProgress);
    });
  }

  function resetTitleProgress() {
    titleProgress = 0;
  }

  function promoteWelcomeTitle() {
    if (!isCardStart() || !elements.title) {
      restoreWelcomeTitle();
      return;
    }
    const titleRow = document.querySelector("#heroStage > .site-title-row");
    const appTitle = titleRow?.querySelector(".site-title:not(#onboardingTitle)");
    if (!titleRow || !appTitle) {
      restoreWelcomeTitle();
      return;
    }
    const appTitleStyles = window.getComputedStyle(appTitle);
    titleRow.style.setProperty("--promoted-title-font-size", appTitleStyles.fontSize);
    titleRow.style.setProperty("--promoted-title-line-height", appTitleStyles.lineHeight);
    if (elements.title.parentElement !== titleRow) {
      appTitle.after(elements.title);
    }
    promotedTitle = true;
    document.body.classList.add("has-promoted-onboarding-title");
  }

  function restoreWelcomeTitle() {
    if (!promotedTitle && elements.title?.parentNode === titleHome.parent) {
      return;
    }
    if (titleHome.parent && elements.title) {
      if (titleHome.nextSibling?.parentNode === titleHome.parent) {
        titleHome.parent.insertBefore(elements.title, titleHome.nextSibling);
      } else {
        titleHome.parent.append(elements.title);
      }
    }
    promotedTitle = false;
    document.body.classList.remove("has-promoted-onboarding-title");
    document.querySelector("#heroStage > .site-title-row")?.style.removeProperty("--promoted-title-font-size");
    document.querySelector("#heroStage > .site-title-row")?.style.removeProperty("--promoted-title-line-height");
  }

  window.addEventListener("keydown", (event) => {
    if (
      !isOpen() ||
      getState() !== "welcome" ||
      !isCardStart() ||
      event.repeat ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      titleProgress >= titleSequence.length ||
      event.target?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false'])") ||
      event.key.toLowerCase() !== titleSequence[titleProgress]
    ) {
      return;
    }
    titleProgress += 1;
    syncTitleProgress();
    if (titleProgress === titleSequence.length && !prefersReducedEffects()) {
      elements.title?.querySelectorAll(".site-title-letter").forEach((letter, index) => {
        letter.animate([
          { transform: "translateY(0)", filter: "brightness(1)" },
          { transform: "translateY(-7px)", filter: "brightness(1.2)", offset: 0.4 },
          { transform: "translateY(0)", filter: "brightness(1)" },
        ], { duration: 650, delay: index * 65, easing: "ease-in-out" });
      });
    }
  }, { capture: true });

  return {
    syncCardStartHeight,
    refreshCardStartHeight,
    clearWelcomeAnchorMetrics,
    syncTitleProgress,
    resetTitleProgress,
    promoteWelcomeTitle,
    restoreWelcomeTitle,
  };
}
