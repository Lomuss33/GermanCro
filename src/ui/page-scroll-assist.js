const MAIN_CARD_SNAP_FRACTION = 0.1;
const PANEL_SNAP_FRACTION = 0.2;

export function findPanelSnapTarget(targets, scrollY, viewportHeight) {
  const height = Math.max(1, viewportHeight || 1);
  return targets
    .filter((target) => target?.element && Number.isFinite(target.position))
    .map((target) => ({
      ...target,
      distance: Math.abs(target.position - scrollY),
      threshold: height * (target.isMainCard ? MAIN_CARD_SNAP_FRACTION : PANEL_SNAP_FRACTION),
    }))
    .filter((target) => target.distance >= 1 && target.distance <= target.threshold)
    .sort((left, right) => left.distance - right.distance)[0] || null;
}

export function initPageScrollAssist({ targets, shouldPause = () => false }) {
  let settleTimer = 0;
  let snapReleaseTimer = 0;
  let isSnapping = false;
  let previousScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let previousScrollAt = performance.now();
  let scrollVelocity = 0;

  function getTargetPositions() {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
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

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
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
    snapReleaseTimer = window.setTimeout(() => { isSnapping = false; }, 180);
    // An immediate correction avoids racing the browser's native momentum scroll.
    window.scrollTo({ top: target.position, behavior: "auto" });
  }

  function scheduleSettle(delay = 220) {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleScrollPosition, delay);
  }

  window.addEventListener("scroll", () => {
    const now = performance.now();
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const elapsed = Math.max(1, now - previousScrollAt);
    scrollVelocity = Math.abs(scrollY - previousScrollY) / elapsed;
    previousScrollY = scrollY;
    previousScrollAt = now;
    scheduleSettle();
  }, { passive: true });

  window.addEventListener("scrollend", () => {
    if (isSnapping) {
      isSnapping = false;
      window.clearTimeout(snapReleaseTimer);
      return;
    }
    scrollVelocity = 0;
    scheduleSettle(100);
  }, { passive: true });
}
