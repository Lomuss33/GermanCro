export const STANDARD_WORD_LENGTH = 5;

const wpmFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

let graphemeSegmenter = null;

function getGraphemeSegmenter() {
  if (graphemeSegmenter !== null) {
    return graphemeSegmenter;
  }

  graphemeSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : false;
  return graphemeSegmenter;
}

export function countTypingUnits(value) {
  const text = String(value ?? "");
  if (!text) {
    return 0;
  }

  const segmenter = getGraphemeSegmenter();
  if (!segmenter) {
    return Array.from(text).length;
  }

  let count = 0;
  for (const _segment of segmenter.segment(text)) {
    count += 1;
  }
  return count;
}

export function getInsertedText(previousValue, nextValue) {
  const previous = String(previousValue ?? "");
  const next = String(nextValue ?? "");
  if (!next || previous === next) {
    return "";
  }

  let prefixLength = 0;
  const maxPrefixLength = Math.min(previous.length, next.length);
  while (
    prefixLength < maxPrefixLength &&
    previous[prefixLength] === next[prefixLength]
  ) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  const previousRemaining = previous.length - prefixLength;
  const nextRemaining = next.length - prefixLength;
  while (
    suffixLength < previousRemaining &&
    suffixLength < nextRemaining &&
    previous[previous.length - 1 - suffixLength] === next[next.length - 1 - suffixLength]
  ) {
    suffixLength += 1;
  }

  return next.slice(prefixLength, next.length - suffixLength);
}

export function countInsertedTypingUnits(previousValue, nextValue) {
  return countTypingUnits(getInsertedText(previousValue, nextValue));
}

export function calculateWpmMetrics({
  typedUnits = 0,
  acceptedUnits = 0,
  elapsedMs = 0,
  benchmarkWpm = 80,
} = {}) {
  const activeMs = Math.max(0, Number(elapsedMs) || 0);
  const activeMinutes = activeMs / 60000;
  const safeTypedUnits = Math.max(0, Number(typedUnits) || 0);
  const safeAcceptedUnits = Math.max(0, Number(acceptedUnits) || 0);
  const grossWpm = activeMinutes > 0 && safeTypedUnits > 0
    ? (safeTypedUnits / STANDARD_WORD_LENGTH) / activeMinutes
    : null;
  const acceptedWpm = activeMinutes > 0 && safeAcceptedUnits > 0
    ? (safeAcceptedUnits / STANDARD_WORD_LENGTH) / activeMinutes
    : null;
  const displayedWpm = grossWpm ?? acceptedWpm;
  const precision = safeTypedUnits > 0
    ? Math.min(1, safeAcceptedUnits / Math.max(safeTypedUnits, safeAcceptedUnits))
    : null;

  return {
    activeMs,
    activeMinutes,
    typedUnits: safeTypedUnits,
    acceptedUnits: safeAcceptedUnits,
    grossWpm,
    acceptedWpm,
    displayedWpm,
    precision,
    level: displayedWpm === null ? 0 : Math.max(0, Math.min(1, displayedWpm / benchmarkWpm)),
  };
}

export function formatWpm(value) {
  return value === null || !Number.isFinite(value) ? "\u2014" : wpmFormatter.format(value);
}
