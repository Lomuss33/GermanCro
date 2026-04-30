import { assert, getByPath, hasEmbeddedPlaceholder, hasSuspiciousEncoding, readJson, visitStrings } from "./shared-utils.js";

const requiredPaths = [
  "messages.actions.skip",
  "messages.actions.skipTitle",
  "messages.session.finalDetails",
  "messages.authoring.title",
  "messages.authoring.duplicate",
  "facts.tabs.world",
  "facts.fields.headquarters",
  "facts.fields.memberStates",
  "facts.fields.secretaryGeneral",
  "facts.fields.officialLanguages",
  "facts.featured.overview",
  "facts.featured.worldOverview",
  "facts.values.worldOverviewText",
];

const locales = await readJson("locales.json");

for (const locale of ["de", "hr", "en"]) {
  const bundle = locales[locale];
  assert(bundle && typeof bundle === "object", `Missing locale bundle: ${locale}`);
  for (const dottedPath of requiredPaths) {
    const value = getByPath(bundle, dottedPath);
    assert(value !== undefined && value !== null && value !== "", `Missing ${locale}.${dottedPath}`);
  }
  visitStrings(bundle, (value, path) => {
    assert(!hasSuspiciousEncoding(value), `Suspicious encoding in locales.${locale}.${path.join(".")}`);
    assert(!hasEmbeddedPlaceholder(value), `Embedded placeholder character in locales.${locale}.${path.join(".")}`);
  });
}

console.log("validate:locales passed");
