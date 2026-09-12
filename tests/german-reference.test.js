import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../scripts/shared-utils.js";
import { getGermanReferenceCards } from "../src/grammar/german-reference.js";

test("German reference covers A1–C2 with complete lessons and preserves existing conjugations", async () => {
  const locales = await readJson("locales.json");
  const original = locales.de.grammar.cards;
  const cards = getGermanReferenceCards(original);
  assert.equal(cards.length, original.length + 18);
  assert.equal(cards.filter(card => card.band === "A").length, 9);
  assert.equal(cards.filter(card => card.band === "B").length, 6);
  assert.equal(cards.filter(card => card.band === "C").length, 6);
  assert.ok(cards.some(card => card.level.startsWith("C2")));
  assert.equal(new Set(cards.map(c => c.id)).size, cards.length);
  cards.forEach(card => {
    assert.ok(card.description && card.tip && card.practice?.length === 2, card.id);
    assert.ok(card.rows.length >= 4);
    card.rows.forEach(row => {
      assert.equal(row.length, card.columns.length, card.id);
      row.forEach(cell => assert.ok(typeof cell === "string" && cell.trim()));
    });
  });
  original.forEach((card, i) => {
    if (card.id === "grammar_tenses_primary") {
      assert.deepEqual(cards[i].rows, card.rows.map(row => [0, 2, 4, 3, 5, 1].map(index => row[index])));
      assert.deepEqual(cards[i].columns.slice(1, 3), ["Präsens", "Perfekt"]);
    } else {
      assert.equal(cards[i].rows, card.rows);
      assert.equal(cards[i].columns, card.columns);
    }
    assert.equal(card.description, undefined, "Locale source must not be mutated");
  });
  assert.ok(cards.slice(3).every(c => c.collapsed));
  assert.match(cards.find(c => c.id === "german_prepositions").tip, /Bewegung allein bedeutet nicht Akkusativ/);
});
