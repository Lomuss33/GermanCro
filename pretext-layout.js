import { layoutWithLines, prepareWithSegments } from "./vendor/pretext/dist/layout.js";

const preparedCache = new Map();
const reduceMotionQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function prefersReducedMotion() {
  return Boolean(reduceMotionQuery?.matches);
}

function getPrepared(text, font, whiteSpace = "normal") {
  const key = `${whiteSpace}\n${font}\n${text}`;
  if (!preparedCache.has(key)) {
    preparedCache.set(key, prepareWithSegments(text, font, { whiteSpace }));
  }
  return preparedCache.get(key);
}

function buildFontShorthand({ fontStyle = "normal", fontWeight = 400, fontPx, fontFamily }) {
  return `${fontStyle} ${fontWeight} ${fontPx}px ${fontFamily}`;
}

function getLineHeight(fontPx, lineHeightRatio) {
  return Math.max(1, Math.round(fontPx * lineHeightRatio * 100) / 100);
}

function evaluateCandidate(config, text, width, fontPx) {
  const targetWidth = Math.max(1, width * (config.targetWidthRatio ?? 1));
  const font = buildFontShorthand({
    fontStyle: config.fontStyle,
    fontWeight: config.fontWeight,
    fontPx,
    fontFamily: config.fontFamily,
  });
  const lineHeight = getLineHeight(fontPx, config.lineHeightRatio);
  const prepared = getPrepared(text, font, config.whiteSpace);
  const layout = layoutWithLines(prepared, targetWidth, lineHeight);
  const widestLineWidth = layout.lines.reduce(
    (maxWidth, line) => Math.max(maxWidth, line.width),
    0
  );

  return {
    font,
    fontPx,
    lineHeight,
    targetWidth,
    height: layout.height,
    lineCount: layout.lineCount,
    lines: layout.lines,
    text,
    widestLineWidth,
  };
}

function isBetterCandidate(candidate, currentBest) {
  if (!currentBest) {
    return true;
  }
  if (candidate.fontPx !== currentBest.fontPx) {
    return candidate.fontPx > currentBest.fontPx;
  }
  return candidate.widestLineWidth > currentBest.widestLineWidth;
}

export function fitPretextBlock(config) {
  const {
    text = "",
    width = 0,
    minFontPx = 16,
    maxFontPx = minFontPx,
    maxLines = Number.POSITIVE_INFINITY,
  } = config;

  if (!String(text).trim() || width <= 0) {
    return {
      font: buildFontShorthand({
        fontStyle: config.fontStyle,
        fontWeight: config.fontWeight,
        fontPx: minFontPx,
        fontFamily: config.fontFamily,
      }),
      fontPx: minFontPx,
      lineHeight: getLineHeight(minFontPx, config.lineHeightRatio),
      targetWidth: Math.max(1, width * (config.targetWidthRatio ?? 1)),
      height: 0,
      lineCount: 0,
      lines: [],
      text: String(text ?? ""),
      widestLineWidth: 0,
    };
  }

  let low = Math.min(minFontPx, maxFontPx);
  let high = Math.max(minFontPx, maxFontPx);
  let best = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = evaluateCandidate(config, String(text), width, mid);

    if (candidate.lineCount <= maxLines) {
      if (isBetterCandidate(candidate, best)) {
        best = candidate;
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best || evaluateCandidate(config, String(text), width, minFontPx);
}

export function renderPretextLines({
  element,
  fit,
  animate = false,
  lineClassName = "",
  blockClassName = "",
  renderLineContent = null,
}) {
  if (!element) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const shouldAnimate = animate && !prefersReducedMotion();
  let globalCharIndex = 0;

  element.replaceChildren();
  element.classList.add("pretext-block");
  if (blockClassName) {
    element.classList.add(blockClassName);
  }
  element.style.setProperty("--pretext-font-size", `${fit.fontPx}px`);
  element.style.setProperty("--pretext-line-height", `${fit.lineHeight}px`);
  element.style.setProperty("--pretext-block-height", `${fit.height}px`);
  if (fit.height > 0) {
    element.style.minHeight = `${fit.height}px`;
  } else {
    element.style.removeProperty("min-height");
  }

  fit.lines.forEach((line, index) => {
    const lineEl = document.createElement("span");
    lineEl.className = `pretext-line ${lineClassName}`.trim();
    if (shouldAnimate) {
      lineEl.classList.add("is-revealing");
      lineEl.style.animationDelay = `${index * 48}ms`;
    }

    if (typeof renderLineContent === "function") {
      const rendered = renderLineContent({
        line,
        lineIndex: index,
        lineElement: lineEl,
        startCharIndex: globalCharIndex,
      });
      if (rendered instanceof Node) {
        lineEl.appendChild(rendered);
      } else if (Array.isArray(rendered)) {
        rendered.forEach((node) => {
          if (node instanceof Node) {
            lineEl.appendChild(node);
          }
        });
      } else if (!lineEl.childNodes.length) {
        lineEl.textContent = line.text;
      }
    } else {
      lineEl.textContent = line.text;
    }

    globalCharIndex += Array.from(line.text).length;
    fragment.appendChild(lineEl);
  });

  if (!fit.lines.length && fit.text) {
    const fallback = document.createElement("span");
    fallback.className = `pretext-line ${lineClassName}`.trim();
    fallback.textContent = fit.text;
    fragment.appendChild(fallback);
  }

  element.appendChild(fragment);
}

export function createPretextBlockController(config) {
  const { element } = config;
  if (!element) {
    return null;
  }

  const state = {
    text: "",
    lastWidth: 0,
    fit: null,
  };

  function getWidth() {
    return Math.max(0, element.clientWidth || 0);
  }

  function clearBlock() {
    state.fit = null;
    element.replaceChildren();
    element.style.removeProperty("--pretext-block-height");
    element.style.removeProperty("--pretext-font-size");
    element.style.removeProperty("--pretext-line-height");
    element.style.removeProperty("min-height");
  }

  function applyLayout(animate = false) {
    if (!state.text) {
      clearBlock();
      return;
    }

    const width = getWidth();
    if (width <= 0) {
      return;
    }

    state.lastWidth = width;
    state.fit = fitPretextBlock({
      ...config,
      text: state.text,
      width,
    });

    renderPretextLines({
      element,
      fit: state.fit,
      animate,
      lineClassName: config.lineClassName,
      blockClassName: config.blockClassName,
      renderLineContent: config.renderLineContent,
    });
  }

  const resizeObserver =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(() => {
          const width = getWidth();
          if (width <= 0 || Math.abs(width - state.lastWidth) < 0.5) {
            return;
          }
          applyLayout(false);
        })
      : null;

  resizeObserver?.observe(element);

  return {
    setText(nextText, options = {}) {
      const text = String(nextText ?? "");
      const animate = Boolean(options.animate) && text !== state.text;
      state.text = text;
      applyLayout(animate);
    },
    relayout(options = {}) {
      applyLayout(Boolean(options.animate));
    },
    destroy() {
      resizeObserver?.disconnect();
      clearBlock();
    },
    getFit() {
      return state.fit;
    },
  };
}
