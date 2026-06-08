export const SUBCATEGORY_ALIASES = {
  Praeposition: "Präposition",
  "PrÃ¤position": "Präposition",
  "PrÃƒÂ¤position": "Präposition",
  "PrÃƒÆ’Ã‚Â¤position": "Präposition",
  "PrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤position": "Präposition",
};

export const TOPIC_CONFIG = {
  basics: { color: "#60a5fa" },
  vehicles: { color: "#fb923c" },
  nature: { color: "#4ade80" },
  food: { color: "#f87171" },
  travel: { color: "#facc15" },
  work: { color: "#818cf8" },
  health: { color: "#22d3ee" },
  people: { color: "#f472b6" },
  shopping: { color: "#34d399" },
  developertech: { color: "#0284c7" },
  itnetwork: { color: "#65a30d" },
};

export const TOPIC_OPTIONS = Object.keys(TOPIC_CONFIG);
export const SUBCATEGORY_OPTIONS = [
  "Nomen",
  "Verb",
  "Adjektiv",
  "Adverb",
  "Präposition",
  "Konjunktion",
  "Ausdruck",
  "Satz",
];
export const CARD_SCOPE_OPTIONS = ["all", "de", "hr", "gb"];
export const MODE_SCOPE_MAP = {
  de: "de",
  hr: "hr",
  en: "gb",
};

export function normalizeTopic(topic) {
  return String(topic || "").trim().toLowerCase();
}

export function normalizeSubcategory(subcategory) {
  return SUBCATEGORY_ALIASES[subcategory] || subcategory;
}

export function normalizeScope(scope) {
  const normalized = String(scope || "").trim().toLowerCase();
  if (!normalized || normalized === "shared" || normalized === "universal") {
    return "all";
  }
  if (normalized === "en") {
    return "gb";
  }
  return normalized;
}

export function normalizeField(value) {
  const raw = String(value || "");
  let normalized = "";
  let sawSpace = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const isSpace = char <= " ";

    if (isSpace) {
      sawSpace = normalized.length > 0;
      continue;
    }

    if (sawSpace) {
      normalized += " ";
      sawSpace = false;
    }

    normalized += char;
  }

  return normalized;
}

export function normalizeAnswer(value) {
  const normalized = normalizeField(value);
  let end = normalized.length;

  while (end > 0) {
    const char = normalized[end - 1];
    if (char !== "." && char !== "," && char !== "!" && char !== "?" && char !== ":" && char !== ";") {
      break;
    }
    end -= 1;
  }

  return normalized.slice(0, end).toLowerCase();
}

export function cardKey(card) {
  return [
    normalizeAnswer(card.de),
    normalizeAnswer(card.hr),
    normalizeTopic(card.topic),
    normalizeSubcategory(card.subcategory),
    normalizeScope(card.scope),
  ].join("::");
}

export function sanitizeCard(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const card = {
    de: normalizeField(raw.de),
    hr: normalizeField(raw.hr),
    en: normalizeField(raw.en),
    topic: normalizeTopic(normalizeField(raw.topic)),
    subcategory: normalizeSubcategory(normalizeField(raw.subcategory || raw.cat)),
    scope: normalizeScope(normalizeField(raw.scope || "all")),
  };

  if (
    !card.de ||
    !card.hr ||
    !card.en ||
    !TOPIC_OPTIONS.includes(card.topic) ||
    !SUBCATEGORY_OPTIONS.includes(card.subcategory) ||
    !CARD_SCOPE_OPTIONS.includes(card.scope)
  ) {
    return null;
  }

  return card;
}

export function mergeCards(...groups) {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((item) => {
    const card = sanitizeCard(item);
    if (!card) {
      return;
    }

    const key = cardKey(card);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(card);
  });

  return merged;
}
