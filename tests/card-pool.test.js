import test from "node:test";
import assert from "node:assert/strict";
import {
  filterCardsBySelection,
  filterRenderableCards,
  getPromptLanguagesForTarget,
  isCardRenderable,
} from "../src/game/card-pool.js";
import { createWeakCardTracker } from "../src/game/weak-cards.js";

const card = { de: "das Haus", en: "house", hr: "kuća", topic: "basics", subcategory: "Nomen", scope: "all" };

test("prompt languages keep their circular order and swap without mutating the language list", () => {
  assert.deepEqual(getPromptLanguagesForTarget("de"), ["en", "hr"]);
  assert.deepEqual(getPromptLanguagesForTarget("en"), ["hr", "de"]);
  assert.deepEqual(getPromptLanguagesForTarget("hr", true), ["en", "de"]);
  assert.deepEqual(getPromptLanguagesForTarget("hr"), ["de", "en"]);
});

test("a round card must have all three usable language values", () => {
  assert.equal(isCardRenderable(card, "de"), true);
  assert.equal(isCardRenderable({ ...card, hr: "  " }, "de"), false);
  assert.equal(isCardRenderable(null, "de"), false);
  assert.deepEqual(filterRenderableCards([card, { ...card, en: "" }, null], "hr"), [card]);
  assert.deepEqual(filterRenderableCards(null, "de"), []);
});

test("topic, word type and scope filters combine without changing card order", () => {
  const cards = [
    card,
    { ...card, de: "gehen", subcategory: "Verb", scope: "all" },
    { ...card, de: "Auto", topic: "vehicles", scope: "de" },
    { ...card, de: "car", topic: "vehicles", scope: "gb" },
  ];
  assert.deepEqual(filterCardsBySelection(cards, { scope: "de" }), cards.slice(0, 3));
  assert.deepEqual(filterCardsBySelection(cards, {
    topics: new Set(["vehicles"]),
    subcategories: new Set(["Nomen"]),
    scope: "de",
  }), [cards[2]]);
  assert.deepEqual(filterCardsBySelection(cards, { topics: new Set(), scope: "de" }), []);
  assert.deepEqual(filterCardsBySelection([null, card], { scope: "all" }), [card]);
});

test("weak-card tracker records mistakes, decays on mastery, and blends weak cards into sessions", () => {
  const memory = new Map();
  const storage = {
    getItem: (k) => memory.get(k) || null,
    setItem: (k, v) => memory.set(k, v),
  };
  const tracker = createWeakCardTracker({ storage });
  const c2 = { ...card, de: "der Baum", hr: "drvo", en: "tree" };
  const c3 = { ...card, de: "das Buch", hr: "knjiga", en: "book" };
  const c4 = { ...card, de: "die Sonne", hr: "sunce", en: "sun" };
  tracker.recordMistake(card, 2);
  tracker.recordMistake(c2, 1);
  assert.equal(tracker.getScore(card), 2);
  assert.deepEqual(tracker.filterWeakCards([c2, card]), [card, c2]);
  tracker.recordMastery(c2);
  assert.equal(tracker.getScore(c2), 0);
  assert.deepEqual(tracker.filterWeakCards([c2, card]), [card]);

  const selected = tracker.selectSessionCards([card, c2, c3, c4], 2);
  assert.equal(selected.length, 2);
  assert.equal(selected.includes(card), true);
  assert.equal(new Set(selected).size, 2);
});
