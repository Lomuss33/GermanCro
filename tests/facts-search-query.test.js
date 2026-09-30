import assert from "node:assert/strict";
import test from "node:test";
import { factFieldSearchQuery, factListSearchQuery } from "../src/facts/search-query.js";

test("fact-card searches ask about the place and field without supplying the answer", () => {
  assert.equal(factFieldSearchQuery("Frankreich", "Amtssprachen"), "Frankreich Amtssprachen");
  assert.equal(factFieldSearchQuery("Deutschland", "Größte Stadt"), "Deutschland Größte Stadt");
  assert.equal(factFieldSearchQuery("Indien", "Zeitzone"), "Indien Zeitzone");
  assert.equal(factFieldSearchQuery("Bayern", "Hauptstadt"), "Bayern Hauptstadt");
  assert.equal(factFieldSearchQuery("Frankreich", "Größe im Vergleich", "Deutschland"), "Frankreich Größe im Vergleich Deutschland");
  assert.equal(factFieldSearchQuery("France", "Official languages"), "France Official languages");
  assert.equal(factFieldSearchQuery("Hrvatska", "Vremenska zona"), "Hrvatska Vremenska zona");
  assert.equal(factFieldSearchQuery("EU", "EU-Mitgliedstaaten"), "EU-Mitgliedstaaten");
  assert.equal(factFieldSearchQuery("UN", "UN member states"), "UN member states");
});

test("list-chip searches keep the clicked subject and its relationship to the place", () => {
  assert.equal(factListSearchQuery("Deutschland", "Nachbarländer", "Frankreich"), "Deutschland Nachbarländer Frankreich");
  assert.equal(factListSearchQuery("Bayern", "Natur", "Alpen"), "Bayern Natur Alpen");
  assert.equal(factListSearchQuery("  Kroatien ", " Kunst ", " Nikola Tesla "), "Kroatien Kunst Nikola Tesla");
});
