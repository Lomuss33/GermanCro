import test from "node:test";
import assert from "node:assert/strict";
import {
  filterCardsBySelection,
  filterRenderableCards,
  getPromptLanguagesForTarget,
  isCardRenderable,
} from "../src/game/card-pool.js";

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
