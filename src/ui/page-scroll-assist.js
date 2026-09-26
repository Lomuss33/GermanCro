const PANEL_SNAP_FRACTION = 1 / 3;

export function readPageScrollY(windowRef, documentRef) {
  const root = documentRef.scrollingElement;
  if (root && Number.isFinite(root.scrollTop)) return root.scrollTop;

  return Math.max(
    windowRef.scrollY || 0,
    documentRef.documentElement?.scrollTop || 0,
    documentRef.body?.scrollTop || 0,
  );
}

export function findPanelSnapTarget(targets, scrollY, viewportHeight) {
  const height = Math.max(1, viewportHeight || 1);
  return targets
    .filter((target) => target?.element && Number.isFinite(target.position))
    .map((target) => ({
      ...target,
      distance: Math.abs(target.position - scrollY),
      threshold: height * PANEL_SNAP_FRACTION,
    }))
    .filter((target) => target.distance >= 1 && target.distance <= target.threshold)
    .sort((left, right) => left.distance - right.distance)[0] || null;
}

export function initPageScrollAssist({ targets, shouldPause = () => false }) {
  let settleTimer = 0;
  let snapReleaseTimer = 0;
  let isSnapping = false;
  let previousScrollY = readPageScrollY(window, document);
  let previousScrollAt = performance.now();
  let scrollVelocity = 0;

  function getTargetPositions() {
    const scrollY = readPageScrollY(window, document);
    const scrollRoot = document.scrollingElement || document.documentElement;
    const maxScrollY = Math.max(0, scrollRoot.scrollHeight - window.innerHeight);
    return targets()
      .filter((target) => target?.element && (!target.requiresLoadedContent || target.isLoaded?.()))
      .map((target) => {
        const rect = target.element.getBoundingClientRect();
        return {
          element: target.element,
          isMainCard: target.isMainCard === true,
          height: rect.height,
          position: Math.max(0, Math.min(maxScrollY, scrollY + rect.top)),
        };
      })
      .filter((target) => target.height > 0);
  }

  function settleScrollPosition() {
    if (isSnapping || shouldPause() || document.hidden) return;

    const scrollY = readPageScrollY(window, document);
    // Let wheel/touch momentum finish before correcting a near-miss alignment.
    if (scrollVelocity > 0.8) {
      scrollVelocity = 0;
      scheduleSettle(260);
      return;
    }
    scrollVelocity = 0;

    const target = findPanelSnapTarget(
      getTargetPositions(),
      scrollY,
      window.innerHeight || document.documentElement.clientHeight,
    );
    if (!target) return;

    isSnapping = true;
    window.clearTimeout(snapReleaseTimer);
    snapReleaseTimer = window.setTimeout(() => { isSnapping = false; }, 1000);
    const scrollOptions = {
      top: target.position,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
    };
    const scrollRoot = document.scrollingElement || document.documentElement;
    if (scrollRoot !== document.documentElement && typeof scrollRoot.scrollTo === "function") {
      scrollRoot.scrollTo(scrollOptions);
    } else {
      window.scrollTo(scrollOptions);
    }
  }

  function scheduleSettle(delay = 220) {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleScrollPosition, delay);
  }

  function onPageScroll(event) {
    const scrollRoot = document.scrollingElement || document.documentElement;
    if (
      event.target !== document &&
      event.target !== scrollRoot &&
      event.target !== document.documentElement &&
      event.target !== document.body
    ) return;
    const now = performance.now();
    const scrollY = readPageScrollY(window, document);
    const elapsed = Math.max(1, now - previousScrollAt);
    scrollVelocity = Math.abs(scrollY - previousScrollY) / elapsed;
    previousScrollY = scrollY;
    previousScrollAt = now;
    scheduleSettle();
  }

  // Capture sees both viewport/document scrolling and a body-root scroll on browsers
  // where body overflow rules create the effective page scroller.
  document.addEventListener("scroll", onPageScroll, { capture: true, passive: true });

  document.addEventListener("scrollend", (event) => {
    const scrollRoot = document.scrollingElement || document.documentElement;
    if (
      event.target !== document &&
      event.target !== scrollRoot &&
      event.target !== document.documentElement &&
      event.target !== document.body
    ) return;
    if (isSnapping) {
      isSnapping = false;
      window.clearTimeout(snapReleaseTimer);
      return;
    }
    scrollVelocity = 0;
    scheduleSettle(100);
  }, { capture: true, passive: true });
}
