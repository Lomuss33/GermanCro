import { assert, hasEmbeddedPlaceholder, hasSuspiciousEncoding, readJson, visitStrings } from "./shared-utils.js";
import { COUNTRY_NOTABLE_PEOPLE } from "../src/facts/notable-people.js";

function validateGermanyFacts(data) {
  assert(data && typeof data === "object", "germany-facts.json must be an object");
  assert(data.country && typeof data.country === "object", "germany-facts.json.country is required");
  assert(Array.isArray(data.states), "germany-facts.json.states must be an array");
  assert(data.country.name, "germany-facts.json.country.name is required");
  const records = [data.country, ...data.states];
  data.states.forEach((state, index) => {
    assert(state && typeof state === "object", `germany-facts.json.states[${index}] must be an object`);
    assert(state.id, `germany-facts.json.states[${index}].id is required`);
    assert(state.name, `germany-facts.json.states[${index}].name is required`);
  });
  validateLocalizedOverviews(records, "germany-facts.json");
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
  validateLocalizedOverviews([data.union, ...data.countries], label);

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

function validateLocalizedOverviews(records, label) {
  records.forEach((record, index) => {
    if (!record || !record.overview) {
      return;
    }
    assert(record.overview_hr, `${label} overview_hr is required for record ${index}`);
    assert(record.overview_en, `${label} overview_en is required for record ${index}`);
  });
}

function validateCountryNotablePeople(countryIds) {
  const categories = ["science", "politics", "art", "engineering"];
  countryIds.forEach((countryId) => {
    const people = COUNTRY_NOTABLE_PEOPLE[countryId];
    assert(people && typeof people === "object", `Missing notable people for ${countryId}`);
    categories.forEach((category) => {
      assert(
        Array.isArray(people[category]) && people[category].length >= 2,
        `At least two ${category} people are required for ${countryId}`
      );
    });
  });
}

const germanyFacts = await readJson("germany-facts.json");
const europeFacts = await readJson("europe-facts.json");
const worldFacts = await readJson("world-facts.json");

validateGermanyFacts(germanyFacts);
validateUnionFacts(europeFacts, "europe-facts.json");
validateUnionFacts(worldFacts, "world-facts.json");
validateCountryNotablePeople(["germany", "europe", "world", ...europeFacts.countries.map((country) => country.id), ...worldFacts.countries.map((country) => country.id)]);

console.log("validate:facts passed");
