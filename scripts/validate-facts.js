import { assert, hasEmbeddedPlaceholder, hasSuspiciousEncoding, readJson, visitStrings } from "./shared-utils.js";

function validateGermanyFacts(data) {
  assert(data && typeof data === "object", "germany-facts.json must be an object");
  assert(data.country && typeof data.country === "object", "germany-facts.json.country is required");
  assert(Array.isArray(data.states), "germany-facts.json.states must be an array");
  assert(data.country.name, "germany-facts.json.country.name is required");
  data.states.forEach((state, index) => {
    assert(state && typeof state === "object", `germany-facts.json.states[${index}] must be an object`);
    assert(state.id, `germany-facts.json.states[${index}].id is required`);
    assert(state.name, `germany-facts.json.states[${index}].name is required`);
  });
  visitStrings(data, (value, path) => {
    assert(!hasSuspiciousEncoding(value), `Suspicious encoding in germany-facts.json at ${path.join(".")}`);
    assert(!hasEmbeddedPlaceholder(value), `Embedded placeholder character in germany-facts.json at ${path.join(".")}`);
  });
}

function validateUnionFacts(data, label) {
  assert(data && typeof data === "object", `${label} must be an object`);
  assert(data.union && typeof data.union === "object", `${label}.union is required`);
  assert(Array.isArray(data.countries), `${label}.countries must be an array`);
  assert(data.union.name, `${label}.union.name is required`);

  const countryIds = new Set();
  data.countries.forEach((country, index) => {
    assert(country && typeof country === "object", `${label}.countries[${index}] must be an object`);
    assert(country.id, `${label}.countries[${index}].id is required`);
    assert(country.name, `${label}.countries[${index}].name is required`);
    assert(!countryIds.has(country.id), `${label}.countries contains duplicate id ${country.id}`);
    countryIds.add(country.id);
  });
  visitStrings(data, (value, path) => {
    assert(!hasSuspiciousEncoding(value), `Suspicious encoding in ${label} at ${path.join(".")}`);
    assert(!hasEmbeddedPlaceholder(value), `Embedded placeholder character in ${label} at ${path.join(".")}`);
  });
}

validateGermanyFacts(await readJson("germany-facts.json"));
validateUnionFacts(await readJson("europe-facts.json"), "europe-facts.json");
validateUnionFacts(await readJson("world-facts.json"), "world-facts.json");

console.log("validate:facts passed");
