import { detectInstallGuideContext } from "./install-guide-context.js";
import {
  installGuideBrowserEl,
  installGuideBrowserPanelEl,
  installGuidePanelEl,
  installGuideStepsEl,
  phoneGuideBarEl,
  siteTitleRowEl,
} from "./dom.js";

function isStandaloneMode() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
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

function setInstallGuidePillVisible(element, isVisible) {
  element?.classList.toggle("is-hidden", !isVisible);
}

export function createInstallGuideController({ translate, siteTitleController, showToast }) {
  let installGuideLayoutFrame = 0;

  function getInstallGuideContext() {
    return detectInstallGuideContext(navigator.userAgent, {
      fallbackBrowser: translate("installGuide.fallbackBrowser"),
      fallbackDesktop: translate("installGuide.fallbackDesktop"),
      fallbackMobile: translate("installGuide.fallbackMobile"),
    });
  }

  function renderInstallGuide() {
    if (!installGuideBrowserEl || !installGuideStepsEl) {
      return;
    }

    const context = getInstallGuideContext();
    const localizedPath = translate(`installGuide.paths.${context.installPathKey}`);
    const resolvedPath = localizedPath === `installGuide.paths.${context.installPathKey}`
      ? translate("installGuide.paths.default")
      : localizedPath;
    const browserPrefix = translate("installGuide.browserPrefix");
    const browserText = browserPrefix === "installGuide.browserPrefix"
      ? `${context.browserLabel}: ${resolvedPath}`
      : `${browserPrefix} ${context.browserLabel}: ${resolvedPath}`;
    const stepsText = translate("installGuide.cta");

    if (installGuideBrowserEl.textContent !== browserText) installGuideBrowserEl.textContent = browserText;
    if (installGuideStepsEl.textContent !== stepsText) installGuideStepsEl.textContent = stepsText;
    renderPhoneInstallGuide(browserText, stepsText);
  }

  function setDesktopInstallGuideShellVisible(isVisible) {
    const wasVisible = siteTitleRowEl?.classList.contains("has-install-guides") || false;
    siteTitleRowEl?.classList.toggle("has-install-guides", isVisible);
    if (wasVisible !== isVisible) {
      siteTitleController?.relayout();
    }
  }

  function cancelInstallGuideLayoutFrame() {
    if (!installGuideLayoutFrame) {
      return;
    }

    window.cancelAnimationFrame(installGuideLayoutFrame);
    installGuideLayoutFrame = 0;
  }

  function hideInstallGuide() {
    cancelInstallGuideLayoutFrame();
    setDesktopInstallGuideShellVisible(false);
    setInstallGuidePillVisible(installGuideBrowserPanelEl, false);
    setInstallGuidePillVisible(installGuidePanelEl, false);
    phoneGuideBarEl?.classList.add("is-hidden");
  }

  function applyInstallGuideLayout() {
    installGuideLayoutFrame = 0;

    if (!installGuidePanelEl || !installGuideBrowserPanelEl || !phoneGuideBarEl) {
      return;
    }

    const context = getInstallGuideContext();
    if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
      hideInstallGuide();
      return;
    }

    renderInstallGuide();

    const width = siteTitleRowEl?.clientWidth || 0;
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    siteTitleRowEl?.classList.toggle("has-roomy-guides", width >= 46 * rootSize);
    phoneGuideBarEl.classList.add("is-hidden");
    setDesktopInstallGuideShellVisible(true);
    setInstallGuidePillVisible(installGuideBrowserPanelEl, true);
    setInstallGuidePillVisible(installGuidePanelEl, true);

    siteTitleController?.relayout();
  }

  function scheduleInstallGuideLayout() {
    cancelInstallGuideLayoutFrame();
    installGuideLayoutFrame = window.requestAnimationFrame(applyInstallGuideLayout);
  }

  function maybeShowInstallGuide() {
    if (!installGuidePanelEl || !installGuideBrowserPanelEl || !phoneGuideBarEl) {
      return;
    }

    const context = getInstallGuideContext();
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
      showToast(translate("messages.toasts.install"));
    });

    if (typeof ResizeObserver === "function" && siteTitleRowEl) {
      let previousMetrics = "";
      const observer = new ResizeObserver(() => {
        const metrics = `${siteTitleRowEl.clientWidth}:${getComputedStyle(document.documentElement).fontSize}`;
        if (metrics === previousMetrics) return;
        previousMetrics = metrics;
        scheduleInstallGuideLayout();
      });
      observer.observe(siteTitleRowEl);
      observer.observe(document.documentElement);
    }
    window.addEventListener("resize", scheduleInstallGuideLayout, { passive: true });
    document.fonts?.ready.then(scheduleInstallGuideLayout);
    document.fonts?.addEventListener("loadingdone", scheduleInstallGuideLayout);
    maybeShowInstallGuide();
  }

  return {
    init: initInstallGuide,
    maybeShow: maybeShowInstallGuide,
    hide: hideInstallGuide,
  };
}
