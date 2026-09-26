const PANEL_SNAP_FRACTION = 0.2;
const PANEL_SNAP_MAX_DISTANCE = 180;
const SCROLL_IDLE_DELAY = 420;

export function readPageScrollY(windowRef, documentRef) {
  const root = documentRef.scrollingElement;
  if (root && Number.isFinite(root.scrollTop)) return root.scrollTop;

  return Math.max(
    windowRef.scrollY || 0,
    documentRef.documentElement?.scrollTop || 0,
    documentRef.body?.scrollTop || 0,
  );
}

export function findPanelSnapTarget(targets, scrollY, viewportHeight, direction = 0) {
  const height = Math.max(1, viewportHeight || 1);
  const threshold = Math.min(PANEL_SNAP_MAX_DISTANCE, height * PANEL_SNAP_FRACTION);
  return targets
    .filter((target) => target?.element && Number.isFinite(target.position))
    .map((target) => ({
      ...target,
      distance: Math.abs(target.position - scrollY),
      threshold,
      offset: target.position - scrollY,
    }))
    .filter((target) => (
      target.distance >= 1 &&
      target.distance <= target.threshold &&
      (direction === 0 || Math.sign(target.offset) === direction)
    ))
    .sort((left, right) => left.distance - right.distance)[0] || null;
}

export function initPageScrollAssist({ targets, shouldPause = () => false }) {
  let settleTimer = 0;
  let snapReleaseTimer = 0;
  let isSnapping = false;
  let previousScrollY = readPageScrollY(window, document);
  let lastScrollDirection = 0;

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
    const target = findPanelSnapTarget(
      getTargetPositions(),
      scrollY,
      window.innerHeight || document.documentElement.clientHeight,
      lastScrollDirection,
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

  function scheduleSettle(delay = SCROLL_IDLE_DELAY) {
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
    const scrollY = readPageScrollY(window, document);
    if (isSnapping) {
      previousScrollY = scrollY;
      return;
    }
    const movement = scrollY - previousScrollY;
    if (movement !== 0) lastScrollDirection = Math.sign(movement);
    previousScrollY = scrollY;
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
    scheduleSettle(140);
  }, { capture: true, passive: true });
}
