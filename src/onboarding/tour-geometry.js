export function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function getUnionRect(rects) {
  const usableRects = Array.from(rects || []).filter((rect) => (
    rect &&
    [rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite) &&
    rect.right > rect.left &&
    rect.bottom > rect.top
  ));

  if (!usableRects.length) {
    return null;
  }

  const left = Math.min(...usableRects.map((rect) => rect.left));
  const top = Math.min(...usableRects.map((rect) => rect.top));
  const right = Math.max(...usableRects.map((rect) => rect.right));
  const bottom = Math.max(...usableRects.map((rect) => rect.bottom));

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function expandRect(rect, {
  padding = 8,
  edge = 8,
  viewportWidth,
  viewportHeight,
} = {}) {
  if (!rect || !Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight)) {
    return null;
  }

  const left = clamp(rect.left - padding, edge, viewportWidth - edge);
  const top = clamp(rect.top - padding, edge, viewportHeight - edge);
  const right = clamp(rect.right + padding, left, viewportWidth - edge);
  const bottom = clamp(rect.bottom + padding, top, viewportHeight - edge);

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function placeTourPanel({
  spotlight,
  panelWidth,
  panelHeight,
  viewportWidth,
  viewportHeight,
  edge = 12,
  gap = 16,
  isPhone = false,
} = {}) {
  if (!spotlight) {
    return null;
  }

  const safePanelWidth = Math.min(Math.max(0, panelWidth || 0), Math.max(0, viewportWidth - (edge * 2)));
  const safePanelHeight = Math.min(Math.max(0, panelHeight || 0), Math.max(0, viewportHeight - (edge * 2)));
  const centeredLeft = clamp(
    spotlight.left + ((spotlight.width - safePanelWidth) / 2),
    edge,
    viewportWidth - edge - safePanelWidth,
  );
  const topCandidate = spotlight.top - gap - safePanelHeight;
  const bottomCandidate = spotlight.bottom + gap;
  const topFits = topCandidate >= edge;
  const bottomFits = bottomCandidate + safePanelHeight <= viewportHeight - edge;

  if (isPhone) {
    const sheetLeft = clamp((viewportWidth - safePanelWidth) / 2, edge, viewportWidth - edge - safePanelWidth);
    const bottomSheetTop = viewportHeight - edge - safePanelHeight;
    const bottomSheetOverlaps = bottomSheetTop < spotlight.bottom + gap;

    if (!bottomSheetOverlaps) {
      return { left: sheetLeft, top: bottomSheetTop, placement: "bottom-sheet" };
    }

    if (topFits) {
      return { left: sheetLeft, top: edge, placement: "top-sheet" };
    }
  }

  if (bottomFits || (!topFits && (viewportHeight - spotlight.bottom) >= spotlight.top)) {
    return {
      left: centeredLeft,
      top: clamp(bottomCandidate, edge, viewportHeight - edge - safePanelHeight),
      placement: "below",
    };
  }

  return {
    left: centeredLeft,
    top: clamp(topCandidate, edge, viewportHeight - edge - safePanelHeight),
    placement: "above",
  };
}
