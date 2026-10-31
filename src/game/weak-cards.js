import { cardKey } from "../../shared/card-schema.js";
import { shuffle } from "../core/random.js";

const WEAK_CARDS_STORAGE_KEY = "germancro.weakCards.v1";
const MAX_TRACKED_WEAK_CARDS = 256;

export function createWeakCardTracker({ storage = globalThis.localStorage } = {}) {
  const counts = new Map();

  function load() {
    counts.clear();
    if (!storage || typeof storage.getItem !== "function") {
      return;
    }
    try {
      const raw = storage.getItem(WEAK_CARDS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      for (const [key, value] of Object.entries(parsed)) {
        const score = Number(value);
        if (key && Number.isFinite(score) && score > 0) {
          counts.set(key, Math.min(10, Math.floor(score)));
        }
      }
    } catch {
      // Ignore storage access errors.
    }
  }

  function persist() {
    if (!storage || typeof storage.setItem !== "function") {
      return;
    }
    try {
      const entries = [...counts.entries()].slice(-MAX_TRACKED_WEAK_CARDS);
      storage.setItem(WEAK_CARDS_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch {
      // Ignore storage quota errors.
    }
  }

  function recordMistake(card, weight = 2) {
    const key = cardKey(card);
    if (!key) return 0;
    const next = Math.min(10, (counts.get(key) || 0) + Math.max(1, Math.floor(weight)));
    counts.delete(key);
    counts.set(key, next);
    if (counts.size > MAX_TRACKED_WEAK_CARDS) {
      counts.delete(counts.keys().next().value);
    }
    persist();
    return next;
  }

  function recordMastery(card) {
    const key = cardKey(card);
    if (!key || !counts.has(key)) return 0;
    const next = (counts.get(key) || 0) - 1;
    if (next <= 0) {
      counts.delete(key);
    } else {
      counts.set(key, next);
    }
    persist();
    return Math.max(0, next);
  }

  function getScore(card) {
    const key = cardKey(card);
    return key ? (counts.get(key) || 0) : 0;
  }

  function filterWeakCards(cards) {
    if (!Array.isArray(cards) || !counts.size) {
      return [];
    }
    return cards
      .filter((card) => getScore(card) > 0)
      .sort((a, b) => getScore(b) - getScore(a));
  }

  function selectSessionCards(cards, count) {
    if (!Array.isArray(cards) || !cards.length) {
      return [];
    }
    const targetCount = Math.min(Math.max(1, Math.floor(count || cards.length)), cards.length);
    if (!counts.size) {
      return shuffle(cards).slice(0, targetCount);
    }
    const weakPool = filterWeakCards(cards);
    if (!weakPool.length) {
      return shuffle(cards).slice(0, targetCount);
    }
    const maxWeakSlots = Math.max(1, Math.floor(targetCount * 0.35));
    const chosenWeak = weakPool.slice(0, maxWeakSlots);
    const chosenSet = new Set(chosenWeak);
    const remainingPool = shuffle(cards.filter((card) => !chosenSet.has(card)));
    return shuffle([...chosenWeak, ...remainingPool.slice(0, targetCount - chosenWeak.length)]);
  }

  load();

  return {
    get size() {
      return counts.size;
    },
    recordMistake,
    recordMastery,
    getScore,
    filterWeakCards,
    selectSessionCards,
  };
}
