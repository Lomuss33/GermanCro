import test from "node:test";
import assert from "node:assert/strict";
import { createNumericalInsights, getPlaceContext, parseFactNumber } from "../src/facts/insights.js";

test("parses full, million, and billion population formats", () => {
  assert.equal(parseFactNumber("83.577.140 (2024)"), 83577140);
  assert.equal(parseFactNumber("ca. 41.0 Mio."), 41000000);
  assert.equal(parseFactNumber("ca. 1,43 Mrd."), 1430000000);
  assert.equal(parseFactNumber("357.592 km2"), 357592);
});

test("density and area comparisons use the displayed values", () => {
  const facts = createNumericalInsights("83.577.140 (2024)", "357.592 km2", "357.592 km2", "en");
  assert.equal(facts.length, 1);
  assert.match(facts[0].value, /234 people\/km²/);
  const state = createNumericalInsights("3.685.265 (2024)", "891 km2", "357.592 km2", "en");
  assert.equal(state.length, 2);
  assert.match(state[1].value, /Germany/);
});

test("context avoids assigning sovereign-country badges to subdivisions", () => {
  assert.deepEqual(getPlaceContext("state", "berlin", "de").map((badge) => badge.label), ["Bundesland · Deutschland"]);
  assert.deepEqual(getPlaceContext("country", "england", "en").map((badge) => badge.label), ["Constituent country · United Kingdom"]);
  assert.deepEqual(getPlaceContext("country", "irland", "en").map((badge) => badge.label), ["UN", "EU", "Euro area"]);
  assert.deepEqual(getPlaceContext("country", "bulgarien", "en").map((badge) => badge.label), ["UN", "EU", "Euro area", "Schengen", "NATO"]);
});
