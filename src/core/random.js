export function getSecureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    return 0;
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    return 0;
  }

  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const values = new Uint32Array(1);

  do {
    cryptoApi.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % maxExclusive;
}

export function getSecureRandomRange(minInclusive, maxInclusive) {
  if (!Number.isFinite(minInclusive) || !Number.isFinite(maxInclusive)) {
    return minInclusive;
  }

  const min = Math.ceil(Math.min(minInclusive, maxInclusive));
  const max = Math.floor(Math.max(minInclusive, maxInclusive));
  return min + getSecureRandomInt((max - min) + 1);
}

export function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
