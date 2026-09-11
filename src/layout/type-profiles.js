export function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundScale(value) {
  return Math.round(value * 1000) / 1000;
}

export function getScaledFontPx(fontPx, scale) {
  return Math.max(1, Math.round(Number(fontPx || 0) * Number(scale || 1)));
}

export function computeResponsiveTypeProfile({ viewportWidth, viewportHeight, heroWidth, cardWidth }) {
  const contentWidth = clampNumber(
    Math.max(0, Math.round(cardWidth || heroWidth || viewportWidth || 0)),
    390,
    780
  );
  const heightScale = clampNumber(viewportHeight / 852, 0.82, 1.35);
  const widthScale = clampNumber(viewportWidth / 780, 0.82, 1.35);
  const typeScale = Math.min(heightScale, widthScale);
  const bodyScale = typeScale;
  const microScale = typeScale;
  const displayScale = typeScale;
  const controlScale = typeScale;
  const iconScale = typeScale;
  const gameTextScale = typeScale * 1.3;

  return {
    contentWidth,
    heightScale: roundScale(typeScale),
    bodyScale: roundScale(bodyScale),
    microScale: roundScale(microScale),
    displayScale: roundScale(displayScale),
    controlScale: roundScale(controlScale),
    iconScale: roundScale(iconScale),
    gameTextScale: roundScale(gameTextScale),
  };
}

export function hasResponsiveTypeProfileChanged(currentProfile, nextProfile) {
  if (!currentProfile) {
    return true;
  }

  return Object.keys(DEFAULT_TYPE_PROFILE).some((key) => {
    const currentValue = Number(currentProfile[key] ?? 0);
    const nextValue = Number(nextProfile[key] ?? 0);
    return Math.abs(currentValue - nextValue) > 0.001;
  });
}

export const DEFAULT_TYPE_PROFILE = Object.freeze({
  contentWidth: 390,
  heightScale: 1,
  bodyScale: 1,
  microScale: 1,
  displayScale: 1,
  controlScale: 1,
  iconScale: 1,
  gameTextScale: 1.3,
});

export const GAME_DENSITY_ORDER = ["regular", "compact", "dense"];

export function clampGameDensity(density) {
  return GAME_DENSITY_ORDER.includes(density) ? density : "regular";
}

export function getNextDenserDensity(density) {
  const currentIndex = GAME_DENSITY_ORDER.indexOf(clampGameDensity(density));
  if (currentIndex === -1 || currentIndex >= GAME_DENSITY_ORDER.length - 1) {
    return GAME_DENSITY_ORDER[GAME_DENSITY_ORDER.length - 1];
  }
  return GAME_DENSITY_ORDER[currentIndex + 1];
}

export function getGameDensityProfile({ viewportWidth, viewportHeight, cardWidth }) {
  const resolvedWidth = Math.max(0, Math.round(cardWidth || 0)) || Math.max(0, Math.round(viewportWidth || 0));
  const aspectRatio = viewportWidth > 0 ? viewportHeight / viewportWidth : 0;

  if (resolvedWidth <= 400 || aspectRatio >= 1.9) {
    return "dense";
  }

  if (
    (resolvedWidth >= 401 && resolvedWidth <= 560) ||
    (aspectRatio >= 1.6 && aspectRatio < 1.9)
  ) {
    return "compact";
  }

  return "regular";
}

export function getNextAnswerGuideSizingTier(tier) {
  if (tier === "regular") {
    return "compact";
  }
  if (tier === "compact") {
    return "dense";
  }
  if (tier === "dense") {
    return "dense-minus";
  }
  return "dense-minus";
}

export function getAnswerGuideLengthBucket(length) {
  if (length <= 24) {
    return 0;
  }
  if (length <= 48) {
    return 1;
  }
  if (length <= 72) {
    return 2;
  }
  if (length <= 96) {
    return 3;
  }
  return 4;
}

export const PROMPT_FIT_PROFILES = {
  main: {
    regular: { maxLines: 3, minFontPx: 8, maxFontPx: 28, lineHeightRatio: 1.1 },
    compact: { maxLines: 4, minFontPx: 8, maxFontPx: 26, lineHeightRatio: 1.12 },
    dense: { maxLines: 6, minFontPx: 7, maxFontPx: 26, lineHeightRatio: 1.14 },
  },
  secondary: {
    regular: { maxLines: 3, minFontPx: 8, maxFontPx: 22, lineHeightRatio: 1.16 },
    compact: { maxLines: 4, minFontPx: 7, maxFontPx: 21, lineHeightRatio: 1.18 },
    dense: { maxLines: 6, minFontPx: 7, maxFontPx: 20, lineHeightRatio: 1.2 },
  },
};

export const ANSWER_GUIDE_SIZE_PROFILES = {
  regular: {
    textScale: 1,
    metaScale: 1,
    tokenGap: 8,
    charGap: 3,
    separatorMinWidth: 28,
    spaceSeparatorGap: 6,
  },
  compact: {
    textScale: 0.92,
    metaScale: 0.96,
    tokenGap: 6,
    charGap: 2,
    separatorMinWidth: 22,
    spaceSeparatorGap: 5,
  },
  dense: {
    textScale: 0.84,
    metaScale: 0.92,
    tokenGap: 4,
    charGap: 2,
    separatorMinWidth: 18,
    spaceSeparatorGap: 4,
  },
  "dense-minus": {
    textScale: 0.78,
    metaScale: 0.9,
    tokenGap: 3,
    charGap: 1,
    separatorMinWidth: 16,
    spaceSeparatorGap: 3,
  },
};

export const ANSWER_GUIDE_HEIGHT_BUDGETS = {
  regular: 120,
  compact: 140,
  dense: 160,
};
